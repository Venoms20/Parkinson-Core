import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { triggerHaptic } from '../utils/haptic';
import { SparklesIcon } from './Icons';

// Banco de mensagens de fallback para garantir funcionamento offline ou em caso de erro da API
const fallbackMessages = [
  "Cada pequeno passo é uma vitória gigante. Sua determinação é sua maior força hoje.",
  "O Parkinson faz parte da sua jornada, mas ele não define quem você é. Sua luz continua brilhando.",
  "Respire fundo. O dia de hoje é um presente, e você tem a força necessária para vivê-lo plenamente.",
  "Sua resiliência é inspiradora. Um dia de cada vez, com coragem e paciência consigo mesmo.",
  "Lembre-se de ser gentil com você hoje. Você está fazendo o seu melhor, e isso é o suficiente.",
  "O equilíbrio vem de dentro. Foque no que você pode fazer hoje e celebre cada movimento.",
  "Sua força não é medida pela estabilidade das mãos, mas pela firmeza do seu coração.",
  "Hoje é um bom dia para focar no que te traz alegria. Pequenos momentos de prazer curam a alma."
];

const MessagePage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineMessage, setIsOfflineMessage] = useState(false);

  const generateMessage = async () => {
    triggerHaptic();
    setIsLoading(true);
    setIsOfflineMessage(false);
    setMessage('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Me dê uma frase de inspiração agora.',
        config: {
            systemInstruction: 'Você é um assistente empático focado em bem-estar para pacientes com Parkinson. Gere mensagens motivacionais curtíssimas (máximo 40 palavras), calorosas e encorajadoras. Use português do Brasil.',
        }
      });
      
      const text = response.text;
      if (text) {
        setMessage(text);
      } else {
        throw new Error('Falha na resposta');
      }
    } catch (err) {
      console.error("Erro ao gerar mensagem pela IA, usando fallback:", err);
      // Seleciona uma mensagem aleatória do banco local
      const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
      setMessage(fallbackMessages[randomIndex]);
      setIsOfflineMessage(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-base-200 p-8 rounded-2xl shadow-xl min-h-[14rem] flex flex-col items-center justify-center transition-all duration-500 border border-primary/10">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-sm text-neutral/40 animate-pulse">Buscando inspiração...</p>
            </div>
          ) : message ? (
            <div className="animate-fade-in space-y-4">
               <p className="text-xl font-medium text-neutral/90 leading-relaxed italic">
                "{message}"
              </p>
              {isOfflineMessage && (
                <p className="text-[10px] uppercase tracking-widest text-neutral/30">
                  Lembrete de Apoio
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4 opacity-60">
                <div className="flex justify-center text-primary/40">
                    <SparklesIcon />
                </div>
                <p className="text-neutral/70">
                    Precisa de uma dose de motivação?<br/>Clique no botão abaixo.
                </p>
            </div>
          )}
        </div>
        
        <button
          onClick={generateMessage}
          disabled={isLoading}
          className="w-full mt-10 bg-primary text-white font-bold py-5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-50 disabled:scale-100 hover:brightness-110"
        >
          {isLoading ? (
            "Carregando..."
          ) : (
            <>
              <SparklesIcon />
              Gerar Mensagem de Apoio
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MessagePage;
