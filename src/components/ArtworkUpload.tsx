import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, AlertCircle, Upload, Image as ImageIcon, Save, Send } from 'lucide-react';
import type { Page } from './Nav';
import type { Category, CreatorArtwork, ArtworkStatus } from '../types';
import { useCreatorArtworks } from '../useCreator';
import { useCreatorSession } from '../useCreator';
import { saveImage, deleteImage } from '../imageStore';
import { inr } from '../format';

type UploadProps = {
  onNavigate: (page: Page, artistSlug?: string) => void;
  onOpenAuth?: (initialRole?: 'buyer' | 'creator', initialMode?: 'signin' | 'signup') => void;
  editId?: string;
};

type FormData = {
  title: string;
  description: string;
  category: Category;
  price: string;
  aspect: 'portrait' | 'landscape' | 'square';
  imageFile: File | null;
  imagePreview: string | null;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const categories: Category[] = ['Painting', 'Digital Art', 'Illustration', 'Photography', 'Mixed Media'];

const initialData: FormData = {
  title: '',
  description: '',
  category: 'Painting',
  price: '',
  aspect: 'landscape',
  imageFile: null,
  imagePreview: null,
};

function genImageKey(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function ArtworkUpload({ onNavigate, onOpenAuth, editId }: UploadProps) {
  const { creator } = useCreatorSession();
  const { artworks, addArtwork, updateArtwork, deleteArtwork } = useCreatorArtworks();
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [savedArtwork, setSavedArtwork] = useState<CreatorArtwork | null>(null);
  const [savedAction, setSavedAction] = useState<'draft' | 'published' | null>(null);
  const [existingImageKey, setExistingImageKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load existing artwork for editing
  useEffect(() => {
    if (!editId) return;
    const existing = artworks.find((a) => a.id === editId);
    if (!existing) return;
    setFormData({
      title: existing.title,
      description: existing.description,
      category: existing.category,
      price: String(existing.price),
      aspect: existing.aspect,
      imageFile: null,
      imagePreview: null,
    });
    setExistingImageKey(existing.imageKey);
  }, [editId, artworks]);

  if (!creator) {
    return (
      <div className="pt-40 min-h-screen flex flex-col items-center justify-center">
        <p className="font-display text-4xl text-ink mb-4">Become a creator first.</p>
        <p className="text-muted mb-8">You need a creator profile to upload artwork.</p>
        <button
          onClick={() => (onOpenAuth ? onOpenAuth('creator', 'signup') : onNavigate('dashboard'))}
          className="btn-coral"
        >
          Set up creator profile
        </button>
      </div>
    );
  }

  const validate = (forPublish: boolean): FormErrors => {
    const errs: FormErrors = {};
    if (!formData.title.trim()) {
      errs.title = 'Please enter a title.';
    }
    if (forPublish) {
      if (!formData.description.trim()) {
        errs.description = 'Please add a description.';
      }
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        errs.price = 'Please enter a valid price.';
      } else if (price < 100) {
        errs.price = 'Price must be at least ₹100.';
      }
      if (!formData.imageFile && !existingImageKey) {
        errs.imageFile = 'Please upload an image to publish.';
      }
    }
    return errs;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, imageFile: 'Please select an image file.' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, imageFile: 'Image must be under 10MB.' }));
      return;
    }
    const preview = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, imageFile: file, imagePreview: preview }));
    setErrors((prev) => ({ ...prev, imageFile: undefined }));
  };

  const handleSubmit = async (status: ArtworkStatus) => {
    const errs = validate(status === 'published');
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    let imageKey = existingImageKey;
    if (formData.imageFile) {
      imageKey = existingImageKey || genImageKey();
      await saveImage(imageKey, formData.imageFile);
    }

    const baseData = {
      creatorId: creator.id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      aspect: formData.aspect,
      imageKey: imageKey || '',
      status,
    };

    let result: CreatorArtwork;
    if (editId) {
      updateArtwork(editId, baseData);
      result = { ...baseData, id: editId, createdAt: '', updatedAt: new Date().toISOString() } as CreatorArtwork;
    } else {
      result = addArtwork(baseData);
    }

    setSavedArtwork(result);
    setSavedAction(status === 'published' ? 'published' : 'draft');
    window.scrollTo(0, 0);
  };

  const handleDeleteExisting = async () => {
    if (!editId) return;
    const existing = artworks.find((a) => a.id === editId);
    if (existing?.imageKey) {
      await deleteImage(existing.imageKey);
    }
    deleteArtwork(editId);
    onNavigate('dashboard');
  };

  if (savedArtwork && savedAction) {
    return (
      <div className="pt-28 md:pt-36 min-h-screen">
        <div className="max-w-2xl mx-auto px-6 md:px-12 py-20">
          <div className="text-center animate-fade-up">
            <div className="w-20 h-20 mx-auto mb-8 border-2 border-coral rounded-full flex items-center justify-center bg-coral/10">
              <Check className="w-10 h-10 text-coral" />
            </div>
            <span className="editorial-label mb-4 block">
              {savedAction === 'published' ? 'Artwork published' : 'Draft saved'}
            </span>
            <h1 className="font-display font-bold text-ink text-display-2 mb-6">
              {savedAction === 'published' ? 'Your work is live.' : 'Saved as draft.'}
            </h1>
            <p className="text-lg text-ink-soft leading-relaxed mb-12">
              {savedAction === 'published'
                ? `"${savedArtwork.title}" is now visible in the Discover marketplace. Buyers can send you enquiries.`
                : `"${savedArtwork.title}" is saved privately. Publish it from your dashboard when you're ready.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => onNavigate('dashboard')} className="btn-coral">
                Go to dashboard
              </button>
              <button
                onClick={() => {
                  setSavedArtwork(null);
                  setSavedAction(null);
                  setFormData(initialData);
                  setExistingImageKey(null);
                  onNavigate('upload');
                }}
                className="btn-outline"
              >
                Upload another
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
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-sm text-muted hover:text-coral transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Form side */}
          <div className="lg:col-span-7">
            <span className="editorial-label mb-4 block">
              {editId ? 'Edit artwork' : 'Upload artwork'}
            </span>
            <h1 className="font-display font-bold text-ink text-display-2 mb-6">
              Share your work<br />
              <span className="italic font-light text-coral">with the world.</span>
            </h1>
            <p className="text-lg text-ink-soft mb-12 max-w-xl">
              Upload a piece, add details and pricing, then publish to the marketplace or save as a draft.
            </p>

            <form className="space-y-8" noValidate onSubmit={(e) => { e.preventDefault(); handleSubmit('published'); }}>
              {/* Image upload */}
              <div>
                <label className="editorial-label mb-2 block">Artwork image</label>
                <div
                  className="relative border border-dashed border-border hover:border-ink transition-colors cursor-pointer overflow-hidden"
                  style={{ aspectRatio: formData.aspect === 'portrait' ? '3/4' : formData.aspect === 'square' ? '1/1' : '4/3' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.imagePreview ? (
                    <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : existingImageKey ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted bg-canvas-dark/20">
                      <ImageIcon className="w-10 h-10 mb-3" />
                      <p className="text-sm">Using previously uploaded image</p>
                      <p className="text-xs mt-1">Click to replace</p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted">
                      <Upload className="w-10 h-10 mb-3" />
                      <p className="text-sm">Click to upload an image</p>
                      <p className="text-xs mt-1">PNG, JPG, WebP — up to 10MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {errors.imageFile && (
                  <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                    <AlertCircle className="w-4 h-4" />{errors.imageFile}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="editorial-label mb-2 block">Title</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="input-field"
                  placeholder="e.g. Monsoon in Bandra"
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                    <AlertCircle className="w-4 h-4" />{errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="editorial-label mb-2 block">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="input-field resize-none min-h-[100px] py-3"
                  placeholder="Describe the piece, your process, materials, inspiration..."
                  rows={4}
                />
                {errors.description && (
                  <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                    <AlertCircle className="w-4 h-4" />{errors.description}
                  </p>
                )}
              </div>

              {/* Category + Aspect */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="editorial-label mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleChange('category', c)}
                        className={`px-4 py-2 text-sm font-medium border transition-all duration-300 ${
                          formData.category === c
                            ? 'bg-ink text-canvas border-ink'
                            : 'bg-transparent text-ink border-border hover:border-ink'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="editorial-label mb-2 block">Format</label>
                  <div className="flex flex-wrap gap-2">
                    {(['landscape', 'portrait', 'square'] as const).map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => handleChange('aspect', a)}
                        className={`px-4 py-2 text-sm font-medium border capitalize transition-all duration-300 ${
                          formData.aspect === a
                            ? 'bg-ink text-canvas border-ink'
                            : 'bg-transparent text-ink border-border hover:border-ink'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="editorial-label mb-2 block">Price (INR)</label>
                <div className="flex items-baseline">
                  <span className="font-display text-2xl text-muted mr-2">₹</span>
                  <input
                    id="price"
                    type="number"
                    min={100}
                    step={100}
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="input-field"
                    placeholder="2500"
                    aria-invalid={!!errors.price}
                  />
                </div>
                {errors.price && (
                  <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                    <AlertCircle className="w-4 h-4" />{errors.price}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button type="submit" className="btn-coral justify-center">
                  <Send className="w-4 h-4" />
                  Publish to marketplace
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('draft')}
                  className="btn-outline justify-center"
                >
                  <Save className="w-4 h-4" />
                  Save as draft
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={handleDeleteExisting}
                    className="text-sm text-muted hover:text-coral-dim transition-colors sm:ml-auto"
                  >
                    Delete artwork
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Preview side */}
          <div className="lg:col-span-5 lg:pl-8">
            <div className="sticky top-32">
              <span className="editorial-label mb-4 block">Preview</span>
              <div className="border border-border bg-canvas-dark/20 overflow-hidden" style={{ aspectRatio: formData.aspect === 'portrait' ? '3/4' : formData.aspect === 'square' ? '1/1' : '4/3' }}>
                {formData.imagePreview ? (
                  <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="mt-5">
                <p className="font-display text-xl font-semibold text-ink">
                  {formData.title || 'Untitled'}
                </p>
                <p className="text-sm text-muted mt-1">{creator.name} · {formData.category}</p>
                <p className="font-display text-lg text-ink mt-2">
                  {formData.price ? inr(parseFloat(formData.price)) : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
