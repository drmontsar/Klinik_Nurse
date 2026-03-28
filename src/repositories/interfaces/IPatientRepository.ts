import type { Patient } from '@/types/Patient'

export interface IPatientRepository {
  getAll(): Promise<Patient[]>
  getById(id: string): Promise<Patient | null>
  updateNEWS2(id: string, score: number): Promise<void>
}
