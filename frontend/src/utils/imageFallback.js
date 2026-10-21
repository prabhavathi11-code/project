// Reliable Fallback Images for Campus Categories
// Prevents broken images or 404 errors across all views

const CATEGORY_FALLBACKS = {
  Books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  Electronics: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
  Cycles: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
  'Hostel Essentials': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80',
  Sports: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
  Default: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80'
}

export const getCategoryFallback = (category) => {
  return CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.Default
}

export const handleImageError = (e, category = 'Default') => {
  if (e?.target) {
    e.target.onerror = null // Prevent infinite loop
    e.target.src = getCategoryFallback(category)
  }
}
