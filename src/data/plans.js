// Membership plans. This is a demo that never goes live: billing runs on Stripe
// test mode only (use card 4242 4242 4242 4242), so no real money moves. Signing
// up just labels the account; paying happens from the Account page.
export const PLANS = [
  { id: 'basic', name: 'Basic', quality: 'Good', resolution: '720p', screens: 1, price: '$6.99/mo' },
  { id: 'standard', name: 'Standard', quality: 'Great', resolution: '1080p', screens: 2, price: '$15.49/mo' },
  { id: 'premium', name: 'Premium', quality: 'Best', resolution: '4K + HDR', screens: 4, price: '$22.99/mo' },
];

export const planById = (id) => PLANS.find((p) => p.id === id) ?? null;
