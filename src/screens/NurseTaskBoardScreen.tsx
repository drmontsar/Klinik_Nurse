import { NurseTaskCard } from '@/components/nurse/NurseTaskCard'
import { NurseTaskDetailPanel } from '@/components/nurse/NurseTaskDetailPanel'
import { NurseTaskFilters } from '@/components/nurse/NurseTaskFilters'
import { ErrorCard } from '@/components/shared/ErrorCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { COLORS } from '@/constants/colors'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useNurseTaskBoard } from '@/hooks/useNurseTaskBoard'

function metricCard(label: string, value: number, tone: string) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 16,
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div style={{ color: COLORS.textDim, marginBottom: 6 }}>{label}</div>
      <div style={{ color: tone, fontWeight: 800, fontSize: 24 }}>{value}</div>
    </div>
  )
}

export function NurseTaskBoardScreen() {
  const { isOnline } = useNetworkStatus()
  const {
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
  } = useNurseTaskBoard()

  const criticalCount = filteredTasks.filter(
    (task) => task.priority === 'critical',
  ).length
  const urgentCount = filteredTasks.filter(
    (task) => task.priority === 'urgent',
  ).length
  const openCount = filteredTasks.filter(
    (task) => task.status === 'pending' || task.status === 'in-progress',
  ).length

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(45,125,210,0.22), transparent 32%), #0A0E1A',
        color: COLORS.text,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: 24,
          display: 'grid',
          gap: 20,
        }}
      >
        <header
          style={{
            display: 'grid',
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                color: COLORS.brandLight,
                textTransform: 'uppercase',
                letterSpacing: 1.6,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Module 1.2
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(2rem, 4vw, 3.4rem)',
                lineHeight: 1,
              }}
            >
              Nurse Task Board
            </h1>
            <p
              style={{
                margin: '12px 0 0',
                color: COLORS.textMuted,
                maxWidth: 720,
                lineHeight: 1.6,
              }}
            >
              Structured bedside work generated from confirmed clinical actions.
              No transcripts, no ambiguous notes, and no silent failures.
            </p>
          </div>
          <OfflineBanner isOnline={isOnline} />
        </header>

        <div
          style={{
            display: 'grid',
            gap: 14,
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          {metricCard('Open tasks', openCount, COLORS.brandLight)}
          {metricCard('Critical', criticalCount, COLORS.red)}
          {metricCard('Urgent', urgentCount, COLORS.amber)}
          {metricCard('Visible tasks', filteredTasks.length, COLORS.green)}
        </div>

        <NurseTaskFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onCategoryChange={setCategoryFilter}
        />

        {notice ? (
          <div
            style={{
              borderRadius: 16,
              padding: 14,
              backgroundColor: COLORS.greenBg,
              border: `1px solid ${COLORS.green}`,
              color: COLORS.text,
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
              }}
            >
              Dismiss
            </button>
          </div>
        ) : null}

        {error ? <ErrorCard message={error} onRetry={() => {
          setError(null)
          void refresh()
        }} /> : null}

        {loading ? (
          <LoadingSpinner />
        ) : (
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
              {filteredTasks.length === 0 ? (
                <div
                  style={{
                    borderRadius: 24,
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: COLORS.surface,
                    padding: 24,
                    color: COLORS.textMuted,
                  }}
                >
                  No tasks match the current filters.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const patient = patientById[task.patientId]

                  if (!patient) {
                    return null
                  }

                  return (
                    <NurseTaskCard
                      key={task.id}
                      task={task}
                      patient={patient}
                      isSelected={selectedTask?.id === task.id}
                      onSelect={() => setSelectedTaskId(task.id)}
                    />
                  )
                })
              )}
            </section>

            <section style={{ flex: '1 1 520px', minWidth: 320 }}>
              <NurseTaskDetailPanel
                task={selectedTask}
                patient={
                  selectedTask ? patientById[selectedTask.patientId] ?? null : null
                }
                latestVitals={
                  selectedTask
                    ? latestVitalsByPatient[selectedTask.patientId] ?? null
                    : null
                }
                busy={busyTaskId === selectedTask?.id}
                onStartTask={startTask}
                onCompleteChecklistTask={completeChecklistTask}
                onRecordVitals={recordVitals}
                onAdministerMedication={administerMedication}
                onDeferTask={deferTask}
                onEscalateTask={escalateTask}
              />
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
