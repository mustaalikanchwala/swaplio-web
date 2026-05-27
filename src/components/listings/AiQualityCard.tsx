'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface AiQualityCardProps {
  score: number;
  tips: string[];
  compact?: boolean; // true = compact hover tooltip, false = full detail page card
}

function getScoreColor(score: number) {
  if (score >= 7) return 'green';
  if (score >= 4) return 'yellow';
  return 'red';
}

const colorMap = {
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    iconColor: '#4ade80',
    badgeBg: 'bg-green-500/20',
    badgeText: 'text-green-400',
    barColor: 'bg-green-400',
    dotColor: 'bg-green-400',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    iconColor: '#facc15',
    badgeBg: 'bg-yellow-500/20',
    badgeText: 'text-yellow-400',
    barColor: 'bg-yellow-400',
    dotColor: 'bg-yellow-400',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    iconColor: '#f87171',
    badgeBg: 'bg-red-500/20',
    badgeText: 'text-red-400',
    barColor: 'bg-red-400',
    dotColor: 'bg-red-400',
  },
};

export function AiQualityCard({ score, tips, compact = false }: AiQualityCardProps) {
  const color = getScoreColor(score);
  const c = colorMap[color];
  const fillPercent = (score / 10) * 100;

  // Animated bar fill — starts at 0, animates to real width after 100ms mount delay
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => {
    if (compact) return; // no animation for compact version
    const t = setTimeout(() => setBarWidth(fillPercent), 100);
    return () => clearTimeout(t);
  }, [fillPercent, compact]);

  if (compact) {
    // ─── COMPACT VERSION — hover tooltip on listing cards ─────────────────────
    return (
      <div
        className={`w-48 rounded-xl p-3 shadow-lg shadow-black/50`}
        style={{
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Sparkles size={12} color={c.iconColor} />
            <span className="text-xs text-white/60 font-sans">AI Score</span>
          </div>
          <span
            className={`rounded-full text-[10px] font-bold px-2 py-0.5 ${c.badgeBg} ${c.badgeText}`}
          >
            {score}/10
          </span>
        </div>

        {/* Score bar */}
        <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${c.barColor} rounded-full`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>

        {/* First tip only */}
        {tips.length > 0 && (
          <p className="mt-2 text-[10px] text-white/40 truncate leading-snug font-sans">
            {tips[0]}
          </p>
        )}
      </div>
    );
  }

  // ─── FULL VERSION — listing detail page ────────────────────────────────────
  return (
    <div
      className={`rounded-2xl p-4 border ${c.bg} ${c.border}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} color={c.iconColor} />
          <span className="text-sm font-medium text-white/80 font-sans">
            AI Quality Score
          </span>
        </div>
        <span
          className={`rounded-full text-xs font-bold px-2.5 py-0.5 ${c.badgeBg} ${c.badgeText}`}
        >
          {score}/10
        </span>
      </div>

      {/* Animated score bar */}
      <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${c.barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Tips section */}
      {tips.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-white/40 mb-1.5 font-sans">Suggestions</p>
          <ul className="flex flex-col gap-1.5">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${c.dotColor}`}
                />
                <span className="text-xs text-white/60 leading-relaxed font-sans">
                  {tip}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex justify-end">
        <span className="text-[10px] text-white/20 italic font-sans">
          Powered by Gemini AI
        </span>
      </div>
    </div>
  );
}
