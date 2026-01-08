import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, Wand2, History, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { to: '/dashboard', icon: Wand2, label: 'Generator' },
    { to: '/history', icon: History, label: 'History' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 border-r border-glass-border bg-glass/30 backdrop-blur-xl p-6 flex flex-col"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent glow-primary">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold gradient-text">Vistrita</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-foreground border border-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-glass'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="justify-start gap-3 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
