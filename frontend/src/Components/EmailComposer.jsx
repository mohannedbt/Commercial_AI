import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, Sparkles, Loader2, ChevronLeft, Copy, Check, 
  User, ShoppingBag, Target, Zap, RefreshCw, Eye, Clock,
  Heart, Gift, Bell, Star, MessageCircle, Award
} from 'lucide-react';

// Email type icons mapping
const emailTypeIcons = {
  promotional: <Gift size={18} />,
  welcome: <Heart size={18} />,
  newsletter: <Mail size={18} />,
  abandoned_cart: <ShoppingBag size={18} />,
  re_engagement: <RefreshCw size={18} />,
  product_launch: <Sparkles size={18} />,
  thank_you: <Award size={18} />,
  seasonal: <Star size={18} />,
  feedback: <MessageCircle size={18} />,
  loyalty: <Award size={18} />
};

// Email variant card component
const EmailVariantCard = ({ variant, index, onCopy }) => {
  const [copied, setCopied] = useState(null);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
    if (onCopy) onCopy(text);
  };

  const CopyButton = ({ text, field }) => (
    <button
      onClick={() => handleCopy(text, field)}
      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
      title="Copy to clipboard"
    >
      {copied === field ? (
        <Check size={14} className="text-emerald-500" />
      ) : (
        <Copy size={14} className="text-slate-400" />
      )}
    </button>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Email Header Preview */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-xs font-medium uppercase tracking-wider">
            Variant {index + 1}
          </span>
          <CopyButton text={`Subject: ${variant.subject_line}\n\n${variant.greeting}\n\n${variant.body}\n\n${variant.closing}${variant.ps_line ? `\n\nP.S. ${variant.ps_line}` : ''}`} field={`full-${index}`} />
        </div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-bold text-lg">{variant.subject_line}</h3>
        </div>
        <p className="text-white/70 text-sm mt-1">{variant.preview_text}</p>
      </div>

      {/* Email Body */}
      <div className="p-6 space-y-4">
        {/* Greeting */}
        <div className="flex items-start justify-between">
          <p className="text-slate-800 font-semibold text-lg">{variant.greeting}</p>
          <CopyButton text={variant.greeting} field={`greeting-${index}`} />
        </div>

        {/* Body Content */}
        <div className="relative group">
          <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
            {variant.body}
          </div>
          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={variant.body} field={`body-${index}`} />
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center py-4">
          <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all">
            {variant.cta_text}
          </button>
        </div>

        {/* Closing */}
        <p className="text-slate-600 whitespace-pre-wrap">{variant.closing}</p>

        {/* P.S. Line */}
        {variant.ps_line && (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-slate-500 italic text-sm">
              <span className="font-semibold text-slate-700">P.S.</span> {variant.ps_line}
            </p>
          </div>
        )}

        {/* Social Proof */}
        {variant.social_proof && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-600 text-sm italic">"{variant.social_proof}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Chip input for interests/history
const ChipInput = ({ label, items, onAdd, onRemove, placeholder }) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors font-medium text-sm"
        >
          Add
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm flex items-center gap-2"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const EmailComposer = ({ selectedBrandId }) => {
  const API_URL = "http://127.0.0.1:8000";

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [brands, setBrands] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    email_type: 'promotional',
    email_tone: 'friendly',
    product_name: '',
    product_description: '',
    offer_details: '',
    offer_expiry: '',
    cta_goal: 'Shop Now',
    target_audience: 'Adults',
    brand_id: selectedBrandId || null,
    include_emojis: true,
    generate_variants: 2,
    // Recipient personalization
    recipient: {
      first_name: '',
      interests: [],
      purchase_history: [],
      engagement_level: null,
      last_purchase_days: null,
      total_orders: null
    }
  });

  // Fetch brands on mount
  useEffect(() => {
    fetch(`${API_URL}/api/brands`)
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(err => console.error('Failed to fetch brands:', err));
  }, []);

  // Update brand_id when selectedBrandId prop changes
  useEffect(() => {
    if (selectedBrandId) {
      setFormData(prev => ({ ...prev, brand_id: selectedBrandId }));
    }
  }, [selectedBrandId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Clean up recipient data - remove empty fields
    const cleanedRecipient = { ...formData.recipient };
    if (!cleanedRecipient.first_name) delete cleanedRecipient.first_name;
    if (cleanedRecipient.interests?.length === 0) delete cleanedRecipient.interests;
    if (cleanedRecipient.purchase_history?.length === 0) delete cleanedRecipient.purchase_history;
    if (!cleanedRecipient.engagement_level) delete cleanedRecipient.engagement_level;
    if (!cleanedRecipient.last_purchase_days) delete cleanedRecipient.last_purchase_days;
    if (!cleanedRecipient.total_orders) delete cleanedRecipient.total_orders;

    const payload = {
      ...formData,
      recipient: Object.keys(cleanedRecipient).length > 0 ? cleanedRecipient : null,
      brand_id: formData.brand_id ? parseInt(formData.brand_id) : null
    };

    try {
      const response = await fetch(`${API_URL}/api/generate-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        console.error('Generation failed:', data.error);
        alert('Failed to generate email: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    
    const cleanedRecipient = { ...formData.recipient };
    if (!cleanedRecipient.first_name) delete cleanedRecipient.first_name;
    if (cleanedRecipient.interests?.length === 0) delete cleanedRecipient.interests;
    if (cleanedRecipient.purchase_history?.length === 0) delete cleanedRecipient.purchase_history;

    const payload = {
      ...formData,
      recipient: Object.keys(cleanedRecipient).length > 0 ? cleanedRecipient : null,
      brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
      generate_variants: 1
    };

    try {
      const response = await fetch(`${API_URL}/api/generate-email/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const html = await response.text();
      setPreviewHtml(html);
      setShowPreview(true);
    } catch (error) {
      console.error('Preview error:', error);
      alert('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  // Result view
  if (result) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
        <button
          onClick={() => setResult(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Create New Email
        </button>

        {/* Result Header */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 mb-6 shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <Mail className="text-indigo-600" />
                Generated Emails
              </h2>
              <p className="text-slate-500">
                {result.email_type} • {result.variants?.length || 0} variants generated
              </p>
            </div>
            {result.brand_applied && (
              <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium">
                Brand: {result.brand_applied}
              </span>
            )}
          </div>

          {/* Personalization Used */}
          {result.personalization_used && Object.keys(result.personalization_used).length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                Personalization Applied
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.personalization_used.name && (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
                    <User size={14} /> {result.personalization_used.name}
                  </span>
                )}
                {result.personalization_used.interests?.map((interest, i) => (
                  <span key={i} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm">
                    {interest}
                  </span>
                ))}
                {result.personalization_used.engagement && (
                  <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm flex items-center gap-2">
                    <Zap size={14} /> {result.personalization_used.engagement} Engagement
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                A/B Testing Tips
              </h4>
              <ul className="space-y-2">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <Sparkles size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Email Variants */}
        <div className="grid gap-6">
          {result.variants?.map((variant, index) => (
            <EmailVariantCard key={index} variant={variant} index={index} />
          ))}
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="max-w-4xl mx-auto">
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Email Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <iframe
              srcDoc={previewHtml}
              className="w-full h-[70vh] border-0"
              title="Email Preview"
            />
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl text-white shadow-lg shadow-indigo-500/25">
            <Mail size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Email Composer</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              AI-Powered Personalized Marketing Emails
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email Type & Tone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Email Type
              </label>
              <select
                value={formData.email_type}
                onChange={(e) => setFormData({ ...formData, email_type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 outline-none"
              >
                <option value="promotional">🎁 Promotional</option>
                <option value="welcome">💜 Welcome</option>
                <option value="newsletter">📬 Newsletter</option>
                <option value="abandoned_cart">🛒 Abandoned Cart</option>
                <option value="re_engagement">🔄 Re-engagement</option>
                <option value="product_launch">🚀 Product Launch</option>
                <option value="thank_you">🙏 Thank You</option>
                <option value="seasonal">🎄 Seasonal</option>
                <option value="feedback">💬 Feedback Request</option>
                <option value="loyalty">⭐ Loyalty/Rewards</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Tone
              </label>
              <select
                value={formData.email_tone}
                onChange={(e) => setFormData({ ...formData, email_tone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 outline-none"
              >
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="urgent">Urgent</option>
                <option value="casual">Casual</option>
                <option value="luxurious">Luxurious</option>
                <option value="playful">Playful</option>
                <option value="inspirational">Inspirational</option>
              </select>
            </div>
          </div>

          {/* Product/Offer Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <ShoppingBag size={16} className="text-indigo-500" />
              Product & Offer Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Product Name
                </label>
                <input
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="e.g., Wireless Headphones Pro"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  CTA Goal
                </label>
                <input
                  value={formData.cta_goal}
                  onChange={(e) => setFormData({ ...formData, cta_goal: e.target.value })}
                  placeholder="e.g., Shop Now, Learn More"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Product Description
              </label>
              <textarea
                value={formData.product_description}
                onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                placeholder="Brief description of the product being promoted..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Offer Details
                </label>
                <input
                  value={formData.offer_details}
                  onChange={(e) => setFormData({ ...formData, offer_details: e.target.value })}
                  placeholder="e.g., 20% off, Free shipping"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Offer Expiry
                </label>
                <input
                  value={formData.offer_expiry}
                  onChange={(e) => setFormData({ ...formData, offer_expiry: e.target.value })}
                  placeholder="e.g., 48 hours, Dec 25th"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Personalization Section */}
          <div className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-indigo-100">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-purple-500" />
              Recipient Personalization
              <span className="text-[10px] font-normal text-slate-500 ml-2">(Optional)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  First Name
                </label>
                <input
                  value={formData.recipient.first_name}
                  onChange={(e) => setFormData({
                    ...formData,
                    recipient: { ...formData.recipient, first_name: e.target.value }
                  })}
                  placeholder="e.g., Sarah"
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Engagement Level
                </label>
                <select
                  value={formData.recipient.engagement_level || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    recipient: { ...formData.recipient, engagement_level: e.target.value || null }
                  })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 outline-none"
                >
                  <option value="">Not specified</option>
                  <option value="High">High (Active buyer)</option>
                  <option value="Medium">Medium (Occasional)</option>
                  <option value="Low">Low (Inactive)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Days Since Purchase
                </label>
                <input
                  type="number"
                  value={formData.recipient.last_purchase_days || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    recipient: { ...formData.recipient, last_purchase_days: e.target.value ? parseInt(e.target.value) : null }
                  })}
                  placeholder="e.g., 30"
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>
            </div>

            <ChipInput
              label="Interests"
              items={formData.recipient.interests}
              onAdd={(item) => setFormData({
                ...formData,
                recipient: { ...formData.recipient, interests: [...formData.recipient.interests, item] }
              })}
              onRemove={(idx) => setFormData({
                ...formData,
                recipient: {
                  ...formData.recipient,
                  interests: formData.recipient.interests.filter((_, i) => i !== idx)
                }
              })}
              placeholder="e.g., technology, fitness"
            />

            <ChipInput
              label="Purchase History"
              items={formData.recipient.purchase_history}
              onAdd={(item) => setFormData({
                ...formData,
                recipient: { ...formData.recipient, purchase_history: [...formData.recipient.purchase_history, item] }
              })}
              onRemove={(idx) => setFormData({
                ...formData,
                recipient: {
                  ...formData.recipient,
                  purchase_history: formData.recipient.purchase_history.filter((_, i) => i !== idx)
                }
              })}
              placeholder="e.g., Running Shoes, Fitness Tracker"
            />
          </div>

          {/* Brand & Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Brand
              </label>
              <select
                value={formData.brand_id || ''}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value || null })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 outline-none"
              >
                <option value="">No brand (generic)</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Target Audience
              </label>
              <select
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 outline-none"
              >
                <option value="adults">Adults</option>
                <option value="young adults">Young Adults</option>
                <option value="professionals">Professionals</option>
                <option value="parents">Parents</option>
                <option value="seniors">Seniors</option>
                <option value="tech enthusiasts">Tech Enthusiasts</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Variants to Generate
              </label>
              <select
                value={formData.generate_variants}
                onChange={(e) => setFormData({ ...formData, generate_variants: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 outline-none"
              >
                <option value={1}>1 variant</option>
                <option value={2}>2 variants</option>
                <option value={3}>3 variants</option>
                <option value={4}>4 variants</option>
                <option value={5}>5 variants</option>
              </select>
            </div>
          </div>

          {/* Emoji Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="include_emojis"
              checked={formData.include_emojis}
              onChange={(e) => setFormData({ ...formData, include_emojis: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="include_emojis" className="text-sm text-slate-700">
              Include emojis in email content
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handlePreview}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all disabled:opacity-50"
            >
              <Eye size={20} />
              Preview Email
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Email Variants
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailComposer;
