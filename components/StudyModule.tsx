import React, { useState } from 'react';
import { STUDY_TOPICS } from '../constants';
import { generateStudyMaterial } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { BookOpen, RefreshCw, ChevronRight } from 'lucide-react';

const StudyModule: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSelectTopic = async (topicId: string, topicTitle: string) => {
    setSelectedTopic(topicId);
    setLoading(true);
    setContent("");
    
    const material = await generateStudyMaterial(topicTitle);
    setContent(material);
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar List */}
      <div className="lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-y-auto">
        <div className="p-4 border-b border-slate-100 bg-slate-50 sticky top-0">
          <h2 className="font-bold text-slate-800">Learning Modules</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {STUDY_TOPICS.map((topic) => (
            <li 
              key={topic.id}
              onClick={() => handleSelectTopic(topic.id, topic.title)}
              className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex justify-between items-center ${selectedTopic === topic.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
            >
              <div>
                <p className="font-medium text-slate-800">{topic.title}</p>
                <p className="text-xs text-slate-500">{topic.domain}</p>
              </div>
              <ChevronRight className={`w-4 h-4 ${selectedTopic === topic.id ? 'text-blue-500' : 'text-slate-300'}`} />
            </li>
          ))}
        </ul>
      </div>

      {/* Content Area */}
      <div className="lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        {!selectedTopic ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <BookOpen className="w-16 h-16 mb-4 text-slate-200" />
            <p className="text-lg font-medium">Select a module to start learning</p>
            <p className="text-sm">AI will generate a comprehensive study guide for you.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">
                    {STUDY_TOPICS.find(t => t.id === selectedTopic)?.title}
                </h3>
                <button 
                  onClick={() => handleSelectTopic(selectedTopic, STUDY_TOPICS.find(t => t.id === selectedTopic)?.title || '')}
                  className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-50"
                  title="Regenerate"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-32 bg-slate-100 rounded"></div>
                </div>
              ) : (
                <article className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-50">
                   {/* We rely on ReactMarkdown to render the Gemini output safely */}
                   {/* In a real app we might need a more complex renderer for code blocks */}
                   <ReactMarkdown>{content}</ReactMarkdown>
                </article>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudyModule;