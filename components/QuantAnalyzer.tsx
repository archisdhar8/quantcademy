import React, { useState, useRef } from 'react';
import { analyzeDocument } from '../services/geminiService';
import { DocumentAnalysis } from '../types';
import AITutor from './AITutor';

const QuantAnalyzer: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setFile(selected);
            
            // Create preview if image
            if (selected.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => setPreview(ev.target?.result as string);
                reader.readAsDataURL(selected);
            } else if (selected.type === 'application/pdf') {
                setPreview(null); // No preview for PDF, just icon
            }
            
            // Auto analyze on upload
            processFile(selected);
        }
    };

    const processFile = async (f: File) => {
        setLoading(true);
        setAnalysis(null);
        
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64Data = (ev.target?.result as string).split(',')[1];
            const result = await analyzeDocument(base64Data, f.type);
            setAnalysis(result);
            setLoading(false);
        };
        reader.readAsDataURL(f);
    };

    return (
        <div className="flex h-full w-full bg-slate-950">
            <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-2">Quant Analyzer</h1>
                <p className="text-slate-400 mb-8">Upload financial charts, earnings reports (PDF), or screenshots for AI analysis.</p>

                {/* Upload Zone */}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-2xl h-48 border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-slate-800 transition-all group"
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*,application/pdf"
                    />
                    
                    {loading ? (
                         <div className="flex flex-col items-center">
                            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
                            <span className="text-slate-400 animate-pulse">Reading Document...</span>
                         </div>
                    ) : file ? (
                        <div className="flex flex-col items-center">
                            <div className="text-4xl mb-2">{file.type.includes('pdf') ? '📄' : '🖼️'}</div>
                            <span className="font-mono text-emerald-400">{file.name}</span>
                            <span className="text-xs text-slate-500 mt-2">Click to replace</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-slate-500 group-hover:text-slate-300">
                            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            <span className="font-semibold">Click to upload PDF or Image</span>
                        </div>
                    )}
                </div>

                {/* Preview Image */}
                {preview && (
                    <div className="mt-6 max-w-lg w-full rounded-lg overflow-hidden border border-slate-800 shadow-xl">
                        <img src={preview} alt="Preview" className="w-full opacity-80" />
                    </div>
                )}

                {/* Analysis Results */}
                {analysis && (
                    <div className="w-full max-w-4xl mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                            <h3 className="text-emerald-400 font-bold mb-4 uppercase tracking-wider text-sm">Executive Summary</h3>
                            <p className="text-slate-300 leading-relaxed text-sm">{analysis.summary}</p>
                            
                            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                                <span className="text-xs text-slate-500 uppercase">Sentiment</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${analysis.sentiment === 'Positive' ? 'bg-green-500/20 text-green-400' : analysis.sentiment === 'Negative' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                                    {analysis.sentiment}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                                <h3 className="text-blue-400 font-bold mb-4 uppercase tracking-wider text-sm">Key Insights</h3>
                                <ul className="space-y-2">
                                    {analysis.keyPoints.map((point, i) => (
                                        <li key={i} className="flex items-start text-sm text-slate-400">
                                            <span className="mr-2 text-blue-500">•</span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full"></div>
                                <h3 className="text-yellow-400 font-bold mb-2 uppercase tracking-wider text-sm">Recommendation</h3>
                                <p className="text-slate-200 font-medium">{analysis.recommendation}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AITutor context="User is analyzing a specific document/chart in the Quant Analyzer tool." />
        </div>
    );
};

export default QuantAnalyzer;