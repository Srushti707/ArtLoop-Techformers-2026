import { useState, useEffect } from 'react';
import { X, User, Palette, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../useAuth';
import type { Page } from './Nav';
import type { Category } from '../types';

const disciplines: Category[] = [
  'Painting',
  'Digital Art',
  'Illustration',
  'Photography',
  'Mixed Media',
];

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page, artistSlug?: string) => void;
  initialRole?: 'buyer' | 'creator';
  initialMode?: 'signin' | 'signup';
};

export default function AuthModal({
  isOpen,
  onClose,
  onNavigate,
  initialRole = 'buyer',
  initialMode = 'signin',
}: AuthModalProps) {
  const [role, setRole] = useState<'buyer' | 'creator'>(initialRole);
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  const {
    loginBuyerByNameEmail,
    quickLoginDemoBuyer,
    quickLoginDemoCreator,
    loginCreatorByNameEmail,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [discipline, setDiscipline] = useState<Category>('Painting');
  const [university, setUniversity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Synchronize when opening with new props
  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setMode(initialMode);
      setError('');
    }
  }, [isOpen, initialRole, initialMode]);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    if (role === 'buyer') {
      loginBuyerByNameEmail(name, email, password);
    } else {
      loginCreatorByNameEmail(name, email, password, { discipline, university });
    }

    onClose();
    onNavigate('dashboard');
  };

  const handleDemoLogin = () => {
    if (role === 'buyer') {
      quickLoginDemoBuyer();
    } else {
      quickLoginDemoCreator();
    }
    onClose();
    onNavigate('dashboard');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container: Compact, centered, content-driven height */}
      <div className="relative bg-canvas border border-border w-full max-w-[540px] max-h-[90dvh] flex flex-col shadow-2xl z-10 animate-fade-up overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div>
            <span className="editorial-label text-xs block mb-1">
              {mode === 'signin' ? 'Portal Access' : 'Create Account'}
            </span>
            <h2 id="auth-modal-title" className="font-display text-2xl font-bold text-ink">
              {mode === 'signin' ? 'Sign in to ArtLoop' : 'Join ArtLoop'}
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              {mode === 'signin'
                ? 'Access your personalized collector or creator dashboard.'
                : 'Sign up to start collecting artworks or showcasing your portfolio.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-ink transition-colors rounded-full hover:bg-canvas-dark/30 shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Mode Switcher (Sign In vs Sign Up) */}
        <div className="flex border-b border-border text-xs font-semibold bg-canvas-dark/20">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); }}
            className={`flex-1 py-2.5 text-center uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              mode === 'signin'
                ? 'border-coral text-coral font-bold bg-canvas'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2.5 text-center uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              mode === 'signup'
                ? 'border-coral text-coral font-bold bg-canvas'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Role Selection (Buyer vs Student Creator) */}
          <div className="grid grid-cols-2 p-1 bg-canvas-dark/30 border border-border rounded text-xs">
            <button
              type="button"
              onClick={() => { setRole('buyer'); setError(''); }}
              className={`py-2 rounded flex items-center justify-center gap-2 font-medium transition-all ${
                role === 'buyer'
                  ? 'bg-canvas text-ink shadow-sm font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <User className="w-3.5 h-3.5 text-coral" />
              Buyer
            </button>
            <button
              type="button"
              onClick={() => { setRole('creator'); setError(''); }}
              className={`py-2 rounded flex items-center justify-center gap-2 font-medium transition-all ${
                role === 'creator'
                  ? 'bg-canvas text-ink shadow-sm font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-coral" />
              Student Creator
            </button>
          </div>

          {error && <p className="text-xs text-coral font-medium">{error}</p>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="editorial-label text-xs mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'buyer' ? 'e.g. Rahul Sen' : 'e.g. Tara Krishnan'}
                  className="input-field text-sm py-2"
                />
              </div>
            )}

            <div>
              <label className="editorial-label text-xs mb-1 block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'buyer' ? 'e.g. rahul@example.com' : 'e.g. tara@example.com'}
                className="input-field text-sm py-2"
              />
            </div>

            <div>
              <label className="editorial-label text-xs mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field text-sm py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && role === 'creator' && (
              <>
                <div>
                  <label className="editorial-label text-xs mb-1 block">Primary Discipline</label>
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value as Category)}
                    className="input-field text-sm py-2 bg-canvas"
                  >
                    {disciplines.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="editorial-label text-xs mb-1 block">College / Institution</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. NID, Sir J.J. School of Art, etc."
                    className="input-field text-sm py-2"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn-coral w-full justify-center py-2.5 text-sm font-semibold"
            >
              {mode === 'signin'
                ? `Sign in as ${role === 'buyer' ? 'Buyer' : 'Student Creator'}`
                : `Create ${role === 'buyer' ? 'Buyer' : 'Creator'} Account`}
            </button>
          </form>

          {/* Subtle Secondary Demo Account Option */}
          {mode === 'signin' && (
            <div className="bg-coral/5 border border-coral/20 px-3.5 py-2.5 rounded flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-coral shrink-0" />
                <span className="text-muted truncate">
                  Demo account: <strong className="text-ink font-semibold">{role === 'buyer' ? 'Priya Sharma' : 'Aanya Mehta'}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-xs font-semibold text-coral hover:text-ink transition-colors underline shrink-0 ml-2"
              >
                1-Click Sign In
              </button>
            </div>
          )}

          {/* Footer Navigation Helpers */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
            {mode === 'signin' ? (
              <>
                <span className="text-muted">
                  {role === 'buyer' ? "Don't have a buyer account?" : "Don't have a creator account?"}
                </span>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="font-semibold text-coral hover:underline"
                >
                  Sign up as {role === 'buyer' ? 'Buyer' : 'Creator'} →
                </button>
              </>
            ) : (
              <>
                <span className="text-muted">Already have an account?</span>
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); }}
                  className="font-semibold text-coral hover:underline"
                >
                  Sign in instead →
                </button>
              </>
            )}
          </div>

          <p className="text-[11px] text-muted text-center pt-1">
            Local demo authentication · Data saved in browser storage
          </p>
        </div>
      </div>
    </div>
  );
}
