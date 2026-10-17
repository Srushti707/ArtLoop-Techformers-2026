import { useMemo } from 'react';
import { artists as sampleArtists, artworks as sampleArtworks } from './data';
import type { Artist, Artwork, CreatorProfile, CreatorArtwork } from './types';
import { useCreatorArtworks, useCreatorProfiles } from './useCreator';
import { getImageURL } from './imageStore';

function artworkFromCreator(cw: CreatorArtwork, imageUrl: string): Artwork {
  return {
    id: cw.id,
    title: cw.title,
    artistId: cw.creatorId,
    category: cw.category,
    price: cw.price,
    image: imageUrl,
    aspect: cw.aspect,
  };
}

function artistFromCreator(profile: CreatorProfile): Artist {
  return {
    id: profile.id,
    name: profile.name,
    slug: profile.slug,
    discipline: profile.discipline,
    bio: profile.bio,
    avatar: profile.avatar,
    location: profile.location,
    university: profile.university,
    startingPrice: profile.startingPrice,
    portfolio: [],
  };
}

export function useMarketplace() {
  const { profiles, createProfile, updateProfile } = useCreatorProfiles();
  const { artworks: creatorArtworks, addArtwork, updateArtwork, deleteArtwork } = useCreatorArtworks();

  // Resolve IndexedDB image URLs for published creator artworks
  const [imageUrls, setImageUrls] = useImageUrls(creatorArtworks);

  const publishedCreatorArtworks = useMemo(
    () => creatorArtworks.filter((a) => a.status === 'published'),
    [creatorArtworks],
  );

  const allArtists: Artist[] = useMemo(() => {
    const creatorArtists = profiles.map(artistFromCreator);
    return [...sampleArtists, ...creatorArtists];
  }, [profiles]);

  const allArtworks: Artwork[] = useMemo(() => {
    const resolved = publishedCreatorArtworks
      .map((cw) => {
        const url = imageUrls[cw.id];
        if (!url) return null;
        return artworkFromCreator(cw, url);
      })
      .filter((a): a is Artwork => a !== null);
    return [...sampleArtworks, ...resolved];
  }, [publishedCreatorArtworks, imageUrls]);

  return {
    allArtists,
    allArtworks,
    profiles,
    creatorArtworks,
    createProfile,
    updateProfile,
    addArtwork,
    updateArtwork,
    deleteArtwork,
  };
}

// Helper hook: resolves image URLs for creator artworks from IndexedDB
import { useState, useEffect } from 'react';

function useImageUrls(creatorArtworks: CreatorArtwork[]) {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const published = creatorArtworks.filter((a) => a.status === 'published');
    if (published.length === 0) {
      setImageUrls({});
      return;
    }
    Promise.all(
      published.map(async (cw) => {
        const url = await getImageURL(cw.imageKey);
        return [cw.id, url] as const;
      }),
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, string> = {};
      for (const [id, url] of results) {
        if (url) map[id] = url;
      }
      setImageUrls(map);
    });
    return () => { cancelled = true; };
  }, [creatorArtworks]);

  return [imageUrls, setImageUrls] as const;
}
