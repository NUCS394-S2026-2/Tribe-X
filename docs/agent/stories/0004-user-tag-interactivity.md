# Story: User Tag Interactivity

**Slug:** `0004-user-tag-interactivity` | **Status:** Ready
**Issue:** #22 | **Team:** (audio-tagger — not in current ownership table; confirm before merging)

---

## User Story

> As a music producer, I want to remove, add, and edit the generated tags after analysis so that I can correct inaccuracies and tailor the results before copying or exporting them.

---

## Acceptance Criteria

**AC-1 (Remove):** Given tags are displayed in the Tags tab, when the user clicks the × button on a tag pill, then that tag is removed from its section and the pill disappears.

**AC-2 (Add):** Given a tag section is displayed, when the user types a value into the section's "Add tag" input and presses Enter or Tab, then the new tag appears as a pill in that section and the input clears.

**AC-3 (Edit — array field):** Given a tag pill is displayed, when the user double-clicks the pill text, then the pill text becomes an inline `<input>`; when the user presses Enter or the input loses focus, the updated value replaces the original. Submitting an empty value removes the tag instead.

**AC-4 (Edit — tempo):** Given the Tempo section shows a single value, when the user double-clicks the value pill, an inline `<input>` appears pre-filled with the current tempo; pressing Enter or blur updates the tempo to the new value. Submitting an empty value clears the tempo (showing "(none)").

**AC-5 (Duplicate guard):** Given a tag section already contains value "X", when the user adds or edits to produce "X" again (case-insensitive trim comparison), then the duplicate is silently ignored and the input clears.

**AC-6 (Empty state):** Given all tags are removed from a section, then the section renders the existing "(none)" placeholder.

**AC-7 (Session scope):** Changes are in-session only. Clicking "Back to upload" (which calls `onNewTrack` → `resetAll`) restores the AI-generated tags on the next analysis. No Firestore writes are made.

---

## Technical Approach

`AudioTagger` already holds `tags` in state and already calls `setTags` when the AI chat returns updated tags. Extend `ResultsPageProps` with `onTagsChange: (tags: DiscoTags) => void` and pass `setTags` from `AudioTagger`. This keeps `AudioTagger` as the single source of truth and ensures AI-driven tag updates (chat) and user-driven edits (this story) both flow through the same state.

In `ResultsPage.tsx`, replace the read-only `TagPills` component with a new `InteractiveTagPills` component that renders each item as an editable pill (double-click to edit, × button to remove) plus an "Add tag" text input below the list. For the `tempo` field (a `string`, not an array), add an `EditableSingleValue` component that renders a pill with double-click-to-edit behavior but no × button (clearing tempo via an empty submit maps to `tempo: ''`).

Wire `InteractiveTagPills` and `EditableSingleValue` only inside the **Tags** tab section. The Overview, Insights, and Similar Tracks panels remain read-only — they receive the same `tags` value that is now managed in `AudioTagger`.

---

## Files to Change

| File                                                     | Change                                                                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/audio-tagger/ResultsPage.tsx`            | Add `onTagsChange` prop; replace `TagPills` with `InteractiveTagPills`; add `EditableSingleValue` for tempo; wire all mutations to `onTagsChange` |
| `src/components/audio-tagger/AudioTagger.tsx`            | Pass `onTagsChange={setTags}` to `<ResultsPage>`                                                                                                  |
| `src/components/audio-tagger/tests/ResultsPage.test.tsx` | Add unit tests for all ACs (see Test Plan)                                                                                                        |

---

## Interfaces

```typescript
// Add to ResultsPageProps (ResultsPage.tsx)
interface ResultsPageProps {
  // ... existing props unchanged ...
  onTagsChange: (tags: DiscoTags) => void;
}

// Internal to ResultsPage.tsx — no exports needed
interface InteractiveTagPillsProps {
  sectionKey: Exclude<keyof DiscoTags, 'tempo'>;
  items: string[];
  tags: DiscoTags;
  onTagsChange: (tags: DiscoTags) => void;
}

interface EditableSingleValueProps {
  value: string;
  tags: DiscoTags;
  onTagsChange: (tags: DiscoTags) => void;
}
```

---

## Test Plan

- **AC-1:** Render with `genre: ['Electronic', 'Ambient']`; click the × button on "Electronic"; assert `onTagsChange` was called with `genre: ['Ambient']`.
- **AC-2:** Render a genre section; type "Jazz" into the add-tag input and press Enter; assert `onTagsChange` was called with `genre` containing "Jazz"; assert the input value clears.
- **AC-3:** Double-click the "Electronic" pill; assert an `<input>` appears; type "Electronica" and press Enter; assert `onTagsChange` was called with "Electronica" in place of "Electronic".
- **AC-3 (empty submit removes):** Double-click a pill; clear the input and press Enter; assert `onTagsChange` was called without that tag.
- **AC-4:** Double-click the "Midtempo" tempo pill; type "Fast" and press Enter; assert `onTagsChange` called with `tempo: 'Fast'`.
- **AC-5:** Attempt to add "Electronic" when it already exists; assert `onTagsChange` is **not** called with a duplicate.
- **AC-6:** Remove all genre tags one by one; assert "(none)" appears in the genre section.
- **Manual:** Visually verify all interactions in the browser; confirm Copy All Tags and CSV export reflect the edited tag values.

---

## Out of Scope

- Persisting edits to Firestore (depends on issues #41 and #25)
- Undo / redo
- Drag-to-reorder tags
- Editing tags in the Overview, Insights, or Similar Tracks tabs

---

## Done When

- [ ] All ACs pass (tests green)
- [ ] `npm run lint` and `npm run build` pass
- [ ] `npm test` passes with new tests added for all ACs
- [ ] PR reviewed by owning team
- [ ] Manually verified in browser: remove, add, edit, duplicate guard, empty state, tempo edit
- [ ] Copy All Tags and CSV export reflect edited values
