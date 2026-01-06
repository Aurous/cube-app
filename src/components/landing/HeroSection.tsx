/**
 * Mobile stub for HeroSection
 * The web implementation with 3D cube is in HeroSection.web.tsx
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:py-32">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 md:flex-row md:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-xl text-center md:text-left"
        >
          <h1
            className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            style={{ color: 'var(--theme-text)' }}
          >
            Built by a cuber,{' '}
            <span style={{ color: 'var(--theme-accent)' }}>for cubers.</span>
          </h1>

          <p
            className="mb-8 text-lg md:text-xl"
            style={{ color: 'var(--theme-sub)' }}
          >
            A gamified smart cube companion that makes every solve count. Track your progress, 
            earn achievements, and compete globally.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
            <Link
              to="/app"
              className="rounded-lg px-8 py-3 text-lg font-medium transition-all hover:scale-105 hover:opacity-90"
              style={{
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-bg)',
              }}
            >
              Start Solving →
            </Link>

            <a
              href="https://discord.gg/XPQr4wpQVg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border px-8 py-3 text-lg font-medium transition-all hover:opacity-80"
              style={{
                borderColor: 'var(--theme-sub-alt)',
                color: 'var(--theme-text)',
              }}
            >
              <MessageCircle className="h-5 w-5" />
              Join Discord
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative h-72 w-72 md:h-96 md:w-96 lg:h-[28rem] lg:w-[28rem] flex items-center justify-center"
          style={{
            backgroundColor: '#1a1a1a',
            borderRadius: 16,
          }}
        >
          <div style={{ color: '#666', textAlign: 'center', fontSize: 14 }}>
            3D Cube Preview
            <br />
            <span style={{ fontSize: 12 }}>Available on web</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
