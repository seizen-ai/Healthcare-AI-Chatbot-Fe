import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';

export default function VerifyEmail() {
    const { token } = useParams();
    const [status, setStatus] = useState({ loading: true, message: '', error: false });

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await authService.verifyEmail(token);
                setStatus({ loading: false, message: res.message, error: false });
            } catch (err) {
                setStatus({ 
                    loading: false, 
                    message: err.response?.data?.message || 'Verification failed.', 
                    error: true 
                });
            }
        };
        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
                <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
                
                {status.loading ? (
                    <p className="text-gray-600 animate-pulse">Verifying your email...</p>
                ) : (
                    <>
                        <p className={`mb-6 p-4 rounded-lg ${status.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {status.message}
                        </p>
                        <Link to="/login" className="inline-flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                            Go to Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}