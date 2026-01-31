import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

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
            // We need to know the role to redirect correctly. 
            // Since context update is async, we'll fetch the user preferences/account directly to be sure, 
            // or we could rely on a protected route redirecting them out?
            // Cleaner UX: Redirect based on role.
            try {
                // Determine destination based on role (fetch from Appwrite directly as context might be stale)
                const { account } = await import('../lib/appwrite');
                const session = await account.get();
                const role = session.prefs?.role || 'READER';

                if (role === 'READER') {
                    navigate('/');
                } else {
                    navigate('/dashboard');
                }
            } catch (navError) {
                // Fallback
                navigate('/');
            }

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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-[400px] p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <h2 className="text-center mb-8 text-3xl font-bold text-white">Log In</h2>

                {error && <div className="p-3 bg-red-600 text-white rounded-md mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-2 text-slate-400 text-sm">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="e.g., e047472.bello@dlc.ui.edu.ng"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-md bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-slate-400 text-sm">Password</label>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 rounded-md bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-slate-400 cursor-pointer hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`mt-2 w-full p-3 bg-blue-600 text-white border-none rounded-md font-semibold cursor-pointer transition-colors duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="flex items-center my-6 gap-4 text-slate-500">
                    <div className="flex-1 h-px bg-slate-700"></div>
                    <span className="text-sm">or</span>
                    <div className="flex-1 h-px bg-slate-700"></div>
                </div>

                <button
                    type="button"
                    className="w-full p-3 bg-white text-slate-900 border-none rounded-md font-semibold cursor-pointer flex items-center justify-center gap-2 mb-6 hover:bg-gray-100 transition-colors"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.157 6.656 3.58 9 3.58z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className="text-center flex flex-col gap-2 text-slate-400 text-sm">
                    <p>
                        Don't have an Account? <Link to="/register" className="font-semibold text-blue-400 hover:underline">Create an Account</Link>
                    </p>
                    <p>
                        Forgotten password? <Link to="/forgot-password" className="text-blue-500 hover:underline">Reset password</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
