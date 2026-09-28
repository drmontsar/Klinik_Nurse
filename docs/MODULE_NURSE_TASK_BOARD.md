# Nurse task board

## Workspace

Queue and Patients show the ward roster and selected patient context. Patient actions open Tasks, Record vitals, or Notes. Task filters support search, status, and category. Handover opens the embedded shift feature.

## Bedside actions

- Medication displays the confirmed order and requires the unchecked patient/drug/dose/route/timing confirmation before administration.
- Observation forms accept numbers or unrecorded nulls, show NEWS2 completeness and missing parameters, and send a structured observation command.
- Start, defer, and escalate use the repository task-transition API. Reasons are required for defer/escalate. Unsupported generic completion is rejected rather than inventing a successful clinical record.
- Notes are patient-specific unsigned device drafts with quick text templates and a visible device save timestamp.

## Sources of truth

The platform is authoritative in normal mode. Writes include command UUIDs and expected task versions. The UI refreshes after server acceptance and exposes failures.

Explicit `?demo=1` uses the retained mock repositories and localStorage keys. It is visibly synthetic and is never selected because an API request failed.

## Offline behavior

A failed network write with a command ID is saved in the existing Dexie queue and described as awaiting sync, not server-completed. Reconnection replays under the matching identity and organization. Conflicts and permission failures stay visible in the review count.

## Code map

- `src/app.component.ts/html`: Angular screen and forms.
- `src/repositories/api/ApiRepositories.ts`: real task/vitals command mapping.
- `src/repositories/mock/`: synthetic demo data and persistence.
- `src/services/platformSession.ts`, `offlineQueue.ts`: authenticated transport and replay.
- `src/utils/calculateNEWS2.ts`: preview of incomplete/complete observations.

Missing measurements never receive normal values automatically. Clinical attribution and final NEWS2 are computed and validated by the server.
