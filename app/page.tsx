'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplets, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Settings, 
  FileText, 
  Download,
  Info,
  Wind,
  CloudRain,
  Waves,
  Activity,
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Cpu,
  Database,
  Globe,
  Map as MapIcon,
  Search,
  Bell,
  User,
  LayoutDashboard,
  History,
  HelpCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend,
  ReferenceLine
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { calculateSimulation, DamInputs, SimulationResult } from '@/lib/simulation';
import { cn } from '@/lib/utils';

// --- UI Components ---

const Card = ({ children, className, title, icon: Icon, subtitle }: { children: React.ReactNode, className?: string, title?: string, icon?: any, subtitle?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-white/60 overflow-hidden", className)}
  >
    {(title || Icon) && (
      <div className="px-8 py-6 border-b border-slate-100/50 flex items-center justify-between bg-slate-50/40">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="p-2.5 bg-blue-600/10 rounded-2xl">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <div>
            <h3 className="font-display font-black text-slate-800 tracking-tight text-lg">
              {title}
            </h3>
            {subtitle && <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
    )}
    <div className="p-8">{children}</div>
  </motion.div>
);

const StatCard = ({ label, value, unit, icon: Icon, colorClass, trend, trendValue }: { label: string, value: string | number, unit?: string, icon: any, colorClass: string, trend?: 'up' | 'down' | 'stable', trendValue?: string }) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-6 relative overflow-hidden group transition-all duration-500"
  >
    <div className="absolute -top-4 -right-4 p-12 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700">
      <Icon className="w-32 h-32" />
    </div>
    <div className="flex items-center justify-between relative z-10">
      <div className={cn("p-4 rounded-[1.5rem] shadow-lg shadow-current/10", colorClass)}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", 
          trend === 'up' ? "bg-red-50 text-red-600" : trend === 'down' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
        )}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingUp className="w-3 h-3 rotate-180" /> : <Activity className="w-3 h-3" />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-display font-black text-slate-900 tracking-tighter">{value}</span>
        {unit && <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{unit}</span>}
      </div>
    </div>
  </motion.div>
);

const RiskGauge = ({ score, status }: { score: number, status: string }) => {
  const getColors = () => {
    if (score > 80) return { stroke: '#ef4444', bg: 'bg-red-50', text: 'text-red-600', shadow: 'shadow-red-200' };
    if (score > 50) return { stroke: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600', shadow: 'shadow-amber-200' };
    return { stroke: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600', shadow: 'shadow-emerald-200' };
  };
  const colors = getColors();
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
          <motion.circle 
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: "circOut" }}
            cx="80" cy="80" r={radius} stroke={colors.stroke} strokeWidth="10" fill="transparent" strokeDasharray={circumference} strokeLinecap="round" 
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-display font-black text-slate-900 tracking-tighter"
          >
            {score.toFixed(0)}
          </motion.span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Risk Index</span>
        </div>
      </div>
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn("px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] border-2 shadow-lg", colors.bg, colors.text, `border-${colors.stroke}/20`, colors.shadow)}
      >
        {status}
      </motion.div>
    </div>
  );
};

const ActionCard = ({ action }: { action: SimulationResult['recommendedAction'] }) => {
  const config = {
    'No action required': { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', desc: 'Hydrological conditions are within safe operational parameters. Continue standard monitoring.' },
    'Start gradual release': { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', desc: 'Pre-emptive controlled release recommended to mitigate upcoming inflow surge.' },
    'Immediate controlled release required': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', desc: 'Critical threshold breach imminent. Activate emergency discharge protocols immediately.' },
  }[action];

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("p-8 rounded-[2.5rem] border-2 flex items-start gap-6 shadow-xl transition-all duration-500", config.bg, config.border)}
    >
      <div className={cn("p-4 rounded-2xl bg-white shadow-lg", config.color)}>
        <config.icon className="w-10 h-10" />
      </div>
      <div>
        <h4 className={cn("text-xl font-display font-black tracking-tight mb-2", config.color)}>{action}</h4>
        <p className="text-sm font-bold text-slate-600/80 leading-relaxed max-w-md">{config.desc}</p>
      </div>
    </motion.div>
  );
};

const InputField = ({ label, icon: Icon, ...props }: { label: string, icon: any } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
      <Icon className="w-3 h-3" /> {label}
    </label>
    <div className="relative group">
      <input 
        {...props}
        className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50/30 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
      />
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
      </div>
    </div>
  </div>
);

// --- Main Application ---

export default function DamMitraApp() {
  const [inputs, setInputs] = useState<DamInputs>({
    reservoirName: "Bhakra Nangal Dam",
    currentLevel: 72,
    inflow: 550,
    outflow: 400,
    rainfall: 45,
    catchmentWetness: 1.0,
    safeDischarge: 1500,
    capacity: 9340,
    forecastHorizon: 24,
  });

  const [recommendation, setRecommendation] = useState<string>("Initializing hydrological analysis engine...");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'level' | 'discharge'>('level');
  const [systemHealth, setSystemHealth] = useState(98);

  const unplannedResult = useMemo(() => calculateSimulation(inputs, false), [inputs]);
  const optimizedResult = useMemo(() => calculateSimulation(inputs, true), [inputs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: name === 'reservoirName' ? value : parseFloat(value) || 0
    }));
  };

  const applyPreset = (preset: 'moderate' | 'heavy' | 'extreme') => {
    const presets = {
      moderate: { currentLevel: 65, rainfall: 30, catchmentWetness: 0.6, inflow: 400 },
      heavy: { currentLevel: 78, rainfall: 95, catchmentWetness: 1.0, inflow: 850 },
      extreme: { currentLevel: 92, rainfall: 180, catchmentWetness: 1.4, inflow: 1600 },
    };
    setInputs(prev => ({ ...prev, ...presets[preset] }));
  };

  useEffect(() => {
    const generateRecommendation = async () => {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) return;
      setIsGenerating(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
        const model = ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `As an expert hydrologist for DamMitra AI, analyze these conditions for ${inputs.reservoirName}:
          - Current Level: ${inputs.currentLevel}%
          - Forecast Rainfall: ${inputs.rainfall}mm
          - Catchment: ${inputs.catchmentWetness > 1 ? 'Saturated' : 'Normal'}
          - AI Prediction: Peak Level ${optimizedResult.peakLevel.toFixed(1)}%, Peak Discharge ${optimizedResult.peakDischarge.toFixed(0)} m3/s.
          - Safe Limit: ${inputs.safeDischarge} m3/s.
          
          Provide a professional, data-driven recommendation in one concise paragraph. Mention specific discharge rates if needed.`,
        });
        const response = await model;
        setRecommendation(response.text || "Recommendation unavailable.");
      } catch (error) {
        setRecommendation(`Based on current inflow of ${inputs.inflow} m³/s and rainfall of ${inputs.rainfall}mm, a ${optimizedResult.recommendedAction === 'No action required' ? 'stable monitoring' : 'proactive release'} strategy is recommended. Peak level projected at ${optimizedResult.peakLevel.toFixed(1)}%.`);
      } finally {
        setIsGenerating(false);
      }
    };

    const timer = setTimeout(generateRecommendation, 1500);
    return () => clearTimeout(timer);
  }, [inputs, optimizedResult.peakLevel, optimizedResult.peakDischarge, optimizedResult.recommendedAction]);

  const chartData = useMemo(() => {
    return optimizedResult.steps.map((step, i) => ({
      hour: step.hour,
      levelOptimized: step.level,
      levelUnplanned: unplannedResult.steps[i].level,
      outflowOptimized: step.outflow,
      outflowUnplanned: unplannedResult.steps[i].outflow,
      inflow: step.inflow,
      safeLimit: inputs.safeDischarge,
    }));
  }, [optimizedResult, unplannedResult, inputs.safeDischarge]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] selection:bg-blue-200 selection:text-blue-900 font-sans">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-200/40 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] bg-indigo-200/20 blur-[100px] rounded-full" />
      </div>

      {/* Navigation Sidebar (Mock) */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-200 z-50 hidden xl:flex flex-col items-center py-8 gap-10">
        <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-200">
          <Waves className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col gap-6">
          <button className="p-3 rounded-2xl bg-blue-50 text-blue-600 transition-all"><LayoutDashboard className="w-6 h-6" /></button>
          <button className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"><MapIcon className="w-6 h-6" /></button>
          <button className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"><History className="w-6 h-6" /></button>
          <button className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"><Bell className="w-6 h-6" /></button>
        </div>
        <div className="mt-auto flex flex-col gap-6">
          <button className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"><Settings className="w-6 h-6" /></button>
          <button className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"><User className="w-6 h-6" /></button>
        </div>
      </nav>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 xl:ml-20">
        <div className="max-w-[1600px] mx-auto px-10 h-24 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="xl:hidden bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
              <Waves className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-black text-slate-900 tracking-tighter leading-none">DamMitra AI</h1>
              <div className="text-[11px] uppercase tracking-[0.4em] font-black text-blue-600 mt-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                Intelligent Hydro-Management System
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-6 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Status</span>
                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">All Systems Nominal</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Sync</span>
                <span className="text-xs font-bold text-slate-600">Just Now</span>
              </div>
            </div>
            <button 
              onClick={() => window.print()}
              className="group flex items-center gap-3 px-8 py-4 text-sm font-black text-white bg-slate-900 hover:bg-blue-600 rounded-2xl transition-all shadow-2xl shadow-slate-300 hover:shadow-blue-200 active:scale-95"
            >
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              Export Intelligence Report
            </button>
          </div>
        </div>
      </header>

      {/* Live Ticker */}
      <div className="bg-blue-600 text-white py-2 overflow-hidden xl:ml-20">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="mx-10 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
              <Activity className="w-3 h-3" /> System Update: Inflow patterns stabilized at {inputs.reservoirName} &bull; 
              <CloudRain className="w-3 h-3" /> Weather Alert: Heavy precipitation forecast for catchment zone A &bull; 
              <ShieldCheck className="w-3 h-3" /> AI Optimization: Release schedule synchronized with downstream safety limits &bull;
            </span>
          ))}
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-10 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 xl:ml-20">
        
        {/* Left Sidebar: Controls (30%) */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-10">
          <Card title="Control Center" icon={Settings} subtitle="Simulation Parameters">
            <div className="space-y-8">
              <InputField 
                label="Reservoir Identity" 
                icon={Globe} 
                name="reservoirName" 
                value={inputs.reservoirName} 
                onChange={handleInputChange} 
                placeholder="Enter Dam Name..."
              />

              <div className="grid grid-cols-2 gap-6">
                <InputField 
                  label="Water Level (%)" 
                  icon={Droplets} 
                  type="number" 
                  name="currentLevel" 
                  value={inputs.currentLevel} 
                  onChange={handleInputChange} 
                />
                <InputField 
                  label="Rainfall (mm)" 
                  icon={CloudRain} 
                  type="number" 
                  name="rainfall" 
                  value={inputs.rainfall} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <InputField 
                  label="Inflow (m³/s)" 
                  icon={Activity} 
                  type="number" 
                  name="inflow" 
                  value={inputs.inflow} 
                  onChange={handleInputChange} 
                />
                <InputField 
                  label="Safe Limit" 
                  icon={ShieldCheck} 
                  type="number" 
                  name="safeDischarge" 
                  value={inputs.safeDischarge} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                  <Database className="w-3 h-3" /> Catchment Saturation
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Dry', val: 0.6, color: 'emerald' },
                    { label: 'Normal', val: 1.0, color: 'blue' },
                    { label: 'Saturated', val: 1.4, color: 'red' }
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setInputs(p => ({ ...p, catchmentWetness: opt.val }))}
                      className={cn(
                        "py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-300",
                        inputs.catchmentWetness === opt.val 
                          ? `bg-${opt.color}-600 border-${opt.color}-600 text-white shadow-xl shadow-${opt.color}-200` 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 px-1">Rapid Deployment Scenarios</p>
                <div className="flex flex-col gap-4">
                  <button onClick={() => applyPreset('moderate')} className="group flex items-center justify-between p-5 rounded-3xl bg-emerald-50/40 border border-emerald-100/50 hover:bg-emerald-50 hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm"><ShieldCheck className="w-4 h-4 text-emerald-600" /></div>
                      <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Moderate Flow</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={() => applyPreset('heavy')} className="group flex items-center justify-between p-5 rounded-3xl bg-amber-50/40 border border-amber-100/50 hover:bg-amber-50 hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm"><AlertTriangle className="w-4 h-4 text-amber-600" /></div>
                      <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Monsoon Surge</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={() => applyPreset('extreme')} className="group flex items-center justify-between p-5 rounded-3xl bg-red-50/40 border border-red-100/50 hover:bg-red-50 hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm"><Zap className="w-4 h-4 text-red-600" /></div>
                      <span className="text-xs font-black text-red-700 uppercase tracking-widest">Emergency Event</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Risk Assessment" icon={AlertTriangle} subtitle="Real-time Analysis">
            <div className="flex flex-col items-center py-6">
              <RiskGauge score={optimizedResult.floodRiskScore} status={optimizedResult.status} />
              
              <div className="w-full mt-10 grid grid-cols-2 gap-6">
                <div className="p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 text-center group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Peak Level</p>
                  <p className="text-2xl font-display font-black text-slate-800 tracking-tighter group-hover:text-blue-600 transition-colors">{optimizedResult.peakLevel.toFixed(1)}%</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 text-center group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Peak Flow</p>
                  <p className="text-2xl font-display font-black text-slate-800 tracking-tighter group-hover:text-blue-600 transition-colors">{optimizedResult.peakDischarge.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </Card>
        </aside>

        {/* Right Content: Dashboard (70%) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-12">
          
          {/* Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            <StatCard 
              label="Operational Status" 
              value={optimizedResult.status} 
              icon={ShieldCheck} 
              colorClass="bg-blue-600 text-white" 
              trend="stable"
              trendValue="Nominal"
            />
            <StatCard 
              label="Predicted Inflow" 
              value={(inputs.inflow + inputs.rainfall * inputs.catchmentWetness * 5).toFixed(0)} 
              unit="m³/s" 
              icon={CloudRain} 
              colorClass="bg-cyan-500 text-white" 
              trend="up"
              trendValue="+14%"
            />
            <StatCard 
              label="Downstream Stress" 
              value={((optimizedResult.peakDischarge / inputs.safeDischarge) * 100).toFixed(0)} 
              unit="%" 
              icon={TrendingUp} 
              colorClass="bg-indigo-600 text-white" 
              trend="stable"
              trendValue="Managed"
            />
            <StatCard 
              label="AI Optimization" 
              value={Math.max(0, ((unplannedResult.peakDischarge - optimizedResult.peakDischarge) / unplannedResult.peakDischarge * 100)).toFixed(0)} 
              unit="%" 
              icon={Zap} 
              colorClass="bg-emerald-500 text-white" 
              trend="down"
              trendValue="-22% Risk"
            />
          </div>

          {/* Action & Intelligence Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <ActionCard action={optimizedResult.recommendedAction} />
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-white/10"
            >
              <div className="absolute -top-10 -right-10 p-20 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
                <Wind className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10">
                      <Cpu className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-xl tracking-tight">AI Strategy Insight</h3>
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">Neural Processing Active</p>
                    </div>
                  </div>
                  {isGenerating && <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />}
                </div>
                <div className="relative">
                  <p className="text-blue-50 text-base font-medium leading-relaxed italic pr-12">
                    &quot;{recommendation}&quot;
                  </p>
                  <div className="absolute bottom-0 right-0 p-2 bg-blue-500/20 rounded-lg backdrop-blur-md border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visualization Section */}
          <div className="space-y-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
              <div className="flex items-center gap-3 p-1.5 bg-slate-200/50 rounded-[1.5rem] backdrop-blur-sm border border-white/50">
                <button 
                  onClick={() => setActiveTab('level')}
                  className={cn("px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500", 
                    activeTab === 'level' ? "bg-white shadow-xl text-blue-600 scale-105" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Reservoir Level
                </button>
                <button 
                  onClick={() => setActiveTab('discharge')}
                  className={cn("px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500", 
                    activeTab === 'discharge' ? "bg-white shadow-xl text-blue-600 scale-105" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Discharge Flow
                </button>
              </div>
              <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-1.5 rounded-full bg-blue-600 shadow-lg shadow-blue-200" /> AI Optimized
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-1.5 rounded-full bg-red-400 shadow-lg shadow-red-200" /> Manual Control
                </div>
              </div>
            </div>

            <Card className="p-0 overflow-visible border-none bg-transparent shadow-none">
              <div className="h-[500px] w-full p-8 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white/60 relative">
                <div className="absolute top-8 right-8 flex items-center gap-2">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100"><BarChart3 className="w-4 h-4 text-slate-400" /></div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  {activeTab === 'level' ? (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} domain={[0, 110]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      />
                      <Area type="monotone" dataKey="levelOptimized" name="AI Level" stroke="#2563eb" strokeWidth={5} fillOpacity={1} fill="url(#colorLevel)" />
                      <Line type="monotone" dataKey="levelUnplanned" name="Manual Level" stroke="#ef4444" strokeWidth={3} strokeDasharray="8 8" dot={false} />
                      <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} label={{ position: 'right', value: 'WARNING THRESHOLD', fill: '#f59e0b', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em' }} />
                      <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} label={{ position: 'right', value: 'CRITICAL LIMIT', fill: '#ef4444', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em' }} />
                    </AreaChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}
                      />
                      <Line type="monotone" dataKey="outflowOptimized" name="AI Discharge" stroke="#2563eb" strokeWidth={5} dot={false} />
                      <Line type="monotone" dataKey="outflowUnplanned" name="Manual Discharge" stroke="#ef4444" strokeWidth={3} strokeDasharray="8 8" dot={false} />
                      <Line type="monotone" dataKey="inflow" name="Predicted Inflow" stroke="#0ea5e9" strokeWidth={2} dot={false} opacity={0.4} />
                      <ReferenceLine y={inputs.safeDischarge} stroke="#10b981" strokeDasharray="12 12" strokeWidth={2} label={{ position: 'top', value: 'SAFE DISCHARGE LIMIT', fill: '#10b981', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em' }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Schedule & Logs */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            <div className="xl:col-span-2">
              <Card title="Operational Protocol" icon={FileText} subtitle="24-Hour Deployment Schedule">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Timeline</th>
                        <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Inflow</th>
                        <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">AI Release</th>
                        <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Level</th>
                        <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {optimizedResult.steps.filter((_, i) => i % 4 === 0).map((step) => (
                        <tr key={step.hour} className="group hover:bg-slate-50/50 transition-all duration-300">
                          <td className="py-6 text-sm font-black text-slate-900 tracking-tight">T+{step.hour}h</td>
                          <td className="py-6 text-sm font-bold text-slate-500">{step.inflow.toFixed(0)}</td>
                          <td className="py-6 text-sm font-black text-blue-600">{step.outflow.toFixed(0)} <span className="text-[9px] font-bold text-blue-400">m³/s</span></td>
                          <td className="py-6 text-sm font-bold text-slate-500">{step.level.toFixed(1)}%</td>
                          <td className="py-6">
                            <div className={cn("inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm", 
                              step.downstreamStress > 100 ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                            )}>
                              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", step.downstreamStress > 100 ? "bg-red-600" : "bg-emerald-600")} />
                              {step.downstreamStress > 100 ? "Alert" : "Safe"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="space-y-10">
              <Card title="System Performance" icon={Cpu} subtitle="Neural Engine Metrics">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peak Mitigation</span>
                      <span className="text-xs font-black text-emerald-600">-{Math.max(0, unplannedResult.peakDischarge - optimizedResult.peakDischarge).toFixed(0)} m³/s</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '72%' }}
                        className="h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-200" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Safety Buffer</span>
                      <span className="text-xs font-black text-blue-600">{(100 - optimizedResult.peakLevel).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '48%' }}
                        className="h-full bg-blue-500 rounded-full shadow-lg shadow-blue-200" 
                      />
                    </div>
                  </div>

                  <div className="pt-6 space-y-4">
                    <div className="flex items-start gap-4 p-5 rounded-3xl bg-blue-50/50 border border-blue-100/50">
                      <div className="p-2 bg-white rounded-xl shadow-sm"><Zap className="w-4 h-4 text-blue-600" /></div>
                      <p className="text-[11px] font-bold text-blue-700 leading-relaxed">
                        Neural engine detected precipitation surge. Initiated pre-release 4.2 hours ahead of peak inflow.
                      </p>
                    </div>
                    <div className="flex items-start gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100">
                      <div className="p-2 bg-white rounded-xl shadow-sm"><Database className="w-4 h-4 text-slate-400" /></div>
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                        Catchment saturation data synchronized with satellite telemetry. Runoff coefficients updated.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="System Health" icon={Activity} subtitle="Hardware Status">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-2">
                    <Cpu className="w-5 h-5 text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CPU Load</span>
                    <span className="text-sm font-black text-slate-800">12.4%</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-2">
                    <Database className="w-5 h-5 text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Memory</span>
                    <span className="text-sm font-black text-slate-800">2.8 GB</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[1600px] mx-auto px-10 py-16 border-t border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-10 xl:ml-20">
        <div className="flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-500">
          <div className="bg-slate-400 p-1.5 rounded-lg">
            <Waves className="w-4 h-4 text-white" />
          </div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">DamMitra AI &bull; Advanced Hydrological Intelligence &bull; v2.5.0</span>
        </div>
        <div className="flex items-center gap-12">
          <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-all">Documentation</a>
          <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-all">Satellite Feed</a>
          <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-all">Privacy & Security</a>
        </div>
      </footer>

      {/* Custom Styles for Marquee */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
