'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Image, Globe, Trophy, Play, ArrowRight } from 'lucide-react';
import { useGameSounds } from '@/components/GameAudio';

const steps = [
  {
    icon: Image,
    title: 'Uvidíte obrázek',
    text: 'Na každé kolo dostanete fotografii známého místa. Prozkoumejte ji a zkuste uhádnout, kde na světě se nachází.',
  },
  {
    icon: Globe,
    title: 'Označte na mapě',
    text: 'Klikněte na mapu světa a vyberte místo, o kterém si myslíte, že je na obrázku. Čím blíž, tím víc bodů.',
  },
  {
    icon: Trophy,
    title: 'Získejte body',
    text: 'Za každé kolo získáváte body podle přesnosti. 5 kol, 5 šancí – zkuste dosáhnout co nejvyššího skóre.',
  },
];

export default function Home() {
  const { playClick } = useGameSounds();
  
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Pozadí */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-950 via-emerald-950/20 to-black pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.12),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />

      <main className="relative">
        {/* Hero – přesně 100vh, žádný zbytečný scroll */}
        <section className="h-screen pt-24 pb-8 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-6"
            >
              <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
            >
              DestiGuess
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-4 sm:mt-5 text-lg sm:text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto"
            >
              Hádejte lokace na základě obrázků známých míst. 5 kol, 5 šancí – kolik bodů získáte?
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 sm:mt-10"
            >
              <Link href="/play">
                <motion.span
                  className="inline-flex items-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => playClick()}
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                  Začít hru
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
          </div>
        </section>

        {/* Jak to funguje */}
        <section className="px-4 sm:px-6 py-16 sm:py-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16"
          >
            Jak to funguje
          </motion.h2>
          <div className="max-w-4xl mx-auto grid gap-8 sm:gap-10 md:grid-cols-3">
            {steps.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-strong rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-emerald-500/30 transition-colors"

              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 sm:mt-16 text-center"
          >
            <Link href="/play">
              <motion.span
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-gray-300 hover:text-emerald-400 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => playClick()}
              >
                Začít hru
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
          </motion.div>
        </section>

        {/* 5 kol – krátká sekce */}
        <section className="px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center glass-light rounded-2xl p-6 sm:p-8 border border-white/10"
          >
            <p className="text-gray-300 text-base sm:text-lg">
              Každá hra má <span className="font-semibold text-emerald-400">5 kol</span>. 
              Pro každé kolo hádejte jednu lokaci. Čím přesněji, tím víc bodů. 
              Není potřeba se registrovat – stačí kliknout a hrát.
            </p>
          </motion.div>
        </section>

        {/* Footer – kompaktní */}
        <footer className="px-4 sm:px-6 py-8 border-t border-white/10">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors" onClick={() => playClick()}>
              <MapPin className="w-4 h-4" />
              <span className="font-semibold">DestiGuess</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/play" className="text-gray-400 hover:text-white transition-colors text-sm" onClick={() => playClick()}>
                Hrát
              </Link>
              <Link href="/auth" className="text-gray-400 hover:text-white transition-colors text-sm"  onClick={() => playClick()}>
                Přihlásit se
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
