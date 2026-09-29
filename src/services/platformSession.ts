import { isDevMode } from '@angular/core';
import { OfflineQueue } from './offlineQueue';
type Membership = { organization_id: string; role: string; wardIds: string[] };
type Me = { identity: { id: string }; csrfToken: string; selectedOrganizationId: string | null; memberships: Membership[] };
export class QueuedCommandError extends Error {}
/** Guard so a stale cross-module session cookie triggers at most one dev auto-login retry, never a loop. */
const DEV_SWITCH_GUARD = 'klinik-dev-role-switch';

class PlatformSession {
  private csrfToken = '';
  private organizationId = '';
  private identityId = '';
  private wardId = '';
  private ready = false;
  private queue: OfflineQueue | undefined;
  async bootstrap(): Promise<void> {
    if (this.ready) return;
    const response = await fetch('/me', { credentials: 'include', cache: 'no-store' });
    if (response.status === 401) { location.assign('/auth/login?returnTo=/nurse/'); return; }
    if (!response.ok) throw new Error('Could not load your clinical session. Refresh and retry.');
    const me = await response.json() as Me;
    const membership = me.memberships.find(item => item.organization_id === me.selectedOrganizationId && ['nurse', 'admin'].includes(item.role)) ?? me.memberships.find(item => ['nurse', 'admin'].includes(item.role));
    if (!membership) {
      if (isDevMode() && !sessionStorage.getItem(DEV_SWITCH_GUARD)) {
        sessionStorage.setItem(DEV_SWITCH_GUARD, '1');
        location.assign('/auth/login?returnTo=/nurse/');
        return;
      }
      throw new Error('This account needs Nurse access. Open Nurse session to select your local role.');
    }
    sessionStorage.removeItem(DEV_SWITCH_GUARD);
    if (!membership.wardIds[0]) throw new Error('Your account has no ward assignment.');
    if (me.selectedOrganizationId !== membership.organization_id) {
      const selection = await fetch('/auth/selection', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': me.csrfToken }, body: JSON.stringify({ organizationId: membership.organization_id }) });
      if (!selection.ok) throw new Error('Could not select your Nurse organization.');
      me.selectedOrganizationId = membership.organization_id;
      me.csrfToken = (await selection.json() as { csrfToken: string }).csrfToken;
    }
    this.csrfToken = me.csrfToken; this.identityId = me.identity.id;
    this.organizationId = membership.organization_id; this.wardId = membership.wardIds[0];
    this.queue = new OfflineQueue(me.identity.id, this.organizationId); this.ready = true;
    addEventListener('online', () => void this.flush());
    await this.flush();
  }
  context() {
    if (!this.ready) throw new Error('Clinical session is still loading.');
    return { organizationId: this.organizationId, wardId: this.wardId, identityId: this.identityId };
  }
  async request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try { response = await this.send(path, init); } catch (error) {
      const body = typeof init?.body === 'string' ? init.body : '';
      const id = body ? (JSON.parse(body) as { commandId?: string }).commandId : undefined;
      if (!(error instanceof TypeError) || !this.queue || !id) throw error;
      await this.queue.add(id, path, body);
      dispatchEvent(new Event('klinik-queue-changed'));
      throw new QueuedCommandError('Saved on this device; waiting for sync. The server has not confirmed this action.');
    }
    if (!response.ok) {
      const data = await response.json().catch(() => null) as { message?: string; code?: string } | null;
      throw new Error(data?.message ?? data?.code ?? 'Clinical request failed (' + response.status + '). Refresh and review.');
    }
    return response.json() as Promise<T>;
  }
  private send(path: string, init?: RequestInit) { return fetch(path, { credentials: 'include', cache: 'no-store', ...init, headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': this.csrfToken, ...init?.headers } }); }
  private async flush() {
    // CLINICAL: Never replay another identity's saved commands after a module role switch.
    try {
      const response = await fetch('/me', { credentials: 'include', cache: 'no-store' });
      if (!response.ok) return;
      const me = await response.json() as Me;
      if (me.identity.id !== this.identityId || me.selectedOrganizationId !== this.organizationId) return;
      this.csrfToken = me.csrfToken;
      await this.queue?.flush(command => this.send(command.url, { method: 'POST', body: command.body }));
      dispatchEvent(new Event('klinik-queue-changed'));
    } catch { /* retain pending commands until the matching session can reconnect */ }
  }
  async queueCounts() {
    return { pending: await this.queue?.commands.where('status').equals('pending').count() ?? 0, needsReview: await this.queue?.commands.where('status').equals('needs_review').count() ?? 0 };
  }
}
export const platformSession = new PlatformSession();
