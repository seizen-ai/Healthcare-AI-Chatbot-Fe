import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import VerifyEmail from './pages/verifyEmail';
import DashboardLayout from './layouts/DashboardLayout'; // Created in our previous step

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Frontend catches the link from the email here */}
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* Protected Dashboard Area */}
        <Route path="/dashboard" element={<DashboardLayout />}>
           {/* Add your module routes here as discussed earlier */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;