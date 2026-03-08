import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useMemo, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { BookOpen, ChevronDown, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const hasToken = Boolean(localStorage.getItem('token'));

  const isLoggedIn = useMemo(() => Boolean(user && hasToken), [user, hasToken]);

  useEffect(() => {
    if (!hasToken && user) {
      setUser(null);
    }
  }, [hasToken, user, setUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">B</div>
          <div>
            <p className="font-poppins text-xl leading-none">BloomAI</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Learn smarter every day</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {isLoggedIn && !isAuthPage && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
              <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 transition-colors">Dashboard</Link>
              <Link to="/history" className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 transition-colors">History</Link>
              <Link to="/profile" className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 transition-colors">Profile</Link>
            </nav>
          )}

          <ThemeToggle />

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown((v) => !v)}
                className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200 flex items-center justify-center font-semibold">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Grade {user.grade}</p>
                </div>
                <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-lg"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <User size={16} /> Profile
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <BookOpen size={16} /> My Learning
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Login</Link>
              <Link to="/signup" className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
