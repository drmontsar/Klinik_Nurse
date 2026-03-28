import type { Patient } from '@/types/Patient'
import { anitaDesai } from '@/data/patients/anitaDesai'
import { arunPatel } from '@/data/patients/arunPatel'
import { lakshmiNair } from '@/data/patients/lakshmiNair'
import { mohammedIsmail } from '@/data/patients/mohammedIsmail'
import { priyaSharma } from '@/data/patients/priyaSharma'
import { rajeshKumar } from '@/data/patients/rajeshKumar'
import { sunitaRao } from '@/data/patients/sunitaRao'
import { vikramSingh } from '@/data/patients/vikramSingh'

export const patients: Patient[] = [
  rajeshKumar,
  priyaSharma,
  arunPatel,
  mohammedIsmail,
  vikramSingh,
  anitaDesai,
  sunitaRao,
  lakshmiNair,
]

export {
  anitaDesai,
  arunPatel,
  lakshmiNair,
  mohammedIsmail,
  priyaSharma,
  rajeshKumar,
  sunitaRao,
  vikramSingh,
}
