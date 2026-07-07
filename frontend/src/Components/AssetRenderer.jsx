import React, { useState, useRef } from 'react';
import { Wand2, Loader2, Download, Sparkles, Upload, Image as ImageIcon, X } from 'lucide-react';

const AssetRenderer = ({ selectedBrandId }) => {
  const [style, setStyle] = useState('Minimalist Luxury');
  const [productName, setProductName] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [finalAdUrl, setFinalAdUrl] = useState(null);
  
  // State for manual image upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadPreview(URL.createObjectURL(file));
      setFinalAdUrl(null); // Reset result if new image is uploaded
    }
  };

  const handleRender = async () => {
    if (!selectedFile || !productName) return alert("Please provide a product name and image!");
    
    setIsRendering(true);
    try {
      const formData = new FormData();
      formData.append("product", productName);
      formData.append("style", style);
      formData.append("image_file", selectedFile); 
      
      if (selectedBrandId) {
        formData.append("brand_id", selectedBrandId);
      }

      const response = await fetch("http://127.0.0.1:8000/api/generate-ad", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Render failed");

      const adBlob = await response.blob();
      setFinalAdUrl(URL.createObjectURL(adBlob));
    } catch (err) {
      console.error("Rendering error:", err);
    } finally {
      setIsRendering(false);
    }
  };

  const clearUpload = () => {
    setSelectedFile(null);
    setUploadPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Left: Input Form */}
      <div className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Wand2 size={20} />
          </div>
          <h3 className="text-slate-800 font-bold text-lg">Ad Composition Form</h3>
        </div>
        
        {/* Product Name Input */}
        <div>
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 px-1">Product Name</label>
          <input 
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Vintage Leather Watch"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Custom Image Upload Area */}
        <div>
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 px-1">Source Image</label>
          {!uploadPreview ? (
            <div 
              onClick={() => fileInputRef.current.click()}
              className="group cursor-pointer w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
            >
              <Upload className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <p className="text-xs text-slate-500 font-medium">Click to upload product photo</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          ) : (
            <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-slate-200">
              <img src={uploadPreview} className="w-full h-full object-contain bg-slate-100" alt="Preview" />
              <button 
                onClick={clearUpload}
                className="absolute top-2 right-2 p-1.5 bg-slate-800/60 hover:bg-rose-600 text-white rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Style Selection */}
        <div>
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 px-1">Visual Theme</label>
          <select 
            value={style} 
            onChange={(e) => setStyle(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none cursor-pointer focus:border-indigo-500 transition-all"
          >
            <option>Minimalist Luxury</option>
            <option>Cyberpunk Tech</option>
            <option>Editorial Fashion</option>
            <option>Natural / Organic</option>
          </select>
        </div>

        <button 
          onClick={handleRender} 
          disabled={isRendering || !selectedFile || !productName} 
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isRendering ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Compose Final Ad</>}
        </button>
      </div>

      {/* Right: Output Preview Area */}
      <div className="space-y-4">
        <div className="aspect-square bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative shadow-inner">
          {isRendering && (
            <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
               <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
               <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest animate-pulse">Rendering via Playwright...</p>
            </div>
          )}
          
          {finalAdUrl ? (
            <img src={finalAdUrl} className="w-full h-full object-cover animate-in zoom-in-95 duration-500" alt="Generated Ad" />
          ) : (
            <div className="text-center text-slate-400">
              <ImageIcon size={80} className="mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-[0.3em]">Result Preview</p>
            </div>
          )}
        </div>

        {finalAdUrl && (
          <button 
            onClick={() => {
              const a = document.createElement('a');
              a.href = finalAdUrl;
              a.download = `${productName.replace(/\s+/g, '_')}_ad.png`;
              a.click();
            }}
            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Download size={18} /> Download High-Res PNG
          </button>
        )}
      </div>
    </div>
  );
};

export default AssetRenderer;