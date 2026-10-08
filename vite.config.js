import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { PALETA } from './src/styles/paleta.js'
import { SITE } from './src/config/site.js'
import { acharSentinelas, listarPendencias, mensagemPortao } from './src/config/pendencias-build.js'
import { HERO_FOTO_SIZES_DESKTOP } from './src/components/home/conteudo.js'

const raiz = fileURLToPath(new URL('.', import.meta.url))

// Única fonte de hex: paleta.js → :root (--fc-*), tema do Vuetify e theme-color.
// As fontes do H1 (Fraunces normal e o subconjunto itálico) começam a baixar junto com o HTML. O preload que
// o main.js injetava saía só depois do pacote JS: em parte das cargas a 1ª pintura usava a fonte de reserva, o H1
// mudava de número de linhas quando a Fraunces chegava e o que vinha embaixo pulava (CLS 0,034 na Qualidade a 1440).
// Só no build (o nome tem hash); em dev o main.js cuida.
const FONTES_H1 = [/fraunces-normal-pt-[\w-]+\.woff2$/, /fraunces-italico-display-[\w-]+\.woff2$/] // subconjuntos (fontes.css)
const preloadFontes = () => {
  let base = '/'
  return {
    name: 'preload-fontes-h1',
    apply: 'build',
    configResolved(c) {
      base = c.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const arquivos = Object.keys(ctx.bundle ?? {}).filter((f) => FONTES_H1.some((re) => re.test(f)))
        if (arquivos.length !== FONTES_H1.length) this.error(`preload das fontes do H1: esperava ${FONTES_H1.length} arquivos, achei ${arquivos.join(', ') || 'nenhum'}`)
        return arquivos.map((f) => ({ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: base + f, crossorigin: '' }, injectTo: 'head' }))
      },
    },
  }
}

// A foto da abertura da Home é o LCP do desktop. O preload começa a baixá-la junto com o HTML (sem ele, só depois do
// pacote JS montar a página). Só ≥ 1024 (media): no celular o LCP é o H1 e a foto (lazy, abaixo da dobra) não disputa
// banda com a fonte. Mesmos srcset (WebP) e sizes do <source> do HeroFoto — o navegador reaproveita o arquivo.
// Vai pela pré-busca da rota (abaixo), só na "/": como <link> fixo no index.html, a entrada direta numa página
// interna no desktop também baixava os ~45 KB da foto com prioridade alta. O item são os atributos do <link>.
const FOTO_ABERTURA = /^assets\/inicio-abertura-4x5-([0-9]+)-[\w-]+\.webp$/
function preloadDaFotoDaAbertura(bundle, base, erro) {
  const serie = Object.keys(bundle)
    .map((f) => ({ f, m: f.match(FOTO_ABERTURA) }))
    .filter((x) => x.m)
    .sort((a, b) => Number(a.m[1]) - Number(b.m[1]))
  if (!serie.length) erro('preload da foto da abertura: nenhum arquivo inicio-abertura-4x5-*.webp no pacote')
  const imagesrcset = serie.map((x) => `${base}${x.f} ${x.m[1]}w`).join(', ')
  return { rel: 'preload', as: 'image', type: 'image/webp', media: '(min-width: 1024px)', imagesrcset, imagesizes: HERO_FOTO_SIZES_DESKTOP, fetchpriority: 'high' }
}

// Pré-busca da rota de entrada. As views são lazy (router): numa carga direta em /#/qualidade o
// chunk da página só era pedido depois que o pacote principal baixava e rodava — uma volta de rede inteira (~0,25 s no
// perfil celular) com a rede parada antes do 1º quadro. Aqui o build grava, num bloco de dados JSON, rota → arquivos que
// a view puxa e que o index.html ainda não traz (chunk, dependências estáticas e CSS), e um script inline de código FIXO
// lê location.hash (ou o caminho sem # da Netlify) e injeta <link rel="modulepreload"> / <link rel="preload" as="style">
// enquanto o pacote principal ainda baixa. O __vitePreload do Vite acha o mesmo href e não pede de novo.
// O script entra na CSP por hash (netlify.toml); como os nomes com hash moram no JSON (bloco de dados não executa, a CSP
// não olha), o hash do código não muda de build para build. Mexeu em CODIGO_PRE? O guarda-csp abaixo acusa no build.
// A tabela rota → view sai do próprio router (padrão `{ path, name, component: v('Nome') }`); padrão quebrado = erro.
// O mesmo script também pré-busca a Poppins (400/500/600), em toda rota: sem isso ela só era pedida no 1º layout,
// chegava depois da 1ª pintura e o texto corrido trocava de fonte na frente da pessoa (CLS 0,20–0,26 em Política e
// Termos, ~0,012 nas outras, no perfil celular; com a pré-busca, 0). Na Home o sub da abertura ganhava uma linha
// quando a Poppins chegava e empurrava os botões 26 px (CLS 0,0201 a 390): ela entra também, junto com a foto da
// abertura. Cada item da lista é um arquivo (string: o tipo sai da extensão) ou os atributos de um <link> (objeto: o
// que precisa de mais que href, como a foto com media/imagesrcset).
const CODIGO_PRE = String.raw`(function(){try{var d=JSON.parse(document.getElementById("fc-pre").textContent),h=location.hash,p=h.charAt(1)=="/"?h.slice(1):location.pathname.replace(/\/index\.html$/,"");p=p.split(/[?#]/)[0].replace(/\/+$/,"")||"/";var l=d.r[p]||d.r["*"];if(!l)return;for(var i=0;i<l.length;i++){var e=document.createElement("link"),f=l[i];if(typeof f=="object"){for(var k in f)e.setAttribute(k,f[k])}else{if(/\.css$/.test(f)){e.rel="preload";e.as="style"}else if(/\.woff2$/.test(f)){e.rel="preload";e.as="font";e.type="font/woff2"}else e.rel="modulepreload";e.crossOrigin="";e.href=f}document.head.appendChild(e)}}catch(e){}})()`
const POPPINS = /poppins-latin-(400|500|600)-normal-[\w-]+\.woff2$/
const preloadRota = () => {
  let base = '/'
  return {
    name: 'preload-rota-de-entrada',
    apply: 'build',
    configResolved(c) {
      base = c.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle ?? {}
        const chunks = Object.values(bundle).filter((c) => c.type === 'chunk')
        const fecho = (c, vistos = new Set()) => {
          if (!vistos.has(c.fileName)) {
            vistos.add(c.fileName)
            for (const i of c.imports) if (bundle[i]) fecho(bundle[i], vistos)
          }
          return vistos
        }
        const css = (arquivos) => [...arquivos].flatMap((f) => [...(bundle[f].viteMetadata?.importedCss ?? [])])
        const noHtml = fecho(chunks.find((c) => c.isEntry)) // script de entrada + modulepreload que o Vite já põe
        const cssNoHtml = new Set(css(noHtml))
        const roteador = readFileSync(resolve(raiz, 'src/router/index.js'), 'utf8')
        const pares = [...roteador.matchAll(/path: '([^']+)', name: '[^']+', component: v\('(\w+)'\)/g)].map(([, p, n]) => [p.startsWith('/:') ? '*' : p, n])
        if (pares.length < 11 || !pares.some(([p]) => p === '*')) this.error(`preload-rota: o padrão das rotas em src/router/index.js mudou (achei ${pares.length}); atualizar a regex do vite.config`)
        const mapa = {}
        for (const [rota, nome] of pares) {
          const view = chunks.find((c) => c.facadeModuleId?.replace(/\\/g, '/').endsWith(`/src/views/${nome}View.vue`))
          if (!view) continue // a Home mora no pacote principal
          const js = [...fecho(view)].filter((f) => !noHtml.has(f))
          mapa[rota] = [...js, ...new Set(css(js).filter((f) => !cssNoHtml.has(f)))].map((f) => base + f)
        }
        if (!mapa['*']) this.error('preload-rota: chunk da NaoEncontradaView não encontrado')
        const fontes = Object.keys(bundle).filter((f) => POPPINS.test(f)).map((f) => base + f)
        if (fontes.length !== 3) this.error(`preload-rota: esperava os 3 woff2 da Poppins (400/500/600), achei ${fontes.length}`)
        for (const rota of Object.keys(mapa)) mapa[rota].push(...fontes)
        // a Home mora no pacote principal: só a Poppins e a foto da abertura (≥ 1024)
        mapa['/'] = [...fontes, preloadDaFotoDaAbertura(bundle, base, (m) => this.error(m))]
        // antes do <script type="module"> e, principalmente, antes do <link rel="stylesheet">: script inline depois de
        // folha de estilo pendente espera ela baixar para rodar. O <meta charset> continua nos primeiros 1024 bytes.
        const ancora = html.indexOf('<script type="module"')
        if (ancora < 0) this.error('preload-rota: <script type="module"> do pacote principal não encontrado no index.html')
        const blocos = `<script type="application/json" id="fc-pre">${JSON.stringify({ r: mapa }).replace(/</g, '\\u003c')}</script>\n    <script>${CODIGO_PRE}</script>\n    `
        return html.slice(0, ancora) + blocos + html.slice(ancora)
      },
    },
  }
}


// CSP por hash (netlify.toml): todo <script> executável e todo <style> inline do index.html final precisa estar na
// Content-Security-Policy do netlify.toml, senão o navegador bloqueia em produção sem ninguém ver no build. Confere o
// HTML que vai para o dist e para o build com o hash que falta. O <style> que o Vuetify injeta em tempo de execução
// (tema) não passa por aqui: conferir no navegador, com o dist servido com os cabeçalhos do netlify.toml
// (DESENVOLVIMENTO.md, "CSP por hash").
const guardaCsp = () => ({
  name: 'guarda-csp',
  apply: 'build',
  writeBundle(_, bundle) {
    const html = bundle['index.html']?.source
    const toml = resolve(raiz, 'netlify.toml')
    if (typeof html !== 'string' || !existsSync(toml)) return
    const csp = readFileSync(toml, 'utf8').match(/^\s*Content-Security-Policy\s*=\s*"([^"]+)"/m)?.[1]
    if (!csp) this.error('guarda-csp: netlify.toml sem Content-Security-Policy')
    const fontes = (d) => csp.split(';').map((x) => x.trim().split(/\s+/)).find(([nome]) => nome === d)?.slice(1) ?? []
    const hash = (t) => `'sha256-${createHash('sha256').update(t, 'utf8').digest('base64')}'`
    const faltam = []
    for (const [, attrs, corpo] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/\bsrc=/.test(attrs) || /type="application\/json"/.test(attrs)) continue
      if (!fontes('script-src').includes(hash(corpo))) faltam.push(`script-src ${hash(corpo)} (${corpo.slice(0, 40)}…)`)
    }
    for (const [, corpo] of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
      if (!fontes('style-src').includes(hash(corpo))) faltam.push(`style-src ${hash(corpo)} (${corpo.slice(0, 40)}…)`)
    }
    if (faltam.length) this.error(`CSP do netlify.toml desatualizada — o navegador bloquearia em produção. Trocar o hash antigo por:\n - ${faltam.join('\n - ')}`)
  },
})

const tokensDaPaleta = () => ({
  name: 'tokens-da-paleta',
  transformIndexHtml: (html) =>
    html
      .replace('</head>', `<style>:root{${Object.entries(PALETA).map(([k, v]) => `--fc-${k}:${v}`).join(';')}}</style></head>`)
      .replace('%COR_TEMA%', PALETA.marrom),
})

const textos = (pasta) =>
  readdirSync(pasta).flatMap((n) => {
    const p = join(pasta, n)
    if (statSync(p).isDirectory()) return textos(p)
    return /\.(html|js|css|json|svg|txt|map)$/i.test(n) ? [{ nome: relative(raiz, p).replace(/\\/g, '/'), conteudo: readFileSync(p, 'utf8') }] : []
  })

// Portão de produção: buildStart confere formato de WhatsApp e e-mail, vigência e docsRevisados; closeBundle varre o
// dist pela SENTINELA_RE (PREENCHER em maiúsculas exatas e todo marcador "[a preencher…" — o botão "Preencher o
// cadastro" do Seja produtor é texto legítimo). Lista branca: só `previa` e `teste` passam sem o portão; qualquer outro
// modo (production, producao, prod…) é produção.
const ISENTOS = ['previa', 'teste']
const guardaPendencias = () => {
  let modo = 'production'
  let saida = 'dist'
  return {
    name: 'guarda-pendencias',
    apply: 'build',
    configResolved(c) {
      modo = c.mode
      saida = resolve(c.root, c.build.outDir)
    },
    buildStart() {
      if (ISENTOS.includes(modo)) return
      const falta = listarPendencias(SITE)
      if (falta.length) this.error(mensagemPortao(falta))
    },
    closeBundle() {
      if (ISENTOS.includes(modo)) return
      const achados = acharSentinelas(textos(saida))
      if (achados.length) throw new Error(`Sentinela de pendência no dist de produção:\n - ${achados.join('\n - ')}`)
    },
  }
}

export default defineConfig({
  // raiz absoluta: o Netlify serve /index.html em qualquer caminho (/* 200) e base relativa pediria os assets em
  // /qualquer/assets/… (página em branco com 2 segmentos); o hash router não precisa de base relativa
  base: '/',
  plugins: [
    vue(),
    vuetify({ autoImport: true, styles: { configFile: 'src/styles/settings.scss' } }),
    tokensDaPaleta(),
    preloadFontes(),
    preloadRota(),
    guardaPendencias(),
    guardaCsp(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@logo': fileURLToPath(new URL('./assets/logo', import.meta.url)), // logo oficial: um só arquivo-fonte
    },
  },
  // autoImport do vite-plugin-vuetify reotimiza no 1º load sem isto ("new dependencies optimized" + reload).
  // O player do Lottie e a máscara entram já otimizados: são import dinâmico/tardio e não podem disparar reload.
  optimizeDeps: {
    exclude: ['vuetify'],
    include: ['vue', 'vue-router', 'lottie-web/build/player/lottie_light', 'maska/vue'],
  },
  server: { port: 5195, strictPort: true },
  preview: { strictPort: true },
  build: { assetsInlineLimit: 0 }, // nada de data: inesperado no CSS/JS (a CSP img-src fica previsível)
  test: { include: ['tests/unit/**/*.test.js'], environment: 'node' },
})
