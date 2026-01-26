import React from 'react';

interface HealthTipModalProps {
  tip: string;
  isLoading: boolean;
  onClose: () => void;
}

const HealthTipModal: React.FC<HealthTipModalProps> = ({ tip, isLoading, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-base-200 rounded-xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-transform scale-95 animate-slide-up">
        <h2 className="text-2xl font-bold text-primary mb-4">Dica de Saúde do Dia</h2>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <p className="text-lg text-neutral/90 mb-6 min-h-[6rem]">{tip}</p>
        )}
        <button
          onClick={onClose}
          className="w-full bg-primary text-white font-bold py-3 rounded-lg transition-transform transform active:scale-95 shadow-md"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default HealthTipModal;
