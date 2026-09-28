import { isDevMode } from '@angular/core';

export const VENDORS = {
  DATA_SOURCE: isDevMode() && new URLSearchParams(location.search).get('demo') === '1'
    ? 'mock'
    : 'api' as 'mock' | 'api',
} as const

export const MOCK_MODE = VENDORS.DATA_SOURCE === 'mock'

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
