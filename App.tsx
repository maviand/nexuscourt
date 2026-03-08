import React, { useState } from 'react';
import { PlayerCreator } from './components/PlayerCreator';
import { SimulationDashboard } from './components/SimulationDashboard';
import { SeasonSummary } from './components/SeasonSummary';
import { CoachingPanel } from './components/CoachingPanel';
import { PlayerProfile, CareerSimulation, EraContext, CoachingStrategy, SeasonStats, EntryMethod, TrainingFocus, Badge, NBA_TEAMS, Coach, PlayerStats } from './types';
import { simulateSeason, getEraContext } from './services/geminiService';
import { Hourglass, History, AlertCircle, Users, Briefcase, Settings } from 'lucide-react';

const ERAS: EraContext[] = [
    { year: 1984, eraName: 'The Magic vs. Bird Era', description: 'Physical defense, post-play dominance, and the birth of the modern NBA.', difficultyModifier: 1.2 },
    { year: 1996, eraName: 'The Jordan Era', description: 'Isolation scoring, hand-checking allowed, and mid-range mastery.', difficultyModifier: 1.1 },
    { year: 2004, eraName: 'The Kobe Era', description: 'Slower pace, defensive struggles, and the rise of international stars.', difficultyModifier: 1.0 },
    { year: 2016, eraName: 'The Curry Era', description: 'Pace and space, three-point revolution, and switch-heavy defenses.', difficultyModifier: 0.9 },
    { year: 2024, eraName: 'The Modern Era', description: 'Positionless basketball, unprecedented skill levels, and high scoring.', difficultyModifier: 1.0 }
];

const EraSelector = ({ onSelect, isLoading, initialEntryMethod, initialTeam }: { onSelect: (year: number, entryMethod: EntryMethod, team?: string, context?: EraContext) => void, isLoading: boolean, initialEntryMethod?: EntryMethod, initialTeam?: string }) => {
    const [year, setYear] = useState(2003);
    const [context, setContext] = useState<EraContext | null>(null);
    const [entryMethod, setEntryMethod] = useState<EntryMethod>(initialEntryMethod || 'Draft');
    const [specificTeam, setSpecificTeam] = useState(initialTeam || NBA_TEAMS[0]);

    const handleYearChange = async (y: number) => {
        setYear(y);
        const preDefined = ERAS.find(e => e.year === y);
        if (preDefined) {
            setContext(preDefined);
        } else {
            setContext(null);
            const ctx = await getEraContext(y);
            setContext(ctx);
        }
    };

    // Initial fetch
    React.useEffect(() => {
        handleYearChange(2003);
    }, []);

    // Update state if props change (e.g. from player creation demand)
    React.useEffect(() => {
        if (initialEntryMethod) setEntryMethod(initialEntryMethod);
        if (initialTeam) setSpecificTeam(initialTeam);
    }, [initialEntryMethod, initialTeam]);

    return (
        <div className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl p-8 shadow-lg animate-fade-in">
            <h2 className="text-3xl font-bold text-nba-blue mb-8 uppercase tracking-wider text-center">Select Entry Point</h2>

            <div className="mb-8">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Quick Select Historical Era</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ERAS.map(era => (
                        <button
                            key={era.year}
                            onClick={() => handleYearChange(era.year)}
                            className={`p-3 rounded border text-left transition-all ${year === era.year ? 'border-[#1D428A] bg-[#f0f4f8] shadow-inner border-l-4 border-l-nba-red' : 'border-gray-300 bg-white hover:border-[#1D428A]'}`}
                        >
                            <div className="font-bold text-sm text-nba-dark display-font">{era.year}</div>
                            <div className="text-xs text-gray-700 truncate">{era.eraName}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-10 text-center">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-3 text-left">Or Select Custom Year</label>
                <input
                    type="range"
                    min="1980"
                    max="2024"
                    value={year}
                    onChange={(e) => handleYearChange(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-300 rounded appearance-none cursor-pointer accent-nba-red mb-4"
                />
                <div className="text-6xl font-black text-nba-dark display-font">{year}</div>
                <p className="text-nba-red font-bold uppercase tracking-widest mt-1 text-sm">Starting Season</p>
            </div>

            <div className="bg-white rounded p-6 min-h-[100px] mb-8 border-t-4 border-t-[#1D428A] shadow-sm">
                {context ? (
                    <>
                        <h3 className="text-xl font-bold text-nba-dark mb-2 display-font">{context.eraName}</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">{context.description}</p>
                    </>
                ) : (
                    <div className="text-center text-gray-400 animate-pulse">Scanning Timeline...</div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    onClick={() => setEntryMethod('Draft')}
                    className={`p-4 rounded border flex flex-col items-center gap-2 transition-all ${entryMethod === 'Draft' ? 'bg-[#1D428A] border-[#1D428A] text-white shadow-md' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'}`}
                >
                    <Briefcase size={24} />
                    <span className="font-bold uppercase text-sm display-font tracking-wide">Enter Draft</span>
                </button>
                <button
                    onClick={() => setEntryMethod('Specific Team')}
                    className={`p-4 rounded border flex flex-col items-center gap-2 transition-all ${entryMethod === 'Specific Team' ? 'bg-[#1D428A] border-[#1D428A] text-white shadow-md' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'}`}
                >
                    <Users size={24} />
                    <span className="font-bold uppercase text-sm display-font tracking-wide">Join Team</span>
                </button>
            </div>

            {entryMethod === 'Specific Team' && (
                <div className="mb-8">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Franchise</label>
                    <select
                        value={specificTeam}
                        onChange={(e) => setSpecificTeam(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded p-4 text-gray-900 focus:border-nba-red outline-none"
                    >
                        {NBA_TEAMS.map(team => (
                            <option key={team} value={team}>{team}</option>
                        ))}
                    </select>
                </div>
            )}

            <button
                onClick={() => onSelect(year, entryMethod, specificTeam, context || undefined)}
                disabled={isLoading || (entryMethod === 'Specific Team' && !specificTeam)}
                className="w-full py-4 bg-nba-red text-white font-bold uppercase tracking-widest hover:bg-red-800 transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md display-font text-lg"
            >
                {isLoading ? <><Hourglass className="animate-spin" /> Preparing Simulation...</> : 'Initialize Season'}
            </button>
        </div>
    );
};

export default function App() {
    const [step, setStep] = useState<'create' | 'era' | 'strategy' | 'season_loop' | 'career_end'>('create');

    // Game State
    const [player, setPlayer] = useState<PlayerProfile | null>(null);
    const [currentYear, setCurrentYear] = useState<number>(2003);
    const [entryMethod, setEntryMethod] = useState<EntryMethod>('Draft');
    const [startTeam, setStartTeam] = useState<string>('');
    const [strategy, setStrategy] = useState<CoachingStrategy | null>(null);
    const [injuriesEnabled, setInjuriesEnabled] = useState(true);

    // Simulation Data
    const [seasons, setSeasons] = useState<SeasonStats[]>([]);
    const [lastSeason, setLastSeason] = useState<SeasonStats | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dynamic Player State (Progression)
    const [currentAttributes, setCurrentAttributes] = useState<PlayerProfile['stats'] | null>(null);
    const [currentBadges, setCurrentBadges] = useState<Badge[]>([]);
    const [xp, setXp] = useState(0);

    const handlePlayerCreated = (p: PlayerProfile) => {
        setPlayer(p);
        setCurrentAttributes(p.stats);
        setCurrentBadges(p.badges);
        setXp(p.xp || 0);
        setInjuriesEnabled(p.injuriesEnabled !== undefined ? p.injuriesEnabled : true);

        // Check if player demanded a specific trade target on creation (draft demand)
        if (p.draftTradeRequest) {
            setEntryMethod('Specific Team');
            setStartTeam(p.draftTradeRequest);
        } else {
            setEntryMethod('Draft');
            setStartTeam('');
        }

        setStep('era');
    };

    const handleEraSelected = (year: number, method: EntryMethod, team?: string, context?: EraContext) => {
        setCurrentYear(year);
        // Only overwrite if not already set by player demand, OR if user changed the method in the UI
        setEntryMethod(method);
        if (team) setStartTeam(team);
        if (context && player) {
            setPlayer({ ...player, era: context });
        }
        setStep('strategy');
    };

    const handleStrategyConfirmed = async (strat: CoachingStrategy) => {
        setStrategy(strat);
        setStep('season_loop');
        // Use player's selected training focus if available, otherwise default to Balanced
        const initialTraining = player?.trainingFocus || 'Balanced';
        await runSeasonSimulation(strat, initialTraining, { requested: false, target: '' }, [], 0, true);
    };

    const runSeasonSimulation = async (
        strat: CoachingStrategy,
        training: TrainingFocus,
        tradeReq: { requested: boolean, target: string },
        updatedBadges: Badge[],
        spentXp: number,
        isRookieYear: boolean,
        manualAttributeUpdates?: PlayerStats,
        activeCoach?: Coach
    ) => {
        if (!player || !currentAttributes) return;

        setIsSimulating(true);
        setError(null);

        // If the user manually updated attributes using XP, commit those changes immediately before sim
        const attributesForSim = manualAttributeUpdates || currentAttributes;

        // Update state with changes made in Summary before simulating new season
        if (!isRookieYear) {
            setCurrentBadges(updatedBadges);
            setXp(prev => prev - spentXp);
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
                attributesForSim, // Use the potentially manually upgraded stats
                seasons,
                strat,
                training,
                injuriesEnabled,
                tradeReq,
                isRookieYear && entryMethod === 'Specific Team' ? startTeam : undefined,
                activeCoach,
                player.era
            );

            setLastSeason(seasonData);
            setSeasons(prev => [...prev, seasonData]);

            // Update attributes for next year (AI decided progression/regression)
            let newAttributes = seasonData.ratingsSnapshot;
            const currentAge = 19 + seasons.length;
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
            setCurrentAttributes(newAttributes);

            // Add XP gained this season
            let xpMultiplier = 3;
            if (seasonData.awards.some(a => a.includes('MVP') || a.includes('Defensive Player'))) xpMultiplier = 9;
            else if (seasonData.allStar || seasonData.awards.length > 0) xpMultiplier = 6;

            setXp(prev => prev + ((seasonData.xpGained || 0) * xpMultiplier));

            // Update Career Stats
            setPlayer(prev => {
                if (!prev) return null;
                const currentStats = prev.careerStats || { totalPoints: 0, totalRebounds: 0, totalAssists: 0, championships: 0, mvps: 0, awards: [], legacyScore: 0 };

                const newTotalPoints = Math.round(currentStats.totalPoints + (seasonData.ppg * seasonData.gamesPlayed));
                const newTotalRebounds = Math.round(currentStats.totalRebounds + (seasonData.rpg * seasonData.gamesPlayed));
                const newTotalAssists = Math.round(currentStats.totalAssists + (seasonData.apg * seasonData.gamesPlayed));
                const newChampionships = currentStats.championships + (seasonData.championship ? 1 : 0);
                const newMvps = currentStats.mvps + (seasonData.awards.some(a => a.includes('MVP')) ? 1 : 0);

                const newAwards = [...(currentStats.awards || []), ...seasonData.awards];
                if (seasonData.allStar) newAwards.push(`${seasonData.year} All-Star`);
                if (seasonData.championship) newAwards.push(`${seasonData.year} NBA Champion`);

                const legacyScore = Math.floor(newTotalPoints / 100) + (newChampionships * 500) + (newMvps * 300) + (newAwards.length * 50);

                return {
                    ...prev,
                    careerStats: {
                        totalPoints: newTotalPoints,
                        totalRebounds: newTotalRebounds,
                        totalAssists: newTotalAssists,
                        championships: newChampionships,
                        mvps: newMvps,
                        awards: newAwards,
                        legacyScore: legacyScore
                    }
                };
            });

            setCurrentYear(prev => prev + 1);
        } catch (e) {
            console.error(e);
            setError(`The timeline destabilized. Failed to simulate season. Detail: ${e?.message || 'Unknown'}. Please try again.`);
        } finally {
            setIsSimulating(false);
        }
    };

    const handleNextSeason = (training: TrainingFocus, tradeReq: { requested: boolean, target: string }, updatedBadges: Badge[], spentXp: number, newCoach?: Coach, updatedStats?: PlayerStats) => {
        if (!strategy) return;

        let nextStrategy = strategy;
        if (newCoach) {
            nextStrategy = {
                ...strategy,
                offensiveSystem: newCoach.offensiveSystem,
                defensiveScheme: newCoach.defensiveScheme
            };
            setStrategy(nextStrategy);
        }

        // Pass the new coach if hired, otherwise fallback to existing coach logic inside runSeasonSimulation (via lastSeason) is tricky because 
        // runSeasonSimulation doesn't have direct access to lastSeason readily available in its args, but it uses the closure state 'seasons'.
        // However, to be explicit, we should pass the active coach we want to use.
        const coachToUse = newCoach || lastSeason?.headCoach;

        // If user bought attributes, updatedStats will be populated.
        // If not, we fall back to currentAttributes in the runSeasonSimulation logic via manualAttributeUpdates argument
        runSeasonSimulation(nextStrategy, training, tradeReq, updatedBadges, spentXp, false, updatedStats, coachToUse);
    };

    const handleRetire = () => {
        setStep('career_end');
    };

    const reset = () => {
        setStep('create');
        setPlayer(null);
        setSeasons([]);
        setLastSeason(null);
        setCurrentAttributes(null);
        setCurrentBadges([]);
        setXp(0);
    };

    const getCareerSimulationData = (): CareerSimulation => {
        const totalPoints = seasons.reduce((acc, s) => acc + (s.ppg * s.gamesPlayed), 0);
        const titles = seasons.filter(s => s.championship).length;
        const mvps = seasons.filter(s => s.awards.some(a => a.includes('MVP'))).length;
        const allStars = seasons.filter(s => s.allStar).length;
        const legacyScore = player?.careerStats?.legacyScore || (Math.floor(totalPoints / 100) + (titles * 500) + (mvps * 300) + (allStars * 100));

        return {
            summary: `A ${seasons.length}-year career defined by ${titles > 0 ? 'championship glory' : 'persistence'}.`,
            accolades: { titles, mvps, allStars, hallOfFameChance: legacyScore > 2000 ? 99 : Math.min(99, legacyScore / 20) },
            seasons,
            legacyScore
        };
    };

    return (
        <div className="min-h-screen bg-[#f7f9fa] text-gray-900 font-sans selection:bg-nba-blue selection:text-white pb-20">

            {/* Navbar - NBA.com Style */}
            <div className="w-full h-1 bg-nba-red"></div>
            <nav className="sticky top-0 z-50 w-full bg-[#1D428A] text-white shadow-md p-4 mb-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-nba-red font-black font-display text-xl shadow-inner border-2 border-nba-blue">NBA</div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tighter text-white uppercase display-font leading-none">Nexus Court</span>
                            <span className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">Legacy Simulator</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Player Info (If Active) */}
                        {player && currentAttributes && step !== 'create' && (
                            <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-[#0b2454] rounded border border-[#2b54a3]">
                                <span className="text-sm font-bold text-white uppercase">{player.name}</span>
                                <div className="h-4 w-px bg-gray-300"></div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">OVR</span>
                                    <span className="text-lg font-black text-nba-blue leading-none">{currentAttributes.rating}</span>
                                </div>
                            </div>
                        )}

                        {/* Settings Toggle */}
                        {step !== 'create' && (
                            <button
                                onClick={() => setInjuriesEnabled(!injuriesEnabled)}
                                className={`flex items-center gap-2 text-xs font-bold uppercase px-3 py-1.5 rounded transition-colors ${injuriesEnabled ? 'bg-nba-red text-white' : 'bg-[#0b2454] text-gray-400'}`}
                            >
                                <Settings size={14} /> Injuries: {injuriesEnabled ? 'ON' : 'OFF'}
                            </button>
                        )}

                        <div className="text-xs font-display tracking-widest flex gap-4 hidden md:flex text-gray-400">
                            <span className={step === 'create' ? 'text-white font-bold border-b-2 border-nba-red pb-1' : 'hover:text-white cursor-pointer pb-1'}>01. CREATE</span>
                            <span>/</span>
                            <span className={step === 'era' ? 'text-white font-bold border-b-2 border-nba-red pb-1' : 'hover:text-white cursor-pointer pb-1'}>02. ERA</span>
                            <span>/</span>
                            <span className={step === 'strategy' ? 'text-white font-bold border-b-2 border-nba-red pb-1' : 'hover:text-white cursor-pointer pb-1'}>03. STRATEGY</span>
                            <span>/</span>
                            <span className={step === 'season_loop' ? 'text-white font-bold border-b-2 border-nba-red pb-1' : 'hover:text-white cursor-pointer pb-1'}>04. SIMULATION</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4">
                {step === 'create' && <PlayerCreator onComplete={handlePlayerCreated} />}

                {step === 'era' && <EraSelector onSelect={handleEraSelected} isLoading={false} initialEntryMethod={entryMethod} initialTeam={startTeam} />}

                {step === 'strategy' && <CoachingPanel onConfirm={handleStrategyConfirmed} isLoading={false} />}

                {step === 'season_loop' && (
                    <>
                        {isSimulating && !lastSeason && (
                            <div className="text-center bg-white p-12 rounded shadow-md border-t-4 border-nba-red animate-pulse space-y-4">
                                <div className="w-16 h-16 border-4 border-[#1D428A] border-t-nba-red rounded-full animate-spin mx-auto"></div>
                                <h2 className="text-2xl font-bold text-nba-dark uppercase tracking-widest display-font">Simulating Season...</h2>
                                <p className="text-gray-500 font-bold text-sm uppercase">Processing League Outcomes</p>
                            </div>
                        )}

                        {(!isSimulating || lastSeason) && lastSeason && (
                            <SeasonSummary
                                season={lastSeason}
                                previousAttributes={seasons.length > 1 ? seasons[seasons.length - 2].ratingsSnapshot : player?.stats}
                                previousSeasonStats={seasons.length > 1 ? seasons[seasons.length - 2] : undefined}
                                currentBadges={currentBadges}
                                xpAvailable={xp}
                                onAddXp={(amount) => setXp(prev => prev + amount)}
                                onContinue={handleNextSeason}
                                onRetire={handleRetire}
                                isSimulating={isSimulating}
                                player={player || undefined}
                                onUpdatePlayer={setPlayer}
                                history={seasons}
                            />
                        )}
                    </>
                )}

                {step === 'career_end' && seasons.length > 0 && player && (
                    <SimulationDashboard simulation={getCareerSimulationData()} player={player} onReset={reset} />
                )}

                {error && (
                    <div className="mt-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 max-w-md mx-auto shadow-sm">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}
            </main>
        </div>
    );
}