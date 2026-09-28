import { VENDORS } from '@/constants/config'
import type { INurseTaskRepository } from '@/repositories/interfaces/INurseTaskRepository'
import type { IPatientRepository } from '@/repositories/interfaces/IPatientRepository'
import type { IVitalsRepository } from '@/repositories/interfaces/IVitalsRepository'
import { MockNurseTaskRepository } from '@/repositories/mock/MockNurseTaskRepository'
import { MockPatientRepository } from '@/repositories/mock/MockPatientRepository'
import { MockVitalsRepository } from '@/repositories/mock/MockVitalsRepository'
import { ApiNurseTaskRepository, ApiPatientRepository, ApiVitalsRepository } from '@/repositories/api/ApiRepositories'

function getImplementation<MockImplementation, ApiImplementation>(
  MockRepository: new () => MockImplementation,
  ApiRepository: new () => ApiImplementation,
): MockImplementation | ApiImplementation {
  return VENDORS.DATA_SOURCE === 'api' ? new ApiRepository() : new MockRepository()
}

export const patientRepository = getImplementation(
  MockPatientRepository,
  ApiPatientRepository,
)

export const nurseTaskRepository = getImplementation(
  MockNurseTaskRepository,
  ApiNurseTaskRepository,
)

export const vitalsRepository = getImplementation(
  MockVitalsRepository,
  ApiVitalsRepository,
)
