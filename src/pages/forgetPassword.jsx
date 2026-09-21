import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import SeizenLogo from '../components/SeizenLogo';

export default function ForgetPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ loading: false, message: '', error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, message: '', error: '' });
        try {
            await authService.forgetPassword(email);
            setStatus({ loading: false, message: 'Check your inbox — a reset link is on its way.', error: '' });
        } catch (err) {
            setStatus({ loading: false, message: '', error: err.response?.data?.message || 'Something went wrong. Try again.' });
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
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {status.error && <p className="auth-error">{status.error}</p>}
                    {status.message && <p className="auth-success">{status.message}</p>}

                    <button type="submit" className="auth-btn" disabled={status.loading}>
                        {status.loading ? <span className="spinner" /> : 'Send reset link'}
                    </button>
                </form>

                <p className="auth-footer">
                    Remember it? <Link to="/login">Back to sign in</Link>
                </p>
            </div>
        </div>
    );
}
