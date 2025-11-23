
import React, { useState, useEffect, useRef } from 'react';
import { SYMPTOM_DATA, API_KEY_STORAGE_KEY, HISTORY_STORAGE_KEY, APP_MODE_STORAGE_KEY } from './constants';
import { BodyPart, PatientInfo, Symptom, AnalysisResult, IntakeData, AnalysisRecord, VisualDiagnosisResult, RxScannerResult, LabReportResult, ChatMessage } from './types';
import { 
    CheckIcon, PencilSquareIcon, DocumentTextIcon, HeartIcon, SparklesIcon, BeakerIcon, 
    ClipboardDocumentListIcon, ArrowPathIcon, XMarkIcon, ShieldCheckIcon, UserCircleIcon, 
    HeadBodyIcon, NeckBodyIcon, ChestBodyIcon, BackBodyIcon, PelvisBodyIcon, LimbsBodyIcon, 
    SkinBodyIcon, UrinaryBodyIcon, BodyIcon, InfoIcon, LogoIcon, ArchiveBoxIcon, KeyIcon, 
    Cog6ToothIcon, WifiSlashIcon, TrashIcon, MagnifyingGlassIcon, ChartBarIcon, 
    CameraIcon, CloudArrowUpIcon, PhotoIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon,
    SunIcon, MoonIcon
} from './components/Icons';
import { getAnalysis, analyzeDermatology, analyzePrescription, analyzeLabReport, chatWithPraxis } from './api';

// --- TYPES ---
type AppMode = 'live' | 'mock';
type ThemeMode = 'default' | 'light' | 'dark';
type NavModule = 'dashboard' | 'symptom' | 'visual' | 'rx' | 'report' | 'praxis' | 'history';

// --- UTILS ---
const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};

const saveHistory = (type: AnalysisRecord['type'], result: any, summary: string) => {
    try {
        const historyStr = localStorage.getItem(HISTORY_STORAGE_KEY);
        const history: AnalysisRecord[] = historyStr ? JSON.parse(historyStr) : [];
        const newRecord: AnalysisRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type,
            summary,
            result
        };
        // Add to beginning
        history.unshift(newRecord);
        // Limit to 50 items
        if (history.length > 50) history.pop();
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        // Dispatch event so other components can update
        window.dispatchEvent(new Event('historyUpdated'));
    } catch (e) {
        console.error("Failed to save history", e);
    }
};

const handlePrint = () => {
    window.print();
};

// --- COMPONENTS ---

const DisclaimerBanner = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-slate-400 text-[10px] sm:text-xs py-2 px-4 text-center z-50 border-t border-white/10 backdrop-blur-md no-print">
        <span className="font-bold text-red-400">DISCLAIMER:</span> This application is for <span className="text-white font-semibold">EDUCATIONAL PURPOSES ONLY</span>. It is not a medical device and should not be used to diagnose or treat any condition. Always consult a qualified healthcare professional. Built by Tanvir Ahmmed.
    </div>
);

const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-main)] no-print">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20 animate-pulse"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-fade-in"></div>
            
            <div className="relative z-10 text-center space-y-8 p-4 max-w-4xl mx-auto">
                <div className="inline-flex flex-col items-center gap-1 animate-fade-in">
                     <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-bold tracking-widest uppercase">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                        System Online
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-2">Supported by Gemini 2.5</span>
                </div>
                
                <div className="space-y-2 animate-scale-in">
                    <h1 className="text-6xl md:text-9xl font-black text-[var(--text-main)] tracking-tighter">
                        PRAXIS
                    </h1>
                    <div className="text-xl md:text-3xl font-light text-[var(--text-muted)]">
                        Architected by <span className="text-indigo-500 font-semibold">Tanvir Ahmmed</span>
                    </div>
                </div>
                
                <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto font-light leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
                    Advanced Medical AI Assistant Suite
                </p>

                <div className="pt-12 animate-fade-in" style={{animationDelay: '0.4s'}}>
                    <button 
                        onClick={onEnter}
                        className="group relative inline-flex items-center gap-4 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-10px_rgba(79,70,229,0.7)] hover:-translate-y-1"
                    >
                        Initialize Interface
                        <ArrowPathIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                </div>
            </div>

            <div className="absolute bottom-12 text-slate-600 text-xs font-mono">
                © {new Date().getFullYear()} Tanvir Ahmmed • Non-Clinical Research Prototype
            </div>
        </div>
    );
};

const SettingsModal = ({ onSaveApiKey, initialKey, apiKeyError, currentMode, onModeChange, theme, onThemeChange, onClose }: { 
    onSaveApiKey: (key: string) => void; 
    initialKey?: string | null; 
    apiKeyError?: string | null; 
    currentMode: AppMode; 
    onModeChange: (mode: AppMode) => void; 
    theme: ThemeMode;
    onThemeChange: (theme: ThemeMode) => void;
    onClose: () => void; 
}) => {
    const [apiKey, setApiKey] = useState(initialKey || '');

    const handleSave = () => {
        if (apiKey.trim()) onSaveApiKey(apiKey.trim());
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in no-print">
            <div className="glass-panel rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden animate-scale-in">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400"></div>
                <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] transition">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                
                <div className="p-8 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-indigo-500/20">
                            <Cog6ToothIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[var(--text-main)]">System Config</h2>
                            <p className="text-xs text-indigo-400 uppercase tracking-wider font-bold">Tanvir Ahmmed Build</p>
                        </div>
                    </div>

                    {/* Theme Selector */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Interface Theme</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => onThemeChange('default')} className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all flex flex-col items-center gap-1 ${theme === 'default' ? 'bg-indigo-600 text-white border-indigo-500' : 'custom-input hover:border-indigo-500/50'}`}>
                                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-slate-900 to-indigo-900 border border-white/20"></span>
                                Praxis
                            </button>
                            <button onClick={() => onThemeChange('light')} className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all flex flex-col items-center gap-1 ${theme === 'light' ? 'bg-blue-500 text-white border-blue-400' : 'custom-input hover:border-blue-400/50'}`}>
                                <SunIcon className="w-4 h-4"/>
                                Clinical
                            </button>
                            <button onClick={() => onThemeChange('dark')} className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all flex flex-col items-center gap-1 ${theme === 'dark' ? 'bg-slate-800 text-white border-slate-600' : 'custom-input hover:border-slate-600/50'}`}>
                                <MoonIcon className="w-4 h-4"/>
                                OLED
                            </button>
                        </div>
                    </div>

                    {/* Operation Mode */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Operation Mode</label>
                        <div className="flex rounded-xl bg-[var(--bg-secondary)] p-1 border border-[var(--glass-border)]">
                             <button onClick={() => onModeChange('live')} className={`w-1/2 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${currentMode === 'live' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                                <SparklesIcon className="w-4 h-4"/> Live AI
                            </button>
                            <button onClick={() => onModeChange('mock')} className={`w-1/2 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${currentMode === 'mock' ? 'bg-amber-700 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                                <WifiSlashIcon className="w-4 h-4"/> Offline
                            </button>
                        </div>
                    </div>
                    
                    {/* API Key */}
                    {currentMode === 'live' && (
                        <div className="animate-fade-in space-y-3">
                            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Gemini API Key</label>
                            <div className="relative">
                                <KeyIcon className="absolute left-3 top-3.5 w-4 h-4 text-[var(--text-muted)]" />
                                <input 
                                    type="password" 
                                    value={apiKey} 
                                    onChange={e => setApiKey(e.target.value)} 
                                    placeholder="sk-..."
                                    className="w-full custom-input rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 font-mono text-sm"
                                />
                            </div>
                            {apiKeyError && (
                                <div className="text-red-400 text-xs flex items-center gap-1 mt-1"><InfoIcon className="w-3 h-3"/> {apiKeyError}</div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleSave} 
                            disabled={currentMode === 'live' && !apiKey.trim()}
                            className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            Save Configuration <CheckIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-SCREENS ---

const VisualDiagnosisScreen = ({ onAnalyze, isLoading, result, error }: any) => {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        const base64 = await convertFileToBase64(image);
        onAnalyze(base64);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8 animate-fade-in mb-20">
             <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
                        <span className="bg-pink-500/10 p-2 rounded-xl border border-pink-500/20"><PhotoIcon className="w-8 h-8 text-pink-400" /></span>
                        Dermatology AI
                    </h2>
                    <p className="text-[var(--text-muted)] mt-2 text-lg">Visual analysis for skin conditions and injuries.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6 no-print">
                    <div className="group relative border-2 border-dashed border-[var(--glass-border)] hover:border-pink-500/50 rounded-3xl p-8 flex flex-col items-center justify-center bg-[var(--bg-secondary)] transition-all min-h-[400px]">
                        {preview ? (
                            <div className="relative w-full h-full flex flex-col items-center">
                                <img src={preview} alt="Upload" className="max-h-[300px] rounded-2xl object-contain mb-6 shadow-2xl ring-1 ring-white/10" />
                                <button onClick={() => {setImage(null); setPreview(null);}} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-red-500/20">
                                    <TrashIcon className="w-4 h-4"/> Remove Image
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-[var(--glass-border)] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
                                    <CloudArrowUpIcon className="w-10 h-10 text-[var(--text-muted)] group-hover:text-pink-400 transition-colors" />
                                </div>
                                <p className="text-[var(--text-main)] font-medium text-xl">Upload Medical Image</p>
                                <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </>
                        )}
                    </div>
                    <button 
                        onClick={handleAnalyze} 
                        disabled={!image || isLoading}
                        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${!image ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-pink-500/20'}`}
                    >
                        {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><SparklesIcon className="w-5 h-5"/> Analyze Condition</>}
                    </button>
                    {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start gap-3"><InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5"/> {error}</div>}
                </div>

                <div id="printable-area" className={`glass-panel rounded-3xl p-8 min-h-[400px] relative overflow-hidden ${result ? 'print-only-visible' : ''}`}>
                    {!result ? (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                            <PhotoIcon className="w-20 h-20 mb-6 opacity-20" />
                            <p className="text-lg">Waiting for input stream...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-scale-in relative z-10">
                             <div className="flex justify-end no-print">
                                <button onClick={handlePrint} className="text-pink-400 flex items-center gap-2 hover:text-pink-300 font-bold uppercase text-xs tracking-widest"><DocumentTextIcon className="w-4 h-4"/> Print Official Report</button>
                            </div>
                            <div className="flex justify-between items-start border-b border-[var(--glass-border)] pb-6">
                                <div>
                                    <div className="text-xs text-pink-400 font-mono mb-1 uppercase tracking-wider">Detected Condition</div>
                                    <h3 className="text-3xl font-bold text-[var(--text-main)]">{result.conditionName}</h3>
                                    <p className="text-[var(--text-muted)] text-sm mt-1 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div> {result.probability}</p>
                                </div>
                                <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border ${result.severity === 'Critical' || result.severity === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                                    {result.severity} Severity
                                </div>
                            </div>
                            
                            <p className="text-[var(--text-main)] leading-relaxed text-lg font-light">{result.description}</p>
                            
                            <div>
                                <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Visual Indicators</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.visualCharacteristics.map((vc: string, i: number) => (
                                        <span key={i} className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] px-3 py-1.5 rounded-full text-sm text-[var(--text-main)]">{vc}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-indigo-500/10 p-6 rounded-2xl border border-indigo-500/20">
                                <h4 className="text-indigo-400 font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><ShieldCheckIcon className="w-5 h-5"/> Recommended Action</h4>
                                <ul className="space-y-3">
                                    {result.recommendations.map((r: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-[var(--text-main)] text-sm">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></span>
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-4 text-center">{result.disclaimer}</p>
                        </div>
                    )}
                    {/* Decorative glow inside card */}
                    {result && <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none no-print"></div>}
                </div>
            </div>
        </div>
    );
};

const RxScannerScreen = ({ onAnalyze, isLoading, result, error }: any) => {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        const base64 = await convertFileToBase64(image);
        onAnalyze(base64);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8 animate-fade-in mb-20">
             <div className="mb-10 flex items-end justify-between no-print">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
                        <span className="bg-teal-500/10 p-2 rounded-xl border border-teal-500/20"><DocumentTextIcon className="w-8 h-8 text-teal-400" /></span>
                        Rx Scanner
                    </h2>
                    <p className="text-[var(--text-muted)] mt-2 text-lg">Digitize and interpret handwritten prescriptions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6 no-print">
                    <div className="group relative border-2 border-dashed border-[var(--glass-border)] hover:border-teal-500/50 rounded-3xl p-6 flex flex-col items-center justify-center bg-[var(--bg-secondary)] transition-all min-h-[300px]">
                         {preview ? (
                            <img src={preview} alt="Rx" className="max-h-64 rounded-lg shadow-2xl ring-1 ring-white/10" />
                        ) : (
                            <>
                                <CameraIcon className="w-12 h-12 text-[var(--text-muted)] group-hover:text-teal-400 transition-colors mb-4" />
                                <p className="text-[var(--text-main)] font-medium text-lg">Upload Prescription Image</p>
                                <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </>
                        )}
                    </div>
                    <button 
                        onClick={handleAnalyze} 
                        disabled={!image || isLoading}
                        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${!image ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-teal-500/20'}`}
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Scan & Decrypt"}
                    </button>
                    {error && <div className="text-red-400 text-sm bg-red-500/10 p-4 border border-red-500/20 rounded-xl">{error}</div>}
                </div>
                
                <div id="printable-area" className={`glass-panel rounded-3xl border border-[var(--glass-border)] p-8 min-h-[400px] overflow-y-auto relative ${result ? 'print-only-visible' : ''}`}>
                     {!result ? (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                            <DocumentTextIcon className="w-20 h-20 mb-6 opacity-20" />
                            <p className="text-lg">Awaiting document scan...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-scale-in relative z-10">
                            <div className="flex justify-between items-center border-b border-[var(--glass-border)] pb-4 no-print">
                                <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest">Identified Medications</h3>
                                <button onClick={handlePrint} className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-bold text-xs uppercase tracking-widest"><DocumentTextIcon className="w-4 h-4"/> Print</button>
                            </div>
                            <div className="space-y-4">
                                {result.medications.map((med: any, i: number) => (
                                    <div key={i} className="bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--glass-border)] hover:border-teal-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-[var(--text-main)] text-xl">{med.name}</h4>
                                            <span className="text-xs font-mono bg-teal-500/20 text-teal-400 px-2 py-1 rounded border border-teal-500/20">{med.dosage}</span>
                                        </div>
                                        <div className="text-sm text-[var(--text-muted)] mb-3 flex items-center gap-2"><ArrowPathIcon className="w-3 h-3"/> {med.frequency}</div>
                                        <div className="text-sm text-[var(--text-muted)] bg-[var(--bg-main)] p-3 rounded-lg border border-[var(--glass-border)] italic">
                                            <span className="text-teal-500 not-italic font-semibold mr-1">Purpose:</span> {med.purpose}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--glass-border)]">
                                <h4 className="font-semibold text-[var(--text-main)] mb-3 flex items-center gap-2"><InfoIcon className="w-4 h-4 text-indigo-400"/> Patient Instructions</h4>
                                <ul className="space-y-2">
                                    {result.patientInstructions.map((inst: string, i: number) => (
                                        <li key={i} className="text-sm text-[var(--text-muted)] flex items-start gap-3">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                            {inst}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] text-center">{result.disclaimer}</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

const ReportAnalyzerScreen = ({ onAnalyze, isLoading, result, error }: any) => {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        const base64 = await convertFileToBase64(image);
        onAnalyze(base64);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in mb-20">
             <div className="mb-10 no-print">
                <h2 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
                    <span className="bg-purple-500/10 p-2 rounded-xl border border-purple-500/20"><ClipboardDocumentListIcon className="w-8 h-8 text-purple-400" /></span>
                    Lab Intelligence
                </h2>
                <p className="text-[var(--text-muted)] mt-2 text-lg">Deep analysis of blood work and pathology reports.</p>
            </div>
            
            <div className="flex flex-col xl:flex-row gap-8">
                <div className="xl:w-1/3 space-y-6 no-print">
                    <div className="border-2 border-dashed border-[var(--glass-border)] hover:border-purple-500/50 rounded-3xl p-6 flex flex-col items-center bg-[var(--bg-secondary)] min-h-[300px] justify-center transition-all">
                        {preview ? <img src={preview} className="max-h-56 rounded-lg mb-6 shadow-2xl ring-1 ring-white/10" /> : <ChartBarIcon className="w-16 h-16 text-[var(--text-muted)] mb-4"/>}
                        <div className="relative">
                             <button className="bg-slate-800 text-slate-300 px-6 py-2 rounded-lg text-sm font-medium border border-slate-700 hover:bg-slate-700 transition-colors">Select File</button>
                             <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer"/>
                        </div>
                    </div>
                    <button onClick={handleAnalyze} disabled={isLoading || !image} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 border border-white/10">
                        {isLoading ? "Processing Data..." : "Analyze Report"}
                    </button>
                    {error && <div className="text-red-400 text-sm p-4 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</div>}
                </div>

                <div id="printable-area" className={`xl:w-2/3 glass-panel rounded-3xl border border-[var(--glass-border)] p-8 min-h-[500px] ${result ? 'print-only-visible' : ''}`}>
                    {!result ? (
                         <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                             <BeakerIcon className="w-24 h-24 mb-6 opacity-20"/>
                            <p className="text-lg">No data available.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-scale-in">
                            <div className="flex justify-end no-print">
                                <button onClick={handlePrint} className="text-purple-400 flex items-center gap-2 font-bold uppercase text-xs tracking-widest hover:text-purple-300"><DocumentTextIcon className="w-4 h-4"/> Print Report</button>
                            </div>
                            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-white/5">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Executive Summary</h3>
                                <p className="text-slate-200 leading-relaxed font-light text-lg">{result.summary}</p>
                            </div>
                            
                            <div className="overflow-hidden rounded-2xl border border-[var(--glass-border)]">
                                <table className="w-full text-left text-sm text-[var(--text-muted)]">
                                    <thead className="bg-[var(--bg-secondary)] text-xs uppercase text-[var(--text-muted)] font-medium tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Test Name</th>
                                            <th className="px-6 py-4">Value</th>
                                            <th className="px-6 py-4 hidden sm:table-cell">Ref Range</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Insight</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--glass-border)] bg-[var(--bg-secondary)]">
                                        {result.tests.map((test: any, i: number) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-bold text-[var(--text-main)]">{test.testName}</td>
                                                <td className="px-6 py-4 font-mono text-indigo-400">{test.value} <span className="text-[var(--text-muted)] text-xs">{test.unit}</span></td>
                                                <td className="px-6 py-4 text-[var(--text-muted)] font-mono text-xs hidden sm:table-cell">{test.referenceRange}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${test.status === 'Normal' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${test.status === 'Normal' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                        {test.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-[var(--text-muted)] text-xs hidden md:table-cell max-w-xs truncate" title={test.interpretation}>{test.interpretation}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                             <p className="text-[10px] text-[var(--text-muted)] mt-4 text-center">{result.disclaimer}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PraxisChatScreen = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: 'Greetings. I am Praxis, your medical intelligence unit. Accessing medical database... Ready. How may I assist with your health inquiry today?', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const historyForApi = messages.map(m => ({ role: m.role, text: m.text }));
            const responseText = await chatWithPraxis(historyForApi, userMsg.text);
            const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
            setMessages(prev => [...prev, botMsg]);
        } catch (e) {
            const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: "Connection interrupted. Please verify network status.", timestamp: new Date() };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col max-w-6xl mx-auto p-4 animate-fade-in">
            <div className="flex-grow glass-panel border border-[var(--glass-border)] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                {/* Chat Header */}
                <div className="p-4 border-b border-[var(--glass-border)] bg-[var(--glass-bg)] flex items-center justify-between backdrop-blur-md">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <SparklesIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-[var(--text-main)]">Praxis AI</h2>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-xs text-green-400 font-mono">ONLINE</span>
                            </div>
                        </div>
                     </div>
                     <div className="text-xs text-[var(--text-muted)] font-mono">SECURE CHANNEL</div>
                </div>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-transparent to-black/5">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-scale-in`}>
                            <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-lg relative ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-[var(--bg-secondary)] text-[var(--text-main)] rounded-tl-sm border border-[var(--glass-border)]'}`}>
                                <p className="leading-relaxed text-sm md:text-base">{msg.text}</p>
                                <span className={`text-[10px] block mt-2 text-right opacity-60 font-mono`}>{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start animate-fade-in">
                             <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] p-4 rounded-2xl rounded-tl-sm flex gap-2 items-center h-12">
                                <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Input Area */}
                <div className="p-4 bg-[var(--glass-bg)] border-t border-[var(--glass-border)] backdrop-blur-md">
                    <div className="flex gap-3 max-w-4xl mx-auto">
                        <div className="relative flex-grow">
                             <input 
                                type="text" 
                                value={input} 
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                placeholder="Type your health inquiry..." 
                                className="w-full custom-input rounded-2xl pl-5 pr-4 py-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-[var(--text-muted)] shadow-inner"
                            />
                        </div>
                        <button 
                            onClick={handleSend} 
                            disabled={!input.trim() || isTyping} 
                            className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:grayscale hover:scale-105 active:scale-95"
                        >
                            <PaperAirplaneIcon className="w-6 h-6 -rotate-45 ml-0.5 mb-0.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HistoryScreen = () => {
    const [history, setHistory] = useState<AnalysisRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);

    useEffect(() => {
        loadHistory();
        window.addEventListener('historyUpdated', loadHistory);
        return () => window.removeEventListener('historyUpdated', loadHistory);
    }, []);

    const loadHistory = () => {
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (stored) setHistory(JSON.parse(stored));
    };

    const deleteRecord = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = history.filter(h => h.id !== id);
        setHistory(updated);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
        if (selectedRecord?.id === id) setSelectedRecord(null);
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'symptom': return <UserCircleIcon className="w-5 h-5 text-blue-400"/>;
            case 'visual': return <PhotoIcon className="w-5 h-5 text-pink-400"/>;
            case 'rx': return <DocumentTextIcon className="w-5 h-5 text-teal-400"/>;
            case 'report': return <ClipboardDocumentListIcon className="w-5 h-5 text-purple-400"/>;
            default: return <ArchiveBoxIcon className="w-5 h-5"/>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in mb-20">
            <div className="mb-8 no-print">
                <h2 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
                    <span className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20"><ArchiveBoxIcon className="w-8 h-8 text-amber-400" /></span>
                    Medical Records
                </h2>
                <p className="text-[var(--text-muted)] mt-2">Secure local history of your Praxis analysis sessions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4 no-print">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-muted)] glass-panel rounded-2xl">No records found.</div>
                    ) : (
                        history.map(record => (
                            <div 
                                key={record.id} 
                                onClick={() => setSelectedRecord(record)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all group relative ${selectedRecord?.id === record.id ? 'bg-[var(--bg-secondary)] border-indigo-500 shadow-lg' : 'glass-panel border-[var(--glass-border)] hover:border-[var(--text-muted)]'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        {getIcon(record.type)}
                                        <span className="font-bold text-sm uppercase tracking-wider text-[var(--text-muted)]">{record.type}</span>
                                    </div>
                                    <button onClick={(e) => deleteRecord(record.id, e)} className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                                <h4 className="text-[var(--text-main)] font-medium truncate">{record.summary}</h4>
                                <div className="text-[10px] text-[var(--text-muted)] mt-2">{new Date(record.date).toLocaleString()}</div>
                            </div>
                        ))
                    )}
                </div>

                <div className="md:col-span-2">
                    {selectedRecord ? (
                        <div className="glass-panel rounded-3xl p-6 border border-[var(--glass-border)] h-full min-h-[500px] overflow-y-auto">
                             <div className="flex justify-end mb-4 no-print">
                                <button onClick={handlePrint} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold uppercase text-xs tracking-widest"><DocumentTextIcon className="w-4 h-4"/> Print Record</button>
                             </div>
                             <div id="printable-area" className="print-only-visible">
                                <div className="border-b border-[var(--glass-border)] pb-4 mb-4">
                                    <h3 className="text-2xl font-bold text-[var(--text-main)]">{selectedRecord.summary}</h3>
                                    <p className="text-[var(--text-muted)] text-sm">Recorded: {new Date(selectedRecord.date).toLocaleString()}</p>
                                </div>
                                <div className="prose prose-invert max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-[var(--text-main)] text-sm leading-relaxed">
                                        {JSON.stringify(selectedRecord.result, null, 2)}
                                    </pre>
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-[var(--text-muted)] glass-panel rounded-3xl border border-[var(--glass-border)] min-h-[300px]">
                            <p>Select a record to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- MAIN APP COMPONENT ---

export default function App() {
    const [showLanding, setShowLanding] = useState(true);
    const [nav, setNav] = useState<NavModule>('dashboard');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [appMode, setAppMode] = useState<AppMode>('live');
    const [theme, setTheme] = useState<ThemeMode>('default');
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);
    const [stats, setStats] = useState({ total: 0, types: { symptom: 0, visual: 0, rx: 0, report: 0 } });
    
    // Symptom Checker State
    const [intakeData, setIntakeData] = useState<IntakeData | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [checkerLoading, setCheckerLoading] = useState(false);
    const [checkerError, setCheckerError] = useState<string | null>(null);

    // Premium Feature States
    const [visualLoading, setVisualLoading] = useState(false);
    const [visualResult, setVisualResult] = useState<VisualDiagnosisResult | null>(null);
    const [visualError, setVisualError] = useState<string | null>(null);

    const [rxLoading, setRxLoading] = useState(false);
    const [rxResult, setRxResult] = useState<RxScannerResult | null>(null);
    const [rxError, setRxError] = useState<string | null>(null);

    const [reportLoading, setReportLoading] = useState(false);
    const [reportResult, setReportResult] = useState<LabReportResult | null>(null);
    const [reportError, setReportError] = useState<string | null>(null);

    useEffect(() => {
        const storedMode = localStorage.getItem(APP_MODE_STORAGE_KEY) as AppMode;
        if(storedMode) setAppMode(storedMode);
        loadStats();
        window.addEventListener('historyUpdated', loadStats);
    }, []);

    const loadStats = () => {
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (stored) {
            const history: AnalysisRecord[] = JSON.parse(stored);
            const types = { symptom: 0, visual: 0, rx: 0, report: 0 };
            history.forEach(h => { if (types[h.type as keyof typeof types] !== undefined) types[h.type as keyof typeof types]++; });
            setStats({ total: history.length, types });
        }
    };

    const handleEnterSystem = () => {
        setShowLanding(false);
        if (!localStorage.getItem(API_KEY_STORAGE_KEY) && appMode !== 'mock') {
            setTimeout(() => setSettingsOpen(true), 500);
        }
    };

    const handleApiKeySave = (key: string) => {
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
        setApiKeyError(null);
        setSettingsOpen(false);
    };

    const handleThemeChange = (t: ThemeMode) => {
        setTheme(t);
        document.body.className = t === 'default' ? '' : `theme-${t}`;
    };

    // --- HANDLERS ---
    
    const runSymptomCheck = async (data: IntakeData) => {
        setCheckerLoading(true); setCheckerError(null);
        try {
            const res = await getAnalysis(data);
            setAnalysisResult(res);
            setIntakeData(data);
            saveHistory('symptom', res, `Symptom Analysis: ${data.primaryBodyPart}`);
        } catch (e: any) { setCheckerError(e.message); } 
        finally { setCheckerLoading(false); }
    };

    const runVisualDiagnosis = async (base64: string) => {
        setVisualLoading(true); setVisualError(null);
        try {
            const res = await analyzeDermatology(base64);
            setVisualResult(res);
            saveHistory('visual', res, `Dermatology: ${res.conditionName}`);
        } catch (e: any) { setVisualError(e.message); }
        finally { setVisualLoading(false); }
    };

    const runRxScan = async (base64: string) => {
        setRxLoading(true); setRxError(null);
        try {
            const res = await analyzePrescription(base64);
            setRxResult(res);
            const drugNames = res.medications.map((m: any) => m.name).join(', ');
            saveHistory('rx', res, `Rx Scan: ${drugNames.substring(0, 30)}...`);
        } catch (e: any) { setRxError(e.message); }
        finally { setRxLoading(false); }
    };

    const runReportAnalysis = async (base64: string) => {
        setReportLoading(true); setReportError(null);
        try {
            const res = await analyzeLabReport(base64);
            setReportResult(res);
            saveHistory('report', res, `Lab Report Analysis`);
        } catch (e: any) { setReportError(e.message); }
        finally { setReportLoading(false); }
    };

    // --- NAVIGATION COMPONENT ---
    const Sidebar = () => (
        <div className="hidden md:flex flex-col w-72 glass-panel border-r border-[var(--glass-border)] h-screen fixed left-0 top-0 overflow-y-auto z-40 no-print">
            <div className="p-8 flex items-center gap-3 mb-4">
                <LogoIcon className="w-8 h-8 text-indigo-500" />
                <span className="text-xl font-black bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent tracking-tight">MedDoc+</span>
            </div>
            
            <nav className="flex-1 px-4 space-y-2">
                <NavButton id="dashboard" icon={<ChartBarIcon/>} label="Dashboard" />
                
                <div className="px-4 py-3 mt-6">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Diagnostic Modules</span>
                </div>
                
                <NavButton id="symptom" icon={<UserCircleIcon/>} label="Symptom Checker" />
                <NavButton id="visual" icon={<PhotoIcon/>} label="Visual Dermatology" />
                <NavButton id="rx" icon={<DocumentTextIcon/>} label="Rx Scanner" />
                <NavButton id="report" icon={<ClipboardDocumentListIcon/>} label="Lab Report AI" />
                
                <div className="px-4 py-3 mt-6">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Intelligence</span>
                </div>
                
                <NavButton id="praxis" icon={<SparklesIcon/>} label="Praxis Chat" activeClass="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/20 border border-white/10" />
                <NavButton id="history" icon={<ArchiveBoxIcon/>} label="Medical Records" />
            </nav>

            <div className="p-4 mt-auto bg-[var(--glass-bg)] backdrop-blur-sm border-t border-[var(--glass-border)]">
                <button onClick={() => setSettingsOpen(true)} className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all p-3 w-full rounded-xl hover:bg-[var(--bg-secondary)] group">
                    <div className="bg-[var(--bg-secondary)] p-1.5 rounded-lg group-hover:bg-indigo-500 transition-colors">
                         <Cog6ToothIcon className="w-4 h-4 text-[var(--text-main)] group-hover:text-white" />
                    </div>
                    <div className="text-left">
                        <span className="text-sm font-medium block">System Config</span>
                        <span className="text-[10px] text-[var(--text-muted)] block">By Tanvir Ahmmed</span>
                    </div>
                </button>
            </div>
        </div>
    );

    const NavButton = ({ id, icon, label, activeClass = "bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--glass-border)] shadow-lg" }: any) => (
        <button 
            onClick={() => setNav(id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${nav === id ? activeClass : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]'}`}
        >
            {nav === id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full"></div>}
            {React.cloneElement(icon, { className: `w-5 h-5 z-10 ${nav === id ? 'text-inherit' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors'}` })}
            <span className="font-medium text-sm z-10 tracking-wide">{label}</span>
        </button>
    );

    // --- CONTENT RENDERER ---
    const renderContent = () => {
        switch (nav) {
            case 'dashboard':
                return (
                    <div className="max-w-7xl mx-auto p-4 md:p-12 animate-fade-in mb-20">
                        <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-[var(--text-main)] mb-4 tracking-tight">System Dashboard</h1>
                                <p className="text-[var(--text-muted)] text-lg">Select a diagnostic protocol to initiate analysis.</p>
                            </div>
                            <div className="glass-panel p-6 rounded-2xl border border-[var(--glass-border)] min-w-[280px]">
                                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Session Analytics</h3>
                                <div className="flex items-end gap-2 h-16">
                                    {/* Simple CSS Chart */}
                                    <div className="w-1/4 bg-blue-500/20 rounded-t-md relative group" style={{height: `${Math.max(10, (stats.types.symptom/stats.total)*100 || 10)}%`}}>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">{stats.types.symptom}</div>
                                    </div>
                                    <div className="w-1/4 bg-pink-500/20 rounded-t-md relative group" style={{height: `${Math.max(10, (stats.types.visual/stats.total)*100 || 10)}%`}}>
                                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">{stats.types.visual}</div>
                                    </div>
                                    <div className="w-1/4 bg-teal-500/20 rounded-t-md relative group" style={{height: `${Math.max(10, (stats.types.rx/stats.total)*100 || 10)}%`}}>
                                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">{stats.types.rx}</div>
                                    </div>
                                    <div className="w-1/4 bg-purple-500/20 rounded-t-md relative group" style={{height: `${Math.max(10, (stats.types.report/stats.total)*100 || 10)}%`}}>
                                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">{stats.types.report}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-2">
                                    <span>Sym</span><span>Vis</span><span>Rx</span><span>Lab</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            <DashboardCard title="Symptom Checker" desc="Detailed physiological analysis based on reported symptoms." icon={<UserCircleIcon className="w-8 h-8 text-blue-400"/>} onClick={() => setNav('symptom')} color="blue"/>
                            <DashboardCard title="Visual Dermatology" desc="Computer vision analysis for skin conditions and trauma." icon={<PhotoIcon className="w-8 h-8 text-pink-400"/>} onClick={() => setNav('visual')} color="pink"/>
                            <DashboardCard title="Rx Scanner" desc="OCR and semantic analysis of handwritten medical scripts." icon={<DocumentTextIcon className="w-8 h-8 text-teal-400"/>} onClick={() => setNav('rx')} color="teal"/>
                            <DashboardCard title="Lab Intelligence" desc="Complex interpretation of pathology and blood reports." icon={<ClipboardDocumentListIcon className="w-8 h-8 text-purple-400"/>} onClick={() => setNav('report')} color="purple"/>
                            <DashboardCard title="Medical Records" desc="Access your saved analysis history and reports." icon={<ArchiveBoxIcon className="w-8 h-8 text-amber-400"/>} onClick={() => setNav('history')} color="amber"/>
                            <DashboardCard title="Praxis Chat" desc="Conversational AI interface for general medical queries." icon={<SparklesIcon className="w-8 h-8 text-indigo-400"/>} onClick={() => setNav('praxis')} color="indigo" fullWidth/>
                        </div>
                    </div>
                );
            case 'symptom':
                return (
                    <div className="animate-fade-in max-w-6xl mx-auto p-4 md:p-8 mb-20">
                        {analysisResult && intakeData ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center no-print">
                                    <button onClick={() => {setAnalysisResult(null); setIntakeData(null);}} className="text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-all"><ArrowPathIcon className="w-4 h-4"/> Start New Analysis</button>
                                    <button onClick={handlePrint} className="text-blue-400 flex items-center gap-2 font-bold uppercase text-xs tracking-widest hover:text-blue-300"><DocumentTextIcon className="w-4 h-4"/> Print Prescription</button>
                                </div>
                                
                                <div id="printable-area" className="glass-panel p-8 rounded-3xl border border-[var(--glass-border)] print-only-visible">
                                    <div className="flex justify-between items-end border-b border-[var(--glass-border)] pb-6 mb-8">
                                        <div>
                                            <h2 className="text-3xl font-bold text-[var(--text-main)]">Diagnostic Report</h2>
                                            <p className="text-[var(--text-muted)]">Patient: {intakeData.patientInfo.name} • Age: {intakeData.patientInfo.age} • {intakeData.patientInfo.gender}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Generated By</div>
                                            <div className="text-xl font-black text-indigo-500">Praxis AI</div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Potential Conditions</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {analysisResult.conditions.map((c,i) => (
                                                    <div key={i} className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--glass-border)] hover:border-blue-500/30 transition-all">
                                                        <h3 className="font-bold text-xl text-[var(--text-main)] mb-2">{c.name}</h3>
                                                        <p className="text-[var(--text-muted)] text-sm leading-relaxed">{c.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest">Example Treatments</h3>
                                                 <div className="space-y-3">
                                                    {analysisResult.prescriptions.map((p,i) => (
                                                        <div key={i} className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--glass-border)]">
                                                            <div className="flex justify-between">
                                                                <span className="font-bold text-[var(--text-main)]">{p.name}</span>
                                                                <span className="text-xs text-[var(--text-muted)]">{p.dosage}</span>
                                                            </div>
                                                            <p className="text-xs text-[var(--text-muted)] mt-2">{p.purpose}</p>
                                                        </div>
                                                    ))}
                                                 </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Lifestyle Protocols</h3>
                                                 <ul className="space-y-3">
                                                    {analysisResult.lifestyleAdvice.map((l,i) => (
                                                        <li key={i} className="flex gap-3 text-[var(--text-main)] text-sm p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--glass-border)]">
                                                            <CheckIcon className="w-5 h-5 text-indigo-500 flex-shrink-0"/>
                                                            {l.text}
                                                        </li>
                                                    ))}
                                                 </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-[var(--text-muted)] mt-8 pt-4 border-t border-[var(--glass-border)] text-center">
                                        Generated for educational purposes only. Not a valid medical prescription.
                                    </p>
                                </div>
                            </div>
                        ) : (
                             <IntakeWrapper onAnalyze={runSymptomCheck} isLoading={checkerLoading} error={checkerError}/>
                        )}
                    </div>
                );
            case 'visual': return <VisualDiagnosisScreen onAnalyze={runVisualDiagnosis} isLoading={visualLoading} result={visualResult} error={visualError} />;
            case 'rx': return <RxScannerScreen onAnalyze={runRxScan} isLoading={rxLoading} result={rxResult} error={rxError} />;
            case 'report': return <ReportAnalyzerScreen onAnalyze={runReportAnalysis} isLoading={reportLoading} result={reportResult} error={reportError} />;
            case 'praxis': return <PraxisChatScreen />;
            case 'history': return <HistoryScreen />;
            default: return null;
        }
    };

    if (showLanding) return <LandingPage onEnter={handleEnterSystem} />;

    return (
        <div className="min-h-screen text-[var(--text-main)] font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Theme Background Wrapper - handles gradient changes based on theme */}
            <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500 no-print">
                 {theme === 'default' && (
                     <>
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] animate-fade-in"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-900/10 rounded-full blur-[120px] animate-fade-in"></div>
                     </>
                 )}
            </div>

            <Sidebar />
            
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-[var(--glass-border)] sticky top-0 z-30 no-print">
                <div className="flex items-center gap-2">
                    <LogoIcon className="w-6 h-6 text-indigo-500" />
                    <span className="font-bold text-[var(--text-main)] text-lg">MedDoc+</span>
                </div>
                <button onClick={() => setSettingsOpen(true)} className="text-[var(--text-muted)] bg-[var(--bg-secondary)] p-2 rounded-lg"><Cog6ToothIcon className="w-5 h-5"/></button>
            </div>

            {/* Main Content Area */}
            <div className="md:ml-72 min-h-screen transition-all duration-300 relative z-10">
                {renderContent()}
            </div>

            <DisclaimerBanner />

            {/* Bottom Nav for Mobile */}
            <div className="md:hidden fixed bottom-12 left-0 w-full glass-panel border-t border-[var(--glass-border)] flex justify-around p-4 z-30 safe-area-pb no-print">
                <button onClick={() => setNav('dashboard')} className={`p-2 rounded-xl transition-all ${nav === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)]'}`}><ChartBarIcon className="w-6 h-6"/></button>
                <button onClick={() => setNav('symptom')} className={`p-2 rounded-xl transition-all ${nav === 'symptom' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)]'}`}><UserCircleIcon className="w-6 h-6"/></button>
                <button onClick={() => setNav('praxis')} className={`p-2 rounded-xl transition-all ${nav === 'praxis' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)]'}`}><SparklesIcon className="w-6 h-6"/></button>
            </div>

            {settingsOpen && <SettingsModal onSaveApiKey={handleApiKeySave} initialKey={localStorage.getItem(API_KEY_STORAGE_KEY)} apiKeyError={apiKeyError} currentMode={appMode} onModeChange={(m) => {setAppMode(m); localStorage.setItem(APP_MODE_STORAGE_KEY, m);}} theme={theme} onThemeChange={handleThemeChange} onClose={() => setSettingsOpen(false)} />}
        </div>
    );
}

// --- HELPER COMPONENTS ---

const DashboardCard = ({ title, desc, icon, onClick, color, fullWidth }: any) => {
    // Map colors to tailwind classes roughly to keep it simple but theme-aware
    // We use specificity to ensure hover effects work
    return (
        <button 
            onClick={onClick}
            className={`glass-panel p-8 rounded-3xl text-left transition-all duration-500 hover:-translate-y-2 hover:bg-[var(--card-hover)] group relative overflow-hidden ${fullWidth ? 'md:col-span-2 lg:col-span-1' : ''}`}
        >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <ArrowPathIcon className="w-6 h-6 text-[var(--text-muted)] -rotate-45" />
            </div>
            
            <div className={`mb-6 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] w-fit group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                {React.cloneElement(icon, { className: `w-8 h-8 transition-colors ${color === 'indigo' ? 'text-indigo-400 group-hover:text-indigo-300' : ''}` })}
            </div>
            
            <h3 className="text-2xl font-bold text-[var(--text-main)] mb-2 group-hover:text-indigo-400 transition-colors">{title}</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-[90%]">{desc}</p>
        </button>
    );
};

const IntakeWrapper = ({ onAnalyze, isLoading, error }: any) => {
    const [patient, setPatient] = useState<PatientInfo>({ name: '', age: '', gender: 'Male' });
    const [step, setStep] = useState<1 | 2>(1); // 1: Body Part, 2: Symptoms
    const [bodyPart, setBodyPart] = useState<BodyPart>('General/Whole Body');
    const [symptoms, setSymptoms] = useState<Symptom[]>([]);

    const toggleSymptom = (s: Symptom) => {
        setSymptoms(prev => prev.find(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s]);
    };

    const handleBodyPartSelect = (bp: BodyPart) => {
        setBodyPart(bp);
        setSymptoms([]);
        setStep(2);
    };

    return (
        <div className="max-w-5xl mx-auto no-print">
             <div className="mb-10">
                <h2 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
                    <span className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20"><UserCircleIcon className="w-8 h-8 text-blue-400" /></span>
                    Symptom Analysis
                </h2>
                <p className="text-[var(--text-muted)] mt-2 text-lg">Advanced physiological symptom mapping.</p>
            </div>

            <div className="space-y-8">
                {/* Patient Info Card */}
                <div className="glass-panel border border-[var(--glass-border)] p-8 rounded-3xl">
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Patient Profile</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs text-[var(--text-muted)] font-semibold uppercase">Full Name</label>
                            <input type="text" placeholder="Enter name" value={patient.name} onChange={e => setPatient({...patient, name: e.target.value})} className="w-full custom-input rounded-xl p-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-[var(--text-muted)] font-semibold uppercase">Age</label>
                            <input type="number" placeholder="Years" value={patient.age} onChange={e => setPatient({...patient, age: e.target.value})} className="w-full custom-input rounded-xl p-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-[var(--text-muted)] font-semibold uppercase">Gender</label>
                            <div className="relative">
                                <select value={patient.gender} onChange={e => setPatient({...patient, gender: e.target.value as any})} className="w-full custom-input rounded-xl p-4 focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none transition-all cursor-pointer">
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">▼</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STEP 1: BODY PART SELECTION */}
                {step === 1 && (
                    <div className="glass-panel border border-[var(--glass-border)] p-8 rounded-3xl animate-fade-in">
                        <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2"><div className="w-2 h-2 bg-pink-500 rounded-full"></div> Select Primary Area</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {Object.keys(SYMPTOM_DATA).map(bp => (
                                <button key={bp} onClick={() => handleBodyPartSelect(bp as BodyPart)} className="py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 border flex flex-col items-center justify-center gap-2 text-center bg-[var(--bg-secondary)] text-[var(--text-muted)] border-transparent hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 hover:scale-105">
                                    {bp}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2: SYMPTOM SELECTION */}
                {step === 2 && (
                    <div className="glass-panel border border-[var(--glass-border)] p-8 rounded-3xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Symptoms for <span className="text-indigo-400">{bodyPart}</span></h3>
                            <button onClick={() => setStep(1)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase font-bold tracking-wider border border-[var(--glass-border)] px-3 py-1 rounded-lg hover:bg-[var(--bg-secondary)] transition-all">Change Area</button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                             {SYMPTOM_DATA[bodyPart].map(s => {
                                 const isSelected = symptoms.find(x => x.id === s.id);
                                 return (
                                    <button key={s.id} onClick={() => toggleSymptom(s)} className={`text-left p-4 rounded-xl border text-sm transition-all duration-200 relative overflow-hidden group ${isSelected ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-inner' : 'bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-muted)] hover:bg-[var(--glass-hover)] hover:text-[var(--text-main)]'}`}>
                                        <div className="relative z-10 flex items-center justify-between">
                                            {s.name}
                                            {isSelected && <CheckIcon className="w-4 h-4 text-blue-400"/>}
                                        </div>
                                    </button>
                                 );
                             })}
                        </div>

                        <div className="pt-8 mt-4 border-t border-[var(--glass-border)]">
                            <button 
                                onClick={() => onAnalyze({ patientInfo: patient, primaryBodyPart: bodyPart, symptoms })}
                                disabled={isLoading || !patient.name || symptoms.length === 0}
                                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-white/10 group"
                            >
                                {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Generate Clinical Report <ArrowPathIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"/></>}
                            </button>
                        </div>
                    </div>
                )}

                {error && <div className="text-red-400 bg-red-500/10 p-4 border border-red-500/20 rounded-xl text-center flex items-center justify-center gap-2"><InfoIcon className="w-5 h-5"/> {error}</div>}
            </div>
        </div>
    );
};
