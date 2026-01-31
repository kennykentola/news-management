import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const { completePasswordRecovery } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    const [password, setPassword] = useState('');
    const [passwordAgain, setPasswordAgain] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!userId || !secret) {
            setStatus('error');
            setMessage('Invalid password reset link.');
        }
    }, [userId, secret]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordAgain) {
            setMessage('Passwords do not match');
            setStatus('error');
            return;
        }

        setStatus('loading');
        try {
            await completePasswordRecovery(userId!, secret!, password, passwordAgain);
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to reset password.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="glass-panel w-full max-w-[400px] p-10 rounded-2xl border border-white/10">
                <h2 className="text-center mb-6 text-2xl font-bold text-text-primary">Set New Password</h2>

                {(message || status === 'success') && <div className={`p-3 text-white rounded-md mb-4 text-sm ${status === 'error' ? 'bg-danger' : 'bg-success'}`}>
                    {status === 'success' ? 'Password reset successfully! Redirecting...' : message}
                </div>}

                {status !== 'success' && userId && secret && (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block mb-2 text-text-secondary text-sm">New Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 rounded-md bg-bg-secondary border border-bg-tertiary text-white outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-text-secondary text-sm">Confirm Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={passwordAgain}
                                onChange={(e) => setPasswordAgain(e.target.value)}
                                className="w-full p-3 rounded-md bg-bg-secondary border border-bg-tertiary text-white outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className={`mt-4 p-3 bg-primary text-white border-none rounded-md font-semibold cursor-pointer transition-opacity duration-200 ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-hover'}`}
                        >
                            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
