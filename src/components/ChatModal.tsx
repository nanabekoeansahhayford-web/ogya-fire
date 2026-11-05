import React, { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCheck, Clock, ShieldCheck } from 'lucide-react';
import { Listing, ChatMessage } from '../types/marketplace';
import { getChatMessages, appendChatMessage, formatPrice } from '../utils/storage';

interface ChatModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ listing, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listing && isOpen) {
      const history = getChatMessages(listing.id);
      setMessages(history);
    }
  }, [listing, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen || !listing) return null;

  const quickPrompts = [
    'Is this item still available?',
    'Where is the exact meetup location?',
    'Can I inspect it today or tomorrow?',
    'What is your final best price?',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      listingId: listing.id,
      sender: 'buyer',
      text,
      timestamp: 'Just now',
    };

    const updated = appendChatMessage(listing.id, newMsg);
    setMessages(updated);
    setInputText('');

    // Simulate realistic seller response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let reply = `Thank you for reaching out! Yes, it's available. You can inspect it at ${listing.location}. When are you free?`;
      if (text.toLowerCase().includes('price') || text.toLowerCase().includes('offer')) {
        reply = `I appreciate your interest! ${listing.isNegotiable ? 'Since it is negotiable, I can give a modest discount upon in-person inspection.' : 'The price is fixed as listed, considering the brand new quality.'}`;
      } else if (text.toLowerCase().includes('location') || text.toLowerCase().includes('where')) {
        reply = `I am located at ${listing.location}. We can meet at a verified safe landmark like the police station or shopping mall.`;
      }

      const sellerReply: ChatMessage = {
        id: `msg-seller-${Date.now()}`,
        listingId: listing.id,
        sender: 'seller',
        text: reply,
        timestamp: 'Just now',
      };

      const finalMessages = appendChatMessage(listing.id, sellerReply);
      setMessages(finalMessages);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[85vh] sm:h-[650px] transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chat Header */}
        <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-amber-400">
                {listing.seller.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white">{listing.seller.name}</h4>
                <ShieldCheck size={14} className="text-emerald-400" />
              </div>
              <span className="text-[11px] text-slate-400">
                OGYA (FIRE) 🔥 Verified Seller · Typically replies in {listing.seller.responseTime}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Listing preview banner inside chat */}
        <div className="p-2.5 bg-slate-100 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs shrink-0">
          {listing.images && listing.images[0] && (
            <img
              src={listing.images[0]}
              alt={listing.title}
              referrerPolicy="no-referrer"
              className="w-12 h-10 object-cover rounded shrink-0 border border-slate-200 dark:border-slate-700"
            />
          )}
          <div className="truncate flex-1">
            <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{listing.title}</div>
            <div className="text-amber-700 dark:text-amber-400 font-extrabold tabular-nums">
              {formatPrice(listing.price, listing.currency)}
            </div>
          </div>
        </div>

        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-[#0b0f19]">
          {messages.map((m) => {
            const isMe = m.sender === 'buyer';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-br-xs shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 dark:text-slate-500 px-1 font-mono">
                  <span>{m.timestamp}</span>
                  {isMe && <CheckCheck size={12} className="text-amber-700 dark:text-amber-400" />}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 w-fit shadow-xs">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] ml-1">{listing.seller.name} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="p-2 bg-white dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {quickPrompts.map((q) => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700/60 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Type your message to seller..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-xl font-bold transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
