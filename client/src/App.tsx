import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import FactCheck from './pages/FactCheck';
import CategoryPage from './pages/CategoryPage';

const Unauthorized = () => {
    const { logout } = useAuth();
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-danger)', gap: '1rem' }}>
            <h1 className="text-3xl font-bold">Unauthorized Access</h1>
            <p className="text-text-secondary">You do not have permission to view this page.</p>
            <Link to="/" className="text-primary hover:underline">Go Home</Link>
            <button
                onClick={() => { logout(); window.location.href = '/login'; }}
                className="px-4 py-2 bg-bg-tertiary text-white rounded hover:bg-white/10"
            >
                Logout
            </button>
        </div>
    );
};

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <NotificationProvider>
                    <Router>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/check" element={<FactCheck />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/verify-email" element={<VerifyEmail />} />
                            <Route path="/article/:id" element={<ArticleDetail />} />
                            <Route path="/all" element={<CategoryPage />} />
                            <Route path="/category/:category" element={<CategoryPage />} />
                            <Route path="/unauthorized" element={<Unauthorized />} />

                            <Route
                                path="/dashboard/*"
                                element={
                                    <ProtectedRoute allowedRoles={['WRITER', 'EDITOR', 'ADMIN']}>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </Router>
                </NotificationProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
