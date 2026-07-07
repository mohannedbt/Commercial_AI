import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Send } from 'lucide-react';

const Hero = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-indigo-50 text-slate-900 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-400/20 blur-[120px] rounded-full" />

      <nav className="relative z-10 flex justify-between items-center px-10 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-slate-800">ARCHITECT PRO</span>
        </div>
        <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
          Sign In
        </Link>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center pt-32 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mt-8 text-6xl md:text-8xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
            Visual Ads. <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Engineered by AI.
            </span>
          </h1>
          <p className="mt-8 text-slate-600 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            The all-in-one workstation to remove backgrounds, generate cinematic product shots, and write conversion-optimized copy in seconds.
          </p>

          <div className="mt-12 flex flex-col md:flex-row gap-6 justify-center">
            <Link to="/dashboard">
              <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg flex items-center gap-2 transition-all hover:scale-105 shadow-2xl shadow-indigo-500/30">
                Launch Dashboard <ArrowRight size={20} />
              </button>
            </Link>
            <button className="px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-lg transition-all shadow-lg">
              View Showcase
            </button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pb-20"
        >
          <Feature icon={<Zap className="text-amber-500" />} title="Instant BG Removal" desc="Automated studio lighting and background replacement." />
          <Feature icon={<ShieldCheck className="text-emerald-500" />} title="Brand Consistency" desc="AI extracts your DNA to keep every ad on-brand." />
          <Feature icon={<Send className="text-indigo-600" />} title="Email Ready" desc="One-click campaign drafts for your new visuals." />
        </motion.div>
      </main>
    </div>
  );
};

const Feature = ({ icon, title, desc }) => (
  <div className="p-8 rounded-3xl bg-white border border-slate-200 text-left shadow-lg hover:shadow-xl transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-slate-800">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Hero;