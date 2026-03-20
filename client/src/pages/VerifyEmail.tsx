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
        <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
            <div className="bg-bg-primary w-full max-w-[400px] p-10 rounded-2xl border border-bg-tertiary shadow-xl text-center">
                <h2 className="mb-4 text-2xl font-bold text-text-primary">Email Verification</h2>

                {status === 'verifying' && <p>Verifying your email...</p>}

                {status === 'success' && (
                    <div className="text-success">
                        <p className="text-xl mb-4">Success!</p>
                        <p className="text-text-secondary mb-6">Your email has been verified.</p>
                        <Link to="/dashboard" className="inline-block px-6 py-3 bg-primary text-white no-underline rounded-md hover:bg-primary-hover transition-colors">
                            Go to Dashboard
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-danger">
                        <p className="text-xl mb-4">Error</p>
                        <p>{message}</p>
                        <Link to="/login" className="block mt-6 text-text-secondary hover:underline">Back to Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
