import type { INurseTaskRepository } from '@/repositories/interfaces/INurseTaskRepository'
import type { IPatientRepository } from '@/repositories/interfaces/IPatientRepository'
import type { IVitalsRepository } from '@/repositories/interfaces/IVitalsRepository'
import type { CompleteTaskInput, NurseTask, NurseTaskStatus } from '@/types/NurseTask'
import type { Patient } from '@/types/Patient'
import type { Vitals } from '@/types/Vitals'
import { platformSession } from '@/services/platformSession'

type Encounter = { id: string; display_name: string; mrn: string | null }
type WireTask = { id: string; type: 'medication' | 'observation'; status: 'open' | 'in_progress'; version: number; encounter_id: string; patient_id: string; display_name: string; description: string | null; dose: number | null; unit: string | null; route: string | null; scheduled_at: string | null }
const status = (value: WireTask['status']): NurseTaskStatus => value === 'open' ? 'pending' : 'in-progress'

function taskFromWire(task: WireTask): NurseTask {
  const base = {
    id: task.id, patientId: task.encounter_id, title: task.type === 'medication' ? task.description ?? 'Medication administration' : 'Record observations',
    description: task.type === 'medication' ? task.description ?? 'Confirmed medication order' : 'Record the required observation set.',
    priority: 'soon' as const, status: status(task.status), dueAt: task.scheduled_at ?? '', createdAt: '', assignedTo: 'Authenticated nurse',
    sourceEventType: 'OrderPlaced' as const, sourceEventId: task.id, auditTrail: [], serverVersion: task.version,
  }
  return task.type === 'medication'
    ? { ...base, category: 'medication', medicationOrder: { name: task.description ?? 'Medication', dose: task.dose === null ? '' : `${task.dose}${task.unit ? ` ${task.unit}` : ''}`, route: task.route ?? '', schedule: task.scheduled_at ?? '', safetyNote: 'Confirm bedside identity before administration.' } }
    : { ...base, category: 'vitals', vitalsTemplate: { requiredFields: ['temperature', 'heartRate', 'systolicBP', 'spo2', 'respiratoryRate'] } }
}

export class ApiPatientRepository implements IPatientRepository {
  async getAll(): Promise<Patient[]> {
    const { organizationId, wardId } = platformSession.context()
    const encounters = await platformSession.request<Encounter[]>(`/organizations/${organizationId}/encounters?wardId=${wardId}`)
    return encounters.map(encounter => ({ id: encounter.id, name: encounter.display_name, age: 0, dateOfBirth: '', sex: 'Unknown', bed: encounter.mrn ?? '—', ward: 'Assigned ward', diagnosis: 'Clinical details loading', news2: 0, status: 'active', allergies: [], lastNurseNote: '' }))
  }
  async getById(id: string) { return (await this.getAll()).find(patient => patient.id === id) ?? null }
  async updateNEWS2(): Promise<void> {}
}

export class ApiNurseTaskRepository implements INurseTaskRepository {
  private async all(): Promise<NurseTask[]> {
    const { organizationId, wardId } = platformSession.context()
    const tasks = await platformSession.request<WireTask[]>(`/organizations/${organizationId}/tasks?wardId=${wardId}`)
    return tasks.map(taskFromWire)
  }
  async getAll() { return this.all() }
  async getByPatient(patientId: string) { return (await this.all()).filter(task => task.patientId === patientId) }
  async getByStatus(taskStatus: NurseTaskStatus) { return (await this.all()).filter(task => task.status === taskStatus) }
  async startTask(taskId: string): Promise<void> { await this.transition(taskId, 'in_progress') }
  async deferTask(taskId: string, _actedBy: string, reason: string): Promise<void> { await this.transition(taskId, 'deferred', reason) }
  async escalateTask(taskId: string, _actedBy: string, reason: string): Promise<void> { await this.transition(taskId, 'escalated', reason) }
  async completeTask(input: CompleteTaskInput): Promise<void> {
    const task = (await this.all()).find(item => item.id === input.taskId)
    if (!task) throw new Error('This task is no longer in your queue. Refresh and review the current state.')
    const { organizationId } = platformSession.context()
    if (input.medicationAdministration && task.category === 'medication') {
      const match = input.medicationAdministration.dose.match(/^([0-9.]+)\s*(.*)$/)
      if (!match) throw new Error('Enter a numeric medication dose before confirmation.')
      await platformSession.request(`/organizations/${organizationId}/tasks/${task.id}/administrations`, { method: 'POST', body: JSON.stringify({ commandId: crypto.randomUUID(), expectedVersion: task.serverVersion, dose: Number(match[1]), unit: match[2] || 'unit', route: input.medicationAdministration.route || 'unspecified', administeredAt: input.medicationAdministration.administeredAt, confirmed: true }) })
      return
    }
    if (input.vitals && task.category === 'vitals') {
      await platformSession.request(`/organizations/${organizationId}/tasks/${task.id}/observations`, { method: 'POST', body: JSON.stringify({ commandId: crypto.randomUUID(), expectedVersion: task.serverVersion, measurements: { temperature: input.vitals.temperature ?? undefined, pulse: input.vitals.heartRate ?? undefined, systolicBp: input.vitals.systolicBP ?? undefined, diastolicBp: input.vitals.diastolicBP ?? undefined, spo2: input.vitals.spo2 ?? undefined, respiratoryRate: input.vitals.respiratoryRate ?? undefined, consciousness: input.vitals.consciousness ?? undefined, spo2Scale: input.vitals.spO2Scale ?? undefined }, oxygenSupplemental: input.vitals.onSupplementalOxygen ?? undefined, measuredAt: input.vitals.recordedAt }) })
      return
    }
    throw new Error('This clinical task requires its structured bedside record before completion.')
  }
  private async transition(taskId: string, state: 'in_progress' | 'deferred' | 'escalated', reason?: string) {
    const task = (await this.all()).find(item => item.id === taskId)
    if (!task) throw new Error('This task is no longer in your queue. Refresh and review the current state.')
    const { organizationId } = platformSession.context()
    await platformSession.request(`/organizations/${organizationId}/tasks/${task.id}/transitions`, { method: 'POST', body: JSON.stringify({ commandId: crypto.randomUUID(), expectedVersion: task.serverVersion, state, reason }) })
  }
}

export class ApiVitalsRepository implements IVitalsRepository {
  private values: Vitals[] = []
  async getByPatient(patientId: string) { return this.values.filter(value => value.patientId === patientId) }
  async getLatest(patientId: string) { return (await this.getByPatient(patientId))[0] ?? null }
  async save(vitals: Vitals) { this.values = [vitals, ...this.values]; return vitals }
}
