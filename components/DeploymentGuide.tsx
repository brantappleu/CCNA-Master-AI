import React from 'react';
import { Copy } from 'lucide-react';

const CodeBlock = ({ code }: { code: string }) => (
  <div className="bg-slate-900 rounded-lg p-4 my-2 relative group">
    <code className="text-green-400 font-mono text-sm block whitespace-pre-wrap">{code}</code>
    <button 
      onClick={() => navigator.clipboard.writeText(code)}
      className="absolute top-2 right-2 p-1 bg-slate-800 rounded text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
      title="Copy"
    >
      <Copy className="w-4 h-4" />
    </button>
  </div>
);

const DeploymentGuide: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">How to Deploy to Cloudflare Pages</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-600 mb-4">
          This application is built with React 18, TypeScript, and Tailwind CSS. It is fully compatible with Cloudflare Pages as a static site.
        </p>

        <h3 className="font-bold text-lg mt-6 text-slate-800">1. Project Setup</h3>
        <p>Ensure you have Node.js installed. Create a folder and save the provided files.</p>
        <CodeBlock code={`# Install dependencies (if you were running locally)
npm install react react-dom lucide-react recharts framer-motion @google/genai react-markdown tailwindcss

# Or specifically for this structure, just ensure your package.json has these.`} />

        <h3 className="font-bold text-lg mt-6 text-slate-800">2. Create `package.json`</h3>
        <p>If you downloaded the code files manually, create a <code>package.json</code> at the root:</p>
        <CodeBlock code={`{
  "name": "ccna-master-ai",
  "version": "1.0.0",
  "scripts": {
    "start": "parcel index.html",
    "build": "parcel build index.html --dist-dir dist"
  },
  "dependencies": {
    "@google/genai": "^0.0.x",
    "lucide-react": "^0.292.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-markdown": "^9.0.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "parcel": "^2.10.0",
    "process": "^0.11.10",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0"
  }
}`} />
        <p className="text-sm text-slate-500 mt-2">Note: We use Parcel here for simplicity, but Vite or CRA works too. Ensure you have a bundler.</p>

        <h3 className="font-bold text-lg mt-6 text-slate-800">3. Cloudflare Pages Deployment</h3>
        <ol className="list-decimal pl-5 space-y-2 text-slate-700">
            <li>Push your code to a GitHub repository.</li>
            <li>Log in to the Cloudflare Dashboard and go to <strong>Workers & Pages</strong>.</li>
            <li>Click <strong>Create Application</strong> &gt; <strong>Pages</strong> &gt; <strong>Connect to Git</strong>.</li>
            <li>Select your repository.</li>
            <li><strong>Build Settings:</strong>
                <ul className="list-disc pl-5 mt-1 text-sm">
                    <li>Framework Preset: <code>None</code> (or Parcel if available)</li>
                    <li>Build command: <code>npm run build</code></li>
                    <li>Output directory: <code>dist</code></li>
                </ul>
            </li>
            <li><strong>Environment Variables:</strong>
                <ul className="list-disc pl-5 mt-1 text-sm">
                    <li>Add <code>API_KEY</code> with your Google GenAI API key.</li>
                    <li>This ensures the app works without the user manually entering the key in Settings.</li>
                </ul>
            </li>
        </ol>

        <h3 className="font-bold text-lg mt-6 text-slate-800">Security Note</h3>
        <p className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 text-sm">
           The login credential (admin / Bing123456) is handled client-side in this demo code. For a production environment, implement authentication using Cloudflare Access or Firebase Auth.
        </p>
      </div>
    </div>
  );
};

export default DeploymentGuide;