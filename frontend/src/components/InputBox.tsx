'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Coins } from 'lucide-react';

interface InputBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (idea: string) => void;
  disabled?: boolean;
  credits?: number;
}

export default function InputBox({ value, onChange, onSubmit, disabled, credits }: InputBoxProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
    }
  };

  const hasInsufficientCredits = credits !== undefined && credits < 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Glassmorphism input container */}
          <div className={`
            relative rounded-2xl border transition-all duration-300 z-10
            ${isFocused 
              ? 'border-purple-400/50 bg-white/10 backdrop-blur-md shadow-2xl shadow-purple-500/20' 
              : 'border-white/20 bg-white/5 backdrop-blur-sm'
            }
            ${hasInsufficientCredits ? 'border-red-400/50 bg-red-500/5' : ''}
          `}>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                hasInsufficientCredits 
                  ? "Insufficient credits. You need at least 2 credits to generate requirements."
                  : "Describe your product idea... (e.g., A food delivery app with real-time tracking and AI-powered recommendations)"
              }
              className="w-full px-6 py-4 bg-transparent text-white placeholder-purple-200/60 resize-none outline-none text-lg leading-relaxed relative z-10"
              rows={3}
              disabled={disabled}
              style={{ color: 'white' }}
            />
            
            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={!value.trim() || disabled || hasInsufficientCredits}
              whileHover={{ scale: disabled ? 1 : 1.05 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              className={`
                absolute right-4 bottom-4 p-3 rounded-xl transition-all duration-300 z-20
                ${value.trim() && !disabled && !hasInsufficientCredits
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 shadow-lg shadow-purple-500/30 cursor-pointer'
                  : 'bg-white/10 border border-white/20 cursor-not-allowed'
                }
                ${hasInsufficientCredits ? 'bg-red-500/20 border-red-400/30' : ''}
              `}
            >
              {disabled ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
              ) : hasInsufficientCredits ? (
                <Coins className="w-5 h-5 text-red-400" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </motion.button>
          </div>

          {/* Gradient border effect */}
          <div className={`
            absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 
            transition-opacity duration-300 pointer-events-none ${isFocused ? 'opacity-100' : 'opacity-0'}
          `} />
        </div>
      </form>

      {/* Helpful tips or credit info */}
      {!value && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          {hasInsufficientCredits ? (
            <div className="flex items-center justify-center space-x-2 text-red-300">
              <Coins className="w-4 h-4" />
              <p className="text-gray-300 text-sm">
                You need at least 2 credits to generate requirements. You&apos;ll receive 1 credit back if the process fails.
              </p>
            </div>
          ) : (
            <p className="text-purple-200/60 text-sm">
              💡 Be specific about the problem you&apos;re solving, target audience, and key features
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
