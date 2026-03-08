export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 dark:border-slate-700/60 py-6 mt-4">
      <div className="max-w-[1200px] mx-auto px-6 text-sm text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
        <p>© {new Date().getFullYear()} BloomAI</p>
        <p>Friendly, focused learning for every student.</p>
      </div>
    </footer>
  );
}
