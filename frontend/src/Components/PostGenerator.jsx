import React, { useState, useEffect } from 'react';
import { Send, Loader2, Copy, CheckCircle2, Image as ImageIcon, Tag, DollarSign, Gift, Users, FileText } from 'lucide-react';
import { API_BASE_URL } from '../config';

const PostGenerator = ({ selectedBrandId }) => {
  const API_BASE = `${API_BASE_URL}/api`;

  // Form state matching Product model
  const [formData, setFormData] = useState({
    id: Date.now(), // Generate unique ID
    name: '',
    price: 0,
    offer: '',
    target_audience: 'adults',
    description: '',
    image_url: '',
    brand_id: null
  });

  // Response & UI states
  const [generatedPosts, setGeneratedPosts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
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
    setGeneratedPosts(null);

    try {
      const payload = {
        ...formData,
        id: Date.now(),
        price: parseFloat(formData.price) || 0,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null
      };

      const response = await fetch(`${API_BASE}/generate-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to generate posts');
      }

      const data = await response.json();
      setGeneratedPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left: Form */}
        <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
              <Send size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Post Generator</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest">AI-Powered Social Media Content</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                <Tag size={12} /> Product Name
              </label>
              <input
                required
                type="text"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none transition-all"
                placeholder="e.g. Apex Wireless Headphones"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                <FileText size={12} /> Product Description
              </label>
              <textarea
                required
                rows="3"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none resize-none"
                placeholder="Describe your product features and benefits..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Price & Offer Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                  <DollarSign size={12} /> Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                  placeholder="99.99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                  <Gift size={12} /> Offer / Discount
                </label>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                  placeholder="e.g. 20% OFF"
                  value={formData.offer}
                  onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                />
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                <Users size={12} /> Target Audience
              </label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none cursor-pointer"
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

            {/* Image URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                <ImageIcon size={12} /> Image URL (Optional)
              </label>
              <input
                type="url"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                placeholder="https://example.com/product.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>

            {/* Brand Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Brand Profile (Optional)</label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none cursor-pointer"
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
              disabled={isLoading || !formData.name || !formData.description}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-600/20"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
              {isLoading ? 'Generating Posts...' : 'Generate Social Posts'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Right: Generated Posts Preview */}
        <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-400" />
            Generated Posts
          </h3>

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="text-sm">Crafting engaging content...</p>
            </div>
          )}

          {!isLoading && !generatedPosts && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-600">
              <Send size={48} className="mb-4 opacity-30" />
              <p className="text-sm">Fill in the form and generate posts</p>
            </div>
          )}

          {generatedPosts && (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {/* Display posts based on response structure */}
              {typeof generatedPosts === 'object' && (
                Object.entries(generatedPosts).map(([platform, content], index) => (
                  <div key={platform} className="p-4 bg-black/30 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{platform}</span>
                      <button
                        onClick={() => copyToClipboard(typeof content === 'string' ? content : JSON.stringify(content), index)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {copiedIndex === index ? (
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        ) : (
                          <Copy size={14} className="text-slate-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                      {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostGenerator;
