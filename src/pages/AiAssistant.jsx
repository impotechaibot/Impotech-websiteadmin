import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateText, geminiReady } from '../lib/gemini.js';

const QUICK = [
  'এই মাসের বিক্রয় বাড়ানোর ৫টি আইডিয়া দাও',
  'বাইক অ্যাক্সেসরিজের জন্য একটি ফেসবুক পোস্ট লিখো',
  'নতুন প্রোডাক্ট লঞ্চের জন্য একটি ইমেইল ক্যাম্পেইন লিখো',
  'কাস্টমার রিটেনশন বাড়ানোর টিপস দাও',
];

export default function AiAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async (text) => {
    const prompt = text || input;
    if (!prompt.trim()) return;
    setMessages((m) => [...m, { role: 'user', text: prompt }]);
    setInput('');
    setBusy(true);
    try {
      const reply = await generateText(
        `তুমি ইম্পোটেক স্টোরের (বাংলাদেশি বাইক-অ্যাক্সেসরিজ ই-কমার্স) মার্কেটিং অ্যাসিস্ট্যান্ট। বাংলায় উত্তর দাও।\n\n${prompt}`
      );
      setMessages((m) => [...m, { role: 'ai', text: reply }]);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!geminiReady()) {
    return (
      <div className="card max-w-lg">
        <h1 className="text-xl font-semibold mb-2">AI অ্যাসিস্ট্যান্ট</h1>
        <p className="text-ink-muted text-sm">
          Gemini API key সেট করা নেই। <code className="text-accent">.env</code> ফাইলে
          <code className="text-accent"> VITE_GEMINI_API_KEY</code> যোগ করে অ্যাপ রিস্টার্ট করুন।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <Sparkles className="text-accent" size={22} /> AI অ্যাসিস্ট্যান্ট
      </h1>

      {messages.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK.map((q) => (
            <button key={q} className="card text-left text-sm hover:border-accent/50"
              onClick={() => send(q)}>{q}</button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-card px-4 py-3 text-sm whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-accent text-black' : 'bg-surface border border-line'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {busy && <div className="text-ink-muted text-sm">ভাবছে…</div>}
      </div>

      <div className="flex gap-2 sticky bottom-4">
        <input className="input" placeholder="কিছু জিজ্ঞাসা করুন…" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button className="btn-primary shrink-0" onClick={() => send()} disabled={busy}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
