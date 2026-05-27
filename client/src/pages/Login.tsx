import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const Login = () => {
    const { login, loginWithGoogle } = useAuth();
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
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="w-full max-w-[400px] p-10 rounded-2xl bg-white border border-bg-tertiary shadow-2xl">
                <h2 className="text-center mb-8 text-3xl font-extrabold text-black">Log In</h2>

                {error && <div className="p-3 bg-danger text-white rounded-md mb-6 text-sm font-semibold">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block mb-2 text-black text-sm font-bold">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 rounded-lg bg-white border-2 border-bg-tertiary text-black outline-none focus:border-primary transition-all shadow-sm placeholder:text-gray-400 font-medium"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-black text-sm font-bold">Password</label>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
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

                    <button
                        type="submit"
                        disabled={loading}
                        className={`mt-4 w-full p-4 bg-primary text-white border-none rounded-xl font-bold text-lg cursor-pointer shadow-lg transition-transform active:scale-[0.98] duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark shadow-primary/20'}`}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="flex items-center my-8 gap-4 text-gray-400">
                    <div className="flex-1 h-px bg-bg-tertiary"></div>
                    <span className="text-xs font-bold uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-bg-tertiary"></div>
                </div>

                {/* Google OAuth button temporarily hidden */}
                {/*
                <button
                    type="button"
                    onClick={() => loginWithGoogle()}
                    className="w-full p-4 bg-white text-black border-2 border-bg-tertiary rounded-xl font-bold cursor-pointer flex items-center justify-center gap-3 mb-8 hover:bg-gray-50 transition-all shadow-md active:scale-[0.98]"
                >
                    <svg width="20" height="20" viewBox="0 0 18 18">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.157 6.656 3.58 9 3.58z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>
                */}


                <div className="text-center flex flex-col gap-3 text-sm">
                    <p className="text-gray-600 font-medium">
                        Don't have an Account? <Link to="/register" className="font-bold text-primary hover:underline underline-offset-4">Create an Account</Link>
                    </p>
                    <p>
                        <Link to="/forgot-password" className="text-primary font-bold hover:underline underline-offset-4">Reset password</Link>
                    </p>
                </div>
            </div>
        </div>


    );
};

export default Login;
