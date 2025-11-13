export const BOOKING_EXPIRATION_MINUTES = 20; // ✅ Set to 20 minutes for booking expiration

// ✅ Tax rate for bookings (10% VAT - standard for accommodation services in Vietnam according to VAT Law)
export const BOOKING_TAX_RATE = 0.10; // 10% VAT (Thuế GTGT)

// ✅ Email verification constants
export const MAX_VERIFICATION_RESEND_COUNT = 5; // Maximum resend count per day
export const VERIFICATION_RESEND_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes cooldown between resends

// ✅ Discount code constants
export const MAX_DISCOUNT_CODES_PER_BOOKING = 2; // Maximum number of discount codes per booking