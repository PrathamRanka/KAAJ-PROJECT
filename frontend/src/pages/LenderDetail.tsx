import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '../lib/api';
import { ScrollText, Gavel } from 'lucide-react';

export default function LenderDetail() {
  const { id } = useParams<{ id: string }>();
  
  // In a real app we'd have getLender(id), but for now we filter from list or we can implement getLender endpoint.
  // Actually, let's just use the list endpoint and find it client side for MVP speed if valid, 
  // BUT endpoints.getLenders returns all efficiently enough for this scale.
  // Better: Let's assume we want to be correct and since we don't have getLender(id) working perfectly without dev time,
  // I'll just fetch all and find. 
  
  const { data: lenders } = useQuery({
    queryKey: ['lenders'],
    queryFn: () => endpoints.getLenders().then(res => res.data)
  });

  const lender = lenders?.find((l: any) => l.id === Number(id));

  if (!lender) return <div>Loading or Not Found...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{lender.name}</h1>
        <p className="text-gray-500 mt-1">Lender ID: {lender.slug}</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center">
          <ScrollText className="w-5 h-5 mr-2" />
          Programs & Policies
        </h2>
        
        {lender.programs?.map((program: any) => (
          <div key={program.id} className="bg-white border text-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="font-bold text-lg">{program.name}</h3>
            </div>
            
            <div className="p-6 space-y-6">
                 {program.policies?.map((policy: any) => (
                    <div key={policy.id} className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                             <div>
                                <h3 className="font-bold text-gray-800">Policy v{policy.version || 1}</h3>
                                <div className={`text-xs inline-flex items-center px-2 py-0.5 rounded ${policy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                    {policy.is_active ? 'Active' : 'Archived'}
                                </div>
                             </div>
                             {policy.is_active && (
                                 <button 
                                    onClick={() => {
                                        if(confirm("Create new version? This will archive the current v" + (policy.version || 1))) {
                                            endpoints.clonePolicy(policy.id).then(() => window.location.reload());
                                        }
                                    }}
                                    className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                 >
                                     Example: Copy v{policy.version || 1} → v{(policy.version || 1) + 1}
                                 </button>
                             )}
                        </div>
                        
                        <div className="bg-gray-50 rounded-md border p-4">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
                                <span className="flex items-center"><Gavel className="w-4 h-4 mr-2" /> Underwriting Rules</span>
                                <button 
                                  className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                                  onClick={() => {
                                      const field = prompt("Field Name (e.g. fico, annual_revenue)");
                                      if(!field) return;
                                      const operator = prompt("Operator (>=, >, <, <=, ==)");
                                      const value = prompt("Value (e.g. 700)");
                                      
                                      if(field && operator && value) {
                                          let parsedVal = value;
                                          try { parsedVal = JSON.parse(value); } catch(e) {}
                                          
                                          endpoints.createRule(policy.id, {
                                              rule_type: "filter",
                                              field,
                                              operator,
                                              value_json: parsedVal,
                                              description: `Min ${field} ${value}`
                                          }).then(() => window.location.reload());
                                      }
                                  }}
                                >
                                  + Add Rule
                                </button>
                            </h4>
                            <div className="grid gap-3">
                                {policy.rules?.map((rule: any) => (
                                    <div key={rule.id} className="flex items-center justify-between text-sm bg-white p-3 rounded border group">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono text-blue-600 bg-blue-50 px-1 rounded">
                                                {rule.field}
                                            </span>
                                            <span className="text-gray-400 font-bold">{rule.operator}</span>
                                            <span 
                                              className="font-mono text-purple-600 bg-purple-50 px-1 rounded cursor-pointer hover:bg-purple-100"
                                              onClick={() => {
                                                const newVal = prompt(`Update value for ${rule.field} (Current: ${JSON.stringify(rule.value_json)})`, JSON.stringify(rule.value_json));
                                                if (newVal) {
                                                  // Basic parsing
                                                  try {
                                                    const parsed = JSON.parse(newVal);
                                                    endpoints.updateRule(rule.id, { ...rule, value_json: parsed })
                                                      .then(() => window.location.reload()) // Simple reload for MVP
                                                      .catch(err => alert("Failed to update"));
                                                  } catch (e) {
                                                    endpoints.updateRule(rule.id, { ...rule, value_json: newVal }) // Try as string
                                                      .then(() => window.location.reload())
                                                      .catch(err => alert("Failed to update"));
                                                  }
                                                }
                                              }}
                                              title="Click to Edit Value"
                                            >
                                                {JSON.stringify(rule.value_json)}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-500 italic">{rule.description}</span>
                                            <button 
                                                className="text-red-400 hover:text-red-600 hidden group-hover:block"
                                                onClick={() => {
                                                    if(confirm("Delete this rule?")) {
                                                        endpoints.deleteRule(rule.id).then(() => window.location.reload());
                                                    }
                                                }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                 ))}
                 
                 {(!program.policies || program.policies.length === 0) && (
                     <p className="text-gray-400 italic">No policies defined for this program.</p>
                 )}
            </div>
          </div>
        ))}

        {lender.programs?.length === 0 && (
             <p className="text-gray-500">No programs found.</p>
        )}
      </div>
    </div>
  );
}
