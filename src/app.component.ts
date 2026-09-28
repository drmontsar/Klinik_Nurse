import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { patientRepository, nurseTaskRepository, vitalsRepository } from './repositories';
import { platformSession, QueuedCommandError } from './services/platformSession';
import { MOCK_MODE, CLINICIAN_CONTEXT, STORAGE_KEYS } from './constants/config';
import { calculateNEWS2 } from './utils/calculateNEWS2';
import type { Patient } from './types/Patient';
import type { NurseTask } from './types/NurseTask';
import type { Vitals, VitalsDraft } from './types/Vitals';

type Sheet = { id: string; name: string; status: string; floor: string };
type HandoverItem = { id: string; bed: string; severity: string; diagnosis_summary: string; task_summary: string; version: number };
type Handover = Sheet & { items: HandoverItem[] };

@Component({ selector: 'app-root', imports: [FormsModule], templateUrl: './app.component.html' })
export class AppComponent implements OnInit, OnDestroy {
  readonly demo = MOCK_MODE;
  readonly ready = signal(false);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly online = signal(navigator.onLine);
  readonly error = signal('');
  readonly notice = signal('');
  readonly patients = signal<Patient[]>([]);
  readonly tasks = signal<NurseTask[]>([]);
  readonly selectedPatientId = signal('');
  readonly selectedTaskId = signal('');
  readonly tab = signal('queue');
  readonly search = signal('');
  readonly status = signal('open');
  readonly category = signal('all');
  readonly latestVitals = signal<Record<string, Vitals | null>>({});
  readonly sheets = signal<Sheet[]>([]);
  readonly handover = signal<Handover | null>(null);
  readonly queued = signal(0);
  readonly review = signal(0);
  /** NEWS2 preview badge derived from the currently entered vitals draft. Never shows 0 for incomplete sets. */
  readonly news2Preview = computed(() => {
    const a = this.assessment;
    if (a.score === null) return null;
    const token = a.risk === 'high' ? 'danger' : a.risk === 'medium' ? 'warning' : a.risk === 'low-medium' ? 'caution' : 'success';
    return { score: a.score, risk: a.risk ?? 'unknown', token, label: `NEWS2 ${a.score} (${a.risk ?? 'incomplete'}) — as entered` };
  });

  /** Open task counts per category for tab badges. */
  readonly taskCounts = computed(() => {
    const open = this.tasks().filter(t => ['pending', 'in-progress'].includes(t.status));
    return { all: open.length, vitals: open.filter(t => t.category === 'vitals').length, medication: open.filter(t => t.category === 'medication').length };
  });

  /** Session display text — role context from real session, clinician name in demo. */
  readonly sessionLabel = computed(() => {
    if (this.demo) return 'Demo · ' + CLINICIAN_CONTEXT.clinicianName;
    try { const ctx = platformSession.context(); return 'Nurse · ' + ctx.identityId; } catch { return 'Loading session…'; }
  });

  readonly filteredTasks = computed(() => this.tasks().filter(task => {
    const patient = this.patients().find(item => item.id === task.patientId);
    const status = this.status();
    return (status === 'all' || (status === 'open' ? ['pending', 'in-progress'].includes(task.status) : task.status === status))
      && (this.category() === 'all' || this.category() === task.category)
      && [task.title, task.description, patient?.name, patient?.bed].join(' ').toLowerCase().includes(this.search().toLowerCase());
  }));
  readonly selectedTask = computed(() => this.tasks().find(task => task.id === this.selectedTaskId()) ?? null);
  readonly selectedPatient = computed(() => this.patients().find(patient => patient.id === this.selectedPatientId()) ?? null);
  readonly medication = computed(() => { const task = this.selectedTask(); return task?.category === 'medication' ? task : null; });
  readonly draft = signal('');
  readonly savedAt = signal('');
  readonly noteTemplates = ['Patient comfortable, no fresh complaints.', 'Explained plan to patient and family.', 'Vitals stable and recorded.', 'Medication given as ordered.', 'Escalated to doctor for review.'];
  readonly vitalFields = [{ key: 'temperature', label: 'Temperature (°C)', min: 25, max: 45, step: 0.1 }, { key: 'heartRate', label: 'Pulse (/min)', min: 0, max: 300, step: 1 }, { key: 'systolicBP', label: 'Systolic BP (mmHg)', min: 0, max: 300, step: 1 }, { key: 'diastolicBP', label: 'Diastolic BP (mmHg)', min: 0, max: 200, step: 1 }, { key: 'spo2', label: 'SpO₂ (%)', min: 0, max: 100, step: 1 }, { key: 'respiratoryRate', label: 'Respiratory rate (/min)', min: 0, max: 100, step: 1 }] as const;
  vitals: VitalsDraft = this.emptyVitals();
  confirmed = false;
  administrationNote = '';
  checklistNote = '';
  transitionState = 'deferred';
  reason = '';
  private notes: { drafts: Record<string, string>; savedAt: Record<string, string> } = { drafts: {}, savedAt: {} };
  private noteKey = STORAGE_KEYS.NURSE_NOTE_DRAFTS as string;
  private networkChanged = () => { this.online.set(navigator.onLine); if (navigator.onLine) void this.refresh(); };
  private queueChanged = () => { void this.loadQueueCounts(); };

  async ngOnInit() {
    addEventListener('online', this.networkChanged); addEventListener('offline', this.networkChanged); addEventListener('klinik-queue-changed', this.queueChanged);
    try {
      if (!this.demo) {
        await platformSession.bootstrap();
        const context = platformSession.context();
        this.noteKey = STORAGE_KEYS.NURSE_NOTE_DRAFTS + '-' + context.identityId + '-' + context.organizationId;
      }
      try { this.notes = JSON.parse(localStorage.getItem(this.noteKey) ?? '{"drafts":{},"savedAt":{}}'); } catch { /* corrupt drafts remain untouched */ }
      this.ready.set(true); await this.refresh(); await this.loadQueueCounts();
    } catch (error) { this.error.set(this.message(error)); }
    finally { this.loading.set(false); }
  }
  ngOnDestroy() { removeEventListener('online', this.networkChanged); removeEventListener('offline', this.networkChanged); removeEventListener('klinik-queue-changed', this.queueChanged); }
  private message(error: unknown) { return error instanceof Error ? error.message : 'Could not complete the nursing action.'; }
  private emptyVitals(): VitalsDraft { return { temperature: null, heartRate: null, systolicBP: null, diastolicBP: null, spo2: null, respiratoryRate: null, consciousness: null, onSupplementalOxygen: null, spO2Scale: null }; }
  get assessment() { return calculateNEWS2(this.vitals); }
  openCount(id: string) { return this.tasks().filter(task => task.patientId === id && ['pending', 'in-progress'].includes(task.status)).length; }
  async refresh() {
    if (!this.ready()) return;
    this.loading.set(true); this.error.set('');
    try {
      const [patients, tasks] = await Promise.all([patientRepository.getAll(), nurseTaskRepository.getAll()]);
      this.patients.set(patients); this.tasks.set(tasks);
      const values = await Promise.all(patients.map(async patient => [patient.id, await vitalsRepository.getLatest(patient.id)] as const));
      this.latestVitals.set(Object.fromEntries(values));
      const patientId = patients.some(patient => patient.id === this.selectedPatientId()) ? this.selectedPatientId() : patients[0]?.id ?? '';
      this.selectPatient(patientId);
      if (!tasks.some(task => task.id === this.selectedTaskId())) this.selectedTaskId.set('');
    } catch (error) { this.error.set(this.message(error)); }
    finally { this.loading.set(false); }
  }
  selectPatient(id: string) {
    this.selectedPatientId.set(id);
    this.draft.set(this.notes.drafts[id] ?? ''); this.savedAt.set(this.notes.savedAt[id] ?? '');
  }
  selectTask(task: NurseTask) {
    this.selectedTaskId.set(task.id); this.selectPatient(task.patientId);
    this.confirmed = false; this.administrationNote = ''; this.checklistNote = ''; this.reason = ''; this.vitals = this.emptyVitals();
    this.tab.set(task.category === 'vitals' ? 'vitals' : 'tasks');
  }
  openPatient(id: string, vitals = false) {
    this.selectPatient(id);
    const task = this.tasks().find(task => task.patientId === id && ['pending', 'in-progress'].includes(task.status) && (!vitals || task.category === 'vitals'));
    if (task) this.selectTask(task);
    else { this.selectedTaskId.set(''); this.tab.set(vitals ? 'vitals' : 'tasks'); }
  }
  callNext(id: string) { this.selectPatient(id); this.notice.set((this.selectedPatient()?.name ?? 'Patient') + ' selected at the station.'); }
  // CLINICAL: Nurse scratch notes remain device drafts, never signed clinical records.
  saveDraft(value: string) {
    const id = this.selectedPatientId(); if (!id) return;
    const savedAt = new Date().toISOString(); this.draft.set(value); this.savedAt.set(savedAt);
    this.notes.drafts[id] = value; this.notes.savedAt[id] = savedAt;
    try { localStorage.setItem(this.noteKey, JSON.stringify(this.notes)); }
    catch { this.error.set('Draft could not be saved on this device. Copy it before leaving.'); }
  }
  appendTemplate(value: string) { this.saveDraft((this.draft().trim() + ' ' + value).trim()); }
  async changeTab(tab: string) { this.tab.set(tab); if (tab === 'handover' && !this.demo) await this.loadHandovers(); }
  private async act(action: () => Promise<void>, success: string) {
    if (this.saving()) return;
    this.saving.set(true); this.error.set(''); this.notice.set('');
    try { await action(); this.notice.set(success); this.confirmed = false; await this.refresh(); }
    catch (error) {
      if (error instanceof QueuedCommandError) this.notice.set(error.message);
      else this.error.set(this.message(error));
    } finally { this.saving.set(false); await this.loadQueueCounts(); }
  }
  // CLINICAL: Use the retained command repository and server validation for every task mutation.
  async startTask() { const task = this.selectedTask(); if (task) await this.act(() => nurseTaskRepository.startTask(task.id, CLINICIAN_CONTEXT.clinicianName), 'Task started.'); }
  async transition() {
    const task = this.selectedTask(); if (!task || !this.reason.trim()) return;
    await this.act(() => this.transitionState === 'deferred' ? nurseTaskRepository.deferTask(task.id, CLINICIAN_CONTEXT.clinicianName, this.reason) : nurseTaskRepository.escalateTask(task.id, CLINICIAN_CONTEXT.clinicianName, this.reason), 'Task state updated.');
  }
  async completeChecklist() {
    const task = this.selectedTask(); if (!task) return;
    await this.act(() => nurseTaskRepository.completeTask({ taskId: task.id, actedBy: CLINICIAN_CONTEXT.clinicianName, note: this.checklistNote }), 'Task completed.');
  }
  async recordVitals() {
    const task = this.selectedTask(); if (task?.category !== 'vitals') return;
    const assessment = calculateNEWS2(this.vitals);
    const record: Vitals = { ...this.vitals, id: 'vitals-' + crypto.randomUUID(), patientId: task.patientId, recordedAt: new Date().toISOString(), recordedBy: CLINICIAN_CONTEXT.clinicianName, news2Score: assessment.score, news2Risk: assessment.risk, isComplete: assessment.isComplete, missingParameters: assessment.missingParameters };
    await this.act(async () => {
      await nurseTaskRepository.completeTask({ taskId: task.id, actedBy: CLINICIAN_CONTEXT.clinicianName, vitals: record });
      await vitalsRepository.save(record);
      if (assessment.score !== null) await patientRepository.updateNEWS2(task.patientId, assessment.score);
    }, assessment.score === null ? 'Observations saved. NEWS2 remains incomplete.' : 'Observations saved. NEWS2 preview ' + assessment.score + '.');
  }
  useLastVitals() {
    const last = this.latestVitals()[this.selectedPatientId()];
    if (last) this.vitals = { temperature: last.temperature, heartRate: last.heartRate, systolicBP: last.systolicBP, diastolicBP: last.diastolicBP, spo2: last.spo2, respiratoryRate: last.respiratoryRate, consciousness: last.consciousness, onSupplementalOxygen: last.onSupplementalOxygen, spO2Scale: last.spO2Scale };
  }
  async administer() {
    const task = this.medication();
    if (!task || !this.confirmed) { this.error.set('Confirm the right patient, drug, dose, route, and timing.'); return; }
    await this.act(() => nurseTaskRepository.completeTask({ taskId: task.id, actedBy: CLINICIAN_CONTEXT.clinicianName, medicationAdministration: { taskId: task.id, patientId: task.patientId, medicationName: task.medicationOrder.name, dose: task.medicationOrder.dose, route: task.medicationOrder.route, schedule: task.medicationOrder.schedule, administeredAt: new Date().toISOString(), administeredBy: CLINICIAN_CONTEXT.clinicianName, confirmationChecked: true, note: this.administrationNote } }), 'Medication administration recorded.');
  }
  private async loadQueueCounts() {
    if (this.demo || !this.ready()) return;
    const counts = await platformSession.queueCounts(); this.queued.set(counts.pending); this.review.set(counts.needsReview);
  }
  async loadHandovers() {
    try { const { organizationId, wardId } = platformSession.context(); this.sheets.set(await platformSession.request<Sheet[]>('/organizations/' + organizationId + '/handover/sessions?wardId=' + wardId)); }
    catch (error) { this.error.set(this.message(error)); }
  }
  async openHandover(id: string) {
    try { const { organizationId } = platformSession.context(); this.handover.set(await platformSession.request<Handover>('/organizations/' + organizationId + '/handover/sessions/' + id)); }
    catch (error) { this.error.set(this.message(error)); }
  }
  async acknowledge(item: HandoverItem) {
    const sheet = this.handover(); if (!sheet) return;
    await this.act(async () => { const { organizationId } = platformSession.context(); await platformSession.request('/organizations/' + organizationId + '/handover/items/' + item.id + '/acknowledgments', { method: 'POST', body: JSON.stringify({ commandId: crypto.randomUUID(), itemVersion: item.version }) }); await this.openHandover(sheet.id); }, 'Handover item acknowledged.');
  }
}
