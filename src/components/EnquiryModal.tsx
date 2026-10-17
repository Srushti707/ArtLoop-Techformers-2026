import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Mail } from 'lucide-react';
import type { Artwork, Artist } from '../types';
import { useEnquiries } from '../useCreator';
import { inr } from '../format';

type EnquiryModalProps = {
  artwork: Artwork;
  artist: Artist | undefined;
  onClose: () => void;
};

type FormData = {
  buyerName: string;
  buyerEmail: string;
  message: string;
  offerPrice: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialData: FormData = {
  buyerName: '',
  buyerEmail: '',
  message: '',
  offerPrice: '',
};

export default function EnquiryModal({ artwork, artist, onClose }: EnquiryModalProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const { addEnquiry } = useEnquiries();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!artist) return null;

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!formData.buyerName.trim()) {
      errs.buyerName = 'Please enter your name.';
    }
    if (!formData.buyerEmail.trim()) {
      errs.buyerEmail = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail.trim())) {
      errs.buyerEmail = 'Please enter a valid email address.';
    }
    if (!formData.message.trim()) {
      errs.message = 'Please add a message.';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message should be at least 10 characters.';
    }
    if (formData.offerPrice) {
      const offer = parseFloat(formData.offerPrice);
      if (isNaN(offer) || offer <= 0) {
        errs.offerPrice = 'Enter a valid offer amount or leave blank.';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    addEnquiry({
      artworkId: artwork.id,
      artworkTitle: artwork.title,
      artistId: artist.id,
      artistName: artist.name,
      buyerName: formData.buyerName.trim(),
      buyerEmail: formData.buyerEmail.trim(),
      message: formData.message.trim(),
      offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : artwork.price,
    });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-canvas border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-up">
        {submitted ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 border-2 border-coral rounded-full flex items-center justify-center bg-coral/10">
              <Check className="w-8 h-8 text-coral" />
            </div>
            <span className="editorial-label mb-3 block">Enquiry sent</span>
            <h2 className="font-display font-bold text-ink text-2xl mb-4">
              Your enquiry is in.
            </h2>
            <p className="text-ink-soft mb-8">
              {artist.name.split(' ')[0]} will see your message in their dashboard and respond via email.
            </p>
            <button onClick={onClose} className="btn-coral">Close</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-6 md:p-8 border-b border-border-soft">
              <div>
                <span className="editorial-label mb-2 block">Purchase enquiry</span>
                <h2 className="font-display text-xl font-bold text-ink">{artwork.title}</h2>
                <p className="text-sm text-muted mt-1">by {artist.name} · {inr(artwork.price)}</p>
              </div>
              <button
                onClick={onClose}
                className="text-muted hover:text-ink transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6" noValidate>
              <div>
                <label htmlFor="enq-name" className="editorial-label mb-2 block">Your name</label>
                <input
                  id="enq-name"
                  type="text"
                  value={formData.buyerName}
                  onChange={(e) => handleChange('buyerName', e.target.value)}
                  className="input-field"
                  placeholder="Your name"
                />
                {errors.buyerName && (
                  <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                    <AlertCircle className="w-4 h-4" />{errors.buyerName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="enq-email" className="editorial-label mb-2 block">Email</label>
                <input
                  id="enq-email"
                  type="email"
                  value={formData.buyerEmail}
                  onChange={(e) => handleChange('buyerEmail', e.target.value)}
                  className="input-field"
                  placeholder="you@email.com"
                />
                {errors.buyerEmail && (
                  <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                    <AlertCircle className="w-4 h-4" />{errors.buyerEmail}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="enq-offer" className="editorial-label mb-2 block">
                  Your offer (INR) — optional
                </label>
                <div className="flex items-baseline">
                  <span className="font-display text-2xl text-muted mr-2">₹</span>
                  <input
                    id="enq-offer"
                    type="number"
                    min={0}
                    step={100}
                    value={formData.offerPrice}
                    onChange={(e) => handleChange('offerPrice', e.target.value)}
                    className="input-field"
                    placeholder={String(artwork.price)}
                  />
                </div>
                {errors.offerPrice && (
                  <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                    <AlertCircle className="w-4 h-4" />{errors.offerPrice}
                  </p>
                )}
                <p className="text-xs text-muted mt-2">Leave blank to enquire at the listed price.</p>
              </div>

              <div>
                <label htmlFor="enq-message" className="editorial-label mb-2 block">Message to the artist</label>
                <textarea
                  id="enq-message"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="input-field resize-none min-h-[100px] py-3"
                  placeholder="I'm interested in this piece. Is it still available?"
                  rows={4}
                />
                {errors.message && (
                  <p className="flex items-center gap-2 mt-2 text-sm text-coral-dim">
                    <AlertCircle className="w-4 h-4" />{errors.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-coral w-full justify-center">
                  <Mail className="w-4 h-4" />
                  Send enquiry
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
