'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizProps {
  question: string;
  options: QuizOption[];
  explanation: string;
}

export default function Quiz({ question, options, explanation }: QuizProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleOptionClick = (index: number) => {
    if (selectedIndex !== null) return; // Already answered

    setSelectedIndex(index);
    setShowExplanation(true);
  };

  const isCorrect = selectedIndex !== null && options[selectedIndex]?.isCorrect;

  return (
    <div className="not-prose my-8 bg-gradient-to-br from-accent-purple/10 to-accent-blue/10 rounded-xl p-6 border-2 border-accent-purple/30">
      {/* Quiz Icon */}
      <div className="flex items-center gap-2 mb-4">
        <div className="text-2xl">🎯</div>
        <h3 className="text-lg font-bold text-text-primary">퀴즈</h3>
      </div>

      {/* Question */}
      <div className="bg-surface rounded-xl p-4 mb-4 shadow-sm border border-border">
        <p className="text-text-primary font-semibold">{question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-4">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isThisCorrect = option.isCorrect;

          let bgColor = 'bg-surface hover:bg-surface/80';
          let borderColor = 'border-border';
          let textColor = 'text-text-primary';

          if (selectedIndex !== null) {
            if (isSelected) {
              if (isCorrect) {
                bgColor = 'bg-status-success/20';
                borderColor = 'border-status-success';
                textColor = 'text-status-success';
              } else {
                bgColor = 'bg-status-error/20';
                borderColor = 'border-status-error';
                textColor = 'text-status-error';
              }
            } else if (isThisCorrect) {
              bgColor = 'bg-status-success/10';
              borderColor = 'border-status-success/50';
              textColor = 'text-status-success';
            }
          }

          return (
            <motion.button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={selectedIndex !== null}
              whileHover={selectedIndex === null ? { scale: 1.02 } : {}}
              whileTap={selectedIndex === null ? { scale: 0.98 } : {}}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${bgColor} ${borderColor} ${textColor} ${
                selectedIndex === null ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Option Number */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    selectedIndex !== null && isSelected
                      ? isCorrect
                        ? 'bg-status-success text-white'
                        : 'bg-status-error text-white'
                      : selectedIndex !== null && isThisCorrect
                      ? 'bg-status-success text-white'
                      : 'bg-surface border border-border text-text-secondary'
                  }`}
                >
                  {index + 1}
                </div>

                {/* Option Text */}
                <div className="flex-1">{option.text}</div>

                {/* Result Icon */}
                {selectedIndex !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 text-xl"
                  >
                    {isSelected ? (
                      isCorrect ? (
                        '✅'
                      ) : (
                        '❌'
                      )
                    ) : isThisCorrect ? (
                      '✅'
                    ) : null}
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className={`rounded-xl p-4 ${
                isCorrect
                  ? 'bg-status-success/20 border-2 border-status-success/50'
                  : 'bg-status-error/20 border-2 border-status-error/50'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="text-xl flex-shrink-0">
                  {isCorrect ? '🎉' : '💡'}
                </div>
                <div>
                  <div
                    className={`font-bold mb-1 ${
                      isCorrect ? 'text-status-success' : 'text-status-error'
                    }`}
                  >
                    {isCorrect ? '정답입니다!' : '아쉽습니다!'}
                  </div>
                  <div
                    className={`text-sm ${
                      isCorrect ? 'text-status-success/90' : 'text-status-error/90'
                    }`}
                  >
                    {explanation}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
