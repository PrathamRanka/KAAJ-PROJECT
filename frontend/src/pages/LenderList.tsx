import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { endpoints } from '../lib/api';
import { Building2, ChevronRight } from 'lucide-react';

export default function LenderList() {
  const { data: lenders, isLoading } = useQuery({
    queryKey: ['lenders'],
    queryFn: () => endpoints.getLenders().then(res => res.data)
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Lenders</h1>
        {/* <Button>Add Lender</Button> */}
      </div>

      <div className="grid gap-4">
        {lenders?.map((lender: any) => (
          <Link 
            key={lender.id} 
            to={`/lenders/${lender.id}`}
            className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{lender.name}</h3>
                  <p className="text-sm text-gray-500">{lender.programs?.length || 0} Programs Active</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        ))}
        
        {lenders?.length === 0 && (
           <div className="text-center p-12 bg-white rounded-lg border border-dashed border-gray-300">
             <p className="text-gray-500">No lenders found. (Did you run seed.py?)</p>
           </div>
        )}
      </div>
    </div>
  );
}
