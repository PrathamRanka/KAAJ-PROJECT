import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '../lib/api';
import { Button } from '../components/Button';
import { CheckCircle, XCircle, Sparkles } from 'lucide-react';
import ScoreBreakdown from '../components/ScoreBreakdown';
import RejectionReasonCards from '../components/RejectionReasonCards';
import UnderwritingProgress from '../components/UnderwritingProgress';
import Confetti from 'react-confetti';


export default function ApplicationStatus() {
  const { id } = useParams<{ id: string }>();
  const [underwritingResult, setUnderwritingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: application, refetch } = useQuery({
    queryKey: ['application', id],
    queryFn: () => endpoints.getApplication(Number(id)).then(res => res.data),
    enabled: !!id
  });

  // Effect to load existing results on mount
  React.useEffect(() => {
    if (application?.decisions?.length > 0 && !underwritingResult) {
      // Map backend Decision model to frontend display format
      const formatted = application.decisions.map((d: any) => ({
        program: d.program?.name || `Program #${d.program_id}`,
        status: d.status,
        score: d.fit_score,
        reasons: d.reasons
      }));
      setUnderwritingResult(formatted);
      
      // Check if any result is Tier A to show confetti
      const hasTierA = formatted.some((r: any) => r.status === 'ELIGIBLE' && r.reasons?.risk_tier === 'A');
      if (hasTierA) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  }, [application]);

  const handleRunUnderwriting = async () => {
    setLoading(true);
    setUnderwritingResult(null);
    try {
      const res = await endpoints.runUnderwriting(Number(id));
      setUnderwritingResult(res.data.results);
      refetch();
      
      // Check for Tier A and trigger confetti
      const hasTierA = res.data.results.some((r: any) => r.status === 'ELIGIBLE' && r.reasons?.risk_tier === 'A');
      if (hasTierA) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      console.error(error);
      alert('Error running underwriting');
    } finally {
      setLoading(false);
    }
  };

  if (!application) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      {/* Confetti for Tier A approvals */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{application.business_name}</h1>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                application.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {application.status}
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center">
                <span className="font-medium mr-1">Requested Amount:</span>
                <span className="text-lg font-bold text-indigo-600">${application.requested_amount.toLocaleString()}</span>
              </span>
              <span className="flex items-center">
                <span className="font-medium mr-1">Application ID:</span>
                <span className="font-mono text-gray-900">#{id}</span>
              </span>
            </div>
          </div>
          {application.status !== 'COMPLETED' && (
            <Button onClick={handleRunUnderwriting} disabled={loading} className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Processing...' : 'Run Underwriting'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Underwriting Progress */}
      {loading && <UnderwritingProgress isProcessing={loading} />}

      {/* Results Section */}
      {underwritingResult && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Underwriting Results</h2>
            <span className="text-sm text-gray-500">{underwritingResult.length} lender{underwritingResult.length !== 1 ? 's' : ''} evaluated</span>
          </div>

          {underwritingResult.map((result: any, idx: number) => (
            <div key={idx} className="space-y-6">
              {/* Program Header Card */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{result.program}</h3>
                    <div className="flex items-center space-x-4">
                      {result.status === 'ELIGIBLE' ? (
                        <span className="flex items-center text-green-600 font-semibold text-lg">
                          <CheckCircle className="w-5 h-5 mr-2" /> Eligible
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 font-semibold text-lg">
                          <XCircle className="w-5 h-5 mr-2" /> Not Eligible
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Breakdown for Eligible Applications */}
              {result.status === 'ELIGIBLE' && result.reasons?.breakdown && (
                <ScoreBreakdown
                  breakdown={result.reasons.breakdown}
                  totalScore={result.score}
                  riskTier={result.reasons.risk_tier}
                />
              )}

              {/* Rejection Reason Cards for Rejected Applications */}
              {result.status === 'REJECTED' && result.reasons?.failed && (
                <RejectionReasonCards
                  failedRules={result.reasons.failed}
                  suggestions={result.reasons.suggestions || []}
                />
              )}

              {/* Passed Criteria (for both eligible and rejected) */}
              {result.reasons?.passed?.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Passed Criteria ({result.reasons.passed.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.reasons.passed.map((r: any, i: number) => (
                      <div key={r.rule_id || i} className="flex items-start p-3 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{r.rule_description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

