import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SubmitNews from './dashboard/SubmitNews';
import ReviewNews from './dashboard/ReviewNews';
import MyArticles from './dashboard/MyArticles';
import EditArticle from './dashboard/EditArticle';
import PublishNews from './dashboard/PublishNews';

import Overview from './dashboard/Overview';
import Stats from './dashboard/Stats';
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
    LogOut,
    Home
} from 'lucide-react';

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
        className={`flex items-center px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${active
            ? 'bg-blue-500/10 text-white border-l-4 border-primary'
            : 'text-text-secondary hover:bg-white/5 border-l-4 border-transparent'
            }`}
    >
        <span className="mr-3">{icon}</span>
        <span className="font-medium">{label}</span>
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
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-bg-secondary border-b border-bg-tertiary flex items-center justify-between px-4 z-40">
                <div className="flex items-center">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-white hover:bg-white/10 rounded-md transition-colors"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span className="ml-4 font-bold text-lg">NewsGuard</span>
                </div>
                <div className="flex items-center gap-4">
                    <NotificationCenter />
                </div>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    onClick={closeSidebar}
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                />
            )}

            {/* Sidebar */}
            {/* Sidebar */}
            <aside className={`
                fixed md:sticky inset-y-0 left-0 z-50 w-64 bg-bg-secondary border-r border-bg-tertiary 
                transform transition-transform duration-300 ease-in-out flex flex-col h-screen
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-bg-tertiary">
                    <h2 className="text-2xl font-bold text-primary">NewsGuard</h2>
                    <div className="mt-2 text-sm text-text-secondary flex items-center">
                        <span className="truncate max-w-[120px]">{user?.name}</span>
                        <span className="ml-2 px-2 py-0.5 bg-bg-tertiary rounded text-xs text-text-accent font-medium">
                            {user?.role}
                        </span>
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
                        <SidebarItem
                            to="/dashboard/review"
                            label="Review Queue"
                            icon={<CheckSquare size={20} />}
                            active={isActive('/dashboard/review')}
                            onClick={closeSidebar}
                        />
                    )}

                    {user?.role === 'ADMIN' && (
                        <>
                            <SidebarItem
                                to="/dashboard/publish"
                                label="Publish Queue"
                                icon={<Send size={20} />}
                                active={isActive('/dashboard/publish')}
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
                <header className="hidden md:flex h-16 bg-bg-primary/50 backdrop-blur-md border-b border-bg-tertiary items-center justify-between px-10 sticky top-0 z-30">
                    <h2 className="text-xl font-bold text-text-primary capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</h2>
                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                    </div>
                </header>

                <div className="p-6 md:p-10 max-w-6xl mx-auto">
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
        </div>
    );
};

export default Dashboard;
