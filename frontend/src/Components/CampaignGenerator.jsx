import React, { useState, useEffect } from 'react';
import { Target, Loader2, Copy, CheckCircle2, Users, DollarSign, Building2, Flag, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../config';

const CampaignGenerator = ({ selectedBrandId }) => {
  const API_BASE = `${API_BASE_URL}/api`;

  // Form state matching Campaign model
  const [formData, setFormData] = useState({
    id: Date.now(),
    campaign_goal: '',
    target_audience: 'adults',
    industry: '',
    budget: 0,
    brand_id: null
  });

  // Response & UI states
  const [generatedCampaign, setGeneratedCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [brands, setBrands] = useState([]);

  // Fetch brands on mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Update brand_id when selectedBrandId prop changes
  useEffect(() => {
    if (selectedBrandId) {
      setFormData(prev => ({ ...prev, brand_id: parseInt(selectedBrandId) }));
    }
  }, [selectedBrandId]);

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_BASE}/brands`);
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      }
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedCampaign(null);

    try {
      const payload = {
        ...formData,
        id: Date.now(),
        budget: parseFloat(formData.budget) || 0,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null
      };

      const response = await fetch(`${API_BASE}/create-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to generate campaign');
      }

      const data = await response.json();
      setGeneratedCampaign(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const campaignGoals = [
    'Brand Awareness',
    'Lead Generation',
    'Sales Conversion',
    'Website Traffic',
    'App Installs',
    'Customer Engagement',
    'Product Launch',
    'Event Promotion'
  ];

  const industries = [
    'Technology',
    'E-commerce',
    'Healthcare',
    'Finance',
    'Education',
    'Food & Beverage',
    'Fashion & Apparel',
    'Travel & Hospitality',
    'Real Estate',
    'Entertainment',
    'Automotive',
    'Fitness & Wellness'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left: Form */}
        <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
              <Target size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Campaign Generator</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest">AI-Powered Marketing Strategy</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campaign Goal */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                <Flag size={12} /> Campaign Goal
              </label>
              <select
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none cursor-pointer"
                value={formData.campaign_goal}
                onChange={(e) => setFormData({ ...formData, campaign_goal: e.target.value })}
              >
                <option value="">Select a goal...</option>
                {campaignGoals.map((goal) => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                <Building2 size={12} /> Industry
              </label>
              <select
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none cursor-pointer"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              >
                <option value="">Select industry...</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                <Users size={12} /> Target Audience
              </label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none cursor-pointer"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              >
                <option value="adults">Adults</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="teenagers">Teenagers</option>
                <option value="parents">Parents</option>
              </select>
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                <DollarSign size={12} /> Budget ($)
              </label>
              <input
                type="number"
                step="100"
                min="0"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"
                placeholder="5000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>

            {/* Brand Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Brand Profile (Optional)</label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none cursor-pointer"
                value={formData.brand_id || ''}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value ? parseInt(e.target.value) : null })}
              >
                <option value="">No Brand Selected</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name} ({brand.tone})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.campaign_goal || !formData.industry}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-purple-600/20"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Target size={18} />}
              {isLoading ? 'Generating Campaign...' : 'Generate Campaign Plan'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Right: Generated Campaign Preview */}
        <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-400" />
              Campaign Strategy
            </h3>
            {generatedCampaign && (
              <button
                onClick={() => copyToClipboard(generatedCampaign)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copied ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <Copy size={16} className="text-slate-400" />
                )}
              </button>
            )}
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="text-sm">Building your campaign strategy...</p>
            </div>
          )}

          {!isLoading && !generatedCampaign && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-600">
              <Target size={48} className="mb-4 opacity-30" />
              <p className="text-sm">Configure and generate your campaign</p>
            </div>
          )}

          {generatedCampaign && (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {/* Render campaign data */}
              {typeof generatedCampaign === 'object' ? (
                Object.entries(generatedCampaign).map(([key, value]) => (
                  <div key={key} className="p-4 bg-black/30 rounded-xl border border-white/5">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-2">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <div className="text-white text-sm leading-relaxed">
                      {typeof value === 'string' ? (
                        <p className="whitespace-pre-wrap">{value}</p>
                      ) : Array.isArray(value) ? (
                        <ul className="list-disc list-inside space-y-1">
                          {value.map((item, idx) => (
                            <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                          ))}
                        </ul>
                      ) : (
                        <pre className="text-xs overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                  <p className="text-white text-sm whitespace-pre-wrap">{String(generatedCampaign)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignGenerator;
