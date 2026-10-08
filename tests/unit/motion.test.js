// Paridade movimento.css × lib/motion.js + varredura de movimento no src.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { TOKENS_CSS } from '@/lib/motion'

const raiz = join(import.meta.dirname, '..', '..')
const css = readFileSync(join(raiz, 'src/styles/movimento.css'), 'utf8')
const tokensDoCss = Object.fromEntries([...css.matchAll(/(--fc-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
const arquivos = (pasta) =>
  readdirSync(pasta).flatMap((n) => {
    const p = join(pasta, n)
    if (statSync(p).isDirectory()) return n === 'lottie' ? [] : arquivos(p)
    return /\.(vue|js|css|scss)$/.test(n) ? [p] : []
  })

describe('tokens de movimento', () => {
  it('todo token do JS existe no CSS com o MESMO valor', () => {
    for (const [nome, valor] of Object.entries(TOKENS_CSS)) expect(tokensDoCss[nome], nome).toBe(valor)
  })
  it('todo token de curva/duração/stagger/deslocamento do CSS tem espelho no JS', () => {
    const doCss = Object.keys(tokensDoCss).filter((k) => /^--fc-(curva|dur|stagger|desloc)/.test(k))
    expect(doCss.sort()).toEqual(Object.keys(TOKENS_CSS).sort())
  })
})

describe('varredura de movimento no src', () => {
  const fontes = arquivos(join(raiz, 'src')).map((p) => [p, readFileSync(p, 'utf8')])
  it('sem overshoot fora dos JSON (cubic-bezier com 1.3)', () => {
    expect(fontes.filter(([, t]) => /cubic-bezier\([^)]*1\.3/.test(t)).map(([p]) => p)).toEqual([])
  })
  it('sem scroll-behavior: smooth, will-change, transition: all nem reset global de duração', () => {
    const ruins = fontes.filter(([, t]) => /scroll-behavior:\s*smooth|will-change|transition:\s*all|transition-duration:\s*\.?0*\.01ms/.test(t))
    expect(ruins.map(([p]) => p)).toEqual([])
  })
  it('sem ease/linear como curva', () => {
    const ruins = fontes.filter(([, t]) => /(transition|animation)[a-z-]*:[^;{}]*\b(ease|ease-in|ease-out|ease-in-out|linear)\b/.test(t))
    expect(ruins.map(([p]) => p)).toEqual([])
  })
})
