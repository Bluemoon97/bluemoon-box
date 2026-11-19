/* Deployment setting: PUBLIC verification JWKs only. Empty means offline Premium
 * is unavailable. Never put a private JWK (d), service_role key or Stripe secret here.
 * Rotate by keeping old PUBLIC keys until their maximum 24-hour leases expire.
 */
const COCARTLY_PREMIUM_PUBLIC_KEYS = Object.freeze({});
