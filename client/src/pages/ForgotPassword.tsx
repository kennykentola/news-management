import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const { requestPasswordRecovery } = useAuth();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await requestPasswordRecovery(email);
            setStatus('success');
            setMessage('Password reset link sent! Check your email.');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to send reset link.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="glass-panel w-full max-w-[400px] p-10 rounded-2xl border border-white/10">
                <h2 className="text-center mb-6 text-2xl font-bold text-text-primary">Reset Password</h2>

                {message && <div className={`p-3 text-white rounded-md mb-4 text-sm ${status === 'error' ? 'bg-danger' : 'bg-success'}`}>
                    {message}
                </div>}

                {status !== 'success' ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block mb-2 text-text-secondary text-sm">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 rounded-md bg-bg-secondary border border-bg-tertiary text-white outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className={`mt-4 p-3 bg-primary text-white border-none rounded-md font-semibold cursor-pointer transition-opacity duration-200 ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-hover'}`}
                        >
                            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center mt-4">
                        <Link to="/login" className="text-primary hover:underline">Back to Login</Link>
                    </div>
                )}

                {status !== 'success' && (
                    <div className="text-center mt-4">
                        <Link to="/login" className="text-text-secondary text-sm hover:underline">Back to Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
