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
    const [role, setRole] = useState<Role>('READER'); // Default role
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (password.length < 8) throw new Error('Password must be at least 8 characters');
            await signup(email, password, name, role);
            if (role === 'READER') {
                navigate('/');
            } else {
                navigate('/dashboard');
            }
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
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="bg-white w-full max-w-[450px] p-10 rounded-2xl border border-bg-tertiary shadow-2xl">
                <h2 className="text-center mb-10 text-3xl font-extrabold text-black">Create Account</h2>

                {error && <div className="p-3 bg-danger text-white rounded-md mb-6 text-sm font-semibold">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block mb-2 text-black text-sm font-bold">Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-4 rounded-lg bg-white border-2 border-bg-tertiary text-black outline-none focus:border-primary transition-all shadow-sm font-medium"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-black text-sm font-bold">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 rounded-lg bg-white border-2 border-bg-tertiary text-black outline-none focus:border-primary transition-all shadow-sm font-medium"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-black text-sm font-bold">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 rounded-lg bg-white border-2 border-bg-tertiary text-black outline-none focus:border-primary transition-all shadow-sm font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-none border-none text-gray-500 cursor-pointer hover:text-black transition-colors"
                            >
                                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                            </button>
                        </div>
                    </div>

                    {/* Role is always READER for public registration */}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`mt-4 p-4 bg-primary text-white border-none rounded-xl font-bold text-lg cursor-pointer shadow-lg transition-transform active:scale-[0.98] duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark shadow-primary/20'}`}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-600 font-medium text-sm">
                    Already have an account? <Link to="/login" className="font-bold text-primary hover:underline underline-offset-4">Sign in</Link>
                </p>
            </div>
        </div>


    );
};

export default Register;
