'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Language } from '@/types'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

export default function LandingPage() {
  const [language, setLanguage] = useState<Language>('en')
  const t = language === 'es' ? esStrings : enStrings

  const features = t.landing.features as string[]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="text-xl font-bold text-[#0A66C2]">MyResumeBuilder</div>
        <LanguageToggle language={language} onChange={setLanguage} />
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0A66C2] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span>✓</span>
            <span>{language === 'es' ? '100% Gratis — Sin Registro' : '100% Free — No Account Required'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {t.landing.headline}
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
            {t.landing.subheadline}
          </p>

          <Link
            href={`/builder?lang=${language}`}
            className="inline-flex items-center gap-2 bg-[#0A66C2] text-white font-bold text-lg py-4 px-10 rounded-xl hover:bg-blue-700 transition-colors min-h-[56px] shadow-lg hover:shadow-xl"
          >
            {t.landing.cta}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl text-left">
                <span className="flex-shrink-0 w-6 h-6 bg-[#0A66C2] text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                <span className="text-sm font-medium text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-800 mb-8">
              {language === 'es' ? '¿Cómo funciona?' : 'How It Works'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  en: { title: 'Answer Questions', desc: '15 simple steps about your experience, skills, and goals' },
                  es: { title: 'Responde Preguntas', desc: '15 pasos simples sobre tu experiencia, habilidades y metas' },
                },
                {
                  step: '2',
                  en: { title: 'AI Builds Your Resume', desc: 'Our AI transforms your answers into professional language' },
                  es: { title: 'La IA Crea Tu Currículum', desc: 'Nuestra IA transforma tus respuestas en lenguaje profesional' },
                },
                {
                  step: '3',
                  en: { title: 'Download & Apply', desc: 'Get a polished PDF resume ready to send to employers' },
                  es: { title: 'Descarga y Aplica', desc: 'Obtén un currículum PDF listo para enviar a empleadores' },
                },
              ].map(({ step, en, es }) => {
                const content = language === 'es' ? es : en
                return (
                  <div key={step} className="text-center p-5">
                    <div className="w-12 h-12 bg-[#0A66C2] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                      {step}
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{content.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{content.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>{t.landing.footer}</p>
          <a href="#" className="text-[#0A66C2] hover:underline">{t.landing.privacy}</a>
        </div>
      </footer>
    </div>
  )
}
