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
          'radial-gradient(circle at top left, rgba(107,148,135,0.18), transparent 34%), linear-gradient(180deg, #F9FCFA 0%, #EEF4F0 46%, #F7FAF8 100%)',
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
            padding: 28,
            borderRadius: 30,
            border: `1px solid ${COLORS.border}`,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.86), rgba(229,240,235,0.96))',
            boxShadow: `0 24px 54px ${COLORS.shadow}`,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                marginBottom: 10,
                paddingBottom: 4,
                fontSize: 'clamp(2.5rem, 6vw, 4.8rem)',
                lineHeight: 0.95,
                fontFamily: '"Newsreader", Georgia, serif',
                fontWeight: 600,
                letterSpacing: '-0.05em',
                background:
                  'linear-gradient(135deg, #FBFDFF 0%, #DDECF8 24%, #AFCBE4 52%, #7FA6C7 78%, #5E84A6 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 8px 26px rgba(111, 145, 176, 0.16)',
              }}
            >
              Klinik-N
            </div>
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
                    boxShadow: `0 18px 44px ${COLORS.shadow}`,
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
