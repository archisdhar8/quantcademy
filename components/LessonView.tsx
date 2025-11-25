
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Module, LessonResponse, QuizResponse } from '../types';
import { getLessonContent, getQuantStrategyCode, generateQuiz } from '../services/geminiService';
import StockChart from './StockChart';
import { fetchStockData } from '../services/polygonService';
import { ChartType, StockBar } from '../types';
import Visualizer from './Visualizer';
import StrategySimulation from './StrategySimulation';
import AITutor from './AITutor';

interface LessonViewProps {
  module: Module;
  topic: string | null;
  polygonKey: string;
}

const LessonView: React.FC<LessonViewProps> = ({ module, topic, polygonKey }) => {
  const [lessonData, setLessonData] = useState<LessonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState<StockBar[]>([]);
  const [ticker, setTicker] = useState("SPY");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  
  // Quiz State
  const [quizMode, setQuizMode] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  // Load lesson content
  useEffect(() => {
    const loadLesson = async () => {
      setLessonData(null);
      setGeneratedCode(null);
      setQuizMode(false); // Reset quiz
      if (!topic) {
        return;
      }
      setLoading(true);
      const data = await getLessonContent(topic, module.title);
      setLessonData(data);
      setLoading(false);
    };
    loadLesson();
  }, [topic, module]);

  // Load market data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchStockData(ticker, polygonKey);
        setMarketData(data);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, [ticker, polygonKey]);

  const handleGenerateCode = async () => {
    if (!topic) return;
    setLoading(true); // Re-use loading or adding a specific loading state for code
    const code = await getQuantStrategyCode(topic);
    setGeneratedCode(code);
    setLoading(false);
  };

  const handleStartQuiz = async () => {
      if (!topic) return;
      setQuizLoading(true);
      setQuizMode(true);
      setScore(0);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setShowResult(false);
      
      const data = await generateQuiz(topic, module.difficulty);
      setQuizData(data);
      setQuizLoading(false);
  };

  const handleAnswerClick = (index: number) => {
      if (showResult || !quizData) return;
      
      setSelectedOption(index);
      setShowResult(true);
      
      if (index === quizData.questions[currentQuestionIndex].correctIndex) {
          setScore(s => s + 1);
      }
  };

  const handleNextQuestion = () => {
      if (!quizData) return;
      if (currentQuestionIndex < quizData.questions.length - 1) {
          setCurrentQuestionIndex(p => p + 1);
          setSelectedOption(null);
          setShowResult(false);
      } else {
          // Finished
          // Maybe show summary logic here if needed
      }
  };

  const isQuantModule = module.id === 'intro-quant';
  const isQuizFinished = quizData && currentQuestionIndex === quizData.questions.length - 1 && showResult;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Bar: Data Controls */}
      <div className="h-14 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center space-x-4">
            <h2 className="text-sm font-mono text-slate-400">{module.title} <span className="text-slate-600">/</span> <span className="text-emerald-400 font-bold">{topic}</span></h2>
        </div>
        <div className="flex items-center space-x-3">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Market Feed</label>
            <input 
                type="text" 
                value={ticker} 
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="bg-slate-800 border border-slate-700 text-emerald-400 px-2 py-0.5 rounded text-xs w-20 font-mono text-center focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Content & Charts */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 max-w-5xl mx-auto w-full custom-scrollbar relative">
            
            {/* Live Chart Area - Always Visible Context */}
            <div className="w-full h-64 bg-slate-900/50 rounded-xl border border-slate-800/60 p-4 mb-8 relative group">
                <div className="absolute top-3 left-4 z-10 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Market Data: {ticker}</h4>
                </div>
                <StockChart data={marketData} type={ChartType.LINE} />
            </div>

            {/* Educational Content Stream */}
            <div className="space-y-12 pb-20">
                {loading ? (
                   <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
                        <span className="font-mono text-sm text-emerald-400 animate-pulse">Constructing Quant Lesson...</span>
                   </div>
                ) : (
                   <>
                     {/* Safe optional chaining on steps to prevent undefined.map error */}
                     {lessonData?.steps?.map((step, idx) => (
                        <div key={idx} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold border border-emerald-500/20">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 w-full">
                                    <h3 className="text-xl font-semibold text-slate-200 mb-2">{step.title}</h3>
                                    <ReactMarkdown className="prose prose-invert prose-sm text-slate-400 max-w-none mb-6">
                                        {step.explanation}
                                    </ReactMarkdown>
                                    
                                    {/* Visualizer Injection */}
                                    {step.visualData && (
                                        <div className="mt-4 w-full">
                                            <div className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-2 ml-1">Flow Visualization</div>
                                            <Visualizer data={step.visualData} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                     ))}
                   </>
                )}
                
                {/* Quant Strategy Simulation Demo */}
                {!loading && isQuantModule && topic && (
                    <StrategySimulation strategyName={topic} />
                )}

                {/* Strategy Code Section */}
                {!loading && lessonData && (
                    <div className="pt-8 border-t border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-200">Algorithmic Implementation</h3>
                            {!generatedCode && (
                                <button 
                                    onClick={handleGenerateCode}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-900/20 flex items-center space-x-2 transform hover:scale-105"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                    <span>Generate Python Strategy</span>
                                </button>
                            )}
                        </div>

                        {generatedCode && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                                    <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                        <span className="text-xs text-slate-500 font-mono ml-2">strategy.py</span>
                                    </div>
                                    <div className="p-4 overflow-x-auto">
                                        <ReactMarkdown 
                                            components={{
                                                code({node, inline, className, children, ...props}: any) {
                                                    return !inline ? (
                                                        <pre className="bg-transparent p-0 text-sm font-mono text-emerald-300">
                                                            <code {...props}>{children}</code>
                                                        </pre>
                                                    ) : (
                                                        <code className="bg-slate-800 px-1 rounded text-emerald-200 text-xs" {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}
                                        >
                                            {generatedCode}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {/* QUIZ SECTION */}
                {!loading && lessonData && (
                    <div className="pt-12 pb-20">
                        {!quizMode ? (
                            <div className="flex flex-col items-center border border-slate-800 bg-slate-900/30 p-8 rounded-2xl text-center">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-3xl">🎯</div>
                                <h3 className="text-xl font-bold text-white mb-2">Mastery Check</h3>
                                <p className="text-slate-400 mb-6 max-w-md">Test your understanding of {topic} with specific scenario-based questions.</p>
                                <button 
                                    onClick={handleStartQuiz}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105"
                                >
                                    Start Assessment
                                </button>
                            </div>
                        ) : quizLoading ? (
                             <div className="flex flex-col items-center py-12">
                                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
                                <span className="text-blue-400 font-mono text-xs animate-pulse">Generating Scenarios...</span>
                             </div>
                        ) : quizData && (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                                    <div 
                                        className="h-full bg-blue-500 transition-all duration-300" 
                                        style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
                                    ></div>
                                </div>

                                <div className="mb-6 mt-2 flex justify-between items-center">
                                    <span className="text-xs font-mono text-slate-500 uppercase">Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
                                    <span className="text-xs font-mono text-blue-400">Score: {score}</span>
                                </div>

                                <h3 className="text-lg md:text-xl font-bold text-white mb-6">
                                    {quizData.questions[currentQuestionIndex].question}
                                </h3>

                                <div className="space-y-3 mb-6">
                                    {quizData.questions[currentQuestionIndex].options.map((opt, idx) => {
                                        let btnClass = "w-full text-left p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors";
                                        
                                        if (showResult) {
                                            if (idx === quizData.questions[currentQuestionIndex].correctIndex) {
                                                btnClass = "w-full text-left p-4 rounded-xl border border-emerald-500 bg-emerald-500/20 text-emerald-100";
                                            } else if (idx === selectedOption) {
                                                btnClass = "w-full text-left p-4 rounded-xl border border-red-500 bg-red-500/20 text-red-100";
                                            } else {
                                                btnClass = "w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-900/30 text-slate-500 opacity-50";
                                            }
                                        }

                                        return (
                                            <button 
                                                key={idx}
                                                disabled={showResult}
                                                onClick={() => handleAnswerClick(idx)}
                                                className={btnClass}
                                            >
                                                <div className="flex items-center">
                                                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 text-xs font-bold ${
                                                        showResult && idx === quizData.questions[currentQuestionIndex].correctIndex ? 'border-emerald-500 bg-emerald-500 text-white' :
                                                        showResult && idx === selectedOption ? 'border-red-500 bg-red-500 text-white' :
                                                        'border-slate-600 text-slate-400'
                                                    }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    {opt}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                {showResult && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-6">
                                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Explanation</div>
                                            <p className="text-sm text-slate-300">
                                                {quizData.questions[currentQuestionIndex].explanation}
                                            </p>
                                        </div>
                                        
                                        {!isQuizFinished ? (
                                             <button 
                                                onClick={handleNextQuestion}
                                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold"
                                             >
                                                Next Question
                                             </button>
                                        ) : (
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-white mb-2">Quiz Complete!</div>
                                                <div className="text-emerald-400 font-mono mb-4">Final Score: {score} / {quizData.questions.length}</div>
                                                <button 
                                                    onClick={() => { setQuizMode(false); }}
                                                    className="px-6 py-2 border border-slate-600 hover:bg-slate-800 rounded-lg text-slate-300"
                                                >
                                                    Return to Lesson
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Right: AI Tutor Chat */}
        <AITutor context={`Learning Module: ${module.title} - ${topic}. ${quizMode ? `User is taking a quiz. Current Score: ${score}` : ''}`} />
      </div>
    </div>
  );
};

export default LessonView;
