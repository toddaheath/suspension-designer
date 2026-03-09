import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import { useCalculation } from './hooks/useCalculation';

function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

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

function AppWithCalculation() {
  useCalculation();
  return <AppLayout />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppWithCalculation />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
