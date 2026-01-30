import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';

const Unauthorized = () => (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-danger)' }}>
        <h1>Unauthorized Access</h1>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/article/:id" element={<ArticleDetail />} />
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
        </AuthProvider>
    );
}

export default App;
