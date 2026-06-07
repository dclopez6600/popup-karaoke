// ─────────────────────────────────────────────
//  PopUp Karaoke · API Service
//  Pings the backend to check if it's live.
// ─────────────────────────────────────────────

import axios from 'axios';

const BASE_URL = 'https://karaoke-connect-dclopez6600.replit.app';

class KaraokeAPI {
  private client = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  async checkBackendCapabilities(): Promise<boolean> {
    try {
      const res = await this.client.get('/api/health');
      return res.status === 200;
    } catch {
      return false;
    }
  }
}

export const api = new KaraokeAPI();
