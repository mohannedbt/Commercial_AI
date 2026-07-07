import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2, Download, AlertCircle, Image as ImageIcon, Users, Tag } from 'lucide-react';
import { API_BASE_URL } from '../config';

const VisualArchitect = ({ selectedBrandId }) => {
  // Input States
  const [productName, setProductName] = useState('');
  const [productPrompt, setProductPrompt] = useState('');
  const [targetAudience, setTargetAudience] = useState('adults'); 
  const [style, setStyle] = useState('Minimalist Luxury');
  
  // Status States
  const [generatedBase64, setGeneratedBase64] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [finalAdUrl, setFinalAdUrl] = useState(null);
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);
  const [error, setError] = useState(null);

  // Note: Match this to your FastAPI port
  const API_BASE = `${API_BASE_URL}/api`;

  // --- Step 1: Generate the base product image (Text-to-Image) ---
  const handleGenerateImage = async () => {
    if (!productName || !productPrompt) return setError("Fill in Name and Description!");
    
    setIsGeneratingImage(true);
    setError(null);
    setGeneratedBase64(null);
    setFinalAdUrl(null);

    try {
      const response = await fetch(`${API_BASE}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: productName,
          product_description: productPrompt,
          target_audience: targetAudience,
          brand_id: selectedBrandId ? parseInt(selectedBrandId) : null,
          style: style,
          aspect_ratio: "1:1",
          include_text: false
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Generation failed");
      }

      const data = await response.json();
      setGeneratedBase64(data.image_base64);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // --- Step 2: Render Final Ad Asset (Playwright Screenshot) ---
  const handleGenerateFinalAd = async () => {
    if (!generatedBase64) return;
    setIsGeneratingAd(true);
    setError(null);
    
    try {
      // 1. Convert Base64 string to a physical Blob (File)
      const byteCharacters = atob(generatedBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'image/png' });
      
      // 2. Prepare FormData for the AdService
      const formData = new FormData();
      formData.append("product", productName);
      formData.append("description", productPrompt);
      formData.append("target_audience", targetAudience);
      formData.append("style", style);
      formData.append("remove_bg", "true"); // Tells backend to run ultra_cutout
      formData.append("image_file", blob, "ai_product.png"); 
      
      if (selectedBrandId) {
        formData.append("brand_id", selectedBrandId);
      }

      // 3. Request the Playwright screenshot from the backend
      const response = await fetch(`${API_BASE}/generate-ad`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Playwright render failed. Check server logs.");

      // 4. Get the resulting PNG and create a local URL for the <img> tag
      const adBlob = await response.blob();
      setFinalAdUrl(URL.createObjectURL(adBlob));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGeneratingAd(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Input Controls */}
        <div className="space-y-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg">
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 flex items-center gap-2">
              <Tag size={12} /> Product Name
            </label>
            <input 
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. Apex Wireless Pro"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 underline decoration-indigo-500/50 underline-offset-4">
              Detailed Description
            </label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 outline-none h-32 resize-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Describe the product look, material, and lighting..."
              value={productPrompt}
              onChange={(e) => setProductPrompt(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 flex items-center gap-2">
              <Users size={12} /> Target Audience
            </label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none cursor-pointer focus:border-indigo-500"
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

          <button 
            onClick={handleGenerateImage}
            disabled={isGeneratingImage || !productPrompt || !productName}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
          >
            {isGeneratingImage ? <Loader2 className="animate-spin" /> : <ImageIcon size={18} />}
            1. Generate Base Product
          </button>

          {generatedBase64 && (
            <div className="pt-6 border-t border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-4">
               <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">Composition Style</label>
               <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-indigo-500"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  <option>Minimalist Luxury</option>
                  <option>Cyberpunk Tech</option>
                  <option>Editorial Fashion</option>
                  <option>Natural/Organic</option>
                </select>
               <button 
                onClick={handleGenerateFinalAd}
                disabled={isGeneratingAd}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-purple-600/20 hover:bg-purple-700 transition-all"
              >
                {isGeneratingAd ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                2. Capture Playwright Render
              </button>
            </div>
          )}
        </div>

        {/* Right: Visual Preview Area */}
        <div className="space-y-4">
          {/* This is the container div for the Playwright output */}
          <div className="aspect-square bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative shadow-inner">
            {isGeneratingImage && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-white p-6 text-center">
                <Loader2 className="animate-spin mb-4 text-indigo-500" size={40} />
                <p className="text-sm font-medium">Imagining "{productName}"...</p>
              </div>
            )}
            
            {isGeneratingAd && (
              <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-md z-10 flex flex-col items-center justify-center text-white">
                <Sparkles className="animate-pulse mb-4 text-yellow-400" size={40} />
                <p className="text-sm font-medium">Capturing Playwright Screenshot...</p>
              </div>
            )}
            
            {finalAdUrl ? (
               <div className="ad-container w-full h-full">
                 <img 
                   src={finalAdUrl} 
                   className="w-full h-full object-cover animate-in zoom-in-95" 
                   alt="Final Playwright Render" 
                 />
               </div>
            ) : generatedBase64 ? (
               <img src={`data:image/png;base64,${generatedBase64}`} className="w-full h-full object-contain p-8" alt="Base Product" />
            ) : (
              <div className="text-center text-slate-700">
                <ImageIcon size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-[10px] uppercase tracking-[0.2em] font-black italic">Awaiting Creative Vision</p>
              </div>
            )}
          </div>

          {finalAdUrl && (
            <button 
              onClick={() => { const a = document.createElement('a'); a.href = finalAdUrl; a.download=`${productName}_ad.png`; a.click(); }}
              className="w-full py-3 bg-white/5 text-white rounded-xl text-xs font-bold border border-white/5 flex items-center justify-center gap-2"
            >
              <Download size={14} /> Download PNG Screenshot
            </button>
          )}

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[11px] flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> 
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualArchitect;