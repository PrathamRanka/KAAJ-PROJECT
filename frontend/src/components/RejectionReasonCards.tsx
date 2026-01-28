import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Lightbulb, TrendingUp, X } from 'lucide-react';

interface RejectionReason {
  rule_id: number;
  rule_description: string;
  passed: boolean;
  reason: string;
  actual_value?: any;
  required_value?: any;
}

interface RejectionReasonCardsProps {
  failedRules: RejectionReason[];
  suggestions?: string[];
}

const RejectionReasonCards: React.FC<RejectionReasonCardsProps> = ({ failedRules, suggestions = [] }) => {
  const navigate = useNavigate();
  
  if (!failedRules || failedRules.length === 0) {
    return null;
  }

  const calculateProgress = (actual: number, required: number) => {
    if (!actual || !required) return 0;
    return Math.min(100, (actual / required) * 100);
  };

  const handleReapply = () => {
    navigate('/apply');
  };

  return (
    <div className="space-y-6">
      {/* Failed Rules Section */}
      <div>
        <div className="flex items-center mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Requirements Not Met</h3>
          <span className="ml-auto bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
            {failedRules.length} {failedRules.length === 1 ? 'Issue' : 'Issues'}
          </span>
        </div>

        <div className="space-y-3">
          {failedRules.map((rule, index) => (
            <motion.div
              key={rule.rule_id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <X className="w-5 h-5 text-red-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">{rule.rule_description}</h4>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{rule.reason}</p>

                  {/* Progress Bar if we have actual and required values */}
                  {rule.actual_value !== undefined && rule.required_value !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Your Value: <strong>{rule.actual_value}</strong></span>
                        <span>Required: <strong>{rule.required_value}</strong></span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${calculateProgress(rule.actual_value, rule.required_value)}%` }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {calculateProgress(rule.actual_value, rule.required_value).toFixed(1)}% of requirement met
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div>
          <div className="flex items-center mb-4">
            <Lightbulb className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">How to Improve</h3>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: failedRules.length * 0.1 + index * 0.1 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-medium">{suggestion}</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-500 ml-2" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (failedRules.length + suggestions.length) * 0.1 }}
            className="mt-6"
          >
            <button 
              onClick={handleReapply}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Reapply with Improvements
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RejectionReasonCards;
