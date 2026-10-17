import { useState, useEffect } from 'react';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import ArtworkImage from './ArtworkImage';
import type { Page } from './Nav';
import type { Commission } from '../types';
import { getArtist } from '../data';
import { useCommissions } from '../useCommissions';
import { useAuth } from '../useAuth';
import { inr, formatINR } from '../format';
import { validateBudget } from '../validation';

type CommissionFormProps = {
  artistSlug?: string;
  onNavigate: (page: Page, artistSlug?: string) => void;
};

type FormData = {
  buyerName: string;
  buyerEmail: string;
  projectDescription: string;
  budget: string;
  deadline: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function CommissionForm({ artistSlug, onNavigate }: CommissionFormProps) {
  const { buyer } = useAuth();
  const [formData, setFormData] = useState<FormData>(() => ({
    buyerName: buyer?.name || '',
    buyerEmail: buyer?.email || '',
    projectDescription: '',
    budget: '',
    deadline: '',
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [savedCommission, setSavedCommission] = useState<Commission | null>(null);
  const { addCommission } = useCommissions();

  const artist = artistSlug ? getArtist(artistSlug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
    setFormData({
      buyerName: buyer?.name || '',
      buyerEmail: buyer?.email || '',
      projectDescription: '',
      budget: '',
      deadline: '',
    });
    setErrors({});
    setSubmitted(false);
    setSavedCommission(null);
  }, [artistSlug, buyer]);

  if (!artist) {
    return (
      <div className="pt-40 min-h-screen flex flex-col items-center justify-center">
        <p className="font-display text-4xl text-ink mb-4">No artist selected.</p>
        <p className="text-muted mb-8">Browse the collection and choose an artist to commission.</p>
        <button onClick={() => onNavigate('discover')} className="btn-coral">
          Explore the artists
        </button>
      </div>
    );
  }

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!formData.buyerName.trim()) {
      errs.buyerName = 'Please enter your name.';
    } else if (formData.buyerName.trim().length < 2) {
      errs.buyerName = 'Name must be at least 2 characters.';
    }

    if (!formData.buyerEmail.trim()) {
      errs.buyerEmail = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail.trim())) {
      errs.buyerEmail = 'Please enter a valid email address.';
    }

    if (!formData.projectDescription.trim()) {
      errs.projectDescription = 'Please describe your project.';
    } else if (formData.projectDescription.trim().length < 20) {
      errs.projectDescription = 'Please provide at least 20 characters of detail.';
    }

    const budgetError = validateBudget(formData.budget, artist.startingPrice);
    if (budgetError) {
      errs.budget = budgetError;
    }

    if (!formData.deadline) {
      errs.deadline = 'Please select a deadline.';
    } else {
      const selected = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errs.deadline = 'Deadline cannot be in the past.';
      }
    }

    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const commission = addCommission({
      artistId: artist.id,
      artistName: artist.name,
      buyerId: buyer?.id,
      buyerName: formData.buyerName.trim(),
      buyerEmail: formData.buyerEmail.trim(),
      projectDescription: formData.projectDescription.trim(),
      budget: parseFloat(formData.budget),
      deadline: formData.deadline,
    });

    setSavedCommission(commission);
    setSubmitted(true);
    window.scrollTo(0, 0);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'budget') {
      const budgetError = validateBudget(value, artist.startingPrice);
      setErrors((prev) => ({ ...prev, budget: budgetError ?? undefined }));
      return;
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (submitted && savedCommission) {
    return (
      <div className="pt-28 md:pt-36 min-h-screen">
        <div className="max-w-2xl mx-auto px-6 md:px-12 py-20">
          <div className="text-center animate-fade-up">
            <div className="w-20 h-20 mx-auto mb-8 border-2 border-coral rounded-full flex items-center justify-center bg-coral/10">
              <Check className="w-10 h-10 text-coral" />
            </div>
            <span className="editorial-label mb-4 block">Commission request sent</span>
            <h1 className="font-display font-bold text-ink text-display-2 mb-6">
              Your request is in.
            </h1>
            <p className="text-lg text-ink-soft leading-relaxed mb-12">
              {artist.name.split(' ')[0]} will review your project brief and respond. You can track status, updates, and deliverables in your Buyer Dashboard.
            </p>

            {/* Summary */}
            <div className="border border-border p-8 text-left mb-12 bg-canvas-dark/20">
              <p className="editorial-label mb-6">Request summary</p>
              <div className="space-y-4">
                {[
                  { label: 'Artist', value: artist.name },
                  { label: 'Your name', value: savedCommission.buyerName },
                  { label: 'Budget', value: inr(savedCommission.budget) },
                  { label: 'Deadline', value: new Date(savedCommission.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Status', value: 'Pending review' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-3 border-b border-border-soft last:border-0">
                    <span className="text-sm text-muted">{item.label}</span>
                    <span className="text-sm font-medium text-ink">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => onNavigate('dashboard')} className="btn-coral">
                Track in Buyer Dashboard
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    buyerName: buyer?.name || '',
                    buyerEmail: buyer?.email || '',
                    projectDescription: '',
                    budget: '',
                    deadline: '',
                  });
                  onNavigate('discover');
                }}
                className="btn-outline"
              >
                Explore more art
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-36 min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <button
          onClick={() => onNavigate('artist', artist.slug)}
          className="flex items-center gap-2 text-sm text-muted hover:text-coral transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to {artist.name}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Form side */}
          <div className="lg:col-span-7">
            <span className="editorial-label mb-4 block">Commission request</span>
            <h1 className="font-display font-bold text-ink text-display-2 mb-6">
              Tell {artist.name.split(' ')[0]} what
              <br />
              you have in mind.
              <span className="italic font-light text-coral"> Describe your vision.</span>
            </h1>
            <p className="text-lg text-ink-soft mb-12 max-w-xl">
              Fill out the brief below. No payment is required — this is a request, not a transaction. The artist will review and respond.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              {/* Buyer name */}
              <div>
                <label htmlFor="buyerName" className="editorial-label mb-2 block">
                  Your name
                </label>
                <input
                  id="buyerName"
                  type="text"
                  value={formData.buyerName}
                  onChange={(e) => handleChange('buyerName', e.target.value)}
                  className="input-field"
                  placeholder="Jane Doe"
                  aria-invalid={!!errors.buyerName}
                />
                {errors.buyerName && (
                  <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                    <AlertCircle className="w-4 h-4" />
                    {errors.buyerName}
                  </p>
                )}
              </div>

              {/* Buyer email */}
              <div>
                <label htmlFor="buyerEmail" className="editorial-label mb-2 block">
                  Your email
                </label>
                <input
                  id="buyerEmail"
                  type="email"
                  value={formData.buyerEmail}
                  onChange={(e) => handleChange('buyerEmail', e.target.value)}
                  className="input-field"
                  placeholder="jane@email.com"
                  aria-invalid={!!errors.buyerEmail}
                />
                {errors.buyerEmail && (
                  <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                    <AlertCircle className="w-4 h-4" />
                    {errors.buyerEmail}
                  </p>
                )}
              </div>

              {/* Project description */}
              <div>
                <label htmlFor="projectDescription" className="editorial-label mb-2 block">
                  Project description
                </label>
                <textarea
                  id="projectDescription"
                  value={formData.projectDescription}
                  onChange={(e) => handleChange('projectDescription', e.target.value)}
                  className="input-field resize-none min-h-[120px] py-3"
                  placeholder="Describe what you'd like — subject, mood, size, colors, any reference points..."
                  aria-invalid={!!errors.projectDescription}
                  rows={5}
                />
                {errors.projectDescription && (
                  <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                    <AlertCircle className="w-4 h-4" />
                    {errors.projectDescription}
                  </p>
                )}
                <p className="text-xs text-muted mt-2">{formData.projectDescription.length} characters</p>
              </div>

              {/* Budget + Deadline row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="budget" className="editorial-label mb-2 block">
                    Your Budget (INR)
                  </label>
                  <div className="flex items-baseline">
                    <span className="font-display text-2xl text-muted mr-2">₹</span>
                    <input
                      id="budget"
                      type="number"
                      min={artist.startingPrice}
                      step="100"
                      value={formData.budget}
                      onChange={(e) => handleChange('budget', e.target.value)}
                      className="input-field"
                      placeholder={String(artist.startingPrice)}
                      aria-invalid={!!errors.budget}
                    />
                  </div>
                  {errors.budget && (
                    <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                      <AlertCircle className="w-4 h-4" />
                      {errors.budget}
                    </p>
                  )}
                  <p className="text-xs text-muted mt-2">
                    This artist accepts commissions starting at ₹{formatINR(artist.startingPrice)}.
                  </p>
                </div>

                <div>
                  <label htmlFor="deadline" className="editorial-label mb-2 block">
                    Deadline
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    className="input-field"
                    aria-invalid={!!errors.deadline}
                  />
                  {errors.deadline && (
                    <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                      <AlertCircle className="w-4 h-4" />
                      {errors.deadline}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6">
                <button type="submit" className="btn-coral w-full sm:w-auto justify-center">
                  Send commission request
                </button>
              </div>
            </form>
          </div>

          {/* Artist summary side */}
          <div className="lg:col-span-5 lg:pl-8">
            <div className="sticky top-32">
              <span className="editorial-label mb-4 block">You're commissioning</span>
              <div className="image-zoom relative aspect-[4/5] border border-border mb-6">
                <ArtworkImage
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-full h-full"
                />
              </div>
              <p className="font-display text-2xl font-bold text-ink mb-2">{artist.name}</p>
              <p className="text-sm text-muted mb-4">{artist.discipline} · {artist.university}</p>
              <p className="text-sm text-ink-soft leading-relaxed mb-6">{artist.bio}</p>
              <div className="flex items-center justify-between py-4 border-t border-border">
                <span className="text-sm text-muted">Starting price</span>
                <span className="font-display text-xl text-ink">{inr(artist.startingPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
