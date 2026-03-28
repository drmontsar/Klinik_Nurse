# Module: Nurse Task Board

## Goal

The nurse task board is the nurse-facing execution module for bedside work. It is designed to show only actionable, structured tasks and make execution traceable.

## User Experience Intent

The board should let a ward nurse:

- land on the queue first and immediately see who needs attention
- filter work by status and task category
- open a task and act without navigating through multiple screens
- keep the active patient context visible while moving between tabs
- record vitals safely
- confirm medication administration explicitly
- draft quick nursing notes that autosave through interruptions
- defer or escalate when bedside execution is unsafe or blocked
- work inside a calm, low-stimulation visual system that preserves clarity without broadcasting panic

## Current Screen Structure

### Main Screen

File: `src/screens/NurseTaskBoardScreen.tsx`

Responsibilities:

- render the `Klinik-N` nurse-facing product header and status metrics
- keep the queue as the default home surface
- show online/offline state through a compact top-right status signal
- render a bottom tab bar on mobile and a left workspace rail on desktop
- keep a persistent selected-patient context bar visible when a patient is active
- render queue, task, vitals, notes, and patient-roster workspaces

### Queue And Navigation

Files:

- `src/components/nurse/NurseWorkspaceNav.tsx`
- `src/components/nurse/QueuePanel.tsx`
- `src/components/nurse/PatientContextBar.tsx`
- `src/components/nurse/NurseTaskFilters.tsx`

Responsibilities:

- make the nurse queue the default home screen
- expose large tap targets for `Call next`, `Record vitals`, and `Open tasks`
- keep search available in patient-first screens without crowding them with task-only filters
- preserve patient identity and NEWS2 context across workspace tabs

### Task List

Files:

- `src/components/nurse/NurseTaskCard.tsx`
- `src/components/nurse/PatientRosterPanel.tsx`

Responsibilities:

- search by patient, bed, or task text
- filter by status and category inside task-centric tabs
- show patient name, bed, NEWS2, priority, due time, and task status
- let the nurse open a task quickly by clicking directly on the task card
- keep the ward roster as a lower-priority reference section below the active task workspace

### Task Detail

File: `src/components/nurse/NurseTaskDetailPanel.tsx`

Responsibilities:

- show patient context
- show latest known vitals summary when present
- expose task-specific actions
- show task audit trail

### Task-Specific Forms

Files:

- `src/components/nurse/NotesPanel.tsx`
- `src/components/nurse/VitalsEntryForm.tsx`
- `src/components/nurse/MedicationAdministrationForm.tsx`

Responsibilities:

- `NotesPanel` provides quick templates and autosaves note drafts locally by patient
- `VitalsEntryForm` captures structured vitals and previews NEWS2
- `VitalsEntryForm` uses numeric-friendly inputs, inline recheck alerts, and a `Same as last visit` shortcut
- `MedicationAdministrationForm` enforces explicit bedside confirmation

## Logic Owner

The module logic lives in `src/hooks/useNurseTaskBoard.ts`.

This hook currently owns:

- initial board loading
- workspace tab state
- filters plus selected patient and task state
- nurse note draft autosave state
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
- Nurse note drafts are written to browser `localStorage`

This means local interaction survives refresh in the current scaffold.

## Current Clinical Logic

### Vitals

- The vitals form stores numeric-or-null values.
- NEWS2 preview updates from the form state.
- The user cannot complete the vitals task unless the required NEWS2 fields are present.

### Product Framing

- The header now leads with the product name `Klinik-N` rather than a module code banner.
- The brand treatment uses softer blue-white gradients to feel professional, friendly, and nurse-centered.
- The connection status now sits quietly in the top-right corner as a compact signal instead of occupying primary visual space.
- The queue is the default workflow surface, while the patient roster is intentionally kept after task work so active execution stays primary.

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
