import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Award, Clock, Book } from 'lucide-react';

const mockData = [
  { day: 'Mon', score: 65 },
  { day: 'Tue', score: 70 },
  { day: 'Wed', score: 68 },
  { day: 'Thu', score: 85 },
  { day: 'Fri', score: 82 },
  { day: 'Sat', score: 90 },
  { day: 'Sun', score: 95 },
];

const StatCard = ({ icon: Icon, title, value, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
    <div className={`p-4 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back, Admin</h1>
          <p className="text-slate-500">Your CCNA readiness is improving.</p>
        </div>
        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mt-4 md:mt-0 inline-block">
          Ready for Exam: 78%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Book} title="Topics Mastered" value="12/25" color="text-blue-600 bg-blue-600" />
        <StatCard icon={Clock} title="Study Hours" value="34.5" color="text-purple-600 bg-purple-600" />
        <StatCard icon={Award} title="Avg. Mock Score" value="820/1000" color="text-orange-600 bg-orange-600" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Performance Trend</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#2563eb" fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold mb-4">Recommended Next Steps</h3>
            <ul className="space-y-3">
                <li className="flex items-center space-x-2 text-sm text-slate-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Review OSPF LSA types in IP Connectivity</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-slate-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Practice Standard ACL lab configuration</span>
                </li>
                 <li className="flex items-center space-x-2 text-sm text-slate-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Take a mock exam on Security Fundamentals</span>
                </li>
            </ul>
         </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-sm text-white">
            <h3 className="font-bold mb-2">Exam Tip of the Day</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
                "Don't forget that on a modern router, 'ip routing' is typically enabled by default, but on a Layer 3 switch, you must explicitly enable it to route between VLANs."
            </p>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;