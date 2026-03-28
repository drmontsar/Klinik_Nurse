import type { Patient } from '@/types/Patient'

export const vikramSingh: Patient = {
  id: 'patient-005',
  name: 'Vikram Singh',
  age: 61,
  sex: 'M',
  bed: 'B-07',
  ward: 'Surgical Oncology - Ward 3',
  diagnosis: 'Gastric carcinoma - FLOT Cycle 2',
  news2: 3,
  status: 'active',
  allergies: ['Ondansetron causes severe constipation'],
  lastNurseNote:
    'Day 2 of chemotherapy. Nausea controlled after antiemetic schedule adjusted.',
}
