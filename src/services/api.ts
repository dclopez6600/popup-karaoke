// ─────────────────────────────────────────────
//  PopUp Karaoke · API Service
//  Connects to the website and pulls live data.
//  Replace BASE_URL with your actual backend URL.
// ─────────────────────────────────────────────

import axios, { AxiosInstance } from 'axios';

// ── Types ──────────────────────────────────────

export interface Event {
  id: string;
  title: string;
  venue: string;
  address: string;
  date: string;        // ISO string
  endDate: string;
  imageUrl?: string;
  hostName: string;
  hostAvatar?: string;
  genre: string[];
  ticketUrl?: string;
  isLive: boolean;
  attendeeCount: number;
  capacity: number;
  description: string;
  rating: number;
}

export interface NowPlaying {
  songTitle: string;
  artist: string;
  singerName: string;
  singerAvatar?: string;
  startedAt: string;   // ISO string
  durationSeconds: number;
  albumArt?: string;
  key: string;         // musical key
  bpm?: number;
  eventId: string;
  nextUp: SingerSlot[];
}

export interface SingerSlot {
  singerName: string;
  singerAvatar?: string;
  songTitle: string;
  artist: string;
  position: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  key: string;
  bpm: number;
  duration: number;    // seconds
  albumArt?: string;
  language: string;
  decade: string;
  isFavorite?: boolean;
  playCount: number;
}

export interface Review {
  id: string;
  eventId: string;
  eventTitle: string;
  venueName: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;      // 1-5
  body: string;
  date: string;
  likes: number;
  isLiked?: boolean;
  tags: string[];
}

export interface SocialPost {
  id: string;
  type: 'event_checkin' | 'review' | 'song_request' | 'achievement';
  authorName: string;
  authorAvatar?: string;
  content: string;
  eventTitle?: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  comments: number;
}

export interface LiveStatus {
  activeEventId: string | null;
  activeEventTitle: string | null;
  venueName: string | null;
  nowPlaying: NowPlaying | null;
  isLive: boolean;
  viewerCount: number;
}

// ── Mock Data (remove when real backend is live) ──

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Friday Night Karaoke Bash',
    venue: 'The Velvet Underground',
    address: '742 Sunset Blvd, Los Angeles, CA',
    date: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 86400000 + 14400000).toISOString(),
    hostName: 'DJ Marko',
    genre: ['Pop', 'R&B', 'Hip-Hop'],
    isLive: false,
    attendeeCount: 47,
    capacity: 80,
    description: 'LA\'s hottest weekly karaoke night. All genres welcome, amazing sound system, full bar.',
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Throwback Hits Night',
    venue: 'Neon Nights Lounge',
    address: '1200 Hollywood Ave, Los Angeles, CA',
    date: new Date(Date.now() + 172800000).toISOString(),
    endDate: new Date(Date.now() + 172800000 + 10800000).toISOString(),
    hostName: 'Lisa K',
    genre: ['80s', '90s', '2000s'],
    isLive: false,
    attendeeCount: 23,
    capacity: 60,
    description: 'Relive your favorite decades. From Madonna to Britney, we\'ve got them all.',
    rating: 4.6,
  },
  {
    id: '3',
    title: '🔴 LIVE NOW · Midweek Sing-Along',
    venue: 'The Speakeasy Bar',
    address: '88 West 3rd St, Los Angeles, CA',
    date: new Date().toISOString(),
    endDate: new Date(Date.now() + 7200000).toISOString(),
    hostName: 'Captain Mic',
    genre: ['Country', 'Rock', 'Pop'],
    isLive: true,
    attendeeCount: 61,
    capacity: 75,
    description: 'Happening right now! Jump in and grab a mic.',
    rating: 4.9,
  },
];

export const MOCK_NOW_PLAYING: NowPlaying = {
  songTitle: 'Bohemian Rhapsody',
  artist: 'Queen',
  singerName: 'Alex T.',
  startedAt: new Date(Date.now() - 90000).toISOString(),
  durationSeconds: 354,
  key: 'Bb Major',
  bpm: 72,
  eventId: '3',
  nextUp: [
    { singerName: 'Maria C.', songTitle: 'Rolling in the Deep', artist: 'Adele', position: 1 },
    { singerName: 'Jordan P.', songTitle: 'Sweet Caroline', artist: 'Neil Diamond', position: 2 },
    { singerName: 'Sam R.', songTitle: 'Mr. Brightside', artist: 'The Killers', position: 3 },
  ],
};

export const MOCK_SONGS: Song[] = [
  { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock', key: 'Bb Major', bpm: 72, duration: 354, language: 'English', decade: '70s', playCount: 1247 },
  { id: '2', title: 'Rolling in the Deep', artist: 'Adele', genre: 'Pop/Soul', key: 'C Minor', bpm: 105, duration: 228, language: 'English', decade: '2010s', playCount: 983 },
  { id: '3', title: 'Don\'t Stop Believin\'', artist: 'Journey', genre: 'Rock', key: 'E Major', bpm: 118, duration: 251, language: 'English', decade: '80s', playCount: 879 },
  { id: '4', title: 'Sweet Caroline', artist: 'Neil Diamond', genre: 'Pop', key: 'A Major', bpm: 128, duration: 201, language: 'English', decade: '60s', playCount: 756 },
  { id: '5', title: 'Mr. Brightside', artist: 'The Killers', genre: 'Rock', key: 'Bb Major', bpm: 148, duration: 222, language: 'English', decade: '2000s', playCount: 644 },
  { id: '6', title: 'Shallow', artist: 'Lady Gaga & Bradley Cooper', genre: 'Pop/Country', key: 'G Major', bpm: 96, duration: 216, language: 'English', decade: '2010s', playCount: 612 },
  { id: '7', title: 'Total Eclipse of the Heart', artist: 'Bonnie Tyler', genre: 'Pop/Rock', key: 'F Minor', bpm: 140, duration: 331, language: 'English', decade: '80s', playCount: 589 },
  { id: '8', title: 'I Will Always Love You', artist: 'Whitney Houston', genre: 'R&B', key: 'Db Major', bpm: 68, duration: 274, language: 'English', decade: '90s', playCount: 534 },
  { id: '9', title: 'Africa', artist: 'Toto', genre: 'Rock', key: 'Ab Major', bpm: 92, duration: 295, language: 'English', decade: '80s', playCount: 501 },
  { id: '10', title: 'Livin\' on a Prayer', artist: 'Bon Jovi', genre: 'Rock', key: 'E Minor', bpm: 123, duration: 250, language: 'English', decade: '80s', playCount: 478 },
  { id: '11', title: 'WAP', artist: 'Cardi B ft. Megan Thee Stallion', genre: 'Hip-Hop', key: 'G Minor', bpm: 133, duration: 193, language: 'English', decade: '2020s', playCount: 445 },
  { id: '12', title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Synth-pop', key: 'F Minor', bpm: 171, duration: 200, language: 'English', decade: '2020s', playCount: 423 },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: '1', eventId: '1', eventTitle: 'Friday Night Karaoke Bash', venueName: 'The Velvet Underground',
    authorName: 'Sarah M.', rating: 5, body: 'Absolutely incredible night! The sound system was top-notch and the crowd energy was unmatched. DJ Marko kept everything flowing perfectly. Already planning my next visit!',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), likes: 23, tags: ['Great Sound', 'Friendly Host', 'Good Drinks'],
  },
  {
    id: '2', eventId: '2', eventTitle: 'Throwback Hits Night', venueName: 'Neon Nights Lounge',
    authorName: 'Carlos R.', rating: 4, body: 'Super fun throwback playlist. Got to sing Total Eclipse of the Heart to a packed crowd. Only wish the mic levels were a bit higher. Will definitely be back.',
    date: new Date(Date.now() - 86400000 * 5).toISOString(), likes: 15, tags: ['Great Song Selection', 'Fun Crowd'],
  },
  {
    id: '3', eventId: '3', eventTitle: 'Midweek Sing-Along', venueName: 'The Speakeasy Bar',
    authorName: 'Jordan K.', rating: 5, body: 'Best midweek activity in LA. Captain Mic is the most entertaining host I\'ve ever seen. The rotation was fair, wait time was minimal. Highly recommend!',
    date: new Date(Date.now() - 86400000 * 7).toISOString(), likes: 31, tags: ['Amazing Host', 'Short Wait', 'Lively Atmosphere'],
  },
];

export const MOCK_SOCIAL: SocialPost[] = [
  {
    id: '1', type: 'event_checkin', authorName: 'Alex T.', content: 'Just finished singing Bohemian Rhapsody at The Speakeasy! 🎤🎸 The crowd went WILD!',
    eventTitle: 'Midweek Sing-Along', timestamp: new Date(Date.now() - 300000).toISOString(), likes: 18, comments: 4,
  },
  {
    id: '2', type: 'achievement', authorName: 'Maria C.', content: '🏆 Just unlocked "Crowd Pleaser" — got a standing ovation from 50+ people!',
    timestamp: new Date(Date.now() - 900000).toISOString(), likes: 42, comments: 9,
  },
  {
    id: '3', type: 'review', authorName: 'Sam R.', content: 'Left a ⭐⭐⭐⭐⭐ review for Friday Night Karaoke Bash. Honestly the best karaoke night in the city right now.',
    eventTitle: 'Friday Night Karaoke Bash', timestamp: new Date(Date.now() - 3600000).toISOString(), likes: 7, comments: 2,
  },
  {
    id: '4', type: 'song_request', authorName: 'Jordan P.', content: 'Getting ready to sing "Sweet Caroline" at Midweek Sing-Along tonight. Who\'s coming?! 🎶',
    eventTitle: 'Midweek Sing-Along', timestamp: new Date(Date.now() - 7200000).toISOString(), likes: 11, comments: 5,
  },
];

export const MOCK_LIVE_STATUS: LiveStatus = {
  activeEventId: '3',
  activeEventTitle: 'Midweek Sing-Along',
  venueName: 'The Speakeasy Bar',
  nowPlaying: MOCK_NOW_PLAYING,
  isLive: true,
  viewerCount: 61,
};

// ── API Client ─────────────────────────────────

const BASE_URL = 'https://karaoke-connect-dclopez6600.replit.app';

class KaraokeAPI {
  private client: AxiosInstance;
  private useMock: boolean = true; // song catalog is now live via catalogService; this flag covers other endpoints

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Detect if backend has real API endpoints
  async checkBackendCapabilities(): Promise<boolean> {
    try {
      const res = await this.client.get('/api/health');
      this.useMock = res.status !== 200;
      return !this.useMock;
    } catch {
      this.useMock = true;
      return false;
    }
  }

  async getLiveStatus(): Promise<LiveStatus> {
    // Always try real backend first; fall back to "not live" rather than fake data
    try {
      const res = await this.client.get('/api/live');
      return res.data;
    } catch {
      return { activeEventId: null, activeEventTitle: null, venueName: null, nowPlaying: null, isLive: false, viewerCount: 0 };
    }
  }

  async getEvents(): Promise<Event[]> {
    if (this.useMock) return MOCK_EVENTS;
    const res = await this.client.get('/api/events');
    return res.data;
  }

  async getNowPlaying(eventId?: string): Promise<NowPlaying | null> {
    // Always try real backend; return null (empty state) if unavailable
    try {
      const url = eventId ? `/api/events/${eventId}/now-playing` : '/api/now-playing';
      const res = await this.client.get(url);
      return res.data;
    } catch {
      return null;
    }
  }

  async getSongs(query?: string, genre?: string): Promise<Song[]> {
    if (this.useMock) {
      let songs = MOCK_SONGS;
      if (query) songs = songs.filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase())
      );
      if (genre && genre !== 'All') songs = songs.filter(s => s.genre.toLowerCase().includes(genre.toLowerCase()));
      return songs;
    }
    const res = await this.client.get('/api/songs', { params: { q: query, genre } });
    return res.data;
  }

  async getReviews(eventId?: string): Promise<Review[]> {
    if (this.useMock) {
      return eventId ? MOCK_REVIEWS.filter(r => r.eventId === eventId) : MOCK_REVIEWS;
    }
    const url = eventId ? `/api/events/${eventId}/reviews` : '/api/reviews';
    const res = await this.client.get(url);
    return res.data;
  }

  async getSocialFeed(): Promise<SocialPost[]> {
    // Always try real backend; return empty feed rather than fake posts
    try {
      const res = await this.client.get('/api/social/feed');
      return res.data;
    } catch {
      return [];
    }
  }

  async likeReview(reviewId: string): Promise<void> {
    if (this.useMock) return;
    await this.client.post(`/api/reviews/${reviewId}/like`);
  }

  async likeSocialPost(postId: string): Promise<void> {
    if (this.useMock) return;
    await this.client.post(`/api/social/${postId}/like`);
  }
}

export const api = new KaraokeAPI();
