import { VENDORS } from '@/constants/config'
import type { INurseTaskRepository } from '@/repositories/interfaces/INurseTaskRepository'
import type { IPatientRepository } from '@/repositories/interfaces/IPatientRepository'
import type { IVitalsRepository } from '@/repositories/interfaces/IVitalsRepository'
import { MockNurseTaskRepository } from '@/repositories/mock/MockNurseTaskRepository'
import { MockPatientRepository } from '@/repositories/mock/MockPatientRepository'
import { MockVitalsRepository } from '@/repositories/mock/MockVitalsRepository'

function getImplementation<MockImplementation>(
  MockRepository: new () => MockImplementation,
): MockImplementation {
  if (VENDORS.DATA_SOURCE !== 'mock') {
    throw new Error('Only mock data source is configured in this scaffold.')
  }

  return new MockRepository()
}

export const patientRepository: IPatientRepository = getImplementation(
  MockPatientRepository,
)

export const nurseTaskRepository: INurseTaskRepository = getImplementation(
  MockNurseTaskRepository,
)

export const vitalsRepository: IVitalsRepository = getImplementation(
  MockVitalsRepository,
)
