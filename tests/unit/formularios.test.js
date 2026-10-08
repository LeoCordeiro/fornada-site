// Formulários que fecham no WhatsApp: mensagem montada a partir dos VALORES dos campos, validação, rótulos fixos
// e o envio síncrono. Ambiente node: nada de DOM.
import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import {
  camposPedido, camposProdutor, mensagemPedido, mensagemProdutor, produtosDaQuery, produtosIniciais, segurarToques, useEnvioWhatsapp,
  validarPedido, validarProdutor, valoresIniciaisPedido, valoresIniciaisProdutor,
} from '@/composables/useEnvioWhatsapp'
import { AVISOS_REGULARIZACAO, ENVIO, LEGENDA_OBRIGATORIOS, PEDIDO, PRODUTOR, WHATSAPP, resumoDeErros } from '@/data/formularios'
import { registrarCliqueWhatsApp } from '@/composables/useNudge'

// o lembrete do botão fixo conta cliques de WhatsApp: aqui só interessa SE o envio avisa
vi.mock('@/composables/useNudge', () => ({ registrarCliqueWhatsApp: vi.fn() }))

const NUMERO = '5511912345678' // número FALSO de teste (nunca o do site)
const SENTINELA = '55PREENCHER'
const ACENTUADO = 'Pão de queijo e ação '
const encher = (n) => ACENTUADO.repeat(Math.ceil(n / ACENTUADO.length)).slice(0, n)

const pedidoOk = (extra = {}) => ({
  ...valoresIniciaisPedido(['Bolos', 'Pães']), // fora de ordem de propósito
  nome: 'Ana Conceição', comercio: 'Lanchonete São João', tipo: 'Lanchonete', bairro: 'Vila Galvão', cidade: 'Guarulhos',
  frequencia: 'Todo dia', whatsapp: '(11) 91234-5678', ...extra,
})
const produtorOk = (extra = {}) => ({
  ...valoresIniciaisProdutor(),
  regularizacao: 'Sim', nome: 'Bia Araújo', negocio: 'Forno da Bia', bairro: 'Jardim Tranquilidade', cidade: 'Guarulhos',
  produz: ['Pães'], capacidade: '200 pães', whatsapp: '(11) 98765-4321', ...extra,
})
const linhas = (texto) => texto.split('\n')
const decodificar = (url) => decodeURIComponent(url.split('?text=')[1])

describe('mensagem do pedido', () => {
  it('monta o modelo literal, linha a linha', () => {
    const m = mensagemPedido(pedidoOk({ quantidade: '50 pães e 2 bolos' }), NUMERO)
    expect(linhas(m.texto)).toEqual([
      '[PEDIDO] Quero receber fornada',
      'Responsável: Ana Conceição',
      'Comércio: Lanchonete São João',
      'Tipo: Lanchonete',
      'Bairro/cidade: Vila Galvão, Guarulhos',
      'Produtos: Pães, Bolos',
      'Frequência: Todo dia',
      'Quantidade por entrega: 50 pães e 2 bolos',
      'WhatsApp: (11) 91234-5678',
      'Enviado pelo site',
    ])
    expect(m.pendente).toBe(false)
    expect(m.url).toBe(`https://wa.me/${NUMERO}?text=${encodeURIComponent(m.texto)}`)
    expect(decodificar(m.url)).toBe(m.texto)
  })

  it('produtos saem na ordem do formulário, não na do clique', () => {
    const m = mensagemPedido(pedidoOk({ produtos: ['Massas frescas', 'Pães', 'Salgados assados'] }), NUMERO)
    expect(m.texto).toContain('Produtos: Pães, Salgados assados, Massas frescas')
  })

  it('"Outro" leva o "Qual?"; sem "Outro", um "Qual?" esquecido não vaza para a mensagem', () => {
    expect(mensagemPedido(pedidoOk({ tipo: 'Outro', qual: 'Quiosque de praça' }), NUMERO).texto).toContain('Tipo: Outro: Quiosque de praça')
    const m = mensagemPedido(pedidoOk({ tipo: 'Escola', qual: 'sobrou de antes' }), NUMERO)
    expect(m.texto).toContain('Tipo: Escola')
    expect(m.texto).not.toContain('sobrou de antes')
  })

  it('quantidade vazia (ou só espaços) some da mensagem: nenhuma linha vazia, undefined ou null', () => {
    for (const quantidade of ['', '   ']) {
      const t = mensagemPedido(pedidoOk({ quantidade }), NUMERO).texto
      expect(t).not.toContain('Quantidade por entrega')
      expect(t).not.toMatch(/undefined|null/)
      expect(linhas(t).every((l) => l && !/:\s*$/.test(l))).toBe(true)
    }
  })

  it('espaços repetidos e nas pontas viram um só; acento e emoji sobrevivem ao encode', () => {
    const m = mensagemPedido(pedidoOk({ nome: '  Ana   Maria  ', comercio: 'Café ☕ do Zé' }), NUMERO)
    expect(m.texto).toContain('Responsável: Ana Maria\n')
    expect(m.texto).toContain('Comércio: Café ☕ do Zé\n')
    expect(decodificar(m.url)).toBe(m.texto)
    expect(m.url).not.toMatch(/ |\+|%0D/) // sem espaço cru, sem + e sem \r
  })

  it('sem número no site (sentinela): a mensagem existe, a URL não (nenhum link falso)', () => {
    const m = mensagemPedido(pedidoOk(), SENTINELA)
    expect(m.pendente).toBe(true)
    expect(m.url).toBeNull()
    expect(m.texto.startsWith('[PEDIDO] Quero receber fornada\n')).toBe(true)
  })
})

describe('mensagem do produtor', () => {
  it('a regularização vai na 2ª linha, para cada resposta', () => {
    for (const r of ['Sim', 'Em andamento', 'Não']) {
      const t = mensagemProdutor(produtorOk({ regularizacao: r }), NUMERO).texto
      expect(linhas(t)[0]).toBe('[PRODUTOR] Quero entrar na rede')
      expect(linhas(t)[1]).toBe(`Regularização sanitária: ${r}`)
    }
  })

  it('monta o modelo literal; CNPJ vazio vira "não informado"', () => {
    const m = mensagemProdutor(produtorOk({ produz: ['Bolos', 'Pães', 'Outro'], qual: 'Broa de milho' }), NUMERO)
    expect(linhas(m.texto)).toEqual([
      '[PRODUTOR] Quero entrar na rede',
      'Regularização sanitária: Sim',
      'Responsável: Bia Araújo',
      'Negócio: Forno da Bia',
      'CNPJ: não informado',
      'Bairro/cidade: Jardim Tranquilidade, Guarulhos',
      'Produz: Pães, Bolos, Outro: Broa de milho',
      'Capacidade por dia: 200 pães',
      'WhatsApp: (11) 98765-4321',
      'Enviado pelo site',
    ])
  })

  it('CNPJ digitado com letras e sem máscara sai formatado em maiúsculas', () => {
    expect(mensagemProdutor(produtorOk({ cnpj: '12abc34501de35' }), NUMERO).texto).toContain('CNPJ: 12.ABC.345/01DE-35\n')
    expect(mensagemProdutor(produtorOk({ cnpj: '68998077000136' }), NUMERO).texto).toContain('CNPJ: 68.998.077/0001-36\n')
  })

  it('um "Qual?" esquecido sem "Outro" marcado não vaza', () => {
    const t = mensagemProdutor(produtorOk({ produz: ['Pães'], qual: 'sobrou' }), NUMERO).texto
    expect(t).toContain('Produz: Pães\n')
    expect(t).not.toContain('sobrou')
  })

  it('sem undefined, null nem linha terminando em ": "', () => {
    const t = mensagemProdutor(produtorOk(), NUMERO).texto
    expect(t).not.toMatch(/undefined|null/)
    expect(linhas(t).every((l) => l && !/:\s*$/.test(l))).toBe(true)
  })
})

describe('URL dentro do teto de 2000 caracteres no pior caso dos maxlength', () => {
  it('pedido: todos os campos no limite, todos os produtos, "Outro"', () => {
    const c = PEDIDO.campos
    const v = pedidoOk({
      nome: encher(c.nome.max), comercio: encher(c.comercio.max), tipo: 'Outro', qual: encher(c.qual.max),
      bairro: encher(c.bairro.max), cidade: encher(c.cidade.max), produtos: [...c.produtos.opcoes],
      frequencia: 'Alguns dias da semana', quantidade: encher(c.quantidade.max),
    })
    const m = mensagemPedido(v, NUMERO)
    expect(m.url.length).toBeLessThanOrEqual(2000)
    expect(decodificar(m.url)).toBe(m.texto) // nada cortado calado
    expect(m.texto).toContain(encher(c.quantidade.max).trim())
  })

  it('produtor: todos os campos no limite, CNPJ completo, todos os produtos e "Outro"', () => {
    const c = PRODUTOR.campos
    const v = produtorOk({
      regularizacao: 'Em andamento', nome: encher(c.nome.max), negocio: encher(c.negocio.max), cnpj: '12.ABC.345/01DE-35',
      bairro: encher(c.bairro.max), cidade: encher(c.cidade.max), produz: [...c.produz.opcoes], qual: encher(c.qual.max),
      capacidade: encher(c.capacidade.max),
    })
    const m = mensagemProdutor(v, NUMERO)
    expect(m.url.length).toBeLessThanOrEqual(2000)
    expect(decodificar(m.url)).toBe(m.texto)
  })
})

describe('validação do pedido', () => {
  it('formulário vazio: todos os campos obrigatórios, na ORDEM do formulário (o 1º é o do foco)', () => {
    expect(Object.keys(validarPedido(valoresIniciaisPedido()))).toEqual([
      'nome', 'comercio', 'tipo', 'bairro', 'cidade', 'produtos', 'frequencia', 'whatsapp',
    ])
  })

  it('"Qual?" só é cobrado com "Outro"; quantidade nunca é cobrada', () => {
    expect(validarPedido(pedidoOk({ tipo: 'Outro', qual: '' })).qual).toBe('Conta que tipo de comércio é.')
    expect(validarPedido(pedidoOk({ tipo: 'Outro', qual: 'Banca' }))).toEqual({})
    expect(validarPedido(pedidoOk({ tipo: 'Escola', qual: '' }))).toEqual({})
    expect(validarPedido(pedidoOk({ quantidade: '' }))).toEqual({})
  })

  it('texto só de espaços conta como vazio', () => {
    expect(Object.keys(validarPedido(pedidoOk({ nome: '   ', cidade: '\t' })))).toEqual(['nome', 'cidade'])
  })

  it('mensagens de erro do pedido', () => {
    const e = validarPedido(valoresIniciaisPedido())
    expect(e).toMatchObject({
      nome: 'Escreve o nome de quem cuida dos pedidos.',
      comercio: 'Escreve o nome do comércio.',
      tipo: 'Escolhe o tipo do seu comércio.',
      bairro: 'Diz o bairro da entrega.',
      cidade: 'Diz a cidade da entrega.',
      produtos: 'Marca pelo menos um produto.',
      frequencia: 'Escolhe com que frequência você precisa.',
      whatsapp: 'Coloca um WhatsApp com DDD pra gente responder.',
    })
  })

  it('WhatsApp: máscara pronta, colado com +55, sem máscara; DDD e formato inválidos', () => {
    const erro = (whatsapp) => validarPedido(pedidoOk({ whatsapp })).whatsapp
    expect(erro('(11) 91234-5678')).toBeUndefined()
    expect(erro('11912345678')).toBeUndefined()
    expect(erro('+55 11 91234-5678')).toBeUndefined()
    expect(erro('011 91234-5678')).toBeUndefined()
    expect(erro('(11) 2345-6789')).toBeUndefined() // fixo com 10 dígitos
    expect(erro('1091234567')).toBe(WHATSAPP.erros.ddd)
    expect(erro('(10)')).toBe(WHATSAPP.erros.ddd) // com 2 dígitos o DDD já é conhecido — erro de DDD, não de formato
    expect(erro('(11) 9')).toBe(WHATSAPP.erros.formato) // DDD válido e número curto: aí sim é formato
    expect(erro('11812345678')).toBe(WHATSAPP.erros.formato) // 11 dígitos sem o 9
    expect(erro('(11) 9123')).toBe(WHATSAPP.erros.formato)
    expect(erro('')).toBe(WHATSAPP.erros.vazio)
  })
})

describe('validação do produtor', () => {
  it('formulário vazio: a regularização é o 1º; CNPJ vazio não é cobrado', () => {
    expect(Object.keys(validarProdutor(valoresIniciaisProdutor()))).toEqual([
      'regularizacao', 'nome', 'negocio', 'bairro', 'cidade', 'produz', 'capacidade', 'whatsapp',
    ])
  })

  it('"Não" na regularização NÃO bloqueia o envio', () => {
    expect(validarProdutor(produtorOk({ regularizacao: 'Não' }))).toEqual({})
    expect(validarProdutor(produtorOk({ regularizacao: 'Em andamento' }))).toEqual({})
  })

  it('CNPJ: válido, com letras, errado, repetido e incompleto', () => {
    const erro = (cnpj) => validarProdutor(produtorOk({ cnpj })).cnpj
    const E = PRODUTOR.campos.cnpj.erros
    expect(erro('')).toBeUndefined()
    expect(erro('68998077000136')).toBeUndefined()
    expect(erro('68.998.077/0001-36')).toBeUndefined()
    expect(erro('12abc34501de35')).toBeUndefined()
    expect(erro('12.ABC.345/01DE-35')).toBeUndefined()
    expect(erro('68.998.077/0001-37')).toBe(E.dv)
    expect(erro('11111111111111')).toBe(E.dv)
    expect(erro('68.998.077')).toBe(E.incompleto)
    expect(erro('..//-')).toBeUndefined() // só pontuação digitada = nada digitado
  })

  it('"Qual?" só é cobrado com "Outro" marcado', () => {
    expect(validarProdutor(produtorOk({ produz: ['Pães', 'Outro'], qual: '' })).qual).toBe('Conta o que mais você produz.')
    expect(validarProdutor(produtorOk({ produz: ['Pães', 'Outro'], qual: 'Broa' }))).toEqual({})
    expect(validarProdutor(produtorOk({ produz: ['Pães'], qual: '' }))).toEqual({})
  })

  it('mensagens de erro do produtor', () => {
    const e = validarProdutor(valoresIniciaisProdutor())
    expect(e).toMatchObject({
      regularizacao: 'Escolhe uma opção\u00a0— é a primeira coisa que a gente confere.', // espaço que não quebra antes do travessão
      nome: 'Escreve o seu nome.',
      negocio: 'Escreve o nome do seu negócio.',
      bairro: 'Diz o bairro onde fica o seu forno.',
      cidade: 'Diz a cidade onde fica o seu forno.',
      produz: 'Marca pelo menos um tipo de produto.',
      capacidade: 'Conta quanto, mais ou menos, dá pra produzir por dia.',
    })
  })
})

describe('pré-marcação por ?produtos=', () => {
  it('lê slugs, devolve rótulos na ordem do formulário', () => {
    expect(produtosDaQuery('paes,bolos')).toEqual(['Pães', 'Bolos'])
    expect(produtosDaQuery('bolos,paes')).toEqual(['Pães', 'Bolos'])
    expect(produtosDaQuery(['massas-frescas', 'salgados-assados'])).toEqual(['Salgados assados', 'Massas frescas'])
    expect(produtosDaQuery(' PAES , massas-frescas ')).toEqual(['Pães', 'Massas frescas'])
  })
  it('a prop `produtos` vence a query; prop vazia = nada pré-marcado; sem prop, vale a query', () => {
    expect(produtosIniciais(['massas-frescas'], 'paes,bolos')).toEqual(['Massas frescas'])
    expect(produtosIniciais([], 'paes,bolos')).toEqual([])
    expect(produtosIniciais(undefined, 'paes,bolos')).toEqual(['Pães', 'Bolos'])
    expect(produtosIniciais(undefined, undefined)).toEqual([])
    expect(produtosIniciais(['xyz'], 'bolos')).toEqual([])
  })
  it('ignora o que não é slug da lista', () => {
    expect(produtosDaQuery('xyz')).toEqual([])
    expect(produtosDaQuery('paes,<script>,bolos,,')).toEqual(['Pães', 'Bolos'])
    expect(produtosDaQuery('Pães')).toEqual([])
    expect(produtosDaQuery(undefined)).toEqual([])
    expect(produtosDaQuery(null)).toEqual([])
    expect(produtosDaQuery([null, 3, 'bolos'])).toEqual(['Bolos'])
  })
})

describe('rótulos, opções e botões dos formulários (texto fixo)', () => {
  it('pedido', () => {
    const c = PEDIDO.campos
    expect([c.nome, c.comercio, c.tipo, c.qual, c.bairro, c.cidade, c.produtos, c.frequencia, c.quantidade, c.whatsapp].map((x) => x.rotulo)).toEqual([
      'Seu nome', 'Nome do comércio ou razão social', 'Tipo de comércio', 'Qual?', 'Bairro', 'Cidade', 'Produtos de interesse',
      'Com que frequência você precisa?', 'Quantidade aproximada por entrega (opcional)', 'WhatsApp com DDD',
    ])
    expect(c.tipo.opcoes).toEqual(['Lanchonete', 'Cafeteria', 'Mercadinho', 'Escola', 'Empresa com copa ou refeitório', 'Outro'])
    expect(c.produtos.opcoes).toEqual(['Pães', 'Bolos', 'Salgados assados', 'Massas frescas'])
    expect(c.frequencia.opcoes).toEqual(['Todo dia', 'Alguns dias da semana', 'Uma vez por semana', 'De vez em quando'])
    expect(PEDIDO.botao).toBe('Abrir pedido no WhatsApp')
  })
  it('produtor', () => {
    const c = PRODUTOR.campos
    expect([c.regularizacao, c.nome, c.negocio, c.cnpj, c.bairro, c.cidade, c.produz, c.qual, c.capacidade, c.whatsapp].map((x) => x.rotulo)).toEqual([
      'O seu negócio tem regularização sanitária própria?', 'Seu nome', 'Nome do negócio ou razão social', 'CNPJ (opcional)', 'Bairro', 'Cidade',
      'O que você produz', 'Qual?', 'Capacidade aproximada por dia', 'WhatsApp com DDD',
    ])
    expect(c.regularizacao.opcoes).toEqual(['Sim', 'Em andamento', 'Não'])
    expect(c.produz.opcoes).toEqual(['Pães', 'Bolos', 'Salgados assados', 'Massas frescas', 'Outro'])
    expect(c.cnpj.alternar).toEqual({ letras: 'Meu CNPJ tem letras', numeros: 'Meu CNPJ só tem números' })
    expect(PRODUTOR.botao).toBe('Abrir cadastro no WhatsApp')
  })
  it('legenda, resumo e sucesso', () => {
    expect(LEGENDA_OBRIGATORIOS).toBe('Todos os campos são obrigatórios, menos os marcados com (opcional).')
    expect(resumoDeErros(1)).toBe('Falta corrigir 1 campo. Ele está marcado acima.')
    expect(resumoDeErros(4)).toBe('Falta corrigir 4 campos. Eles estão marcados acima.')
    expect(ENVIO.titulo).toBe('Sua mensagem está pronta no WhatsApp')
    expect(ENVIO.texto.PEDIDO).toBe('Pronto! O WhatsApp abriu com seu pedido escrito. É só tocar em enviar.')
    expect(ENVIO.texto.PRODUTOR).toBe('Pronto! O WhatsApp abriu com seu cadastro escrito. É só tocar em enviar.')
    expect([ENVIO.abrirDeNovo, ENVIO.copiar, ENVIO.corrigir, ENVIO.voltar]).toEqual([
      'Abrir o WhatsApp de novo', 'Não abriu? Copiar mensagem', 'Corrigir dados', 'Voltar ao início',
    ])
    expect(ENVIO.copiou).toBe('Mensagem copiada.')
    expect(ENVIO.naoCopiou).toBe('Não deu pra copiar sozinho. Seleciona o texto acima e copia.')
  })
  it('avisos da regularização: "Não" abre com o requisito e deixa enviar; "Em andamento" é nota neutra', () => {
    expect(AVISOS_REGULARIZACAO.Não.alerta).toBe(true)
    expect(AVISOS_REGULARIZACAO.Não.paragrafos[0].forte).toBe('A regularização sanitária própria é requisito para entrar na rede.')
    expect(AVISOS_REGULARIZACAO.Não.paragrafos.at(-1).texto).toContain('manda o cadastro mesmo assim')
    expect(AVISOS_REGULARIZACAO['Em andamento'].alerta).toBe(false)
    expect(AVISOS_REGULARIZACAO['Em andamento'].paragrafos[0].forte).toBe('Pode mandar o cadastro.')
    expect(AVISOS_REGULARIZACAO.Sim).toBeUndefined()
  })
})

describe('atributos de teclado e preenchimento', () => {
  const att = (c) => ({ type: c.type, inputmode: c.inputmode, autocomplete: c.autocomplete, max: c.max })
  it('pedido', () => {
    const c = PEDIDO.campos
    expect(att(c.nome)).toEqual({ type: 'text', inputmode: undefined, autocomplete: 'name', max: 60 })
    expect(c.nome.autocapitalize).toBe('words')
    expect(att(c.comercio)).toEqual({ type: 'text', inputmode: undefined, autocomplete: 'organization', max: 80 })
    expect(att(c.qual)).toEqual({ type: 'text', inputmode: undefined, autocomplete: 'off', max: 40 })
    expect(att(c.bairro)).toEqual({ type: 'text', inputmode: undefined, autocomplete: 'address-level3', max: 50 })
    expect(att(c.cidade)).toEqual({ type: 'text', inputmode: undefined, autocomplete: 'address-level2', max: 50 })
    expect(att(c.quantidade)).toEqual({ type: 'text', inputmode: undefined, autocomplete: 'off', max: 100 })
    expect(att(c.whatsapp)).toEqual({ type: 'tel', inputmode: 'tel', autocomplete: 'tel', max: undefined })
  })
  it('produtor', () => {
    const c = PRODUTOR.campos
    expect(att(c.nome)).toEqual({ type: 'text', inputmode: undefined, autocomplete: 'name', max: 60 })
    expect(att(c.negocio)).toEqual({ type: 'text', inputmode: undefined, autocomplete: 'organization', max: 80 })
    expect(att(c.cnpj)).toEqual({ type: 'text', inputmode: 'numeric', autocomplete: 'off', max: 18 })
    expect(c.cnpj.autocapitalize).toBe('characters')
    expect(c.cnpj.spellcheck).toBe('false')
    expect(att(c.qual)).toEqual({ type: 'text', inputmode: undefined, autocomplete: 'off', max: 60 })
    expect(att(c.capacidade)).toEqual({ type: 'text', inputmode: undefined, autocomplete: 'off', max: 100 })
  })
})

// ---- envio: síncrono, na mesma pilha do clique ---------------------------------------------------------------
describe('envio (useEnvioWhatsapp)', () => {
  let janela
  beforeEach(() => {
    janela = { open: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }
    globalThis.window = janela
    registrarCliqueWhatsApp.mockClear()
  })
  afterEach(() => {
    delete globalThis.window
    vi.useRealTimers()
  })

  const montar = (valores, extra = {}) =>
    useEnvioWhatsapp({
      tipo: 'PEDIDO', textos: PEDIDO, valores, validar: validarPedido, montar: camposPedido, idBase: 'teste', primeiro: 'nome',
      numero: NUMERO, ...extra,
    })

  it('válido: abre o WhatsApp no ato (window.open síncrono, noopener) e só então troca pelo sucesso', () => {
    const valores = reactive(pedidoOk())
    const aoEnviar = vi.fn()
    let sucessoJaTrocado = null
    const envio = montar(valores, { aoEnviar })
    janela.open.mockImplementation(() => {
      sucessoJaTrocado = envio.enviado.value !== null
    })

    const resultado = envio.enviar({ preventDefault() {} })

    expect(resultado).toBe(true) // retornou síncrono: nada de await entre o clique e a abertura
    expect(janela.open).toHaveBeenCalledTimes(1)
    const [url, alvo, recursos] = janela.open.mock.calls[0]
    expect(url).toBe(mensagemPedido(valores, NUMERO).url)
    expect([alvo, recursos]).toEqual(['_blank', 'noopener,noreferrer'])
    expect(sucessoJaTrocado).toBe(false) // abre primeiro, troca depois
    expect(envio.enviado.value).toEqual({ texto: mensagemPedido(valores, NUMERO).texto, url, pendente: false })
    expect(aoEnviar).toHaveBeenCalledWith({ texto: envio.enviado.value.texto, url })
  })

  it('inválido: nada abre, nada troca, resumo = nº de campos marcados e o 1º inválido é o do foco', () => {
    const valores = reactive(valoresIniciaisPedido())
    const envio = montar(valores)
    expect(envio.visiveis.value).toEqual({}) // antes de tentar, nada aparece
    expect(envio.resumo.value).toBe('')

    expect(envio.enviar({ preventDefault() {} })).toBe(false)

    expect(janela.open).not.toHaveBeenCalled()
    expect(envio.enviado.value).toBeNull()
    expect(envio.nInvalidos.value).toBe(8)
    expect(envio.resumo.value).toBe('Falta corrigir 8 campos. Eles estão marcados acima.')
    expect(Object.keys(envio.visiveis.value)[0]).toBe('nome')
    expect(envio.invalido('nome')).toBe('true')
    expect(envio.msgs('nome')).toEqual(['Escreve o nome de quem cuida dos pedidos.'])
  })

  it('o resumo acompanha as correções e usa o singular', () => {
    const valores = reactive(pedidoOk({ cidade: '' }))
    const envio = montar(valores)
    envio.enviar({ preventDefault() {} })
    expect(envio.resumo.value).toBe('Falta corrigir 1 campo. Ele está marcado acima.')
    valores.cidade = 'Guarulhos'
    expect(envio.resumo.value).toBe('')
    expect(envio.nInvalidos.value).toBe(0)
  })

  it('erro no tempo certo: nada ao digitar, aparece na 1ª saída, some ao corrigir sem nova saída', () => {
    const valores = reactive(pedidoOk({ whatsapp: '' }))
    const envio = montar(valores)
    valores.whatsapp = '(1' // digitando: ainda não saiu do campo
    expect(envio.msgs('whatsapp')).toEqual([])
    expect(envio.invalido('whatsapp')).toBeUndefined()

    envio.tocar('whatsapp') // blur
    expect(envio.msgs('whatsapp')).toEqual([WHATSAPP.erros.formato])
    expect(envio.invalido('whatsapp')).toBe('true')

    valores.whatsapp = '(11) 91234-5678' // corrigiu digitando
    expect(envio.msgs('whatsapp')).toEqual([])
    expect(envio.invalido('whatsapp')).toBeUndefined()

    valores.whatsapp = '(10) 91234-5678' // estragou de novo: volta na hora, sem novo blur
    expect(envio.msgs('whatsapp')).toEqual([WHATSAPP.erros.ddd])
  })

  it('reedição: sair de um campo válido não marca — voltar e apagar não mostra erro digitando, só no blur', () => {
    const valores = reactive(pedidoOk())
    const envio = montar(valores)
    envio.tocar('nome') // saiu válido
    valores.nome = '' // voltou e apagou tudo
    expect(envio.msgs('nome')).toEqual([])
    expect(envio.invalido('nome')).toBeUndefined()
    envio.tocar('nome') // saiu vazio: agora sim
    expect(envio.msgs('nome')).toHaveLength(1)
  })

  it('aria-describedby do grupo: a ajuda sempre; a mensagem de erro só enquanto ela existe', () => {
    const envio = montar(reactive(valoresIniciaisPedido()))
    expect(envio.descricao('produtos', true)).toBe('teste-produtos-ajuda')
    expect(envio.descricao('tipo')).toBeUndefined() // sem ajuda e sem mensagem: nada para descrever
    envio.tocar('produtos')
    expect(envio.descricao('produtos', true)).toBe('teste-produtos-ajuda teste-produtos-msgs-messages')
    expect(envio.descricao('produtos')).toBe('teste-produtos-ajuda')
  })

  it('só os campos já visitados mostram erro antes do envio', () => {
    const valores = reactive(valoresIniciaisPedido())
    const envio = montar(valores)
    envio.tocar('bairro')
    expect(Object.keys(envio.visiveis.value)).toEqual(['bairro'])
  })

  it('grupo só conta como "saiu" quando o foco vai para fora do fieldset', () => {
    const envio = montar(reactive(valoresIniciaisPedido()))
    const dentro = { contains: () => true }
    const fora = { contains: () => false }
    envio.sairDoGrupo('tipo', { currentTarget: dentro, relatedTarget: {} })
    expect(envio.msgs('tipo')).toEqual([])
    envio.sairDoGrupo('tipo', { currentTarget: fora, relatedTarget: null })
    expect(envio.msgs('tipo')).toEqual(['Escolhe o tipo do seu comércio.'])
  })

  it('envio que abriu o WhatsApp conta como clique de WhatsApp: zero lembretes do botão fixo depois', () => {
    const envio = montar(reactive(pedidoOk()))
    envio.enviar({ preventDefault() {} })
    expect(janela.open).toHaveBeenCalledTimes(1)
    expect(registrarCliqueWhatsApp).toHaveBeenCalledTimes(1)
  })

  it('número do site pendente: a mensagem aparece (prévia), mas nada abre', () => {
    const valores = reactive(pedidoOk())
    const envio = montar(valores, { numero: SENTINELA })
    expect(envio.enviar({ preventDefault() {} })).toBe(true)
    expect(janela.open).not.toHaveBeenCalled()
    expect(registrarCliqueWhatsApp).not.toHaveBeenCalled() // nada abriu: não conta
    expect(envio.enviado.value.url).toBeNull()
    expect(envio.enviado.value.pendente).toBe(true)
    expect(envio.enviado.value.texto.startsWith('[PEDIDO] Quero receber fornada')).toBe(true)
  })

  it('"Corrigir dados" volta ao formulário sem perder nenhum valor', async () => {
    const valores = reactive(produtorOk({ cnpj: '68.998.077/0001-36' }))
    const antes = JSON.stringify(valores)
    const envio = useEnvioWhatsapp({
      tipo: 'PRODUTOR', textos: PRODUTOR, valores, validar: validarProdutor, montar: camposProdutor, idBase: 'teste', primeiro: 'regularizacao', numero: NUMERO,
    })
    envio.enviar({ preventDefault() {} })
    expect(envio.enviado.value).not.toBeNull()
    await envio.corrigir()
    expect(envio.enviado.value).toBeNull()
    expect(JSON.stringify(valores)).toBe(antes)
  })

  it('props do campo de texto saem dos dados do formulário e do estado (ajuda, limites, atributos, aria-invalid); o rótulo é <label> estático no template', () => {
    const envio = montar(reactive(valoresIniciaisPedido()))
    const p = envio.propsTexto('whatsapp')
    expect(p).toMatchObject({
      id: 'teste-whatsapp', hint: 'O número em que a gente te responde.', placeholder: '(11) 9XXXX-XXXX', persistentPlaceholder: true,
      type: 'tel', inputmode: 'tel', autocomplete: 'tel', errorMessages: [], color: 'marrom-profundo', rounded: null,
    })
    expect(p.label).toBeUndefined() // com label do Vuetify o texto longo seria cortado com reticências no celular
    expect(envio.propsTexto('nome').persistentPlaceholder).toBeUndefined()
    expect(p['aria-invalid']).toBeUndefined()
    expect(p.maxlength).toBeUndefined()
    envio.tocar('whatsapp')
    expect(envio.propsTexto('whatsapp')['aria-invalid']).toBe('true')
    expect(envio.propsTexto('nome').maxlength).toBe(60)
  })

  it('escudo de toque: segura mousedown, clique e duplo clique por 400 ms e depois solta', () => {
    vi.useFakeTimers()
    const soltar = segurarToques(400)
    for (const ev of ['mousedown', 'click', 'dblclick']) expect(janela.addEventListener).toHaveBeenCalledWith(ev, expect.any(Function), true)
    const barrar = janela.addEventListener.mock.calls[0][1]
    const evento = { preventDefault: vi.fn(), stopImmediatePropagation: vi.fn() }
    barrar(evento)
    expect(evento.preventDefault).toHaveBeenCalled()
    expect(evento.stopImmediatePropagation).toHaveBeenCalled()
    vi.advanceTimersByTime(399)
    expect(janela.removeEventListener).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    for (const ev of ['mousedown', 'click', 'dblclick']) expect(janela.removeEventListener).toHaveBeenCalledWith(ev, barrar, true)
    soltar() // idempotente
  })

  it('campos da mensagem do produtor/pedido não carregam valores de campos escondidos', () => {
    expect(camposPedido(pedidoOk({ tipo: 'Escola', qual: 'x' })).qual).toBe('')
    expect(camposProdutor(produtorOk({ produz: ['Pães'], qual: 'x' })).qual).toBe('')
  })
})

// ---- os dois componentes espelham o CSS base; fontes sem cor solta, rastreador nem armazenamento ----------------
describe('arquivos do grupo form/', () => {
  const ler = (rel) => readFileSync(new URL(`../../src/${rel}`, import.meta.url), 'utf8')
  const ARQUIVOS = [
    'components/form/FormPedido.vue', 'components/form/FormProdutor.vue', 'components/form/EstadoEnvio.vue',
    'composables/useEnvioWhatsapp.js', 'data/formularios.js',
  ]

  it('FormPedido e FormProdutor têm o MESMO bloco de CSS base', () => {
    const base = (t) => t.slice(t.indexOf('/* fc-form:base:inicio'), t.indexOf('/* fc-form:base:fim */'))
    const a = base(ler('components/form/FormPedido.vue'))
    expect(a.length).toBeGreaterThan(500)
    expect(base(ler('components/form/FormProdutor.vue'))).toBe(a)
  })

  it.each(ARQUIVOS)('%s: nada que as regras do projeto proíbem (comentário também conta)', (rel) => {
    const t = ler(rel)
    const proibidos = [
      [/#[0-9a-fA-F]{3,8}\b/, 'hex'],
      [/localStorage|sessionStorage|document\.cookie|indexedDB|serviceWorker|navigator\.storage/, 'armazenamento'],
      [/\bfetch\s*\(|XMLHttpRequest|\baxios\b|sendBeacon|\bWebSocket\b|\bEventSource\b/, 'rede'],
      [/v-img|VImg/i, 'v-img'],
      [/\bhref\s*=\s*["']#(?!\/)/, 'âncora crua'],
      [/scroll-behavior\s*:\s*smooth|will-change|willChange/, 'scroll/will-change'],
      [/transition\s*:\s*all/, 'transition: all'],
      [/\bease\b|\bease-|\blinear\b|linear-/, 'ease/linear'],
      [/\b(analytics|pixel|segment|sentry|tiktok|umami|clarity)\b/i, 'analytics'],
      [/<form\b[^>]*?(\baction\s*=|\bmethod\s*=)/i, 'form action/method'],
    ]
    for (const [re, nome] of proibidos) expect(t, `${rel}: ${nome}`).not.toMatch(re)
  })
})
