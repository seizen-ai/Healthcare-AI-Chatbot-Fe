import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import SeizenLogo from '../components/SeizenLogo';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [status, setStatus] = useState({ loading: false, message: '', error: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setStatus({ loading: false, message: '', error: 'Passwords do not match.' });
      return;
    }
    setStatus({ loading: true, message: '', error: '' });
    try {
      await authService.resetPassword(token, form.password, form.confirm);
      setStatus({ loading: false, message: 'Password updated! Redirecting…', error: '' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setStatus({ loading: false, message: '', error: err.response?.data?.message || 'Reset failed. The link may have expired.' });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <SeizenLogo variant="full" size={44} />
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>

          {status.error && <p className="auth-error">{status.error}</p>}
          {status.message && <p className="auth-success">{status.message}</p>}

          <button type="submit" className="auth-btn" disabled={status.loading}>
            {status.loading ? <span className="spinner" /> : 'Reset password'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
