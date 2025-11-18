

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SYMPTOM_DATA, API_KEY_STORAGE_KEY, HISTORY_STORAGE_KEY, APP_MODE_STORAGE_KEY } from './constants';
import { BodyPart, PatientInfo, Symptom, AnalysisResult, IntakeData, Prescription, AnalysisRecord } from './types';
import { CheckIcon, PencilSquareIcon, DocumentTextIcon, HeartIcon, SparklesIcon, BeakerIcon, ClipboardDocumentListIcon, ArrowPathIcon, XMarkIcon, ShieldCheckIcon, UserCircleIcon, HeadBodyIcon, NeckBodyIcon, ChestBodyIcon, BackBodyIcon, PelvisBodyIcon, LimbsBodyIcon, SkinBodyIcon, UrinaryBodyIcon, BodyIcon, InfoIcon, LogoIcon, ArchiveBoxIcon, KeyIcon, Cog6ToothIcon, WifiSlashIcon, TrashIcon, MagnifyingGlassIcon, ChartBarIcon } from './components/Icons';
import { getAnalysis } from './api';

type AppState = 'welcome' | 'intake' | 'loading' | 'results' | 'history' | 'analytics';
type ActiveTab = 'summary' | 'conditions' | 'prescription' | 'lifestyle';
type AppMode = 'live' | 'mock';


const SettingsModal = ({ onSaveApiKey, initialKey, apiKeyError, currentMode, onModeChange, onClose }: { onSaveApiKey: (key: string) => void; initialKey?: string | null; apiKeyError?: string | null; currentMode: AppMode; onModeChange: (mode: AppMode) => void; onClose: () => void; }) => {
    const [apiKey, setApiKey] = useState(initialKey || '');

    const handleSave = () => {
        if (apiKey.trim()) {
            onSaveApiKey(apiKey.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full text-slate-300 animate-scale-in relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
                    <XMarkIcon className="w-7 h-7" />
                </button>
                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-500/10 p-3 rounded-full border border-indigo-500/50">
                            <Cog6ToothIcon className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Settings</h2>
                            <p className="text-sm text-slate-400">Configure application settings.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-300">Analysis Mode</label>
                        <div className="flex rounded-lg bg-slate-700/50 p-1 border border-slate-600">
                             <button onClick={() => onModeChange('live')} className={`w-1/2 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition ${currentMode === 'live' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                                <SparklesIcon className="w-5 h-5"/> Live AI
                            </button>
                            <button onClick={() => onModeChange('mock')} className={`w-1/2 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition ${currentMode === 'mock' ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                                <WifiSlashIcon className="w-5 h-5"/> Offline Mock
                            </button>
                        </div>
                    </div>
                    
                    {apiKeyError && currentMode === 'live' && (
                        <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3 text-sm animate-fade-in">
                            <InfoIcon className="w-6 h-6 flex-shrink-0"/>
                            <span>{apiKeyError}</span>
                        </div>
                    )}

                    {currentMode === 'live' && (
                        <div className="animate-fade-in">
                            <label htmlFor="apiKeyInput" className="block text-sm font-medium text-slate-300 mb-2">
                                Gemini API Key
                            </label>
                            <input 
                                id="apiKeyInput"
                                type="password" 
                                value={apiKey} 
                                onChange={e => setApiKey(e.target.value)} 
                                placeholder="Enter your API key here"
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                You can get a free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>. 
                                Your key is saved only in your browser's local storage.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        {currentMode === 'live' ? (
                            <button 
                                onClick={handleSave} 
                                disabled={!apiKey.trim()}
                                className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-500 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                                Save Key
                            </button>
                        ) : (
                             <button 
                                onClick={onClose} 
                                className="bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-500 transition-all duration-300"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const AboutModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative text-slate-300 animate-scale-in">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
                <XMarkIcon className="w-7 h-7" />
            </button>
            <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold text-white">About MedDoc Prescriber</h2>
                
                <div>
                    <h3 className="text-lg font-semibold text-indigo-400 mb-2">1. Problem Summary</h3>
                    <p>In Bangladesh and many other countries, patients often struggle to explain their health issues clearly to doctors. They forget symptoms, cannot describe pain properly, or miss important details like age, previous conditions, or lifestyle habits.</p>
                    <p className="mt-2">Existing digital health apps are either too complex, require heavy data entry, or are designed for professional use only. They are not user-friendly for students or general people who just want to learn how medical data systems work.</p>
                    <p className="mt-2">This creates a gap: there is no simple, educational tool that helps students or patients practice how to record symptoms, generate structured health information, and understand how prescriptions are formatted.</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-indigo-400 mb-2">2. Problem Solution</h3>
                    <p>We propose MedDoc Prescriber — a lightweight, educational web app that simulates a doctor–patient workflow.</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                        <li>Users can select body parts (e.g., head, skin, leg) and choose common symptoms (e.g., fever, pain, rash).</li>
                        <li>The system maps symptoms to educational conditions (not real diagnosis) and generates generic medicine examples (e.g., Paracetamol 500 mg).</li>
                        <li>It also provides simple lifestyle advice like “Drink more water” or “Take rest.”</li>
                        <li>Finally, users can see the full prescription directly on screen with patient info, doctor demo info, medicines, and advice — always with a bold disclaimer: “Educational Use Only.”</li>
                    </ul>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-indigo-400 mb-2">Why smart and simple?</h3>
                     <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                        <li><strong>Rule-based logic instead of heavy AI:</strong> efficient and minimal.</li>
                        <li><strong>Clear UI with step-by-step flow:</strong> easy for anyone to use.</li>
                        <li><strong>No complex medical jargon:</strong> accessible for students and demo purposes.</li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-indigo-400 mb-2">Unique/Innovative</h3>
                     <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                        <li>Focused on education and awareness, not real treatment.</li>
                        <li>Bridges the gap between medical learning and software development.</li>
                        <li>Encourages students to understand how structured data can simplify healthcare communication.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
);


const WelcomeScreen = ({ onStart, onViewHistory, onViewAnalytics, historyCount }: { onStart: () => void; onViewHistory: () => void; onViewAnalytics: () => void; historyCount: number; }) => {
    const [showAbout, setShowAbout] = useState(false);
    return(
    <>
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl border border-slate-700 max-w-xl mx-auto">
            <div className="mx-auto bg-indigo-500/10 rounded-full h-24 w-24 flex items-center justify-center border-2 border-indigo-500 mb-6">
                <HeartIcon className="h-12 w-12 text-red-400 animate-heartbeat" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome to MedDoc Prescriber</h1>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
                An educational tool to explore symptoms and generate example prescriptions. This is a demonstration and not for medical use.
            </p>
            <div className="flex flex-col items-center justify-center space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                    <button
                        onClick={onStart}
                        className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-600/30 transform hover:scale-105 animate-pulse-button w-full sm:w-auto"
                    >
                        Start New Intake
                    </button>
                    {historyCount > 0 && (
                        <>
                        <button
                            onClick={onViewAnalytics}
                            className="bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-teal-500 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <ChartBarIcon className="w-5 h-5" /> Analytics
                        </button>
                        <button
                            onClick={onViewHistory}
                            className="bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <ArchiveBoxIcon className="w-5 h-5" /> History ({historyCount})
                        </button>
                        </>
                    )}
                </div>
                 <p className="text-sm text-slate-400 animate-typing">Built by Code_For_Humanity</p>
                <button 
                    onClick={() => setShowAbout(true)}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-2"
                >
                    <InfoIcon className="w-5 h-5"/> About This Project
                </button>
            </div>
        </div>
    </div>
    {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
)};

const IntakeForm = ({ onAnalyze, error, setError, initialData, recordIdToUpdate, onCancelEdit }: { onAnalyze: (data: IntakeData, recordId?: string) => void; error: string | null; setError: (error: string | null) => void; initialData?: IntakeData | null; recordIdToUpdate?: string | null; onCancelEdit: () => void; }) => {
    const [patientInfo, setPatientInfo] = useState<PatientInfo>({ name: '', age: '', gender: 'Male' });
    const [primaryBodyPart, setPrimaryBodyPart] = useState<BodyPart | null>(null);
    const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
    const isEditing = !!recordIdToUpdate;

    useEffect(() => {
        if (initialData) {
            setPatientInfo(initialData.patientInfo);
            setPrimaryBodyPart(initialData.primaryBodyPart);
            setSelectedSymptoms(initialData.symptoms);
        }
    }, [initialData]);

    const handleSymptomToggle = (symptom: Symptom) => {
        setSelectedSymptoms(prev =>
            prev.some(s => s.id === symptom.id)
                ? prev.filter(s => s.id !== symptom.id)
                : [...prev, symptom]
        );
    };
    
    const handleBodyPartChange = (part: BodyPart) => {
        setPrimaryBodyPart(part);
        setSelectedSymptoms([]);
    }

    const isFormValid = patientInfo.name.trim() && patientInfo.age && primaryBodyPart && selectedSymptoms.length > 0;

    const handleSubmit = () => {
        if (isFormValid && primaryBodyPart) {
            onAnalyze({ patientInfo, primaryBodyPart, symptoms: selectedSymptoms }, recordIdToUpdate || undefined);
        }
    };
    
    const bodyPartIcons = {
        'Head': <HeadBodyIcon />,
        'Neck': <NeckBodyIcon />,
        'Chest & Abdomen': <ChestBodyIcon />,
        'Back': <BackBodyIcon />,
        'Pelvis & Groin': <PelvisBodyIcon />,
        'Arms & Legs': <LimbsBodyIcon />,
        'Skin': <SkinBodyIcon />,
        'Urinary': <UrinaryBodyIcon />,
        'General/Whole Body': <BodyIcon />,
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <Stepper currentStep="intake" />
            
            {error && (
                <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mt-8 flex items-center justify-between animate-fade-in shadow-lg">
                    <div className="flex items-center gap-3">
                        <InfoIcon className="w-6 h-6"/>
                        <span>{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-500/20">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="space-y-8 mt-10">
                <Card>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <UserCircleIcon className="w-8 h-8 text-indigo-400" /> 
                        {isEditing ? `Editing: ${initialData?.patientInfo.name}` : 'Patient Information'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Patient Full Name</label>
                            <input type="text" value={patientInfo.name} onChange={e => setPatientInfo({...patientInfo, name: e.target.value})} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
                                <input type="number" value={patientInfo.age} onChange={e => setPatientInfo({...patientInfo, age: e.target.value})} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
                                <select value={patientInfo.gender} onChange={e => setPatientInfo({...patientInfo, gender: e.target.value as PatientInfo['gender']})} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <ClipboardDocumentListIcon className="w-7 h-7 text-indigo-400" /> Symptom Selection
                    </h2>
                    <div>
                        <p className="text-slate-300 font-medium mb-4">1. Select Primary Affected Body Part</p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                            {(Object.keys(SYMPTOM_DATA) as BodyPart[]).map(part => (
                                <button key={part} onClick={() => handleBodyPartChange(part)} className={`p-2 sm:p-4 rounded-lg text-xs sm:text-sm text-center font-semibold transition-all duration-200 border-2 flex flex-col items-center justify-center h-24 sm:h-28 ${primaryBodyPart === part ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'}`}>
                                    {React.cloneElement(bodyPartIcons[part], { className: "w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" })}
                                    <span>{part}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    {primaryBodyPart && (
                        <div key={primaryBodyPart} className="mt-8 animate-fade-in">
                            <p className="text-slate-300 font-medium mb-4">2. Check All Applicable Symptoms for {primaryBodyPart}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {SYMPTOM_DATA[primaryBodyPart].map(symptom => (
                                    <label key={symptom.id} className="flex items-center space-x-3 text-slate-200 cursor-pointer p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                                        <input type="checkbox" checked={selectedSymptoms.some(s => s.id === symptom.id)} onChange={() => handleSymptomToggle(symptom)} className="h-5 w-5 rounded bg-slate-700 border-slate-500 text-indigo-600 focus:ring-indigo-500"/>
                                        <span>{symptom.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
                <div className="flex justify-end items-center pt-4 gap-4">
                    {isEditing && (
                        <button onClick={onCancelEdit} className="px-6 py-3 font-bold text-white bg-slate-600 hover:bg-slate-500 rounded-lg transition-all duration-300">
                           Cancel Edit
                        </button>
                    )}
                    <button onClick={handleSubmit} disabled={!isFormValid} className={`px-8 py-3 font-bold text-white rounded-lg transition-all duration-300 flex items-center gap-2 ${isFormValid ? 'bg-indigo-600 hover:bg-indigo-500' + (isEditing ? '' : ' animate-pulse-button') : 'bg-slate-600 cursor-not-allowed'}`}>
                        {isEditing ? 'Update Analysis' : 'Analyze Symptoms'} <BeakerIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
        <p className="text-white text-xl mt-6 font-semibold">Analyzing Symptoms...</p>
        <p className="text-slate-400 mt-2">Please wait while we process the information.</p>
    </div>
);

const PrescriptionItem: React.FC<{ p: Prescription, safetyMode: boolean }> = ({ p, safetyMode }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-baseline gap-3">
            <span className="text-3xl font-mono text-teal-400">Rx</span>
            <div>
                <p className="font-bold text-lg text-white">{p.name}</p>
                <p className="text-sm text-slate-400">{p.purpose}</p>
            </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-4 text-sm border-t border-slate-700 pt-3">
            {p.dosage && <div><span className="font-semibold text-slate-400">Dosage:</span> <span className="text-white">{p.dosage}</span></div>}
            {p.form && <div><span className="font-semibold text-slate-400">Form:</span> <span className="text-white">{p.form}</span></div>}
            {p.route && <div><span className="font-semibold text-slate-400">Route:</span> <span className="text-white">{p.route}</span></div>}
            {!safetyMode && p.frequency && <div className="col-span-full"><span className="font-semibold text-slate-400">Frequency:</span> <span className="text-indigo-300">{p.frequency}</span></div>}
        </div>
        <p className="text-xs text-slate-500 mt-3 italic">{p.description}</p>
    </div>
);


const FullPrescriptionModal = ({ intakeData, result, safetyMode, onClose }: { intakeData: IntakeData; result: AnalysisResult; safetyMode: boolean; onClose: () => void; }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in modal-overlay">
            <div className="bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative text-slate-200 animate-scale-in printable-prescription">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition no-print">
                    <XMarkIcon className="w-7 h-7" />
                </button>
                <div className="p-8">
                    <div className="flex justify-between items-start pb-4 border-b border-slate-700 mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white">MedDoc Prescriber</h2>
                            <p className="text-indigo-400">Educational Demo</p>
                        </div>
                        <div className="text-right text-sm">
                            <p className="font-semibold">Dr. Tanvir</p>
                            <p>BMDC-DEMO-001</p>
                            <p>Date: November 18, 2025</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4 flex items-center gap-3">
                                <UserCircleIcon className="w-6 h-6 text-indigo-400" /> Patient Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-y-0 sm:gap-x-4 text-sm">
                                <div><span className="font-semibold text-slate-400">Name:</span> {intakeData.patientInfo.name}</div>
                                <div><span className="font-semibold text-slate-400">Age:</span> {intakeData.patientInfo.age}</div>
                                <div><span className="font-semibold text-slate-400">Gender:</span> {intakeData.patientInfo.gender}</div>
                            </div>
                        </div>

                         <div>
                            <h3 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4 flex items-center gap-3">
                                <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-400" /> Symptoms Presented
                            </h3>
                            <div className="text-sm">
                                <p><span className="font-semibold text-slate-400">Primary Area:</span> {intakeData.primaryBodyPart}</p>
                                <p><span className="font-semibold text-slate-400">Symptoms:</span> {intakeData.symptoms.map(s => s.name).join(', ')}</p>
                            </div>
                        </div>
                        
                        <div>
                             <h3 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4 flex items-center gap-3">
                                <BeakerIcon className="w-6 h-6 text-indigo-400" /> Educational Condition Examples
                            </h3>
                            <ul className="list-disc list-inside space-y-3 pl-2 text-slate-300">
                                {result.conditions.map((c, i) => <li key={i}><strong>{c.name}:</strong> {c.description}</li>)}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4 flex items-center gap-3">
                                <DocumentTextIcon className="w-6 h-6 text-indigo-400" /> Prescription (Generic Examples)
                            </h3>
                            <div className="space-y-4">
                                {result.prescriptions.map((p, i) => (
                                    <PrescriptionItem key={i} p={p} safetyMode={safetyMode} />
                                ))}
                            </div>
                        </div>
                        
                        <div>
                             <h3 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4 flex items-center gap-3">
                                <HeartIcon className="w-6 h-6 text-indigo-400" /> Lifestyle Advice
                            </h3>
                            <ul className="list-disc list-inside space-y-2 pl-2 text-slate-300">
                                {result.lifestyleAdvice.map((a) => <li key={a.id}>{a.text}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
                 <div className="p-8 pt-2 no-print">
                    <div className="flex justify-end border-t border-slate-700 pt-6">
                         <button onClick={() => window.print()} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-500 transition flex items-center gap-2">
                            Download as PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HistoryScreen = ({ history, onViewItem, onBack, onDeleteItem, onEditItem, onClearAll }: { history: AnalysisRecord[]; onViewItem: (record: AnalysisRecord) => void; onBack: () => void; onDeleteItem: (id: string) => void; onEditItem: (record: AnalysisRecord) => void; onClearAll: () => void; }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'name-az'>('date-desc');

    const filteredAndSortedHistory = useMemo(() => {
        return history
            .filter(record => 
                record.intakeData.patientInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                switch (sortOption) {
                    case 'date-asc':
                        return new Date(a.id).getTime() - new Date(b.id).getTime();
                    case 'name-az':
                        return a.intakeData.patientInfo.name.localeCompare(b.intakeData.patientInfo.name);
                    case 'date-desc':
                    default:
                        return new Date(b.id).getTime() - new Date(a.id).getTime();
                }
            });
    }, [history, searchTerm, sortOption]);

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-white">Analysis History</h1>
                <div className="flex items-center gap-2">
                    {history.length > 0 && (
                        <button onClick={onClearAll} className="px-4 py-2 bg-red-800/80 text-white font-semibold rounded-lg text-sm hover:bg-red-700 transition flex items-center gap-2">
                            <TrashIcon className="w-4 h-4"/> Clear All
                        </button>
                    )}
                    <button onClick={onBack} className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg text-sm hover:bg-slate-600 transition flex items-center gap-2">
                        Back to Welcome
                    </button>
                </div>
            </div>

            {history.length > 0 && (
                 <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative w-full sm:flex-1">
                        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 transform -translate-y-1/2" />
                        <input 
                            type="text"
                            placeholder="Search by patient name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-slate-400">Sort by:</span>
                        <button onClick={() => setSortOption('date-desc')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition ${sortOption === 'date-desc' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Newest</button>
                        <button onClick={() => setSortOption('date-asc')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition ${sortOption === 'date-asc' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Oldest</button>
                        <button onClick={() => setSortOption('name-az')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition ${sortOption === 'name-az' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Name (A-Z)</button>
                    </div>
                </div>
            )}

            {history.length === 0 ? (
                <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-2xl">
                    <ArchiveBoxIcon className="w-12 h-12 mx-auto text-slate-500" />
                    <p className="text-slate-400 mt-4">No history found.</p>
                    <p className="text-sm text-slate-500">Completed analyses will appear here.</p>
                </div>
            ) : filteredAndSortedHistory.length === 0 ? (
                <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-2xl">
                    <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-slate-500" />
                    <p className="text-slate-400 mt-4">No results found for "{searchTerm}"</p>
                    <p className="text-sm text-slate-500">Try searching for a different name.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAndSortedHistory.map(record => (
                        <div 
                            key={record.id} 
                            className="w-full bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-slate-700 flex justify-between items-center gap-4 group"
                        >
                            <button onClick={() => onViewItem(record)} className="flex-grow text-left">
                                <p className="font-bold text-lg text-white">{record.intakeData.patientInfo.name}</p>
                                <p className="text-sm text-slate-400 mt-1">{record.intakeData.symptoms.map(s => s.name).join(', ')}</p>
                                <p className="text-xs text-slate-500 mt-2">{record.date}</p>
                            </button>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => onEditItem(record)} 
                                    className="p-2 rounded-full text-slate-500 hover:bg-indigo-900/50 hover:text-indigo-400 transition"
                                    aria-label="Edit record"
                                >
                                    <PencilSquareIcon className="w-5 h-5"/>
                                </button>
                                <button 
                                    onClick={() => onDeleteItem(record.id)} 
                                    className="p-2 rounded-full text-slate-500 hover:bg-red-900/50 hover:text-red-400 transition"
                                    aria-label="Delete record"
                                >
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const ResultsScreen = ({ intakeData, result, onStartNew }: { intakeData: IntakeData; result: AnalysisResult; onStartNew: () => void }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
    const [safetyMode, setSafetyMode] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const tabs: { id: ActiveTab; name: string; icon: React.ReactElement<{ className?: string }> }[] = [
        { id: 'summary', name: 'Summary', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
        { id: 'conditions', name: 'Conditions', icon: <BeakerIcon className="w-5 h-5" /> },
        { id: 'prescription', name: 'Prescription', icon: <DocumentTextIcon className="w-5 h-5" /> },
        { id: 'lifestyle', name: 'Lifestyle Advice', icon: <HeartIcon className="w-5 h-5" /> },
    ];
    
    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <Stepper currentStep="analysis" />
            <div className="mt-10">
                <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-200">
                            <input type="checkbox" checked={safetyMode} onChange={() => setSafetyMode(!safetyMode)} className="h-5 w-5 rounded bg-slate-700 border-slate-500 text-indigo-500 focus:ring-indigo-500"/>
                            Safety Mode (Hide Dosing)
                        </label>
                        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg text-sm hover:bg-slate-600 transition">See Full Prescription</button>
                        <button onClick={onStartNew} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-500 transition flex items-center gap-2">
                           <ArrowPathIcon className="w-4 h-4" /> Start New
                        </button>
                    </div>
                </div>
                
                <div className="mt-6 bg-slate-800/50 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-slate-700">
                    <div className="flex flex-wrap gap-1">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-3 py-2.5 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}>
                                {React.cloneElement(tab.icon, { className: `w-5 h-5 transition-transform ${activeTab === tab.id ? 'scale-110' : ''} ${activeTab === tab.id && tab.id === 'lifestyle' ? 'animate-heartbeat' : ''}` })}
                                {tab.name}
                            </button>
                        ))}
                    </div>
                    <div className="mt-2 p-6 min-h-[300px]">
                        {activeTab === 'summary' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-slate-200 animate-fade-in">
                                <div className="col-span-2 sm:col-span-1"><strong>Patient Name:</strong><p className="text-lg text-white">{intakeData.patientInfo.name}</p></div>
                                <div className="col-span-2 sm:col-span-1"><strong>Age:</strong><p className="text-lg text-white">{intakeData.patientInfo.age}</p></div>
                                <div className="col-span-2 sm:col-span-1"><strong>Gender:</strong><p className="text-lg text-white">{intakeData.patientInfo.gender}</p></div>
                                <div className="col-span-2 sm:col-span-1"><strong>Date:</strong><p className="text-lg text-white">November 18, 2025</p></div>
                                <div className="col-span-2"><strong>Symptoms Presented:</strong><p className="text-lg text-white">{intakeData.symptoms.map(s => s.name).join(', ')} (in {intakeData.primaryBodyPart})</p></div>
                            </div>
                        )}
                        {activeTab === 'conditions' && (
                           <div className="space-y-4 animate-fade-in">
                                {result.conditions.map((c, i) => (
                                    <div key={i} className="bg-slate-900/50 p-5 rounded-lg border border-slate-700">
                                        <h3 className="font-bold text-lg text-white">{c.name}</h3>
                                        <p className="text-slate-300 mt-1">{c.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'prescription' && (
                            <div className="space-y-4 animate-fade-in">
                                {result.prescriptions.map((p, i) => (
                                    <div key={i} className="bg-slate-900/50 p-5 rounded-lg border border-slate-700">
                                        <h3 className="font-bold text-lg text-white flex items-baseline gap-2">
                                            <span className="text-2xl font-mono text-teal-400">Rx</span>
                                            <span>{p.name}</span>
                                        </h3>
                                        {!safetyMode && p.frequency && <p className="text-indigo-300 mt-2"><span className="font-semibold">Frequency:</span> {p.frequency}</p>}
                                        <p className="text-sm text-slate-400 mt-2">{p.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                         {activeTab === 'lifestyle' && (
                            <div className="space-y-3 animate-fade-in">
                                {result.lifestyleAdvice.map(advice => (
                                    <div key={advice.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex items-center gap-3">
                                        <div className="bg-green-500/10 rounded-full p-1.5">
                                            <ShieldCheckIcon className="w-5 h-5 text-green-400"/>
                                        </div>
                                        <p className="text-slate-200">{advice.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showModal && <FullPrescriptionModal intakeData={intakeData} result={result} safetyMode={safetyMode} onClose={() => setShowModal(false)} />}
        </div>
    );
};

const Stepper = ({ currentStep }: { currentStep: 'intake' | 'analysis' }) => {
    const isIntakeDone = currentStep === 'intake' || currentStep === 'analysis';
    const isAnalysisDone = currentStep === 'analysis';
    return (
        <div className="max-w-md mx-auto flex items-center justify-center p-4 bg-slate-800/50 backdrop-blur-sm rounded-full shadow-lg border border-slate-700">
            <div className="flex items-center">
                <div className={`flex items-center ${isIntakeDone ? 'text-indigo-400' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isIntakeDone ? 'bg-indigo-500/20 border-indigo-500' : 'border-slate-600'}`}>
                        {isIntakeDone ? <CheckIcon className="w-5 h-5" /> : <PencilSquareIcon className="w-5 h-5" />}
                    </div>
                    <div className="ml-3">
                        <p className={`font-bold ${isIntakeDone ? 'text-white' : 'text-slate-400'}`}>Intake</p>
                        <p className="text-xs text-slate-400">Patient & Symptoms</p>
                    </div>
                </div>
                <div className="flex-1 h-0.5 bg-slate-600 mx-3 sm:mx-6"></div>
                <div className={`flex items-center ${isAnalysisDone ? 'text-indigo-400' : 'text-slate-400'}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isAnalysisDone ? 'bg-indigo-500/20 border-indigo-500' : 'border-slate-600'}`}>
                        {isAnalysisDone ? <CheckIcon className="w-5 h-5" /> : <BeakerIcon className="w-5 h-5" />}
                    </div>
                    <div className="ml-3">
                        <p className={`font-bold ${isAnalysisDone ? 'text-white' : 'text-slate-400'}`}>Analysis</p>
                        <p className="text-xs text-slate-400">Educational Results</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Card = ({ children }: { children?: React.ReactNode }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-slate-700 transition-all duration-300 hover:border-slate-600 hover:shadow-indigo-500/10">
        {children}
    </div>
);

const AnalyticsScreen = ({ history, onBack }: { history: AnalysisRecord[]; onBack: () => void; }) => {
    const stats = useMemo(() => {
        if (history.length === 0) return null;

        const totalAnalyses = history.length;
        
        const bodyPartCounts = history.reduce((acc, record) => {
            const part = record.intakeData.primaryBodyPart;
            acc[part] = (acc[part] || 0) + 1;
            return acc;
        }, {} as Record<BodyPart, number>);

        const sortedBodyParts = Object.entries(bodyPartCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        const symptomCounts = history.flatMap(r => r.intakeData.symptoms).reduce((acc, symptom) => {
            acc[symptom.name] = (acc[symptom.name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const sortedSymptoms = Object.entries(symptomCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
        
        return {
            totalAnalyses,
            sortedBodyParts,
            sortedSymptoms
        };
    }, [history]);
    
    if (!stats) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                 <ChartBarIcon className="w-16 h-16 mx-auto text-slate-500" />
                 <h1 className="text-3xl font-bold text-white mt-4">No Data for Analytics</h1>
                 <p className="text-slate-400 mt-2">Complete an analysis to start seeing insights here.</p>
                 <button onClick={onBack} className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition">Go Back</button>
            </div>
        );
    }

    const SimpleBarChart = ({ data, title }: { data: [string, number][]; title: string }) => {
        const maxValue = Math.max(...data.map(([, value]) => value), 1); // Avoid division by zero
        return (
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
                <div className="space-y-3">
                    {data.map(([label, value]) => (
                        <div key={label} className="grid grid-cols-3 gap-2 items-center text-sm">
                            <span className="text-slate-300 truncate">{label}</span>
                            <div className="col-span-2 bg-slate-700/50 rounded-full h-6 flex items-center">
                                <div 
                                    className="bg-indigo-500 h-6 rounded-full flex items-center justify-end px-2 text-white font-bold"
                                    style={{ width: `${(value / maxValue) * 100}%`, minWidth: '24px' }}
                                >
                                    {value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 animate-fade-in">
             <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3"><ChartBarIcon className="w-8 h-8 text-indigo-400" /> Analytics Dashboard</h1>
                <button onClick={onBack} className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg text-sm hover:bg-slate-600 transition">Back to Welcome</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <h3 className="text-slate-400 text-sm font-medium">Total Analyses</h3>
                    <p className="text-5xl font-bold text-white mt-2">{stats.totalAnalyses}</p>
                </Card>
                <Card>
                    <h3 className="text-slate-400 text-sm font-medium">Most Common Area</h3>
                    <p className="text-3xl font-bold text-white mt-2 truncate">{stats.sortedBodyParts[0]?.[0] || 'N/A'}</p>
                </Card>
                 <Card>
                    <h3 className="text-slate-400 text-sm font-medium">Most Frequent Symptom</h3>
                    <p className="text-3xl font-bold text-white mt-2 truncate">{stats.sortedSymptoms[0]?.[0] || 'N/A'}</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card><SimpleBarChart data={stats.sortedBodyParts} title="Top 5 Body Parts" /></Card>
                <Card><SimpleBarChart data={stats.sortedSymptoms} title="Top 5 Symptoms" /></Card>
            </div>
        </div>
    );
};

const AppFooter = () => (
    <footer className="w-full p-4 bg-transparent mt-auto">
        <div className="text-center text-xs text-slate-400/80 max-w-5xl mx-auto border-t border-slate-700/50 pt-4">
            <p className="font-semibold">Educational Use Only: This website is for learning and demonstration purposes, not medical care.</p>
            <p className="mt-1">For real health needs, consult a licensed clinician. No medical advice is provided. Generic medicine names are examples only.</p>
            <p className="mt-3 text-slate-500">© 2025 MedDoc Prescriber. All Rights Reserved to Code_For_Humanity.</p>
        </div>
    </footer>
);


export default function App() {
    const [appState, setAppState] = useState<AppState>('welcome');
    const [intakeData, setIntakeData] = useState<IntakeData | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);
    const [history, setHistory] = useState<AnalysisRecord[]>([]);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [appMode, setAppMode] = useState<AppMode>('live');
    const [editingRecord, setEditingRecord] = useState<AnalysisRecord | null>(null);

    useEffect(() => {
        // Load app mode
        const storedMode = localStorage.getItem(APP_MODE_STORAGE_KEY);
        const currentMode: AppMode = (storedMode === 'mock' || storedMode === 'live') ? storedMode : 'live';
        setAppMode(currentMode);

        // Check for API key on initial load only if in live mode
        if (currentMode === 'live' && !localStorage.getItem(API_KEY_STORAGE_KEY)) {
            setApiKeyError(null);
            setIsSettingsModalOpen(true);
        }

        // Load history from local storage
        try {
            const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (e) {
            console.error("Failed to load history from local storage", e);
            setHistory([]);
        }
    }, []);

    const handleSaveApiKey = (key: string) => {
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
        setIsSettingsModalOpen(false);
        setError(null);
        setApiKeyError(null);
    };

    const handleModeChange = (mode: AppMode) => {
        setAppMode(mode);
        localStorage.setItem(APP_MODE_STORAGE_KEY, mode);
        if (mode === 'live' && !localStorage.getItem(API_KEY_STORAGE_KEY)) {
            setIsSettingsModalOpen(true);
            setApiKeyError(null);
        } else {
             // Close modal if switching to mock or if key exists for live
            setIsSettingsModalOpen(false);
        }
    };

    const handleAnalyze = async (data: IntakeData, recordId?: string) => {
        setIntakeData(data);
        setAppState('loading');
        setError(null);
        try {
            const result = await getAnalysis(data);
            setAnalysisResult(result);

            if (recordId) { // Update existing record
                setHistory(prevHistory => {
                    const updatedHistory = prevHistory.map(record => {
                        if (record.id === recordId) {
                            return { ...record, date: new Date().toLocaleString(), intakeData: data, result };
                        }
                        return record;
                    });
                    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
                    return updatedHistory;
                });
            } else { // Create new record
                const newRecord: AnalysisRecord = {
                    id: new Date().toISOString(),
                    date: new Date().toLocaleString(),
                    intakeData: data,
                    result: result,
                };
                setHistory(prevHistory => {
                    const updatedHistory = [...prevHistory, newRecord];
                    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
                    return updatedHistory;
                });
            }
            
            setEditingRecord(null); // Clear editing state on success
            setAppState('results');
        } catch (e: any) {
            const errorMessage = e.message || 'An unknown error occurred. Please try again.';
            
            if (appMode === 'live' && errorMessage.includes("API key")) {
                setApiKeyError(`API Key Error: ${errorMessage}. Please enter a valid key.`);
                setIsSettingsModalOpen(true);
                setError(null);
            } else {
                setError(errorMessage);
            }
            setEditingRecord(null); // Clear editing state on failure
            setAppState('intake');
        }
    };

    const handleStartNew = () => {
        setAppState('welcome');
        setIntakeData(null);
        setAnalysisResult(null);
        setError(null);
        setEditingRecord(null);
    };
    
    const handleStart = () => {
        if (appMode === 'live' && !localStorage.getItem(API_KEY_STORAGE_KEY)) {
            setApiKeyError(null);
            setIsSettingsModalOpen(true);
        } else {
            setAppState('intake');
        }
    };

    const handleViewHistory = () => setAppState('history');
    const handleViewAnalytics = () => setAppState('analytics');


    const handleViewHistoryItem = (record: AnalysisRecord) => {
        setIntakeData(record.intakeData);
        setAnalysisResult(record.result);
        setAppState('results');
    };

    const handleEditHistoryItem = (record: AnalysisRecord) => {
        setEditingRecord(record);
        setAppState('intake');
    };

    const handleCancelEdit = () => {
        setEditingRecord(null);
        setAppState('history');
    };

    const handleDeleteHistoryItem = (id: string) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            const updatedHistory = history.filter(item => item.id !== id);
            setHistory(updatedHistory);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
        }
    };

    const handleClearAllHistory = () => {
        if (window.confirm("Are you sure you want to delete all history records? This action cannot be undone.")) {
            setHistory([]);
            localStorage.removeItem(HISTORY_STORAGE_KEY);
        }
    };

    const renderContent = () => {
        switch(appState) {
            case 'welcome':
                return <WelcomeScreen onStart={handleStart} onViewHistory={handleViewHistory} onViewAnalytics={handleViewAnalytics} historyCount={history.length}/>
            case 'intake':
                return <IntakeForm 
                    onAnalyze={handleAnalyze} 
                    error={error} 
                    setError={setError}
                    initialData={editingRecord?.intakeData}
                    recordIdToUpdate={editingRecord?.id}
                    onCancelEdit={handleCancelEdit}
                />;
            case 'loading':
                return <LoadingScreen />;
            case 'results':
                if (analysisResult && intakeData) {
                    return <ResultsScreen intakeData={intakeData} result={analysisResult} onStartNew={handleStartNew} />;
                }
                setAppState('intake');
                return null;
            case 'history':
                return <HistoryScreen history={history} onViewItem={handleViewHistoryItem} onBack={handleStartNew} onDeleteItem={handleDeleteHistoryItem} onEditItem={handleEditHistoryItem} onClearAll={handleClearAllHistory} />;
            case 'analytics':
                 return <AnalyticsScreen history={history} onBack={handleStartNew} />;
            default:
                return <WelcomeScreen onStart={handleStart} onViewHistory={handleViewHistory} onViewAnalytics={handleViewAnalytics} historyCount={history.length}/>
        }
    };

    const ModeIndicator = () => {
        if (appMode === 'mock') {
            return (
                <div className="flex items-center gap-2 text-sm text-amber-300 bg-amber-900/50 border border-amber-700 px-3 py-1 rounded-full">
                    <WifiSlashIcon className="w-4 h-4" />
                    Offline Mock Mode
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 text-sm text-green-300 bg-green-900/50 border border-green-700 px-3 py-1 rounded-full">
                <SparklesIcon className="w-4 h-4" />
                Live AI Mode
            </div>
        );
    };

    return (
        <div className="min-h-screen text-white bg-cover bg-center bg-fixed" style={{backgroundImage: "url('https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=2070&auto=format&fit=crop')"}}>
            <div className="min-h-screen bg-[#0B1120]/90 backdrop-blur-sm flex flex-col">
                <header className="p-4 no-print">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <LogoIcon className="w-8 h-8 text-indigo-400" />
                            <h1 className="text-xl font-bold hidden sm:block">MedDoc Prescriber</h1>
                        </div>
                        <ModeIndicator />
                         <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-white transition" aria-label="Settings">
                            <Cog6ToothIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </header>
                <main className="flex-grow">
                    {renderContent()}
                </main>
                <AppFooter />
                {isSettingsModalOpen && <SettingsModal onSaveApiKey={handleSaveApiKey} initialKey={localStorage.getItem(API_KEY_STORAGE_KEY)} apiKeyError={apiKeyError} currentMode={appMode} onModeChange={handleModeChange} onClose={() => setIsSettingsModalOpen(false)} />}
            </div>
        </div>
    );
}