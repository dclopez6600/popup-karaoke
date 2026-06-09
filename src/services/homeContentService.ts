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

export interface HomeShare {
  message: string;
  iosUrl: string;
  androidText: string;
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
  share: HomeShare;
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
    { title: "Don't Stop Believin' (Small Town Girl)", artist: "Journey" },
    { title: "Picture", artist: "Kid Rock & Sheryl Crow" },
    { title: "Shallow", artist: "Lady Gaga & Bradley Cooper" },
    { title: "Mr. Brightside", artist: "The Killers" },
    { title: "Bohemian Rhapsody", artist: "Queen" },
    { title: "Take Me Home, Country Roads", artist: "John Denver" },
    { title: "Neon Moon", artist: "Brooks & Dunn" },
    { title: "What's Up?", artist: "4 Non Blondes" },
    { title: "My Way", artist: "Frank Sinatra" },
    { title: "Valerie", artist: "Amy Winehouse & Mark Ronson" },
    { title: "I Want It That Way", artist: "Backstreet Boys" },
    { title: "Dreams", artist: "Fleetwood Mac" },
    { title: "Friends in Low Places", artist: "Garth Brooks" },
    { title: "Lose Control", artist: "Teddy Swims" },
    { title: "Zombie", artist: "The Cranberries" },
    { title: "Can't Help Falling in Love", artist: "Elvis Presley" },
    { title: "Dancing Queen", artist: "ABBA" },
    { title: "Piano Man", artist: "Billy Joel" },
    { title: "Folsom Prison Blues", artist: "Johnny Cash" },
    { title: "I Wanna Dance with Somebody", artist: "Whitney Houston" },
    { title: "Your Man", artist: "Josh Turner" },
    { title: "Kryptonite", artist: "3 Doors Down" },
    { title: "You Look Like You Love Me", artist: "Ella Langley & Riley Green" },
    { title: "Killing Me Softly", artist: "The Fugees & Lauryn Hill" },
    { title: "Black Velvet", artist: "Alannah Myles" },
    { title: "Santeria", artist: "Sublime" },
    { title: "Teenage Dirtbag", artist: "Wheatus" },
    { title: "Flowers", artist: "Miley Cyrus" },
    { title: "Man! I Feel Like a Woman!", artist: "Shania Twain" },
    { title: "Unwritten", artist: "Natasha Bedingfield" },
    { title: "Crazy", artist: "Patsy Cline" },
    { title: "Jolene", artist: "Dolly Parton" },
    { title: "Ring of Fire", artist: "Johnny Cash" },
    { title: "Wonderwall", artist: "Oasis" },
    { title: "Give Me One Reason", artist: "Tracy Chapman" },
    { title: "Wagon Wheel", artist: "Darius Rucker" },
    { title: "Save Me", artist: "Jelly Roll" },
    { title: "Stay", artist: "Rihanna & Mikky Ekko" },
    { title: "Strawberry Wine", artist: "Deana Carter" },
    { title: "Party in the U.S.A.", artist: "Miley Cyrus" },
    { title: "Something in the Orange", artist: "Zach Bryan" },
    { title: "Amarillo by Morning", artist: "George Strait" },
    { title: "Girl Crush", artist: "Little Big Town" },
    { title: "Fly Me to the Moon", artist: "Frank Sinatra" },
    { title: "I Will Survive", artist: "Gloria Gaynor" },
    { title: "Someone Like You", artist: "Adele" },
    { title: "My Girl", artist: "The Temptations" },
    { title: "Have You Ever Seen the Rain", artist: "Creedence Clearwater Revival" },
    { title: "Turn the Page", artist: "Bob Seger" },
    { title: "Die with a Smile", artist: "Lady Gaga & Bruno Mars" },
    { title: "Let It Go", artist: "Idina Menzel" },
    { title: "These Boots Are Made for Walkin'", artist: "Nancy Sinatra" },
    { title: "Bring Me to Life", artist: "Evanescence" },
    { title: "Iris", artist: "Goo Goo Dolls" },
    { title: "All of Me", artist: "John Legend" },
    { title: "A Bar Song (Tipsy)", artist: "Shaboozey" },
    { title: "Mama's Broken Heart", artist: "Miranda Lambert" },
    { title: "Rolling in the Deep", artist: "Adele" },
    { title: "Choosin' Texas", artist: "Ella Langley" },
    { title: "Goodbye Earl", artist: "The Chicks" },
    { title: "Tequila", artist: "The Champs" },
    { title: "You Oughta Know", artist: "Alanis Morissette" },
    { title: "Under the Bridge", artist: "Red Hot Chili Peppers" },
    { title: "Back to Black", artist: "Amy Winehouse" },
    { title: "Don't Close Your Eyes", artist: "Keith Whitley" },
    { title: "Livin' on a Prayer", artist: "Bon Jovi" },
    { title: "Margaritaville", artist: "Jimmy Buffett" },
    { title: "Feeling Good", artist: "Michael Bublé" },
    { title: "I Love This Bar", artist: "Toby Keith" },
    { title: "You Never Even Called Me by My Name", artist: "David Allan Coe" },
    { title: "Jackson", artist: "Johnny Cash & June Carter Cash" },
    { title: "In Color", artist: "Jamey Johnson" },
    { title: "The House of the Rising Sun", artist: "The Animals" },
    { title: "Careless Whisper", artist: "George Michael" },
    { title: "Sweet Child O' Mine", artist: "Guns N' Roses" },
    { title: "At Last", artist: "Etta James" },
    { title: "New York, New York", artist: "Frank Sinatra" },
    { title: "If I Ain't Got You", artist: "Alicia Keys" },
    { title: "Always on My Mind", artist: "Willie Nelson" },
    { title: "Mamma Mia", artist: "ABBA" },
    { title: "Baby", artist: "Justin Bieber & Ludacris" },
    { title: "Wicked Game", artist: "Chris Isaak" },
    { title: "APT.", artist: "Rosé & Bruno Mars" },
    { title: "Redneck Woman", artist: "Gretchen Wilson" },
    { title: "Family Tradition", artist: "Hank Williams Jr." },
    { title: "Ice Ice Baby", artist: "Vanilla Ice" },
    { title: "Always Remember Us This Way", artist: "Lady Gaga" },
    { title: "Need You Now", artist: "Lady A" },
    { title: "Stand by Me", artist: "Ben E. King" },
    { title: "In the End", artist: "Linkin Park" },
    { title: "Hit Me With Your Best Shot", artist: "Pat Benatar" },
    { title: "Losing My Religion", artist: "R.E.M." },
    { title: "Uptown Funk", artist: "Bruno Mars & Mark Ronson" },
  ],
  newAdditions: [
    { title: "Mean to Me", artist: "Dean Martin" },
    { title: "Going Shopping", artist: "The Strokes" },
    { title: "Catch Catch (캐치캐치)", artist: "YENA (최예나)" },
    { title: "Let It Be", artist: "JP Cooper" },
    { title: "Spirit in the Dark", artist: "Aretha Franklin" },
    { title: "Bite Me", artist: "Enhypen (엔하이픈)" },
    { title: "Hold on Tight", artist: "aespa 에스파" },
    { title: "SHE DID IT AGAIN", artist: "Tyla & Zara Larsson" },
    { title: "Waiting on the Rain", artist: "Megan Moroney" },
    { title: "Born to Die", artist: "Shaboozey" },
    { title: "Bring Your Love", artist: "Madonna & Sabrina Carpenter" },
    { title: "Summer Breeze", artist: "Keith Urban" },
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
  share: {
    message: "🎤 Check out PopUp Karaoke — NW Indiana & Chicagoland's premier mobile karaoke service!",
    iosUrl: 'https://apps.apple.com/us/app/popup-karaoke/id6767769319',
    androidText: 'Coming Soon',
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
  // Always register the callback — even if the fetch is already in progress.
  // (startFetch() returns the existing promise when one is running.)
  startFetch().then(data => {
    if (data !== DEFAULT_HOME_DATA) onUpdate(data);
  });
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
