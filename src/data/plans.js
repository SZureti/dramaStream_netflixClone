// Mock membership plans, like Netflix's plan step. DramaStream is free: a plan
// only labels the account (it's saved in the Supabase user's metadata), and
// no payment details are ever asked for.
export const PLANS = [
  { id: 'basic', name: 'Basic', quality: 'Good', resolution: '720p', screens: 1, price: 'Free' },
  { id: 'standard', name: 'Standard', quality: 'Great', resolution: '1080p', screens: 2, price: 'Free' },
  { id: 'premium', name: 'Premium', quality: 'Best', resolution: '4K + HDR', screens: 4, price: 'Free' },
];

export const planById = (id) => PLANS.find((p) => p.id === id) ?? null;
