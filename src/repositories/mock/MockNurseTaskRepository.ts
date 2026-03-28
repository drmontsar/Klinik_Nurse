import { STORAGE_KEYS } from '@/constants/config'
import { mockNurseTasks } from '@/data/nurseTasks/mockNurseTasks'
import type { INurseTaskRepository } from '@/repositories/interfaces/INurseTaskRepository'
import type {
  CompleteTaskInput,
  NurseTask,
  NurseTaskStatus,
  TaskAuditEntry,
} from '@/types/NurseTask'
import { delay } from '@/utils/delay'

function readTasksFromStorage(): NurseTask[] {
  if (typeof window === 'undefined') {
    return mockNurseTasks
  }

  const rawTasks = window.localStorage.getItem(STORAGE_KEYS.NURSE_TASKS)

  if (!rawTasks) {
    return mockNurseTasks
  }

  try {
    return JSON.parse(rawTasks) as NurseTask[]
  } catch {
    return mockNurseTasks
  }
}

function writeTasksToStorage(tasks: NurseTask[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEYS.NURSE_TASKS, JSON.stringify(tasks))
}

function appendAuditEntry(
  task: NurseTask,
  status: NurseTaskStatus,
  actedBy: string,
  note?: string,
): NurseTask {
  const auditEntry: TaskAuditEntry = {
    status,
    actedAt: new Date().toISOString(),
    actedBy,
    note,
  }

  return {
    ...task,
    status,
    auditTrail: [...task.auditTrail, auditEntry],
  }
}

export class MockNurseTaskRepository implements INurseTaskRepository {
  private store: NurseTask[] = readTasksFromStorage()

  private persist(): void {
    writeTasksToStorage(this.store)
  }

  /**
   * Returns the current nurse task list sorted by urgency and due time.
   * @returns all nurse tasks
   * @clinical-note task ordering must surface the sickest and most time-sensitive work first
   */
  async getAll(): Promise<NurseTask[]> {
    await delay()
    const priorityRank: Record<NurseTask['priority'], number> = {
      critical: 0,
      urgent: 1,
      soon: 2,
      routine: 3,
    }

    return [...this.store].sort((left, right) => {
      const priorityDifference =
        priorityRank[left.priority] - priorityRank[right.priority]

      if (priorityDifference !== 0) {
        return priorityDifference
      }

      return left.dueAt.localeCompare(right.dueAt)
    })
  }

  /**
   * Returns tasks for one patient.
   * @param patientId - patient id
   * @returns tasks assigned to the selected patient
   * @clinical-note patient-scoped tasks reduce wrong-patient execution risk at the bedside
   */
  async getByPatient(patientId: string): Promise<NurseTask[]> {
    await delay(120)
    return this.store.filter((task) => task.patientId === patientId)
  }

  /**
   * Returns tasks by workflow status.
   * @param status - task status
   * @returns matching tasks
   * @clinical-note pending versus escalated work needs to stay visible for safe handover
   */
  async getByStatus(status: NurseTaskStatus): Promise<NurseTask[]> {
    await delay(120)
    return this.store.filter((task) => task.status === status)
  }

  /**
   * Marks a task as actively being worked.
   * @param taskId - task id
   * @param actedBy - nurse identifier
   * @returns nothing
   * @clinical-note in-progress state helps avoid duplicated bedside actions
   */
  async startTask(taskId: string, actedBy: string): Promise<void> {
    await delay(120)
    this.store = this.store.map((task) =>
      task.id === taskId
        ? appendAuditEntry(task, 'in-progress', actedBy, 'Task opened')
        : task,
    )
    this.persist()
  }

  /**
   * Completes a task after structured execution data has been captured.
   * @param input - completion payload
   * @returns nothing
   * @clinical-note nurse task completion must leave an auditable, append-only action trail
   */
  async completeTask(input: CompleteTaskInput): Promise<void> {
    await delay(160)
    this.store = this.store.map((task) =>
      task.id === input.taskId
        ? appendAuditEntry(task, 'completed', input.actedBy, input.note)
        : task,
    )
    this.persist()
  }

  /**
   * Defers a task with a mandatory reason.
   * @param taskId - task id
   * @param actedBy - nurse identifier
   * @param reason - defer reason
   * @returns nothing
   * @clinical-note deferred tasks require explicit reasoning for safe follow-through and auditability
   */
  async deferTask(
    taskId: string,
    actedBy: string,
    reason: string,
  ): Promise<void> {
    await delay(160)
    this.store = this.store.map((task) =>
      task.id === taskId
        ? appendAuditEntry(task, 'deferred', actedBy, reason)
        : task,
    )
    this.persist()
  }

  /**
   * Escalates a task when bedside execution is unsafe or needs review.
   * @param taskId - task id
   * @param actedBy - nurse identifier
   * @param reason - escalation reason
   * @returns nothing
   * @clinical-note escalation is safer than silent failure when patient condition changes
   */
  async escalateTask(
    taskId: string,
    actedBy: string,
    reason: string,
  ): Promise<void> {
    await delay(160)
    this.store = this.store.map((task) =>
      task.id === taskId
        ? appendAuditEntry(task, 'escalated', actedBy, reason)
        : task,
    )
    this.persist()
  }
}
