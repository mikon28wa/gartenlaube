import React from 'react';

interface BookingLoadingAnimationProps {
  stage: 'validating' | 'processing' | 'confirming';
}

export const BookingLoadingAnimation: React.FC<BookingLoadingAnimationProps> = ({ stage }) => {
  const stageMessages = {
    validating: 'Verfügbarkeit wird überprüft...',
    processing: 'Buchung wird verarbeitet...',
    confirming: 'Buchung wird bestätigt...',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-xl">
        {/* Animated circles */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: '#C85A3A',
                animation: `bounce 1.4s infinite ease-in-out`,
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#C85A3A] via-[#B8860B] to-[#6B8E7F]"
            style={{
              width: stage === 'validating' ? '33%' : stage === 'processing' ? '66%' : '100%',
              transition: 'width 0.6s ease-in-out',
            }}
          />
        </div>

        {/* Message */}
        <p className="text-center text-gray-700 font-medium">
          {stageMessages[stage]}
        </p>

        {/* Substeps */}
        <div className="mt-6 space-y-2">
          {['Verfügbarkeit prüfen', 'Zahlung verarbeiten', 'Bestätigung senden'].map((step, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  (stage === 'validating' && idx === 0) ||
                  (stage === 'processing' && idx <= 1) ||
                  (stage === 'confirming' && idx <= 2)
                    ? 'bg-[#C85A3A] text-white'
                    : stage === 'confirming'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {(stage === 'confirming' && idx <= 2) ? '✓' : idx + 1}
              </div>
              <span
                className={`text-sm ${
                  (stage === 'validating' && idx === 0) ||
                  (stage === 'processing' && idx <= 1) ||
                  (stage === 'confirming' && idx <= 2)
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500'
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes bounce {
            0%, 80%, 100% {
              opacity: 0.5;
              transform: scale(0.8);
            }
            40% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BookingLoadingAnimation;
