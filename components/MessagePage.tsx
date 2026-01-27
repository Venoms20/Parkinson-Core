import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { triggerHaptic } from '../utils/haptic';
import { SparklesIcon } from './Icons';

const MessagePage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateMessage = async () => {
    triggerHaptic();
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Gere uma mensagem motivacional curta, calorosa e encorajadora para uma pessoa que vive com a doença de Parkinson. A mensagem deve ser positiva, focar na força interior, na resiliência e na importância de um dia de cada vez. Mantenha-a com menos de 60 palavras e em português do Brasil.',
      });
      const text = response.text;
      if (text) {
        setMessage(text);
      } else {
        throw new Error('Nenhuma mensagem gerada.');
      }
    } catch (err) {
      console.error("Erro ao gerar mensagem:", err);
      setError('Não foi possível gerar a mensagem. Tente novamente mais tarde.');
      // Fallback message
      setMessage('Lembre-se: cada passo, por menor que seja, é uma vitória. Sua força é maior que seus desafios. Respire fundo e siga em frente, um dia de cada vez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="w-full max-w-md">
        <div className={`bg-base-200 p-6 rounded-xl shadow-lg min-h-[12rem] flex items-center justify-center transition-opacity duration-500 ${message ? 'opacity-100' : 'opacity-0'}`}>
          {message && (
            <p className="text-lg text-neutral/90 animate-fade-in">{message}</p>
          )}
        </div>
        
        {error && <p className="text-red-500 mt-4">{error}</p>}

        <button
          onClick={generateMessage}
          disabled={isLoading}
          className="w-full mt-8 bg-primary text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-50 disabled:scale-100"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <>
              <SparklesIcon />
              Gerar Mensagem
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MessagePage;
