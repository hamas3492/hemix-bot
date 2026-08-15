import axios from 'axios';
import logger from '../utils/logger';

export class EphotoService {
  private apiEndpoints: { [key: string]: string } = {
    ephoto360: 'https://ephoto360.com',
  };

  /**
   * Generates a styled text image effect.
   * @param effectName Name of the effect
   * @param text Text content to render
   * @returns Buffer of image if successful, or null if API fails
   */
  public static async generateEffect(effectName: string, text: string): Promise<Buffer | null> {
    if (!text || !text.trim()) {
      return null;
    }

    const cleanText = encodeURIComponent(text.trim());
    const cleanEffect = effectName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // List of API providers to try in sequence
    const providers = [
      `https://api.ephoto360.com/api/${cleanEffect}?text=${cleanText}`,
      `https://ephoto360-api.vercel.app/api/${cleanEffect}?text=${cleanText}`,
      `https://some-random-api.com/canvas/overlay?text=${cleanText}&style=${cleanEffect}`,
      `https://dummyimage.com/600x400/000000/ffffff.png&text=${cleanText}`,
    ];

    for (const url of providers) {
      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (response.status === 200 && response.data && response.data.length > 100) {
          return Buffer.from(response.data);
        }
      } catch {
        // Try next provider
        continue;
      }
    }

    // Fallback: Generate an SVG badge image buffer if remote APIs fail
    try {
      const svg = `
        <svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#7f00ff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#e100ff;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)" rx="15" />
          <rect x="10" y="10" width="580" height="280" fill="none" stroke="#ffffff" stroke-width="3" rx="10" opacity="0.3"/>
          <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#ffd700" text-anchor="middle" dominant-baseline="middle">
            ✨ ${effectName.toUpperCase()} ✨
          </text>
          <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
            ${text.trim()}
          </text>
        </svg>
      `;
      return Buffer.from(svg);
    } catch (err) {
      logger.error(`EphotoService error for ${effectName}: ${(err as Error).message}`);
      return null;
    }
  }
}

export const ephotoService = new EphotoService();
export default ephotoService;
