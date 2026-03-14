import { SeasonStats } from './types';

export function isSeasonStats(data: any): data is SeasonStats {
    if (!data || typeof data !== 'object') return false;

    // Check core properties
    if (typeof data.year !== 'number' && typeof data.year !== 'undefined') return false; // year is injected later
    if (typeof data.team !== 'string') return false;

    // Check detailed stats
    if (typeof data.gamesPlayed !== 'number') return false;
    if (typeof data.ppg !== 'number') return false;

    // Arrays
    if (!Array.isArray(data.awards)) return false;

    return true;
}
