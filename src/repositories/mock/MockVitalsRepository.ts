import { STORAGE_KEYS } from '@/constants/config'
import type { IVitalsRepository } from '@/repositories/interfaces/IVitalsRepository'
import type { Vitals } from '@/types/Vitals'
import { delay } from '@/utils/delay'

function readVitalsFromStorage(): Vitals[] {
  if (typeof window === 'undefined') {
    return []
  }

  const rawVitals = window.localStorage.getItem(STORAGE_KEYS.VITALS)

  if (!rawVitals) {
    return []
  }

  try {
    return JSON.parse(rawVitals) as Vitals[]
  } catch {
    return []
  }
}

function writeVitalsToStorage(vitals: Vitals[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify(vitals))
}

export class MockVitalsRepository implements IVitalsRepository {
  private store: Vitals[] = readVitalsFromStorage()

  /**
   * Returns all structured vitals for a patient.
   * @param patientId - patient id
   * @returns vitals entries in reverse chronological order
   * @clinical-note structured vital histories support safe escalation and trend review
   */
  async getByPatient(patientId: string): Promise<Vitals[]> {
    await delay(120)
    return this.store
      .filter((vitals) => vitals.patientId === patientId)
      .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt))
  }

  /**
   * Returns the latest structured vitals for a patient.
   * @param patientId - patient id
   * @returns latest vitals entry or null
   * @clinical-note latest vitals are displayed on the nurse board for rapid recognition of deterioration
   */
  async getLatest(patientId: string): Promise<Vitals | null> {
    await delay(120)
    const latestVitals = this.store
      .filter((vitals) => vitals.patientId === patientId)
      .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt))[0]

    return latestVitals ?? null
  }

  /**
   * Persists a structured vitals entry locally for offline-first nurse workflows.
   * @param vitals - structured vitals entry
   * @returns the saved vitals entry
   * @clinical-note numeric-only vital storage prevents ambiguous bedside observations
   */
  async save(vitals: Vitals): Promise<Vitals> {
    await delay(160)
    this.store = [vitals, ...this.store]
    writeVitalsToStorage(this.store)
    return vitals
  }
}
