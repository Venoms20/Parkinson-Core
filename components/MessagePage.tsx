import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { triggerHaptic } from '../utils/haptic';
import { SparklesIcon } from './Icons';

// Banco de mensagens de fallback expandido para 200 frases específicas para Parkinson
const fallbackMessages = [
  "Cada pequeno passo é uma vitória gigante. Sua determinação é sua maior força.",
  "O Parkinson faz parte da sua jornada, mas ele não define quem você é.",
  "Respire fundo. O dia de hoje é um presente, viva-o plenamente.",
  "Sua resiliência é inspiradora. Um dia de cada vez, com coragem.",
  "Lembre-se de ser gentil com você hoje. Você está fazendo o seu melhor.",
  "O equilíbrio vem de dentro. Foque no que você pode fazer hoje.",
  "Sua força não é medida pela estabilidade das mãos, mas pela firmeza do seu coração.",
  "Hoje é um bom dia para focar no que te traz alegria. Pequenos prazeres curam.",
  "Mantenha o movimento. Cada passo conta para a sua independência.",
  "Sua mente é poderosa. Use-a para visualizar sua força e superação.",
  "A paciência com o próprio corpo é uma forma sublime de amor-próprio.",
  "Não se compare com os outros, celebre sua própria evolução única.",
  "O tremor pode estar presente, mas sua vontade de vencer é muito maior.",
  "Sua voz importa. Continue expressando sua verdade e seus sentimentos.",
  "O exercício físico é o seu melhor aliado. Movimente-se com alegria hoje.",
  "Sua jornada exige coragem, e você prova ter de sobra todos os dias.",
  "Pequenas conquistas diárias constroem uma vida de grandes significados.",
  "Foque no 'agora'. O presente é o único lugar onde a vida acontece.",
  "Sua presença é um presente para todos que estão ao seu redor.",
  "A amizade e o apoio são combustíveis para a alma. Conecte-se hoje.",
  "Um sorriso pode mudar a química do seu dia. Tente sorrir para o espelho.",
  "Seu valor é imenso e independe de qualquer sintoma físico.",
  "A criatividade não tem limites. Explore novas formas de se expressar.",
  "A persistência é o caminho para manter sua autonomia e brilho.",
  "Lembre-se: você já superou desafios difíceis antes. Este é apenas mais um.",
  "Mantenha a cabeça erguida. Sua postura reflete sua força interior.",
  "A música pode acalmar o corpo e a mente. Ouça sua canção favorita hoje.",
  "Seja o herói da sua própria história, um capítulo de cada vez.",
  "A meditação é uma âncora para dias agitados. Respire e sinta o silêncio.",
  "Sua história de vida é rica e cheia de sabedoria. Compartilhe-a.",
  "O Parkinson ensina a dar valor ao tempo. Use o seu com sabedoria.",
  "Não tenha pressa. O seu ritmo é o ritmo certo para você agora.",
  "O autocuidado não é egoísmo, é necessidade básica para sua saúde.",
  "Foque nas possibilidades, não nas limitações. Há muito a ser feito.",
  "Sua determinação em seguir o tratamento é um ato de bravura.",
  "Olhe para trás e veja o quanto você já evoluiu desde o diagnóstico.",
  "A gratidão transforma o que temos em suficiente. Seja grato hoje.",
  "A natureza tem um ritmo de cura. Se puder, sinta o sol e o vento.",
  "Você é mais forte do que imagina e mais capaz do que acredita.",
  "A esperança é a luz que nunca deve se apagar no seu horizonte.",
  "Sua família e amigos são sua rede de proteção. Deixe-se abraçar.",
  "Aprenda algo novo todos os dias. O cérebro adora desafios.",
  "O bom humor é um remédio sem efeitos colaterais. Ria de si mesmo.",
  "Sua dignidade é intocável. Mantenha-se firme em seus princípios.",
  "Pequenos ajustes na rotina podem trazer grandes alívios. Experimente.",
  "Não se isole. A troca de experiências fortalece a caminhada.",
  "Sua sensibilidade é uma janela para entender melhor a vida.",
  "Respeite o tempo de descanso do seu corpo. Ele precisa recarregar.",
  "A coragem não é a ausência de medo, mas a ação apesar dele.",
  "Cada refeição equilibrada é um carinho no seu sistema nervoso.",
  "A fisioterapia é o desenho do seu movimento futuro. Persista.",
  "O amor cura o que os remédios não alcançam. Ame e deixe-se amar.",
  "Sua inteligência continua vibrante. Use-a para planejar seu bem-estar.",
  "Desafie-se a fazer algo que você gosta hoje, por menor que seja.",
  "A paciência é uma árvore de raiz amarga, mas de frutos muito doces.",
  "Foque no que você ainda domina. Suas habilidades são preciosas.",
  "O tremor é apenas uma vibração; sua essência é pura estabilidade.",
  "Não desista de sonhar. Os sonhos mantêm o cérebro jovem.",
  "A hidratação é vital. Beba água e cuide do seu templo físico.",
  "Sua fé, seja ela qual for, é um pilar de sustentação importante.",
  "O segredo da mudança é focar toda a sua energia na construção do novo.",
  "Você é um exemplo de superação para muitas pessoas ao seu redor.",
  "A vida é feita de ciclos. Este ciclo exige adaptação e muita garra.",
  "Mantenha o foco na solução, nunca no problema. Você é criativo.",
  "Sua gentileza com os outros volta para você em forma de paz.",
  "Não esconda seus sentimentos. Falar alivia o peso da caminhada.",
  "Cada dia é uma nova oportunidade de recomeçar com mais sabedoria.",
  "Sua autonomia é construída nos pequenos detalhes do dia a dia.",
  "Ocupar a mente com coisas boas é a melhor estratégia de defesa.",
  "Seu olhar sobre a vida mudou, e isso te trouxe uma profundidade rara.",
  "Celebre o fato de estar aqui, lutando e vivendo com propósito.",
  "A flexibilidade mental é tão importante quanto a física. Adapte-se.",
  "O Parkinson pode retardar o passo, mas não impede a chegada.",
  "Valorize quem caminha ao seu lado. O amor é o melhor suporte.",
  "Suas mãos contam histórias de trabalho e afeto. Honre-as.",
  "O otimismo é a fé que leva à realização. Nada se faz sem ele.",
  "Seja seu maior incentivador. Diga palavras doces a si mesmo.",
  "A leitura é uma viagem sem sair do lugar. Leia algo inspirador.",
  "Sua persistência hoje garante a qualidade do seu amanhã.",
  "Não se sinta culpado por ter dias ruins. Eles fazem parte da cura.",
  "A vida não parou. Ela apenas mudou a marcha para uma mais atenta.",
  "Sua sabedoria acumulada é uma bússola para os dias nebulosos.",
  "A alegria mora nas coisas simples. Encontre-a no café ou no sol.",
  "Você é um guerreiro silencioso cujas vitórias ecoam na alma.",
  "O apoio profissional é uma ferramenta, não uma derrota. Use-o.",
  "Foque na sua respiração quando o corpo parecer apressado.",
  "Sua essência é luz, e nenhuma nuvem pode apagar seu sol interior.",
  "Trabalhe sua coordenação com jogos e atividades manuais leves.",
  "A aceitação é o primeiro passo para uma adaptação inteligente.",
  "Sua dignidade brilha através da sua perseverança diária.",
  "Não se apresse ao falar. Suas palavras valem a espera de quem ouve.",
  "A vida tem cores que só quem desacelera consegue enxergar.",
  "Sua resiliência transforma obstáculos em degraus de evolução.",
  "O autocuidado é a base para cuidar de quem você ama.",
  "Lembre-se: o diagnóstico de Parkinson não é uma sentença, é um início.",
  "Sua curiosidade mantém sua mente ativa e seu coração vibrante.",
  "A calma é a virtude dos fortes. Pratique-a nos momentos de pausa.",
  "Seu sorriso é um remédio para você e para quem o recebe.",
  "O movimento é vida. Dance, caminhe, alongue-se. Sinta-se vivo.",
  "Você é o comandante da sua saúde. Tome as rédeas com equilíbrio.",
  "A solidariedade entre pacientes é uma força transformadora.",
  "Sua maturidade trouxe a clareza do que realmente importa na vida.",
  "Não deixe o medo do futuro roubar a beleza do seu presente.",
  "Sua capacidade de adaptação é sua tecnologia mais avançada.",
  "O amor-próprio é o escudo mais resistente contra a tristeza.",
  "Pense em tudo o que você ainda quer realizar e comece pequeno.",
  "A gratidão pelo fôlego de vida renova suas energias matinais.",
  "Sua paciência com os sintomas é um exercício diário de santidade.",
  "O Parkinson pede foco. Dê ao seu corpo a atenção que ele merece.",
  "Você é uma obra de arte em constante restauração e beleza.",
  "A tranquilidade é o ambiente ideal para o seu sistema nervoso.",
  "Suas vitórias são medidas pela sua vontade de tentar novamente.",
  "Não subestime o poder de uma boa noite de sono reparador.",
  "A caminhada matinal é um diálogo sagrado entre você e a terra.",
  "Sua força interior é um reservatório inesgotável de superação.",
  "O Parkinson ensina a arte de viver com intensidade e pausa.",
  "Seja a calma no meio da tempestade. Você tem esse poder.",
  "A arte e o artesanato são ótimos para treinar suas mãos e mente.",
  "Sua presença traz conforto para quem te ama. Valorize-se.",
  "O conhecimento sobre a condição é poder. Estude e se informe.",
  "Sua coragem inspira seus netos, filhos e amigos próximos.",
  "O riso solta as tensões do corpo. Assista algo engraçado hoje.",
  "A alimentação saudável é o combustível premium para seus neurônios.",
  "Sua vontade de viver é o motor que impulsiona cada tratamento.",
  "O Parkinson pode mudar seus planos, mas não cancela seu futuro.",
  "Seja tolerante com suas falhas temporárias. Você é humano.",
  "A escrita no diário ajuda a organizar o caos e encontrar paz.",
  "Sua vida tem um propósito que vai muito além de qualquer sintoma.",
  "O sol nasce para todos, e hoje ele brilha especialmente para você.",
  "A serenidade não é a falta de problemas, mas a paz no meio deles.",
  "Suas mãos podem tremer, mas seu propósito deve ser inabalável.",
  "O apoio de quem entende o que você passa é um bálsamo real.",
  "Não guarde mágoas. Elas pesam mais que qualquer dificuldade física.",
  "Sua evolução é constante, mesmo que pareça lenta aos seus olhos.",
  "O Parkinson é apenas um detalhe em uma biografia maravilhosa.",
  "Acredite na ciência e na medicina, elas trabalham por você.",
  "Sua resiliência é a prova de que a alma não tem doenças.",
  "A simplicidade é o último grau da sofisticação. Viva simples.",
  "O amor que você dá volta para você multiplicado por mil.",
  "Sua mente é um jardim. Cultive pensamentos de cura e vigor.",
  "O tremor é o corpo dizendo que está vivo e lutando. Honre-o.",
  "Não tenha medo de pedir ajuda. Isso demonstra grande sabedoria.",
  "A vida recompensa quem não desiste diante dos primeiros obstáculos.",
  "Sua jornada é única e nela você encontra tesouros de sabedoria.",
  "A esperança é um músculo que deve ser exercitado todos os dias.",
  "Sua fé na vida é o que te mantém de pé e com olhos brilhantes.",
  "O Parkinson te desafia a ser a melhor versão de si mesmo hoje.",
  "Seja grato pelos dias de 'on'. Use-os com alegria e movimento.",
  "Nos dias de 'off', pratique a aceitação e o descanso profundo.",
  "Você é o arquiteto do seu bem-estar. Construa com paciência.",
  "Sua força é silenciosa, persistente e extremamente poderosa.",
  "O carinho de um animal de estimação pode ser um grande remédio.",
  "Sua voz, mesmo que baixa, ecoa amor e sabedoria infinita.",
  "O Parkinson te ensinou a ouvir o que o corpo tenta dizer.",
  "Não permita que a ansiedade domine seu ritmo. Respire fundo.",
  "Sua beleza interior brilha mais forte a cada desafio superado.",
  "A convivência com o Parkinson exige inteligência emocional.",
  "Cada exercício de fala é um degrau para manter sua comunicação.",
  "A vida é curta demais para focar apenas nos problemas físicos.",
  "Sua mente pode ser um refúgio de paz se você assim decidir.",
  "O equilíbrio físico começa com o equilíbrio dos pensamentos.",
  "Seja um embaixador da conscientização sobre o Parkinson.",
  "Sua perseverança é o maior legado que você deixará para os seus.",
  "O amanhã será melhor porque você está cuidando do hoje.",
  "A gratidão pela mobilidade que você tem agora gera mais saúde.",
  "Sua alma é imune a tremores, ela é pura luz e estabilidade.",
  "O Parkinson te obriga a ser mais focado. Use isso a seu favor.",
  "Não se esconda do mundo. O mundo precisa da sua perspectiva.",
  "Sua coragem diária é um hino à vida e à superação humana.",
  "O tratamento é um compromisso de amor com a sua existência.",
  "A alegria de viver é a melhor vitamina para o seu cérebro.",
  "Sua biografia está sendo escrita com letras de ouro e garra.",
  "O Parkinson pode afetar o corpo, mas a mente é território livre.",
  "Seja generoso com você. Permita-se pequenos luxos e confortos.",
  "A resiliência é a arte de dançar conforme a música da vida.",
  "Sua força vem do alto e de dentro. Conecte-se com essas fontes.",
  "A vida é bela em todas as suas formas e ritmos de movimento.",
  "O Parkinson trouxe paciência, e a paciência trouxe sabedoria.",
  "Sua luta é nobre e sua vitória é garantida pela sua persistência.",
  "Não olhe para o que perdeu, mas para o que ainda pode ganhar.",
  "A ciência avança a cada segundo. Mantenha a esperança viva.",
  "Sua história inspira outros pacientes a nunca desistirem.",
  "O Parkinson é um mestre severo, mas você é um aluno brilhante.",
  "A paz de espírito é o maior tesouro que você pode conquistar.",
  "Sua vontade de melhorar é 50% do sucesso do seu tratamento.",
  "O riso de uma criança pode ser o melhor relaxante muscular.",
  "Sua determinação é contagiosa. Continue espalhando sua força.",
  "O Parkinson pede pausa, mas nunca pede para você parar de vez.",
  "Seja a luz no caminho de alguém que acabou de ser diagnosticado.",
  "Sua vida é um milagre que se renova a cada manhã ensolarada.",
  "A gratidão pelo hoje é o melhor seguro para um amanhã feliz.",
  "Você é um monumento à resistência e à beleza da vida humana.",
  "O Parkinson não tira sua essência, ele apenas a torna mais clara.",
  "Sua voz interna deve ser sempre de incentivo e amor profundo.",
  "O equilíbrio perfeito é saber quando agir e quando descansar.",
  "Sua jornada é um testemunho de fé, esperança e muito amor.",
  "O Parkinson é pequeno perto da grandeza da sua alma imortal.",
  "Seja feliz hoje, com as ferramentas que você tem nas mãos.",
  "A resiliência é sua marca registrada. Sinta orgulho de quem você é.",
  "O amor é o remédio definitivo. Use-o sem moderação todos os dias."
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
      // Seleciona uma mensagem aleatória do banco local de 200 frases
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
