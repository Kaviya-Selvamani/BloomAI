import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const showLearningProgress = location.pathname === '/profile';

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50/40 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="py-10 flex-1">
        <div className={`max-w-[1200px] mx-auto px-6 grid grid-cols-1 ${showLearningProgress ? 'lg:grid-cols-12' : ''} gap-8`}>
          <section className={`${showLearningProgress ? 'lg:col-span-8 xl:col-span-9' : 'w-full'} min-w-0`}>{children}</section>
          {!isAuthPage && showLearningProgress && (
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <Sidebar />
            </aside>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
