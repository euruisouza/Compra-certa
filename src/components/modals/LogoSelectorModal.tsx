import React from 'react';
import { usePurchase } from '../../context/PurchaseContext.tsx';
import type { LogoModelType } from '../../types/index.ts';
import { LogoSustentavel } from '../logos/LogoSustentavel.tsx';
import { LogoCarrinhoVerde } from '../logos/LogoCarrinhoVerde.tsx';
import { X, CheckCircle2, Download, Sparkles, Palette } from 'lucide-react';

export const LogoSelectorModal: React.FC = () => {
  const {
    isLogoModalOpen,
    setIsLogoModalOpen,
    activeLogoModel,
    setActiveLogoModel,
    addToast,
  } = usePurchase();

  if (!isLogoModalOpen) return null;

  const handleSelect = (model: LogoModelType) => {
    setActiveLogoModel(model);
    addToast(
      model === 'sustentavel'
        ? 'Logo "Compra Certa Sustentável" ativado com sucesso!'
        : 'Logo "Compra Certa com Carrinho Verde" ativado com sucesso!',
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E1EAE4] overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logo-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E1EAE4] flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF7EE] text-[#118447] flex items-center justify-center shadow-inner">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 id="logo-modal-title" className="text-lg font-bold text-[#15251C] leading-tight">
                Modelos de Logo Compra Certa
              </h3>
              <p className="text-xs text-[#647067]">
                Escolha o modelo oficial de logo para personalizar a identidade do aplicativo
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLogoModalOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Foram adicionados os <strong>dois modelos de logos</strong> no aplicativo. Você pode alternar entre eles a qualquer momento; a sua escolha atualiza instantaneamente o cabeçalho, a tela inicial e os relatórios em PDF.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model 1: Sustentável */}
            <div
              onClick={() => handleSelect('sustentavel')}
              className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all flex flex-col justify-between ${
                activeLogoModel === 'sustentavel'
                  ? 'border-[#118447] bg-[#F4FBF6] shadow-md ring-2 ring-emerald-500/20'
                  : 'border-[#E1EAE4] bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
              }`}
            >
              {activeLogoModel === 'sustentavel' && (
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-[#118447] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Em Uso</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-gradient-to-br from-[#EAF7EE] to-[#D5F2DD] rounded-2xl">
                  <LogoSustentavel size={96} />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-extrabold text-[#15251C]">
                      Modelo 1: Sustentável
                    </span>
                    <span className="text-sm">🌿</span>
                  </div>
                  <p className="text-xs font-medium text-[#118447] mt-0.5">
                    Compra Certa Sustentável
                  </p>
                  <p className="text-xs text-[#647067] mt-2 leading-relaxed">
                    Apresenta carrinho ecológico com folhagens verdes germinando da cesta, simbolizando consumo consciente, alimentos frescos e compras inteligentes.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-emerald-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-emerald-800">
                  Paleta: Verde Esmeralda & Folha
                </span>
                <a
                  href="/logo-sustentavel.svg"
                  download="logo-compra-certa-sustentavel.svg"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                  title="Baixar arquivo SVG"
                >
                  <Download className="w-3 h-3" />
                  <span>SVG</span>
                </a>
              </div>
            </div>

            {/* Model 2: Carrinho Verde */}
            <div
              onClick={() => handleSelect('carrinho-verde')}
              className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all flex flex-col justify-between ${
                activeLogoModel === 'carrinho-verde'
                  ? 'border-[#16A34A] bg-[#F0FDF4] shadow-md ring-2 ring-green-500/20'
                  : 'border-[#E1EAE4] bg-white hover:border-green-300 hover:bg-green-50/30'
              }`}
            >
              {activeLogoModel === 'carrinho-verde' && (
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-[#16A34A] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Em Uso</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-gradient-to-br from-[#DCFCE7] to-[#BBF7D0] rounded-2xl">
                  <LogoCarrinhoVerde size={96} />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-extrabold text-[#15251C]">
                      Modelo 2: Carrinho Verde
                    </span>
                    <span className="text-sm">🛒</span>
                  </div>
                  <p className="text-xs font-medium text-[#16A34A] mt-0.5">
                    Compra Certa com Carrinho Verde
                  </p>
                  <p className="text-xs text-[#647067] mt-2 leading-relaxed">
                    Design moderno de supermercado com carrinho verde de alta precisão, empunhadura ergonômica e selo de verificação no caixa sem surpresas.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-green-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-green-800">
                  Paleta: Verde Vibrante & Supermercado
                </span>
                <a
                  href="/logo-carrinho-verde.svg"
                  download="logo-compra-certa-carrinho-verde.svg"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[11px] font-semibold text-green-700 hover:text-green-900 bg-white border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors"
                  title="Baixar arquivo SVG"
                >
                  <Download className="w-3 h-3" />
                  <span>SVG</span>
                </a>
              </div>
            </div>
          </div>

          {/* Live Preview in Context */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Visualização no Cabeçalho do App
            </h4>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeLogoModel === 'sustentavel' ? (
                  <LogoSustentavel size={40} showText={true} />
                ) : (
                  <LogoCarrinhoVerde size={40} showText={true} />
                )}
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Modelo ativo aplicado em tempo real
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-[#E1EAE4] flex items-center justify-between">
          <span className="text-xs text-[#647067]">
            Modelo selecionado: <strong className="text-[#15251C]">{activeLogoModel === 'sustentavel' ? 'Compra Certa Sustentável' : 'Compra Certa com Carrinho Verde'}</strong>
          </span>
          <button
            onClick={() => setIsLogoModalOpen(false)}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-[#118447] hover:bg-[#075E37] transition-colors shadow-sm"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
