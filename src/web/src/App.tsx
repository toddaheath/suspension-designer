import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationToast from './components/NotificationToast';
import { useAuthStore } from './stores/authStore';
import { useCalculation } from './hooks/useCalculation';

function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="h-screen bg-gray-950">
      {mode === 'register' ? (
        <RegisterForm onSwitchToLogin={() => setMode('login')} />
      ) : (
        <LoginForm onSwitchToRegister={() => setMode('register')} />
      )}
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  // Allow access if authenticated OR if no token exists (anonymous usage)
  // Only redirect if user had a token that got invalidated
  if (!isAuthenticated && token === null && localStorage.getItem('auth_token')) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppWithCalculation() {
  useCalculation();
  return <AppLayout />;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppWithCalculation />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
          </Routes>
          <NotificationToast />
        </AuthInitializer>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
