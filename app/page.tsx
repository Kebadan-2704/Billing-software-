'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      router.push('/company-selection')
    }, 3500)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
      {/* Cinematic Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[120px]"
        />
        {/* Particle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-150" />
      </div>

      <AnimatePresence>
        {mounted && (
          <div className="relative z-10 flex flex-col items-center">
            {/* Main Logo Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              className="relative mb-12"
            >
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse-slow" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-2xl shadow-2xl"
              >
                <Image
                  src="/md-logo-01.png"
                  alt="MD Construction Logo"
                  width={180}
                  height={180}
                  priority
                  className="drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]"
                />
              </motion.div>
            </motion.div>

            {/* Typography Section */}
            <header className="text-center space-y-4 px-4">
              <motion.h1
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, letterSpacing: "0.1em" }}
                transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                className="text-5xl md:text-7xl font-black italic tracking-tighter"
              >
                <span className="text-white">MD </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-400">
                  SYSTEMS
                </span>
              </motion.h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ delay: 1, duration: 1, ease: "easeInOut" }}
                className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"
              />

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-sm md:text-xl font-medium text-slate-400 tracking-[0.2em] md:tracking-[0.3em] uppercase"
              >
                Enterprise Intelligence
              </motion.p>
            </header>

            {/* Progress/Loading Indicator */}
            <div className="mt-20 flex flex-col items-center gap-6">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.3, scale: 0.8 }}
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{ 
                      duration: 1.2, 
                      delay: i * 0.2, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                  />
                ))}
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-[10px] uppercase tracking-[0.5em] text-slate-500 font-bold"
              >
                Initializing Secure Protocol
              </motion.span>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Decorative Corners */}
      <div className="absolute top-12 left-12 w-12 h-12 border-t-2 border-l-2 border-white/5 rounded-tl-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-12 h-12 border-b-2 border-r-2 border-white/5 rounded-br-3xl pointer-events-none" />
    </main>
  )
}
