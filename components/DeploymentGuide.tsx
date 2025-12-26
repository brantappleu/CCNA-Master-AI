import React from 'react';
import { Copy, CheckCircle, Terminal } from 'lucide-react';

const CodeBlock = ({ code, label }: { code: string; label?: string }) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden my-4 border border-slate-700">
    {label && <div className="bg-slate-800 px-4 py-1 text-xs text-slate-400">{label}</div>}
    <div className="p-4 relative group">
      <code className="text-green-400 font-mono text-sm block whitespace-pre-wrap">{code}</code>
      <button 
        onClick={() => navigator.clipboard.writeText(code)}
        className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy to clipboard"
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const DeploymentGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Cloudflare Deployment Guide</h1>
        <p className="text-slate-600 text-lg">
          This application is configured as a standard <strong>Vite + React</strong> project. 
          It is ready for immediate deployment to Cloudflare Pages.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Terminal className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">1. Local Setup</h3>
            </div>
            <p className="text-slate-600 mb-4">If you want to run this locally before deploying:</p>
            <CodeBlock label="Terminal" code={`npm install
npm run dev`} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">2. Cloudflare Settings</h3>
            </div>
            <p className="text-slate-600 mb-4">Use these exact settings in your Cloudflare Dashboard:</p>
            <ul className="space-y-3 text-sm text-slate-700 font-mono">
                <li className="flex justify-between border-b pb-2">
                    <span>Framework Preset:</span>
                    <span className="font-bold text-blue-600">Vite / React</span>
                </li>
                <li className="flex justify-between border-b pb-2">
                    <span>Build command:</span>
                    <span className="font-bold text-blue-600">npm run build</span>
                </li>
                <li className="flex justify-between border-b pb-2">
                    <span>Build output dir:</span>
                    <span className="font-bold text-blue-600">dist</span>
                </li>
                 <li className="flex justify-between">
                    <span>Environment Vars:</span>
                    <span className="font-bold text-blue-600">API_KEY (Recommended)</span>
                </li>
            </ul>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-4">3. Full Deployment Steps</h3>
        <ol className="list-decimal pl-5 space-y-4 text-slate-700">
            <li>
                <strong>Push to Git:</strong> Create a GitHub/GitLab repository and push all these files to it.
            </li>
            <li>
                <strong>Cloudflare Dashboard:</strong> Go to <strong>Workers & Pages</strong> &gt; <strong>Create Application</strong> &gt; <strong>Connect to Git</strong>.
            </li>
            <li>
                <strong>Select Repo:</strong> Choose the repository you just created.
            </li>
            <li>
                <strong>Configuration:</strong> Cloudflare should automatically detect "Vite". If not, manually enter the settings listed above.
            </li>
            <li>
                <strong>Environment Variable:</strong> 
                Add a variable named <code>API_KEY</code> with your Gemini API key. 
                <span className="block text-sm text-slate-500 mt-1">
                    (If you skip this, users will need to manually enter the key in the Settings menu of the deployed app).
                </span>
            </li>
            <li>
                <strong>Deploy:</strong> Click "Save and Deploy".
            </li>
        </ol>
      </div>

       <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start space-x-4">
          <div className="mt-1">
            <Terminal className="text-blue-600 w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900">Direct Upload (Optional)</h4>
            <p className="text-blue-800 text-sm mt-1">
              If you don't want to use Git, you can build locally and upload using Wrangler CLI:
            </p>
            <div className="mt-3 bg-slate-900 rounded p-3">
                 <code className="text-green-400 font-mono text-xs">
                    npm run build<br/>
                    npx wrangler pages deploy dist --project-name ccna-master-ai
                 </code>
            </div>
          </div>
       </div>

    </div>
  );
};

export default DeploymentGuide;