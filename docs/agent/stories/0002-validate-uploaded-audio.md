# Story: Validate Uploaded Audio

**Slug:** `0002-validate-uploaded-audio` | **Status:** Draft
**Issue:** #24 | **Team:** Shared

---

## User Story

> As a user uploading audio, I want the app to validate my file before analysis so that I receive immediate feedback and avoid failed uploads.

## Acceptance Criteria

**AC-1:** Given a user selects a valid audio file (MP3, WAV, FLAC, OGG, M4A, AIFF), When the file is selected, Then the file name displays and the Analyze button becomes enabled.

**AC-2:** Given a user selects an unsupported file type, When the file is selected, Then the app shows an error message: "Unsupported file type. Please upload MP3, WAV, FLAC, OGG, M4A, or AIFF files." and the Analyze button stays disabled.

**AC-3:** Given a user selects a file larger than 50MB, When the file is selected, Then the app shows an error message: "File too large. Please upload files under 50MB." and the Analyze button stays disabled.

**AC-4:** Given a user corrects an invalid selection with a valid file, When the new file is selected, Then the error message disappears and the Analyze button becomes enabled.

## Technical Approach

Add client-side validation in `src/components/audio-tagger/AudioTagger.tsx` so the file input checks file type and size before calling the backend. The validation function should accept known audio MIME types and file extensions, reject unsupported types, reject oversized files, and expose a clear validation error state in the UI.

Update the component tests in `src/components/audio-tagger/AudioTagger.test.tsx` to cover valid audio selection, invalid type selection, oversized file selection, and clearing validation errors when a valid file is reselected.

| File                                               | Change description                                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/components/audio-tagger/AudioTagger.tsx`      | Add file validation logic, validation error state, and disable analyze button on invalid file selections |
| `src/components/audio-tagger/AudioTagger.test.tsx` | Add tests for valid/invalid upload flows and validation error display                                    |

## Interfaces

```typescript
interface FileValidationError {
  type: 'invalid-type' | 'too-large';
  message: string;
}
```

## Test Plan

- **Unit:** Test the file validation behavior with valid audio MIME types and extensions, invalid file types, and oversized files.
- **Integration:** Test the AudioTagger upload flow so invalid selections produce visible error messages and disable the Analyze button.
- **Manual:** Upload a supported audio file, confirm Analyze becomes enabled; upload an unsupported file or file over 50MB, confirm error appears and Analyze stays disabled.

## Out of Scope

- Backend validation of uploaded files
- Persistent storage of uploaded audio
- Audio analysis itself beyond file selection behavior

## Done When

- [ ] All acceptance criteria pass
- [ ] Story spec file is added at `docs/agent/stories/0002-validate-uploaded-audio.md`
- [ ] All related tests pass
- [ ] Branch is ready for review
