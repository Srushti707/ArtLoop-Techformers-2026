export type Category =
  | 'Painting'
  | 'Digital Art'
  | 'Illustration'
  | 'Photography'
  | 'Mixed Media';

export type Artwork = {
  id: string;
  title: string;
  artistId: string;
  category: Category;
  price: number;
  image: string;
  aspect: 'portrait' | 'landscape' | 'square';
};

export type Artist = {
  id: string;
  name: string;
  slug: string;
  discipline: Category;
  bio: string;
  avatar: string;
  location: string;
  university: string;
  startingPrice: number;
  portfolio: string[];
};

export type CommissionStatus = 'pending' | 'accepted' | 'in-progress' | 'completed' | 'declined';

export type Commission = {
  id: string;
  artistId: string;
  artistName: string;
  buyerId?: string;
  buyerName: string;
  buyerEmail: string;
  projectDescription: string;
  budget: number;
  deadline: string;
  status: CommissionStatus;
  createdAt: string;
};

export type EnquiryStatus = 'new' | 'responded' | 'closed';

export type PurchaseEnquiry = {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artistId: string;
  artistName: string;
  buyerId?: string;
  buyerName: string;
  buyerEmail: string;
  message: string;
  offerPrice: number;
  status: EnquiryStatus;
  createdAt: string;
};

export type BuyerProfile = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  location?: string;
  savedArtworkIds: string[];
  createdAt: string;
  password?: string;
};

export type CreatorProfile = {
  id: string;
  name: string;
  slug: string;
  email: string;
  discipline: Category;
  bio: string;
  avatar: string;
  location: string;
  university: string;
  startingPrice: number;
  createdAt: string;
  password?: string;
};

export type ArtworkStatus = 'draft' | 'published';

export type CreatorArtwork = {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: Category;
  price: number;
  aspect: 'portrait' | 'landscape' | 'square';
  imageKey: string;
  status: ArtworkStatus;
  createdAt: string;
  updatedAt: string;
};

export type LicenseType = 'Personal Display' | 'Commercial Use';

export type Order = {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  category: Category;
  aspect: 'portrait' | 'landscape' | 'square';
  artistId: string;
  artistName: string;
  buyerId?: string;
  buyerName: string;
  buyerEmail: string;
  price: number;
  licenseType: LicenseType;
  digitalDeliverableUrl: string;
  certificateId: string;
  status: 'completed' | 'processing';
  createdAt: string;
  isDemo: boolean;
};
