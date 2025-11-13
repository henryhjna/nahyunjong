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
    <div className="not-prose my-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
      {/* Quiz Icon */}
      <div className="flex items-center gap-2 mb-4">
        <div className="text-2xl">🎯</div>
        <h3 className="text-lg font-bold text-gray-900">퀴즈</h3>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <p className="text-gray-900 font-semibold">{question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-4">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isThisCorrect = option.isCorrect;

          let bgColor = 'bg-white hover:bg-gray-50';
          let borderColor = 'border-gray-200';
          let textColor = 'text-gray-900';

          if (selectedIndex !== null) {
            if (isSelected) {
              if (isCorrect) {
                bgColor = 'bg-green-100';
                borderColor = 'border-green-500';
                textColor = 'text-green-900';
              } else {
                bgColor = 'bg-red-100';
                borderColor = 'border-red-500';
                textColor = 'text-red-900';
              }
            } else if (isThisCorrect) {
              bgColor = 'bg-green-50';
              borderColor = 'border-green-300';
              textColor = 'text-green-800';
            }
          }

          return (
            <motion.button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={selectedIndex !== null}
              whileHover={selectedIndex === null ? { scale: 1.02 } : {}}
              whileTap={selectedIndex === null ? { scale: 0.98 } : {}}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${bgColor} ${borderColor} ${textColor} ${
                selectedIndex === null ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Option Number */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    selectedIndex !== null && isSelected
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : selectedIndex !== null && isThisCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700'
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
              className={`rounded-lg p-4 ${
                isCorrect
                  ? 'bg-green-100 border-2 border-green-300'
                  : 'bg-red-100 border-2 border-red-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="text-xl flex-shrink-0">
                  {isCorrect ? '🎉' : '💡'}
                </div>
                <div>
                  <div
                    className={`font-bold mb-1 ${
                      isCorrect ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {isCorrect ? '정답입니다!' : '아쉽습니다!'}
                  </div>
                  <div
                    className={`text-sm ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
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
