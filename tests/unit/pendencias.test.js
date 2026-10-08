// Portão de produção: falha por FORMATO, não por comparação com a sentinela.
import { describe, expect, it } from 'vitest'
import { acharSentinelas, listarPendencias, listarPendenciasCliente, mensagemPortao } from '@/config/pendencias-build'
import { emailPendente, SITE, TEXTO_PENDENTE, whatsappPendente } from '@/config/site'
import { linkWhatsApp, urlWhatsApp } from '@/lib/whatsapp'

const pronto = { whatsapp: '5511912345678', email: 'contato@fornadaconecta.com.br', vigenciaDocs: '2026-10-20', docsRevisados: true }
// o site antes dos dados do cliente: as sentinelas que o portão tem que barrar (continua sendo o caso a provar)
const pendente = { whatsapp: '55PREENCHER', email: 'PREENCHER', vigenciaDocs: '', docsRevisados: false }

describe('listarPendencias', () => {
  it('com as sentinelas, o portão barra as 4: WhatsApp, e-mail, vigência e revisão jurídica', () => {
    const falta = listarPendencias(pendente)
    expect(falta).toHaveLength(4)
    expect(falta.join(' ')).toMatch(/WhatsApp/)
    expect(falta.join(' ')).toMatch(/E-mail/)
  })
  it('o site de hoje está pronto para produção: contatos reais no formato, vigência e revisão jurídica', () => {
    expect(whatsappPendente).toBe(false)
    expect(emailPendente).toBe(false)
    expect(SITE.whatsapp).toBe('5511922037628')
    expect(SITE.email).toBe('contato@fornadaconecta.com.br')
    expect(listarPendencias(SITE)).toEqual([]) // vigência e revisão jurídica também: produção liberada
    // todo atalho de WhatsApp sai do número do SITE (nenhum número escrito à mão em componente)
    expect(linkWhatsApp('Olá!').url).toBe(urlWhatsApp('5511922037628', 'Olá!'))
  })
  it('com dado real no formato certo, nada falta (produção libera)', () => expect(listarPendencias(pronto)).toEqual([]))
  it('e-mail pendente também bloqueia', () => expect(listarPendencias({ ...pronto, email: 'PREENCHER' })).toHaveLength(1))
  it('número fora do formato bloqueia, mesmo sem a palavra sentinela', () => {
    expect(listarPendencias({ ...pronto, whatsapp: '11912345678' })).toHaveLength(1)
    expect(listarPendencias({ ...pronto, whatsapp: '55119123456789' })).toHaveLength(1)
  })
  it('docsRevisados precisa ser true literal e a vigência uma data', () => {
    expect(listarPendencias({ ...pronto, docsRevisados: 'sim' })).toHaveLength(1)
    expect(listarPendencias({ ...pronto, vigenciaDocs: '20/10/2026' })).toHaveLength(1)
    expect(listarPendencias({ ...pronto, vigenciaDocs: '2026-13-45' })).toHaveLength(1) // formato certo, dia que não existe
    expect(listarPendencias({ ...pronto, vigenciaDocs: '2026-02-30' })).toHaveLength(1)
    expect(listarPendencias({ ...pronto, vigenciaDocs: '2028-02-29' })).toHaveLength(0) // bissexto existe
  })
  it('a lista da faixa da prévia tem os mesmos itens, em texto de gente (sem nome de campo nem formato)', () => {
    const cliente = listarPendenciasCliente(pendente)
    expect(cliente).toHaveLength(listarPendencias(pendente).length)
    expect(listarPendenciasCliente(SITE)).toHaveLength(listarPendencias(SITE).length)
    for (const t of cliente) expect(t).not.toMatch(/SITE\.|AAAA|=|\(/)
    expect(listarPendenciasCliente({ ...pronto, email: 'PREENCHER' })).toEqual(['E-mail de contato'])
    expect(listarPendenciasCliente(pronto)).toEqual([])
  })
  it('a mensagem do build diz "Contato pendente" e aponta a prévia', () => {
    expect(mensagemPortao(listarPendencias(pendente))).toMatch(/^Contato pendente/)
    expect(mensagemPortao(['x'])).toMatch(/build:previa/)
  })
})

describe('varredura do dist (closeBundle)', () => {
  it('acha 55PREENCHER e [a preencher] em qualquer arquivo de texto', () => {
    const achados = acharSentinelas([
      { nome: 'assets/index.js', conteudo: 'const a="ok";const n="55PREENCHER";' },
      { nome: 'index.html', conteudo: '<p>[a preencher]</p>' },
      { nome: 'assets/limpo.js', conteudo: 'tudo certo' },
    ])
    expect(achados.map((a) => a.split(' ')[0])).toEqual(['assets/index.js', 'index.html'])
  })
  it('"Preencher o cadastro" (botão do Seja produtor) e "preencher" solto NÃO travam a produção; sentinela em maiúsculas e todo marcador com colchete travam', () => {
    const legitimos = acharSentinelas([
      { nome: 'assets/produtor.js', conteudo: '"Preencher o cadastro"' },
      { nome: 'assets/outro.js', conteudo: 'é só preencher o formulário; campos a preencher depois' },
    ])
    expect(legitimos).toEqual([])
    const ruins = acharSentinelas([
      { nome: 'a.js', conteudo: 'wa.me/55PREENCHER' },
      { nome: 'b.js', conteudo: 'email:"PREENCHER"' },
      { nome: 'c.html', conteudo: '<span>[a preencher]</span>' },
      // marcadores do texto legal (src/components/*/texto.js)
      { nome: 'd.js', conteudo: 'Vigência: [a preencher na publicação]' },
      { nome: 'e.js', conteudo: 'Hospedagem: [a preencher: nome do provedor]' },
      { nome: 'f.js', conteudo: 'Prazo: [a preencher com o cliente: em que momento]' },
    ])
    expect(ruins.map((r) => r.split(' ')[0])).toEqual(['a.js', 'b.js', 'c.html', 'd.js', 'e.js', 'f.js'])
  })
  it('em dev/teste o marcador visível existe (é dobrado para fora só no build de produção)', () => {
    expect(TEXTO_PENDENTE).toBe('[a preencher]')
  })
})
