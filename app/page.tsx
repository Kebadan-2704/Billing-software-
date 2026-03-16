'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to company selection after 2 seconds
    const timer = setTimeout(() => {
      router.push('/company-selection')
    }, 2500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="fixed inset-0"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 15, repeat: Infinity }}
      >
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"
          animate={{ x: [0, 50, -50, 0], y: [0, 30, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl opacity-20"
          animate={{ x: [0, -50, 50, 0], y: [0, -30, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1, type: 'spring', stiffness: 100 }}
          className="mb-8 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-40 h-40"
          >
            <Image
              src="/logo.png"
              alt="MD Construction Logo"
              width={160}
              height={160}
              priority
              className="drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-6xl font-bold text-white mb-4"
        >
          MD <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Construction</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-2xl text-gray-300 mb-8"
        >
          Professional Project Management System
        </motion.p>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex justify-center gap-2 mb-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
              className="w-3 h-3 bg-blue-500 rounded-full"
            />
          ))}
        </motion.div>

        {/* Status Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="text-gray-400 text-sm"
        >
          Loading dashboard...
        </motion.p>
      </div>
    </main>
  )
}
