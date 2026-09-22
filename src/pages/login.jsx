import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import SeizenLogo from '../components/SeizenLogo';

export default function Login() {
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [status, setStatus] = useState({ loading: false, error: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '' });
        try {
            await authService.login({ identifier: formData.identifier, password: formData.password });
            navigate('/dashboard');
        } catch (err) {
            setStatus({
                loading: false,
                error: err.response?.data?.message || 'Invalid credentials',
            });
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
                        <label htmlFor="email">Email address Or Username</label>
                        <input
                            id="identifier"
                            autoComplete="identifier"
                            required
                            value={formData.identifier}
                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                        />
                    </div>

                    <div className="field">
                        <div className="field-header">
                            <label htmlFor="password">Password</label>
                            <Link to="/forget-password" className="field-link">Forgot password?</Link>
                        </div>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {status.error && <p className="auth-error">{status.error}</p>}

                    <button type="submit" className="auth-btn" disabled={status.loading}>
                        {status.loading ? <span className="spinner" /> : 'Sign in'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
}