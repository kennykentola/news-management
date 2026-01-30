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
                maxWidth: '400px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Reset Password</h2>

                {message && <div style={{
                    padding: '0.75rem',
                    backgroundColor: status === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                }}>{message}</div>}

                {status !== 'success' ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                cursor: 'pointer',
                                opacity: status === 'loading' ? 0.7 : 1
                            }}
                        >
                            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Back to Login</Link>
                    </div>
                )}

                {status !== 'success' && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link to="/login" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textDecoration: 'none' }}>Back to Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
