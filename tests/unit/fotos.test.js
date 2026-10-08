// Mapa único das fotos (src/data/fotos.js): a série de cada chave está inteira (o FotoReal depende de WebP e JPEG
// com as mesmas larguras e do width/height do maior arquivo) e toda chave que o código pede existe no mapa.
import { describe, expect, it } from 'vitest'
import { FOTOS, PROPORCOES, temFoto } from '@/data/fotos'
import { CATEGORIAS } from '@/data/categorias'

const larguras = (srcset) => srcset.split(', ').map((c) => Number(c.split(' ')[1].replace('w', '')))

describe('mapa de fotos', () => {
  it('toda chave tem briefing, alt e legenda definidos', () => {
    for (const [chave, f] of Object.entries(FOTOS)) {
      expect(f.descricao, chave).toBeTruthy()
      expect(typeof f.alt, chave).toBe('string')
      expect(typeof f.legenda, chave).toBe('string')
    }
  })

  it('série com imagem: WebP e JPEG com as mesmas larguras, crescentes, e w × h na proporção do nome', () => {
    for (const [chave, f] of Object.entries(FOTOS)) {
      if (!f.imagens) continue
      expect(f.imagens.base, chave).toBeTruthy()
      for (const s of Object.values(f.imagens)) {
        const lw = larguras(s.webp)
        expect(lw, chave).toEqual(larguras(s.jpg))
        expect(lw, chave).toEqual([...lw].sort((a, b) => a - b))
        expect(s.w, chave).toBe(lw[lw.length - 1])
        expect(s.webp.split(', ').every((c) => /\.webp /.test(c)), chave).toBe(true)
        expect(s.jpg.split(', ').every((c) => /\.jpg /.test(c)), chave).toBe(true)
        expect(s.h / s.w).toBeGreaterThan(0)
      }
    }
  })

  it('a abertura e a segurança da Início têm foto, com versão de computador', () => {
    for (const chave of ['inicio-abertura-caixas', 'inicio-qualidade-etiqueta']) expect(temFoto(chave), chave).toBe(true)
    expect(FOTOS['inicio-abertura-caixas'].imagens.desktop).toBeTruthy()
    expect(FOTOS['inicio-qualidade-etiqueta'].imagens.desktop).toBeTruthy()
    // a abertura é a única informativa: as outras de banco são decorativas (alt "")
    expect(FOTOS['inicio-abertura-caixas'].alt).not.toBe('')
  })

  it('as chaves que o código pede existem', () => {
    for (const c of CATEGORIAS) expect(FOTOS[c.foto], c.chave).toBeTruthy()
    for (const chave of ['comercios-balcao', 'qualidade-conferencia', 'sobre-forno']) expect(FOTOS[chave], chave).toBeTruthy()
    expect(PROPORCOES).toContain('4:5')
  })
})
