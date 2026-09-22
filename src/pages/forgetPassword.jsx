import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import SeizenLogo from '../components/SeizenLogo';

export default function ForgetPassword() {
    const [identifier, setIdentifier] = useState('');
    const [status, setStatus] = useState({ loading: false, message: '', error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, message: '', error: '' });
        try {
            await authService.forgetPassword(identifier);
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
                        <label htmlFor="identifier">Email address or Username</label>
                        <input
                            id="identifier"
                            type="text"
                            autoComplete="identifier"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
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
