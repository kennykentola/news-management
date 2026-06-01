import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage, BUCKET_ID_IMAGES } from '../lib/appwrite';
import SubmitNews from './dashboard/SubmitNews';
import ReviewNews from './dashboard/ReviewNews';
import MyArticles from './dashboard/MyArticles';
import EditArticle from './dashboard/EditArticle';
import PublishNews from './dashboard/PublishNews';
import RejectedNews from './dashboard/RejectedNews';

import Overview from './dashboard/Overview';
import Stats from './dashboard/Stats';
import Profile from './dashboard/Profile';
import ProtectedRoute from '../components/ProtectedRoute';
import AIControl from './dashboard/AIControl';
import AuditLog from './dashboard/AuditLog';
import NotificationCenter from '../components/NotificationCenter';
import {
    Menu,
    X,
    LayoutDashboard,
    Newspaper,
    FileText,
    PenTool,
    CheckSquare,
    Send,
    BarChart2,
    Cpu,
    Users,
    Settings,
    LogOut,
    Home,
    User,
    History,
    Trash2
} from 'lucide-react';
import AdminUsers from './dashboard/AdminUsers';

const SHOW_AI_CONTROL = import.meta.env.VITE_SHOW_AI_CONTROL === 'true';


interface SidebarItemProps {
    to: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick?: () => void;
}

const SidebarItem = ({ to, label, icon, active, onClick }: SidebarItemProps) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center px-4 py-3 rounded-lg mb-2 transition-all duration-200 border-l-4 ${active
            ? 'bg-primary text-white border-primary shadow-md font-bold'
            : 'text-text-primary hover:bg-bg-tertiary border-transparent font-semibold shadow-sm'
            }`}
    >
        <span className="mr-3">{icon}</span>
        <span className="">{label}</span>
    </Link>
);

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex min-h-screen bg-bg-primary relative text-text-primary">
            {/* Mobile Header / Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-bg-primary border-b-2 border-bg-tertiary flex items-center justify-between px-4 z-40 shadow-sm">
                <div className="flex items-center">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-text-primary hover:bg-bg-secondary rounded-md transition-colors"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span className="ml-4 font-extrabold text-xl text-primary tracking-tight">NewsGuard</span>
                </div>
                <div className="flex items-center gap-4">
                    <NotificationCenter />
                </div>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    onClick={closeSidebar}
                    className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-[2px]"
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky inset-y-0 left-0 z-50 w-64 sidebar-gradient border-r-2 border-bg-tertiary 
                transform transition-transform duration-300 ease-in-out flex flex-col h-screen shadow-2xl md:shadow-lg
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b-2 border-bg-tertiary/50">
                    <Link to="/" className="text-2xl font-black text-text-primary tracking-tighter no-underline hover:text-primary transition-colors flex items-center gap-2 mb-6">
                         <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">NG</div> NewsGuard
                    </Link>
                    <div className="flex items-center gap-3 p-4 bg-bg-secondary rounded-2xl border-2 border-bg-tertiary shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20 overflow-hidden">
                            {user?.avatarId ? (
                                <img
                                    src={(() => { try { return storage.getFileView(BUCKET_ID_IMAGES, user.avatarId).toString(); } catch { return ''; } })()}
                                    alt={user?.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        if ((e.target as HTMLImageElement).parentElement) {
                                            (e.target as HTMLImageElement).parentElement!.innerText = user?.name?.charAt(0) || '?';
                                        }
                                    }}
                                />
                            ) : (
                                user?.name?.charAt(0)
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black text-text-primary uppercase tracking-tight truncate">{user?.name}</p>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary-dark dark:text-primary rounded text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="p-4 flex-1 overflow-y-auto">
                    <SidebarItem
                        to="/"
                        label="Read News"
                        icon={<Newspaper size={20} />}
                        active={false}
                        onClick={closeSidebar}
                    />
                    <SidebarItem
                        to="/dashboard"
                        label="Overview"
                        icon={<LayoutDashboard size={20} />}
                        active={isActive('/dashboard')}
                        onClick={closeSidebar}
                    />
                    <SidebarItem
                        to="/dashboard/profile"
                        label="My Profile"
                        icon={<User size={20} />}
                        active={isActive('/dashboard/profile')}
                        onClick={closeSidebar}
                    />

                    {(user?.role === 'WRITER' || user?.role === 'ADMIN') && (
                        <>
                            <SidebarItem
                                to="/dashboard/my-articles"
                                label="My Articles"
                                icon={<FileText size={20} />}
                                active={isActive('/dashboard/my-articles')}
                                onClick={closeSidebar}
                            />
                            <SidebarItem
                                to="/dashboard/submit"
                                label="Submit News"
                                icon={<PenTool size={20} />}
                                active={isActive('/dashboard/submit')}
                                onClick={closeSidebar}
                            />
                        </>
                    )}

                    {(user?.role === 'EDITOR' || user?.role === 'ADMIN') && (
                        <>
                            <SidebarItem
                                to="/dashboard/review"
                                label="Review Queue"
                                icon={<CheckSquare size={20} />}
                                active={isActive('/dashboard/review')}
                                onClick={closeSidebar}
                            />
                            <SidebarItem
                                to="/dashboard/rejected"
                                label="Rejected News"
                                icon={<Trash2 size={20} />}
                                active={isActive('/dashboard/rejected')}
                                onClick={closeSidebar}
                            />
                        </>
                    )}

                    {user?.role === 'ADMIN' && (
                        <>
                            <SidebarItem
                                to="/dashboard/users"
                                label="User Management"
                                icon={<Users size={20} />}
                                active={isActive('/dashboard/users')}
                                onClick={closeSidebar}
                            />
                            <SidebarItem
                                to="/dashboard/publish"
                                label="Publish Queue"
                                icon={<Send size={20} />}
                                active={isActive('/dashboard/publish')}
                                onClick={closeSidebar}
                            />
                            {SHOW_AI_CONTROL && (
                                <SidebarItem
                                    to="/dashboard/ai-control"
                                    label="AI Management"
                                    icon={<Cpu size={20} />}
                                    active={isActive('/dashboard/ai-control')}
                                    onClick={closeSidebar}
                                />
                            )}
                            <SidebarItem
                                to="/dashboard/audit"
                                label="Audit Trail"
                                icon={<History size={20} />}
                                active={isActive('/dashboard/audit')}
                                onClick={closeSidebar}
                            />
                            <SidebarItem
                                to="/dashboard/stats"
                                label="Analytics"
                                icon={<BarChart2 size={20} />}
                                active={isActive('/dashboard/stats')}
                                onClick={closeSidebar}
                            />
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-bg-tertiary">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-transparent border border-danger text-danger rounded-lg hover:bg-danger/10 transition-colors duration-200"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden bg-bg-primary pt-16 md:pt-0 min-h-screen">
                {/* Desktop Header */}
                <header className="hidden md:flex h-20 bg-bg-primary/90 backdrop-blur-md border-b-2 border-bg-tertiary/50 items-center justify-between px-10 sticky top-0 z-30 shadow-sm">
                    <h2 className="text-2xl font-black text-text-primary capitalize tracking-tight">{location.pathname.split('/').pop() || 'Dashboard'}</h2>
                    <div className="flex items-center gap-6">
                        <NotificationCenter />
                    </div>
                </header>

                <div className="p-6 md:p-10 max-w-6xl mx-auto">
                    <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/my-articles" element={<MyArticles />} />
                        <Route path="/edit/:id" element={<EditArticle />} />
                        <Route path="/submit" element={<SubmitNews />} />
                        <Route path="/review" element={<ReviewNews />} />
                        <Route path="/rejected" element={<RejectedNews />} />
                        <Route path="/publish" element={<PublishNews />} />
                        <Route path="/stats" element={<Stats />} />
                        {SHOW_AI_CONTROL && <Route path="/ai-control" element={<ProtectedRoute allowedRoles={['ADMIN']}><AIControl /></ProtectedRoute>} />}
                        <Route path="/audit" element={<ProtectedRoute allowedRoles={['ADMIN']}><AuditLog /></ProtectedRoute>} />
                        <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
