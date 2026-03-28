import { useEffect, useState } from 'react'
import { CLINICIAN_CONTEXT } from '@/constants/config'
import {
  nurseTaskRepository,
  patientRepository,
  vitalsRepository,
} from '@/repositories'
import type { MedicationAdministration } from '@/types/MedicationAdministration'
import type { NurseTask, NurseTaskCategory, NurseTaskStatus } from '@/types/NurseTask'
import type { Patient } from '@/types/Patient'
import type { Vitals, VitalsDraft } from '@/types/Vitals'
import { calculateNEWS2 } from '@/utils/calculateNEWS2'

export type TaskStatusFilter = 'all' | 'open' | NurseTaskStatus
export type TaskCategoryFilter = 'all' | NurseTaskCategory

function createClinicalId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}`
}

export function useNurseTaskBoard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [tasks, setTasks] = useState<NurseTask[]>([])
  const [latestVitalsByPatient, setLatestVitalsByPatient] = useState<
    Record<string, Vitals | null>
  >({})
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<TaskStatusFilter>('open')
  const [categoryFilter, setCategoryFilter] =
    useState<TaskCategoryFilter>('all')
  const [loading, setLoading] = useState(true)
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function loadBoard(): Promise<void> {
    setError(null)

    const [patientList, taskList] = await Promise.all([
      patientRepository.getAll(),
      nurseTaskRepository.getAll(),
    ])

    const latestVitalsEntries = await Promise.all(
      patientList.map(async (patient) => [
        patient.id,
        await vitalsRepository.getLatest(patient.id),
      ]),
    )

    setPatients(patientList)
    setTasks(taskList)
    setLatestVitalsByPatient(Object.fromEntries(latestVitalsEntries))
    setSelectedTaskId((currentTaskId) => {
      if (currentTaskId && taskList.some((task) => task.id === currentTaskId)) {
        return currentTaskId
      }

      return taskList[0]?.id ?? null
    })
  }

  useEffect(() => {
    let isMounted = true

    async function initialiseBoard() {
      setLoading(true)

      try {
        await loadBoard()
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load nurse task board.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void initialiseBoard()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredTasks = tasks.filter((task) => {
    const patient = patients.find(({ id }) => id === task.patientId)
    const normalizedSearch = searchQuery.trim().toLowerCase()
    const matchesSearch =
      normalizedSearch.length === 0 ||
      task.title.toLowerCase().includes(normalizedSearch) ||
      task.description.toLowerCase().includes(normalizedSearch) ||
      patient?.name.toLowerCase().includes(normalizedSearch) ||
      patient?.bed.toLowerCase().includes(normalizedSearch)

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'open'
          ? task.status === 'pending' || task.status === 'in-progress'
          : task.status === statusFilter

    const matchesCategory =
      categoryFilter === 'all' ? true : task.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const selectedTask =
    filteredTasks.find((task) => task.id === selectedTaskId) ??
    filteredTasks[0] ??
    null

  const patientById = patients.reduce<Record<string, Patient>>(
    (accumulator, patient) => {
      accumulator[patient.id] = patient
      return accumulator
    },
    {},
  )

  async function refresh(): Promise<void> {
    setLoading(true)

    try {
      await loadBoard()
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : 'Unable to refresh task board.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function startTask(taskId: string): Promise<void> {
    setBusyTaskId(taskId)
    setError(null)

    try {
      await nurseTaskRepository.startTask(
        taskId,
        CLINICIAN_CONTEXT.clinicianName,
      )
      await loadBoard()
      setNotice('Task marked as in progress.')
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Unable to update task.',
      )
    } finally {
      setBusyTaskId(null)
    }
  }

  async function completeChecklistTask(
    taskId: string,
    note?: string,
  ): Promise<void> {
    setBusyTaskId(taskId)
    setError(null)

    try {
      await nurseTaskRepository.completeTask({
        taskId,
        actedBy: CLINICIAN_CONTEXT.clinicianName,
        note,
      })
      await loadBoard()
      setNotice('Task completed and written to the audit trail.')
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Unable to complete task.',
      )
    } finally {
      setBusyTaskId(null)
    }
  }

  async function deferTask(taskId: string, reason: string): Promise<void> {
    setBusyTaskId(taskId)
    setError(null)

    try {
      await nurseTaskRepository.deferTask(
        taskId,
        CLINICIAN_CONTEXT.clinicianName,
        reason,
      )
      await loadBoard()
      setNotice('Task deferred with reason captured.')
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Unable to defer task.',
      )
    } finally {
      setBusyTaskId(null)
    }
  }

  async function escalateTask(taskId: string, reason: string): Promise<void> {
    setBusyTaskId(taskId)
    setError(null)

    try {
      await nurseTaskRepository.escalateTask(
        taskId,
        CLINICIAN_CONTEXT.clinicianName,
        reason,
      )
      await loadBoard()
      setNotice('Task escalated and preserved in the audit trail.')
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Unable to escalate task.',
      )
    } finally {
      setBusyTaskId(null)
    }
  }

  async function recordVitals(
    task: NurseTask,
    vitalsDraft: VitalsDraft,
  ): Promise<void> {
    setBusyTaskId(task.id)
    setError(null)
    const news2Assessment = calculateNEWS2(vitalsDraft)

    if (!news2Assessment.isComplete || news2Assessment.score === null) {
      setError(
        `NEWS2 incomplete - missing: ${news2Assessment.missingParameters.join(', ')}`,
      )
      setBusyTaskId(null)
      return
    }

    try {
      const vitals: Vitals = {
        id: createClinicalId('vitals'),
        patientId: task.patientId,
        recordedAt: new Date().toISOString(),
        recordedBy: CLINICIAN_CONTEXT.clinicianName,
        temperature: vitalsDraft.temperature,
        heartRate: vitalsDraft.heartRate,
        systolicBP: vitalsDraft.systolicBP,
        diastolicBP: vitalsDraft.diastolicBP,
        spo2: vitalsDraft.spo2,
        respiratoryRate: vitalsDraft.respiratoryRate,
        consciousness: vitalsDraft.consciousness,
        onSupplementalOxygen: vitalsDraft.onSupplementalOxygen,
        spO2Scale: vitalsDraft.spO2Scale,
        news2Score: news2Assessment.score,
        news2Risk: news2Assessment.risk,
        isComplete: news2Assessment.isComplete,
        missingParameters: news2Assessment.missingParameters,
      }

      await vitalsRepository.save(vitals)
      await patientRepository.updateNEWS2(task.patientId, news2Assessment.score)
      await nurseTaskRepository.completeTask({
        taskId: task.id,
        actedBy: CLINICIAN_CONTEXT.clinicianName,
        note: `Vitals recorded. NEWS2 ${news2Assessment.score} (${news2Assessment.risk}).`,
        vitals,
      })
      await loadBoard()
      setNotice(`Vitals saved. NEWS2 updated to ${news2Assessment.score}.`)
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Unable to record vitals.',
      )
    } finally {
      setBusyTaskId(null)
    }
  }

  async function administerMedication(
    task: NurseTask,
    confirmationChecked: boolean,
    note: string,
  ): Promise<void> {
    setBusyTaskId(task.id)
    setError(null)

    if (!confirmationChecked || task.category !== 'medication') {
      setError(
        'Medication orders are never auto-confirmed. Explicit confirmation is required before administration.',
      )
      setBusyTaskId(null)
      return
    }

    try {
      const medicationAdministration: MedicationAdministration = {
        taskId: task.id,
        patientId: task.patientId,
        medicationName: task.medicationOrder.name,
        dose: task.medicationOrder.dose,
        route: task.medicationOrder.route,
        schedule: task.medicationOrder.schedule,
        administeredAt: new Date().toISOString(),
        administeredBy: CLINICIAN_CONTEXT.clinicianName,
        confirmationChecked,
        note,
      }

      await nurseTaskRepository.completeTask({
        taskId: task.id,
        actedBy: CLINICIAN_CONTEXT.clinicianName,
        note:
          note.trim().length > 0
            ? note
            : `Medication administered: ${task.medicationOrder.name}.`,
        medicationAdministration,
      })
      await loadBoard()
      setNotice('Medication administration confirmed and logged.')
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Unable to administer medication.',
      )
    } finally {
      setBusyTaskId(null)
    }
  }

  return {
    patients,
    tasks,
    filteredTasks,
    selectedTask,
    patientById,
    latestVitalsByPatient,
    loading,
    busyTaskId,
    error,
    notice,
    searchQuery,
    statusFilter,
    categoryFilter,
    setSelectedTaskId,
    setSearchQuery,
    setStatusFilter,
    setCategoryFilter,
    setError,
    setNotice,
    refresh,
    startTask,
    completeChecklistTask,
    deferTask,
    escalateTask,
    recordVitals,
    administerMedication,
  }
}
