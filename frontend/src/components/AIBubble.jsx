import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = 'http://localhost:5001';

const AIBubble = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const panelRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem('bloomai_messages');
    if (saved) setMessages(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('bloomai_messages', JSON.stringify(messages));
  }, [messages]);

  const toggle = () => setOpen(v => !v);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input.trim(), id: Date.now() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    const token = localStorage.getItem('token');

    if (!token) {
      const botMsg = {
        role: 'bot',
        text: 'Please log in to use BloomAI Tutor.',
        id: Date.now() + 1,
      };
      setMessages(m => [...m, botMsg]);
      setTimeout(() => panelRef.current?.scrollTo({ top: panelRef.current.scrollHeight, behavior: 'smooth' }), 50);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: userMsg.text }),
      });

      let text = '';
      let json = null;
      try {
        json = await res.json();
      } catch {
        // ignore JSON parse errors and fallback to text
      }

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          text = 'Your session expired. Please log in again.';
        } else {
          text = json?.error || json?.message || `Request failed (${res.status}).`;
        }
      } else {
        text = json?.answer || json?.explanation || json?.message || 'BloomAI could not respond.';
      }

      const botMsg = { role: 'bot', text: text || 'BloomAI could not respond.', id: Date.now() + 1 };
      setMessages(m => [...m, botMsg]);
      setTimeout(() => panelRef.current?.scrollTo({ top: panelRef.current.scrollHeight, behavior: 'smooth' }), 50);
    } catch (e) {
      const botMsg = { role: 'bot', text: 'Network error. Please try again later.', id: Date.now() + 2 };
      setMessages(m => [...m, botMsg]);
    }
  };

  return (
    <div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-3 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="text-indigo-400" />
                <div>
                  <div className="text-white font-black">BloomAI Tutor</div>
                  <div className="text-xs text-neutral-400">Personalized help — adaptive explanations</div>
                </div>
              </div>
              <button onClick={toggle} className="p-2 rounded-lg hover:bg-neutral-700">
                <X className="text-neutral-300" />
              </button>
            </div>

            <div ref={panelRef} className="p-3 max-h-64 overflow-y-auto space-y-3">
              {messages.length === 0 && (
                <div className="text-neutral-400 text-sm">Say hi to BloomAI — ask a short question about your topic.</div>
              )}
              {messages.map(m => (
                <div key={m.id} className={`${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-3 py-2 rounded-xl ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-neutral-800 flex items-center gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send(); }}
                placeholder="Ask BloomAI a question..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
              <button onClick={send} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-white font-bold">Send</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggle}
        aria-label="Open BloomAI Tutor"
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 rounded-full p-4 shadow-xl flex items-center justify-center"
      >
        {open ? <X className="text-white" /> : <MessageCircle className="text-white" />}
      </button>
    </div>
  );
};

export default AIBubble;
