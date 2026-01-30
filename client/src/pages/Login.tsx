import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            if (err.code === 401) {
                setError('Invalid email or password.');
            } else {
                setError(err.message || 'Failed to login');
            }
        } finally {
            setLoading(false);
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
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.75rem', color: 'var(--color-text-primary)' }}>Welcome Back</h2>

                {error && <div style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--color-danger)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Email</label>
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

                    const [showPassword, setShowPassword] = useState(false);

                    // ... handle submit ...

                    return (
                    // ...
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Password</label>
                            <Link to="/forgot-password" style={{ color: 'var(--color-primary)', fontSize: '0.8rem', textDecoration: 'none' }}>Forgot Password?</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
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
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem'
                                }}
                            >
                                {showPassword ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
