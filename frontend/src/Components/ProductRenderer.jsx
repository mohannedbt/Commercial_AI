import React, { useState } from 'react';
import { ImageIcon, Loader2, Tag, Users, ArrowRight } from 'lucide-react';

const ProductGenerator = ({ onImageGenerated, selectedBrandId }) => {
  const [productName, setProductName] = useState('');
  const [productPrompt, setProductPrompt] = useState('');
  const [targetAudience, setTargetAudience] = useState('adults');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: productName,
          product_description: productPrompt,
          target_audience: targetAudience,
          brand_id: selectedBrandId ? parseInt(selectedBrandId) : null,
          style: "Studio Lighting",
          aspect_ratio: "1:1"
        }),
      });
      const data = await response.json();
      setPreview(data.image_base64);
      // Pass the data back to the parent Dashboard to unlock Workflow 2
      onImageGenerated({ base64: data.image_base64, name: productName, prompt: productPrompt, audience: targetAudience });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-lg">
        <h3 className="text-slate-800 font-bold flex items-center gap-2 text-lg"><ImageIcon className="text-indigo-600" /> 1. Product Concept</h3>
        
        <div>
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Product Name</label>
          <input value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="Apex Wireless Pro" />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Visual Prompt</label>
          <textarea value={productPrompt} onChange={(e) => setProductPrompt(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 outline-none h-32 resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="Describe the materials and lighting..." />
        </div>

        <button onClick={handleGenerate} disabled={isGenerating || !productName} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
          {isGenerating ? <Loader2 className="animate-spin" /> : "Imagine Product"}
        </button>
      </div>

      <div className="aspect-square bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
        {preview ? <img src={`data:image/png;base64,${preview}`} className="w-full h-full object-contain p-8" /> : <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Awaiting Concept</p>}
      </div>
    </div>
  );
};

export default ProductGenerator;