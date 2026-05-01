# Project Structure

## What We're Building

MetaMusic is an AI-assisted sync licensing metadata generator. The goal is to reduce manual tagging time and improve music discovery in libraries by analyzing MP3 audio and generating structured metadata (genre, mood, instrumentation, vocal characteristics, tempo/energy, sync-use tags) that a human can review and refine.

The system uses specialized audio analysis models for detection and an LLM synthesis layer for reasoning — not a single monolithic AI.

## Repository Layout

```
src/
    components/    # React components (frame + per-team feature components)
    hooks/         # Custom React hooks
    utils/         # Utility functions
    types/         # TypeScript types and interfaces (shared User type lives here)
    services/      # Firebase/Firestore interactions, API call to audio pipeline
    styles/        # CSS or styling files

docs/
    tribe/ # Human-facing docs: working practices, conventions, client info
    agent/         # Agent-facing guides: architecture, design, testing, data model
        stories/   # Story specs — agents must read before writing code
        decisions/ # Architectural Decision Records (ADRs)
```

## Key Source Folders

| Folder            | Purpose                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/components/` | All React UI components. The frame/container component lives here alongside each team's feature component. |
| `src/types/`      | Shared TypeScript interfaces — including the `User` type passed between frame and team components.         |
| `src/services/`   | All external I/O: Firebase reads/writes, calls to the audio analysis backend, LLM synthesis layer.         |
| `src/hooks/`      | Custom React hooks that encapsulate stateful logic (e.g., audio upload state, metadata fetch).             |
| `src/utils/`      | Pure functions — formatting, tag normalization, confidence score helpers.                                  |
| `src/styles/`     | Shared CSS/styling. Styling approach is recorded in `docs/agent/design.md` and ADR 0002.                   |

## Documentation Folders

| Folder                  | Purpose                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/tribe/`           | Working practices for the human team: branching, naming conventions, org practices, backlog process.                                  |
| `docs/agent/`           | Agent harness: architecture overview, design conventions, data model, testing policy. Agents read this before writing code.           |
| `docs/agent/stories/`   | One `.md` file per feature story. Each contains a user story, Given/When/Then criteria, file-change table, and TypeScript interfaces. |
| `docs/agent/decisions/` | ADRs for significant technical decisions (e.g., ADR 0001: harness structure, ADR 0002: CSS styling approach).                         |

## Technology Stack

| Layer              | Technology                          |
| ------------------ | ----------------------------------- |
| UI framework       | React 19 (strict mode)              |
| Language           | TypeScript 5.9 (strict)             |
| Build tool         | Vite 8                              |
| Test runner        | Vitest 4 + React Testing Library    |
| Linter / formatter | ESLint 9 + Prettier                 |
| Pre-commit hooks   | Husky + lint-staged                 |
| Backend / DB       | Firebase / Firestore                |
| Hosting            | Firebase Hosting                    |
| Audio analysis     | TBD — Essentia, CLAP, or equivalent |
| Transcription      | TBD — Whisper or equivalent         |
| LLM synthesis      | TBD — OpenAI API or Claude API      |

## How Teams Are Organized Within `src/`

Each team owns a subdirectory under `src/components/` named after their team color (e.g., `src/components/red-team/`, `src/components/blue-team/`). The frame component lives at `src/components/Frame/`. Team ownership boundaries are documented in `docs/agent/architecture.md`.

Do not modify another team's owned directory without their explicit approval in the PR.

## Feature Pipeline (What Gets Built)

The core user flow maps to these system layers:

1. **Upload** — user uploads an MP3 via the React UI
2. **Preprocessing** — audio is normalized/prepared for analysis
3. **Audio analysis** — specialized models detect genre, instrumentation, tempo, mood
4. **Transcription** — Whisper (or equivalent) transcribes lyrics if present
5. **LLM synthesis** — an LLM combines model outputs into structured metadata tags
6. **Output + editing UI** — React UI displays AI suggestions with confidence scores; user reviews and edits before saving

## Core Metadata Fields Generated

- Genre (primary + secondary)
- Mood tags
- Instrumentation
- Vocal characteristics
- Tempo / energy level
- Sync-use tags (e.g., "suitable for: action, drama, advertisement")
