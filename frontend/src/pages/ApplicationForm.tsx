import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../lib/api';
import { Button } from '../components/Button';

const INDUSTRIES = [
  'General',
  'Technology',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Restaurant',
  'Construction',
  'Professional Services',
  'Real Estate',
  'Transportation',
  'Other'
];

const LOAN_PURPOSES = [
  'Working Capital',
  'Equipment Purchase',
  'Business Expansion',
  'Debt Refinancing',
  'Inventory',
  'Real Estate',
  'Other'
];

export default function ApplicationForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    business_name: '',
    requested_amount: '',
    fico: '',
    years_in_business: '',
    annual_revenue: '',
    industry: 'General',
    loan_purpose: 'Working Capital',
    contact_name: '',
    email: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: ''
  });

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fico':
        const fico = Number(value);
        if (fico < 300 || fico > 850) {
          return 'FICO score must be between 300 and 850';
        }
        break;
      case 'requested_amount':
        const amount = Number(value);
        if (amount < 1000) {
          return 'Requested amount must be at least $1,000';
        }
        break;
      case 'years_in_business':
        const years = Number(value);
        if (years < 0) {
          return 'Years in business cannot be negative';
        }
        break;
      case 'annual_revenue':
        const revenue = Number(value);
        if (revenue < 0) {
          return 'Annual revenue cannot be negative';
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (value && !/^\+?[\d\s\-()]+$/.test(value)) {
          return 'Please enter a valid phone number';
        }
        break;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      // Validate all fields
      const newErrors: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        const error = validateField(key, value);
        if (error) {
          newErrors[key] = error;
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      // Construct payload matching backend expectation
      const payload = {
        business_name: formData.business_name,
        requested_amount: Number(formData.requested_amount),
        data: {
          fico: Number(formData.fico),
          years_in_business: Number(formData.years_in_business),
          annual_revenue: Number(formData.annual_revenue),
          industry: formData.industry,
          loan_purpose: formData.loan_purpose,
          contact_name: formData.contact_name || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          street_address: formData.street_address || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zip_code: formData.zip_code || undefined
        }
      };
      
      const res = await endpoints.createApplication(payload);
      navigate(`/application/${res.data.id}`);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.detail || 'Failed to submit application. Please check your information and try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-2">New Loan Application</h2>
      <p className="text-gray-600 text-sm mb-6">Fields marked with * are required</p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Business Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Name *
            </label>
            <input
              name="business_name"
              required
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.business_name}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Industry *
              </label>
              <select
                name="industry"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={formData.industry}
                onChange={handleChange}
              >
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Years in Business *
                <span className="text-gray-500 text-xs ml-1">(e.g., 2.5)</span>
              </label>
              <input
                name="years_in_business"
                required
                type="number"
                step="0.1"
                min="0"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                  errors.years_in_business ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.years_in_business}
                onChange={handleChange}
              />
              {errors.years_in_business && (
                <p className="mt-1 text-sm text-red-600">{errors.years_in_business}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Annual Revenue ($) *
              <span className="text-gray-500 text-xs ml-1">(Total yearly revenue)</span>
            </label>
            <input
              name="annual_revenue"
              required
              type="number"
              min="0"
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                errors.annual_revenue ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.annual_revenue}
              onChange={handleChange}
            />
            {errors.annual_revenue && (
              <p className="mt-1 text-sm text-red-600">{errors.annual_revenue}</p>
            )}
          </div>
        </div>

        {/* Loan Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Loan Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Requested Amount ($) *
                <span className="text-gray-500 text-xs ml-1">(Min: $1,000)</span>
              </label>
              <input
                name="requested_amount"
                required
                type="number"
                min="1000"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                  errors.requested_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.requested_amount}
                onChange={handleChange}
              />
              {errors.requested_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.requested_amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Purpose *
              </label>
              <select
                name="loan_purpose"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={formData.loan_purpose}
                onChange={handleChange}
              >
                {LOAN_PURPOSES.map(purpose => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              FICO Score *
              <span className="text-gray-500 text-xs ml-1">(Credit score: 300-850)</span>
            </label>
            <input
              name="fico"
              required
              type="number"
              min="300"
              max="850"
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                errors.fico ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.fico}
              onChange={handleChange}
            />
            {errors.fico && (
              <p className="mt-1 text-sm text-red-600">{errors.fico}</p>
            )}
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Name
            </label>
            <input
              name="contact_name"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.contact_name}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                name="phone"
                type="tel"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Address Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Address</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              name="street_address"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.street_address}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                name="city"
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                name="state"
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input
                name="zip_code"
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={formData.zip_code}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </div>
  );
}
