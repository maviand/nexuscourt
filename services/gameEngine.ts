import { CoachingStrategy, TrainingFocus, Badge, Coach, PlayerStats } from '../types';
import { useAppStore } from '../store';
import { simulateSeason } from './geminiService';

export const runSeasonSimulation = async (
    strat: CoachingStrategy,
    training: TrainingFocus,
    tradeReq: { requested: boolean, target: string },
    updatedBadges: Badge[],
    spentXp: number,
    isRookieYear: boolean,
    manualAttributeUpdates?: PlayerStats,
    activeCoach?: Coach
) => {
    const store = useAppStore.getState();
    const { player, currentAttributes, seasons, currentYear, entryMethod, startTeam } = store;

    if (!player || !currentAttributes) return;

    store.setIsSimulating(true);
    store.setError(null);

    const attributesForSim = manualAttributeUpdates || currentAttributes;

    if (!isRookieYear) {
        store.setCurrentBadges(updatedBadges);
        store.setXp(prev => prev - spentXp);
    }

    const playerStateForSim = {
        ...player,
        badges: isRookieYear ? player.badges : updatedBadges
    };

    try {
        const seasonData = await simulateSeason(
            playerStateForSim,
            currentYear,
            19 + seasons.length,
            attributesForSim,
            seasons,
            strat,
            training,
            store.injuriesEnabled,
            tradeReq,
            isRookieYear && entryMethod === 'Specific Team' ? startTeam : undefined,
            activeCoach,
            player.era
        );

        store.setLastSeason(seasonData);
        store.setSeasons(prev => [...prev, seasonData]);

        // Progression & Regression Math
        let newAttributes = seasonData.ratingsSnapshot;
        const currentAge = 19 + seasons.length;

        // Dynamic Potential Check
        if (player?.potential === 99 && currentAge >= 26 && currentAge <= 32) {
            if (newAttributes.rating < 99) {
                newAttributes.rating = 99;
                newAttributes.threePoint = Math.max(newAttributes.threePoint, 90);
                newAttributes.midRange = Math.max(newAttributes.midRange, 95);
                newAttributes.layup = Math.max(newAttributes.layup, 95);
                newAttributes.speed = Math.max(newAttributes.speed, 90);
                newAttributes.iq = Math.max(newAttributes.iq, 95);
            }
        }

        // Add regression scaling logic here
        if (currentAge >= 33) {
            const decay = currentAge - 32;
            newAttributes.speed = Math.max(30, newAttributes.speed - (2 * decay));
            newAttributes.acceleration = Math.max(30, newAttributes.acceleration - (2 * decay));
            newAttributes.vertical = Math.max(30, newAttributes.vertical - (3 * decay));
        }

        store.setCurrentAttributes(newAttributes);

        // Calculate XP
        let xpMultiplier = 3;
        if (seasonData.awards.some(a => a.includes('MVP') || a.includes('Defensive Player'))) xpMultiplier = 9;
        else if (seasonData.allStar || seasonData.awards.length > 0) xpMultiplier = 6;

        store.setXp(prev => prev + ((seasonData.xpGained || 50) * xpMultiplier));

        // Update Career Stats
        const currentStats = player.careerStats || { totalPoints: 0, totalRebounds: 0, totalAssists: 0, championships: 0, mvps: 0, awards: [], legacyScore: 0 };
        const newTotalPoints = Math.round(currentStats.totalPoints + (seasonData.ppg * seasonData.gamesPlayed));
        const newTotalRebounds = Math.round(currentStats.totalRebounds + (seasonData.rpg * seasonData.gamesPlayed));
        const newTotalAssists = Math.round(currentStats.totalAssists + (seasonData.apg * seasonData.gamesPlayed));
        const newChampionships = currentStats.championships + (seasonData.championship ? 1 : 0);
        const newMvps = currentStats.mvps + (seasonData.awards.some(a => a.includes('MVP')) ? 1 : 0);

        const newAwards = [...(currentStats.awards || []), ...seasonData.awards];
        if (seasonData.allStar) newAwards.push(`${seasonData.year} All-Star`);
        if (seasonData.championship) newAwards.push(`${seasonData.year} NBA Champion`);

        const legacyScore = Math.floor(newTotalPoints / 100) + (newChampionships * 500) + (newMvps * 300) + (newAwards.length * 50);

        store.setPlayer({
            ...player,
            careerStats: {
                totalPoints: newTotalPoints,
                totalRebounds: newTotalRebounds,
                totalAssists: newTotalAssists,
                championships: newChampionships,
                mvps: newMvps,
                awards: newAwards,
                legacyScore: legacyScore
            }
        });

        store.setCurrentYear(prev => prev + 1);
    } catch (e: any) {
        console.error(e);
        store.setError(`The timeline destabilized. Failed to simulate season. Detail: ${e?.message || 'Unknown'}. Please try again.`);
    } finally {
        store.setIsSimulating(false);
    }
};
