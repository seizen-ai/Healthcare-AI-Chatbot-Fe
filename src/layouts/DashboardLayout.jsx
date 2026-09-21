import { useState, useCallback, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { getAccessToken } from '../services/api';
import SeizenLogo from '../components/SeizenLogo';
import { LogOut, Menu, X } from 'lucide-react';

const NAV = [
    { name: 'Overview',          href: '/dashboard' },
    { name: 'Hospital',          href: '/dashboard/hospital' },
    { name: 'Activation',        href: '/dashboard/activation' },
    { name: 'AI configuration',  href: '/dashboard/ai' },
];

function NavLink({ item, isActive, onClick }) {
    return (
        <Link
            to={item.href}
            onClick={onClick}
            className={`dash-nav-item${isActive ? ' active' : ''}`}
        >
            <span>{item.name}</span>
        </Link>
    );
}

export default function DashboardLayout() {
    const location = useLocation();
    const navigate  = useNavigate();

    const [isBootstrapping, setIsBootstrapping] = useState(() => !getAccessToken());

    useEffect(() => {
        if (getAccessToken()) return;

        let cancelled = false;
        authService.refresh()
            .then(() => {
                if (!cancelled) setIsBootstrapping(false);
            })
            .catch(() => {
                if (!cancelled) {
                    setIsBootstrapping(false);
                    navigate('/login', { replace: true });
                }
            });
        return () => { cancelled = true; };
    }, []);

    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        try   { await authService.logout(); }
        catch {}
        navigate('/login');
    };

    const Sidebar = ({ onLinkClick }) => (
        <div className="dash-sidebar" style={{ height: '100%' }}>
            {/* Brand */}
            <div className="dash-brand">
                <SeizenLogo variant="mark" size={26} textColor="#FFFFFF" aiColor="#20C997" tileBg="#14B8A6" />
            </div>

            {/* Nav */}
            <nav className="dash-nav">
                {NAV.map(item => (
                    <NavLink
                        key={item.href}
                        item={item}
                        isActive={location.pathname === item.href}
                        onClick={onLinkClick}
                    />
                ))}
            </nav>

            {/* Sign out */}
            <div className="dash-nav-footer">
                <button className="dash-nav-item danger" onClick={handleLogout}>
                    <LogOut size={14} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );

    if (isBootstrapping) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0B0F19' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <SeizenLogo variant="icon" size={48} tileBg="#14B8A6" />
                    <span style={{ fontSize: 13, color: '#8896ad' }}>Loading your workspace…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-shell">

            {/* Desktop sidebar */}
            <div className="hidden md:flex" style={{ width: 210, flexShrink: 0 }}>
                <Sidebar />
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
                    {/* Backdrop */}
                    <div
                        onClick={() => setMobileOpen(false)}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
                    />
                    {/* Drawer */}
                    <div className="slide-in-left" style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 210, zIndex: 1 }}>
                        <Sidebar onLinkClick={() => setMobileOpen(false)} />
                        <button
                            onClick={() => setMobileOpen(false)}
                            style={{ position: 'absolute', top: 18, right: 12 }}
                            className="dash-icon-btn"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Main */}
            <div className="dash-main">
                {/* Mobile topbar (only rendered on mobile) */}
                <header className="dash-topbar md:hidden">
                    <button
                        className="dash-icon-btn"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu size={18} />
                    </button>
                    <SeizenLogo variant="mark" size={24} textColor="#FFFFFF" aiColor="#20C997" tileBg="#14B8A6" />
                </header>

                {/* Page */}
                <main className="dash-content">
                    <div className="page-enter" style={{ maxWidth: 940, margin: '0 auto' }}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}