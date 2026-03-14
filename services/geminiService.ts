import { GoogleGenAI, Type } from "@google/genai";
import { jsonrepair } from 'jsonrepair';
import { isSeasonStats } from '../typeGuards';
import { PlayerProfile, SeasonStats, EraContext, CoachingStrategy, TrainingFocus, Badge, Coach } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_ID = "gemini-3.1-pro";

async function generateWithRetry(model: string, params: any, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await ai.models.generateContent({ model, ...params });
            if (!result.text) throw new Error("Empty response from AI");
            return result;
        } catch (e: any) {
            const isRateLimit = e.status === 429 || e.code === 429 || (e.message && e.message.includes('429'));
            if ((isRateLimit || e.status >= 500) && i < retries - 1) {
                const waitTime = 2000 * Math.pow(2, i);
                console.warn(`Attempt ${i + 1} failed.Retrying in ${waitTime}ms...`);
                await new Promise(r => setTimeout(r, waitTime));
                continue;
            }
            throw e;
        }
    }
}

export const simulateSeason = async (
    player: PlayerProfile,
    currentYear: number,
    age: number,
    currentAttributes: PlayerProfile['stats'],
    previousSeasons: SeasonStats[],
    strategy: CoachingStrategy,
    trainingFocus: TrainingFocus,
    injuriesEnabled: boolean,
    tradeRequest: { requested: boolean, target: string },
    forcedTeam?: string,
    activeCoach?: Coach,
    eraContext?: EraContext
): Promise<SeasonStats> => {

    const lastSeason = previousSeasons[previousSeasons.length - 1];
    const currentTeam = forcedTeam ? forcedTeam : (lastSeason?.team || "NBA Draft Prospect");

    // Calculate accumulated fatigue from previous season if applicable
    const prevFatigue = lastSeason ? lastSeason.fatigue : 0;

    // Compact history to save tokens
    const historySummary = previousSeasons.slice(-3).map(s => `${s.year}: ${s.team}, ${s.ppg} ppg, ${s.awards.join(',')} `).join(' | ');

    // Coach context - prefer the active coach passed in (newly hired or current), fallback to last season's
    const coachContext = activeCoach ? activeCoach : (lastSeason?.headCoach);
    const coachStr = coachContext ? JSON.stringify(coachContext) : "New Coach needed";
    const devRating = coachContext?.attributes?.playerDevelopment || 50;

    // Training Focus Logic
    const focusMap: Record<string, string[]> = {
        'Shooting': ['midRange', 'threePoint', 'freeThrow'],
        'Finishing': ['layup', 'dunk', 'closeShot'],
        'Playmaking': ['passAccuracy', 'ballHandle', 'vision'],
        'Defense': ['interiorDefense', 'perimeterDefense', 'steal', 'block', 'lateralQuickness', 'helpDefense', 'onBallDefense'],
        'Rebounding': ['offRebound', 'defRebound', 'strength', 'vertical'],
        'Physicals': ['speed', 'acceleration', 'agility', 'vertical', 'strength', 'stamina'],
        'Balanced': ['iq', 'stamina', 'rating'],
        'Recovery': []
    };

    const focusedStats = focusMap[trainingFocus] || [];

    let trainingInstruction = "";
    if (trainingFocus === 'Recovery') {
        trainingInstruction = "TRAINING FOCUS: RECOVERY. The player focused entirely on health. REDUCE Fatigue significantly (e.g. set to 0-10%). Do NOT boost attributes this season; they should remain static or decline slightly due to lack of reps.";
    } else {
        trainingInstruction = `TRAINING FOCUS: ${trainingFocus}. You MUST prioritize growth in these attributes: ${focusedStats.join(', ')}.`;
    }

    // Identify top attributes and badges for the prompt
    const topAttributes = Object.entries(currentAttributes)
        .filter(([k, v]) => typeof v === 'number' && v > 85 && k !== 'rating')
        .map(([k]) => k)
        .slice(0, 3)
        .join(', ');

    const topBadges = player.badges
        .filter(b => b.tier === 'Hall of Fame' || b.tier === 'Gold')
        .map(b => b.name)
        .slice(0, 3)
        .join(', ');

    const prompt = `
Role: Nexus Engine(High - Fidelity NBA Simulator).
    Task: Simulate NBA Season ${currentYear} -${currentYear + 1}.

PLAYER: ${player.name} (${player.position}), Age ${age}, Potential: ${player.potential}.
ATTRIBUTES: ${JSON.stringify(currentAttributes)}
BADGES: ${JSON.stringify(player.badges.map(b => `${b.name} (${b.tier})`))}
HISTORY: ${historySummary}
    PREV FATIGUE: ${prevFatigue}
    CURRENT COACH: ${coachStr}
    ERA CONTEXT: ${eraContext ? JSON.stringify(eraContext) : 'Not provided'}

CONTEXT:
- Current Team: ${currentTeam}
- Trade Request: ${tradeRequest.requested ? `ACTIVE to ${tradeRequest.target}` : "None"}
- Strategy: ${strategy.offensiveSystem}, Usage: ${strategy.usageRate}, Min: ${strategy.minutesPerGame}
- Injuries Enabled: ${injuriesEnabled ? "YES" : "NO"}
    - ** TRAINING **: ${trainingInstruction}

    CRITICAL INSTRUCTIONS:
1. ** Historical Accuracy **: Adjust win totals / stats for ${currentYear}.
    2. ** Trade Logic **:
- If 'Trade Request' is ACTIVE, there is a High Probability(80 %) the player is traded to '${tradeRequest.target}' or a contender. 
       - If traded, update the 'team' field in the output to the NEW team.
       - Narrative must reflect the trade drama.
    3. ** Aging, Regression & POTENTIAL(MANDATORY) **:
- Age 19 - 27: Rapid Growth(if potential allows).
       - ** CRITICAL **: If Potential is 99, the player MUST reach 99 Overall by age 26 - 28 and maintain elite stats.They are a generational talent.DO NOT let a 99 potential player bust.
       - Age 28 - 31: Prime(Peak stats).
       - Age 32 - 35: Physical Decline. 'speed', 'vertical', 'acceleration' MUST decrease by 2 - 5 points per year.
       - Age 36 +: HEAVY Regression.All physicals drop 5 - 10 points.Skills drop. 
       - If Age > 40, player is likely a bench warmer or retired(very low stats).
    4. ** Coach Influence & Firings **:
- The Head Coach has a 'Player Development' rating of ${devRating}/99.
    - IF Rating > 75 AND Age < 28: You MUST boost attribute growth significantly(an extra + 2 to + 4 on focused stats).The player learns faster.
       - IF Rating < 60: Player growth is stagnant or slow.
       - ** FIRINGS **: If the team underperforms expectations, the coach MUST be fired.Generate a new 'headCoach' with different attributes and philosophies.
    5. ** Team Chemistry **:
- Calculate a 0 - 100 score based on winning percentage, player personalities, and coaching fit.
       - Low chemistry(<50) MUST negatively impact team record and player stats.High chemistry(> 80) boosts performance.
    6. ** AI Trades & League Dynamics **:
- Simulate 1 - 2 major trades between AI - controlled teams.Describe these in 'leagueContext.headlines'.
       - If the player's team needs a piece, they might make a trade. Reflect this in 'teammates'.
7. ** Injuries **:
- If Injuries Enabled is YES and Fatigue is high(> 70), roll for injury.
       - Major injury = significantly fewer games played(e.g. < 40) and attribute regression.
    8. ** Playoffs **: Generate a full bracket summary.
    9. ** Narrative Depth **:
- The 'narrative' field MUST be detailed and cinematic.
       - ** Reference specific attributes **: You MUST mention how their high ${topAttributes || 'attributes'} influenced specific games.
       - ** Reference specific badges **: You MUST mention how their ${topBadges || 'badges'} impacted clutch moments.
       - ** Matchups **: Name drop specific real - world rival players relevant to ${currentYear} (e.g., if 2009, mention Kobe / LeBron; if 2024, mention Luka / Ant / Giannis).
- Describe a "Signature Moment"(e.g.a game - winner or playoff takeover).

    10. ** Era - Specific Context **: The 'leagueContext.headlines' and commentary MUST reflect real historical NBA events, rules, and playstyles for the year ${currentYear}. If 1996, mention Jordan's Bulls. If 2016, mention the Warriors 73-9.
11. ** Draft Class **: Generate the top 3 prospects for the upcoming draft class. Include their name, position, archetype, potential(1 - 99), height, and a real NBA player comparison.
    12. ** Standings **: Generate the FULL conference standings(15 teams in the East, 15 teams in the West).

    Return valid JSON.
    `;

    const response = await generateWithRetry(MODEL_ID, {
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    team: { type: Type.STRING, description: "The team the player finishes the season with. Update this if a trade occurs." },
                    teamRecord: { type: Type.STRING },
                    seed: { type: Type.INTEGER },
                    tradeRequestGranted: { type: Type.BOOLEAN, description: "True if the player was traded this season." },
                    gmSentiment: { type: Type.STRING },
                    teamChemistry: { type: Type.INTEGER, description: "0-100 scale" },
                    draftClass: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                position: { type: Type.STRING },
                                archetype: { type: Type.STRING },
                                potential: { type: Type.INTEGER },
                                height: { type: Type.STRING },
                                comparison: { type: Type.STRING }
                            }
                        }
                    },

                    // Stats
                    gamesPlayed: { type: Type.INTEGER },
                    minutes: { type: Type.NUMBER },
                    ppg: { type: Type.NUMBER },
                    rpg: { type: Type.NUMBER },
                    apg: { type: Type.NUMBER },
                    spg: { type: Type.NUMBER },
                    bpg: { type: Type.NUMBER },
                    fgPct: { type: Type.NUMBER },
                    threePtPct: { type: Type.NUMBER },
                    ftPct: { type: Type.NUMBER },
                    turnovers: { type: Type.NUMBER },
                    plusMinus: { type: Type.NUMBER },

                    // Advanced Stats
                    advanced: {
                        type: Type.OBJECT,
                        properties: {
                            per: { type: Type.NUMBER },
                            tsPct: { type: Type.NUMBER },
                            usgPct: { type: Type.NUMBER },
                            ortg: { type: Type.NUMBER },
                            drtg: { type: Type.NUMBER },
                            vorp: { type: Type.NUMBER },
                            winShares: { type: Type.NUMBER }
                        }
                    },

                    headCoach: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            offensiveSystem: { type: Type.STRING },
                            defensiveScheme: { type: Type.STRING },
                            quality: { type: Type.STRING, enum: ['Legendary', 'Elite', 'Average', 'Mediocre', 'Hot Seat'] },
                            attributes: {
                                type: Type.OBJECT,
                                properties: {
                                    offense: { type: Type.INTEGER },
                                    defense: { type: Type.INTEGER },
                                    playerDevelopment: { type: Type.INTEGER },
                                    gameManagement: { type: Type.INTEGER }
                                }
                            },
                            xp: { type: Type.INTEGER }
                        }
                    },

                    // Impact
                    onCourtImpact: { type: Type.STRING, description: "Detailed description of how the team performs with the player on the court." },
                    offCourtImpact: { type: Type.STRING, description: "Description of how the team struggles or performs when the player sits." },

                    // Condition
                    fatigue: { type: Type.INTEGER, description: "0-100" },
                    burnoutRisk: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Critical'] },
                    xpGained: { type: Type.INTEGER },

                    highlights: { type: Type.ARRAY, items: { type: Type.STRING } },

                    leagueContext: {
                        type: Type.OBJECT,
                        properties: {
                            headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
                            rivalryUpdate: { type: Type.STRING, description: "Specific details about player/team rivalries" },
                            leagueLeaders: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        category: { type: Type.STRING },
                                        player: { type: Type.STRING },
                                        value: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    },

                    teammates: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                position: { type: Type.STRING },
                                ppg: { type: Type.NUMBER },
                                rpg: { type: Type.NUMBER },
                                apg: { type: Type.NUMBER },
                                isStar: { type: Type.BOOLEAN },
                                archetype: { type: Type.STRING },
                                morale: { type: Type.STRING, enum: ['Happy', 'Content', 'Frustrated'] },
                                seasonGrowth: { type: Type.STRING, description: "e.g. +1.5 PPG" },
                                synergyGrade: { type: Type.STRING, enum: ['A+', 'A', 'B', 'C', 'D', 'F'] },
                                synergyNote: { type: Type.STRING, description: "Explanation of chemistry" }
                            }
                        }
                    },

                    standings: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                conference: { type: Type.STRING, enum: ['East', 'West'] },
                                teams: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING },
                                            wins: { type: Type.INTEGER },
                                            losses: { type: Type.INTEGER },
                                            seed: { type: Type.INTEGER },
                                            gb: { type: Type.NUMBER }
                                        }
                                    }
                                }
                            }
                        }
                    },

                    playoffStats: {
                        type: Type.OBJECT,
                        properties: {
                            roundReached: { type: Type.STRING },
                            seriesRecord: { type: Type.STRING },
                            ppg: { type: Type.NUMBER },
                            rpg: { type: Type.NUMBER },
                            apg: { type: Type.NUMBER },
                            bracket: {
                                type: Type.OBJECT,
                                properties: {
                                    champion: { type: Type.STRING },
                                    runnerUp: { type: Type.STRING },
                                    finalsMvp: { type: Type.STRING },
                                    conferenceFinalists: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    series: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                round: { type: Type.STRING },
                                                winner: { type: Type.STRING },
                                                loser: { type: Type.STRING },
                                                score: { type: Type.STRING }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },

                    // Deep Stats for Snapshot
                    ratingsSnapshot: {
                        type: Type.OBJECT,
                        properties: {
                            rating: { type: Type.INTEGER },
                            layup: { type: Type.INTEGER }, dunk: { type: Type.INTEGER }, closeShot: { type: Type.INTEGER },
                            midRange: { type: Type.INTEGER }, threePoint: { type: Type.INTEGER }, freeThrow: { type: Type.INTEGER },
                            passAccuracy: { type: Type.INTEGER }, ballHandle: { type: Type.INTEGER }, vision: { type: Type.INTEGER },
                            interiorDefense: { type: Type.INTEGER }, perimeterDefense: { type: Type.INTEGER }, steal: { type: Type.INTEGER }, block: { type: Type.INTEGER },
                            lateralQuickness: { type: Type.INTEGER }, helpDefense: { type: Type.INTEGER }, onBallDefense: { type: Type.INTEGER },
                            offRebound: { type: Type.INTEGER }, defRebound: { type: Type.INTEGER },
                            speed: { type: Type.INTEGER }, acceleration: { type: Type.INTEGER }, agility: { type: Type.INTEGER }, vertical: { type: Type.INTEGER }, strength: { type: Type.INTEGER }, stamina: { type: Type.INTEGER }, durability: { type: Type.INTEGER }, iq: { type: Type.INTEGER }
                        }
                    },

                    championship: { type: Type.BOOLEAN },
                    allStar: { type: Type.BOOLEAN },
                    awards: { type: Type.ARRAY, items: { type: Type.STRING } },
                    narrative: { type: Type.STRING }
                }
            }
        }
    });

    if (response?.text) {
        try {
            const repairedJson = jsonrepair(response.text);
            const data = JSON.parse(repairedJson);

            // Local calculate fallback for advanced stats
            if (!data.advanced) {
                data.advanced = { per: 15, tsPct: 55, usgPct: 20, ortg: 105, drtg: 105, vorp: 1.0, winShares: 2.0 };
            }

            const constructedData = {
                ...data,
                year: currentYear,
                age: age,
                badgesSnapshot: player.badges
            };

            if (!isSeasonStats(constructedData)) {
                console.warn("AI output missing some expected metrics. Proceeding with best fit.");
            }

            return constructedData;
        } catch (e) {
            console.error("JSON Parsing failed:", response.text);
            throw new Error("Simulation corrupted. AI returned invalid data structure.");
        }
    }

    throw new Error("Simulation failed for year " + currentYear);
};

export const getEraContext = async (year: number): Promise<EraContext> => {
    const prompt = `Provide a brief context for the NBA in the year ${year}. Era name, description, difficulty.JSON output.`;
    const response = await generateWithRetry(MODEL_ID, {
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    if (response?.text) return { ...JSON.parse(response.text), year };
    return { year, eraName: "Unknown", description: "N/A", difficultyModifier: 1 };
}