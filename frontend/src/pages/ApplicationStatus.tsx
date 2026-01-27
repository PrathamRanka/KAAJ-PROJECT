import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '../lib/api';
import { Button } from '../components/Button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ApplicationStatus() {
  const { id } = useParams<{ id: string }>();
  const [underwritingResult, setUnderwritingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { data: application, refetch } = useQuery({
    queryKey: ['application', id],
    queryFn: () => endpoints.getApplication(Number(id)).then(res => res.data),
    enabled: !!id
  });

  const handleRunUnderwriting = async () => {
    setLoading(true);
    try {
      const res = await endpoints.runUnderwriting(Number(id));
      setUnderwritingResult(res.data.results);
      refetch();
    } catch (error) {
      console.error(error);
      alert('Error running underwriting');
    } finally {
      setLoading(false);
    }
  };

  if (!application) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{application.business_name}</h1>
          <p className="text-gray-500">Requested: ${application.requested_amount.toLocaleString()}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            application.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {application.status}
          </span>
          {application.status !== 'COMPLETED' && (
             <Button onClick={handleRunUnderwriting} disabled={loading}>
               {loading ? 'Processing...' : 'Run Underwriting'}
             </Button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {(underwritingResult) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Underwriting Results</h2>
          <div className="grid gap-4">
            {underwritingResult.map((result: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{result.program}</h3>
                    <div className="mt-1 flex items-center">
                      {result.status === 'ELIGIBLE' ? (
                        <span className="flex items-center text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4 mr-1" /> Eligible
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 font-medium">
                          <XCircle className="w-4 h-4 mr-1" /> Rejected
                        </span>
                      )}
                      
                      {result.status === 'ELIGIBLE' && (
                        <div className="flex items-center space-x-2 ml-4">
                           <span className="text-blue-600 font-medium">
                             Match Score: {result.score}/100
                           </span>
                           <span className={`px-2 py-0.5 text-xs rounded font-bold border ${
                              result.reasons.risk_tier === 'A' ? 'bg-green-100 text-green-700 border-green-200' :
                              result.reasons.risk_tier === 'B' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                              'bg-red-100 text-red-700 border-red-200'
                           }`}>
                             RISK: {result.reasons.risk_tier}
                           </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reasons */}
                <div className="space-y-2 text-sm">
                  {result.reasons.failed.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-md">
                      <p className="font-semibold text-red-800 mb-1">Rejection Reasons:</p>
                      <ul className="list-disc list-inside text-red-700 mb-2">
                        {result.reasons.failed.map((r: any) => (
                          <li key={r.rule_id}>{r.reason}</li>
                        ))}
                      </ul>
                      
                      {result.reasons.suggestions && result.reasons.suggestions.length > 0 && (
                           <div className="bg-white p-2 rounded border border-red-200 mt-2">
                               <p className="font-bold text-gray-700 text-xs uppercase mb-1">💡 Smart Recommendations:</p>
                               <ul className="list-disc list-inside text-gray-600">
                                   {result.reasons.suggestions.map((s: string, i: number) => (
                                       <li key={i}>{s}</li>
                                   ))}
                               </ul>
                           </div>
                      )}
                    </div>
                  )}
                  
                  {result.reasons.passed.length > 0 && (
                     <div className="text-gray-600 mt-2">
                        <p className="font-semibold">Passed Criteria:</p>
                        <ul className="list-disc list-inside">
                          {result.reasons.passed.map((r: any) => (
                             <li key={r.rule_id}>{r.rule_description}</li>
                          ))}
                        </ul>
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
