import React, { useState } from 'react';
import { CoachingStrategy } from '../types';
import { ClipboardList, Shield, Zap, Clock, UserCheck, Star, Info } from 'lucide-react';

interface Props {
  onConfirm: (strategy: CoachingStrategy) => void;
  isLoading: boolean;
}

const StrategyOption = ({ title, options, selected, onSelect, icon: Icon, tooltip }: any) => (
    <div className="bg-black/40 border border-slate-800 rounded-xl p-5 hover:border-blue-900/50 transition-colors relative group">
        <h3 className="text-blue-400 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2 cursor-help">
            <Icon size={16} /> {title} <Info size={12} className="text-slate-500" />
        </h3>
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 text-white text-xs p-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-normal normal-case">
            {tooltip}
        </div>
        <div className="grid grid-cols-1 gap-2">
            {options.map((opt: string) => (
                <button
                    key={opt}
                    onClick={() => onSelect(opt)}
                    className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        selected === opt 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                        : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

const getCoachQualityColor = (quality: string) => {
    switch(quality) {
        case 'Legendary': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        case 'Elite': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
        case 'Average': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        case 'Mediocre': return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
        default: return 'bg-red-500/20 text-red-400 border-red-500/50';
    }
}

export const CoachingPanel: React.FC<Props> = ({ onConfirm, isLoading }) => {
    const [offense, setOffense] = useState<CoachingStrategy['offensiveSystem']>('Seven Seconds or Less');
    const [defense, setDefense] = useState<CoachingStrategy['defensiveScheme']>('Switch Everything');
    const [usage, setUsage] = useState<CoachingStrategy['usageRate']>('Secondary Star');
    const [minutes, setMinutes] = useState(32);

    return (
        <div className="w-full max-w-5xl mx-auto p-6 animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">Tactical War Room</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">Define the system. Your coaching choices will directly impact statistical output, team success, and player development curves.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StrategyOption 
                    title="Offensive Philosophy" 
                    icon={Zap}
                    selected={offense} 
                    onSelect={setOffense} 
                    options={['Seven Seconds or Less', 'Triangle', 'Grit & Grind', 'Heliocentric', 'Motion']} 
                    tooltip="Dictates the team's primary method of scoring. E.g., Pace and Space focuses on 3PT shooting and fast breaks, while Triangle relies on post play and cuts."
                />
                <StrategyOption 
                    title="Defensive Scheme" 
                    icon={Shield}
                    selected={defense} 
                    onSelect={setDefense} 
                    options={['Switch Everything', 'Drop Coverage', 'Full Court Press', 'Zone']} 
                    tooltip="Determines how the team defends. E.g., Switch Everything requires versatile defenders, while Drop Coverage protects the paint but gives up mid-range shots."
                />
                 <StrategyOption 
                    title="Role & Usage" 
                    icon={UserCheck}
                    selected={usage} 
                    onSelect={setUsage} 
                    options={['Role Player', 'Secondary Star', 'The System']} 
                    tooltip="Defines how much of the offense runs through your player. Higher usage means more stats but faster fatigue and higher injury risk."
                />
            </div>

            {/* Coach Quality Indicator (Example for visualization during setup) */}
            <div className="mb-8 p-4 bg-slate-900 rounded-lg border border-slate-800 text-center">
                 <h3 className="text-slate-400 text-xs font-bold uppercase mb-4">System Proficiency Preview</h3>
                 <div className="flex justify-center gap-4">
                    {['Legendary', 'Elite', 'Average', 'Hot Seat'].map(q => (
                        <span key={q} className={`px-3 py-1 rounded text-xs font-bold uppercase border flex items-center gap-2 ${getCoachQualityColor(q)}`}>
                           <Star size={10} className={q === 'Legendary' ? 'fill-yellow-400' : ''} /> {q} Coach
                        </span>
                    ))}
                 </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-xl mb-8 flex items-center gap-6">
                <div className="bg-slate-950 p-3 rounded-lg text-yellow-500">
                    <Clock size={24} />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-300 uppercase tracking-wide mb-2">
                        Target Minutes Per Game: <span className="text-white text-lg font-mono ml-2">{minutes}</span>
                    </label>
                    <input 
                        type="range" 
                        min="15" 
                        max="48" 
                        step="1" 
                        value={minutes} 
                        onChange={(e) => setMinutes(parseInt(e.target.value))}
                        className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                        <span>Bench (15m)</span>
                        <span>Star (36m)</span>
                        <span>Ironman (48m)</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => onConfirm({ offensiveSystem: offense, defensiveScheme: defense, usageRate: usage, minutesPerGame: minutes })}
                disabled={isLoading}
                className="w-full py-5 bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold uppercase tracking-[0.2em] hover:from-blue-600 hover:to-blue-400 transition-all rounded shadow-lg shadow-blue-900/50 disabled:opacity-50"
            >
                {isLoading ? 'Simulating Career Arc...' : 'Execute Simulation'}
            </button>
        </div>
    );
};