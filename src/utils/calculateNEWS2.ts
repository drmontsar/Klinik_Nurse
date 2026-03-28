import { NEWS2_THRESHOLDS } from '@/constants/news2Thresholds'
import type { Consciousness, NEWS2Assessment, VitalsDraft } from '@/types/Vitals'

function getRespiratoryRateScore(respiratoryRate: number): number {
  if (respiratoryRate <= NEWS2_THRESHOLDS.RESPIRATORY_RATE.THREE_LOW) {
    return 3
  }

  if (respiratoryRate <= NEWS2_THRESHOLDS.RESPIRATORY_RATE.ONE_LOW) {
    return 1
  }

  if (respiratoryRate <= NEWS2_THRESHOLDS.RESPIRATORY_RATE.ZERO_HIGH) {
    return 0
  }

  if (respiratoryRate <= NEWS2_THRESHOLDS.RESPIRATORY_RATE.TWO_HIGH) {
    return 2
  }

  return 3
}

function getSpo2ScaleOneScore(spo2: number): number {
  if (spo2 <= NEWS2_THRESHOLDS.SPO2_SCALE_1.THREE_LOW) {
    return 3
  }

  if (spo2 <= NEWS2_THRESHOLDS.SPO2_SCALE_1.TWO_LOW) {
    return 2
  }

  if (spo2 <= NEWS2_THRESHOLDS.SPO2_SCALE_1.ONE_LOW) {
    return 1
  }

  return 0
}

function getSpo2ScaleTwoScore(spo2: number): number {
  if (spo2 <= NEWS2_THRESHOLDS.SPO2_SCALE_2.THREE_LOW) {
    return 3
  }

  if (spo2 <= NEWS2_THRESHOLDS.SPO2_SCALE_2.TWO_LOW) {
    return 2
  }

  if (spo2 <= NEWS2_THRESHOLDS.SPO2_SCALE_2.ONE_LOW) {
    return 1
  }

  if (spo2 <= NEWS2_THRESHOLDS.SPO2_SCALE_2.ZERO_HIGH) {
    return 0
  }

  if (spo2 <= NEWS2_THRESHOLDS.SPO2_SCALE_2.ONE_HIGH) {
    return 1
  }

  if (spo2 <= NEWS2_THRESHOLDS.SPO2_SCALE_2.TWO_HIGH) {
    return 2
  }

  return 3
}

function getSystolicBpScore(systolicBP: number): number {
  if (systolicBP <= NEWS2_THRESHOLDS.SYSTOLIC_BP.THREE_LOW) {
    return 3
  }

  if (systolicBP <= NEWS2_THRESHOLDS.SYSTOLIC_BP.TWO_LOW) {
    return 2
  }

  if (systolicBP <= NEWS2_THRESHOLDS.SYSTOLIC_BP.ONE_LOW) {
    return 1
  }

  if (systolicBP <= NEWS2_THRESHOLDS.SYSTOLIC_BP.ZERO_HIGH) {
    return 0
  }

  return 3
}

function getHeartRateScore(heartRate: number): number {
  if (heartRate <= NEWS2_THRESHOLDS.HEART_RATE.THREE_LOW) {
    return 3
  }

  if (heartRate <= NEWS2_THRESHOLDS.HEART_RATE.ONE_LOW) {
    return 1
  }

  if (heartRate <= NEWS2_THRESHOLDS.HEART_RATE.ZERO_HIGH) {
    return 0
  }

  if (heartRate <= NEWS2_THRESHOLDS.HEART_RATE.ONE_HIGH) {
    return 1
  }

  if (heartRate <= NEWS2_THRESHOLDS.HEART_RATE.TWO_HIGH) {
    return 2
  }

  return 3
}

function getTemperatureScore(temperature: number): number {
  if (temperature <= NEWS2_THRESHOLDS.TEMPERATURE.THREE_LOW) {
    return 3
  }

  if (temperature <= NEWS2_THRESHOLDS.TEMPERATURE.ONE_LOW) {
    return 1
  }

  if (temperature <= NEWS2_THRESHOLDS.TEMPERATURE.ZERO_HIGH) {
    return 0
  }

  if (temperature <= NEWS2_THRESHOLDS.TEMPERATURE.ONE_HIGH) {
    return 1
  }

  return 2
}

function getConsciousnessScore(consciousness: Consciousness): number {
  return consciousness === 'alert' ? 0 : 3
}

/**
 * Calculates NEWS2 using the mandated Royal College of Physicians thresholds.
 * @param vitals - the structured vitals draft from nurse entry
 * @returns a NEWS2 assessment that never pretends partial vitals are complete
 * @clinical-note NEWS2 drives escalation pathways, so incomplete observations must remain visibly incomplete
 */
export function calculateNEWS2(vitals: VitalsDraft): NEWS2Assessment {
  const missingParameters: string[] = []

  if (vitals.temperature === null) {
    missingParameters.push('temperature')
  }

  if (vitals.heartRate === null) {
    missingParameters.push('heartRate')
  }

  if (vitals.systolicBP === null) {
    missingParameters.push('systolicBP')
  }

  if (vitals.spo2 === null) {
    missingParameters.push('spo2')
  }

  if (vitals.respiratoryRate === null) {
    missingParameters.push('respiratoryRate')
  }

  if (vitals.consciousness === null) {
    missingParameters.push('consciousness')
  }

  if (vitals.onSupplementalOxygen === null) {
    missingParameters.push('supplementalOxygen')
  }

  if (vitals.spO2Scale === null) {
    missingParameters.push('spO2Scale')
  }

  // SAFETY: A partial NEWS2 that looks final is clinically unsafe, so the score stays null when required observations are missing.
  if (missingParameters.length > 0) {
    return {
      score: null,
      isComplete: false,
      missingParameters,
      risk: null,
    }
  }

  const temperature = vitals.temperature as number
  const heartRate = vitals.heartRate as number
  const systolicBP = vitals.systolicBP as number
  const spo2 = vitals.spo2 as number
  const respiratoryRate = vitals.respiratoryRate as number
  const consciousness = vitals.consciousness as Consciousness
  const onSupplementalOxygen = vitals.onSupplementalOxygen as boolean
  const spO2Scale = vitals.spO2Scale as 1 | 2

  const respiratoryRateScore = getRespiratoryRateScore(respiratoryRate)
  const oxygenScore =
    spO2Scale === 2 ? getSpo2ScaleTwoScore(spo2) : getSpo2ScaleOneScore(spo2)
  const systolicBpScore = getSystolicBpScore(systolicBP)
  const heartRateScore = getHeartRateScore(heartRate)
  const temperatureScore = getTemperatureScore(temperature)
  const consciousnessScore = getConsciousnessScore(consciousness)
  const supplementalOxygenScore = onSupplementalOxygen ? 2 : 0

  const parameterScores = [
    respiratoryRateScore,
    oxygenScore,
    systolicBpScore,
    heartRateScore,
    temperatureScore,
    consciousnessScore,
  ]

  const score =
    respiratoryRateScore +
    oxygenScore +
    systolicBpScore +
    heartRateScore +
    temperatureScore +
    consciousnessScore +
    supplementalOxygenScore

  const hasSingleParameterThree = parameterScores.some(
    (parameterScore) => parameterScore === 3,
  )

  if (score >= NEWS2_THRESHOLDS.HIGH_RISK) {
    return { score, isComplete: true, missingParameters: [], risk: 'high' }
  }

  if (score >= NEWS2_THRESHOLDS.MEDIUM_RISK) {
    return { score, isComplete: true, missingParameters: [], risk: 'medium' }
  }

  if (hasSingleParameterThree) {
    return {
      score,
      isComplete: true,
      missingParameters: [],
      risk: 'low-medium',
    }
  }

  return { score, isComplete: true, missingParameters: [], risk: 'low' }
}
