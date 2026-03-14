import React, { useState, useEffect } from "react";
import {
  SeasonStats,
  PlayerStats,
  TrainingFocus,
  Badge,
  BadgeTier,
  NBA_TEAMS,
  Coach,
  CoachingStrategy,
  PlayerProfile,
} from "../types";
import {
  Trophy,
  Crown,
  ArrowUp,
  ArrowDown,
  Activity,
  Calendar,
  Award,
  Users,
  Map,
  Briefcase,
  Zap,
  Star,
  Shield,
  PlayCircle,
  Flame,
  X,
  Check,
  TrendingUp,
  UserMinus,
  UserPlus,
  Dumbbell,
  Lock,
  Unlock,
  Newspaper,
  BarChart2,
  Hash,
  AlertTriangle,
  Battery,
  HeartHandshake,
  UserCheck,
  GitCommit,
  User,
  PenTool,
  Info,
  Target
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
  Area,
} from "recharts";
import Markdown from "react-markdown";

interface Props {
  season: SeasonStats;
  previousAttributes?: PlayerStats;
  previousSeasonStats?: SeasonStats;
  currentBadges: Badge[];
  xpAvailable: number;
  onAddXp?: (amount: number) => void;
  onContinue: (
    training: TrainingFocus,
    tradeReq: { requested: boolean; target: string },
    updatedBadges: Badge[],
    spentXp: number,
    newCoach?: Coach,
    updatedStats?: PlayerStats,
  ) => void;
  onRetire: () => void;
  isSimulating: boolean;
  player?: PlayerProfile;
  onUpdatePlayer?: (player: PlayerProfile) => void;
  history?: SeasonStats[];
}

const Tabs = React.memo(({
  active,
  onChange,
}: {
  active: string;
  onChange: (t: string) => void;
}) => (
  <div className="flex border-b border-slate-200 mb-6 bg-white sticky top-0 z-10 overflow-x-auto shadow-sm">
    {[
      "Overview",
      "Career",
      "Profile",
      "Stats",
      "Impact",
      "Growth",
      "Teammates",
      "Front Office",
      "Coaching",
      "Progression",
      "Draft",
      "Standings",
      "Playoffs",
    ].map((tab) => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${active === tab
          ? "text-[#1D428A] border-b-4 border-[#C9082A] bg-white shadow-sm"
          : "text-slate-600 hover:text-[#1D428A] hover:bg-slate-50"
          }`}
      >
        {tab}
      </button>
    ))}
  </div>
));

const UPGRADE_COSTS: Record<string, number> = {
  Bronze: 500,
  Silver: 1000,
  Gold: 2500,
  "Hall of Fame": 5000,
};

const ATTRIBUTE_COST = 500;
const FATIGUE_REDUCTION_COST = 500;
const BADGE_UNLOCK_COST = 3000;
const COACH_ATTRIBUTE_COST = 100; // Coach XP cost

const AVAILABLE_COACHES: Partial<Coach>[] = [
  {
    name: "Offensive Innovator",
    offensiveSystem: "Seven Seconds or Less",
    defensiveScheme: "Zone",
    quality: "Elite",
    attributes: {
      offense: 98,
      defense: 60,
      playerDevelopment: 85,
      gameManagement: 80,
    },
  },
  {
    name: "Defensive Guru",
    offensiveSystem: "Grit & Grind",
    defensiveScheme: "Drop Coverage",
    quality: "Elite",
    attributes: {
      offense: 75,
      defense: 98,
      playerDevelopment: 88,
      gameManagement: 85,
    },
  },
  {
    name: "Player Developer",
    offensiveSystem: "Motion",
    defensiveScheme: "Switch Everything",
    quality: "Average",
    attributes: {
      offense: 80,
      defense: 80,
      playerDevelopment: 95,
      gameManagement: 75,
    },
  },
  {
    name: "Tactical Mastermind",
    offensiveSystem: "Triangle",
    defensiveScheme: "Switch Everything",
    quality: "Legendary",
    attributes: {
      offense: 99,
      defense: 90,
      playerDevelopment: 95,
      gameManagement: 99,
    },
  },
  {
    name: "Modern Analytics Coach",
    offensiveSystem: "Pace and Space",
    defensiveScheme: "Switch Everything",
    quality: "Average",
    attributes: {
      offense: 85,
      defense: 80,
      playerDevelopment: 85,
      gameManagement: 85,
    },
  },
  {
    name: "Old School General",
    offensiveSystem: "Grit & Grind",
    defensiveScheme: "Full Court Press",
    quality: "Average",
    attributes: {
      offense: 70,
      defense: 85,
      playerDevelopment: 75,
      gameManagement: 75,
    },
  },
];

const UNLOCKABLE_BADGES: Record<
  string,
  { stat: keyof PlayerStats; threshold: number; badge: Badge }
> = {
  "Limitless Range": {
    stat: "threePoint",
    threshold: 90,
    badge: {
      name: "Limitless Range",
      category: "Shooting",
      description: "Extends effective shooting range well beyond the 3PT line.",
      tier: "Bronze",
    },
  },
  Posterizer: {
    stat: "dunk",
    threshold: 90,
    badge: {
      name: "Posterizer",
      category: "Finishing",
      description: "Increases likelihood of dunking on defenders.",
      tier: "Bronze",
    },
  },
  Glove: {
    stat: "steal",
    threshold: 90,
    badge: {
      name: "Glove",
      category: "Defense",
      description: "Increases steal success rate against ball handlers.",
      tier: "Bronze",
    },
  },
  "Rim Protector": {
    stat: "block",
    threshold: 90,
    badge: {
      name: "Rim Protector",
      category: "Defense",
      description: "Improves block ability and reduces foul calls.",
      tier: "Bronze",
    },
  },
  Dimer: {
    stat: "passAccuracy",
    threshold: 90,
    badge: {
      name: "Dimer",
      category: "Playmaking",
      description: "Boosts shot percentage for open teammates on passes.",
      tier: "Bronze",
    },
  },
  "Ankle Breaker": {
    stat: "ballHandle",
    threshold: 90,
    badge: {
      name: "Ankle Breaker",
      category: "Playmaking",
      description: "Freezes defenders with dribble moves.",
      tier: "Bronze",
    },
  },
  "Rebound Chaser": {
    stat: "defRebound",
    threshold: 90,
    badge: {
      name: "Rebound Chaser",
      category: "Defense",
      description: "Improves ability to track down rebounds.",
      tier: "Bronze",
    },
  },
};

const StatDifference = ({
  current,
  previous,
  inverse = false,
}: {
  current: number;
  previous?: number;
  inverse?: boolean;
}) => {
  if (previous === undefined) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.1) return null;

  const isPositive = diff > 0;
  const isGood = inverse ? !isPositive : isPositive;
  const color = isGood ? "text-emerald-600" : "text-red-600";

  return (
    <span className={`text-[10px] font-bold ${color} ml-2`}>
      {isPositive ? "+" : ""}
      {diff.toFixed(1)}
    </span>
  );
};

const StatTooltip = React.memo(({
  label,
  value,
  tooltip,
  previous,
}: {
  label: string;
  value: number | string;
  tooltip: string;
  previous?: number;
}) => (
  <div className="p-3 bg-slate-50 rounded border border-slate-100 group relative">
    <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-center gap-1 cursor-help">
      {label} <Info size={10} className="opacity-50" />
    </div>
    <div className="text-2xl font-mono font-bold text-slate-900 flex justify-center items-center">
      {value}
      {typeof value === "number" && (
        <StatDifference current={value} previous={previous} />
      )}
    </div>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 font-normal normal-case text-center">
      {tooltip}
    </div>
  </div>
));

export const SeasonSummary: React.FC<Props> = React.memo(({
  season,
  previousAttributes,
  previousSeasonStats,
  currentBadges,
  xpAvailable,
  onAddXp,
  onContinue,
  onRetire,
  isSimulating,
  player,
  onUpdatePlayer,
  history = [],
}) => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [trainingFocus, setTrainingFocus] = useState<TrainingFocus>("Balanced");
  const [tradeRequested, setTradeRequested] = useState(false);
  const [tradeTarget, setTradeTarget] = useState(NBA_TEAMS[0]);

  // Profile State
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState(player?.bio || "");

  const saveBio = () => {
    if (player && onUpdatePlayer) {
      onUpdatePlayer({ ...player, bio: editedBio });
    }
    setIsEditingBio(false);
  };

  // Coach State
  const [currentCoach, setCurrentCoach] = useState<Coach | undefined>(
    season.headCoach,
  );
  const [coachXp, setCoachXp] = useState(season.headCoach?.xp || 0);
  const [showCoachHire, setShowCoachHire] = useState(false);
  const [selectedCoachCandidate, setSelectedCoachCandidate] =
    useState<Partial<Coach> | null>(null);
  const [strategyModified, setStrategyModified] = useState(false);

  // Progression State
  const [localBadges, setLocalBadges] = useState<Badge[]>(
    JSON.parse(JSON.stringify(currentBadges)),
  );
  // Initialize stats from the latest snapshot
  const [localStats, setLocalStats] = useState<PlayerStats>(
    season.ratingsSnapshot,
  );
  const [localXp, setLocalXp] = useState(xpAvailable);

  // Update local XP when prop changes (accumulation fix)
  useEffect(() => {
    setLocalXp(xpAvailable);
  }, [xpAvailable]);

  // Also sync latest stats if season changes
  useEffect(() => {
    setLocalStats(season.ratingsSnapshot);
    setLocalBadges(currentBadges);
    if (season.headCoach) {
      setCurrentCoach(season.headCoach);
      setCoachXp(season.headCoach.xp || 0);
    }
  }, [season]);

  // Modal State
  const [badgeUpgradeCandidate, setBadgeUpgradeCandidate] = useState<{
    index: number;
    nextTier: BadgeTier;
    cost: number;
  } | null>(null);

  const getNextTier = (current: BadgeTier): BadgeTier | null => {
    if (current === "Bronze") return "Silver";
    if (current === "Silver") return "Gold";
    if (current === "Gold") return "Hall of Fame";
    return null;
  };

  const initiateUpgrade = (index: number) => {
    const badge = localBadges[index];
    const nextTier = getNextTier(badge.tier);
    if (!nextTier) return;

    const cost = UPGRADE_COSTS[nextTier];
    if (localXp >= cost) {
      setBadgeUpgradeCandidate({ index, nextTier, cost });
    }
  };

  const confirmUpgrade = () => {
    if (!badgeUpgradeCandidate) return;

    const { index, nextTier, cost } = badgeUpgradeCandidate;
    const updated = [...localBadges];
    updated[index].tier = nextTier;
    setLocalBadges(updated);
    setLocalXp((prev) => prev - cost);
    setBadgeUpgradeCandidate(null);
  };

  const hireCoach = () => {
    if (!selectedCoachCandidate) return;
    // Create a full coach object from template
    const newCoach: Coach = {
      name: selectedCoachCandidate.name!,
      offensiveSystem: selectedCoachCandidate.offensiveSystem!,
      defensiveScheme: selectedCoachCandidate.defensiveScheme!,
      quality: selectedCoachCandidate.quality!,
      attributes: selectedCoachCandidate.attributes || {
        offense: 50,
        defense: 50,
        playerDevelopment: 50,
        gameManagement: 50,
      },
      xp: 0,
      usageRate: "Secondary Star",
      minutesPerGame: 30,
    };
    setCurrentCoach(newCoach);
    setCoachXp(0);
    setSelectedCoachCandidate(null);
    setShowCoachHire(false);
  };

  const upgradeCoachAttribute = (attr: keyof Coach["attributes"]) => {
    if (
      coachXp >= COACH_ATTRIBUTE_COST &&
      currentCoach &&
      currentCoach.attributes[attr] < 99
    ) {
      setCurrentCoach((prev) => {
        if (!prev) return undefined;
        return {
          ...prev,
          attributes: {
            ...prev.attributes,
            [attr]: prev.attributes[attr] + 1,
          },
        };
      });
      setCoachXp((prev) => prev - COACH_ATTRIBUTE_COST);
    }
  };

  const updateStrategy = (key: keyof Coach, value: any) => {
    if (!currentCoach) return;
    setCurrentCoach((prev) => {
      if (!prev) return undefined;
      return { ...prev, [key]: value };
    });
    setStrategyModified(true);
  };

  const buyAttribute = (statKey: keyof PlayerStats) => {
    if (localXp >= ATTRIBUTE_COST && localStats[statKey] < 99) {
      setLocalStats((prev) => ({
        ...prev,
        [statKey]: prev[statKey] + 1,
      }));
      setLocalXp((prev) => prev - ATTRIBUTE_COST);
    }
  };

  const buyConditioning = () => {
    if (localXp >= FATIGUE_REDUCTION_COST) {
      // Visual only, actual logic handled next season by reducing accumulation
      setLocalXp((prev) => prev - FATIGUE_REDUCTION_COST);
    }
  };

  const unlockBadge = (key: string) => {
    if (localXp >= BADGE_UNLOCK_COST) {
      const badgeData = UNLOCKABLE_BADGES[key];
      setLocalBadges((prev) => [...prev, badgeData.badge]);
      setLocalXp((prev) => prev - BADGE_UNLOCK_COST);
    }
  };

  const getFatigueColor = (f: number) => {
    if (f < 30) return "text-emerald-600";
    if (f < 60) return "text-yellow-600";
    if (f < 80) return "text-orange-600";
    return "text-red-600";
  };

  const getFatigueImpact = (f: number) => {
    if (f > 80)
      return {
        label: "CRITICAL",
        penalty: "-15% Attributes",
        color: "bg-red-600 text-white",
      };
    if (f > 60)
      return {
        label: "HIGH",
        penalty: "-10% Attributes",
        color: "bg-orange-500 text-white",
      };
    if (f > 40)
      return {
        label: "MODERATE",
        penalty: "-5% Attributes",
        color: "bg-yellow-500 text-white",
      };
    return {
      label: "OPTIMAL",
      penalty: "None",
      color: "bg-emerald-500 text-white",
    };
  };

  // Calculate spent XP
  const spentXp = xpAvailable - localXp;

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in pb-20 relative text-slate-900">
      {/* Modal */}
      {badgeUpgradeCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-nba-blue p-6 text-white text-center">
              <Award size={48} className="mx-auto mb-3 opacity-90" />
              <h3 className="text-2xl font-black uppercase tracking-widest">
                Confirm Upgrade
              </h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-slate-500 font-bold uppercase text-xs mb-2">
                Upgrading Badge
              </p>
              <h4 className="text-xl font-bold text-slate-900 mb-6">
                {localBadges[badgeUpgradeCandidate.index].name}
              </h4>

              <div className="flex justify-center items-center gap-4 mb-8">
                <div className="text-center opacity-50">
                  <div className="text-[10px] uppercase font-bold text-slate-500">
                    Current
                  </div>
                  <div className="font-bold text-slate-700">
                    {localBadges[badgeUpgradeCandidate.index].tier}
                  </div>
                </div>
                <div className="text-nba-blue">
                  <ArrowUp size={24} />
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase font-bold text-nba-blue">
                    New Tier
                  </div>
                  <div className="font-black text-nba-blue text-lg">
                    {badgeUpgradeCandidate.nextTier}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded p-3 mb-6 flex justify-between items-center border border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase">
                  XP Cost
                </span>
                <span className="font-mono font-bold text-red-600">
                  -{badgeUpgradeCandidate.cost} XP
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setBadgeUpgradeCandidate(null)}
                  className="py-3 px-4 border border-slate-300 rounded font-bold text-slate-600 uppercase text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpgrade}
                  className="py-3 px-4 bg-nba-blue rounded font-bold text-white uppercase text-xs hover:bg-blue-800 shadow-lg flex justify-center items-center gap-2"
                >
                  Confirm <Check size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-8 flex flex-col md:flex-row justify-between items-center shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl font-black text-[#1D428A] display-font">
              {season.year}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold uppercase text-xs tracking-wider rounded">
              Season Complete
            </span>
          </div>
          <div className="text-xl text-slate-800 font-medium">
            {season.team} <span className="text-slate-300 mx-2">|</span>{" "}
            {season.teamRecord} <span className="text-slate-300 mx-2">|</span> #
            {season.seed} Seed
          </div>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          {season.championship && (
            <div className="flex flex-col items-center text-nba-blue">
              <Crown size={32} />
              <span className="text-[10px] font-bold uppercase mt-1">
                Champ
              </span>
            </div>
          )}
          {season.allStar && (
            <div className="flex flex-col items-center text-nba-red">
              <Activity size={32} />
              <span className="text-[10px] font-bold uppercase mt-1">
                All-Star
              </span>
            </div>
          )}
          {season.awards.includes("MVP") && (
            <div className="flex flex-col items-center text-yellow-600">
              <Trophy size={32} />
              <span className="text-[10px] font-bold uppercase mt-1">MVP</span>
            </div>
          )}
        </div>
      </div>

      <Tabs active={activeTab} onChange={setActiveTab} />

      <div className="p-6">
        {activeTab === "Profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 border border-slate-200 shadow-sm rounded-xl">
              <h3 className="text-nba-dark font-black uppercase display-font tracking-wide mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
                <User size={18} className="text-[#1D428A]" /> Player Bio
              </h3>
              {isEditingBio ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-[10px] text-slate-500 mb-2 uppercase font-bold">
                      Supports Markdown: **bold**, *italic*, - lists
                    </div>
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm h-32 resize-none outline-none font-medium text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-nba-blue transition-all"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 mb-2 uppercase font-bold">
                      Preview
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm min-h-[4rem] prose prose-sm max-w-none">
                      <Markdown>{editedBio || "*No bio entered.*"}</Markdown>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={saveBio}
                      className="px-4 py-2 bg-nba-blue text-white text-xs font-bold uppercase rounded hover:bg-blue-800"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-slate-700 text-sm leading-relaxed mb-4 prose prose-sm max-w-none">
                    <Markdown>{player?.bio || "No bio available."}</Markdown>
                  </div>
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold uppercase rounded hover:bg-slate-200 flex items-center gap-2"
                  >
                    <PenTool size={14} /> Edit Bio
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white p-6 border border-slate-200 shadow-sm rounded-xl">
              <h3 className="text-nba-dark font-black uppercase display-font tracking-wide mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
                <Award size={18} className="text-[#C9082A]" /> Career Legacy
              </h3>
              <div className="mb-6 relative group">
                <div className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1 cursor-help">
                  Legacy Score <Info size={12} />
                </div>
                <div className="text-4xl font-black text-nba-blue font-mono">
                  {player?.careerStats?.legacyScore || 0}
                </div>
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 text-white text-xs p-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Legacy Score is calculated based on:
                  <ul className="list-disc pl-4 mt-1">
                    <li>Total Points (1 pt per 100)</li>
                    <li>Championships (500 pts each)</li>
                    <li>MVPs (300 pts each)</li>
                    <li>Other Awards & All-Star (50 pts each)</li>
                  </ul>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-2">
                  Career Awards
                </div>
                <div className="flex flex-wrap gap-2">
                  {player?.careerStats?.awards?.map((award, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] font-bold uppercase rounded"
                    >
                      {award}
                    </span>
                  ))}
                  {(!player?.careerStats?.awards ||
                    player.careerStats.awards.length === 0) && (
                      <span className="text-slate-400 text-xs italic">
                        No awards yet.
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Career" && (
          <div className="space-y-8">
            <div className="bg-white p-6 border border-slate-200 shadow-sm rounded-xl">
              <h3 className="text-nba-dark font-black uppercase display-font tracking-wide mb-6 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
                <Trophy size={20} className="text-[#1D428A]" /> Career Achievements
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Points</div>
                  <div className="text-3xl font-black text-nba-blue font-mono">{player?.careerStats?.totalPoints?.toLocaleString() || 0}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Rebounds</div>
                  <div className="text-3xl font-black text-nba-blue font-mono">{player?.careerStats?.totalRebounds?.toLocaleString() || 0}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Assists</div>
                  <div className="text-3xl font-black text-nba-blue font-mono">{player?.careerStats?.totalAssists?.toLocaleString() || 0}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="text-slate-500 text-xs font-bold uppercase mb-1">Legacy Score</div>
                  <div className="text-3xl font-black text-nba-blue font-mono">{player?.careerStats?.legacyScore?.toLocaleString() || 0}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                    <Crown size={16} className="text-yellow-500" /> Championships ({player?.careerStats?.championships || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {player?.careerStats?.awards?.filter(a => a.includes('Champion')).map((award, i) => (
                      <span key={i} className="px-3 py-1.5 bg-yellow-100 text-yellow-800 border border-yellow-300 text-xs font-bold uppercase rounded-full shadow-sm">
                        {award}
                      </span>
                    ))}
                    {(!player?.careerStats?.awards || !player.careerStats.awards.some(a => a.includes('Champion'))) && (
                      <span className="text-slate-400 text-xs italic">No championships yet.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                    <Star size={16} className="text-nba-blue" /> MVP Awards ({player?.careerStats?.mvps || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {player?.careerStats?.awards?.filter(a => a.includes('MVP') && !a.includes('Finals')).map((award, i) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-50 text-nba-blue border border-blue-200 text-xs font-bold uppercase rounded-full shadow-sm">
                        {award}
                      </span>
                    ))}
                    {(!player?.careerStats?.awards || !player.careerStats.awards.some(a => a.includes('MVP') && !a.includes('Finals'))) && (
                      <span className="text-slate-400 text-xs italic">No MVP awards yet.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                  <Award size={16} className="text-emerald-600" /> Other Accolades
                </h4>
                <div className="flex flex-wrap gap-2">
                  {player?.careerStats?.awards?.filter(a => !a.includes('Champion') && !(a.includes('MVP') && !a.includes('Finals'))).map((award, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold uppercase rounded-full shadow-sm">
                      {award}
                    </span>
                  ))}
                  {(!player?.careerStats?.awards || player.careerStats.awards.filter(a => !a.includes('Champion') && !(a.includes('MVP') && !a.includes('Finals'))).length === 0) && (
                    <span className="text-slate-400 text-xs italic">No other accolades yet.</span>
                  )}
                </div>
              </div>
            </div>

            {history && history.length > 0 && (
              <div className="bg-white p-6 border border-slate-200 shadow-sm rounded-xl overflow-x-auto">
                <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <BarChart2 size={20} /> Year-by-Year Statistics
                </h3>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold">Year</th>
                      <th className="px-4 py-3 font-bold">Team</th>
                      <th className="px-4 py-3 font-bold">Age</th>
                      <th className="px-4 py-3 font-bold">OVR</th>
                      <th className="px-4 py-3 font-bold text-right">GP</th>
                      <th className="px-4 py-3 font-bold text-right">PPG</th>
                      <th className="px-4 py-3 font-bold text-right">RPG</th>
                      <th className="px-4 py-3 font-bold text-right">APG</th>
                      <th className="px-4 py-3 font-bold text-right">SPG</th>
                      <th className="px-4 py-3 font-bold text-right">BPG</th>
                      <th className="px-4 py-3 font-bold text-right">FG%</th>
                      <th className="px-4 py-3 font-bold text-right">3P%</th>
                      <th className="px-4 py-3 font-bold text-right">FT%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{h.year}</td>
                        <td className="px-4 py-3 text-slate-700">{h.team}</td>
                        <td className="px-4 py-3 text-slate-700">{h.age}</td>
                        <td className="px-4 py-3 font-bold text-nba-blue">{h.ratingsSnapshot?.rating || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{h.gamesPlayed}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{h.ppg?.toFixed(1) || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">{h.rpg?.toFixed(1) || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">{h.apg?.toFixed(1) || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{h.spg?.toFixed(1) || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{h.bpg?.toFixed(1) || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{h.fgPct ? (h.fgPct * 100).toFixed(1) : '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{h.threePtPct ? (h.threePtPct * 100).toFixed(1) : '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{h.ftPct ? (h.ftPct * 100).toFixed(1) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Trade History */}
            <div className="bg-white p-6 border border-slate-200 shadow-sm rounded-xl mt-8">
              <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Briefcase size={20} /> Trade & Transaction History
              </h3>
              {(() => {
                const trades = [];
                if (history && history.length > 0) {
                  let previousTeam = history[0].team;
                  for (let i = 1; i < history.length; i++) {
                    if (history[i].team !== previousTeam) {
                      trades.push({
                        year: history[i].year,
                        from: previousTeam,
                        to: history[i].team,
                        age: history[i].age
                      });
                      previousTeam = history[i].team;
                    }
                  }
                  // Also check if they were traded in the current season being viewed
                  if (season.team !== previousTeam) {
                    trades.push({
                      year: season.year,
                      from: previousTeam,
                      to: season.team,
                      age: season.age
                    });
                  }
                }

                if (trades.length === 0) {
                  return <div className="text-slate-500 italic text-sm">No trades in career.</div>;
                }

                return (
                  <div className="space-y-4">
                    {trades.map((trade, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex-shrink-0 w-16 text-center">
                          <div className="text-sm font-bold text-slate-900">{trade.year}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold">Age {trade.age}</div>
                        </div>
                        <div className="flex-1 flex items-center justify-between bg-white p-3 rounded border border-slate-100 shadow-sm">
                          <div className="flex-1 text-center font-bold text-slate-600">{trade.from}</div>
                          <div className="px-4 text-slate-300"><ArrowUp size={16} className="rotate-90" /></div>
                          <div className="flex-1 text-center font-bold text-nba-blue">{trade.to}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 border border-slate-200 shadow-sm rounded">
                <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Season Narrative
                </h3>
                <p className="text-slate-700 leading-relaxed text-lg italic">
                  "{season.narrative}"
                </p>
              </div>

              <div className="bg-white p-6 border border-slate-200 shadow-sm rounded">
                <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Users size={18} /> Team Chemistry
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black font-mono text-slate-800">
                    {season.teamChemistry}%
                  </div>
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${season.teamChemistry >= 80
                        ? "bg-emerald-500"
                        : season.teamChemistry >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                        }`}
                      style={{ width: `${season.teamChemistry}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 italic">
                  Chemistry is influenced by coaching style, player
                  personalities, and recent success. It directly impacts
                  on-court performance.
                </p>
              </div>

              {/* League Headlines */}
              <div className="bg-white p-6 border border-slate-200 shadow-sm rounded">
                <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Newspaper size={18} /> League Headlines
                </h3>
                <div className="space-y-3">
                  {season.leagueContext?.headlines?.map((headline, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-start border-b border-slate-50 last:border-0 pb-2"
                    >
                      <span className="text-slate-400 font-bold text-xs mt-1">
                        NEWS
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        {headline}
                      </span>
                    </div>
                  ))}
                  {!season.leagueContext?.headlines && (
                    <div className="text-slate-400 text-sm">
                      No major headlines available.
                    </div>
                  )}
                </div>
              </div>

              {/* Highlights Section */}
              <div className="bg-white p-6 border border-slate-200 shadow-sm rounded">
                <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <PlayCircle size={18} /> Highlight Reel
                </h3>
                <ul className="space-y-3">
                  {season.highlights?.map((highlight, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-slate-700 text-sm border-b border-slate-50 pb-2 last:border-0"
                    >
                      <span className="text-nba-red font-bold font-mono">
                        0{idx + 1}
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                  {!season.highlights?.length && (
                    <li className="text-slate-400 text-sm italic">
                      No major highlights generated.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 border border-slate-200 shadow-sm rounded">
                <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Statistical Snapshot
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <StatTooltip
                    label="PPG"
                    value={season.ppg}
                    previous={previousSeasonStats?.ppg}
                    tooltip="Points Per Game: Represents scoring volume. High PPG forces defenses to double-team, opening up teammates."
                  />
                  <StatTooltip
                    label="RPG"
                    value={season.rpg}
                    previous={previousSeasonStats?.rpg}
                    tooltip="Rebounds Per Game: Securing boards ends opponent possessions and creates fast-break opportunities."
                  />
                  <StatTooltip
                    label="APG"
                    value={season.apg}
                    previous={previousSeasonStats?.apg}
                    tooltip="Assists Per Game: Shows playmaking ability. High APG improves team chemistry and overall offensive efficiency."
                  />
                  <StatTooltip
                    label="PER"
                    value={parseFloat(
                      (
                        season.advanced?.per ||
                        (season.ppg + season.rpg + season.apg) / 2
                      ).toFixed(1),
                    )}
                    previous={previousSeasonStats?.advanced?.per}
                    tooltip="Player Efficiency Rating: A comprehensive metric of per-minute productivity. League average is 15.0."
                  />
                </div>
              </div>

              <div className="bg-white p-6 shadow-sm rounded border border-slate-200 border-l-4 border-l-nba-blue">
                <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-1 text-xs">
                  Season XP Gained
                </h3>
                <div className="text-4xl font-black font-mono mb-2 text-slate-900">
                  +{season.xpGained || 0} XP
                </div>
                <div className="text-xs text-slate-500 mb-4">
                  Total Available:{" "}
                  <span className="font-bold text-slate-900">{localXp} XP</span>
                </div>
                <button
                  onClick={() => setActiveTab("Progression")}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded transition-colors"
                >
                  Spend in Progression
                </button>
              </div>

              <div className="bg-white p-6 border border-slate-200 shadow-sm rounded">
                <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Off-Season Focus
                </h3>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Training Priority
                </label>
                <select
                  value={trainingFocus}
                  onChange={(e) =>
                    setTrainingFocus(e.target.value as TrainingFocus)
                  }
                  className="w-full p-3 border border-slate-300 rounded mb-4 bg-slate-50 font-bold text-slate-800"
                >
                  {[
                    "Balanced",
                    "Shooting",
                    "Finishing",
                    "Playmaking",
                    "Defense",
                    "Physicals",
                    "Recovery",
                  ].map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100">
                  {trainingFocus === "Recovery"
                    ? "Focus on rest and body maintenance. Reduces Fatigue significantly but halts attribute growth."
                    : `Targeting improvement in ${trainingFocus} attributes for next season.`}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Stats" && (
          <div className="bg-white p-6 border border-slate-200 shadow-sm rounded">
            <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
              <BarChart2 size={18} /> Detailed Season Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatTooltip
                label="Games Played"
                value={season.gamesPlayed}
                tooltip="Total games played this season. Durability affects overall season impact and award eligibility."
              />
              <StatTooltip
                label="Minutes/Game"
                value={season.minutes}
                tooltip="Average minutes played per game. Higher minutes indicate a larger role but increase fatigue."
              />
              <StatTooltip
                label="FG%"
                value={`${season.fgPct}%`}
                tooltip="Field Goal Percentage: Efficiency of all shots taken from the floor."
              />
              <StatTooltip
                label="3PT%"
                value={`${season.threePtPct}%`}
                tooltip="3-Point Percentage: Efficiency from beyond the arc. Above 35% is generally considered good."
              />
              <StatTooltip
                label="FT%"
                value={`${season.ftPct}%`}
                tooltip="Free Throw Percentage: Efficiency from the charity stripe. Crucial for late-game situations."
              />
              <StatTooltip
                label="Steals"
                value={season.spg}
                tooltip="Steals Per Game: Defensive metric showing ability to force turnovers and create fast breaks."
              />
              <StatTooltip
                label="Blocks"
                value={season.bpg}
                tooltip="Blocks Per Game: Defensive metric showing rim protection and shot-altering ability."
              />
              <StatTooltip
                label="Turnovers"
                value={season.turnovers}
                tooltip="Turnovers Per Game: Mistakes leading to loss of possession. Lower is better."
              />
            </div>

            <div className="mt-8">
              <h4 className="text-sm font-bold text-slate-600 uppercase mb-4">
                Advanced Metrics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex justify-between items-center p-3 border border-slate-200 rounded">
                  <span className="text-xs font-bold text-slate-500">PER</span>
                  <span className="font-mono font-bold text-nba-blue">
                    {season.advanced?.per || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 border border-slate-200 rounded">
                  <span className="text-xs font-bold text-slate-500">
                    True Shooting %
                  </span>
                  <span className="font-mono font-bold text-nba-blue">
                    {season.advanced?.tsPct || "-"}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 border border-slate-200 rounded">
                  <span className="text-xs font-bold text-slate-500">
                    Usage %
                  </span>
                  <span className="font-mono font-bold text-nba-blue">
                    {season.advanced?.usgPct || "-"}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 border border-slate-200 rounded">
                  <span className="text-xs font-bold text-slate-500">
                    Win Shares
                  </span>
                  <span className="font-mono font-bold text-nba-blue">
                    {season.advanced?.winShares || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Impact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 border border-slate-200 shadow-sm rounded">
              <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Activity size={18} /> On-Court Impact
              </h3>
              <p className="text-slate-700 leading-relaxed italic">
                "{season.onCourtImpact}"
              </p>
              <div className="mt-6 p-4 bg-slate-50 rounded border border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Plus/Minus
                </span>
                <span
                  className={`text-2xl font-mono font-black ${season.plusMinus > 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {season.plusMinus > 0 ? "+" : ""}
                  {season.plusMinus}
                </span>
              </div>
            </div>
            <div className="bg-white p-6 border border-slate-200 shadow-sm rounded">
              <h3 className="text-slate-600 font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <UserMinus size={18} /> Off-Court / Bench Impact
              </h3>
              <p className="text-slate-700 leading-relaxed italic">
                "{season.offCourtImpact}"
              </p>
              <div className="mt-6 p-4 bg-slate-50 rounded border border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Team Net Rating Change
                </span>
                <div className="text-xs text-slate-400">
                  (Estimated impact when resting)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coaching Tab (New RPG Elements) */}
        {activeTab === "Coaching" && currentCoach && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-nba-blue font-bold uppercase text-lg">
                    {currentCoach.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${currentCoach.quality === "Legendary" ? "bg-yellow-100 text-yellow-800" : "bg-slate-100 text-slate-600"}`}
                  >
                    {currentCoach.quality} Coach
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Coach XP
                  </div>
                  <div className="text-2xl font-mono font-bold text-slate-900">
                    {coachXp}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {Object.entries(
                  currentCoach.attributes || {
                    offense: 50,
                    defense: 50,
                    playerDevelopment: 50,
                    gameManagement: 50,
                  },
                ).map(([attr, value]) => {
                  const val = value as number;
                  return (
                    <div
                      key={attr}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <span className="text-xs font-bold uppercase text-slate-600 block">
                          {attr.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <div className="w-32 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-nba-blue"
                            style={{ width: `${val}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">
                          {val}
                        </span>
                        <button
                          onClick={() => upgradeCoachAttribute(attr as any)}
                          disabled={coachXp < COACH_ATTRIBUTE_COST || val >= 99}
                          className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${coachXp >= COACH_ATTRIBUTE_COST ? "bg-slate-100 hover:bg-slate-200 text-nba-blue border-slate-300" : "opacity-50 cursor-not-allowed"}`}
                        >
                          +1 ({COACH_ATTRIBUTE_COST} XP)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowCoachHire(true)}
                className="w-full py-3 bg-red-50 text-red-600 font-bold uppercase text-xs hover:bg-red-100 border border-red-200 transition-colors rounded flex items-center justify-center gap-2"
              >
                <UserMinus size={14} /> Fire & Replace Coach
              </button>

              {showCoachHire && (
                <div className="mt-4 animate-fade-in border-t border-slate-200 pt-4">
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">
                    Available Candidates
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {AVAILABLE_COACHES.map((coach, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedCoachCandidate(coach)}
                        className={`w-full text-left p-3 border rounded transition-colors group ${selectedCoachCandidate?.name === coach.name ? "border-nba-blue bg-blue-50" : "border-slate-200 hover:border-nba-blue hover:bg-blue-50"}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span
                            className={`font-bold text-sm ${selectedCoachCandidate?.name === coach.name ? "text-nba-blue" : "text-slate-800 group-hover:text-nba-blue"}`}
                          >
                            {coach.name}
                          </span>
                          <span className="text-[10px] font-bold uppercase bg-slate-100 px-1.5 rounded">
                            {coach.quality}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {coach.offensiveSystem} / {coach.defensiveScheme}
                        </div>
                      </button>
                    ))}
                  </div>
                  {selectedCoachCandidate && (
                    <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCoachCandidate(null);
                          setShowCoachHire(false);
                        }}
                        className="flex-1 py-2 border border-slate-300 rounded text-xs font-bold text-slate-600 uppercase hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={hireCoach}
                        className="flex-1 py-2 bg-nba-blue text-white rounded text-xs font-bold uppercase hover:bg-blue-800"
                      >
                        Confirm Hire
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded shadow-sm p-6">
              <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                <GitCommit size={18} /> Strategic Adjustments
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1 group relative w-max">
                    Offensive System <Info size={12} className="cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-normal normal-case">
                      Dictates the team's primary method of scoring. E.g., Pace
                      and Space focuses on 3PT shooting and fast breaks, while
                      Triangle relies on post play and cuts.
                    </div>
                  </label>
                  <select
                    value={currentCoach.offensiveSystem}
                    onChange={(e) =>
                      updateStrategy("offensiveSystem", e.target.value)
                    }
                    className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-sm font-medium"
                  >
                    {[
                      "Seven Seconds or Less",
                      "Triangle",
                      "Grit & Grind",
                      "Heliocentric",
                      "Motion",
                      "Pace and Space",
                    ].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1 group relative w-max">
                    Defensive Scheme <Info size={12} className="cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-normal normal-case">
                      Determines how the team defends. E.g., Switch Everything
                      requires versatile defenders, while Drop Coverage protects
                      the paint but gives up mid-range shots.
                    </div>
                  </label>
                  <select
                    value={currentCoach.defensiveScheme}
                    onChange={(e) =>
                      updateStrategy("defensiveScheme", e.target.value)
                    }
                    className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-sm font-medium"
                  >
                    {[
                      "Switch Everything",
                      "Drop Coverage",
                      "Full Court Press",
                      "Zone",
                    ].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1 group relative w-max">
                    Usage Rate <Info size={12} className="cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-normal normal-case">
                      Defines how much of the offense runs through your player.
                      Higher usage means more stats but faster fatigue and
                      higher injury risk.
                    </div>
                  </label>
                  <select
                    value={currentCoach.usageRate || "Secondary Star"}
                    onChange={(e) =>
                      updateStrategy("usageRate", e.target.value)
                    }
                    className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-sm font-medium"
                  >
                    {[
                      "Role Player",
                      "Secondary Star",
                      "The System",
                      "Sixth Man",
                    ].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {strategyModified && (
                  <div className="bg-blue-50 text-blue-800 p-3 rounded text-xs font-bold border border-blue-100 flex items-center gap-2">
                    <Check size={14} /> Changes saved for next season.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Front Office Tab (Simplified, now mostly covered by Coaching) */}
        {activeTab === "Front Office" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 border border-slate-200 shadow-sm rounded">
              <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Trade Machine
              </h3>
              {!tradeRequested ? (
                <button
                  onClick={() => setTradeRequested(true)}
                  className="w-full py-4 bg-slate-100 text-slate-600 font-bold uppercase text-xs hover:bg-slate-200 hover:text-slate-900 transition-colors rounded border border-slate-300 flex items-center justify-center gap-2 group"
                >
                  <Briefcase size={16} /> Request Trade
                  <ArrowUp
                    size={14}
                    className="group-hover:-rotate-45 transition-transform"
                  />
                </button>
              ) : (
                <div className="animate-fade-in">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
                    <div className="flex items-center gap-2 mb-2 text-yellow-800 font-bold uppercase text-xs">
                      <AlertTriangle size={14} /> Trade Request Active
                    </div>
                    <div className="mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase">GM Sentiment: </span>
                      <span className={`text-sm font-bold ${season.gmSentiment?.toLowerCase().includes('untouchable') ? 'text-red-600' : season.gmSentiment?.toLowerCase().includes('shopped') ? 'text-green-600' : 'text-blue-600'}`}>
                        {season.gmSentiment?.toLowerCase().includes('untouchable') ? 'Untouchable' : season.gmSentiment?.toLowerCase().includes('shopped') ? 'Actively Being Shopped' : 'Available for the Right Price'}
                      </span>
                    </div>
                    <p className="text-sm text-yellow-900 italic">
                      "
                      {season.gmSentiment ||
                        "The Front Office is evaluating options, but offers are currently scarce."}
                      "
                    </p>
                  </div>

                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Preferred Destination
                  </label>
                  <select
                    value={tradeTarget}
                    onChange={(e) => setTradeTarget(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded mb-2 text-sm bg-white"
                  >
                    {NBA_TEAMS.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setTradeRequested(false)}
                    className="text-xs text-red-500 font-bold underline mt-2"
                  >
                    Rescind Request
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Teammates Tab */}
        {activeTab === "Teammates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {season.teammates.map((mate, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-nba-blue transition-colors"
              >
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Users size={48} />
                </div>
                <div className="mb-4">
                  <div className="flex justify-between items-start">
                    <div className="text-xs text-slate-500 font-bold uppercase bg-slate-100 px-2 py-0.5 rounded inline-block mb-1">
                      {mate.position}
                    </div>
                    {mate.isStar && (
                      <Star
                        size={14}
                        className="text-yellow-500 fill-yellow-500"
                      />
                    )}
                  </div>
                  <div className="font-bold text-slate-900 text-lg">
                    {mate.name}
                  </div>
                  <div className="text-xs text-slate-500 italic">
                    {mate.archetype || "Rotation Player"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      PPG
                    </div>
                    <div className="font-mono font-bold text-slate-800">
                      {mate.ppg}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      RPG
                    </div>
                    <div className="font-mono font-bold text-slate-800">
                      {mate.rpg}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      APG
                    </div>
                    <div className="font-mono font-bold text-slate-800">
                      {mate.apg}
                    </div>
                  </div>
                </div>

                {/* Synergy & Growth Section */}
                <div className="mt-4 bg-slate-50 p-3 rounded border border-slate-100 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1">
                      <HeartHandshake size={12} className="text-nba-blue" />
                      <span className="font-bold uppercase text-slate-600">
                        Synergy
                      </span>
                    </div>
                    <span
                      className={`font-black ${mate.synergyGrade?.startsWith("A")
                        ? "text-green-600"
                        : mate.synergyGrade?.startsWith("B")
                          ? "text-blue-600"
                          : "text-slate-500"
                        }`}
                    >
                      {mate.synergyGrade || "C"}
                    </span>
                  </div>
                  {mate.seasonGrowth && (
                    <div className="flex items-center gap-1 mb-1 font-mono font-bold">
                      {mate.seasonGrowth.startsWith("+") ? (
                        <TrendingUp size={10} className="text-green-500" />
                      ) : (
                        <TrendingUp
                          size={10}
                          className="text-red-500 rotate-180"
                        />
                      )}
                      <span
                        className={
                          mate.seasonGrowth.startsWith("+")
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {mate.seasonGrowth}
                      </span>
                    </div>
                  )}
                  <p className="text-slate-500 italic leading-tight mt-2">
                    "
                    {mate.synergyNote ||
                      "Plays standard role within the system."}
                    "
                  </p>
                </div>

                <div
                  className={`mt-3 text-[10px] font-bold uppercase px-2 py-1 rounded text-center ${mate.morale === "Frustrated"
                    ? "bg-red-100 text-red-600"
                    : mate.morale === "Happy"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                    }`}
                >
                  Morale: {mate.morale || "Content"}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Growth" && (
          <div className="bg-white border border-slate-200 shadow-sm rounded p-6">
            <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <TrendingUp size={20} /> Year-over-Year Progression
            </h3>
            {previousAttributes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(season.ratingsSnapshot).map(([key, value]) => {
                  const val = value as number;
                  if (key === "rating") return null;
                  // @ts-ignore
                  const prev = (previousAttributes as any)[key] || val;
                  const diff = val - prev;
                  const hasChange = diff !== 0;

                  return (
                    <div
                      key={key}
                      className="flex flex-col gap-1 p-3 bg-slate-50 rounded border border-slate-100"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-slate-500">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <div className="flex items-center gap-1">
                          {hasChange && (
                            <span
                              className={`text-[10px] font-black ${diff > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {diff > 0 ? "+" : ""}
                              {diff}
                            </span>
                          )}
                          <span className="font-mono text-slate-900 font-bold">
                            {val}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1 relative">
                        {/* Base value bar */}
                        <div
                          className="h-full bg-slate-400 absolute left-0 top-0"
                          style={{ width: `${Math.min(val, prev)}%` }}
                        ></div>
                        {/* Gain bar */}
                        {diff > 0 && (
                          <div
                            className="h-full bg-green-500 absolute top-0"
                            style={{ left: `${prev}%`, width: `${diff}%` }}
                          ></div>
                        )}
                        {/* Loss bar (visualize regression) */}
                        {diff < 0 && (
                          <div
                            className="h-full bg-red-500 absolute top-0"
                            style={{
                              left: `${val}%`,
                              width: `${Math.abs(diff)}%`,
                            }}
                          ></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-slate-500 italic py-10">
                No previous season data available for comparison.
              </div>
            )}

            {/* Durability & Stamina Visualization */}
            <div className="mt-8 border-t border-slate-200 pt-8">
              <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                <Activity size={20} /> Career Durability & Stamina
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-50 p-4 rounded border border-slate-200 text-center">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Current Stamina</div>
                  <div className="text-3xl font-black text-nba-blue font-mono">{localStats.stamina}</div>
                  {previousAttributes && (
                    <div className={`text-xs font-bold mt-1 ${localStats.stamina > (previousAttributes.stamina || 0) ? 'text-green-600' : localStats.stamina < (previousAttributes.stamina || 0) ? 'text-red-600' : 'text-slate-400'}`}>
                      {localStats.stamina > (previousAttributes.stamina || 0) ? '+' : ''}{localStats.stamina - (previousAttributes.stamina || 0)} from last year
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 p-4 rounded border border-slate-200 text-center">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Current Durability</div>
                  <div className="text-3xl font-black text-nba-blue font-mono">{localStats.durability || 80}</div>
                  {previousAttributes && (
                    <div className={`text-xs font-bold mt-1 ${(localStats.durability || 80) > (previousAttributes.durability || 80) ? 'text-green-600' : (localStats.durability || 80) < (previousAttributes.durability || 80) ? 'text-red-600' : 'text-slate-400'}`}>
                      {(localStats.durability || 80) > (previousAttributes.durability || 80) ? '+' : ''}{(localStats.durability || 80) - (previousAttributes.durability || 80)} from last year
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 p-4 rounded border border-slate-200 text-center flex flex-col justify-center">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Current Fatigue</div>
                  <div className={`text-3xl font-black font-mono ${season.fatigue > 80 ? 'text-red-600' : season.fatigue > 50 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                    {season.fatigue}%
                  </div>
                  <div className="text-xs text-slate-500 italic mt-1">
                    Stamina affects minutes played. Durability affects injury frequency. Fatigue reduces stats.
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={[
                      ...(history || []).map((s, i) => ({
                        name: `Yr ${i + 1}`,
                        stamina: s.ratingsSnapshot.stamina,
                        durability: s.ratingsSnapshot.durability || 80,
                      })),
                      {
                        name: `Yr ${(history || []).length + 1}`,
                        stamina: localStats.stamina,
                        durability: localStats.durability || 80,
                      },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc", fontSize: "12px" }}
                      itemStyle={{ color: "#f8fafc" }}
                    />
                    <Line type="monotone" dataKey="stamina" name="Stamina" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} />
                    <Line type="monotone" dataKey="durability" name="Durability" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rookie vs Current Stats Radar Chart */}
            {history && history.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-8">
                <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Target size={20} /> Rookie vs Current Season Stats
                </h3>
                <div className="h-80 w-full max-w-2xl mx-auto bg-slate-50 rounded border border-slate-200 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                      { subject: 'PPG', rookie: history[0].ppg, current: season.ppg, fullMark: 35 },
                      { subject: 'RPG', rookie: history[0].rpg, current: season.rpg, fullMark: 15 },
                      { subject: 'APG', rookie: history[0].apg, current: season.apg, fullMark: 12 },
                      { subject: 'SPG', rookie: history[0].spg, current: season.spg, fullMark: 3 },
                      { subject: 'BPG', rookie: history[0].bpg, current: season.bpg, fullMark: 3 },
                    ]}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                      <Radar name="Rookie Season" dataKey="rookie" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.5} />
                      <Radar name="Current Season" dataKey="current" stroke="#1D428A" fill="#3b82f6" fillOpacity={0.5} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc", fontSize: "12px" }}
                        itemStyle={{ color: "#f8fafc" }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2 text-xs font-bold uppercase">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                      <span className="text-slate-600">Rookie Season</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-nba-blue rounded-full"></div>
                      <span className="text-slate-800">Current Season</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Progression" && (
          <div className="space-y-8">
            {/* Progression Chart */}
            <div className="bg-white border border-slate-200 rounded shadow-sm p-6">
              <h3 className="text-nba-blue font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
                <TrendingUp size={20} /> Development Timeline
              </h3>
              <div className="text-xs text-slate-500 mb-6">
                Visualizing the impact of coaching development rating on your
                overall player rating over the seasons.
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={[
                      ...(history || []).map((s, i) => ({
                        name: `Yr ${i + 1}`,
                        playerRating: s.ratingsSnapshot.rating,
                        coachDev:
                          s.headCoach?.attributes.playerDevelopment || 50,
                      })),
                      {
                        name: `Yr ${(history || []).length + 1}`,
                        playerRating: localStats.rating,
                        coachDev:
                          currentCoach?.attributes.playerDevelopment || 50,
                      },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      domain={[60, 100]}
                      tick={{ fontSize: 10, fill: "#1D428A" }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "Player OVR",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          textAnchor: "middle",
                          fill: "#1D428A",
                          fontSize: 10,
                          fontWeight: "bold",
                        },
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#f59e0b" }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "Coach Dev",
                        angle: 90,
                        position: "insideRight",
                        style: {
                          textAnchor: "middle",
                          fill: "#f59e0b",
                          fontSize: 10,
                          fontWeight: "bold",
                        },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#f8fafc",
                        fontSize: "12px",
                      }}
                      itemStyle={{ color: "#f8fafc" }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="playerRating"
                      name="Player OVR"
                      fill="#1D428A"
                      fillOpacity={0.1}
                      stroke="#1D428A"
                      strokeWidth={3}
                    />
                    <Line
                      yAxisId="right"
                      type="stepAfter"
                      dataKey="coachDev"
                      name="Coach Dev Rating"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        fill: "#f59e0b",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Attribute Buying Section */}
              <div className="bg-white border border-slate-200 rounded shadow-sm p-6">
                <h3 className="text-nba-blue font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Dumbbell size={20} /> Attribute Development
                </h3>
                <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 mb-4 border border-blue-100">
                  <strong>Manual Training:</strong> Spend XP to directly improve
                  core attributes. <br />
                  Cost: <strong>{ATTRIBUTE_COST} XP</strong> per point.
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {Object.entries(localStats)
                    .filter(([k]) => k !== "rating")
                    .map(([key, value]) => {
                      const val = value as number;
                      const canAfford = localXp >= ATTRIBUTE_COST && val < 99;
                      // @ts-ignore
                      const prev = previousAttributes
                        ? (previousAttributes as any)[key]
                        : val;
                      // @ts-ignore
                      const diff = val - prev;

                      return (
                        <div
                          key={key}
                          className="flex justify-between items-center border-b border-slate-100 pb-2"
                        >
                          <div>
                            <div className="text-xs font-bold uppercase text-slate-600">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-mono font-bold text-slate-900">
                                {val}
                              </div>
                              {diff !== 0 && (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${diff > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                >
                                  {diff > 0 ? "+" : ""}
                                  {diff}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              buyAttribute(key as keyof PlayerStats)
                            }
                            disabled={!canAfford}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded border transition-colors ${canAfford ? "bg-white text-nba-blue border-nba-blue hover:bg-blue-50" : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"}`}
                          >
                            +1
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="space-y-6">
                {/* Elite Mastery */}
                <div className="bg-white border border-slate-200 rounded shadow-sm p-6 mb-6">
                  <h3 className="text-nba-blue font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
                    <Crown size={20} /> Elite Mastery
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(UNLOCKABLE_BADGES).map(([key, data]) => {
                      const statValue = localStats[data.stat] as number;
                      const hasBadge = localBadges.some(
                        (b) => b.name === data.badge.name,
                      );
                      const canAfford = localXp >= BADGE_UNLOCK_COST;
                      const canUnlock =
                        statValue >= data.threshold && !hasBadge;

                      return (
                        <div
                          key={key}
                          className={`p-4 rounded border ${canUnlock ? "border-yellow-400 bg-yellow-50" : "border-slate-200 bg-slate-50 opacity-80"}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-bold text-sm text-slate-800">
                              {data.badge.name}
                            </div>
                            {!hasBadge ? (
                              canUnlock ? (
                                <button
                                  onClick={() => unlockBadge(key)}
                                  disabled={!canAfford}
                                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${canAfford ? "bg-nba-blue text-white" : "bg-slate-300 text-slate-500"}`}
                                >
                                  Unlock ({BADGE_UNLOCK_COST})
                                </button>
                              ) : (
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold">
                                  <Lock size={10} /> Req: {data.threshold}{" "}
                                  {data.stat.replace(/([A-Z])/g, " $1").trim()}
                                </div>
                              )
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] text-green-600 uppercase font-bold">
                                <Check size={10} /> Owned
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {data.badge.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Badge Tree */}
                <div className="bg-white border border-slate-200 rounded shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-nba-blue font-bold uppercase tracking-wider flex items-center gap-2">
                      <Award size={20} /> Badge Skill Tree
                    </h3>
                    <div className="flex items-center gap-4">
                      {onAddXp && (
                        <button
                          onClick={() => onAddXp(10000)}
                          className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200 hover:bg-purple-200 transition-colors uppercase flex items-center gap-1"
                          title="Cheat: Add 10,000 XP"
                        >
                          <Zap size={10} /> +10k XP
                        </button>
                      )}
                      <div className="text-sm font-bold bg-blue-50 px-3 py-1 rounded text-nba-blue border border-blue-100">
                        Available XP: {localXp}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {localBadges.map((badge, idx) => {
                      const nextTier = getNextTier(badge.tier);
                      const cost = nextTier ? UPGRADE_COSTS[nextTier] : 0;
                      const canAfford = nextTier && localXp >= cost;

                      return (
                        <div
                          key={idx}
                          className="bg-slate-50 border border-slate-200 p-4 rounded flex justify-between items-center group hover:border-nba-blue transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">
                                {badge.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white ${badge.tier === "Bronze"
                                  ? "bg-orange-700"
                                  : badge.tier === "Silver"
                                    ? "bg-slate-400"
                                    : badge.tier === "Gold"
                                      ? "bg-yellow-500"
                                      : "bg-purple-600"
                                  }`}
                              >
                                {badge.tier}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {badge.description}
                            </p>
                          </div>
                          <div>
                            {nextTier ? (
                              <button
                                onClick={() => initiateUpgrade(idx)}
                                disabled={!canAfford}
                                className={`text-xs font-bold uppercase px-3 py-2 rounded flex flex-col items-center ${canAfford
                                  ? "bg-nba-blue text-white hover:bg-blue-800"
                                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                  }`}
                              >
                                <span>Upgrade</span>
                                <span className="text-[10px] opacity-80">
                                  {cost} XP
                                </span>
                              </button>
                            ) : (
                              <div className="text-xs font-bold uppercase text-purple-600 flex items-center gap-1">
                                <Crown size={12} /> Maxed
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Condition & Training */}
                <div className="bg-white border border-slate-200 rounded shadow-sm p-6">
                  <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Flame
                      size={20}
                      className={getFatigueColor(season.fatigue)}
                    />{" "}
                    Player Condition
                  </h3>

                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                      <span>Fatigue Level</span>
                      <span className={getFatigueColor(season.fatigue)}>
                        {season.fatigue}%
                      </span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mb-3">
                      <div
                        className={`h-full transition-all duration-300 ${season.fatigue > 80
                          ? "bg-red-600"
                          : season.fatigue > 50
                            ? "bg-yellow-500"
                            : "bg-emerald-500"
                          }`}
                        style={{ width: `${season.fatigue}%` }}
                      ></div>
                    </div>

                    {/* Visual Fatigue Impact Indicator */}
                    <div
                      className={`p-3 rounded flex justify-between items-center ${getFatigueImpact(season.fatigue).color}`}
                    >
                      <span className="text-xs font-bold uppercase flex items-center gap-2">
                        <Battery size={14} /> Performance Impact
                      </span>
                      <span className="text-xs font-black uppercase">
                        {getFatigueImpact(season.fatigue).penalty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 italic">
                      High fatigue significantly increases injury risk and
                      reduces attribute effectiveness in playoffs.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded border border-slate-200">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                        Hyperbaric Recovery
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Reduce fatigue accumulation
                      </div>
                    </div>
                    <button
                      onClick={buyConditioning}
                      disabled={localXp < FATIGUE_REDUCTION_COST}
                      className={`px-3 py-2 text-xs font-bold uppercase rounded border ${localXp >= FATIGUE_REDUCTION_COST ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700" : "bg-slate-200 text-slate-400 border-slate-200"}`}
                    >
                      Buy ({FATIGUE_REDUCTION_COST} XP)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Draft" && (
          <div className="bg-white p-6 border border-slate-200 shadow-sm rounded">
            <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Briefcase size={18} /> Upcoming Draft Class
            </h3>
            {season.draftClass && season.draftClass.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {season.draftClass.map((prospect, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded p-4 bg-slate-50 relative overflow-hidden group"
                  >
                    <div className="absolute -right-4 -top-4 text-9xl font-black text-slate-200 opacity-50 font-mono z-0 group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold bg-nba-blue text-white px-2 py-0.5 rounded uppercase">
                          {prospect.position}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {prospect.height}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 uppercase mb-1">
                        {prospect.name}
                      </h4>
                      <div className="text-sm font-bold text-nba-red uppercase mb-4">
                        {prospect.archetype}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            Potential
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {prospect.potential}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            Comparison
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {prospect.comparison}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 italic p-8 text-center bg-slate-50 rounded border border-slate-200">
                Scouting reports for the upcoming draft class are not yet
                available.
              </div>
            )}
          </div>
        )}

        {activeTab === "Standings" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {season.standings.map((conf) => (
                <div
                  key={conf.conference}
                  className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden"
                >
                  <div className="bg-nba-blue text-white p-3 font-bold uppercase tracking-wider text-sm flex justify-between">
                    <span>{conf.conference} Conference</span>
                    <span className="opacity-70">W-L</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                      <tr>
                        <th className="p-2 text-left w-12 pl-4">Seed</th>
                        <th className="p-2 text-left">Team</th>
                        <th className="p-2 text-right">Rec</th>
                        <th className="p-2 text-right pr-4">GB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {conf.teams.map((team, idx) => (
                        <tr
                          key={team.name}
                          className={`${team.name === season.team ? "bg-blue-50" : ""} hover:bg-slate-50`}
                        >
                          <td className="p-2 pl-4 font-mono text-slate-500">
                            {team.seed}
                          </td>
                          <td className="p-2 font-bold text-slate-900 flex items-center gap-2">
                            {team.name}
                            {team.seed <= 8 && (
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            )}
                          </td>
                          <td className="p-2 text-right font-mono text-slate-600">
                            {team.wins}-{team.losses}
                          </td>
                          <td className="p-2 text-right pr-4 font-mono text-slate-400">
                            {team.gb === 0 ? "-" : team.gb}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded shadow-sm p-4">
                <h3 className="text-nba-blue font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Crown size={16} /> League Leaders
                </h3>
                <div className="space-y-3">
                  {season.leagueContext?.leagueLeaders?.map((leader, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {leader.player}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">
                          {leader.category}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-nba-blue">
                        {leader.value}
                      </div>
                    </div>
                  ))}
                  {!season.leagueContext?.leagueLeaders && (
                    <div className="text-slate-400 text-xs italic">
                      League leader data unavailable.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded p-6 shadow-lg">
                <h3 className="font-bold uppercase tracking-wider mb-2 text-yellow-400">
                  Rivalry Watch
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "
                  {season.leagueContext?.rivalryUpdate ||
                    "The league is balanced this year, with no clear favorite emerging early on."}
                  "
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Playoffs" && (
          <div className="space-y-8">
            <div className="bg-white p-6 border border-slate-200 rounded shadow-sm text-center">
              <h3 className="text-slate-500 font-bold uppercase text-xs mb-2">
                NBA Champion
              </h3>
              <div className="text-4xl font-black text-nba-blue mb-4 flex justify-center items-center gap-3">
                <Crown size={32} /> {season.playoffStats.bracket.champion}
              </div>
              <div className="text-sm text-slate-600">
                Finals MVP:{" "}
                <span className="font-bold">
                  {season.playoffStats.bracket.finalsMvp}
                </span>
              </div>
            </div>

            {season.playoffStats.bracket.series ? (
              <div className="overflow-x-auto pb-6">
                <div className="min-w-[900px] grid grid-cols-4 gap-6 px-2">
                  {[
                    "First Round",
                    "Conf. Semis",
                    "Conf. Finals",
                    "NBA Finals",
                  ].map((round) => (
                    <div key={round} className="space-y-4">
                      <h4 className="text-center font-bold text-xs uppercase text-slate-500 border-b border-slate-200 pb-2 sticky top-0 bg-white z-10">
                        {round}
                      </h4>
                      {season.playoffStats.bracket.series
                        .filter((s: any) => s.round === round)
                        .map((matchup: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-white border border-slate-200 rounded p-3 shadow-sm text-sm hover:border-blue-400 transition-colors"
                          >
                            <div
                              className={`flex justify-between font-bold ${matchup.winner === season.team ? "text-nba-blue" : "text-slate-800"}`}
                            >
                              <span className="truncate pr-2">
                                {matchup.winner}
                              </span>
                              <span>{matchup.score.split("-")[0]}</span>
                            </div>
                            <div
                              className={`flex justify-between text-slate-500`}
                            >
                              <span className="truncate pr-2">
                                {matchup.loser}
                              </span>
                              <span>{matchup.score.split("-")[1]}</span>
                            </div>
                          </div>
                        ))}
                      {season.playoffStats.bracket.series.filter(
                        (s: any) => s.round === round,
                      ).length === 0 && (
                          <div className="text-center text-xs text-slate-300 italic p-4 border border-dashed border-slate-200 rounded">
                            No active series
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 border border-slate-200 rounded">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">
                    Your Result
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {season.playoffStats.roundReached}
                  </div>
                  <div className="text-sm text-slate-600">
                    {season.playoffStats.seriesRecord}
                  </div>
                </div>
                <div className="bg-white p-4 border border-slate-200 rounded">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">
                    Your Playoff Stats
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {season.playoffStats.ppg} PPG
                  </div>
                  <div className="text-sm text-slate-600">
                    {season.playoffStats.rpg} RPG • {season.playoffStats.apg}{" "}
                    APG
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 flex justify-between items-center z-50">
        <button
          onClick={onRetire}
          disabled={isSimulating}
          className="px-6 py-3 text-red-600 font-bold uppercase text-sm hover:bg-red-50 rounded transition-colors"
        >
          Retire Career
        </button>
        <button
          onClick={() =>
            onContinue(
              trainingFocus,
              { requested: tradeRequested, target: tradeTarget },
              localBadges,
              spentXp,
              currentCoach,
              localStats,
            )
          }
          disabled={isSimulating}
          className="px-10 py-3 bg-nba-red text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-all rounded shadow-md flex items-center gap-2"
        >
          {isSimulating ? "Simulating Season..." : "Advance to Next Season"}{" "}
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
});
