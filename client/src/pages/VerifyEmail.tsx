import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, Link } from 'react-router-dom';

const VerifyEmail = () => {
    const { updateVerification } = useAuth();
    const [searchParams] = useSearchParams();

    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!userId || !secret) {
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }

            try {
                await updateVerification(userId, secret);
                setStatus('success');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message || 'Verification failed.');
            }
        };

        verify();
    }, [userId, secret, updateVerification]);

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
                textAlign: 'center'
            }}>
                <h2 style={{ marginBottom: '1rem' }}>Email Verification</h2>

                {status === 'verifying' && <p>Verifying your email...</p>}

                {status === 'success' && (
                    <div style={{ color: 'var(--color-success)' }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Success!</p>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>Your email has been verified.</p>
                        <Link to="/dashboard" style={{
                            display: 'inline-block',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: 'var(--radius-md)'
                        }}>Go to Dashboard</Link>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ color: 'var(--color-danger)' }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Error</p>
                        <p>{message}</p>
                        <Link to="/login" style={{ display: 'block', marginTop: '1.5rem', color: 'var(--color-text-secondary)' }}>Back to Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
