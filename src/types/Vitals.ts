export type Consciousness =
  | 'alert'
  | 'confusion'
  | 'voice'
  | 'pain'
  | 'unresponsive'

export type VitalField =
  | 'temperature'
  | 'heartRate'
  | 'systolicBP'
  | 'diastolicBP'
  | 'spo2'
  | 'respiratoryRate'

export interface Vitals {
  id: string
  patientId: string
  recordedAt: string
  recordedBy: string
  temperature: number | null
  heartRate: number | null
  systolicBP: number | null
  diastolicBP: number | null
  spo2: number | null
  respiratoryRate: number | null
  consciousness: Consciousness | null
  onSupplementalOxygen: boolean | null
  spO2Scale: 1 | 2 | null
  news2Score: number | null
  news2Risk: 'low' | 'low-medium' | 'medium' | 'high' | null
  isComplete: boolean
  missingParameters: string[]
}

export interface NEWS2Assessment {
  score: number | null
  isComplete: boolean
  missingParameters: string[]
  risk: 'low' | 'low-medium' | 'medium' | 'high' | null
}

export interface VitalsDraft {
  temperature: number | null
  heartRate: number | null
  systolicBP: number | null
  diastolicBP: number | null
  spo2: number | null
  respiratoryRate: number | null
  consciousness: Consciousness | null
  onSupplementalOxygen: boolean | null
  spO2Scale: 1 | 2 | null
}
