import React, { useState } from 'react';
import { Target, PieChart, Building2, Wallet, Sparkles, Loader2, BarChart3, ChevronLeft, Copy, Check } from 'lucide-react';

// Helper function to parse and render markdown-style content
const FormattedContent = ({ content }) => {
  const [copiedSection, setCopiedSection] = useState(null);

  const copySection = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Split content into lines and process
  const lines = content.split('\n');
  const elements = [];
  let currentList = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="space-y-2 my-4 ml-4">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: formatInlineStyles(item) }} />
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const formatInlineStyles = (text) => {
    // Bold: **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-slate-800 font-semibold">$1</strong>');
    // Italic: *text*
    text = text.replace(/\*([^*]+)\*/g, '<em class="text-indigo-600">$1</em>');
    return text;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines but flush any pending list
    if (!trimmedLine) {
      flushList();
      return;
    }

    // Horizontal rule: ---
    if (trimmedLine === '---') {
      flushList();
      elements.push(<hr key={`hr-${index}`} className="border-slate-200 my-6" />);
      return;
    }

    // Main headers: **Header**
    if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && !trimmedLine.includes(':')) {
      flushList();
      const headerText = trimmedLine.slice(2, -2);
      elements.push(
        <h2 key={`h2-${index}`} className="text-xl font-bold text-slate-800 mt-8 mb-4 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          {headerText}
        </h2>
      );
      return;
    }

    // Phase headers: **Phase X: Title (Timeline)**
    if (trimmedLine.startsWith('**Phase') || trimmedLine.startsWith('**1.') || trimmedLine.startsWith('**2.') || trimmedLine.startsWith('**3.')) {
      flushList();
      const headerText = trimmedLine.replace(/\*\*/g, '');
      elements.push(
        <div key={`phase-${index}`} className="mt-8 mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl">
          <h3 className="text-lg font-bold text-indigo-600">{headerText}</h3>
        </div>
      );
      return;
    }

    // Key-value lines: **Key:** Value
    if (trimmedLine.includes(':**') || (trimmedLine.startsWith('**') && trimmedLine.includes(':'))) {
      flushList();
      const match = trimmedLine.match(/\*\*([^*]+)\*\*\s*(.*)/) || trimmedLine.match(/\*\*([^:]+):\*\*\s*(.*)/);
      if (match) {
        const [, key, value] = match;
        elements.push(
          <div key={`kv-${index}`} className="flex flex-wrap gap-2 my-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-indigo-600 font-semibold">{key.replace(':', '')}:</span>
            <span className="text-slate-600">{value}</span>
          </div>
        );
        return;
      }
    }

    // Bullet points: * item or - item
    if (trimmedLine.startsWith('*   ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      const itemText = trimmedLine.replace(/^[\*\-]\s+/, '');
      currentList.push(itemText);
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p 
        key={`p-${index}`} 
        className="text-slate-600 my-3 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatInlineStyles(trimmedLine) }}
      />
    );
  });

  // Flush any remaining list items
  flushList();

  return <div className="space-y-1">{elements}</div>;
};

const CampaignForm = ({ onCampaignGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    campaign_goal: '',
    target_audience: 'adults',
    industry: '',
    budget: 0,
    brand_id: null
  });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const payload = {
    id: Math.floor(Math.random() * 10000), // Add the ID back here
    campaign_goal: formData.campaign_goal,
    target_audience: formData.target_audience,
    industry: formData.industry,
    budget: parseFloat(formData.budget),
    brand_id: formData.brand_id ? parseInt(formData.brand_id) : null
  };

  try {
    const response = await fetch("http://localhost:8000/api/create-campaign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.success) {
      setResult(data.content);
    } else {
      console.error("Backend Error:", data.detail);
    }
  } catch (error) {
    console.error("Network Error:", error);
  } finally {
    setLoading(false);
  }
};
  // View 1: The Result Display
  if (result) {
    const handleCopy = () => {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
        <button 
          onClick={() => setResult(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Create New Blueprint
        </button>
        
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-lg">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Strategic Roadmap</h2>
              <p className="text-indigo-600 font-medium">Generated for {formData.industry} • {formData.target_audience}</p>
            </div>
            <button 
              onClick={handleCopy}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-all flex items-center gap-2"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-emerald-500" />
                  <span className="text-xs text-emerald-500">Copied!</span>
                </>
              ) : (
                <Copy size={20} />
              )}
            </button>
          </div>
          
          {/* Display the AI text with proper formatting */}
          <FormattedContent content={result} />
        </div>
      </div>
    );
  }

  // View 2: The Form (Standard)
  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-lg">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
          <BarChart3 size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Campaign Blueprint</h2>
          <p className="text-slate-500 text-sm">Define your marketing strategy parameters</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 px-1">Primary Goal</label>
          <div className="relative">
            <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              required
              placeholder="e.g. Increase brand awareness by 20%"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              onChange={(e) => setFormData({...formData, campaign_goal: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 px-1">Audience</label>
            <div className="relative">
              <PieChart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 outline-none appearance-none focus:border-indigo-500 transition-all"
                value={formData.target_audience}
                onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="teenagers">Teenagers</option>
                <option value="adults">Adults</option>
                <option value="parents">Parents</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 px-1">Industry</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                required
                placeholder="e.g. E-commerce"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 px-1">Budget (USD)</label>
          <div className="relative">
            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="number"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value) || 0})}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Generate AI Strategy</>}
        </button>
      </form>
    </div>
  );
};

export default CampaignForm;