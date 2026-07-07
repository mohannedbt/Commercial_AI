import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Loader2, 
  Copy, 
  Check, 
  AlertCircle, 
  Tag, 
  Users, 
  DollarSign, 
  Gift, 
  FileText,
  Instagram,
  Twitter,
  Facebook,
  Hash
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const Post = ({ selectedBrandId }) => {
  // Form States
  const [productId, setProductId] = useState(1);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productOffer, setProductOffer] = useState('');
  const [targetAudience, setTargetAudience] = useState('adults');
  const [productDescription, setProductDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Available brands for selection
  const [brands, setBrands] = useState([]);
  const [brandId, setBrandId] = useState(selectedBrandId || null);
  
  // Status States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState(null);
  const [error, setError] = useState(null);
  const [copiedPlatform, setCopiedPlatform] = useState(null);

  const API_BASE = `${API_BASE_URL}/api`;

  // Fetch available brands on mount
  useEffect(() => {
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
    fetchBrands();
  }, []);

  // Update brandId when selectedBrandId prop changes
  useEffect(() => {
    if (selectedBrandId) {
      setBrandId(selectedBrandId);
    }
  }, [selectedBrandId]);

  const handleGeneratePosts = async () => {
    if (!productName || !productDescription) {
      setError("Please fill in at least the product name and description!");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedPosts(null);

    try {
      const response = await fetch(`${API_BASE}/generate-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          name: productName,
          price: parseFloat(productPrice) || 0,
          offer: productOffer,
          target_audience: targetAudience,
          description: productDescription,
          brand_id: brandId ? parseInt(brandId) : null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        const errMsg = errData.detail || "Generation failed";
        throw new Error(errMsg);
      }

      const data = await response.json();
      setGeneratedPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text, platform) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram size={20} className="text-pink-500" />;
      case 'twitter':
        return <Twitter size={20} className="text-sky-400" />;
      case 'facebook':
        return <Facebook size={20} className="text-blue-500" />;
      default:
        return <FileText size={20} />;
    }
  };

  const getPlatformGradient = (platform) => {
    switch (platform) {
      case 'instagram':
        return 'from-pink-500/20 to-purple-500/20 border-pink-500/30';
      case 'twitter':
        return 'from-sky-500/20 to-blue-500/20 border-sky-500/30';
      case 'facebook':
        return 'from-blue-500/20 to-indigo-500/20 border-blue-500/30';
      default:
        return 'from-slate-500/20 to-slate-600/20 border-slate-500/30';
    }
  };

  const PostCard = ({ platform, post, hashtags }) => (
    <div className={`bg-gradient-to-br ${getPlatformGradient(platform)} rounded-2xl p-6 border backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getPlatformIcon(platform)}
          <span className="font-bold capitalize text-white">{platform}</span>
        </div>
        <button
          onClick={() => copyToClipboard(`${post}\n\n${hashtags.map(h => `#${h}`).join(' ')}`, platform)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          title="Copy to clipboard"
        >
          {copiedPlatform === platform ? (
            <Check size={16} className="text-emerald-500" />
          ) : (
            <Copy size={16} className="text-slate-500" />
          )}
        </button>
      </div>
      
      <p className="text-slate-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
        {post}
      </p>
      
      {hashtags && hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hashtags.map((tag, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600"
            >
              <Hash size={10} />
              {tag.replace('#', '')}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Input Form */}
        <div className="space-y-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
              <Send size={18} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800">Post Generator</h2>
              <p className="text-slate-500 text-xs">Create engaging social media content</p>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 flex items-center gap-2">
              <Tag size={12} /> Product Name *
            </label>
            <input 
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              placeholder="e.g. Apex Wireless Pro Headphones"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          {/* Price & Offer Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 flex items-center gap-2">
                <DollarSign size={12} /> Price
              </label>
              <input 
                type="number"
                step="0.01"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="99.99"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 flex items-center gap-2">
                <Gift size={12} /> Special Offer
              </label>
              <input 
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="e.g. 20% off this week"
                value={productOffer}
                onChange={(e) => setProductOffer(e.target.value)}
              />
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 flex items-center gap-2">
              <Users size={12} /> Target Audience
            </label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            >
              <option value="adults">Adults</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="teenagers">Teenagers</option>
              <option value="parents">Parents</option>
            </select>
          </div>

          {/* Brand Selection */}
          {brands.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 flex items-center gap-2">
                Brand Profile (Optional)
              </label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
                value={brandId || ''}
                onChange={(e) => setBrandId(e.target.value || null)}
              >
                <option value="">No brand - Generic content</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 underline decoration-indigo-500/50 underline-offset-4">
              Product Description *
            </label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none h-32 resize-none transition-all"
              placeholder="Describe your product features, benefits, and unique selling points..."
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
            />
          </div>

          {/* Image URL (Optional) */}
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">
              Image URL (Optional)
            </label>
            <input 
              type="url"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              placeholder="https://example.com/product-image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          {/* Generate Button */}
          <button 
            onClick={handleGeneratePosts}
            disabled={isGenerating || !productName || !productDescription}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/30"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Generating Posts...
              </>
            ) : (
              <>
                <Send size={18} />
                Generate Social Media Posts
              </>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-[11px] flex items-start gap-2 animate-in slide-in-from-bottom-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> 
              <span><strong>Error:</strong> {error}</span>
            </div>
          )}
        </div>

        {/* Right: Generated Posts Output */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">
            Generated Content
          </h3>
          
          {isGenerating ? (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[400px] shadow-lg">
              <Loader2 className="animate-spin mb-4 text-indigo-600" size={40} />
              <p className="text-sm font-medium text-slate-700">Crafting engaging posts for "{productName}"...</p>
              <p className="text-xs text-slate-500 mt-2">This may take a few seconds</p>
            </div>
          ) : generatedPosts ? (
            <div className="space-y-4">
              {generatedPosts.posts?.instagram && (
                <PostCard 
                  platform="instagram" 
                  post={generatedPosts.posts.instagram.post} 
                  hashtags={generatedPosts.posts.instagram.hashtags || []} 
                />
              )}
              {generatedPosts.posts?.twitter && (
                <PostCard 
                  platform="twitter" 
                  post={generatedPosts.posts.twitter.post} 
                  hashtags={generatedPosts.posts.twitter.hashtags || []} 
                />
              )}
              {generatedPosts.posts?.facebook && (
                <PostCard 
                  platform="facebook" 
                  post={generatedPosts.posts.facebook.post} 
                  hashtags={generatedPosts.posts.facebook.hashtags || []} 
                />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="flex gap-4 mb-6 text-slate-300">
                <Instagram size={32} />
                <Twitter size={32} />
                <Facebook size={32} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black italic text-slate-400">
                Fill the form to generate<br />platform-optimized posts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
