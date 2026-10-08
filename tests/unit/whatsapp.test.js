// Mensagem wa.me. Oráculo próprio: os valores esperados estão escritos aqui, não derivados do código.
import { describe, expect, it } from 'vitest'
import { abrirWhatsApp, formatarNumeroEmpresa, linkWhatsApp, montarMensagemWhatsApp, montarTexto, urlWhatsApp } from '@/lib/whatsapp'

const NUMERO = '5500900000000' // DDD 00: ninguém real recebe
const encher = (n) => 'Pão de queijo e ação '.repeat(20).slice(0, n)

const pedido = {
  nome: 'Maria da Silva',
  comercio: 'Lanchonete Boa Vista',
  tipo: 'Lanchonete',
  bairro: 'Centro',
  cidade: 'Guarulhos',
  produtos: ['Pães', 'Bolos'],
  frequencia: 'Todo dia',
  quantidade: '',
  whatsapp: '11912345678',
}
const produtor = {
  regularizacao: 'Em andamento',
  nome: 'João Souza',
  negocio: 'Forno do João',
  cnpj: '',
  bairro: 'Bonsucesso',
  cidade: 'Guarulhos',
  produz: ['Pães', 'Outro'],
  qual: 'Broa',
  capacidade: '200 pães',
  whatsapp: '(11) 2345-6789',
}

describe('montarTexto — modelo literal da mensagem', () => {
  it('pedido: prefixo, ordem das linhas, quantidade vazia some, rodapé', () => {
    expect(montarTexto('PEDIDO', pedido).split('\n')).toEqual([
      '[PEDIDO] Quero receber fornada',
      'Responsável: Maria da Silva',
      'Comércio: Lanchonete Boa Vista',
      'Tipo: Lanchonete',
      'Bairro/cidade: Centro, Guarulhos',
      'Produtos: Pães, Bolos',
      'Frequência: Todo dia',
      'WhatsApp: (11) 91234-5678',
      'Enviado pelo site',
    ])
  })
  it('pedido: "Outro" vira "Outro: qual" e a quantidade aparece quando preenchida', () => {
    const t = montarTexto('PEDIDO', { ...pedido, tipo: 'Outro', qual: 'Padaria de bairro', quantidade: '50 pães' })
    expect(t).toContain('\nTipo: Outro: Padaria de bairro\n')
    expect(t).toContain('\nQuantidade por entrega: 50 pães\n')
  })
  it('produtor: regularização na 2ª linha, CNPJ vazio = "não informado", Outro com qual', () => {
    const l = montarTexto('PRODUTOR', produtor).split('\n')
    expect(l[0]).toBe('[PRODUTOR] Quero entrar na rede')
    expect(l[1]).toBe('Regularização sanitária: Em andamento')
    expect(l).toContain('CNPJ: não informado')
    expect(l).toContain('Produz: Pães, Outro: Broa')
    expect(l).toContain('WhatsApp: (11) 2345-6789')
    expect(l.at(-1)).toBe('Enviado pelo site')
  })
  it('nunca "undefined", "null", linha vazia nem "Rótulo: " sem valor', () => {
    for (const t of [montarTexto('PEDIDO', {}), montarTexto('PRODUTOR', {}), montarTexto('PEDIDO', pedido)]) {
      expect(t).not.toMatch(/undefined|null/)
      expect(t.split('\n').every((l) => l.trim() && !/: $/.test(l))).toBe(true)
      expect(t).not.toMatch(/página/i) // sem página de origem nos formulários
    }
  })
  it('tipo inválido é erro (nada de mensagem sem prefixo)', () => {
    expect(() => montarTexto('CONTATO', {})).toThrow()
  })
})

describe('URL wa.me', () => {
  it('acento e emoji sobrevivem ao encodeURIComponent; quebra de linha vira %0A; sem + no lugar de espaço', () => {
    const { url, texto } = montarMensagemWhatsApp('PEDIDO', { ...pedido, nome: 'Conceição \u{1F35E} Ávila' }, NUMERO)
    expect(url.startsWith(`https://wa.me/${NUMERO}?text=`)).toBe(true)
    expect(decodeURIComponent(url.split('?text=')[1])).toBe(texto)
    expect(texto).toContain('Conceição \u{1F35E} Ávila')
    expect(url).toContain('%0A')
    expect(url).not.toContain('+')
  })
  it('substituto UTF-16 solto (colado de outro app) não quebra a URL', () => {
    expect(() => montarMensagemWhatsApp('PEDIDO', { ...pedido, nome: 'Ana \uD83D fim' }, NUMERO)).not.toThrow()
  })
  it('pior caso dos maxlength dos formulários cabe em 2000 caracteres, sem corte', () => {
    const p = montarMensagemWhatsApp('PEDIDO', {
      nome: encher(60), comercio: encher(80), tipo: 'Outro', qual: encher(40), bairro: encher(50), cidade: encher(50),
      produtos: ['Pães', 'Bolos', 'Salgados assados', 'Massas frescas'], frequencia: 'Alguns dias da semana', quantidade: encher(100), whatsapp: '11912345678',
    }, NUMERO)
    const q = montarMensagemWhatsApp('PRODUTOR', {
      regularizacao: 'Em andamento', nome: encher(60), negocio: encher(80), cnpj: '12.ABC.345/01DE-35', bairro: encher(50), cidade: encher(50),
      produz: ['Pães', 'Bolos', 'Salgados assados', 'Massas frescas', 'Outro'], qual: encher(60), capacidade: encher(100), whatsapp: '11912345678',
    }, NUMERO)
    expect(p.url.length).toBeLessThanOrEqual(2000)
    expect(q.url.length).toBeLessThanOrEqual(2000)
    expect(p.texto).toContain(encher(100).trim()) // nada cortado
  })
  it('número sentinela: pendente e SEM url (nenhum href falso)', () => {
    expect(montarMensagemWhatsApp('PEDIDO', pedido, '55PREENCHER')).toMatchObject({ pendente: true, url: null })
    expect(linkWhatsApp('Olá!', '55PREENCHER')).toMatchObject({ pendente: true, url: null, texto: 'Olá!' })
    expect(linkWhatsApp('Olá!', NUMERO).url).toBe(urlWhatsApp(NUMERO, 'Olá!'))
  })
  it('número da empresa formatado (inclusive o de teste, DDD 00) e vazio com sentinela', () => {
    expect(formatarNumeroEmpresa('5511912345678')).toBe('(11) 91234-5678')
    expect(formatarNumeroEmpresa('551123456789')).toBe('(11) 2345-6789')
    expect(formatarNumeroEmpresa(NUMERO)).toBe('(00) 90000-0000')
    expect(formatarNumeroEmpresa('55PREENCHER')).toBe('')
  })
  it('abrirWhatsApp sem url não abre nada', () => {
    expect(abrirWhatsApp(null)).toBe(false)
  })
})
