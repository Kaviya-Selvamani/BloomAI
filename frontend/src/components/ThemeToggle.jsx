import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Info, CheckCircle2, XCircle } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext.jsx';

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

const luminance = ({ r, g, b }) => {
  const srgb = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

const contrastRatio = (hex1, hex2) => {
  const L1 = luminance(hexToRgb(hex1));
  const L2 = luminance(hexToRgb(hex2));
  const bright = Math.max(L1, L2);
  const dark = Math.min(L1, L2);
  return Number(((bright + 0.05) / (dark + 0.05)).toFixed(2));
};

const samplePalettes = {
  light: {
    name: 'Light Mode',
    background: '#f7fafc',
    surface: '#ffffff',
    text: '#0f172a',
    primary: '#6366f1',
    accent: '#06b6d4',
    muted: '#6b7280'
  },
  dark: {
    name: 'Dark Mode',
    background: '#0f172a',
    surface: '#0b1220',
    text: '#e6eef8',
    primary: '#6366f1',
    accent: '#0891b2',
    muted: '#94a3b8'
  }
};

const PASS_NORMAL = 4.5;
const PASS_LARGE = 3.0;

export default function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  const [showPreview, setShowPreview] = useState(false);
  const current = theme === 'dark' ? samplePalettes.dark : samplePalettes.light;

  const checks = [
    { a: current.text, b: current.background, label: 'Text / Background' },
    { a: current.text, b: current.surface, label: 'Text / Surface' },
    { a: current.primary, b: current.background, label: 'Primary / Background' },
    { a: current.accent, b: current.background, label: 'Accent / Background' }
  ].map(c => ({ ...c, ratio: contrastRatio(c.a, c.b) }));

  return (
    <div className="relative flex items-center gap-3">
      <motion.button
        onClick={toggle}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all cursor-pointer ${
          theme === 'dark'
            ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
        }`}
        aria-label="Toggle theme"
        role="switch"
        aria-checked={theme === 'dark'}
        title="Toggle theme"
      >
        <motion.span layout className="w-8 h-4 rounded-full p-0.5 bg-neutral-700/30 flex items-center">
          <motion.span
            layout
            initial={false}
            animate={{ x: theme === 'dark' ? 16 : 0 }}
            transition={{ type: 'spring', stiffness: 700, damping: 30 }}
            className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm"
          >
            {theme === 'dark' ? <Moon size={14} className="text-indigo-600" /> : <Sun size={14} className="text-amber-400" />}
          </motion.span>
        </motion.span>
        {/* Removed textual label per request; only icons shown */}
      </motion.button>

      <button
        onClick={() => setShowPreview(p => !p)}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark' ? 'text-slate-400 hover:text-slate-100' : 'text-slate-500 hover:text-slate-900'
        }`}
        aria-label="Theme palette info"
      >
        <Info size={16} />
      </button>

      {showPreview && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{current.name} — Palette & Accessibility</h4>
            <button onClick={() => setShowPreview(false)} className="text-xs text-muted">Close</button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            {Object.entries(current).filter(([k]) => k !== 'name').map(([k, v]) => (
              <div key={k} className="flex flex-col items-center gap-2">
                <div style={{ background: v }} className="w-16 h-12 rounded-md border border-neutral-200 dark:border-neutral-700" />
                <div className="text-xs text-center text-slate-700 dark:text-slate-300 font-mono">{k}</div>
                <div className="text-xs text-center text-slate-500 dark:text-slate-400 font-mono">{v}</div>
              </div>
            ))}
          </div>

          <div>
            {checks.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-700/40">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{c.label}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">Ratio: {c.ratio}:1</div>
                </div>
                <div>
                  {c.ratio >= PASS_NORMAL ? (
                    <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 /> <span className="text-xs">AA</span></div>
                  ) : c.ratio >= PASS_LARGE ? (
                    <div className="flex items-center gap-2 text-amber-400"><CheckCircle2 /> <span className="text-xs">AA Large</span></div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400"><XCircle /> <span className="text-xs">Fail</span></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">WCAG targets: <strong>4.5</strong> for normal text, <strong>3.0</strong> for large text.</div>
        </div>
      )}
    </div>
  );
}
