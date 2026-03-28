export const VENDORS = {
  DATA_SOURCE: 'mock',
} as const

export const MOCK_MODE = true

export const STORAGE_KEYS = {
  NURSE_TASKS: 'klinik-nurse.tasks',
  VITALS: 'klinik-nurse.vitals',
  NURSE_NOTE_DRAFTS: 'klinik-nurse.note-drafts',
} as const

export const CLINICIAN_CONTEXT = {
  wardName: 'Surgical Oncology - Ward 3',
  clinicianId: 'nurse-anita',
  clinicianName: 'Sr. Anita',
} as const
