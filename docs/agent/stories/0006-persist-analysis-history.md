# Story: Persist Analysis History per User

**Slug:** `0006-persist-analysis-history` | **Status:** Draft
**Issue:** #TBD | **Team:** Tribe_X_arch_design

---

## User Story

> As a logged-in user, I want my previously analyzed songs and their tags to be saved automatically, so that I can review past results without re-uploading or re-analyzing.

## Acceptance Criteria

**AC-1:** Given a logged-in user completes an analysis, When the AI returns tags successfully, Then a document is written to `/analyses/{analysisId}` in Firestore containing the file name, `DiscoTags`, `AudioContext`, and a server timestamp.

**AC-2:** Given a logged-in user opens the app, When they navigate to the history panel, Then they see only their own past analyses (sorted newest-first), not those of any other account.

**AC-3:** Given a logged-in user clicks a past analysis in the history panel, When the entry loads, Then the tags and file name from that analysis are displayed in `ResultsPage` exactly as they were saved (including any edits made before the page was navigated away).

**AC-4:** Given a user edits tags on the `ResultsPage` (add/remove/rename a tag), When they leave the results view, Then those edited tags are reflected in the Firestore document for that analysis (auto-save on change).

**AC-5 (unauthenticated):** Given a user is not logged in, When an analysis completes, Then no Firestore write is attempted and no history panel is shown.

**AC-6 (error):** Given a Firestore write fails, When the analysis result is still available in memory, Then the UI still shows the tags locally and displays a non-blocking warning ("Could not save analysis — results shown locally only").

## Technical Approach

On `handleAnalyze` success inside `AudioTagger`, call a new `saveAnalysis(uid, fileName, tags, audioContext)` helper that writes to `/analyses/{analysisId}` (auto-ID). The helper lives in `src/shared/api/saveAnalysis.ts`. Errors are caught and surfaced via a new optional `saveError` state prop — they do not block the results view.

Auto-save on tag edit: `AudioTagger` already holds `analysisId` in state once the first save succeeds. Pass `analysisId` down to `ResultsPage` via props; `ResultsPage` calls an `updateAnalysisTags(analysisId, tags)` helper (same module) on each `onTagsChange` invocation. Debounce writes by 800 ms to avoid a Firestore write on every keystroke.

History panel: add a `HistoryPanel` component in `src/components/audio-tagger/HistoryPanel.tsx`. It subscribes to a Firestore `onSnapshot` query (`where('uid', '==', currentUser.uid), orderBy('analyzedAt', 'desc'), limit(50)`). Clicking an entry sets a `loadedAnalysis` state in `AudioTagger` that pre-populates `tags`, `audioContext`, and `file.name` (as a display string — the `File` object itself is not re-created). The panel is hidden when `tags` is non-null (i.e., when a result is active) and shown on the upload screen.

Firestore security rules (in `firestore.rules`) must restrict `/analyses/{analysisId}` reads and writes to `request.auth.uid == resource.data.uid`.

See `docs/agent/data-model.md` for Firestore conventions and `docs/agent/testing.md` for Vitest patterns.

| File                                           | Change                                                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/shared/api/saveAnalysis.ts`               | New: `saveAnalysis()` and `updateAnalysisTags()` Firestore helpers                                                                    |
| `src/components/audio-tagger/AudioTagger.tsx`  | Call `saveAnalysis` after successful analysis; manage `analysisId` state; pass to `ResultsPage`; show `HistoryPanel` on upload screen |
| `src/components/audio-tagger/ResultsPage.tsx`  | Accept `analysisId` and `onTagsChange` debounce; call `updateAnalysisTags` on change                                                  |
| `src/components/audio-tagger/HistoryPanel.tsx` | New: Firestore listener, list of past analyses, click-to-load                                                                         |
| `firestore.rules`                              | Add `/analyses/{analysisId}` rules scoping reads/writes to owner uid                                                                  |
| `docs/agent/data-model.md`                     | Document new `AnalysisRecord` type and `/analyses` collection                                                                         |

## Interfaces

```typescript
// src/shared/api/saveAnalysis.ts — Firestore document shape
export interface AnalysisRecord {
  analysisId: string; // Firestore auto-generated doc ID
  uid: string; // Firebase Auth UID — security rule key
  fileName: string; // Original file name (display only)
  tags: DiscoTags;
  audioContext: AudioContext;
  analyzedAt: Timestamp; // Firestore server timestamp
}

// Props added to ResultsPage
interface ResultsPageProps {
  // ... existing props ...
  analysisId: string | null; // null until first save succeeds
}

// HistoryPanel props
interface HistoryPanelProps {
  uid: string;
  onSelect: (record: AnalysisRecord) => void;
}
```

## Test Plan

- **Unit (`saveAnalysis.ts`):** Mock `addDoc` / `updateDoc`; assert correct payload shape including `uid` and `serverTimestamp()` placeholder; assert `updateAnalysisTags` calls `updateDoc` with only the `tags` field.
- **Unit (`HistoryPanel`):** Render with a mocked `onSnapshot` returning two records; assert both file names appear; assert clicking one calls `onSelect` with the correct record.
- **Unit (`AudioTagger`):** After `handleAnalyze` resolves, assert `saveAnalysis` was called with the current user's `uid`, `file.name`, and the returned `tags`; assert `saveError` warning appears when `saveAnalysis` rejects.
- **Integration:** Sign in → upload file → analysis completes → Firestore emulator contains a document with matching `uid` and `tags`.
- **Manual:** Run two different Google accounts; confirm each sees only their own history in the panel.

## Out of Scope

- Deleting or renaming past analyses
- Paginating beyond 50 records
- Sharing analysis results between users
- Re-uploading the original audio file from history (file name is shown, but playback is not restored)
- Storing `conversationHistory` / chat messages in Firestore

## Done When

- [ ] All ACs pass (tests green)
- [ ] `npm run lint`, `npm test`, and `npm run build` pass
- [ ] PR reviewed by owning team
- [ ] Firestore security rules verified in emulator: user A cannot read user B's analyses
- [ ] Manually verified: analyze a track, refresh the page, see it in history; edit a tag, refresh, confirm edit persisted
