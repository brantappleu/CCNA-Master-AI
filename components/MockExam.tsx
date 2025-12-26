import React, { useState } from 'react';
import { CCNA_DOMAINS } from '../constants';
import { generateExamQuestions } from '../services/geminiService';
import { ExamQuestion } from '../types';
import { CheckCircle, XCircle, Play, Loader } from 'lucide-react';

const MockExam: React.FC = () => {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(CCNA_DOMAINS[0]);
  const [examState, setExamState] = useState<'setup' | 'active' | 'review'>('setup');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const startExam = async () => {
    setLoading(true);
    try {
      const jsonStr = await generateExamQuestions(selectedDomain, 5);
      const data = JSON.parse(jsonStr);
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

  const submitExam = () => {
    setExamState('review');
  };

  const getScore = () => {
    return questions.filter(q => q.userAnswer === q.correctAnswer).length;
  };

  if (examState === 'setup') {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">CCNA Mock Exam Generator</h2>
        <p className="text-slate-600 mb-8">Select a knowledge domain. AI will generate unique questions based on the latest 200-301 curriculum.</p>
        
        <div className="mb-8">
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
          onClick={startExam}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
        >
          {loading ? <Loader className="animate-spin" /> : <Play />}
          <span>{loading ? 'Generating Exam...' : 'Start Assessment'}</span>
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">
            {examState === 'review' ? `Result: ${getScore()}/${questions.length}` : `Question ${currentQuestionIdx + 1} of ${questions.length}`}
        </h2>
        {examState === 'active' && (
            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {selectedDomain}
            </span>
        )}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 mb-6">
        <p className="text-lg text-slate-800 font-medium mb-6">{currentQ.question}</p>
        
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            let btnClass = "w-full text-left p-4 rounded-lg border transition-all ";
            
            if (examState === 'active') {
               btnClass += currentQ.userAnswer === idx 
                ? "border-blue-500 bg-blue-50 text-blue-800" 
                : "border-slate-200 hover:bg-slate-50";
            } else {
                // Review Mode Logic
                if (idx === currentQ.correctAnswer) btnClass += "border-green-500 bg-green-50 text-green-900";
                else if (currentQ.userAnswer === idx) btnClass += "border-red-500 bg-red-50 text-red-900";
                else btnClass += "border-slate-200 opacity-50";
            }

            return (
              <button
                key={idx}
                onClick={() => examState === 'active' && handleAnswer(idx)}
                disabled={examState === 'review'}
                className={btnClass}
              >
                <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full border border-current mr-3 flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                    {examState === 'review' && idx === currentQ.correctAnswer && <CheckCircle className="ml-auto w-5 h-5 text-green-600" />}
                    {examState === 'review' && idx === currentQ.userAnswer && idx !== currentQ.correctAnswer && <XCircle className="ml-auto w-5 h-5 text-red-600" />}
                </div>
              </button>
            );
          })}
        </div>
        
        {examState === 'review' && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-2">Explanation:</h4>
                <p className="text-slate-600">{currentQ.explanation}</p>
            </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
          disabled={currentQuestionIdx === 0}
          className="px-6 py-2 text-slate-600 disabled:opacity-50"
        >
          Previous
        </button>

        {currentQuestionIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next
          </button>
        ) : examState === 'active' ? (
          <button
            onClick={submitExam}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
          >
            Submit Exam
          </button>
        ) : (
             <button
            onClick={() => setExamState('setup')}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
          >
            New Exam
          </button>
        )}
      </div>
    </div>
  );
};

export default MockExam;