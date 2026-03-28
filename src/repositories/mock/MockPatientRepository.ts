import { patients } from '@/data/patients'
import type { IPatientRepository } from '@/repositories/interfaces/IPatientRepository'
import type { Patient } from '@/types/Patient'
import { delay } from '@/utils/delay'

export class MockPatientRepository implements IPatientRepository {
  private store = new Map<string, Patient>(
    patients.map((patient) => [patient.id, { ...patient }]),
  )

  /**
   * Returns all active patients for the nurse task board.
   * @returns the current patient list
   * @clinical-note nurses must see a structured patient roster, not free-text references
   */
  async getAll(): Promise<Patient[]> {
    await delay()
    return Array.from(this.store.values()).sort((left, right) => right.news2 - left.news2)
  }

  /**
   * Finds a patient by identifier.
   * @param id - patient id
   * @returns the patient or null when not found
   * @clinical-note patient lookups must stay deterministic to avoid wrong-patient actions
   */
  async getById(id: string): Promise<Patient | null> {
    await delay(120)
    return this.store.get(id) ?? null
  }

  /**
   * Updates the stored NEWS2 score after a structured vitals entry.
   * @param id - patient id
   * @param score - full NEWS2 score
   * @returns nothing
   * @clinical-note NEWS2 updates affect nurse prioritisation and escalation visibility
   */
  async updateNEWS2(id: string, score: number): Promise<void> {
    await delay(120)
    const patient = this.store.get(id)

    if (!patient) {
      throw new Error(`Patient ${id} not found`)
    }

    this.store.set(id, { ...patient, news2: score })
  }
}
