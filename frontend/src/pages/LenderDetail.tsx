// import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '../lib/api';
import { ScrollText, Gavel, ArrowLeft, Copy, Trash2, Plus } from 'lucide-react';

export default function LenderDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data: lenders } = useQuery({
    queryKey: ['lenders'],
    queryFn: () => endpoints.getLenders().then(res => res.data)
  });

  const lender = lenders?.find((l: any) => l.id === Number(id));

  if (!lender) return <div className="p-8 text-center text-slate-500">Loading Lender Information...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center space-x-4">
         <Link to="/lenders" className="p-2 rounded-full hover:bg-slate-200 transition text-slate-500">
            <ArrowLeft className="w-6 h-6" />
         </Link>
         <div>
            <h1 className="text-3xl font-bold text-slate-900">{lender.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-500 border border-slate-200">{lender.slug}</span>
                <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 font-medium">Active Partner</span>
            </div>
         </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <ScrollText className="w-6 h-6 mr-2 text-indigo-600" />
            Programs & Policies
            </h2>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">+ New Program</button>
        </div>
        
        {lender.programs?.map((program: any) => (
          <div key={program.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                  <h3 className="font-bold text-lg text-slate-800">{program.name}</h3>
                  <p className="text-sm text-slate-500">Program ID: {program.id}</p>
              </div>
              <span className="text-xs font-medium bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600">Standard Tier</span>
            </div>
            
            <div className="p-6 space-y-6">
                 {program.policies?.map((policy: any) => (
                    <div key={policy.id} className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center space-x-3">
                                <span className="text-sm font-bold text-slate-700 px-2 py-1 bg-slate-100 rounded">v{policy.version || 1}</span>
                                <div className={`text-xs inline-flex items-center px-2 py-1 rounded-full font-medium ${policy.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                                    {policy.is_active ? 'Active Policy' : 'Archived'}
                                </div>
                             </div>
                             {policy.is_active && (
                                 <button 
                                    onClick={() => {
                                        if(confirm("Create new version? This will archive the current v" + (policy.version || 1))) {
                                            endpoints.clonePolicy(policy.id).then(() => window.location.reload());
                                        }
                                    }}
                                    className="text-xs flex items-center text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                                 >
                                     <Copy className="w-3 h-3 mr-1.5" />
                                     Duplicate Version
                                 </button>
                             )}
                        </div>
                        
                        <div className="bg-slate-50/50 rounded-xl border border-dashed border-slate-300 p-5">
                            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                                <span className="flex items-center text-indigo-900"><Gavel className="w-4 h-4 mr-2" /> Underwriting Rules</span>
                                <button 
                                  className="text-xs flex items-center bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-indigo-600 shadow-sm transition-all"
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
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Rule
                                </button>
                            </h4>
                            <div className="grid gap-3">
                                {policy.rules?.map((rule: any) => (
                                    <div key={rule.id} className="flex items-center justify-between text-sm bg-white p-4 rounded-xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wide">
                                                {rule.field}
                                            </span>
                                            <span className="text-slate-400 font-bold">{rule.operator}</span>
                                            <span 
                                              className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded cursor-pointer hover:bg-indigo-100 hover:text-indigo-700"
                                              onClick={() => {
                                                const newVal = prompt(`Update value for ${rule.field}`, JSON.stringify(rule.value_json));
                                                if (newVal) {
                                                  try {
                                                    const parsed = JSON.parse(newVal);
                                                    endpoints.updateRule(rule.id, { ...rule, value_json: parsed }).then(() => window.location.reload());
                                                  } catch (e) {
                                                    endpoints.updateRule(rule.id, { ...rule, value_json: newVal }).then(() => window.location.reload());
                                                  }
                                                }
                                              }}
                                              title="Click to Edit Value"
                                            >
                                                {JSON.stringify(rule.value_json)}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-slate-400 text-xs italic hidden md:inline-block">{rule.description}</span>
                                            <button 
                                                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                onClick={() => {
                                                    if(confirm("Delete this rule?")) {
                                                        endpoints.deleteRule(rule.id).then(() => window.location.reload());
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!policy.rules || policy.rules.length === 0) && (
                                     <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-xl">
                                         <p className="text-slate-400 text-xs">No rules defined yet.</p>
                                     </div>
                                )}
                            </div>
                        </div>
                    </div>
                 ))}
                 
                 {(!program.policies || program.policies.length === 0) && (
                     <p className="text-slate-400 italic text-center py-4">No policies defined for this program.</p>
                 )}
            </div>
          </div>
        ))}

        {lender.programs?.length === 0 && (
             <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">No programs found for this lender.</p>
             </div>
        )}
      </div>
    </div>
  );
}
