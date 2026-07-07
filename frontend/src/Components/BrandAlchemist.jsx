import React, { useState, useEffect } from 'react';
import { Save, Plus, X, Fingerprint, Loader2, CheckCircle2 } from 'lucide-react';

const BrandProfileForm = ({ onBrandSelected }) => {
  const API_URL = "http://127.0.0.1:8000/api/brands";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Data matches BrandProfileCreate schema exactly
  const [formData, setFormData] = useState({
    name: '',
    tone: 'professional', // Matches your BrandTone enum expectations
    tagline: '',
    values: [],
    keywords_include: [],
    keywords_avoid: [],
    target_emotion: '',
    example_posts: [],
    style_guidelines: ''
  });

  // State for list-input fields
  const [inputs, setInputs] = useState({ value: '', inc: '', avoid: '', post: '' });

  const addListIdx = (field, inputKey) => {
    if (!inputs[inputKey].trim()) return;
    setFormData(prev => ({ ...prev, [field]: [...prev[field], inputs[inputKey].trim()] }));
    setInputs(prev => ({ ...prev, [inputKey]: '' }));
  };

  const removeListIdx = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // Sending the BrandProfileCreate schema
      });

      if (!response.ok) throw new Error("Backend validation failed (422) or Server Error");

      const savedBrand = await response.json();
      setSuccess(true);
      if (onBrandSelected) onBrandSelected(savedBrand);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-[2.5rem] border border-slate-200 shadow-lg">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600 border border-indigo-200">
          <Fingerprint size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Brand DNA</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Calibration for consistent generation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Brand Name</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. TechFlow"
            />
          </div>

          {/* Tone Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Brand Tone</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-indigo-500"
              value={formData.tone}
              onChange={e => setFormData({...formData, tone: e.target.value})}
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="luxury">Luxury</option>
              <option value="bold">Bold & Witty</option>
              <option value="minimalist">Minimalist</option>
            </select>
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Tagline</label>
          <input 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            value={formData.tagline}
            onChange={e => setFormData({...formData, tagline: e.target.value})}
            placeholder="Innovation at your fingertips"
          />
        </div>

        {/* List Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ChipInput 
            label="Core Values" 
            list={formData.values} 
            value={inputs.value}
            onChange={v => setInputs({...inputs, value: v})}
            onAdd={() => addListIdx('values', 'value')}
            onRemove={i => removeListIdx('values', i)}
          />
          <ChipInput 
            label="Target Emotion" 
            list={formData.target_emotion ? [formData.target_emotion] : []} 
            value={formData.target_emotion}
            onChange={v => setFormData({...formData, target_emotion: v})}
            onAdd={() => {}} // Simple string field, handles differently
            isSingle
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ChipInput 
            label="Keywords to Include" 
            list={formData.keywords_include} 
            value={inputs.inc}
            onChange={v => setInputs({...inputs, inc: v})}
            onAdd={() => addListIdx('keywords_include', 'inc')}
            onRemove={i => removeListIdx('keywords_include', i)}
          />
          <ChipInput 
            label="Keywords to Avoid" 
            list={formData.keywords_avoid} 
            value={inputs.avoid}
            onChange={v => setInputs({...inputs, avoid: v})}
            onAdd={() => addListIdx('keywords_avoid', 'avoid')}
            onRemove={i => removeListIdx('keywords_avoid', i)}
            isDanger
          />
        </div>

        {/* Style Guidelines */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Style Guidelines</label>
          <textarea 
            rows="3"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            value={formData.style_guidelines}
            onChange={e => setFormData({...formData, style_guidelines: e.target.value})}
            placeholder="Use short, punchy sentences. Always end with a clear CTA."
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl
            ${success ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'}
          `}
        >
          {loading ? <Loader2 className="animate-spin" /> : success ? <CheckCircle2 /> : <Save size={18} />}
          {loading ? 'Creating Brand Profile...' : success ? 'Brand Identity Secured' : 'Save Brand Identity'}
        </button>
      </form>
    </div>
  );
};

// Helper Sub-component
const ChipInput = ({ label, list, value, onChange, onAdd, onRemove, isDanger, isSingle }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">{label}</label>
    <div className="flex flex-wrap gap-2 min-h-[32px]">
      {list.map((item, i) => (
        <span key={i} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${isDanger ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-indigo-100 text-indigo-600 border-indigo-200'}`}>
          {item}
          {!isSingle && <X size={10} className="cursor-pointer" onClick={() => onRemove(i)} />}
        </span>
      ))}
    </div>
    {!isSingle && (
      <div className="flex gap-2">
        <input 
          className="flex-1 bg-black/20 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), onAdd())}
          placeholder={`Add ${label.toLowerCase()}...`}
        />
        <button type="button" onClick={onAdd} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-400"><Plus size={16} /></button>
      </div>
    )}
    {isSingle && (
      <input 
        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`Define ${label.toLowerCase()}...`}
      />
    )}
  </div>
);

export default BrandProfileForm;