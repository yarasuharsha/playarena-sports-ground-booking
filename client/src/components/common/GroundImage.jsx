import React, { useState, useEffect } from 'react';

export const SPORT_FALLBACK_IMAGES = {
  Football: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  Cricket: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
  Badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
  Tennis: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80',
  Basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
  Pickleball: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  Default: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80'
};

export const getSportFallbackImage = (sportType) => {
  if (!sportType) return SPORT_FALLBACK_IMAGES.Default;
  // Case-insensitive lookup
  const match = Object.keys(SPORT_FALLBACK_IMAGES).find(
    (k) => k.toLowerCase() === sportType.toLowerCase()
  );
  return match ? SPORT_FALLBACK_IMAGES[match] : SPORT_FALLBACK_IMAGES.Default;
};

export default function GroundImage({
  src,
  alt = 'Sports Arena',
  sportType = 'Default',
  style = {},
  className = '',
  onMouseOver,
  onMouseOut,
  ...props
}) {
  const fallback = getSportFallbackImage(sportType);
  const [currentSrc, setCurrentSrc] = useState(src || fallback);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || fallback);
    setHasError(false);
  }, [src, fallback]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallback);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      loading="lazy"
      {...props}
    />
  );
}
