import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, FileSearch, Calculator, Award } from 'lucide-react';

interface UnderwritingStep {
  id: string;
  label: string;
  icon: any;
  status: 'pending' | 'active' | 'completed';
}

interface UnderwritingProgressProps {
  isProcessing: boolean;
  currentStep?: number;
  onComplete?: () => void;
}

const UnderwritingProgress: React.FC<UnderwritingProgressProps> = ({ 
  isProcessing, 
  currentStep = 0,
  onComplete 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState<UnderwritingStep[]>([
    { id: 'fetch', label: 'Fetching Lender Policies', icon: FileSearch, status: 'pending' },
    { id: 'evaluate', label: 'Evaluating Rules', icon: Calculator, status: 'pending' },
    { id: 'score', label: 'Calculating Scores', icon: Award, status: 'pending' },
    { id: 'complete', label: 'Generating Results', icon: CheckCircle2, status: 'pending' },
  ]);

  useEffect(() => {
    if (!isProcessing) {
      setActiveStep(0);
      setSteps(steps.map(s => ({ ...s, status: 'pending' })));
      return;
    }

    // Simulate step progression
    const interval = setInterval(() => {
      setActiveStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          clearInterval(interval);
          if (onComplete) {
            setTimeout(onComplete, 500);
          }
          return prev;
        }
        return next;
      });
    }, 1500); // Each step takes 1.5 seconds

    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    setSteps(prevSteps =>
      prevSteps.map((step, index) => ({
        ...step,
        status: index < activeStep ? 'completed' : index === activeStep ? 'active' : 'pending',
      }))
    );
  }, [activeStep]);

  const progress = ((activeStep + 1) / steps.length) * 100;

  if (!isProcessing && activeStep === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Underwriting in Progress</h3>
          <p className="text-sm text-gray-500 mt-1">Processing your application...</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-indigo-600">{Math.round(progress)}%</p>
          <p className="text-xs text-gray-500">Complete</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.status === 'active';
          const isCompleted = step.status === 'completed';
          const isPending = step.status === 'pending';

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center p-4 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-50 border-2 border-indigo-200'
                  : isCompleted
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-gray-50 border-2 border-gray-100'
              }`}
            >
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-indigo-500'
                    : isCompleted
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isActive ? (
                    <motion.div
                      key="loader"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-6 h-6 text-white" />
                    </motion.div>
                  ) : isCompleted ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </motion.div>
                  ) : (
                    <Icon className="w-6 h-6 text-white" />
                  )}
                </AnimatePresence>
              </div>

              {/* Label */}
              <div className="ml-4 flex-1">
                <p
                  className={`font-semibold ${
                    isActive
                      ? 'text-indigo-900'
                      : isCompleted
                      ? 'text-green-900'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isActive && 'Processing...'}
                  {isCompleted && 'Completed'}
                  {isPending && 'Waiting...'}
                </p>
              </div>

              {/* Step Number */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  isActive
                    ? 'bg-indigo-200 text-indigo-700'
                    : isCompleted
                    ? 'bg-green-200 text-green-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Message */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg"
        >
          <p className="text-sm text-blue-800 text-center">
            ⚡ This usually takes 5-10 seconds. Please don't close this page.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UnderwritingProgress;
