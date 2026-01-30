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
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg-primary)'
        }}>
            <div className="glass-panel" style={{
                padding: '2.5rem',
                borderRadius: 'var(--radius-lg)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Set New Password</h2>

                {(message || status === 'success') && <div style={{
                    padding: '0.75rem',
                    backgroundColor: status === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem'
                }}>
                    {status === 'success' ? 'Password reset successfully! Redirecting...' : message}
                </div>}

                {status !== 'success' && userId && secret && (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>New Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-bg-tertiary)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Confirm Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={passwordAgain}
                                onChange={(e) => setPasswordAgain(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-bg-tertiary)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
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
