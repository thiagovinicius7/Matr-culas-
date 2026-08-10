import React, { useState, useEffect } from 'react';
import { Sprout, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  expectedPassword: string;
  onLoginSuccess: () => void;
}

export default function LoginScreen({ expectedPassword, onLoginSuccess }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isWiggling, setIsWiggling] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (password === expectedPassword) {
      setError('');
      onLoginSuccess();
    } else {
      setError('Senha incorreta. Tente novamente.');
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 500);
    }
  };

  // Auto-submit when exactly 6 characters are typed/pressed
  useEffect(() => {
    if (password.length === expectedPassword.length) {
      if (password === expectedPassword) {
        setError('');
        onLoginSuccess();
      } else if (password.length >= 6) {
        setError('Senha incorreta. Tente novamente.');
        setIsWiggling(true);
        setTimeout(() => setIsWiggling(false), 500);
      }
    } else {
      setError('');
    }
  }, [password, expectedPassword, onLoginSuccess]);

  const handleKeyPress = (num: string) => {
    setError('');
    if (password.length < 12) {
      setPassword(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setError('');
    setPassword(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError('');
    setPassword('');
  };

  return (
    <div className="min-h-screen w-screen bg-brand-cream flex flex-col items-center justify-center p-4 font-sans text-slate-800" id="login-viewport">
      <motion.div
        animate={isWiggling ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col"
        id="login-card"
      >
        {/* Banner Section */}
        <div className="bg-brand-green-dark p-6 text-center text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-green-light/20 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="mx-auto mb-3 flex items-center justify-center p-2 bg-white/95 rounded-xl shadow-md max-w-[180px]">
            <img 
              src="https://sitioescolageranium.com.br/imagens/logo-sitio-escola-geranium.png" 
              alt="Sítio-Escola Geranium" 
              className="h-12 w-auto object-contain" 
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-display font-bold text-lg tracking-tight">Sítio-Escola Geranium</h1>
          <p className="text-[10px] text-brand-sand mt-1 uppercase tracking-wider font-bold">Gestor de Rematrículas</p>
        </div>

        {/* Form and Controls Section */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Lock size={14} className="text-brand-orange" />
                Acesso Restrito
              </h2>
              <p className="text-[11px] text-slate-500">
                Insira a senha de acesso para gerenciar as fichas e rematrículas.
              </p>
            </div>

            {/* Password input box */}
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                  placeholder="Digite a senha"
                  className="w-full text-center text-lg font-mono font-bold tracking-[0.25em] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-green-light focus:outline-none focus:ring-1 focus:ring-brand-green-light/20 transition-all text-slate-800"
                  maxLength={12}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-1 text-rose-600 justify-center text-[11px] font-semibold">
                  <AlertCircle size={12} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Virtual Keyboard (Numeric keypad) */}
            <div className="grid grid-cols-3 gap-2 pt-2 max-w-[280px] mx-auto" id="virtual-keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className="h-12 text-sm font-bold bg-slate-50 hover:bg-brand-sand border border-slate-100 rounded-xl active:scale-95 transition-all text-slate-700 shadow-2xs cursor-pointer flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 text-[10px] uppercase font-bold bg-slate-100/60 hover:bg-slate-200/80 border border-slate-100 rounded-xl active:scale-95 transition-all text-slate-500 cursor-pointer flex items-center justify-center"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-12 text-sm font-bold bg-slate-50 hover:bg-brand-sand border border-slate-100 rounded-xl active:scale-95 transition-all text-slate-700 shadow-2xs cursor-pointer flex items-center justify-center"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 text-[10px] uppercase font-bold bg-slate-100/60 hover:bg-slate-200/80 border border-slate-100 rounded-xl active:scale-95 transition-all text-slate-500 cursor-pointer flex items-center justify-center"
              >
                Apagar
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <button
              type="submit"
              className="w-full h-11 bg-brand-green-dark hover:bg-brand-green-light text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wider font-display"
            >
              Acessar Sistema
            </button>

            {/* Password hint */}
            <div className="text-center p-2.5 bg-brand-sand/40 border border-brand-sand rounded-xl text-[10px] text-brand-clay leading-normal">
              <span className="font-bold uppercase tracking-wide block mb-0.5">Dica de Acesso</span>
              Senha padrão do sistema: <strong className="font-mono text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-200 shadow-2xs">456321</strong>
            </div>
          </div>
        </form>
      </motion.div>
      <div className="mt-4 text-[9px] text-slate-400 font-mono text-center">
        Sítio-Escola Geranium © {new Date().getFullYear()} • Todos os direitos reservados
      </div>
    </div>
  );
}
