import { useState, useEffect } from 'react';

export interface PropertyVideo {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  videoUrl: string;
  thumbnailUrl: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  owner: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    responseTime: string;
  };
  likesCount: number;
  viewsCount: number;
  isNew: boolean;
  isFeatured: boolean;
  createdAt: string;
  isLiked: boolean;
  isSaved: boolean;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  video_url: string;
  thumbnail_url: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  owner_id: string;
  likes_count: number;
  views_count: number;
  is_new: boolean;
  is_featured: boolean;
  created_at: string;
  owner_name: string;
  owner_avatar: string;
  owner_rating: number;
  owner_response_time: string;
  is_liked: boolean;
  is_saved: boolean;
}

// Mock video URLs for the feed
const DEMO_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
];

const generateMockProperties = (): Property[] => {
  const locations = [
    "Poto-Poto, Brazzaville",
    "Bacongo, Brazzaville", 
    "Moungali, Brazzaville",
    "Ouenzé, Brazzaville",
    "Tié-Tié, Brazzaville"
  ];

  const owners = [
    { name: "Marie Koubemba", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b330?w=150", rating: 4.8 },
    { name: "Jean Mbemba", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", rating: 4.5 },
    { name: "Grace Mokoko", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", rating: 4.9 },
    { name: "Paul Sassou", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", rating: 4.3 },
    { name: "Henriette Nzaba", avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150", rating: 4.7 }
  ];

  const titles = [
    "Magnifique villa avec piscine",
    "Appartement moderne centre-ville", 
    "Maison familiale avec jardin",
    "Studio meublé lumineux",
    "Duplex avec terrasse panoramique"
  ];

  return Array.from({ length: 5 }, (_, index) => {
    const owner = owners[index];
    return {
      id: `property_${index + 1}`,
      title: titles[index],
      location: locations[index],
      price: Math.floor(Math.random() * 800000) + 200000,
      currency: "FCFA",
      video_url: DEMO_VIDEOS[index],
      thumbnail_url: `https://images.unsplash.com/photo-${1560184897 + index}-ae75f418493e?w=600&h=800&fit=crop`,
      bedrooms: Math.floor(Math.random() * 4) + 1,
      bathrooms: Math.floor(Math.random() * 3) + 1,
      area: Math.floor(Math.random() * 100) + 50,
      owner_id: `owner_${index + 1}`,
      likes_count: Math.floor(Math.random() * 50),
      views_count: Math.floor(Math.random() * 500) + 100,
      is_new: Math.random() > 0.7,
      is_featured: Math.random() > 0.8,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      owner_name: owner.name,
      owner_avatar: owner.avatar,
      owner_rating: owner.rating,
      owner_response_time: "< 1h",
      is_liked: false,
      is_saved: false
    };
  });
};

const convertToPropertyVideo = (property: Property): PropertyVideo => {
  return {
    id: property.id,
    title: property.title,
    location: property.location,
    price: property.price,
    currency: property.currency,
    videoUrl: property.video_url,
    thumbnailUrl: property.thumbnail_url,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    owner: {
      id: property.owner_id,
      name: property.owner_name,
      avatar: property.owner_avatar,
      rating: property.owner_rating,
      responseTime: property.owner_response_time,
    },
    likesCount: property.likes_count,
    viewsCount: property.views_count,
    isNew: property.is_new,
    isFeatured: property.is_featured,
    createdAt: property.created_at,
    isLiked: property.is_liked,
    isSaved: property.is_saved,
  };
};

export const useVideoFeed = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = generateMockProperties();
      setProperties(mockData);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = (propertyId: string) => {
    setProperties(prev => 
      prev.map(prop => 
        prop.id === propertyId 
          ? { 
              ...prop, 
              is_liked: !prop.is_liked,
              likes_count: prop.is_liked ? prop.likes_count - 1 : prop.likes_count + 1
            }
          : prop
      )
    );
  };

  const toggleSave = (propertyId: string) => {
    setProperties(prev => 
      prev.map(prop => 
        prop.id === propertyId 
          ? { ...prop, is_saved: !prop.is_saved }
          : prop
      )
    );
  };

  const incrementViews = (propertyId: string) => {
    setProperties(prev => 
      prev.map(prop => 
        prop.id === propertyId 
          ? { ...prop, views_count: prop.views_count + 1 }
          : prop
      )
    );
  };

  const nextVideo = () => {
    if (currentIndex < properties.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousVideo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToProperty = (index: number) => {
    if (index >= 0 && index < properties.length) {
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const currentProperty = properties[currentIndex] ? convertToPropertyVideo(properties[currentIndex]) : null;

  return {
    properties,
    isLoading,
    hasError,
    currentIndex,
    currentProperty,
    toggleLike,
    toggleSave,
    incrementViews,
    nextVideo,
    previousVideo,
    goToProperty,
    hasNext: currentIndex < properties.length - 1,
    hasPrevious: currentIndex > 0,
    fetchProperties
  };
};
