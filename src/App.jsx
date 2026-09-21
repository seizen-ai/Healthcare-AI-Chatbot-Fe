import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import VerifyEmail from './pages/verifyEmail';
import DashboardLayout from './layouts/DashboardLayout';
import Hospital from './pages/hospital';
import Activation from './pages/activation';
import ForgetPassword from './pages/forgetPassword';
import ResetPassword from './pages/resetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"                 element={<Login />} />
        <Route path="/signup"                element={<Signup />} />
        <Route path="/verify-email/:token"   element={<VerifyEmail />} />
        <Route path="/forget-password"       element={<ForgetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Dashboard Area */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/hospital" replace />} />
          <Route path="/dashboard/hospital" element={<Hospital />} />
          <Route path="/dashboard/activation" element={<Activation />} />
        </Route>

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;