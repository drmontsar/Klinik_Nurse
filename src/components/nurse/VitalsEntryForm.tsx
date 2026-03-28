import type { CSSProperties } from 'react'
import { useState } from 'react'
import { COLORS } from '@/constants/colors'
import { calculateNEWS2 } from '@/utils/calculateNEWS2'
import type { Vitals, VitalsDraft } from '@/types/Vitals'

interface VitalsEntryFormProps {
  busy: boolean
  latestVitals?: Vitals | null
  onSubmit: (draft: VitalsDraft) => Promise<void>
}

const emptyVitalsDraft: VitalsDraft = {
  temperature: null,
  heartRate: null,
  systolicBP: null,
  diastolicBP: null,
  spo2: null,
  respiratoryRate: null,
  consciousness: 'alert',
  onSupplementalOxygen: false,
  spO2Scale: 1,
}

const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: 12,
  border: `1px solid ${COLORS.border}`,
  backgroundColor: COLORS.card,
  color: COLORS.text,
  padding: '10px 12px',
  boxSizing: 'border-box',
  boxShadow: `0 8px 22px ${COLORS.shadow}`,
}

function parseNumericValue(value: string): number | null {
  if (value.trim().length === 0) {
    return null
  }

  const parsedValue = Number(value)

  // SAFETY: Vitals must remain numbers or null so bedside entries cannot silently become unsafe strings.
  if (Number.isNaN(parsedValue)) {
    return null
  }

  return parsedValue
}

function getVitalAlertMessage(
  field: keyof Pick<
    VitalsDraft,
    | 'temperature'
    | 'heartRate'
    | 'systolicBP'
    | 'diastolicBP'
    | 'spo2'
    | 'respiratoryRate'
  >,
  value: number | null,
): string | null {
  if (value === null) {
    return null
  }

  // SAFETY: These inline range cues surface potentially abnormal entries immediately so the nurse can recheck before moving on.
  switch (field) {
    case 'temperature':
      return value >= 38.5 || value <= 35 ? 'Recheck temperature' : null
    case 'heartRate':
      return value >= 120 || value <= 50 ? 'Recheck heart rate' : null
    case 'systolicBP':
      return value <= 90 || value >= 180 ? 'Recheck systolic BP' : null
    case 'diastolicBP':
      return value <= 50 || value >= 110 ? 'Review diastolic BP' : null
    case 'spo2':
      return value <= 93 ? 'Low saturation detected' : null
    case 'respiratoryRate':
      return value >= 24 || value <= 10 ? 'Recheck respiratory rate' : null
    default:
      return null
  }
}

export function VitalsEntryForm({
  busy,
  latestVitals = null,
  onSubmit,
}: VitalsEntryFormProps) {
  const [draft, setDraft] = useState<VitalsDraft>(emptyVitalsDraft)
  const assessment = calculateNEWS2(draft)

  function useLastVitals(): void {
    if (!latestVitals) {
      return
    }

    setDraft({
      temperature: latestVitals.temperature,
      heartRate: latestVitals.heartRate,
      systolicBP: latestVitals.systolicBP,
      diastolicBP: latestVitals.diastolicBP,
      spo2: latestVitals.spo2,
      respiratoryRate: latestVitals.respiratoryRate,
      consciousness: latestVitals.consciousness,
      onSupplementalOxygen: latestVitals.onSupplementalOxygen,
      spO2Scale: latestVitals.spO2Scale,
    })
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <button
          disabled={!latestVitals}
          onClick={useLastVitals}
          style={{
            border: 0,
            borderRadius: 14,
            padding: '10px 14px',
            backgroundColor: latestVitals ? COLORS.brandBg : COLORS.border,
            color: latestVitals ? COLORS.brand : COLORS.textMuted,
            fontWeight: 700,
            cursor: latestVitals ? 'pointer' : 'not-allowed',
          }}
        >
          Same as last visit
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        }}
      >
        <label style={{ color: COLORS.textMuted }}>
          Temperature (°C)
          <input
            style={inputStyle}
            type="number"
            inputMode="decimal"
            step="0.1"
            value={draft.temperature ?? ''}
            onChange={(event) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                temperature: parseNumericValue(event.target.value),
              }))
            }
          />
          {getVitalAlertMessage('temperature', draft.temperature) ? (
            <div style={{ color: COLORS.red, fontSize: 12, marginTop: 6 }}>
              {getVitalAlertMessage('temperature', draft.temperature)}
            </div>
          ) : null}
        </label>
        <label style={{ color: COLORS.textMuted }}>
          Heart Rate (bpm)
          <input
            style={inputStyle}
            type="number"
            inputMode="numeric"
            value={draft.heartRate ?? ''}
            onChange={(event) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                heartRate: parseNumericValue(event.target.value),
              }))
            }
          />
          {getVitalAlertMessage('heartRate', draft.heartRate) ? (
            <div style={{ color: COLORS.red, fontSize: 12, marginTop: 6 }}>
              {getVitalAlertMessage('heartRate', draft.heartRate)}
            </div>
          ) : null}
        </label>
        <label style={{ color: COLORS.textMuted }}>
          Systolic BP (mmHg)
          <input
            style={inputStyle}
            type="number"
            inputMode="numeric"
            value={draft.systolicBP ?? ''}
            onChange={(event) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                systolicBP: parseNumericValue(event.target.value),
              }))
            }
          />
          {getVitalAlertMessage('systolicBP', draft.systolicBP) ? (
            <div style={{ color: COLORS.red, fontSize: 12, marginTop: 6 }}>
              {getVitalAlertMessage('systolicBP', draft.systolicBP)}
            </div>
          ) : null}
        </label>
        <label style={{ color: COLORS.textMuted }}>
          Diastolic BP (mmHg)
          <input
            style={inputStyle}
            type="number"
            inputMode="numeric"
            value={draft.diastolicBP ?? ''}
            onChange={(event) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                diastolicBP: parseNumericValue(event.target.value),
              }))
            }
          />
          {getVitalAlertMessage('diastolicBP', draft.diastolicBP) ? (
            <div style={{ color: COLORS.red, fontSize: 12, marginTop: 6 }}>
              {getVitalAlertMessage('diastolicBP', draft.diastolicBP)}
            </div>
          ) : null}
        </label>
        <label style={{ color: COLORS.textMuted }}>
          SpO2 (%)
          <input
            style={inputStyle}
            type="number"
            inputMode="numeric"
            value={draft.spo2 ?? ''}
            onChange={(event) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                spo2: parseNumericValue(event.target.value),
              }))
            }
          />
          {getVitalAlertMessage('spo2', draft.spo2) ? (
            <div style={{ color: COLORS.red, fontSize: 12, marginTop: 6 }}>
              {getVitalAlertMessage('spo2', draft.spo2)}
            </div>
          ) : null}
        </label>
        <label style={{ color: COLORS.textMuted }}>
          Respiratory Rate (/min)
          <input
            style={inputStyle}
            type="number"
            inputMode="numeric"
            value={draft.respiratoryRate ?? ''}
            onChange={(event) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                respiratoryRate: parseNumericValue(event.target.value),
              }))
            }
          />
          {getVitalAlertMessage(
            'respiratoryRate',
            draft.respiratoryRate,
          ) ? (
            <div style={{ color: COLORS.red, fontSize: 12, marginTop: 6 }}>
              {getVitalAlertMessage(
                'respiratoryRate',
                draft.respiratoryRate,
              )}
            </div>
          ) : null}
        </label>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        }}
      >
        <label style={{ color: COLORS.textMuted }}>
          Consciousness
          <select
            style={inputStyle}
            value={draft.consciousness ?? 'alert'}
            onChange={(event) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                consciousness: event.target.value as VitalsDraft['consciousness'],
              }))
            }
          >
            <option value="alert">Alert</option>
            <option value="confusion">Confusion</option>
            <option value="voice">Voice</option>
            <option value="pain">Pain</option>
            <option value="unresponsive">Unresponsive</option>
          </select>
        </label>

        <label style={{ color: COLORS.textMuted }}>
          SpO2 Scale
          <select
            style={inputStyle}
            value={draft.spO2Scale ?? 1}
            onChange={(event) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                spO2Scale: Number(event.target.value) as 1 | 2,
              }))
            }
          >
            <option value={1}>Scale 1</option>
            <option value={2}>Scale 2</option>
          </select>
        </label>

        <label style={{ color: COLORS.textMuted }}>
          Supplemental Oxygen
          <select
            style={inputStyle}
            value={draft.onSupplementalOxygen ? 'yes' : 'no'}
            onChange={(event) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                onSupplementalOxygen: event.target.value === 'yes',
              }))
            }
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </label>
      </div>

      <div
        style={{
          borderRadius: 16,
          padding: 14,
          backgroundColor:
            assessment.risk === 'high'
              ? COLORS.redBg
              : assessment.risk === 'medium'
                ? COLORS.amberBg
                : COLORS.bg,
          border: `1px solid ${
            assessment.risk === 'high'
              ? COLORS.red
              : assessment.risk === 'medium'
                ? COLORS.amber
                : COLORS.border
          }`,
          color: COLORS.text,
          boxShadow: `0 14px 30px ${COLORS.shadow}`,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>NEWS2 preview</div>
        <div style={{ color: COLORS.textMuted, lineHeight: 1.5 }}>
          {assessment.isComplete && assessment.score !== null
            ? `Score ${assessment.score} · ${assessment.risk} risk`
            : `NEWS2 incomplete - missing: ${assessment.missingParameters.join(', ')}`}
        </div>
      </div>

      <button
        disabled={busy || !assessment.isComplete}
        onClick={() => void onSubmit(draft)}
        style={{
          border: 0,
          borderRadius: 14,
          padding: '12px 14px',
          backgroundColor:
            busy || !assessment.isComplete ? COLORS.border : COLORS.brand,
          color: COLORS.onTone,
          fontWeight: 700,
          cursor: busy || !assessment.isComplete ? 'not-allowed' : 'pointer',
          boxShadow:
            busy || !assessment.isComplete
              ? 'none'
              : `0 12px 28px ${COLORS.shadowStrong}`,
        }}
      >
        {busy ? 'Saving vitals...' : 'Save vitals and complete task'}
      </button>
    </div>
  )
}
