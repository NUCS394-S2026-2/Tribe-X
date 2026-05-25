# Story: Suggested Tags Comparison

**Slug:** `0005-suggested-tags-comparison` | **Status:** Ready
**Issue:** #48 | **Team:** (audio-tagger — not in current ownership table; confirm before merging)

---

## User Story

> As a music producer, I want to see the AI's suggested tag updates alongside my current tags so that I can decide whether to keep the suggestion or discard it.

---

## Acceptance Criteria

**AC-1 (No overwrite):** Given the user sends a chat message, when the AI responds, then the current tags in the Tags tab are **not** replaced — they remain unchanged.

**AC-2 (Suggestion appears):** Given the AI has responded to a chat message, then a "Suggested tags" panel appears (below the chat thread) showing the AI's proposed tag values grouped by section.

**AC-3 (Save):** Given the "Suggested tags" panel is visible, when the user clicks "Save", then the current tags are replaced with the suggested tags and the panel is dismissed.

**AC-4 (Dismiss):** Given the "Suggested tags" panel is visible, when the user clicks "Dismiss", then the panel is removed and the current tags remain unchanged.

**AC-5 (One suggestion at a time):** Given a suggestion panel is already visible, when the user sends another chat message and the AI responds, then the panel updates to show the latest suggestion (replaces the previous one).

**AC-6 (Panel cleared on new track):** Given a suggestion panel is visible, when the user clicks "Back to upload" (`resetAll`), then the panel is cleared along with all other state.

---

## Technical Approach

Add `suggestedTags: DiscoTags | null` to `AudioTagger` state. In `handleChat`, store `result.updatedTags` in `suggestedTags` instead of calling `setTags` directly — this preserves the current tags until the user explicitly saves. Pass `suggestedTags`, `onSaveSuggested`, and `onDismissSuggested` down to `ResultsPage`.

In `ResultsPage`, add a `SuggestedTagsPanel` component that renders below the chat thread when `suggestedTags` is non-null. It shows each tag section's suggested values as read-only `TagPills` (the existing component), plus "Save" and "Dismiss" buttons. The Tags tab continues to show the current (editable) tags via `InteractiveTagPills` from story 0004.

`resetAll` in `AudioTagger` already clears all state on new track — add `setSuggestedTags(null)` there.

---

## Files to Change

| File                                                     | Change                                                                                                                                                                                       |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/audio-tagger/AudioTagger.tsx`            | Add `suggestedTags` state; change `handleChat` to set `suggestedTags` instead of `tags`; pass `suggestedTags`, `onSaveSuggested`, `onDismissSuggested` to `ResultsPage`; clear in `resetAll` |
| `src/components/audio-tagger/ResultsPage.tsx`            | Add `suggestedTags`, `onSaveSuggested`, `onDismissSuggested` props; add `SuggestedTagsPanel` component rendered below chat thread                                                            |
| `src/components/audio-tagger/tests/ResultsPage.test.tsx` | Add unit tests for all ACs                                                                                                                                                                   |

---

## Interfaces

```typescript
// Changes to ResultsPageProps
interface ResultsPageProps {
  // ... existing props unchanged ...
  suggestedTags: DiscoTags | null;
  onSaveSuggested: () => void;
  onDismissSuggested: () => void;
}
```

---

## Test Plan

- **AC-1:** Render with `suggestedTags={mockSuggestedTags}`; assert the current tag values (e.g. "Electronic") are still present in the Tags tab.
- **AC-2:** Render with `suggestedTags={mockSuggestedTags}`; assert the suggested panel is visible and shows the suggested values.
- **AC-2 (absent):** Render with `suggestedTags={null}`; assert no suggested panel is rendered.
- **AC-3:** Click "Save"; assert `onSaveSuggested` was called once.
- **AC-4:** Click "Dismiss"; assert `onDismissSuggested` was called once.
- **AudioTagger unit:** `handleChat` stores `updatedTags` in `suggestedTags` and does **not** overwrite current `tags` (mock `chatWithGemini`; assert `tags` prop passed to `ResultsPage` is unchanged after chat).

---

## Out of Scope

- Cherry-picking individual tags from the suggestion (save is all-or-nothing)
- Persisting either the current or suggested tags to Firestore (depends on #41, #25)
- Diff highlighting between current and suggested tags

---

## Done When

- [ ] All ACs pass (tests green)
- [ ] `npm run lint` and `npm run build` pass
- [ ] `npm test` passes with new tests for all ACs
- [ ] PR reviewed by owning team
- [ ] Manually verified in browser: chat response shows suggestion panel; Save replaces tags; Dismiss removes panel; second chat response replaces previous suggestion
