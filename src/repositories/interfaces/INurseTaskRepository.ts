import type { CompleteTaskInput, NurseTask, NurseTaskStatus } from '@/types/NurseTask'

export interface INurseTaskRepository {
  getAll(): Promise<NurseTask[]>
  getByPatient(patientId: string): Promise<NurseTask[]>
  getByStatus(status: NurseTaskStatus): Promise<NurseTask[]>
  startTask(taskId: string, actedBy: string): Promise<void>
  completeTask(input: CompleteTaskInput): Promise<void>
  deferTask(taskId: string, actedBy: string, reason: string): Promise<void>
  escalateTask(taskId: string, actedBy: string, reason: string): Promise<void>
}
