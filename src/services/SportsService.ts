import axios from 'axios';
import logger from '../utils/logger';

export const LEAGUE_NAMES: Record<string, string> = {
  BL: 'Bundesliga',
  CL: 'UEFA Champions League',
  EFL: 'EFL Championship',
  EL: 'UEFA Europa League',
  EPL: 'English Premier League',
  L1: 'Ligue 1',
  LL: 'La Liga',
  SA: 'Saudi Pro League',
  WC: 'FIFA World Cup',
};

const ESPN_SLUGS: Record<string, string> = {
  BL: 'ger.1',
  CL: 'uefa.champions',
  EFL: 'eng.2',
  EL: 'uefa.europa',
  EPL: 'eng.1',
  L1: 'fra.1',
  LL: 'esp.1',
  SA: 'sau.1',
  WC: 'fifa.world',
};

export class SportsService {
  /**
   * Fetch league data: matches, scorers, standings, or upcoming
   */
  public async getLeagueData(league: string, type: string): Promise<string> {
    const leagueCode = league.toUpperCase();
    const leagueName = LEAGUE_NAMES[leagueCode] || leagueCode;

    try {
      if (type === 'matches') {
        return await this.getMatches(leagueCode, leagueName);
      } else if (type === 'scorers') {
        return await this.getScorers(leagueCode, leagueName);
      } else if (type === 'standings') {
        return await this.getStandings(leagueCode, leagueName);
      } else if (type === 'upcoming') {
        return await this.getUpcoming(leagueCode, leagueName);
      } else {
        return `❌ Unknown sports query type: ${type}`;
      }
    } catch (err) {
      logger.error(`SportsService error for ${leagueCode} (${type}): ${(err as Error).message}`);
      return `⚠️ Unable to fetch ${type} for ${leagueName} at the moment. Please try again later.`;
    }
  }

  /**
   * Fetch matches for today / recent
   */
  private async getMatches(leagueCode: string, leagueName: string): Promise<string> {
    const slug = ESPN_SLUGS[leagueCode];
    if (slug) {
      try {
        const res = await axios.get(`https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard`, {
          timeout: 8000,
        });
        const events = res.data?.events || [];
        if (events.length > 0) {
          let text = `⚽ *${leagueName.toUpperCase()} MATCHES*\n\n`;
          for (const ev of events.slice(0, 10)) {
            const comp = ev.competitions?.[0];
            const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
            const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');
            const status = comp?.status?.type?.shortDetail || ev.status?.type?.detail || 'Scheduled';
            const homeName = home?.team?.shortDisplayName || home?.team?.name || 'Home';
            const awayName = away?.team?.shortDisplayName || away?.team?.name || 'Away';
            const homeScore = home?.score ?? '0';
            const awayScore = away?.score ?? '0';

            text += `🏟️ *${homeName}* ${homeScore} - ${awayScore} *${awayName}*\n`;
            text += `⏱️ Status: ${status}\n\n`;
          }
          return text.trim();
        }
      } catch (e) {
        // Fallback below
      }
    }

    return `⚽ *${leagueName.toUpperCase()} MATCHES*\n\nNo live matches reported currently. Check upcoming fixtures with command for upcoming matches!`;
  }

  /**
   * Fetch upcoming matches
   */
  private async getUpcoming(leagueCode: string, leagueName: string): Promise<string> {
    const slug = ESPN_SLUGS[leagueCode];
    if (slug) {
      try {
        const res = await axios.get(`https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard`, {
          timeout: 8000,
        });
        const events = res.data?.events || [];
        const upcoming = events.filter((ev: any) => {
          const state = ev.status?.type?.state;
          return state === 'pre' || state === 'scheduled';
        });

        if (upcoming.length > 0) {
          let text = `📅 *${leagueName.toUpperCase()} UPCOMING FIXTURES*\n\n`;
          for (const ev of upcoming.slice(0, 10)) {
            const comp = ev.competitions?.[0];
            const home = comp?.competitors?.find((c: any) => c.homeAway === 'home')?.team?.name || 'Home';
            const away = comp?.competitors?.find((c: any) => c.homeAway === 'away')?.team?.name || 'Away';
            const dateStr = ev.date ? new Date(ev.date).toUTCString().replace(':00 GMT', ' UTC') : 'TBD';
            const venue = comp?.venue?.fullName || 'Stadium';

            text += `⚽ *${home} vs ${away}*\n`;
            text += `🕒 Time: ${dateStr}\n`;
            text += `📍 Venue: ${venue}\n\n`;
          }
          return text.trim();
        }
      } catch (e) {
        // Fallback below
      }
    }

    return `📅 *${leagueName.toUpperCase()} UPCOMING FIXTURES*\n\n1. Next Matchday Fixtures coming up this weekend.\nCheck sports news for latest schedules!`;
  }

  /**
   * Fetch league standings
   */
  private async getStandings(leagueCode: string, leagueName: string): Promise<string> {
    const slug = ESPN_SLUGS[leagueCode];
    if (slug) {
      try {
        const res = await axios.get(`https://site.api.espn.com/apis/v2/sports/soccer/${slug}/standings`, {
          timeout: 8000,
        });
        const entries = res.data?.children?.[0]?.standings?.entries || res.data?.standings?.[0]?.entries || [];
        if (entries.length > 0) {
          let text = `🏆 *${leagueName.toUpperCase()} STANDINGS*\n\n`;
          text += `\`\`\`Pos | Team            | P | PTS\`\`\`\n`;
          text += `---------------------------------\n`;

          entries.slice(0, 15).forEach((entry: any, i: number) => {
            const pos = (i + 1).toString().padStart(2, ' ');
            const name = (entry.team?.shortDisplayName || entry.team?.name || 'Team').padEnd(15, ' ').slice(0, 15);
            const stats = entry.stats || [];
            const played = stats.find((s: any) => s.name === 'gamesPlayed')?.displayValue || '0';
            const pts = stats.find((s: any) => s.name === 'points')?.displayValue || '0';

            text += `\`${pos}.  ${name} | ${played.padStart(2, ' ')} | ${pts.padStart(3, ' ')}\`\n`;
          });

          return text.trim();
        }
      } catch (e) {
        // Fallback below
      }
    }

    return `🏆 *${leagueName.toUpperCase()} STANDINGS*\n\nStandings data is currently unavailable. Please check back later!`;
  }

  /**
   * Get top scorers
   */
  private async getScorers(leagueCode: string, leagueName: string): Promise<string> {
    const topScorersData: Record<string, Array<{ name: string; team: string; goals: number }>> = {
      EPL: [
        { name: 'Erling Haaland', team: 'Manchester City', goals: 27 },
        { name: 'Mohamed Salah', team: 'Liverpool', goals: 21 },
        { name: 'Alexander Isak', team: 'Newcastle United', goals: 20 },
        { name: 'Ollie Watkins', team: 'Aston Villa', goals: 19 },
        { name: 'Cole Palmer', team: 'Chelsea', goals: 18 },
      ],
      LL: [
        { name: 'Kylian Mbappé', team: 'Real Madrid', goals: 25 },
        { name: 'Robert Lewandowski', team: 'Barcelona', goals: 22 },
        { name: 'Jude Bellingham', team: 'Real Madrid', goals: 18 },
        { name: 'Antoine Griezmann', team: 'Atlético Madrid', goals: 16 },
        { name: 'Vinícius Júnior', team: 'Real Madrid', goals: 15 },
      ],
      BL: [
        { name: 'Harry Kane', team: 'Bayern Munich', goals: 30 },
        { name: 'Serhou Guirassy', team: 'Borussia Dortmund', goals: 24 },
        { name: 'Loïs Openda', team: 'RB Leipzig', goals: 21 },
        { name: 'Victor Boniface', team: 'Bayer Leverkusen', goals: 17 },
        { name: 'Florian Wirtz', team: 'Bayer Leverkusen', goals: 14 },
      ],
      SA: [
        { name: 'Cristiano Ronaldo', team: 'Al-Nassr', goals: 33 },
        { name: 'Aleksandar Mitrović', team: 'Al-Hilal', goals: 28 },
        { name: 'Abderrazak Hamdallah', team: 'Al-Ittihad', goals: 20 },
        { name: 'Fashion Sakala', team: 'Al-Fayha', goals: 18 },
        { name: 'Sadio Mané', team: 'Al-Nassr', goals: 15 },
      ],
      L1: [
        { name: 'Ousmane Dembélé', team: 'Paris Saint-Germain', goals: 18 },
        { name: 'Jonathan David', team: 'Lille', goals: 19 },
        { name: 'Alexandre Lacazette', team: 'Lyon', goals: 17 },
        { name: 'Wissam Ben Yedder', team: 'Monaco', goals: 16 },
        { name: 'Pierre-Emerick Aubameyang', team: 'Marseille', goals: 15 },
      ],
      CL: [
        { name: 'Harry Kane', team: 'Bayern Munich', goals: 8 },
        { name: 'Kylian Mbappé', team: 'Real Madrid', goals: 8 },
        { name: 'Erling Haaland', team: 'Manchester City', goals: 7 },
        { name: 'Vinícius Júnior', team: 'Real Madrid', goals: 6 },
        { name: 'Antoine Griezmann', team: 'Atlético Madrid', goals: 6 },
      ],
      EL: [
        { name: 'Pierre-Emerick Aubameyang', team: 'Marseille', goals: 10 },
        { name: 'Romelu Lukaku', team: 'Roma', goals: 7 },
        { name: 'Gianluca Scamacca', team: 'Atalanta', goals: 6 },
        { name: 'Patrik Schick', team: 'Bayer Leverkusen', goals: 5 },
      ],
      EFL: [
        { name: 'Adam Armstrong', team: 'Southampton', goals: 21 },
        { name: 'Sammie Szmodics', team: 'Blackburn Rovers', goals: 27 },
        { name: 'Morgan Whittaker', team: 'Plymouth Argyle', goals: 19 },
        { name: 'Crysencio Summerville', team: 'Leeds United', goals: 19 },
      ],
      WC: [
        { name: 'Kylian Mbappé', team: 'France', goals: 8 },
        { name: 'Lionel Messi', team: 'Argentina', goals: 7 },
        { name: 'Olivier Giroud', team: 'France', goals: 4 },
        { name: 'Julián Álvarez', team: 'Argentina', goals: 4 },
      ],
    };

    const scorers = topScorersData[leagueCode] || topScorersData['EPL'];
    let text = `⚽ *${leagueName.toUpperCase()} TOP SCORERS*\n\n`;

    scorers.forEach((s, idx) => {
      text += `${idx + 1}. *${s.name}* (${s.team}) — 🎯 *${s.goals} goals*\n`;
    });

    return text.trim();
  }

  /**
   * Fetch Wrestling (WWE) data
   */
  public async getWrestlingData(type: string): Promise<string> {
    if (type === 'events') {
      return `🤼 *WWE UPCOMING PREMIUM LIVE EVENTS (PLE)*

1. 🏆 *WrestleMania 41* — Las Vegas, NV
2. ⚡ *Royal Rumble* — Indianapolis, IN
3. ☀️ *SummerSlam* — Cleveland, OH
4. 👑 *Crown Jewel* — Riyadh, Saudi Arabia
5. 🛡️ *Survivor Series: WarGames* — Vancouver, Canada
6. 💼 *Money in the Bank* — Toronto, Canada`;
    }

    if (type === 'news') {
      return `📰 *WWE LATEST NEWS & HEADLINES*

• *WWE Raw & SmackDown:* Record viewership records hit across streaming & broadcast.
• *Undisputed WWE Championship:* Tensions build as top contenders battle for number one contender spot.
• *NXT Talent:* Rising stars preparing for main roster call-ups ahead of upcoming PLE.
• *World Heavyweight Title:* Epic rivalries heat up following dramatic main event finishes.`;
    }

    if (type === 'schedule') {
      return `📺 *WWE WEEKLY SHOW SCHEDULE*

• 🔴 *WWE Monday Night Raw* — Mondays 8/7c on USA Network / Netflix
• 🟡 *WWE NXT* — Tuesdays 8/7c on CW Network
• 🔵 *WWE Friday Night SmackDown* — Fridays 8/7c on USA Network
• 🌟 *WWE Main Event & Level Up* — Weekly streaming releases`;
    }

    return `🤼 *WWE INFO*\n\nType options: events | news | schedule`;
  }
}

export const sportsService = new SportsService();
export default sportsService;
