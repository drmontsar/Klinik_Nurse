import type { Patient } from '@/types/Patient'

export const arunPatel: Patient = {
  id: 'patient-008',
  name: 'Arun Patel',
  age: 78,
  sex: 'M',
  bed: 'B-01',
  ward: 'Surgical Oncology - Ward 3',
  diagnosis: 'Post-gastrectomy Day 3 - ICU stepdown',
  news2: 5,
  status: 'active',
  allergies: ['No known drug allergies'],
  lastNurseNote:
    'ICU stepdown overnight. Sundowning risk noted. Family requests frequent orientation updates.',
}
