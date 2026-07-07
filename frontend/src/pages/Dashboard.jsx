import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Fingerprint, Send, LayoutDashboard, 
  Settings, LogOut, Image as ImageIcon, Wand2, MessageSquare, Mail 
} from 'lucide-react';
import Post from './Post';


// Core Modules
import VisualArchitect from '../Components/VisualArchitect';
import BrandAlchemist from '../Components/BrandAlchemist';
import CampaignForm from '../Components/CampaignPlanner';
import EmailComposer from '../Components/EmailComposer';

// New Split Workflows
import ProductGenerator from '../Components/ProductRenderer';
import AssetRenderer from '../Components/AssetRenderer';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('visual');
  const [selectedBrandId, setSelectedBrandId] = useState(null);

  const menuItems = [
    { id: 'brand', label: 'Brand Alchemist', icon: <Fingerprint size={20} /> },
    { id: 'visual', label: 'Visual Architect', icon: <Sparkles size={20} /> },
    { id: 'post', label: 'Post Generator', icon: <MessageSquare size={20} /> },
    { id: 'email', label: 'Email Composer', icon: <Mail size={20} /> },
    { id: 'Planner', label: 'Campaign Planner', icon: <Send size={20} /> },
    { id: 'asset', label: 'Asset Renderer', icon: <Wand2 size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col shadow-sm">
        <div className="flex items-center gap-3 font-black text-xl mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <LayoutDashboard size={22} className="text-white" />
          </div>
          <span className="text-slate-800">ARCHITECT</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-semibold transition-all ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-slate-200 space-y-2">
          <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-600 hover:text-slate-900 transition-colors">
            <Settings size={20} /> Settings
          </button>
          {/* <button className="w-full flex items-center gap-4 px-4 py-3 text-rose-500 hover:text-rose-600 transition-colors">
            <LogOut size={20} /> Logout
          </button> */}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <header className="h-20 px-10 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-800">
              {menuItems.find(i => i.id === activeTab).label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-10 px-4 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-sm font-medium text-slate-700 shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                System Online
             </div>
          </div>
        </header>

        <div className="p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl mx-auto"
            >
              {/* Tab Routing Logic */}
              {activeTab === 'visual' && <VisualArchitect selectedBrandId={selectedBrandId} />}
              
              {activeTab === 'product' && (
                <ProductGenerator 
                  selectedBrandId={selectedBrandId} 
                  onImageGenerated={(data) => {
                    console.log("Image saved to session:", data);
                    // Optional: Auto-switch to asset renderer after generation
                    // setActiveTab('asset'); 
                  }} 
                />
              )}

              {activeTab === 'asset' && <AssetRenderer selectedBrandId={selectedBrandId} />}

              {activeTab === 'post' && <Post selectedBrandId={selectedBrandId} />}

              {activeTab === 'email' && <EmailComposer selectedBrandId={selectedBrandId} />}

              {activeTab === 'brand' && <BrandAlchemist />}

              {activeTab === 'Planner' && (
                <CampaignForm onCampaignGenerated={(res) => console.log("Campaign Plan:", res)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;