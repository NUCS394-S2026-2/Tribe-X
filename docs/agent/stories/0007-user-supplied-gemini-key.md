# Story: User-Supplied Gemini API Key with Graceful Error Handling

**Slug:** `0007-user-supplied-gemini-key` | **Status:** In Progress
**Issue:** #TBD | **Team:** Blue

---

## User Story

> As a music producer, I want to provide my own Gemini API key so that I can use the analysis and chat features without depending on a shared server key.

---

## Acceptance Criteria

**AC-1 (Key input):** Given the user has not entered a Gemini API key, when they open the app, then a prompt asks them to enter their key before they can analyze a file.

**AC-2 (Key persisted):** Given the user enters a valid key, when they reload the page, then the key is still present (stored in `localStorage`) and they are not prompted again.

**AC-3 (Key passed to backend):** Given the user has a key stored, when they call `/analyze` or `/chat`, then the key is sent as the `X-Gemini-Api-Key` request header.

**AC-4 (No key → clear error):** Given no key is provided in the header, when the backend receives the request, then it returns `400` with a message the frontend surfaces as "Please enter your Gemini API key."

**AC-5 (Invalid key → clear error):** Given an invalid key is sent, when Gemini rejects it, then the frontend shows "Invalid Gemini API key — please check and try again." instead of the generic error.

**AC-6 (Rate limit → clear error):** Given the user's key is rate-limited, when Gemini returns 429, then the frontend shows "Rate limit reached — please wait a moment and try again."

**AC-7 (Key editable):** Given the user wants to change their key, when they click a "Change API key" control, then the key input is shown again and saving updates `localStorage`.

---

## Technical Approach

Add a `geminiKey` value to app state (seeded from `localStorage` on mount). Gate the upload UI behind the key — if absent, show a simple key-entry form instead. Pass the key as `X-Gemini-Api-Key` in both `analyzeMusicFile` and `chatWithGemini`. Store the key in `localStorage` on save.

On the backend, remove the server-side `_GEMINI_API_KEY` env var dependency. Read the key from the `X-Gemini-Api-Key` request header in `/analyze` and `/chat`. Build a small error-mapping helper that translates Gemini HTTP status codes (401, 429, 5xx) into structured `{ code, message }` JSON so the frontend can display specific copy rather than a raw exception string.

On the frontend, update the error handling in `AudioTagger` to inspect the error message/code and map it to user-friendly copy. The existing generic "Chat failed. Please try again." and "Analysis failed." messages are replaced by the specific strings in AC-4 through AC-6.

---

## Files to Change

| File                                              | Change                                                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/audio-tagger/AudioTagger.tsx`     | Add `geminiKey` state from `localStorage`; gate upload behind key; pass key to API calls; map error codes to friendly messages |
| `src/components/audio-tagger/GeminiKeyPrompt.tsx` | **New** — key entry/change form component                                                                                      |
| `src/shared/api/analyzeMusicFile.ts`              | Accept `apiKey` param; send as `X-Gemini-Api-Key` header                                                                       |
| `src/shared/api/chatWithGemini.ts`                | Accept `apiKey` param; send as `X-Gemini-Api-Key` header                                                                       |
| `backend/api.py`                                  | Read key from header; remove env var dependency; add error-mapping helper                                                      |
| `backend/env.example`                             | Remove `GEMINI_API_KEY` (no longer needed server-side)                                                                         |

---

## Interfaces

```typescript
// Updated API function signatures
export async function analyzeMusicFile(
  file: File,
  apiKey: string,
): Promise<AnalyzeResult>;
export async function chatWithGemini(
  message: string,
  conversationHistory: ConversationMessage[],
  audioContext: AudioContext,
  apiKey: string,
): Promise<ChatResult>;

// Error shape returned by backend
interface ApiError {
  code: 'NO_KEY' | 'INVALID_KEY' | 'RATE_LIMITED' | 'GEMINI_ERROR';
  message: string;
}
```

---

## Test Plan

- **AC-1:** Render `AudioTagger` with no `localStorage` key; assert key-entry form is shown and upload UI is not.
- **AC-2:** Enter a key and save; assert `localStorage.getItem('geminiApiKey')` equals the entered value.
- **AC-3:** Mock `analyzeMusicFile`; assert it is called with the stored key.
- **AC-4:** Mock fetch to return `400 NO_KEY`; assert the UI shows "Please enter your Gemini API key."
- **AC-5:** Mock fetch to return `401 INVALID_KEY`; assert the UI shows "Invalid Gemini API key — please check and try again."
- **AC-6:** Mock fetch to return `429 RATE_LIMITED`; assert the UI shows "Rate limit reached — please wait a moment and try again."
- **AC-7:** Render with a stored key; assert a "Change API key" control is present and clicking it shows the key-entry form.

---

## Out of Scope

- Validating the key format client-side before sending
- Storing the key anywhere other than `localStorage` (no Firestore)
- Supporting keys for other LLM providers

---

## Done When

- [ ] All ACs pass (tests green)
- [ ] `npm run lint`, `npm test`, and `npm run build` pass
- [ ] Backend returns structured error JSON for all error cases
- [ ] PR reviewed by owning team
- [ ] Manually verified: entering a valid key allows analysis; invalid key shows correct error; rate limit shows correct error; key persists on reload
