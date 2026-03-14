import React, { useState } from 'react';
import { CareerSimulation, PlayerProfile } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ComposedChart, Bar } from 'recharts';
import { Trophy, Star, Crown, TrendingUp, Award, Calendar, Zap, Shield, ChevronDown, ChevronUp, PlayCircle, HeartHandshake, List, Activity, Box, HandMetal, Users, Info, Briefcase } from 'lucide-react';

interface Props {
    simulation: CareerSimulation;
    player: PlayerProfile;
    onReset: () => void;
}

const StatCard = React.memo(({ label, value, icon: Icon, color }: any) => (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center gap-4 hover:border-slate-500 transition-all shadow-lg">
        <div className={`p-3 rounded-lg bg-slate-900 ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-white font-mono">{value}</p>
        </div>
    </div>
));

const getLeaderIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('points') || cat.includes('ppg') || cat.includes('scoring')) return <Activity size={18} className="text-blue-400" />;
    if (cat.includes('rebound') || cat.includes('rpg')) return <Box size={18} className="text-green-400" />;
    if (cat.includes('assist') || cat.includes('apg')) return <Zap size={18} className="text-yellow-400" />;
    if (cat.includes('block') || cat.includes('bpg')) return <Shield size={18} className="text-red-400" />;
    if (cat.includes('steal') || cat.includes('spg')) return <HandMetal size={18} className="text-purple-400" />;
    return <Trophy size={18} className="text-slate-400" />;
};

const SeasonRow = React.memo(({ season }: { season: any }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr
                onClick={() => setExpanded(!expanded)}
                className="hover:bg-slate-800/50 transition-colors group cursor-pointer border-b border-slate-700 last:border-0"
            >
                <td className="p-4 font-mono text-slate-300 flex items-center gap-2">
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {season.year}
                </td>
                <td className="p-4 text-white font-medium">{season.team}</td>
                <td className="p-4">
                    <span className={`font-mono font-bold ${season.ratingsSnapshot?.rating >= 90 ? 'text-yellow-400' : 'text-slate-300'}`}>
                        {season.ratingsSnapshot?.rating || '-'}
                    </span>
                </td>
                <td className="p-4 text-white font-bold">{season.ppg}</td>
                <td className="p-4 text-slate-300">{season.rpg}</td>
                <td className="p-4 text-slate-300">{season.apg}</td>
                <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                        {season.championship && (
                            <span className="px-2 py-0.5 bg-yellow-900/40 text-yellow-400 text-[10px] font-bold uppercase rounded border border-yellow-700/50 flex items-center gap-1">
                                <Crown size={10} /> Champ
                            </span>
                        )}
                        {season.allStar && (
                            <span className="px-2 py-0.5 bg-blue-900/40 text-blue-400 text-[10px] font-bold uppercase rounded border border-blue-700/50">
                                All-Star
                            </span>
                        )}
                        {season.awards.map((award: string) => (
                            <span key={award} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold uppercase rounded border border-slate-700">
                                {award}
                            </span>
                        ))}
                    </div>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-slate-900/50 border-b border-slate-700">
                    <td colSpan={7} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-slate-400 font-bold uppercase text-xs mb-3">Season Narrative</h4>
                                <p className="text-slate-200 italic text-sm leading-relaxed">"{season.narrative}"</p>

                                {season.teamChemistry !== undefined && (
                                    <div className="mt-4 flex items-center gap-3">
                                        <h4 className="text-slate-400 font-bold uppercase text-xs flex items-center gap-1">
                                            <Users size={12} /> Team Chemistry
                                        </h4>
                                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${season.teamChemistry >= 80 ? 'bg-emerald-500' :
                                                    season.teamChemistry >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${season.teamChemistry}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono font-bold text-slate-300">{season.teamChemistry}%</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-slate-400 font-bold uppercase text-xs mb-3 flex items-center gap-2">
                                    <PlayCircle size={14} /> Key Highlights
                                </h4>
                                <ul className="space-y-2 mb-6">
                                    {season.highlights?.map((highlight: string, idx: number) => (
                                        <li key={idx} className="text-sm text-blue-300 font-mono">• {highlight}</li>
                                    ))}
                                    {!season.highlights?.length && <li className="text-slate-500 text-xs italic">No highlights recorded.</li>}
                                </ul>

                                {season.draftClass && season.draftClass.length > 0 && (
                                    <div>
                                        <h4 className="text-slate-400 font-bold uppercase text-xs mb-3 flex items-center gap-2">
                                            <Briefcase size={14} /> Notable Draft Prospects
                                        </h4>
                                        <div className="space-y-2">
                                            {season.draftClass.map((prospect: any, idx: number) => (
                                                <div key={idx} className="bg-slate-800/50 p-2 rounded border border-slate-700 flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{idx + 1}</span>
                                                        <span className="text-sm font-bold text-slate-200">{prospect.name}</span>
                                                        <span className="text-[10px] text-slate-400 uppercase">{prospect.position}</span>
                                                    </div>
                                                    <div className="text-[10px] font-mono text-yellow-500">POT: {prospect.potential}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
});

export const SimulationDashboard: React.FC<Props> = React.memo(({ simulation, player, onReset }) => {
    const careerPPG = (simulation.seasons.reduce((acc, s) => acc + s.ppg, 0) / simulation.seasons.length).toFixed(1);
    const totalPoints = simulation.seasons.reduce((acc, s) => acc + (s.ppg * s.gamesPlayed), 0).toLocaleString();
    const lastSeason = simulation.seasons[simulation.seasons.length - 1];
    const rookieSeason = simulation.seasons[0];
    const primeSeason = simulation.seasons.reduce((prev, current) => (prev.ppg > current.ppg) ? prev : current);

    // Comparison Data for Radar
    const comparisonData = [
        { subject: 'Points', Rookie: rookieSeason.ppg, Prime: primeSeason.ppg, Final: lastSeason.ppg, fullMark: 40 },
        { subject: 'Rebounds', Rookie: rookieSeason.rpg, Prime: primeSeason.rpg, Final: lastSeason.rpg, fullMark: 15 },
        { subject: 'Assists', Rookie: rookieSeason.apg, Prime: primeSeason.apg, Final: lastSeason.apg, fullMark: 12 },
        { subject: 'Steals', Rookie: rookieSeason.spg, Prime: primeSeason.spg, Final: lastSeason.spg, fullMark: 3 },
        { subject: 'Blocks', Rookie: rookieSeason.bpg, Prime: primeSeason.bpg, Final: lastSeason.bpg, fullMark: 3 },
        { subject: 'Efficiency', Rookie: rookieSeason.advanced.per, Prime: primeSeason.advanced.per, Final: lastSeason.advanced.per, fullMark: 35 },
    ];

    // Prepare data for progression chart
    const progressionData = simulation.seasons.map(s => ({
        year: s.year,
        Overall: s.ratingsSnapshot?.rating || 75,
        Athleticism: s.ratingsSnapshot?.speed || 70,
        IQ: s.ratingsSnapshot?.iq || 70,
        Scoring: (s.ratingsSnapshot?.threePoint + s.ratingsSnapshot?.midRange + s.ratingsSnapshot?.layup) / 3 || 70
    }));

    // Prepare data for development correlation
    const devData = simulation.seasons.map(s => ({
        year: s.year,
        PlayerRating: s.ratingsSnapshot?.rating || 75,
        CoachDev: s.headCoach?.attributes?.playerDevelopment || 50
    }));

    const getChemistryColor = (val: number) => {
        if (val >= 80) return 'bg-emerald-500';
        if (val >= 60) return 'bg-blue-500';
        if (val >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="fixed inset-0 bg-slate-950 overflow-y-auto z-50">
            <div className="w-full max-w-7xl mx-auto p-8 space-y-12 animate-fade-in pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded border border-blue-500/20">{player.position}</span>
                            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded border border-purple-500/20">{player.height}</span>
                            <span className="text-slate-400 text-xs uppercase tracking-widest font-mono">Draft Class {simulation.seasons[0]?.year}</span>
                        </div>
                        <h1 className="text-6xl font-black text-white display-font tracking-wide uppercase mb-2">{player.name}</h1>
                        <p className="text-slate-300 max-w-2xl text-lg leading-relaxed font-sans">{simulation.summary}</p>
                    </div>
                    <div className="text-right relative group">
                        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 font-mono leading-none mb-2">
                            {simulation.legacyScore}
                        </div>
                        <p className="text-yellow-500/80 text-xs uppercase tracking-[0.3em] font-bold flex items-center justify-end gap-1 cursor-help">
                            Legacy Score <Info size={12} />
                        </p>
                        <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 text-white text-xs p-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-left">
                            Legacy Score is calculated based on:
                            <ul className="list-disc pl-4 mt-1">
                                <li>Total Points (1 pt per 100)</li>
                                <li>Championships (500 pts each)</li>
                                <li>MVPs (300 pts each)</li>
                                <li>Other Awards & All-Star (50 pts each)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Trophy Case */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard label="Championships" value={simulation.accolades.titles} icon={Crown} color="text-yellow-400" />
                    <StatCard label="MVP Awards" value={simulation.accolades.mvps} icon={Trophy} color="text-yellow-400" />
                    <StatCard label="All-Star Selections" value={simulation.accolades.allStars} icon={Star} color="text-[#1D428A]" />
                    <StatCard label="Hall of Fame Odds" value={`${simulation.accolades.hallOfFameChance}%`} icon={Award} color="text-[#C9082A]" />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Main Career Stats */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                        <h3 className="text-white font-bold mb-8 flex items-center gap-3 uppercase tracking-wider text-sm">
                            <TrendingUp size={18} className="text-blue-500" /> Statistical Output
                        </h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={simulation.seasons}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="year" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Line type="monotone" dataKey="ppg" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} name="PPG" />
                                    <Line type="monotone" dataKey="rpg" stroke="#10b981" strokeWidth={2} dot={false} name="RPG" />
                                    <Line type="monotone" dataKey="apg" stroke="#f59e0b" strokeWidth={2} dot={false} name="APG" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Player Progression (Evolution) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                        <h3 className="text-white font-bold mb-8 flex items-center gap-3 uppercase tracking-wider text-sm">
                            <Zap size={18} className="text-purple-500" /> Player Evolution
                        </h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={progressionData}>
                                    <defs>
                                        <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="year" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis domain={[60, 99]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="Overall" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorOverall)" />
                                    <Line type="monotone" dataKey="Athleticism" stroke="#ec4899" strokeWidth={2} strokeDasharray="3 3" dot={false} opacity={0.5} />
                                    <Line type="monotone" dataKey="IQ" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={false} opacity={0.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Development Correlation Chart (New) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                        <h3 className="text-white font-bold mb-8 flex items-center gap-3 uppercase tracking-wider text-sm">
                            <Users size={18} className="text-yellow-500" /> Development Correlation
                        </h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={devData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="year" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis yAxisId="left" domain={[50, 100]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#f59e0b" tick={{ fill: '#f59e0b', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                                    <Area yAxisId="left" type="monotone" dataKey="PlayerRating" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.2} name="Player OVR" />
                                    <Line yAxisId="right" type="monotone" dataKey="CoachDev" stroke="#f59e0b" strokeWidth={3} name="Coach Dev" dot={false} />
                                    <Legend wrapperStyle={{ color: '#fff' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Career Arc Radar */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                        <h3 className="text-white font-bold mb-8 flex items-center gap-3 uppercase tracking-wider text-sm">
                            <Activity size={18} className="text-pink-500" /> Era Comparison (Rookie vs Prime vs Final)
                        </h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#475569" />
                                    <Radar name={`Rookie (${rookieSeason.year})`} dataKey="Rookie" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                                    <Radar name={`Prime (${primeSeason.year})`} dataKey="Prime" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                                    <Radar name={`Final (${lastSeason.year})`} dataKey="Final" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                                    <Legend wrapperStyle={{ color: '#fff' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Final Season Context */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Team Chemistry */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-3 uppercase tracking-wider text-sm">
                            <HeartHandshake size={18} className="text-emerald-400" /> Final Team Chemistry
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="relative w-24 h-24 flex-shrink-0">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#334155"
                                        strokeWidth="4"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke={lastSeason?.teamChemistry && lastSeason.teamChemistry > 70 ? '#10b981' : lastSeason?.teamChemistry && lastSeason.teamChemistry > 40 ? '#f59e0b' : '#ef4444'}
                                        strokeWidth="4"
                                        strokeDasharray={`${lastSeason?.teamChemistry || 0}, 100`}
                                        className="animate-[spin_1s_ease-out_reverse]"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                                    {lastSeason?.teamChemistry || '?'}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 leading-tight">
                                    The cohesion of your final roster. High chemistry indicates seamless playstyle integration.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* League Leaders (Final Season) */}
                    <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-3 uppercase tracking-wider text-sm">
                            <List size={18} className="text-yellow-400" /> Final Season League Leaders
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {lastSeason?.leagueContext?.leagueLeaders?.map((leader, i) => (
                                <div key={i} className="flex justify-between items-center bg-slate-800/50 p-3 rounded border border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-900 rounded-lg border border-slate-700">
                                            {getLeaderIcon(leader.category)}
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{leader.category}</div>
                                            <div className="font-bold text-slate-200">{leader.player}</div>
                                        </div>
                                    </div>
                                    <div className="text-xl font-black text-nba-blue">{leader.value}</div>
                                </div>
                            ))}
                            {!lastSeason?.leagueContext?.leagueLeaders && (
                                <div className="text-slate-500 italic text-sm">League data archived.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Season by Season Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                        <h3 className="text-white font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                            <Calendar size={18} className="text-slate-400" /> Complete Career Log
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Year</th>
                                    <th className="p-4 font-semibold">Team</th>
                                    <th className="p-4 font-semibold">OVR</th>
                                    <th className="p-4 font-semibold text-blue-400">PPG</th>
                                    <th className="p-4 font-semibold">RPG</th>
                                    <th className="p-4 font-semibold">APG</th>
                                    <th className="p-4 font-semibold">Awards & Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-sm">
                                {simulation.seasons.map((season) => (
                                    <SeasonRow key={season.year} season={season} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-center pt-8">
                    <button
                        onClick={onReset}
                        className="px-10 py-5 bg-[#C9082A] text-white display-font text-xl font-black uppercase tracking-widest hover:bg-[#a00622] transition-all rounded shadow-lg transform hover:-translate-y-1"
                    >
                        Start New Career
                    </button>
                </div>
            </div>
        </div>
    );
});