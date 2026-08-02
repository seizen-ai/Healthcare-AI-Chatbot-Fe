import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';

export default function Signup() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', success: '' });
        try {
            const res = await authService.signup(formData);
            setStatus({ loading: false, error: '', success: res.message });
            setFormData({ username: '', email: '', password: '' });
        } catch (err) {
            setStatus({ 
                loading: false, 
                error: err.response?.data?.message || 'Something went wrong!',
                success: '' 
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Seizen AI</h2>
                    <p className="mt-2 text-sm text-gray-600">Create your account to get started</p>
                </div>

                

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input type="text" required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email address</label>
                        <input type="email" required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {status.error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{status.error}</div>}
                {status.success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{status.success}</div>}
                    
                    <button type="submit" disabled={status.loading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">
                        {status.loading ? 'Creating account...' : 'Sign up'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in here</Link>
                </p>
            </div>
        </div>
    );
}