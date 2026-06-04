// ─────────────────────────────────────────────
//  homeContentService — fetches live home page
//  data from popupkaraoke.net/home-data.json
//  Falls back to hardcoded defaults if unavailable.
// ─────────────────────────────────────────────

const HOME_DATA_URL = 'https://popupkaraoke.net/home-data.json';

// ── Types ────────────────────────────────────

export interface HomeHero {
  tag: string;
  stars: string;
  title: string;
  subtitle: string;
  reviewLink: string;
  ctaSubtitle: string;
}

export interface HomeStats {
  events: string;
  established: string;
  googleRating: string;
  reviewCount: string;
}

export interface HomeService {
  emoji: string;
  title: string;
  desc: string;
  bullets: string[];
}

export interface HomeIncluded {
  icon: string;
  label: string;
}

export interface HomeVenueRule {
  type: 'weekly' | 'nthWeekday';
  dayOfWeek: number;   // 0=Sun,1=Mon,...,6=Sat
  weeks?: number[];    // for nthWeekday: [1,3] = 1st & 3rd
}

export interface HomeVenue {
  name: string;
  shortName?: string;
  address: string;
  schedule: string;
  time: string;
  mapsQuery: string;
  color: 'primary' | 'accent' | 'cyan';
  emoji?: string;
  rule?: HomeVenueRule;
}

export interface HomeReview {
  name: string;
  type: string;
  text: string;
}

export interface HomeSong {
  title: string;
  artist: string;
}

export interface HomeContact {
  phone: string;
  phoneUrl: string;
  textUrl: string;
  bookUrl: string;
  googleReviewsUrl: string;
}

export interface HomeFaq {
  q: string;
  a: string;
}

export interface HomeBlogPost {
  category: string;
  title: string;
  excerpt: string;
  url: string;
}

export interface HomeCrowdCategory {
  category: string;
  desc: string;
  songs: HomeSong[];
}

export interface HomeSocial {
  facebook: string;
  instagram: string;
  tiktok: string;
}

export interface HomeAnnouncement {
  id: string;
  title: string;
  body: string;
}

export interface HomeData {
  hero: HomeHero;
  stats: HomeStats;
  services: HomeService[];
  included: HomeIncluded[];
  venues: HomeVenue[];
  reviews: HomeReview[];
  top100: HomeSong[];
  newAdditions: HomeSong[];
  faq: HomeFaq[];
  blog: HomeBlogPost[];
  crowdFavorites: HomeCrowdCategory[];
  social: HomeSocial;
  serviceAreas: string[];
  announcements: HomeAnnouncement[];
  contact: HomeContact;
}

// ── Defaults (used while fetching or on error) ─

export const DEFAULT_HOME_DATA: HomeData = {
  hero: {
    tag: 'Veteran-Owned & Operated',
    stars: "NW Indiana & Chicagoland's Premier Mobile Karaoke",
    title: 'Get Ready\nTo Sing! 🎤',
    subtitle:
      'Mobile karaoke DJ for weddings, bars, birthdays & corporate events across NW Indiana & Chicagoland — fully equipped and ready to make your event unforgettable.',
    reviewLink: '5.0 Google · 50+ Reviews',
    ctaSubtitle: "Summer weekends are filling fast — lock in your date before it's taken.",
  },
  stats: {
    events: '200+',
    established: '2020',
    googleRating: '5.0 ★',
    reviewCount: '50+',
  },
  services: [
    {
      emoji: '🎂',
      title: 'Birthday Parties',
      desc: 'Make any age unforgettable with a live karaoke celebration — from sweet sixteens to milestone birthdays.',
      bullets: [
        'Pro host keeps the energy high all night',
        'Personalized song dedications welcome',
        'Fits any home, backyard, or rented venue',
        '75,000+ songs across every genre',
      ],
    },
    {
      emoji: '💒',
      title: 'Weddings',
      desc: 'A crowd-pleasing moment that gets every generation on their feet.',
      bullets: [
        'Receptions, after-parties & rehearsal dinners',
        'Full sound system & stage lighting',
        'Complements your DJ or band',
        'Guests can request songs in advance',
      ],
    },
    {
      emoji: '🏢',
      title: 'Corporate Events',
      desc: 'Break the ice and build real team bonds — karaoke everyone actually enjoys.',
      bullets: [
        'Ideal for holiday parties & milestones',
        'Certificate of insurance available',
        'Social media content included',
        'Groups from 10 to 200+ guests',
      ],
    },
    {
      emoji: '🍺',
      title: 'Bars & Breweries',
      desc: 'Turn a slow night into a packed house with a karaoke residency.',
      bullets: [
        'Weekly or bi-weekly residency packages',
        'Free social media promo posts',
        'Full setup & teardown — you just pour drinks',
        'Live at 18th St, Flights & El Capitán',
      ],
    },
  ],
  included: [
    { icon: 'volume-high-outline', label: 'Concert-Quality Sound' },
    { icon: 'mic-outline', label: 'Wireless Microphones' },
    { icon: 'bulb-outline', label: 'Stage Lighting' },
    { icon: 'person-circle-outline', label: 'Pro Host & MC' },
    { icon: 'tv-outline', label: 'Lyrics Screen' },
    { icon: 'musical-notes-outline', label: '75,000+ Songs' },
  ],
  venues: [
    {
      name: '18th Street Brewery',
      shortName: '18th St Brewery',
      address: '5725 Miller Ave, Gary, IN',
      schedule: 'Every Wednesday',
      time: '7:00 PM – 10:00 PM',
      mapsQuery: '18th+Street+Brewery+5725+Miller+Ave+Gary+IN',
      color: 'primary' as const,
      emoji: '🍺',
      rule: { type: 'weekly' as const, dayOfWeek: 3 },
    },
    {
      name: 'Flights Taproom & Whiskey Lounge',
      shortName: 'Flights Taproom',
      address: '839 169th St, Hammond, IN',
      schedule: '1st & 3rd Tuesdays',
      time: '8:00 PM – 11:00 PM',
      mapsQuery: 'Flights+Taproom+839+169th+St+Hammond+IN',
      color: 'accent' as const,
      emoji: '🥃',
      rule: { type: 'nthWeekday' as const, dayOfWeek: 2, weeks: [1, 3] },
    },
    {
      name: 'El Capitan',
      shortName: 'El Capitan',
      address: '327 Main St, Hobart, IN',
      schedule: '2nd & 4th Fridays',
      time: '8:00 PM – 12:00 AM',
      mapsQuery: 'El+Capitan+327+Main+St+Hobart+IN',
      color: 'cyan' as const,
      emoji: '🎸',
      rule: { type: 'nthWeekday' as const, dayOfWeek: 5, weeks: [2, 4] },
    },
  ],
  reviews: [
    {
      name: 'Jesse G.',
      type: 'Bar & Venue Night · El Capitan',
      text: 'Danny is absolutely phenomenal — the best karaoke DJ in the Chicagoland area. Nobody has ever balanced their sound equipment as well as Danny does.',
    },
    {
      name: 'Sonal P.',
      type: 'Corporate Event',
      text: 'Daniel is amazing at what he does — DJ turntables, top-notch karaoke screen, lights, and 75,000 songs. He turns any venue into a party.',
    },
    {
      name: 'Gigi M.',
      type: 'Private Birthday Party',
      text: "Easy to use, attentive leading up to the event, and provided everything you could need. I'm already thinking of other parties I can throw just to use them!",
    },
  ],
  top100: [
    { title: "Tennessee Whiskey", artist: "Chris Stapleton" },
    { title: "Sweet Caroline", artist: "Neil Diamond" },
    { title: "Creep", artist: "Radiohead" },
    { title: "Before He Cheats", artist: "Carrie Underwood" },
    { title: "Pink Pony Club", artist: "Chappell Roan" },
    { title: "Don't Stop Believin'", artist: "Journey" },
    { title: "Livin' on a Prayer", artist: "Bon Jovi" },
    { title: "Bohemian Rhapsody", artist: "Queen" },
    { title: "I Want It That Way", artist: "Backstreet Boys" },
    { title: "Mr. Brightside", artist: "The Killers" },
  ],
  newAdditions: [
    { title: "Espresso", artist: "Sabrina Carpenter" },
    { title: "Please Please Please", artist: "Sabrina Carpenter" },
    { title: "Good Luck, Babe!", artist: "Chappell Roan" },
    { title: "Fortnight", artist: "Taylor Swift ft. Post Malone" },
    { title: "Beautiful Things", artist: "Benson Boone" },
  ],
  faq: [
    { q: "What's included with every booking?", a: "Everything. Concert-quality speakers, wireless microphones, a large lyrics screen, dynamic LED stage lighting, a professional host/MC, 75,000+ songs, full setup and teardown, and social media content creation at no extra charge." },
    { q: "How far in advance should I book?", a: "Summer and holiday weekends fill up fast — sometimes 4–6 weeks out. We recommend booking at least 2–3 weeks in advance." },
    { q: "Do you travel to Chicago?", a: "Yes! We regularly serve the entire Chicagoland area in addition to Northwest Indiana. Travel fees may apply depending on distance." },
    { q: "How long do bookings typically last?", a: "Most private events run 2–4 hours. Bar residencies are typically 3–4 hours. Setup and teardown are not counted against your booked time." },
  ],
  blog: [
    { category: 'Birthday Parties', title: "10 Karaoke Party Ideas for Birthdays That'll Make It Unforgettable", excerpt: 'Themes, spotlight moments, team battles, and the one upgrade that makes all the difference.', url: 'https://popupkaraoke.net/blog/karaoke-party-ideas-for-birthdays' },
    { category: 'Wedding Entertainment', title: 'Best Karaoke Songs for Weddings in 2026', excerpt: 'Crowd singalongs, couple duets, songs that work for every generation, and what to avoid.', url: 'https://popupkaraoke.net/blog/best-karaoke-songs-for-weddings' },
    { category: 'Planning', title: 'How Much Does a Karaoke DJ Cost?', excerpt: 'The 6 factors that drive karaoke DJ pricing — and what separates a fair quote from a bait-and-switch.', url: 'https://popupkaraoke.net/blog/how-much-does-a-karaoke-dj-cost' },
  ],
  crowdFavorites: [
    { category: '🎤 Group Sing-Alongs', desc: 'Turn the entire room into a massive chorus.', songs: [
      { title: 'Sweet Caroline', artist: 'Neil Diamond' },
      { title: "Don't Stop Believin'", artist: 'Journey' },
      { title: "Livin' on a Prayer", artist: 'Bon Jovi' },
      { title: 'Bohemian Rhapsody', artist: 'Queen' },
    ]},
    { category: '💃 Dance Anthems', desc: 'Get people out of their seats and onto the floor.', songs: [
      { title: 'I Wanna Dance with Somebody', artist: 'Whitney Houston' },
      { title: 'Dancing Queen', artist: 'ABBA' },
      { title: 'Uptown Funk', artist: 'Bruno Mars & Mark Ronson' },
      { title: 'Mr. Brightside', artist: 'The Killers' },
    ]},
    { category: '🕺 90s & 2000s Throwbacks', desc: 'Nostalgic, upbeat, impossible to mess up.', songs: [
      { title: 'I Want It That Way', artist: 'Backstreet Boys' },
      { title: 'Party in the U.S.A.', artist: 'Miley Cyrus' },
      { title: 'Since U Been Gone', artist: 'Kelly Clarkson' },
      { title: 'Hey Ya!', artist: 'Outkast' },
    ]},
  ],
  social: {
    facebook: 'https://www.facebook.com/PopUpKaraoke219',
    instagram: 'https://www.instagram.com/popupkaraoke219/',
    tiktok: 'https://www.tiktok.com/@popupkaraoke219',
  },
  serviceAreas: [
    'Chicago', 'NW Indiana', 'Hammond', 'Gary', 'Merrillville',
    'Valparaiso', 'Crown Point', 'Munster', 'Schererville', 'Griffith',
    'Highland', 'Portage', 'Michigan City', 'Lansing, IL', 'Calumet City, IL',
  ],
  announcements: [],
  contact: {
    phone: '219.758.1313',
    phoneUrl: 'tel:+12197581313',
    textUrl: 'sms:+12197581313',
    bookUrl: 'https://popupkaraoke.net/#contact',
    googleReviewsUrl: 'https://maps.app.goo.gl/k6X7ETF24b8YAou7A',
  },
};

// ── Cache ────────────────────────────────────
let _cache: HomeData | null = null;
let _fetchPromise: Promise<HomeData> | null = null;
export let isOffline = false;

// ── Fetch ────────────────────────────────────
function startFetch(): Promise<HomeData> {
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = fetch(`${HOME_DATA_URL}?v=${Date.now()}`, {
    headers: { Accept: 'application/json' },
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<HomeData>;
    })
    .then(data => {
      _cache = data;
      isOffline = false;
      return data;
    })
    .catch(() => {
      _fetchPromise = null;
      isOffline = true;
      return DEFAULT_HOME_DATA;
    });

  return _fetchPromise;
}

/**
 * Returns home content immediately (defaults) and fetches live data in
 * the background. When live data arrives, onUpdate is called.
 */
export function getHomeData(onUpdate: (data: HomeData) => void): HomeData {
  if (!_fetchPromise) {
    startFetch().then(data => {
      if (data !== DEFAULT_HOME_DATA) onUpdate(data);
    });
  }
  return _cache ?? DEFAULT_HOME_DATA;
}

/**
 * Force a fresh fetch — use for a manual refresh.
 */
export async function refreshHomeData(): Promise<HomeData> {
  _cache = null;
  _fetchPromise = null;
  return startFetch();
}
