import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ShoppingCart,
  Scale,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePurchaseSafe } from '../../context/PurchaseContext.tsx';
import { AppLogo } from '../logos/AppLogo.tsx';

interface TutorialVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StepGuide {
  title: string;
  time: string;
  desc: string;
  highlight: string;
}

const TUTORIAL_STEPS: StepGuide[] = [
  {
    title: '1. Definir Limite de Gastos',
    time: '0:00 - 0:18',
    desc: 'Informe o valor máximo que planeja gastar (ex: R$ 200,00). O aplicativo vai gerenciar esse teto.',
    highlight: 'Nunca mais seja surpreendido na hora de passar as compras no caixa.',
  },
  {
    title: '2. Lista Planejada ou Direto no Carrinho',
    time: '0:18 - 0:38',
    desc: 'Planeje os itens de casa ou adicione os produtos diretamente enquanto caminha pelos corredores.',
    highlight: 'Itens essenciais marcados e calculados com prioridade.',
  },
  {
    title: '3. Itens por Unidade ou Balança (Kg)',
    time: '0:38 - 0:56',
    desc: 'Para hortifrúti ou carnes, selecione "Kg" e insira o peso da balança. O cálculo é imediato.',
    highlight: 'Cálculo exato de peso fracionário (ex: 0,850 kg a R$ 24,90/kg).',
  },
  {
    title: '4. Alertas de Saldo e Finalização',
    time: '0:56 - 1:15',
    desc: 'O termômetro avisa aos 70%, 90% e caso atinja 100%. Finalize e guarde o resumo no histórico.',
    highlight: 'Controle total na palma da mão, 100% offline dentro do mercado.',
  },
];

export const TutorialVideoModal: React.FC<TutorialVideoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const purchaseContext = usePurchaseSafe();
  const activePurchase = purchaseContext?.activePurchase ?? null;
  const setIsNewPurchaseModalOpen = purchaseContext?.setIsNewPurchaseModalOpen;

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [useCustomEmbed, setUseCustomEmbed] = useState(false);

  const totalDuration = 75; // 1 min 15s
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync step based on seconds
  useEffect(() => {
    if (currentSeconds < 18) setActiveStepIndex(0);
    else if (currentSeconds < 38) setActiveStepIndex(1);
    else if (currentSeconds < 56) setActiveStepIndex(2);
    else setActiveStepIndex(3);
  }, [currentSeconds]);

  // Video playback loop simulation
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (isPlaying && !useCustomEmbed) {
      timerRef.current = setInterval(() => {
        setCurrentSeconds((prev) => {
          if (prev >= totalDuration) {
            return 0; // loop or stay
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isOpen, useCustomEmbed]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentSeconds(0);
      setIsPlaying(true);
    }
  }, [isOpen]);

  // Keyboard shortcut: Escape to close, Space to toggle play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (newSecs: number) => {
    setCurrentSeconds(newSecs);
  };

  const handleStartShopping = () => {
    onClose();
    if (!activePurchase && setIsNewPurchaseModalOpen) {
      setIsNewPurchaseModalOpen(true);
    }
  };

  // Helper to extract YouTube ID if user enters standard link
  const getEmbedUrl = (input: string) => {
    if (!input) return '';
    try {
      if (input.includes('youtube.com/embed/')) return input;
      if (input.includes('youtube.com/watch?v=')) {
        const url = new URL(input);
        const v = url.searchParams.get('v');
        return `https://www.youtube.com/embed/${v}?autoplay=1`;
      }
      if (input.includes('youtu.be/')) {
        const id = input.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
      return input;
    } catch {
      return input;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E1EAE4] overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-modal-title"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-900 via-[#075E37] to-[#118447] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Play className="w-5 h-5 text-emerald-200 fill-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="tutorial-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Como usar o Compra Certa
                </h2>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider text-emerald-100">
                  Tutorial
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">
                Aprenda em 1 minuto a planejar e nunca estourar seu orçamento no caixa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar tutorial"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Area */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5 bg-[#F8FAF9]">
          {/* Video Player Display Container */}
          <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md relative">
            {useCustomEmbed && customVideoUrl ? (
              <div className="relative aspect-video w-full">
                <iframe
                  src={getEmbedUrl(customVideoUrl)}
                  title="Tutorial Compra Certa"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              /* High-Fidelity Interactive App Simulation Video */
              <div className="relative aspect-video w-full bg-[#0E1A13] flex flex-col justify-between overflow-hidden text-white select-none">
                {/* Background ambient gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

                {/* Top Overlay Badge */}
                <div className="relative z-10 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Passo {activeStepIndex + 1} de 4</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMuted((m) => !m)}
                      className="p-1.5 rounded-lg bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition cursor-pointer"
                      title={isMuted ? 'Ativar som explicativo' : 'Silenciar'}
                      aria-label={isMuted ? 'Ativar som' : 'Silenciar som'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Video Animated Visual Screen Content */}
                <div className="relative z-10 px-6 py-2 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                  {/* Step 1 Animation Simulation: Setting the Budget */}
                  {activeStepIndex === 0 && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#075E37] to-[#16A34A] flex items-center justify-center shadow-lg border border-emerald-400/30">
                        <AppLogo size={34} />
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 max-w-xs mx-auto shadow-inner">
                        <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                          Limite da Compra
                        </p>
                        <p className="text-3xl font-extrabold text-white mt-1 tabular-nums">
                          R$ 250,00
                        </p>
                        <div className="mt-2.5 h-1.5 rounded-full bg-white/20 overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full w-0 animate-pulse" />
                        </div>
                      </div>
                      <p className="text-xs text-white/90 font-medium">
                        Toque em <strong>"Vamos às compras"</strong> e defina o valor total que você tem disponível.
                      </p>
                    </div>
                  )}

                  {/* Step 2 Animation Simulation: Planned vs Cart */}
                  {activeStepIndex === 1 && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300 w-full max-w-sm">
                      <div className="flex items-center justify-center gap-2">
                        <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
                          <ShoppingCart className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-white">Adicionando no Carrinho</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-left space-y-2">
                        <div className="flex items-center justify-between text-xs bg-black/30 p-2 rounded-lg">
                          <span className="font-semibold text-white">Arroz 5kg</span>
                          <span className="text-emerald-300 font-bold">1 un × R$ 28,90</span>
                        </div>
                        <div className="flex items-center justify-between text-xs bg-black/30 p-2 rounded-lg">
                          <span className="font-semibold text-white">Leite Integral (Caixa)</span>
                          <span className="text-emerald-300 font-bold">6 un × R$ 4,89</span>
                        </div>
                      </div>
                      <p className="text-xs text-white/90">
                        Conforme você coloca no carrinho físico, o total vai somando instantaneamente.
                      </p>
                    </div>
                  )}

                  {/* Step 3 Animation Simulation: Weight and Kg */}
                  {activeStepIndex === 2 && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300 w-full max-w-sm">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                        <Scale className="w-6 h-6" />
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-left space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">Maçã Gala (Hortifrúti)</span>
                          <span className="bg-amber-400/20 text-amber-200 text-[10px] px-2 py-0.5 rounded font-bold">Balança (Kg)</span>
                        </div>
                        <div className="text-[11px] text-emerald-200 font-medium">
                          1,350 kg × R$ 8,99/kg = <strong className="text-white text-sm">R$ 12,14</strong>
                        </div>
                      </div>
                      <p className="text-xs text-white/90">
                        Frutas, verduras e carnes pesadas? O app calcula os gramas exatos sem arredondamentos errados.
                      </p>
                    </div>
                  )}

                  {/* Step 4 Animation Simulation: Real-time thermometer & Checkout */}
                  {activeStepIndex === 3 && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300 w-full max-w-sm">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 space-y-2">
                        <div className="flex justify-between text-xs text-white">
                          <span>Total: <strong>R$ 198,50</strong></span>
                          <span className="text-emerald-300">Saldo: <strong>R$ 51,50</strong></span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: '79%' }} />
                        </div>
                        <span className="inline-block text-[11px] font-semibold text-emerald-200">
                          ✓ Compra dentro do orçamento! 0 surpresas no caixa.
                        </span>
                      </div>
                      <p className="text-xs text-white/90">
                        O termômetro avisa se você passar de 70%, 90% ou ultrapassar o teto estipulado.
                      </p>
                    </div>
                  )}
                </div>

                {/* Video Bottom Player Controls Bar */}
                <div className="relative z-10 px-4 py-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col gap-2">
                  {/* Progress scrubber bar */}
                  <div
                    className="w-full h-2 rounded-full bg-white/25 hover:h-2.5 transition-all cursor-pointer relative overflow-hidden"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = (e.clientX - rect.left) / rect.width;
                      handleSeek(Math.floor(ratio * totalDuration));
                    }}
                    role="progressbar"
                    aria-valuenow={currentSeconds}
                    aria-valuemin={0}
                    aria-valuemax={totalDuration}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full transition-all duration-200"
                      style={{ width: `${(currentSeconds / totalDuration) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-white/90">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPlaying((p) => !p)}
                        aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                        className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition shadow-sm cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentSeconds(0);
                          setIsPlaying(true);
                        }}
                        aria-label="Reiniciar tutorial"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                        title="Reiniciar vídeo"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <span className="tabular-nums font-mono text-xs text-white/80">
                        {formatTime(currentSeconds)} / {formatTime(totalDuration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-emerald-300 font-medium">
                        {TUTORIAL_STEPS[activeStepIndex]?.title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Chapter / Step Navigation Buttons */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#647067] uppercase tracking-wider flex items-center gap-1.5">
              <span>Etapas do Tutorial</span>
              <span className="text-[11px] text-[#526356] font-normal">(Clique para pular para a etapa)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TUTORIAL_STEPS.map((step, idx) => {
                const isActive = activeStepIndex === idx;
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => {
                      if (idx === 0) handleSeek(0);
                      else if (idx === 1) handleSeek(18);
                      else if (idx === 2) handleSeek(38);
                      else handleSeek(56);
                      setIsPlaying(true);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-[#EAF7EE] border-emerald-400 shadow-xs ring-2 ring-emerald-500/15'
                        : 'bg-white border-[#E1EAE4] hover:border-emerald-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        isActive
                          ? 'bg-[#118447] text-white shadow-xs'
                          : 'bg-slate-100 text-[#526356]'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold truncate ${isActive ? 'text-[#075E37]' : 'text-[#15251C]'}`}>
                          {step.title}
                        </p>
                        <span className="text-[10px] text-[#647067] font-mono shrink-0 ml-1">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#526356] line-clamp-2 mt-0.5 leading-snug">
                        {step.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discreet configuration for custom video URL (Optional for admin/user) */}
          <div className="border-t border-[#E1EAE4] pt-3">
            <button
              type="button"
              onClick={() => setShowCustomUrlInput((v) => !v)}
              className="text-xs font-medium text-[#647067] hover:text-[#075E37] flex items-center gap-1.5 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showCustomUrlInput ? 'Ocultar configurações do vídeo' : 'Inserir link de vídeo próprio (YouTube / MP4)'}</span>
            </button>

            {showCustomUrlInput && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-white border border-[#E1EAE4] space-y-2 text-xs">
                <label htmlFor="custom-video-input" className="font-semibold text-[#15251C] block">
                  URL do vídeo no YouTube ou link direto:
                </label>
                <div className="flex gap-2">
                  <input
                    id="custom-video-input"
                    type="url"
                    value={customVideoUrl}
                    onChange={(e) => setCustomVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customVideoUrl.trim()) {
                        setUseCustomEmbed(true);
                      } else {
                        setUseCustomEmbed(false);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-[#118447] text-white font-bold hover:bg-[#075E37] transition cursor-pointer"
                  >
                    Aplicar
                  </button>
                  {useCustomEmbed && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomEmbed(false);
                        setCustomVideoUrl('');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-[#15251C] font-semibold transition cursor-pointer"
                    >
                      Restaurar padrão
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#647067]">
                  Você pode usar um vídeo gravado do YouTube para ensinar sua família ou equipe a usar o aplicativo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-white border-t border-[#E1EAE4] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#526356] font-medium text-center sm:text-left">
            <Sparkles className="w-4 h-4 text-[#118447] shrink-0" />
            <span>Dica: você pode rever este tutorial a qualquer momento pelo menu.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#526356] hover:bg-slate-100 transition cursor-pointer"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={handleStartShopping}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#118447] hover:bg-[#075E37] text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{activePurchase ? 'Voltar para a Compra' : 'Começar a Comprar'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
