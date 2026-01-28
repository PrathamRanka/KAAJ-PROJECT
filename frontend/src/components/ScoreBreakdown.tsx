import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Building2, DollarSign, Shield } from 'lucide-react';

interface ScoreBreakdownProps {
  breakdown: {
    credit_score: number;
    business_profile: number;
    loan_fit: number;
    risk: number;
  };
  totalScore: number;
  riskTier: string;
}

const CircularProgress = ({ 
  value, 
  max, 
  color, 
  label, 
  icon: Icon 
}: { 
  value: number; 
  max: number; 
  color: string; 
  label: string; 
  icon: any;
}) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90 w-32 h-32">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-100"
          />
          {/* Progress circle */}
          <motion.circle
            cx="64"
            cy="64"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-6 h-6 mb-1" style={{ color }} />
          <motion.span 
            className="text-2xl font-bold text-gray-900"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {value}
          </motion.span>
          <span className="text-xs text-gray-500">/ {max}</span>
        </div>
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">{percentage.toFixed(0)}%</p>
      </div>
    </div>
  );
};

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ breakdown, totalScore, riskTier }) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'A': return 'from-yellow-400 to-yellow-600';
      case 'B': return 'from-gray-300 to-gray-500';
      case 'C': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'A': return 'Premium';
      case 'B': return 'Standard';
      case 'C': return 'Subprime';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Score Breakdown</h3>
          <p className="text-sm text-gray-500 mt-1">Detailed analysis of your application</p>
        </div>
        
        {/* Risk Tier Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`relative px-6 py-3 rounded-xl bg-gradient-to-r ${getTierColor(riskTier)} shadow-lg`}
        >
          <div className="text-center">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Risk Tier</p>
            <p className="text-3xl font-bold text-white">{riskTier}</p>
            <p className="text-xs text-white/90 mt-1">{getTierLabel(riskTier)}</p>
          </div>
          
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        </motion.div>
      </div>

      {/* Total Score */}
      <motion.div 
        className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Overall Fit Score</p>
            <motion.p 
              className="text-5xl font-bold text-indigo-600 mt-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              {totalScore}
              <span className="text-2xl text-gray-400">/100</span>
            </motion.p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              <TrendingUp className="w-4 h-4 mr-1" />
              Excellent Match
            </div>
          </div>
        </div>
      </motion.div>

      {/* Circular Progress Rings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <CircularProgress
          value={breakdown.credit_score}
          max={40}
          color="#3b82f6"
          label="Credit Score"
          icon={TrendingUp}
        />
        <CircularProgress
          value={breakdown.business_profile}
          max={30}
          color="#10b981"
          label="Business Profile"
          icon={Building2}
        />
        <CircularProgress
          value={breakdown.loan_fit}
          max={20}
          color="#f59e0b"
          label="Loan Fit"
          icon={DollarSign}
        />
        <CircularProgress
          value={breakdown.risk}
          max={10}
          color="#8b5cf6"
          label="Risk Factors"
          icon={Shield}
        />
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Score calculated based on credit history, business age, loan capacity, and industry risk factors
        </p>
      </div>
    </div>
  );
};

export default ScoreBreakdown;
