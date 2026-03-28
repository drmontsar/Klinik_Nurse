export type PatientSex = 'M' | 'F'

export type PatientStatus = 'active' | 'discharged'

export interface Patient {
  id: string
  name: string
  age: number
  dateOfBirth: string
  sex: PatientSex
  bed: string
  ward: string
  diagnosis: string
  news2: number
  status: PatientStatus
  allergies: string[]
  lastNurseNote: string
}
