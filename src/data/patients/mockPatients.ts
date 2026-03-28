import type { Patient } from '@/types/Patient'

/**
 * Consolidated nurse-module patient seed data.
 * This stays behind the repository layer so moving to a real database later
 * only changes the repository implementation, not the screen or hook logic.
 */
export const mockPatients: Patient[] = [
  {
    id: 'patient-001',
    name: 'Rajesh Kumar',
    age: 67,
    dateOfBirth: '1958-07-16',
    sex: 'M',
    bed: 'B-04',
    ward: 'Surgical Oncology - Ward 3',
    diagnosis: 'Carcinoma head of pancreas - post-Whipple Day 1',
    news2: 8,
    status: 'active',
    allergies: ['No known drug allergies'],
    lastNurseNote:
      'Patient restless overnight. Pain poorly controlled despite PCA. Drain output now bile-stained.',
  },
  {
    id: 'patient-002',
    name: 'Priya Sharma',
    age: 58,
    dateOfBirth: '1967-11-03',
    sex: 'F',
    bed: 'C-08',
    ward: 'Surgical Oncology - Ward 3',
    diagnosis: 'Post-hemicolectomy Day 2',
    news2: 6,
    status: 'active',
    allergies: ['Penicillin'],
    lastNurseNote:
      'Urine output borderline overnight at 28 ml/hr. Mild fever persists. Family updated at 05:30.',
  },
  {
    id: 'patient-008',
    name: 'Arun Patel',
    age: 78,
    dateOfBirth: '1947-02-11',
    sex: 'M',
    bed: 'B-01',
    ward: 'Surgical Oncology - Ward 3',
    diagnosis: 'Post-gastrectomy Day 3 - ICU stepdown',
    news2: 5,
    status: 'active',
    allergies: ['No known drug allergies'],
    lastNurseNote:
      'ICU stepdown overnight. Sundowning risk noted. Family requests frequent orientation updates.',
  },
  {
    id: 'patient-003',
    name: 'Mohammed Ismail',
    age: 72,
    dateOfBirth: '1953-09-24',
    sex: 'M',
    bed: 'A-02',
    ward: 'Surgical Oncology - Ward 3',
    diagnosis: 'Oesophageal carcinoma - pre-op optimisation',
    news2: 4,
    status: 'active',
    allergies: ['No known drug allergies'],
    lastNurseNote:
      'Taking sips slowly. Nutrition review pending. Awaiting PET-CT slot confirmation.',
  },
  {
    id: 'patient-005',
    name: 'Vikram Singh',
    age: 61,
    dateOfBirth: '1964-01-09',
    sex: 'M',
    bed: 'B-07',
    ward: 'Surgical Oncology - Ward 3',
    diagnosis: 'Gastric carcinoma - FLOT Cycle 2',
    news2: 3,
    status: 'active',
    allergies: ['Ondansetron causes severe constipation'],
    lastNurseNote:
      'Day 2 of chemotherapy. Nausea controlled after antiemetic schedule adjusted.',
  },
  {
    id: 'patient-004',
    name: 'Anita Desai',
    age: 45,
    dateOfBirth: '1980-04-18',
    sex: 'F',
    bed: 'D-11',
    ward: 'Surgical Oncology - Ward 3',
    diagnosis: 'Post-mastectomy Day 3',
    news2: 2,
    status: 'active',
    allergies: ['Latex'],
    lastNurseNote:
      'Mobilising with assistance. Drain output reducing steadily. Pain controlled on oral medication.',
  },
  {
    id: 'patient-006',
    name: 'Sunita Rao',
    age: 54,
    dateOfBirth: '1971-06-27',
    sex: 'F',
    bed: 'C-12',
    ward: 'Surgical Oncology - Ward 3',
    diagnosis: 'Post-anterior resection Day 5',
    news2: 1,
    status: 'active',
    allergies: ['No known drug allergies'],
    lastNurseNote:
      'First stoma output noted. Patient anxious about stoma care and asks for repeat teaching.',
  },
  {
    id: 'patient-007',
    name: 'Lakshmi Nair',
    age: 49,
    dateOfBirth: '1976-08-30',
    sex: 'F',
    bed: 'A-09',
    ward: 'Surgical Oncology - Ward 3',
    diagnosis: 'Post-thyroidectomy Day 7',
    news2: 0,
    status: 'active',
    allergies: ['No known drug allergies'],
    lastNurseNote:
      'Calcium stable. Awaiting final discharge counselling and medication handover.',
  },
]
