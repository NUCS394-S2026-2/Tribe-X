# Story: Google Sign-Up Authentication

**Slug:** `0003-google-auth-signup` | **Status:** Ready
**Team:** Tribe_X_arch_design

---

## User Story

> As a new user, I want to sign up with Google so that I can securely access the application without creating a new password.

## Acceptance Criteria

**AC-1:** Given a user is on the app unauthenticated, When they click "Sign up with Google", Then they are redirected to Google's OAuth flow.

**AC-2:** Given a user completes Google authentication, When they return to the app, Then a User profile document is created in Firestore (`/users/{uid}`) with `displayName`, `email`, and unique id `uid` populated from Google's response.

**AC-3:** Given a user has already authenticated, When they reload the page, Then they remain signed in (auth state persists via Firebase session).

**AC-4 (error):** Given Google authentication fails, When the user is returned to the app, Then an error message is displayed and signup is not attempted.

## Technical Approach

Set up Firebase Authentication with Google as a provider, and create an auth context to manage sign-up and sign-in state. On successful Google authentication, create a Firestore User document with the authenticated user's profile data. The team field will be assigned automatically (default: 'blue' for now, future: admin assignment).

Implement following patterns from `docs/agent/design.md` and `docs/agent/testing.md`:

- Create a custom React hook `useAuth()` to expose auth state and sign-up function
- Wrap the app in an `<AuthProvider>` to initialize Firebase Auth and persist session
- Add a sign-up button component that triggers Google sign-in
- Tests use Vitest + React Testing Library with mocked Firebase

| File                           | Change                                      |
| ------------------------------ | ------------------------------------------- |
| `src/shared/firebase.js`       | Export initialized Auth instance            |
| `src/hooks/useAuth.ts`         | New: Custom hook for auth state and sign-up |
| `src/contexts/AuthContext.tsx` | New: Provider for session-scoped auth state |
| `src/App.tsx`                  | Wrap app in `<AuthProvider>`                |
| `src/components/SignUpButton`  | New: Google sign-up button                  |
| `src/components/SignOutButton` | New: Google sign-out button                 |
| Tests (mirror each file)       | Unit + integration tests                    |

## Interfaces

```typescript
// Extends User type from docs/agent/data-model.md
export interface User {
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
}

// Auth context state
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signUpWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

## Test Plan

- **Unit:** `useAuth()` hook returns correct state shape; error handling for failed Firestore writes
- **Integration:** End-to-end: Google sign-in → User document created → Auth state updated
- **Manual:** Click "Sign up with Google" in browser; confirm User doc appears in Firestore Console

## Out of Scope

- Team assignment UI (auto-assign for now)
- Sign-in for existing users (scope: sign-up only)
- Password reset or email verification
- Sign out UI (implemented in context, not exposed to user yet)

## Done When

- [ ] All ACs pass (tests green)
- [ ] `npm run lint`, `npm test`, and `npm run build` pass
- [ ] PR reviewed by owning team
- [ ] Manually verified: click sign-up → Google OAuth → User doc in Firestore
- [ ] No secrets committed (Firebase config is public; no private keys in repo)
