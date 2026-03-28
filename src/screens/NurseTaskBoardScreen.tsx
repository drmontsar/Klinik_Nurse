import { useMemo, useRef } from 'react'
import { NotesPanel } from '@/components/nurse/NotesPanel'
import { NurseTaskCard } from '@/components/nurse/NurseTaskCard'
import { NurseTaskDetailPanel } from '@/components/nurse/NurseTaskDetailPanel'
import { NurseTaskFilters } from '@/components/nurse/NurseTaskFilters'
import { NurseWorkspaceNav } from '@/components/nurse/NurseWorkspaceNav'
import { PatientContextBar } from '@/components/nurse/PatientContextBar'
import { PatientRosterPanel } from '@/components/nurse/PatientRosterPanel'
import { QueuePanel } from '@/components/nurse/QueuePanel'
import { ErrorCard } from '@/components/shared/ErrorCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { COLORS } from '@/constants/colors'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useNurseTaskBoard } from '@/hooks/useNurseTaskBoard'
import { useViewportMode } from '@/hooks/useViewportMode'
import type { NurseTask } from '@/types/NurseTask'

function metricCard(label: string, value: number, tone: string) {
  return (
    <div
      style={{
        borderRadius: 22,
        padding: 18,
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        boxShadow: `0 18px 44px ${COLORS.shadow}`,
      }}
    >
      <div
        style={{
          color: COLORS.textDim,
          marginBottom: 8,
          fontSize: 12,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div style={{ color: tone, fontWeight: 800, fontSize: 24 }}>{value}</div>
    </div>
  )
}

function emptyStateCard(message: string) {
  return (
    <div
      style={{
        borderRadius: 24,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.surface,
        padding: 24,
        color: COLORS.textMuted,
        boxShadow: `0 18px 44px ${COLORS.shadow}`,
      }}
    >
      {message}
    </div>
  )
}

export function NurseTaskBoardScreen() {
  const detailPanelRef = useRef<HTMLElement | null>(null)
  const { isOnline } = useNetworkStatus()
  const { isMobile } = useViewportMode()
  const {
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
    noteDraft,
    noteSavedAt,
    setSelectedTaskId,
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
  } = useNurseTaskBoard()

  function scrollToDetailPanel() {
    if (typeof window !== 'undefined' && isMobile) {
      window.requestAnimationFrame(() => {
        detailPanelRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    }
  }

  function openTask(task: NurseTask, tab: 'tasks' | 'vitals') {
    setCurrentTab(tab)
    setSelectedTaskId(task.id)
    scrollToDetailPanel()
  }

  const queuePatients = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return patients.filter((patient) => {
      if (normalizedSearch.length === 0) {
        return true
      }

      return (
        patient.name.toLowerCase().includes(normalizedSearch) ||
        patient.bed.toLowerCase().includes(normalizedSearch) ||
        patient.diagnosis.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [patients, searchQuery])

  const openTaskCountByPatient = tasks.reduce<Record<string, number>>(
    (accumulator, task) => {
      if (task.status === 'pending' || task.status === 'in-progress') {
        accumulator[task.patientId] = (accumulator[task.patientId] ?? 0) + 1
      }

      return accumulator
    },
    {},
  )

  const taskListForCurrentTab =
    currentTab === 'vitals'
      ? filteredTasks.filter((task) => task.category === 'vitals')
      : filteredTasks

  const selectedTaskForCurrentTab =
    taskListForCurrentTab.find((task) => task.id === selectedTask?.id) ??
    taskListForCurrentTab[0] ??
    null

  const criticalCount = tasks.filter(
    (task) => task.priority === 'critical',
  ).length
  const urgentCount = tasks.filter((task) => task.priority === 'urgent').length
  const openCount = tasks.filter(
    (task) => task.status === 'pending' || task.status === 'in-progress',
  ).length
  const completedCount = tasks.filter(
    (task) => task.status === 'completed',
  ).length

  function renderTaskWorkspace(tab: 'tasks' | 'vitals') {
    const listLabel =
      tab === 'vitals' ? 'Open vitals actions' : 'Open bedside tasks'

    return (
      <div
        style={{
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <section
          style={{
            flex: '1 1 420px',
            display: 'grid',
            gap: 14,
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: 6,
            }}
          >
            <div
              style={{
                color: COLORS.text,
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              {listLabel}
            </div>
            <div
              style={{
                color: COLORS.textMuted,
                lineHeight: 1.6,
              }}
            >
              Tap a card to jump straight into the bedside action.
            </div>
          </div>

          {taskListForCurrentTab.length === 0
            ? emptyStateCard(
                tab === 'vitals'
                  ? 'No vitals tasks match the current filters.'
                  : 'No tasks match the current filters.',
              )
            : taskListForCurrentTab.map((task) => {
                const patient = patientById[task.patientId]

                if (!patient) {
                  return null
                }

                return (
                  <NurseTaskCard
                    key={task.id}
                    task={task}
                    patient={patient}
                    isSelected={selectedTaskForCurrentTab?.id === task.id}
                    onSelect={() => openTask(task, tab)}
                  />
                )
              })}
        </section>

        <section
          ref={detailPanelRef}
          style={{ flex: '1 1 520px', minWidth: 320 }}
        >
          <NurseTaskDetailPanel
            task={selectedTaskForCurrentTab}
            patient={
              selectedTaskForCurrentTab
                ? patientById[selectedTaskForCurrentTab.patientId] ?? null
                : null
            }
            latestVitals={
              selectedTaskForCurrentTab
                ? latestVitalsByPatient[selectedTaskForCurrentTab.patientId] ?? null
                : null
            }
            busy={busyTaskId === selectedTaskForCurrentTab?.id}
            onStartTask={startTask}
            onCompleteChecklistTask={completeChecklistTask}
            onRecordVitals={recordVitals}
            onAdministerMedication={administerMedication}
            onDeferTask={deferTask}
            onEscalateTask={escalateTask}
          />
        </section>
      </div>
    )
  }

  function renderCurrentTab() {
    switch (currentTab) {
      case 'queue':
        return (
          <QueuePanel
            patients={queuePatients}
            openTaskCountByPatient={openTaskCountByPatient}
            onCallNext={callNextPatient}
            onOpenTasks={openPatientTasks}
            onRecordVitals={openPatientVitals}
          />
        )
      case 'tasks':
        return renderTaskWorkspace('tasks')
      case 'vitals':
        return renderTaskWorkspace('vitals')
      case 'notes':
        return (
          <NotesPanel
            patient={selectedPatient}
            draft={noteDraft}
            savedAt={noteSavedAt}
            onDraftChange={updateSelectedPatientNoteDraft}
            onAppendTemplate={appendNoteTemplate}
          />
        )
      case 'patients':
        return (
          <PatientRosterPanel
            patients={queuePatients}
            latestVitalsByPatient={latestVitalsByPatient}
            openTaskCountByPatient={openTaskCountByPatient}
            onFocusPatientTasks={openPatientTasks}
          />
        )
      default:
        return null
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(107,148,135,0.18), transparent 34%), linear-gradient(180deg, #F9FCFA 0%, #EEF4F0 46%, #F7FAF8 100%)',
        color: COLORS.text,
      }}
    >
      <div
        style={{
          maxWidth: 1480,
          margin: '0 auto',
          padding: 24,
          display: 'grid',
          gap: 20,
          paddingBottom: isMobile ? 120 : 24,
        }}
      >
        <header
          style={{
            display: 'grid',
            gap: 16,
            padding: 28,
            paddingRight: 168,
            borderRadius: 30,
            border: `1px solid ${COLORS.border}`,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.86), rgba(229,240,235,0.96))',
            boxShadow: `0 24px 54px ${COLORS.shadow}`,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
            }}
          >
            <OfflineBanner isOnline={isOnline} compact />
          </div>
          <div>
            <div
              style={{
                display: 'inline-block',
                marginBottom: 10,
                paddingBottom: 4,
                fontSize: 'clamp(2.8rem, 6vw, 5.1rem)',
                lineHeight: 0.95,
                fontFamily: '"Newsreader", Georgia, serif',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                background:
                  'linear-gradient(135deg, #FFFFFF 0%, #EEF7FF 20%, #C5DCF0 47%, #7EA8D0 73%, #476E96 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 12px 32px rgba(88, 126, 164, 0.24)',
              }}
            >
              Klinik-N
            </div>
            <div
              style={{
                color: COLORS.textMuted,
                maxWidth: 540,
                lineHeight: 1.7,
              }}
            >
              Queue-first bedside support built to keep actions obvious, safe,
              and quick during a busy shift.
            </div>
          </div>
        </header>

        {selectedPatient ? (
          <PatientContextBar
            patient={selectedPatient}
            latestVitals={latestVitalsByPatient[selectedPatient.id] ?? null}
            openTaskCount={openTaskCountByPatient[selectedPatient.id] ?? 0}
            onOpenTasks={() => openPatientTasks(selectedPatient.id)}
            onOpenVitals={() => openPatientVitals(selectedPatient.id)}
            onOpenNotes={() => setCurrentTab('notes')}
          />
        ) : null}

        <div
          style={{
            display: 'grid',
            gap: 14,
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          {metricCard('Queue size', queuePatients.length, COLORS.brandLight)}
          {metricCard('Open tasks', openCount, COLORS.brandLight)}
          {metricCard('Critical', criticalCount, COLORS.red)}
          {metricCard('Completed', completedCount, COLORS.green)}
          {metricCard('Urgent', urgentCount, COLORS.amber)}
        </div>

        {(currentTab === 'tasks' ||
          currentTab === 'vitals' ||
          currentTab === 'patients' ||
          currentTab === 'queue') && (
          <NurseTaskFilters
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            searchPlaceholder={
              currentTab === 'queue' || currentTab === 'patients'
                ? 'Search patient, bed, or diagnosis'
                : 'Search patient, bed, or task'
            }
            showStatusFilter={
              currentTab === 'tasks' || currentTab === 'vitals'
            }
            showCategoryFilter={
              currentTab === 'tasks' || currentTab === 'vitals'
            }
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
            onCategoryChange={setCategoryFilter}
          />
        )}

        {notice ? (
          <div
            style={{
              borderRadius: 16,
              padding: 14,
              backgroundColor: COLORS.greenBg,
              border: `1px solid ${COLORS.green}`,
              color: COLORS.text,
              boxShadow: `0 14px 30px ${COLORS.shadow}`,
            }}
          >
            {notice}
            <button
              onClick={() => setNotice(null)}
              style={{
                marginLeft: 12,
                border: 0,
                background: 'transparent',
                color: COLORS.green,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Dismiss
            </button>
          </div>
        ) : null}

        {error ? (
          <ErrorCard
            message={error}
            onRetry={() => {
              setError(null)
              void refresh()
            }}
          />
        ) : null}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div
            style={{
              display: isMobile ? 'grid' : 'grid',
              gap: 20,
              gridTemplateColumns: isMobile ? '1fr' : '220px minmax(0, 1fr)',
              alignItems: 'start',
            }}
          >
            {!isMobile ? (
              <NurseWorkspaceNav
                currentTab={currentTab}
                onTabChange={setCurrentTab}
                isMobile={false}
              />
            ) : null}

            <main
              style={{
                display: 'grid',
                gap: 20,
              }}
            >
              {renderCurrentTab()}
            </main>
          </div>
        )}
      </div>

      {isMobile ? (
        <div
          style={{
            position: 'fixed',
            left: 14,
            right: 14,
            bottom: 14,
            zIndex: 5,
          }}
        >
          <NurseWorkspaceNav
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            isMobile
          />
        </div>
      ) : null}
    </div>
  )
}
