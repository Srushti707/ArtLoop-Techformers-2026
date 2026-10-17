import type { Artist, Artwork } from './types';

export const artists: Artist[] = [
  {
    id: 'a1',
    name: 'Aanya Mehta',
    slug: 'aanya-mehta',
    discipline: 'Painting',
    bio: 'Fictional demo profile. Aanya translates monsoon light, family archives, and city rhythms into large-scale abstract paintings. Her work explores memory, color, and the feeling of home between places. She is developing her practice in Mumbai alongside her applied art studies.',
    avatar: 'https://images.pexels.com/photos/32323486/pexels-photo-32323486.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    location: 'Mumbai, Maharashtra',
    university: 'Sir J. J. Institute of Applied Art, Mumbai',
    startingPrice: 2000,
    portfolio: [
      'https://images.pexels.com/photos/30784971/pexels-photo-30784971.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/30727825/pexels-photo-30727825.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/30680067/pexels-photo-30680067.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/30925664/pexels-photo-30925664.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
  },
  {
    id: 'a2',
    name: 'Ira Nair',
    slug: 'ira-nair',
    discipline: 'Digital Art',
    bio: 'Fictional demo profile. Ira builds impossible architectures in digital space, drawing from brutalism, Indian street typography, and generative noise. Her render-driven compositions turn familiar urban fragments into bright, speculative worlds.',
    avatar: 'https://images.pexels.com/photos/933255/pexels-photo-933255.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    location: 'Bengaluru, Karnataka',
    university: 'National Institute of Design (NID)',
    startingPrice: 1500,
    portfolio: [
      'https://images.pexels.com/photos/10311668/pexels-photo-10311668.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/23191211/pexels-photo-23191211.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/23458833/pexels-photo-23458833.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8659276/pexels-photo-8659276.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
  },
  {
    id: 'a3',
    name: 'Kavya Rao',
    slug: 'kavya-rao',
    discipline: 'Illustration',
    bio: 'Fictional demo profile. Kavya draws the in-between moments — hands mid-gesture, faces half-turned, flowers caught in wind. Her editorial illustrations mix precise linework with the warmth of everyday Indian visual culture.',
    avatar: 'https://images.pexels.com/photos/22690802/pexels-photo-22690802.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    location: 'Pune, Maharashtra',
    university: 'MIT Institute of Design, Pune',
    startingPrice: 1200,
    portfolio: [
      'https://images.pexels.com/photos/25037123/pexels-photo-25037123.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/25037117/pexels-photo-25037117.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/9259416/pexels-photo-9259416.png?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/28890271/pexels-photo-28890271.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
  },
  {
    id: 'a4',
    name: 'Arjun Menon',
    slug: 'arjun-menon',
    discipline: 'Photography',
    bio: 'Fictional demo profile. Arjun photographs the quiet architecture of overlooked spaces — railway platforms, stairwells, terraces, and loading docks. His long-exposure approach reveals geometric order in places designed to be ignored.',
    avatar: 'https://images.pexels.com/photos/6925033/pexels-photo-6925033.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    location: 'Kochi, Kerala',
    university: 'Sir J. J. School of Art, Mumbai',
    startingPrice: 2000,
    portfolio: [
      'https://images.pexels.com/photos/5702467/pexels-photo-5702467.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/10207587/pexels-photo-10207587.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/7147830/pexels-photo-7147830.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/28510453/pexels-photo-28510453.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
  },
  {
    id: 'a5',
    name: 'Riya Deshmukh',
    slug: 'riya-deshmukh',
    discipline: 'Mixed Media',
    bio: 'Fictional demo profile. Riya collages found textiles, printed photographs, and hand-drawn marks into layered portraits of belonging. Her work asks how memory changes as people, materials, and stories move between cities.',
    avatar: 'https://images.pexels.com/photos/3778138/pexels-photo-3778138.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    location: 'New Delhi, Delhi',
    university: 'National Institute of Fashion Technology (NIFT)',
    startingPrice: 3500,
    portfolio: [
      'https://images.pexels.com/photos/3371412/pexels-photo-3371412.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/10073856/pexels-photo-10073856.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/30552605/pexels-photo-30552605.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/35441095/pexels-photo-35441095.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
  },
  {
    id: 'a6',
    name: 'Neel Shah',
    slug: 'neel-shah',
    discipline: 'Painting',
    bio: 'Fictional demo profile. Neel paints with cool palettes and precise light, placing contemporary objects — headphones, steel vessels, cables, and paper scraps — into quiet still lifes. His work finds drama in the ordinary.',
    avatar: 'https://images.pexels.com/photos/27742085/pexels-photo-27742085.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    location: 'Ahmedabad, Gujarat',
    university: 'National Institute of Design (NID)',
    startingPrice: 4000,
    portfolio: [
      'https://images.pexels.com/photos/30561868/pexels-photo-30561868.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/30843199/pexels-photo-30843199.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/30713978/pexels-photo-30713978.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/30580212/pexels-photo-30580212.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
  },
];

export const artworks: Artwork[] = [
  { id: 'w1', title: 'Chromatic Memory No. 7', artistId: 'a1', category: 'Painting', price: 4500, image: 'https://images.pexels.com/photos/30784971/pexels-photo-30784971.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'landscape' },
  { id: 'w2', title: 'Vivid Fragment', artistId: 'a1', category: 'Painting', price: 3200, image: 'https://images.pexels.com/photos/30727825/pexels-photo-30727825.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'landscape' },
  { id: 'w3', title: 'Standing Heat', artistId: 'a1', category: 'Painting', price: 5800, image: 'https://images.pexels.com/photos/30680067/pexels-photo-30680067.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
  { id: 'w4', title: 'Brushstroke Symphony', artistId: 'a1', category: 'Painting', price: 3900, image: 'https://images.pexels.com/photos/30925664/pexels-photo-30925664.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'landscape' },
  { id: 'w5', title: 'Impossible Geometry', artistId: 'a2', category: 'Digital Art', price: 1750, image: 'https://images.pexels.com/photos/10311668/pexels-photo-10311668.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
  { id: 'w6', title: 'Neon Frequency', artistId: 'a2', category: 'Digital Art', price: 2200, image: 'https://images.pexels.com/photos/23191211/pexels-photo-23191211.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'landscape' },
  { id: 'w7', title: 'Smooth Blend Sequence', artistId: 'a2', category: 'Digital Art', price: 1500, image: 'https://images.pexels.com/photos/23458833/pexels-photo-23458833.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'landscape' },
  { id: 'w8', title: 'Bold Spectrum', artistId: 'a2', category: 'Digital Art', price: 1950, image: 'https://images.pexels.com/photos/8659276/pexels-photo-8659276.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'square' },
  { id: 'w9', title: 'Bloom in Isolation', artistId: 'a3', category: 'Illustration', price: 1300, image: 'https://images.pexels.com/photos/25037123/pexels-photo-25037123.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
  { id: 'w10', title: 'Floral Mask', artistId: 'a3', category: 'Illustration', price: 1450, image: 'https://images.pexels.com/photos/25037117/pexels-photo-25037117.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
  { id: 'w11', title: 'Vivid Reverie', artistId: 'a3', category: 'Illustration', price: 1600, image: 'https://images.pexels.com/photos/9259416/pexels-photo-9259416.png?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
  { id: 'w12', title: 'Sketch on Table', artistId: 'a3', category: 'Illustration', price: 950, image: 'https://images.pexels.com/photos/28890271/pexels-photo-28890271.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
  { id: 'w13', title: 'Overlooked Facade', artistId: 'a4', category: 'Photography', price: 2500, image: 'https://images.pexels.com/photos/5702467/pexels-photo-5702467.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
  { id: 'w14', title: 'Neon Cathedral', artistId: 'a4', category: 'Photography', price: 3000, image: 'https://images.pexels.com/photos/10207587/pexels-photo-10207587.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'landscape' },
  { id: 'w15', title: 'Minimal Wall Study', artistId: 'a4', category: 'Photography', price: 1800, image: 'https://images.pexels.com/photos/7147830/pexels-photo-7147830.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
  { id: 'w16', title: 'Maze of the Self', artistId: 'a4', category: 'Photography', price: 2750, image: 'https://images.pexels.com/photos/28510453/pexels-photo-28510453.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
  { id: 'w17', title: 'Surreal Botanical', artistId: 'a5', category: 'Mixed Media', price: 4200, image: 'https://images.pexels.com/photos/3371412/pexels-photo-3371412.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
  { id: 'w18', title: 'Pop Apparition', artistId: 'a5', category: 'Mixed Media', price: 3800, image: 'https://images.pexels.com/photos/10073856/pexels-photo-10073856.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'square' },
  { id: 'w19', title: 'Dramatic Monochrome', artistId: 'a5', category: 'Mixed Media', price: 2900, image: 'https://images.pexels.com/photos/30552605/pexels-photo-30552605.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
  { id: 'w20', title: 'Nature Overlay', artistId: 'a5', category: 'Mixed Media', price: 3400, image: 'https://images.pexels.com/photos/35441095/pexels-photo-35441095.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
  { id: 'w21', title: 'Dynamic Expression No. 3', artistId: 'a6', category: 'Painting', price: 5200, image: 'https://images.pexels.com/photos/30561868/pexels-photo-30561868.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'landscape' },
  { id: 'w22', title: 'Textured Layers', artistId: 'a6', category: 'Painting', price: 4800, image: 'https://images.pexels.com/photos/30843199/pexels-photo-30843199.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
  { id: 'w23', title: 'Bold Hue Study', artistId: 'a6', category: 'Painting', price: 4100, image: 'https://images.pexels.com/photos/30713978/pexels-photo-30713978.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'landscape' },
  { id: 'w24', title: 'Purple Depth', artistId: 'a6', category: 'Painting', price: 5500, image: 'https://images.pexels.com/photos/30580212/pexels-photo-30580212.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', aspect: 'portrait' },
];

export const categories: ('All' | 'Painting' | 'Digital Art' | 'Illustration' | 'Photography' | 'Mixed Media')[] = [
  'All', 'Painting', 'Digital Art', 'Illustration', 'Photography', 'Mixed Media',
];

export const budgetRanges = [
  { label: 'All Budgets', min: 0, max: Infinity },
  { label: 'Under ₹2,000', min: 0, max: 1999 },
  { label: '₹2,000 – ₹4,000', min: 2000, max: 4000 },
  { label: '₹4,000 – ₹6,000', min: 4000, max: 6000 },
  { label: '₹6,000+', min: 6000, max: Infinity },
];

export function getArtist(id: string): Artist | undefined {
  return artists.find((a) => a.id === id || a.slug === id);
}

export function getArtworksByArtist(artistId: string): Artwork[] {
  return artworks.filter((w) => w.artistId === artistId);
}

export function getArtistName(artistId: string): string {
  return artists.find((a) => a.id === artistId)?.name ?? 'Unknown Artist';
}
