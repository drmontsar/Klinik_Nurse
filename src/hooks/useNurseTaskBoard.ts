import { useEffect, useState } from 'react'
import { CLINICIAN_CONTEXT, STORAGE_KEYS } from '@/constants/config'
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
export type NurseWorkspaceTab =
  | 'queue'
  | 'tasks'
  | 'vitals'
  | 'notes'
  | 'patients'

interface StoredNoteDrafts {
  drafts: Record<string, string>
  savedAt: Record<string, string>
}

function readNoteDraftsFromStorage(): StoredNoteDrafts {
  if (typeof window === 'undefined') {
    return { drafts: {}, savedAt: {} }
  }

  const rawDrafts = window.localStorage.getItem(
    STORAGE_KEYS.NURSE_NOTE_DRAFTS,
  )

  if (!rawDrafts) {
    return { drafts: {}, savedAt: {} }
  }

  try {
    return JSON.parse(rawDrafts) as StoredNoteDrafts
  } catch {
    return { drafts: {}, savedAt: {} }
  }
}

function writeNoteDraftsToStorage(drafts: StoredNoteDrafts): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    STORAGE_KEYS.NURSE_NOTE_DRAFTS,
    JSON.stringify(drafts),
  )
}

function createClinicalId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}`
}

export function useNurseTaskBoard() {
  const storedNoteDrafts = readNoteDraftsFromStorage()
  const [patients, setPatients] = useState<Patient[]>([])
  const [tasks, setTasks] = useState<NurseTask[]>([])
  const [latestVitalsByPatient, setLatestVitalsByPatient] = useState<
    Record<string, Vitals | null>
  >({})
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  )
  const [currentTab, setCurrentTab] =
    useState<NurseWorkspaceTab>('queue')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<TaskStatusFilter>('open')
  const [categoryFilter, setCategoryFilter] =
    useState<TaskCategoryFilter>('all')
  const [loading, setLoading] = useState(true)
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>(
    storedNoteDrafts.drafts,
  )
  const [noteSavedAtByPatient, setNoteSavedAtByPatient] = useState<
    Record<string, string>
  >(storedNoteDrafts.savedAt)

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
    setSelectedPatientId((currentPatientId) => {
      if (
        currentPatientId &&
        patientList.some((patient) => patient.id === currentPatientId)
      ) {
        return currentPatientId
      }

      return taskList[0]?.patientId ?? patientList[0]?.id ?? null
    })
  }

  useEffect(() => {
    writeNoteDraftsToStorage({
      drafts: noteDrafts,
      savedAt: noteSavedAtByPatient,
    })
  }, [noteDrafts, noteSavedAtByPatient])

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
  const selectedPatient =
    (selectedPatientId ? patientById[selectedPatientId] : null) ??
    (selectedTask ? patientById[selectedTask.patientId] ?? null : null)

  function selectTask(taskId: string): void {
    const nextTask = tasks.find((task) => task.id === taskId)

    setSelectedTaskId(taskId)

    if (nextTask) {
      setSelectedPatientId(nextTask.patientId)
    }
  }

  function selectPatient(patientId: string): void {
    setSelectedPatientId(patientId)
  }

  function callNextPatient(patientId: string): void {
    const patient = patientById[patientId]
    setSelectedPatientId(patientId)
    setCurrentTab('queue')
    setNotice(
      patient
        ? `${patient.name} has been called to the station.`
        : 'Patient has been called to the station.',
    )
  }

  function openPatientTasks(patientId: string): void {
    const openTask = tasks.find(
      (task) =>
        task.patientId === patientId &&
        (task.status === 'pending' || task.status === 'in-progress'),
    )
    const fallbackTask = tasks.find((task) => task.patientId === patientId)

    setSelectedPatientId(patientId)
    setCurrentTab('tasks')

    if (openTask ?? fallbackTask) {
      setSelectedTaskId((openTask ?? fallbackTask)!.id)
    }
  }

  function openPatientVitals(patientId: string): void {
    const vitalsTask = tasks.find(
      (task) =>
        task.patientId === patientId &&
        task.category === 'vitals' &&
        (task.status === 'pending' || task.status === 'in-progress'),
    )

    setSelectedPatientId(patientId)
    setCurrentTab('vitals')

    if (vitalsTask) {
      setSelectedTaskId(vitalsTask.id)
    }
  }

  function updateSelectedPatientNoteDraft(nextDraft: string): void {
    if (!selectedPatient) {
      return
    }

    const savedAt = new Date().toISOString()

    setNoteDrafts((currentDrafts) => ({
      ...currentDrafts,
      [selectedPatient.id]: nextDraft,
    }))
    setNoteSavedAtByPatient((currentSavedAt) => ({
      ...currentSavedAt,
      [selectedPatient.id]: savedAt,
    }))
  }

  function appendNoteTemplate(template: string): void {
    if (!selectedPatient) {
      return
    }

    const currentDraft = noteDrafts[selectedPatient.id] ?? ''
    const nextDraft =
      currentDraft.trim().length === 0
        ? template
        : `${currentDraft.trim()} ${template}`

    updateSelectedPatientNoteDraft(nextDraft)
  }

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
    selectedPatient,
    patientById,
    latestVitalsByPatient,
    loading,
    busyTaskId,
    error,
    notice,
    currentTab,
    searchQuery,
    statusFilter,
    categoryFilter,
    noteDraft: selectedPatient ? noteDrafts[selectedPatient.id] ?? '' : '',
    noteSavedAt:
      selectedPatient ? noteSavedAtByPatient[selectedPatient.id] ?? null : null,
    setSelectedTaskId: selectTask,
    setSelectedPatientId: selectPatient,
    setCurrentTab,
    setSearchQuery,
    setStatusFilter,
    setCategoryFilter,
    setError,
    setNotice,
    callNextPatient,
    openPatientTasks,
    openPatientVitals,
    updateSelectedPatientNoteDraft,
    appendNoteTemplate,
    refresh,
    startTask,
    completeChecklistTask,
    deferTask,
    escalateTask,
    recordVitals,
    administerMedication,
  }
}
