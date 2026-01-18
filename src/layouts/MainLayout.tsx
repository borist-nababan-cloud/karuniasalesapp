import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAttendanceTracker } from '@/hooks/useAttendanceTracker';
import { useProfileSync } from '@/hooks/useProfileSync';

export default function MainLayout() {
    const { logout, isApproved } = useAuthStore((state) => state);
    const navigate = useNavigate();

    useAttendanceTracker();
    useProfileSync();

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
            {/* Header - Hidden on small screens if you want a pure app feel, or stick to top */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">Sales App</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Desktop Utilities */}
                            <Button onClick={handleLogout} variant="ghost" size="sm">
                                <LogOut className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Logout</span>
                                <span className="sm:hidden">Exit</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Outlet />
            </main>

            {/* Application Footer */}
            <div className="text-center pb-8 text-xs text-slate-400">
                <p>Karunia Apps @nababancloud.net 2025</p>
                <p>Ver 1.1 Trial Version.</p>
            </div>

            {/* Mobile Bottom Navigation - Visible on all screens per user request */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
                <div className="flex justify-around items-center h-16">
                    <NavLink
                        to="/home"
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                            )
                        }
                    >
                        <Home className="h-5 w-5" />
                        <span>Home</span>
                    </NavLink>

                    <NavLink
                        to="/dashboard"
                        onClick={(e) => {
                            if (!isApproved) {
                                e.preventDefault();
                                alert("Dashboard requires approval.");
                            }
                        }}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
                                !isApproved && "opacity-50 cursor-not-allowed"
                            )
                        }
                    >
                        <ClipboardList className="h-5 w-5" />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                            )
                        }
                    >
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                    </NavLink>
                </div>
            </nav>
        </div>
    );
}
