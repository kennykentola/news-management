import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SubmitNews from './dashboard/SubmitNews';
import ReviewNews from './dashboard/ReviewNews';
import MyArticles from './dashboard/MyArticles';
import EditArticle from './dashboard/EditArticle';
import PublishNews from './dashboard/PublishNews';
import Overview from './dashboard/Overview';

const Stats = () => <h2 className="text-2xl font-bold mb-4">Platform Stats</h2>;

const SidebarItem = ({ to, label, icon, active }: { to: string, label: string, icon: string, active: boolean }) => (
    <Link to={to} style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '0.5rem',
        textDecoration: 'none',
        color: active ? 'white' : 'var(--color-text-secondary)',
        backgroundColor: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        borderLeft: active ? '3px solid var(--color-primary)' : '3px solid transparent',
        transition: 'all 0.2s'
    }}>
        <span style={{ marginRight: '0.75rem' }}>{icon}</span>
        {label}
    </Link>
);

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRight: '1px solid var(--color-bg-tertiary)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 10
            }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid var(--color-bg-tertiary)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>NewsGuard</h2>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        {user?.name} <span style={{
                            display: 'inline-block',
                            padding: '0.1rem 0.4rem',
                            backgroundColor: 'var(--color-bg-tertiary)',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            marginLeft: '0.5rem',
                            color: 'var(--color-text-accent)'
                        }}>{user?.role}</span>
                    </div>
                </div>

                <nav style={{ padding: '1.5rem 1rem', flex: 1 }}>
                    <SidebarItem to="/" label="Read News (Reader View)" icon="📰" active={false} />
                    <SidebarItem to="/dashboard" label="Overview" icon="🏠" active={isActive('/dashboard')} />

                    {(user?.role === 'WRITER' || user?.role === 'ADMIN') && (
                        <>
                            <SidebarItem to="/dashboard/my-articles" label="My Articles" icon="📝" active={isActive('/dashboard/my-articles')} />
                            <SidebarItem to="/dashboard/submit" label="Submit News" icon="✍️" active={isActive('/dashboard/submit')} />
                        </>
                    )}

                    {(user?.role === 'EDITOR' || user?.role === 'ADMIN') && (
                        <SidebarItem to="/dashboard/review" label="Review Queue" icon="👀" active={isActive('/dashboard/review')} />
                    )}

                    {user?.role === 'ADMIN' && (
                        <>
                            <SidebarItem to="/dashboard/publish" label="Publish Queue" icon="🚀" active={isActive('/dashboard/publish')} />
                            <SidebarItem to="/dashboard/stats" label="Analytics" icon="📊" active={isActive('/dashboard/stats')} />
                        </>
                    )}
                </nav>

                <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--color-bg-tertiary)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--color-danger)',
                            color: 'var(--color-danger)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: '260px', flex: 1, padding: '2.5rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/my-articles" element={<MyArticles />} />
                        <Route path="/edit/:id" element={<EditArticle />} />
                        <Route path="/submit" element={<SubmitNews />} />
                        <Route path="/review" element={<ReviewNews />} />
                        <Route path="/publish" element={<PublishNews />} />
                        <Route path="/stats" element={<Stats />} />
                    </Routes>
                </div>
            </main>
        </div >
    );
};

export default Dashboard;
