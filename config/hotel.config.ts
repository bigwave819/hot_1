// src/config/hotel.config.ts

export const hotelConfig = {
  // ── Identity (swap these per hotel) ──────────────────────────
  name:     "Peponi Living Spaces",
  tagline:  "Where the hills of Kigali meet understated luxury",
  location: "Kigali, Rwanda",
  slug:     "peponi",                    // used in meta, sitemap, og images

  // ── Copy (the storytelling voice) ────────────────────────────
  description:
    "A boutique retreat perched above the hills of Kigali. " +
    "Peponi blends Rwandan craftsmanship with international luxury " +
    "across intimate suites, a rooftop pool, and an all-day dining terrace.",

  heroLine:     "Wake up above the hills of Kigali.",
  heroSub:      "Handcrafted spaces. Uninterrupted stillness.",

  // ── Contact ───────────────────────────────────────────────────
  contact: {
    phone:     "+250 788 000 000",
    whatsapp:  "+250 788 000 000",
    email:     "hello@peponi.rw",
    address:   "KG 5 Ave, Kiyovu, Kigali",
    mapEmbed:  "",                       // Google Maps embed URL
  },

  // ── Policies ──────────────────────────────────────────────────
  policies: {
    checkIn:       "14:00",
    checkOut:      "11:00",
    currency:      "USD",
    currencySymbol: "$",
  },

  // ── Social ────────────────────────────────────────────────────
  social: {
    instagram: "https://instagram.com/peponiliving",
    facebook:  "",
  },

  // ── SEO ───────────────────────────────────────────────────────
  seo: {
    title:       "Peponi Living Spaces — Kigali, Rwanda",
    description: "A boutique luxury retreat above the hills of Kigali. Book your stay at Peponi Living Spaces.",
    ogImage:     "/og/peponi.jpg",       // swap per hotel
    keywords:    ["luxury hotel kigali", "boutique hotel rwanda", "peponi living spaces"],
  },
} as const

export type HotelConfig = typeof hotelConfig