# Module: Nurse Task Board

## Goal

The nurse task board is the nurse-facing execution module for bedside work. It is designed to show only actionable, structured tasks and make execution traceable.

## User Experience Intent

The board should let a ward nurse:

- quickly see which patient needs action first
- filter work by status and task category
- open a task and act without navigating through multiple screens
- record vitals safely
- confirm medication administration explicitly
- defer or escalate when bedside execution is unsafe or blocked
- work inside a calm, low-stimulation visual system that preserves clarity without broadcasting panic

## Current Screen Structure

### Main Screen

File: `src/screens/NurseTaskBoardScreen.tsx`

Responsibilities:

- render the `Klinik-N` nurse-facing product header and status metrics
- show online/offline state
- render filters
- render task list
- render detail panel for the selected task

### Task List

Files:

- `src/components/nurse/NurseTaskFilters.tsx`
- `src/components/nurse/NurseTaskCard.tsx`

Responsibilities:

- search by patient, bed, or task text
- filter by status
- filter by category
- show patient name, bed, NEWS2, priority, due time, and task status

### Task Detail

File: `src/components/nurse/NurseTaskDetailPanel.tsx`

Responsibilities:

- show patient context
- show latest known vitals summary when present
- expose task-specific actions
- show task audit trail

### Task-Specific Forms

Files:

- `src/components/nurse/VitalsEntryForm.tsx`
- `src/components/nurse/MedicationAdministrationForm.tsx`

Responsibilities:

- `VitalsEntryForm` captures structured vitals and previews NEWS2
- `MedicationAdministrationForm` enforces explicit bedside confirmation

## Logic Owner

The module logic lives in `src/hooks/useNurseTaskBoard.ts`.

This hook currently owns:

- initial board loading
- filters and selected task state
- error and success notice state
- task status actions
- vitals save flow
- medication confirmation flow
- board refresh after each action

## Current Task Model

Task data is typed in `src/types/NurseTask.ts`.

Current task categories:

- `vitals`
- `medication`
- `nursing`
- `investigation-followup`

Current task statuses:

- `pending`
- `in-progress`
- `completed`
- `deferred`
- `escalated`

Every task also carries:

- `patientId`
- `priority`
- `sourceEventType`
- `sourceEventId`
- `auditTrail`

The source-event fields are important because the final product direction is event-driven even though the current slice is still mock-seeded.

## Current Persistence Behavior

- Nurse tasks are seeded from `src/data/nurseTasks/mockNurseTasks.ts`
- Task actions are written to browser `localStorage`
- Vitals are written to browser `localStorage`
- Patients are seeded from `src/data/patients/mockPatients.ts`

This means local interaction survives refresh in the current scaffold.

## Current Clinical Logic

### Vitals

- The vitals form stores numeric-or-null values.
- NEWS2 preview updates from the form state.
- The user cannot complete the vitals task unless the required NEWS2 fields are present.

### Product Framing

- The header now leads with the product name `Klinik-N` rather than a module code banner.
- The brand treatment uses softer blue-white gradients to feel professional, friendly, and nurse-centered.

### Medication

- Administration requires a positive confirmation checkbox.
- The task cannot be completed without that confirmation.

### Audit

- Start, complete, defer, and escalate all append audit entries.
- The current implementation updates task status directly and preserves a simple audit timeline.

## What Needs To Be Built Next

- Generate tasks from confirmed SOAP notes and orders instead of static mock tasks
- Add role/auth context
- Add sync semantics for offline changes
- Add tests around NEWS2, medication safety, and task state transitions
- Split very large files as the module grows

## Documentation Maintenance

Update this document whenever:

- a new task category is added
- task state rules change
- new nurse actions are introduced
- the detail panel behavior changes
- the nurse workflow changes from mock-seeded to event-generated
