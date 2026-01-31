import { useState } from 'react';
import { useAuth, Role } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<Role>('WRITER'); // Default role
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (password.length < 8) throw new Error('Password must be at least 8 characters');
            await signup(email, password, name, role);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            if (err.code === 409) {
                setError('A user with this email already exists.');
            } else if (err.code === 401) {
                if (err.type === 'user_session_already_active') {
                    navigate('/dashboard');
                } else {
                    setError('Unauthorized. Please check your details.');
                }
            } else {
                setError(err.message || 'Failed to register');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="glass-panel w-full max-w-[450px] p-10 rounded-2xl border border-white/10">
                <h2 className="text-center mb-8 text-3xl font-bold text-text-primary">Create Account</h2>

                {error && <div className="p-3 bg-danger text-white rounded-md mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-2 text-text-secondary text-sm">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 rounded-md bg-bg-secondary border border-bg-tertiary text-white outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-text-secondary text-sm">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-md bg-bg-secondary border border-bg-tertiary text-white outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-text-secondary text-sm">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 rounded-md bg-bg-secondary border border-bg-tertiary text-white outline-none focus:border-primary transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-text-secondary cursor-pointer hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-text-secondary text-sm">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className="w-full p-3 rounded-md bg-bg-secondary border border-bg-tertiary text-white outline-none cursor-pointer focus:border-primary transition-colors appearance-none"
                        >
                            <option value="WRITER">Writer (Submit News)</option>
                            <option value="EDITOR">Editor (Review News)</option>
                            <option value="ADMIN">Admin (Publish & Manage)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`mt-4 p-3 bg-primary text-white border-none rounded-md font-semibold cursor-pointer transition-opacity duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-hover'}`}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-6 text-center text-text-secondary text-sm">
                    Already have an account? <Link to="/login" className="font-semibold text-text-accent hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
