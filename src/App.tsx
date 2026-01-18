import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from './features/profile/ProfilePage';
import SpkPage from './features/spk/SpkPage';
import CreateSpkForm from './features/spk/CreateSpkForm';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './features/home/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route index element={<Navigate to="login" replace />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/spk" element={<SpkPage />} />
            <Route path="/spk/create" element={<CreateSpkForm />} />
            <Route path="/spk/edit/:id" element={<CreateSpkForm />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
