import Dexie, { type EntityTable } from 'dexie'

type Command = { id: string; url: string; body: string; status: 'pending' | 'needs_review'; createdAt: string }

export class OfflineQueue extends Dexie {
  commands!: EntityTable<Command, 'id'>
  constructor(identityId: string, organizationId: string) { super(`klinik-nurse-${identityId}-${organizationId}-v1`); this.version(1).stores({ commands: '&id,status,createdAt' }) }
  async add(id: string, url: string, body: string) { await this.commands.put({ id, url, body, status: 'pending', createdAt: new Date().toISOString() }) }
  async flush(send: (command: Command) => Promise<Response>) { for (const command of await this.commands.where('status').equals('pending').sortBy('createdAt')) { try { const response = await send(command); if (response.ok) await this.commands.delete(command.id); else if ([401, 403, 409].includes(response.status)) await this.commands.update(command.id, { status: 'needs_review' }) } catch { /* retain for reconnect */ } } }
}
