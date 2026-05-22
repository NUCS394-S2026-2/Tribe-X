import { AudioTagger } from './components/audio-tagger/AudioTagger';
import { SignOutButton } from './components/SignOutButton/SignOutButton';
import { SignUpButton } from './components/SignUpButton/SignUpButton';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

function AppContent(): React.ReactElement {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-team-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {!user ? (
        <div className="flex h-screen items-center justify-center">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h1 className="mb-6 text-2xl font-bold text-gray-900">Welcome</h1>
            <SignUpButton />
          </div>
        </div>
      ) : (
        <div className="flex h-screen flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
            <p className="text-sm text-gray-600">
              Signed in as <span className="font-semibold">{user.displayName}</span>
            </p>
            <SignOutButton />
          </div>
          <div className="flex flex-1 overflow-hidden">
            <AudioTagger />
          </div>
        </div>
      )}
    </div>
  );
}

function App(): React.ReactElement {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
