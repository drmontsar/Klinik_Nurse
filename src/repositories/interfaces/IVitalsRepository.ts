import type { Vitals } from '@/types/Vitals'

export interface IVitalsRepository {
  getByPatient(patientId: string): Promise<Vitals[]>
  getLatest(patientId: string): Promise<Vitals | null>
  save(vitals: Vitals): Promise<Vitals>
}
