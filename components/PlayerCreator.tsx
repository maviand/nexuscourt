import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, PlayerStats, Badge, NBA_TEAMS, TrainingFocus } from '../types';
import { Activity, Shield, Zap, Target, Brain, Box, Award, ChevronRight, Lock, Unlock, Info, User, HelpCircle, Download, Upload, Bold, Italic, Crosshair, TrendingUp, RefreshCw, HandMetal, Briefcase, Settings, AlertTriangle, Flame, Check, Eye, PenTool, List, Coins, Dumbbell } from 'lucide-react';

interface Props {
  onComplete: (player: PlayerProfile) => void;
}

const CATEGORIES = {
    Finishing: ['layup', 'dunk', 'closeShot'],
    Shooting: ['midRange', 'threePoint', 'freeThrow'],
    Playmaking: ['passAccuracy', 'ballHandle', 'vision'],
    Defense: ['interiorDefense', 'perimeterDefense', 'onBallDefense', 'helpDefense', 'lateralQuickness', 'steal', 'block'],
    Rebounding: ['offRebound', 'defRebound'],
    Physicals: ['speed', 'acceleration', 'agility', 'vertical', 'strength', 'stamina', 'durability', 'iq']
};

const STAT_DESCRIPTIONS: Record<string, string> = {
    layup: "Determines success rate of layups in heavy traffic. Higher values unlock Euro steps, floater packages, and acrobatic finishes, reducing block chances.",
    dunk: "Controls frequency of dunk attempts and posterizer success. High ratings allow you to finish through contact and unlock elite dunk packages.",
    closeShot: "Accuracy for standing shots within 10 feet. Critical for post hooks, up-and-unders, and putbacks after offensive rebounds.",
    midRange: "Shot accuracy between the paint and 3PT line. Essential for punishing drop coverage and creating offense in the half-court.",
    threePoint: "Success rate from deep range. High ratings expand your gravity, forcing defenders to press up and opening driving lanes.",
    freeThrow: "Accuracy from the stripe. Vital for closers who draw contact late in games.",
    passAccuracy: "Reduces turnovers on difficult throws (e.g., cross-court skips). Increases pass velocity, giving shooters more time.",
    ballHandle: "Unlocks advanced dribble moves (crossovers, behind-the-back). High ratings prevent strips when pressured by elite defenders.",
    vision: "Ability to spot open teammates early. Improves the logic of lead passes and alley-oops.",
    interiorDefense: "Shot contest effectiveness near the rim. Reduces opponent FG% on layups and post moves.",
    perimeterDefense: "Shot contest effectiveness on jump shots. Reduces opponent shooting percentages and success of ankle breakers.",
    onBallDefense: "Lateral movement speed when locked onto a ball handler. Key to preventing blow-bys and maintaining defensive stance.",
    helpDefense: "Speed of defensive rotations and off-ball awareness. Critical for intercepting passing lanes and weak-side blocks.",
    lateralQuickness: "Raw defensive slide speed. Directly counters the speed of opposing ball handlers.",
    steal: "Success rate when swiping for the ball or playing passing lanes. High ratings unlock 'pluck' animations.",
    block: "Ability to swat shots. Affects vertical contest success and chase-down block frequency.",
    offRebound: "Ability to secure missed shots on offense. High ratings improve 'worm' ability to navigate box outs.",
    defRebound: "Ability to box out and secure defensive boards to end possessions.",
    speed: "Top sprinting speed in the open court. Dictates transition effectiveness on both ends.",
    acceleration: "Burst speed from a standstill. Key for first-step blow-bys and recovering on defense.",
    agility: "Speed of changing direction. Affects fluidity of dribble moves and defensive slides.",
    vertical: "Max jump height. Affects rebounding peak, block radius, and available dunk packages.",
    strength: "Ability to back down defenders, hold position in the post, and fight through screens.",
    stamina: "Energy tank. Low stamina severely penalizes all attributes in the 4th quarter.",
    durability: "Resistance to injuries. High ratings prevent season-ending injuries and extend career longevity.",
    iq: "Overall awareness. Reduces unforced errors, improves defensive positioning, and offensive spacing."
};

const ARCHETYPES: Record<string, Partial<PlayerStats>> = {
    'Point God': {
        passAccuracy: 92, ballHandle: 90, vision: 94, iq: 90,
        speed: 85, midRange: 80, threePoint: 78, layup: 80
    },
    'Sharpshooter': {
        threePoint: 95, midRange: 90, freeThrow: 90, 
        helpDefense: 70, iq: 80, stamina: 85
    },
    'Slasher': {
        dunk: 95, layup: 90, vertical: 92, speed: 88, acceleration: 88,
        strength: 70, closeShot: 85
    },
    'Lockdown Defender': {
        perimeterDefense: 92, onBallDefense: 94, lateralQuickness: 92, steal: 88,
        strength: 80, stamina: 90, helpDefense: 85
    },
    'Rebound King': {
        offRebound: 92, defRebound: 94, strength: 90,
        interiorDefense: 85, block: 80, vertical: 75
    },
    'Two-Way Star': {
        threePoint: 82, midRange: 80, perimeterDefense: 85, onBallDefense: 85,
        speed: 82, stamina: 85, dunk: 80
    }
};

const ARCHETYPE_ICONS: Record<string, any> = {
    'Point God': Brain,
    'Sharpshooter': Crosshair,
    'Slasher': TrendingUp,
    'Lockdown Defender': Shield,
    'Rebound King': Box,
    'Two-Way Star': RefreshCw,
    'Custom': User
};

const AVAILABLE_BADGES: Badge[] = [
    { name: 'Posterizer', tier: 'Bronze', description: 'Increases likelihood of dunking on defenders.', category: 'Finishing' },
    { name: 'Catch & Shoot', tier: 'Bronze', description: 'Boosts 3PT % immediately after catch.', category: 'Shooting' },
    { name: 'Clamps', tier: 'Bronze', description: 'Improves perimeter defense stays.', category: 'Defense' },
    { name: 'Dimer', tier: 'Bronze', description: 'Boosts shot % for open teammates.', category: 'Playmaking' },
    { name: 'Rim Protector', tier: 'Bronze', description: 'Improves block ability.', category: 'Defense' },
    { name: 'Ankle Breaker', tier: 'Bronze', description: 'Freezes defenders with dribble moves.', category: 'Playmaking' },
    { name: 'Deadeye', tier: 'Bronze', description: 'Reduces impact of defensive contests.', category: 'Shooting' },
    { name: 'Intimidator', tier: 'Bronze', description: 'Causes opponents to miss shots near you.', category: 'Defense' }
];

const MIN_STAT = 25;
const MAX_STAT = 99;
const STARTING_BUDGET = 1350;

const BadgeTooltip = ({ badge }: { badge: Badge }) => {
    let headerColor = 'bg-slate-700';
    let iconColor = 'text-slate-300';
    
    switch (badge.category) {
        case 'Finishing': headerColor = 'bg-blue-900'; iconColor = 'text-blue-300'; break;
        case 'Shooting': headerColor = 'bg-green-900'; iconColor = 'text-green-300'; break;
        case 'Playmaking': headerColor = 'bg-yellow-900'; iconColor = 'text-yellow-300'; break;
        case 'Defense': headerColor = 'bg-red-900'; iconColor = 'text-red-300'; break;
    }

    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-slate-600 text-left overflow-hidden">
            <div className={`${headerColor} p-3 border-b border-slate-600 flex justify-between items-center`}>
                <div className={`font-bold ${iconColor} uppercase flex items-center gap-1.5 text-[10px] tracking-wider`}>
                    {badge.category === 'Finishing' && <Flame size={12} />}
                    {badge.category === 'Shooting' && <Target size={12} />}
                    {badge.category === 'Playmaking' && <Zap size={12} />}
                    {badge.category === 'Defense' && <Shield size={12} />}
                    {badge.category}
                </div>
                <span className="text-[10px] font-bold text-white border border-white/30 px-2 py-0.5 rounded shadow-sm backdrop-blur-sm">
                    {badge.tier}
                </span>
            </div>
            <div className="p-4 bg-slate-900">
                <div className="font-bold mb-2 text-sm text-white">{badge.name}</div>
                <div className="text-slate-300 text-xs leading-relaxed font-medium">{badge.description}</div>
            </div>
        </div>
    );
};

const StatTooltip = ({ statKey, value }: { statKey: string, value: number }) => {
    let tier = 'Low';
    let colorClass = 'text-slate-400';
    let barColor = 'bg-slate-400';
    
    if (value >= 90) { tier = 'Elite'; colorClass = 'text-blue-400'; barColor = 'bg-blue-500'; }
    else if (value >= 80) { tier = 'High'; colorClass = 'text-emerald-400'; barColor = 'bg-emerald-500'; }
    else if (value >= 70) { tier = 'Average'; colorClass = 'text-amber-400'; barColor = 'bg-amber-500'; }
    else if (value >= 50) { tier = 'Solid'; colorClass = 'text-orange-400'; barColor = 'bg-orange-500'; }

    return (
        <div className="absolute bottom-full left-0 mb-3 w-72 bg-slate-900 text-white rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-slate-700 text-left overflow-hidden ring-1 ring-white/10">
            <div className="bg-black/40 p-3 border-b border-slate-700 flex justify-between items-center">
                 <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400">Attribute Impact</span>
                 <span className={`font-black uppercase text-xs ${colorClass}`}>{tier} ({value})</span>
            </div>
            <div className="p-4 space-y-4">
                <p className="text-slate-300 text-xs leading-relaxed font-medium">
                    <span className="font-bold text-slate-500 block mb-1 uppercase text-[10px]">In-Game Effect:</span>
                    {STAT_DESCRIPTIONS[statKey]}
                </p>
                <div>
                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-1">
                        <span>Potency</span>
                        <span>{value}/99</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                        <div className={`h-full ${barColor} transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.3)]`} style={{ width: `${(value/99)*100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatSlider = ({ label, statKey, value, onChange, disabled, remainingBudget }: any) => {
    let tier = 'Raw';
    let colorClass = 'bg-slate-500 text-white';
    let textClass = 'text-slate-600';
    
    if (value >= 90) { tier = 'Elite'; colorClass = 'bg-nba-blue text-white'; textClass = 'text-nba-blue'; }
    else if (value >= 80) { tier = 'High'; colorClass = 'bg-emerald-600 text-white'; textClass = 'text-emerald-700'; }
    else if (value >= 70) { tier = 'Average'; colorClass = 'bg-amber-500 text-white'; textClass = 'text-amber-600'; }
    else if (value >= 60) { tier = 'Solid'; colorClass = 'bg-orange-500 text-white'; textClass = 'text-orange-600'; }

    return (
        <div className="mb-4 bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-400 transition-all shadow-sm group relative">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 relative">
                    <span className="text-xs font-bold uppercase text-slate-700 tracking-wide cursor-help border-b border-dotted border-slate-400 group-hover:border-nba-blue transition-colors">
                        {label}
                    </span>
                    <StatTooltip statKey={statKey} value={value} />
                    
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-sm ${colorClass}`}>
                        {tier}
                    </span>
                </div>
                <span className={`font-mono font-bold text-sm ${textClass}`}>
                    {value}
                </span>
            </div>
            
            <div className="flex items-center gap-3 mb-2 relative">
                <input 
                    type="range"
                    min={25}
                    max={Math.min(99, value + remainingBudget)}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-nba-blue hover:accent-blue-700 transition-colors"
                />
            </div>
            
            <p className="text-[10px] text-slate-600 font-medium leading-tight">
                {STAT_DESCRIPTIONS[statKey].split('.')[0]}.
            </p>
        </div>
    );
};

// Helper for icon rendering
const CheckCircle = ({ size }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export const PlayerCreator: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('New Prospect');
  const [position, setPosition] = useState<PlayerProfile['position']>('PG');
  const [height, setHeight] = useState("6'3");
  const [weight, setWeight] = useState("195 lbs");
  const [bio, setBio] = useState('');
  const [potential, setPotential] = useState(85);
  const [trainingFocus, setTrainingFocus] = useState<TrainingFocus>('Balanced');
  const [activeCategory, setActiveCategory] = useState('Finishing');
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [archetype, setArchetype] = useState('Custom');
  
  // New States
  const [injuriesEnabled, setInjuriesEnabled] = useState(true);
  const [tradeRequested, setTradeRequested] = useState(false);
  const [tradeTarget, setTradeTarget] = useState(NBA_TEAMS[0]);
  const [editMode, setEditMode] = useState<'write' | 'preview'>('write');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  
  // Initialize all stats to base minimum
  const [stats, setStats] = useState<PlayerStats>({
    rating: 60,
    layup: 60, dunk: 50, closeShot: 60,
    midRange: 60, threePoint: 60, freeThrow: 60,
    passAccuracy: 60, ballHandle: 60, vision: 60,
    interiorDefense: 40, perimeterDefense: 60, steal: 50, block: 40,
    lateralQuickness: 60, helpDefense: 50, onBallDefense: 60,
    offRebound: 30, defRebound: 40,
    speed: 70, acceleration: 70, agility: 70, vertical: 60, strength: 50, stamina: 70, durability: 80, iq: 60
  });

  const [spentPoints, setSpentPoints] = useState(0);

  // Recalculate spent points and overall rating
  useEffect(() => {
    const values = Object.entries(stats)
        .filter(([k]) => k !== 'rating')
        .map(([_, v]) => v as number);
    
    // Calculate spent points based on deviation from MIN_STAT
    const totalStats = values.reduce((a, b) => a + b, 0);
    const baseTotal = values.length * MIN_STAT;
    // Current Cost Calculation: 1 point per stat point
    const currentSpent = totalStats - baseTotal;
    setSpentPoints(currentSpent);

    // Calculate OVR
    const avg = Math.floor(totalStats / values.length);
    setStats(prev => ({ ...prev, rating: Math.min(99, avg + 5) })); // Slight boost for "2K inflation"
  }, [JSON.stringify(stats)]);

  const applyArchetype = (archName: string) => {
      setArchetype(archName);
      if (archName === 'Custom') return;

      const template = ARCHETYPES[archName];
      if (template) {
          setStats(prev => ({
              ...prev,
              ...template
          }));
      }
  };

  const updateStat = (key: keyof PlayerStats, val: number) => {
    if (val < MIN_STAT || val > MAX_STAT) return;
    
    // Calculate cost delta
    const currentVal = stats[key];
    const diff = val - currentVal;
    
    if (spentPoints + diff > STARTING_BUDGET) return;

    setStats(prev => ({ ...prev, [key]: val }));
    setArchetype('Custom'); // Revert to custom if manually tweaking
  };

  const toggleBadge = (badgeName: string) => {
      if (selectedBadges.includes(badgeName)) {
          setSelectedBadges(prev => prev.filter(b => b !== badgeName));
      } else {
          if (selectedBadges.length < 3) {
              setSelectedBadges(prev => [...prev, badgeName]);
          }
      }
  };

  const handleExport = () => {
    const buildData = {
        name, position, height, weight, bio, potential, stats, selectedBadges, archetype
    };
    const blob = new Blob([JSON.stringify(buildData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}_Build.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target?.result as string);
            if (data.stats) setStats(data.stats);
            if (data.name) setName(data.name);
            if (data.position) setPosition(data.position);
            if (data.height) setHeight(data.height);
            if (data.weight) setWeight(data.weight);
            if (data.bio) setBio(data.bio);
            if (data.potential) setPotential(data.potential);
            if (data.selectedBadges) setSelectedBadges(data.selectedBadges);
            if (data.archetype) setArchetype(data.archetype);
        } catch (err) {
            alert('Invalid build file.');
        }
    };
    reader.readAsText(file);
  };

  const insertFormatting = (prefix: string, suffix: string) => {
    const textarea = bioRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + selection + suffix + after;
    setBio(newText);
    
    // Restore focus and set selection to reflect changes or wrap
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const parseMarkdown = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*)$/gm, '<li>$1</li>')
        .replace(/\n/g, '<br/>');
  };

  const remainingPoints = STARTING_BUDGET - spentPoints;
  const progressPercent = (spentPoints / STARTING_BUDGET) * 100;
  
  const SelectedArchetypeIcon = ARCHETYPE_ICONS[archetype] || User;

    const [nameError, setNameError] = useState<string | null>(null);

    const validateName = (val: string) => {
        if (!val.trim()) return "Name cannot be empty";
        if (val.length < 2) return "Name must be at least 2 characters";
        if (val.length > 30) return "Name must be under 30 characters";
        return null;
    };

    const handleNameChange = (val: string) => {
        setName(val);
        if (nameError) setNameError(validateName(val));
    };

    const handleFinalize = () => {
        const error = validateName(name);
        if (error) {
            setNameError(error);
            return;
        }

        const finalBadges = AVAILABLE_BADGES.filter(b => selectedBadges.includes(b.name));
        onComplete({ 
            name, position, height, weight, stats, badges: finalBadges, archetype, bio, potential,
            draftTradeRequest: tradeRequested ? tradeTarget : undefined,
            injuriesEnabled,
            trainingFocus,
            careerStats: {
                totalPoints: 0,
                totalRebounds: 0,
                totalAssists: 0,
                championships: 0,
                mvps: 0
            }
        });
    };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 animate-fade-in bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200">
        <header className="flex flex-col md:flex-row justify-between items-center border-b border-slate-200 pb-6 mb-6 gap-6">
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-nba-blue mb-1">MyPLAYER Builder</h1>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Construct your archetype</p>
            </div>
            
            <div className="flex gap-3">
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImport} 
                    className="hidden" 
                    accept=".json"
                 />
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                 >
                    <Upload size={14} /> Import
                 </button>
                 <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                 >
                    <Download size={14} /> Export
                 </button>
            </div>

            <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                 <div className="text-center px-4">
                     <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1 justify-center">
                        <Coins size={10} /> Points Spent
                    </div>
                     <div className="text-2xl font-mono font-bold text-slate-700">
                        {spentPoints}
                     </div>
                 </div>
                 <div className="w-px h-10 bg-slate-300"></div>
                 <div className="text-center px-4">
                     <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Available</div>
                     <div className={`text-3xl font-mono font-bold ${remainingPoints < 50 ? 'text-nba-red' : 'text-nba-blue'}`}>
                        {remainingPoints}
                     </div>
                 </div>
                 <div className="w-px h-10 bg-slate-300"></div>
                 <div className="text-center px-4">
                     <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">OVR Rating</div>
                     <div className="text-4xl font-black text-slate-900 leading-none">{stats.rating}</div>
                 </div>
            </div>
        </header>

        {/* Attribute Cap Progress Bar */}
        <div className="mb-8 px-2">
            <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                <span>Attribute Cap Usage</span>
                <span>{Math.round(progressPercent)}% Cap Reached</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div 
                    className={`h-full transition-all duration-300 ${remainingPoints === 0 ? 'bg-nba-red' : 'bg-gradient-to-r from-nba-blue to-blue-400'}`} 
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Vitals */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Archetype Selector */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl text-white shadow-lg relative overflow-hidden transition-all duration-500">
                <div className="absolute -right-6 -bottom-6 opacity-10 transform rotate-12 transition-transform duration-700 hover:rotate-45 hover:scale-110">
                    <SelectedArchetypeIcon size={160} className="text-white" />
                </div>
                <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Selected Archetype</div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 drop-shadow-md text-white">{archetype}</h2>
                    <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-800 inline-block mb-6 shadow-md transition-all hover:bg-slate-800">
                         <SelectedArchetypeIcon size={48} className="text-blue-400" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 relative z-10">
                    {Object.keys(ARCHETYPES).map(arch => {
                        const Icon = ARCHETYPE_ICONS[arch] || User;
                        const isSelected = archetype === arch;
                        return (
                            <button
                                key={arch}
                                onClick={() => applyArchetype(arch)}
                                className={`p-2 text-[9px] font-bold uppercase border rounded transition-all flex flex-col items-center gap-2 relative overflow-hidden ${
                                    isSelected
                                    ? 'bg-blue-900 text-white border-blue-500 shadow-lg shadow-blue-900/50 scale-105 z-10' 
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600'
                                }`}
                            >
                                <Icon size={18} className={isSelected ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                                <span className="text-center leading-tight">{arch}</span>
                                {isSelected && <div className="absolute top-0 right-0 w-2 h-2 bg-blue-400 rounded-full m-1 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-nba-blue font-bold uppercase mb-4 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Activity size={16} /> Vitals & Settings
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase">Full Name</label>
                            
                            {/* Trade Request Toggle */}
                            <button 
                                onClick={() => setTradeRequested(!tradeRequested)}
                                className={`text-[10px] font-bold uppercase flex items-center gap-1 ${tradeRequested ? 'text-nba-red' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Briefcase size={10} /> {tradeRequested ? 'Cancel Request' : 'Request Trade'}
                            </button>
                        </div>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => handleNameChange(e.target.value)} 
                            className={`w-full bg-slate-50 border rounded p-2 text-sm outline-none transition-all text-slate-900 font-medium ${nameError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-nba-blue focus:ring-1 focus:ring-nba-blue'}`} 
                        />
                        {nameError && <p className="text-red-500 text-[10px] font-bold mt-1">{nameError}</p>}
                        
                        {tradeRequested && (
                            <div className="mt-2 animate-fade-in bg-slate-50 p-2 rounded border border-slate-200">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Team</label>
                                <select 
                                    value={tradeTarget} 
                                    onChange={(e) => setTradeTarget(e.target.value)}
                                    className="w-full p-1 border border-slate-300 rounded text-xs bg-white text-slate-800"
                                >
                                    {NBA_TEAMS.map(team => (
                                        <option key={team} value={team}>{team}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Injury Toggle */}
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <AlertTriangle size={12} /> Injuries
                        </span>
                        <button 
                            onClick={() => setInjuriesEnabled(!injuriesEnabled)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${injuriesEnabled ? 'bg-nba-red' : 'bg-slate-300'}`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${injuriesEnabled ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pos</label>
                            <select value={position} onChange={(e) => setPosition(e.target.value as any)} className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm outline-none text-slate-900 font-medium">
                                {['PG', 'SG', 'SF', 'PF', 'C'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hgt</label>
                            <input type="text" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm outline-none text-slate-900 font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Wgt</label>
                            <input type="text" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm outline-none text-slate-900 font-medium" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Potential Ceiling</label>
                        <input type="range" min="70" max="99" value={potential} onChange={(e) => setPotential(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#c8102e]" />
                         <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Role Player (70)</span>
                            <span>GOAT (99)</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rookie Training Focus</label>
                        <div className="relative">
                            <select 
                                value={trainingFocus} 
                                onChange={(e) => setTrainingFocus(e.target.value as TrainingFocus)}
                                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm outline-none text-slate-900 font-medium appearance-none"
                            >
                                {['Balanced', 'Shooting', 'Finishing', 'Playmaking', 'Defense', 'Physicals'].map(f => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                            <div className="absolute right-2 top-2.5 pointer-events-none text-slate-500">
                                <Dumbbell size={14} />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 italic">
                            Determines which attributes grow fastest during your rookie season.
                        </p>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase">Backstory</label>
                            <div className="flex bg-slate-100 rounded-lg p-0.5">
                                <button 
                                    onClick={() => setEditMode('write')} 
                                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${editMode === 'write' ? 'bg-white shadow text-nba-blue' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Write
                                </button>
                                <button 
                                    onClick={() => setEditMode('preview')} 
                                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${editMode === 'preview' ? 'bg-white shadow text-nba-blue' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Preview
                                </button>
                            </div>
                        </div>

                        {editMode === 'write' ? (
                            <div className="relative group">
                                <div className="absolute top-2 right-2 flex gap-1 bg-white/80 backdrop-blur-sm p-1 rounded border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => insertFormatting('**', '**')} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Bold"><Bold size={12} /></button>
                                    <button onClick={() => insertFormatting('*', '*')} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Italic"><Italic size={12} /></button>
                                    <button onClick={() => insertFormatting('- ', '')} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="List Item"><List size={12} /></button>
                                </div>
                                <textarea 
                                    ref={bioRef}
                                    value={bio} 
                                    onChange={e => setBio(e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm h-32 resize-none outline-none font-medium text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-nba-blue transition-all" 
                                    placeholder="Draft your legacy... Support for **bold**, *italics*, and lists." 
                                />
                            </div>
                        ) : (
                            <div 
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm h-32 overflow-y-auto prose prose-sm text-slate-700 prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                                dangerouslySetInnerHTML={{__html: parseMarkdown(bio || '<span class="text-slate-400 italic">No backstory written yet.</span>')}} 
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                     <h3 className="text-nba-blue font-bold uppercase text-sm flex items-center gap-2">
                        <Award size={16} /> Badges
                    </h3>
                    <span className="text-xs font-bold text-slate-500">{selectedBadges.length} / 3 Selected</span>
                 </div>
                <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_BADGES.map(badge => (
                        <div key={badge.name} className="relative group">
                            <button
                                onClick={() => toggleBadge(badge.name)}
                                disabled={!selectedBadges.includes(badge.name) && selectedBadges.length >= 3}
                                className={`w-full p-2 rounded text-xs font-bold border transition-all text-left flex items-start gap-2 ${
                                    selectedBadges.includes(badge.name) 
                                    ? 'bg-nba-blue text-white border-nba-blue shadow-md' 
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-nba-blue hover:text-nba-blue'
                                } ${!selectedBadges.includes(badge.name) && selectedBadges.length >= 3 ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                <span className="mt-0.5">{selectedBadges.includes(badge.name) ? <CheckCircle size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-slate-400"></div>}</span>
                                {badge.name}
                            </button>
                            <BadgeTooltip badge={badge} />
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Detailed Stats */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
            <div className="flex border-b border-slate-200 overflow-x-auto">
                {Object.keys(CATEGORIES).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 flex-1 ${
                            activeCategory === cat 
                            ? 'text-nba-red border-nba-red bg-slate-50' 
                            : 'text-slate-500 border-transparent hover:text-nba-blue hover:bg-slate-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="bg-blue-50/50 p-2 border-b border-blue-100 text-center text-[10px] font-bold uppercase text-blue-600 tracking-widest">
                Cost: 1 Build Point per Attribute Level
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 flex-1 content-start">
                {(CATEGORIES as any)[activeCategory].map((statKey: string) => (
                    <StatSlider 
                        key={statKey}
                        statKey={statKey}
                        label={statKey.replace(/([A-Z])/g, ' $1').trim()} 
                        value={(stats as any)[statKey]} 
                        onChange={(v: number) => updateStat(statKey as any, v)}
                        disabled={remainingPoints <= 0}
                        remainingBudget={remainingPoints}
                    />
                ))}
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-between items-center">
                <div className="text-xs text-slate-500 max-w-md hidden md:block">
                    * Attributes are capped by the available point budget. Adjust attributes carefully to match your desired playstyle.
                </div>
                <button 
                    onClick={handleFinalize}
                    className="px-8 py-4 bg-nba-red text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-all rounded shadow-lg flex items-center gap-2 ml-auto"
                >
                    Finalize Build <ChevronRight size={20} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};