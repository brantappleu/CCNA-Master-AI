import React, { useState, useEffect } from 'react';
import { CCNA_DOMAINS } from '../constants';
import { generateExamQuestions, generateFullMockExam } from '../services/geminiService';
import { ExamQuestion } from '../types';
import { CheckCircle, XCircle, Play, Loader, Clock, Flag, AlertTriangle, Trophy } from 'lucide-react';

interface ExtendedQuestion extends ExamQuestion {
  userAnswer?: number;
  marked?: boolean;
  domain?: string;
}

const MockExam: React.FC = () => {
  const [questions, setQuestions] = useState<ExtendedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(CCNA_DOMAINS[0]);
  const [mode, setMode] = useState<'drill' | 'simulation'>('drill');
  
  // 'setup' -> 'active' -> 'review'
  const [examState, setExamState] = useState<'setup' | 'active' | 'review'>('setup');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  
  // Timer state (in seconds)
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer Effect
  useEffect(() => {
    let timer: any;
    if (examState === 'active' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examState, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startExam = async () => {
    setLoading(true);
    try {
      let data: ExtendedQuestion[] = [];
      
      if (mode === 'drill') {
        const jsonStr = await generateExamQuestions(selectedDomain, 5);
        data = JSON.parse(jsonStr);
        setTimeLeft(0); // No timer for drills usually, or infinite
      } else {
        // Simulation Mode: ~20 questions, 30 minutes (scaled down from real exam)
        const jsonStr = await generateFullMockExam(20);
        data = JSON.parse(jsonStr);
        setTimeLeft(30 * 60); 
      }

      setQuestions(data);
      setExamState('active');
      setCurrentQuestionIdx(0);
    } catch (e) {
      alert("Failed to generate questions. Please check API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIdx: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIdx].userAnswer = optionIdx;
    setQuestions(updatedQuestions);
  };

  const toggleMark = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIdx].marked = !updatedQuestions[currentQuestionIdx].marked;
    setQuestions(updatedQuestions);
  }

  const submitExam = () => {
    setExamState('review');
  };

  const calculateScore = () => {
    const correctCount = questions.filter(q => q.userAnswer === q.correctAnswer).length;
    const total = questions.length;
    // Simulate Cisco Scoring: Scale 300 to 1000
    // Formula: 300 + (Correct / Total) * 700
    const score = Math.round(300 + (correctCount / total) * 700);
    const isPass = score >= 825;
    return { score, isPass, correctCount, total };
  };

  // --- Render Setup Screen ---
  if (examState === 'setup') {
    return (
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4 bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600">
             <Flag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Topic Drill</h2>
          <p className="text-slate-600 mb-6 flex-1">Focus on specific weak points. Select a domain and get 5 targeted AI-generated questions with detailed Chinese explanations.</p>
          
          <div className="mb-6">
            <label className="block text-left text-sm font-medium text-slate-700 mb-2">Select Domain</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
            >
              {CCNA_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <button 
            onClick={() => { setMode('drill'); startExam(); }}
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all"
          >
            {loading && mode === 'drill' ? <Loader className="animate-spin" /> : <Play />}
            <span>Start Drill</span>
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
          <div className="mb-4 bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center text-yellow-700">
             <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Full CCNA Simulation</h2>
          <p className="text-slate-600 mb-6 flex-1">
            Simulate the real exam experience.
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-slate-500">
                <li>Weighted Distribution (20/20/25/10/15/10)</li>
                <li>Timed Mode (30 Mins)</li>
                <li>Cisco Scoring (300-1000 scale)</li>
                <li>Review Flagging System</li>
            </ul>
          </p>

          <button 
            onClick={() => { setMode('simulation'); startExam(); }}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-blue-200 shadow-lg"
          >
            {loading && mode === 'simulation' ? <Loader className="animate-spin" /> : <Clock />}
            <span>Start Simulation Exam</span>
          </button>
        </div>
      </div>
    );
  }

  // --- Render Result Screen ---
  if (examState === 'review') {
    const { score, isPass, correctCount, total } = calculateScore();
    return (
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
            <div className={`p-8 text-center ${isPass ? 'bg-green-50' : 'bg-red-50'}`}>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Exam Result</h2>
                <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="text-5xl font-black text-slate-900">{score}</div>
                    <div className="text-left text-sm text-slate-500">
                        / 1000<br/>
                        <span className="font-bold">Passing: 825</span>
                    </div>
                </div>
                {isPass ? (
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-200 text-green-800 font-bold">
                        <CheckCircle className="w-5 h-5 mr-2" /> PASS
                    </div>
                ) : (
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-200 text-red-800 font-bold">
                        <XCircle className="w-5 h-5 mr-2" /> FAIL
                    </div>
                )}
                <p className="mt-4 text-slate-600">
                    You answered {correctCount} out of {total} questions correctly.
                </p>
            </div>

            <div className="p-8">
                <h3 className="font-bold text-lg mb-4">Detailed Review</h3>
                <div className="space-y-6">
                    {questions.map((q, idx) => (
                        <div key={idx} className={`p-4 rounded-lg border ${q.userAnswer === q.correctAnswer ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-slate-700">Q{idx+1}.</span>
                                <span className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded border">{q.domain || selectedDomain}</span>
                            </div>
                            <p className="mb-3 font-medium text-slate-800">{q.question}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                {q.options.map((opt, i) => (
                                    <div key={i} className={`text-sm p-2 rounded ${
                                        i === q.correctAnswer ? 'bg-green-200 text-green-900 font-bold' : 
                                        i === q.userAnswer ? 'bg-red-200 text-red-900 line-through' : 'bg-white text-slate-600'
                                    }`}>
                                        {String.fromCharCode(65+i)}. {opt}
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white p-3 rounded border border-slate-100 text-sm text-slate-600">
                                <span className="font-bold text-blue-600">解析 (Explanation): </span>
                                {q.explanation}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setExamState('setup')}
                    className="mt-8 w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-900 transition-colors"
                >
                    Return to Exam Center
                </button>
            </div>
        </div>
    );
  }

  // --- Render Active Exam Screen ---
  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 flex justify-between items-center">
        <div>
            <h2 className="text-lg font-bold text-slate-800">
                Question {currentQuestionIdx + 1} <span className="text-slate-400 font-normal">/ {questions.length}</span>
            </h2>
            {mode === 'simulation' && (
                <span className="text-xs text-slate-500 font-mono">{currentQ.domain}</span>
            )}
        </div>
        
        <div className="flex items-center space-x-4">
            {mode === 'simulation' && (
                <div className={`flex items-center space-x-2 font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                    <Clock className="w-5 h-5" />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            )}
            <button 
                onClick={toggleMark}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded border transition-colors ${currentQ.marked ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
            >
                <Flag className="w-4 h-4" fill={currentQ.marked ? "currentColor" : "none"} />
                <span className="text-sm">Mark</span>
            </button>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 bg-white p-6 md:p-10 rounded-xl shadow-lg border border-slate-100 overflow-y-auto mb-4">
        <p className="text-xl text-slate-800 font-medium leading-relaxed mb-8">{currentQ.question}</p>
        
        <div className="space-y-4">
          {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center group ${
                    currentQ.userAnswer === idx 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                }`}
              >
                <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 font-bold text-sm transition-colors ${
                    currentQ.userAnswer === idx
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-slate-300 text-slate-500 group-hover:border-blue-400"
                }`}>
                    {String.fromCharCode(65 + idx)}
                </span>
                <span className={`text-base ${currentQ.userAnswer === idx ? 'text-blue-900 font-medium' : 'text-slate-700'}`}>
                    {opt}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
          disabled={currentQuestionIdx === 0}
          className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 font-medium"
        >
          Previous
        </button>

        {/* Question Navigator (Desktop only usually, but simplified here) */}
        <div className="hidden md:flex items-center justify-center space-x-1 overflow-x-auto px-4">
            {questions.map((q, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${
                    i === currentQuestionIdx ? 'bg-blue-600' :
                    q.marked ? 'bg-orange-400' :
                    q.userAnswer !== undefined ? 'bg-slate-400' : 'bg-slate-200'
                }`} />
            ))}
        </div>

        {currentQuestionIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm"
          >
            Next Question
          </button>
        ) : (
          <button
            onClick={submitExam}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-sm flex items-center justify-center space-x-2"
          >
            <span>Submit Exam</span>
            <CheckCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MockExam;