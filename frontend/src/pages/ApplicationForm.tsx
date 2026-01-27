import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../lib/api';
import { Button } from '../components/Button';

export default function ApplicationForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    requested_amount: '',
    fico: '',
    years_in_business: '',
    annual_revenue: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Construct payload matching backend expectation
      const payload = {
        business_name: formData.business_name,
        requested_amount: Number(formData.requested_amount),
        data: {
          fico: Number(formData.fico),
          years_in_business: Number(formData.years_in_business),
          annual_revenue: Number(formData.annual_revenue),
          industry: "General" # Placeholder
        }
      };
      
      const res = await endpoints.createApplication(payload);
      navigate(`/application/${res.data.id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-6">New Loan Application</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            name="business_name"
            required
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            value={formData.business_name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Requested Amount ($)</label>
          <input
            name="requested_amount"
            required
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            value={formData.requested_amount}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">FICO Score</label>
            <input
              name="fico"
              required
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.fico}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Years in Business</label>
            <input
              name="years_in_business"
              required
              type="number"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.years_in_business}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Annual Revenue ($)</label>
          <input
            name="annual_revenue"
            required
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            value={formData.annual_revenue}
            onChange={handleChange}
          />
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </div>
  );
}
