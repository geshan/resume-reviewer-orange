import { useState, useEffect } from 'react';
import { FileText, Briefcase, CheckCircle2, ChevronDown, ChevronUp, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { reviewResume, type ReviewResult } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const loadingSteps = [
    "Parsing objective",
    "Analysing job descriptions",
    "Creating a personalised review",
    "Applying XYZ formula logic",
    "Finalising recommendations"
  ];

  useEffect(() => {
    if (isAnalyzing) {
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < loadingSteps.length) {
          setLoadingMessage(loadingSteps[currentStep]);
          currentStep++;
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const handleReview = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      setError('Please provide both a resume and a job description.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const reviewResult = await reviewResume(resume, jobDescription);
      setResult(reviewResult);
      if (reviewResult.categories.length > 0) {
        setExpandedCategories({ [reviewResult.categories[0].title]: true });
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while analysing your resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleCategory = (title: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] font-sans text-[#2d2d2d] pb-20">
      <header className="bg-white border-b border-orange-100 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-orange p-2 rounded-lg">
              <FileText className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-orange-dark">
              Resume Reviewer
            </h1>
          </div>
          <div className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            AI-Powered Analysis
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-10">
        {!result && !isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-orange-dark font-semibold">
                <FileText className="w-5 h-5" />
                <h2>Your Resume</h2>
              </div>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full h-[400px] p-4 rounded-xl border-2 border-orange-100 focus:border-brand-orange focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white resize-none shadow-sm"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-orange-dark font-semibold">
                <Briefcase className="w-5 h-5" />
                <h2>Job Description</h2>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-[400px] p-4 rounded-xl border-2 border-orange-100 focus:border-brand-orange focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white resize-none shadow-sm"
              />
            </div>

            <div className="md:col-span-2 flex flex-col items-center gap-4 mt-4">
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
              <button
                onClick={handleReview}
                className="bg-brand-orange hover:bg-brand-orange-dark text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-200"
              >
                <Sparkles className="w-5 h-5" />
                Analyse Resume
              </button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-8"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-orange-100 border-t-brand-orange rounded-full animate-spin" />
                <Loader2 className="w-10 h-10 text-brand-orange absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-brand-orange-dark">{loadingMessage}...</h3>
                <p className="text-orange-600 opacity-70">Our AI is meticulously reviewing every detail.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {result && !isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-orange-50 flex flex-col md:flex-row items-center gap-10">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" fill="transparent" stroke="#fff7ed" strokeWidth="12" />
                  <circle
                    cx="96" cy="96" r="88" fill="transparent" stroke="#ff6b00" strokeWidth="12"
                    strokeDasharray={552.92}
                    strokeDashoffset={552.92 * (1 - result.overallScore / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-brand-orange-dark">{result.overallScore}%</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Match Score</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <h2 className="text-3xl font-bold text-brand-orange-dark">Review Summary</h2>
                <p className="text-lg leading-relaxed text-gray-600 italic">"{result.summary}"</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button 
                    onClick={() => {setResult(null); setResume(''); setJobDescription('');}}
                    className="text-sm font-bold text-brand-orange hover:text-brand-orange-dark underline underline-offset-4"
                  >
                    Start New Review
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-brand-orange-dark flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Detailed Recommendations
              </h3>
              
              <div className="space-y-4">
                {result.categories.map((category) => (
                  <div key={category.title} className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category.title)}
                      className="w-full px-6 py-5 flex items-center justify-between hover:bg-orange-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                          category.score >= 80 ? "bg-green-100 text-green-700" : 
                          category.score >= 50 ? "bg-orange-100 text-orange-700" : 
                          "bg-red-100 text-red-700"
                        )}>
                          {category.score}
                        </div>
                        <span className="text-lg font-bold text-gray-800">{category.title}</span>
                      </div>
                      {expandedCategories[category.title] ? <ChevronUp /> : <ChevronDown />}
                    </button>

                    <AnimatePresence>
                      {expandedCategories[category.title] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-6"
                        >
                          <div className="pt-2 space-y-6">
                            {category.suggestions.map((item, idx) => (
                              <div key={idx} className="space-y-3 p-4 bg-orange-50/50 rounded-xl border border-orange-100/50">
                                {item.original && (
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Current Sentence</span>
                                    <p className="text-sm text-gray-500 line-through decoration-red-300">{item.original}</p>
                                  </div>
                                )}
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-500">Suggested Change (XYZ Formula)</span>
                                  <p className="text-base font-medium text-gray-800 bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                                    {item.suggestion}
                                  </p>
                                </div>
                                <div className="flex gap-2 items-start">
                                  <div className="mt-1">
                                    <Sparkles className="w-3 h-3 text-brand-orange" />
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                    <span className="font-bold text-brand-orange-dark">Why:</span> {item.reason}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
