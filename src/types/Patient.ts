export type PatientSex = 'M' | 'F' | 'Unknown'

export type PatientStatus = 'active' | 'discharged'

export interface Patient {
  id: string
  name: string
  age: number
  dateOfBirth: string
  sex: PatientSex
  /** Bed/location identifier. Null when not available from the API. */
  bed: string | null
  /** Patient MRN (medical record number), distinct from bed. */
  mrn: string | null
  ward: string
  diagnosis: string
  news2: number
  status: PatientStatus
  allergies: string[]
  lastNurseNote: string
}
