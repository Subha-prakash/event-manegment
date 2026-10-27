import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AiConversation } from '../types';
import {
  MessageSquare,
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "Reduce my decoration costs by 20%",
  "Suggest a birthday party for 15 children under ₹5,000",
  "Generate a vegetarian menu for 100 guests",
  "What tasks should I complete this week?",
  "Suggest venue alternatives and weather backups",
  "How should I structure my 90-day vendor payment timeline?"
];

export const ChatPage: React.FC = () => {
  const { activeEvent, formatCurrency, showToast, refreshActiveEvent } = useApp();

  const [messages, setMessages] = useState<AiConversation[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadHistory = async () => {
    if (!activeEvent) return;
    try {
      const history = await api.getAiConversations(activeEvent.id);
      setMessages(history);
    } catch (err) {
      console.error("Chat load error:", err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [activeEvent?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeEvent || loading) return;

    setInputText('');
    setLoading(true);

    // Optimistically add user message
    const tempUserMsg: AiConversation = {
      id: `tmp_${Date.now()}`,
      user_id: 'usr_me',
      event_id: activeEvent.id,
      role: 'user',
      message: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.sendChatMessage(activeEvent.id, text);
      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, res.message]);
      if (res.suggested_action) {
        setPendingAction(res.suggested_action);
      }
    } catch (err: any) {
      showToast(err.message || 'Chat error', 'error');
    } finally {
      setLoading(false);
    }
  };

interface ChatSuggestedAction {
  type: string;
  data: {
    category?: string;
    estimated_saving?: number;
    title?: string;
    description?: string;
    priority?: 'High' | 'Medium' | 'Low';
    due_date?: string;
    [key: string]: unknown;
  };
}

  const handleApplyAction = async (action: ChatSuggestedAction) => {
    if (!activeEvent) return;

    try {
      if (action.type === 'adjust_budget') {
        const category = action.data.category || 'Decoration and flowers';
        const estimatedSaving = Number(action.data.estimated_saving) || 0;
        const expenses = await api.getExpenses(activeEvent.id);
        const decorExpense = expenses.find(e => e.category === category);
        if (decorExpense) {
          const newEst = Math.max(0, decorExpense.estimated_amount - estimatedSaving);
          await api.updateExpense(activeEvent.id, decorExpense.id, {
            estimated_amount: newEst,
            notes: `Reduced by ${estimatedSaving} via AI recommendation`
          });
        }
        showToast(`Budget adjusted! Saved ${formatCurrency(estimatedSaving)} on ${category}`, 'success');
      } else if (action.type === 'add_task') {
        await api.addTask(activeEvent.id, action.data);
        showToast('New task added to preparation timeline!', 'success');
      }
      setPendingAction(null);
      await refreshActiveEvent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to apply action';
      showToast(msg, 'error');
    }
  };

  if (!activeEvent) {
    return <div className="text-center py-12 text-slate-500">Please select an event.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand-600 animate-spin" />
                Live Conversational Co-pilot
              </span>
              <span className="text-xs text-slate-500">• {activeEvent.name}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              AI Event Assistant
            </h1>
          </div>
          <div className="text-right text-xs text-slate-400 hidden sm:block">
            <span>Context: {activeEvent.guest_count} guests • {formatCurrency(activeEvent.budget)}</span>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Try asking:</span>
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 text-[11px] font-medium text-slate-600 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id || idx}
              className={`flex items-start gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-xs ${
                  isUser
                    ? 'bg-slate-900'
                    : 'bg-gradient-to-tr from-brand-600 to-indigo-600'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.message}</div>
                {msg.created_at && (
                  <span className={`block text-[10px] mt-1 ${isUser ? 'text-slate-400' : 'text-slate-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 text-slate-400 text-xs mr-auto">
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
              <span>EventGenie is formulating expert advice...</span>
            </div>
          </div>
        )}

        {/* Action Proposal Banner (Requires User Approval before changing data) */}
        {pendingAction && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 shadow-sm max-w-xl mx-auto my-4 animate-scale-up">
            <div className="flex items-center gap-2 text-brand-900 font-bold text-xs mb-1">
              <Lightbulb className="w-4 h-4 text-brand-600" />
              <span>AI Action Proposal (Approval Required)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {pendingAction.type === 'adjust_budget'
                ? `Would you like EventGenie to update your budget category "${pendingAction.data.category}" with estimated savings of ${formatCurrency(pendingAction.data.estimated_saving)}?`
                : `Would you like to add "${pendingAction.data.title}" to your active preparation tasks?`}
            </p>

            <div className="mt-3 flex items-center gap-2 justify-end">
              <button
                onClick={() => setPendingAction(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200/50"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleApplyAction(pendingAction)}
                className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Apply to Event</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="pt-3 border-t border-slate-200 shrink-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={loading}
            placeholder="Ask anything about budget, vendor negotiations, menus, or decoration ideas..."
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="absolute right-2 p-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          EventGenie uses your event's live budget and guest count. Changes to budgets or tasks require your explicit approval.
        </p>
      </div>

    </div>
  );
};
