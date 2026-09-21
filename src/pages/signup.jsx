import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import SeizenLogo from '../components/SeizenLogo';

export default function Signup() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', success: '' });
        try {
            const res = await authService.signup(formData);
            setStatus({ loading: false, error: '', success: res.message || 'Account created! Check your email to verify.' });
            setFormData({ username: '', email: '', password: '' });
        } catch (err) {
            setStatus({
                loading: false,
                error: err.response?.data?.message || 'Something went wrong. Try again.',
                success: '',
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
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            required
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {status.error && <p className="auth-error">{status.error}</p>}
                    {status.success && <p className="auth-success">{status.success}</p>}

                    <button type="submit" className="auth-btn" disabled={status.loading}>
                        {status.loading ? <span className="spinner" /> : 'Create account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}