import { useState, useEffect } from 'react';
import { ArrowLeft, Check, AlertCircle, Sparkles } from 'lucide-react';
import type { Page } from './Nav';
import type { Category, CreatorProfile } from '../types';
import { useCreatorProfiles, useCreatorSession, slugify } from '../useCreator';
import { inr } from '../format';

type OnboardingProps = {
  onNavigate: (page: Page, artistSlug?: string) => void;
};

type FormData = {
  name: string;
  email: string;
  discipline: Category;
  bio: string;
  avatar: string;
  location: string;
  university: string;
  startingPrice: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const disciplines: Category[] = ['Painting', 'Digital Art', 'Illustration', 'Photography', 'Mixed Media'];

const defaultAvatar = 'https://images.pexels.com/photos/32323486/pexels-photo-32323486.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const initialData: FormData = {
  name: '',
  email: '',
  discipline: 'Painting',
  bio: '',
  avatar: '',
  location: '',
  university: '',
  startingPrice: '1500',
};

export default function CreatorOnboarding({ onNavigate }: OnboardingProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [created, setCreated] = useState<CreatorProfile | null>(null);
  const { profiles, createProfile } = useCreatorProfiles();
  const { signIn } = useCreatorSession();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!formData.name.trim()) {
      errs.name = 'Please enter your display name.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.university.trim()) {
      errs.university = 'Please enter your college or institution.';
    }

    if (!formData.location.trim()) {
      errs.location = 'Please enter your city.';
    }

    if (!formData.bio.trim()) {
      errs.bio = 'Please write a short bio.';
    } else if (formData.bio.trim().length < 20) {
      errs.bio = 'Bio should be at least 20 characters.';
    }

    const price = parseFloat(formData.startingPrice);
    if (isNaN(price) || price <= 0) {
      errs.startingPrice = 'Please enter a valid starting price.';
    } else if (price < 500) {
      errs.startingPrice = 'Starting price must be at least ₹500.';
    }

    return errs;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const slug = slugify(formData.name.trim());
    const existing = profiles.find((p) => p.slug === slug);
    if (existing) {
      setErrors({ name: 'A creator with this name already exists. Try adding a surname.' });
      return;
    }

    const profile = createProfile({
      name: formData.name.trim(),
      email: formData.email.trim(),
      discipline: formData.discipline,
      bio: formData.bio.trim(),
      avatar: formData.avatar.trim() || defaultAvatar,
      location: formData.location.trim(),
      university: formData.university.trim(),
      startingPrice: parseFloat(formData.startingPrice),
    });

    signIn(profile);
    setCreated(profile);
    window.scrollTo(0, 0);
  };

  if (created) {
    return (
      <div className="pt-28 md:pt-36 min-h-screen">
        <div className="max-w-2xl mx-auto px-6 md:px-12 py-20">
          <div className="text-center animate-fade-up">
            <div className="w-20 h-20 mx-auto mb-8 border-2 border-coral rounded-full flex items-center justify-center bg-coral/10">
              <Check className="w-10 h-10 text-coral" />
            </div>
            <span className="editorial-label mb-4 block">Creator profile created</span>
            <h1 className="font-display font-bold text-ink text-display-2 mb-6">
              Welcome to ArtLoop, {created.name.split(' ')[0]}.
            </h1>
            <p className="text-lg text-ink-soft leading-relaxed mb-12">
              Your creator profile is live. Now you can upload your artwork, publish it to the Discover marketplace, and receive enquiries from buyers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => onNavigate('upload')} className="btn-coral">
                Upload your first artwork
              </button>
              <button onClick={() => onNavigate('dashboard')} className="btn-outline">
                Go to dashboard
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
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-sm text-muted hover:text-coral transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </button>

        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-coral" />
            <span className="editorial-label">Become a Creator</span>
          </div>
          <h1 className="font-display font-bold text-ink text-display-2 mb-6">
            Set up your<br />
            <span className="italic font-light text-coral">creator profile.</span>
          </h1>
          <p className="text-lg text-ink-soft mb-12 max-w-xl">
            Join ArtLoop as a student creator. Fill in your details below — you can edit everything later from your dashboard. No account or password needed for this demo.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="name" className="editorial-label mb-2 block">Display name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="input-field"
                placeholder="e.g. Tara Krishnan"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                  <AlertCircle className="w-4 h-4" />{errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="editorial-label mb-2 block">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="input-field"
                placeholder="you@email.com"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                  <AlertCircle className="w-4 h-4" />{errors.email}
                </p>
              )}
            </div>

            {/* Discipline */}
            <div>
              <label className="editorial-label mb-2 block">Primary discipline</label>
              <div className="flex flex-wrap gap-2">
                {disciplines.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleChange('discipline', d)}
                    className={`px-4 py-2 text-sm font-medium border transition-all duration-300 ${
                      formData.discipline === d
                        ? 'bg-ink text-canvas border-ink'
                        : 'bg-transparent text-ink border-border hover:border-ink'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* University + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label htmlFor="university" className="editorial-label mb-2 block">College / Institution</label>
                <input
                  id="university"
                  type="text"
                  value={formData.university}
                  onChange={(e) => handleChange('university', e.target.value)}
                  className="input-field"
                  placeholder="e.g. NID, Ahmedabad"
                  aria-invalid={!!errors.university}
                />
                {errors.university && (
                  <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                    <AlertCircle className="w-4 h-4" />{errors.university}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="location" className="editorial-label mb-2 block">City</label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="input-field"
                  placeholder="e.g. Pune, Maharashtra"
                  aria-invalid={!!errors.location}
                />
                {errors.location && (
                  <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                    <AlertCircle className="w-4 h-4" />{errors.location}
                  </p>
                )}
              </div>
            </div>

            {/* Starting price */}
            <div>
              <label htmlFor="startingPrice" className="editorial-label mb-2 block">
                Commission starting price (INR)
              </label>
              <div className="flex items-baseline">
                <span className="font-display text-2xl text-muted mr-2">₹</span>
                <input
                  id="startingPrice"
                  type="number"
                  min={500}
                  step={100}
                  value={formData.startingPrice}
                  onChange={(e) => handleChange('startingPrice', e.target.value)}
                  className="input-field"
                  placeholder="1500"
                  aria-invalid={!!errors.startingPrice}
                />
              </div>
              {errors.startingPrice && (
                <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                  <AlertCircle className="w-4 h-4" />{errors.startingPrice}
                </p>
              )}
              <p className="text-xs text-muted mt-2">
                Buyers must meet this minimum when commissioning you.
              </p>
            </div>

            {/* Avatar URL */}
            <div>
              <label htmlFor="avatar" className="editorial-label mb-2 block">Profile image URL (optional)</label>
              <input
                id="avatar"
                type="url"
                value={formData.avatar}
                onChange={(e) => handleChange('avatar', e.target.value)}
                className="input-field"
                placeholder="https://..."
              />
              <p className="text-xs text-muted mt-2">Leave blank to use a default placeholder.</p>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="editorial-label mb-2 block">Short bio</label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="input-field resize-none min-h-[100px] py-3"
                placeholder="Tell buyers about your practice, themes, and what inspires your work..."
                aria-invalid={!!errors.bio}
                rows={4}
              />
              {errors.bio && (
                <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                  <AlertCircle className="w-4 h-4" />{errors.bio}
                </p>
              )}
              <p className="text-xs text-muted mt-2">{formData.bio.length} characters</p>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button type="submit" className="btn-coral w-full sm:w-auto justify-center">
                Create my creator profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
