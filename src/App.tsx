import { AudioTagger } from './components/audio-tagger/AudioTagger';
import { SignOutButton } from './components/SignOutButton/SignOutButton';
import { SignUpButton } from './components/SignUpButton/SignUpButton';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

function AppContent(): React.ReactElement {
  const { user } = useAuth();

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
        <>
          <div className="flex items-center justify-between bg-white p-4 shadow">
            <p className="text-sm text-gray-600">
              Signed in as <span className="font-semibold">{user.displayName}</span>
            </p>
            <SignOutButton />
          </div>
          <AudioTagger />
        </>
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
