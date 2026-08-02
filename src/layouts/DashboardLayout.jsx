import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { 
    LayoutDashboard, 
    Building2, 
    Bot, 
    Settings, 
    LogOut, 
    Menu, 
    X 
} from 'lucide-react';

export default function DashboardLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Hospital Settings', href: '/dashboard/hospital', icon: Building2 },
        { name: 'AI Configuration', href: '/dashboard/ai', icon: Bot },
        { name: 'System Settings', href: '/dashboard/settings', icon: Settings },
    ];

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if API fails, force redirect to clear frontend state
            navigate('/login'); 
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Seizen AI</h1>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive 
                                        ? 'bg-blue-50 text-blue-700' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl z-50">
                        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                            <h1 className="text-xl font-bold text-gray-900">Seizen AI</h1>
                            <button onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        <nav className="flex-1 px-4 py-6 space-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                                            isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
                    <button 
                        className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex-1 md:flex-none flex justify-end items-center gap-4 w-full">
                        {/* Placeholder for User Profile / Status */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                                AD
                            </div>
                            <span className="hidden sm:block text-sm font-medium text-gray-700">Admin User</span>
                        </div>
                    </div>
                </header>

                {/* Page Content Injection Point */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}