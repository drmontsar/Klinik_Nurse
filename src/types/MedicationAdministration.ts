export interface MedicationAdministration {
  taskId: string
  patientId: string
  medicationName: string
  dose: string
  route: string
  schedule: string
  administeredAt: string
  administeredBy: string
  confirmationChecked: boolean
  note: string
}
