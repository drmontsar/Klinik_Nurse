import type { MedicationAdministration } from '@/types/MedicationAdministration'
import type { VitalField, Vitals } from '@/types/Vitals'

export type NurseTaskCategory =
  | 'vitals'
  | 'medication'
  | 'nursing'
  | 'investigation-followup'

export type NurseTaskPriority =
  | 'routine'
  | 'soon'
  | 'urgent'
  | 'critical'

export type NurseTaskStatus =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'deferred'
  | 'escalated'

export type SourceEventType =
  | 'NoteConfirmed'
  | 'OrderPlaced'
  | 'VitalsRecorded'

export interface TaskAuditEntry {
  status: NurseTaskStatus
  actedAt: string
  actedBy: string
  note?: string
}

export interface NurseTaskBase {
  id: string
  patientId: string
  title: string
  description: string
  category: NurseTaskCategory
  priority: NurseTaskPriority
  status: NurseTaskStatus
  dueAt: string
  createdAt: string
  assignedTo: string
  sourceEventType: SourceEventType
  sourceEventId: string
  auditTrail: TaskAuditEntry[]
}

export interface VitalsTask extends NurseTaskBase {
  category: 'vitals'
  vitalsTemplate: {
    requiredFields: VitalField[]
    oxygenTargetNote?: string
  }
}

export interface MedicationTask extends NurseTaskBase {
  category: 'medication'
  medicationOrder: {
    name: string
    dose: string
    route: string
    schedule: string
    safetyNote: string
  }
}

export interface NursingTask extends NurseTaskBase {
  category: 'nursing'
  nursingInstruction: string
}

export interface InvestigationFollowUpTask extends NurseTaskBase {
  category: 'investigation-followup'
  investigationName: string
}

export type NurseTask =
  | VitalsTask
  | MedicationTask
  | NursingTask
  | InvestigationFollowUpTask

export interface CompleteTaskInput {
  taskId: string
  actedBy: string
  note?: string
  vitals?: Vitals
  medicationAdministration?: MedicationAdministration
}
