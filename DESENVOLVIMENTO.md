# Desenvolvimento

Guia técnico do site da Fornada Conecta: como rodar, como gerar cada tipo de build e onde mudar cada coisa.

## Stack

- **Vue 3** + **Vuetify 3.13.6** (versão exata: o hash do tema na CSP depende dela) + **vue-router 4** com hash history.
- **Vite 6** no build; **Vitest** nos testes de unidade (ambiente node).
- **lottie-web** (player light) para as animações, geradas por script.
- **maska** para a máscara dos campos de CNPJ e telefone.
- Fontes auto-hospedadas: **Fraunces** (variável) e **Poppins**, via `@fontsource`; subconjuntos da Fraunces em
  `src/assets/fonts/` (licença em `src/assets/fonts/OFL.txt`).
- **Node 24** (o mesmo que a Netlify usa, definido no `netlify.toml`).

O site é estático: não tem servidor, banco nem API. Os formulários montam uma mensagem e abrem o WhatsApp da empresa
no clique da pessoa.

## Estrutura

```
assets/logo/                 logo oficial em SVG e PNG (alias @logo)
public/                      favicon, ícones e site.webmanifest
scripts/
  lottie-build.mjs           gera as animações e o manifest
  lottie-check.mjs           confere as animações
src/
  main.js, App.vue
  router/index.js            rotas e título de cada página
  views/                     uma view por página (<Nome>View.vue)
  components/<pagina>/       seções e textos de cada página (conteudo.js; texto.js nas páginas legais)
  components/layout/         cabeçalho, rodapé, menu, botão fixo do WhatsApp, tela de carregamento
  components/secoes/         seções reaproveitadas entre páginas
  components/marca/          logo, botões, foto, animação, selo, ícones da marca
  components/form/           formulários de pedido e de produtor
  composables/               lógica compartilhada dos componentes
  config/site.js             dados da empresa, contatos e interruptores de conteúdo
  config/pendencias-build.js portão de publicação
  data/                      textos e dados compartilhados (fotos, categorias, formulários, navegação…)
  lib/                       funções puras (CNPJ, telefone, WhatsApp, rota, movimento, Lottie)
  plugins/vuetify.js         tema e padrões dos componentes do Vuetify
  styles/                    paleta, tokens, tipografia, movimento e ajustes do Vuetify
  assets/                    fontes, fotos e animações
tests/unit/                  testes de unidade
netlify.toml                 build, publicação e cabeçalhos de segurança
vite.config.js               build: pré-carregamento, portão de publicação e conferência da CSP
```

## Rodar

```bash
npm ci                 # dependências exatas do package-lock
npm run dev            # http://localhost:5195
npm run test           # testes de unidade
npm run lottie:check   # confere as animações
```

Em `npm run dev` o site mostra as pendências como na prévia e lista no console o que falta para publicar.

## Modos de build

| Comando | Uso | O que muda |
|---|---|---|
| `npm run build` | produção | Roda o `lottie:check` e passa pelo portão de publicação. Saída em `dist/`. |
| `npm run build:previa` | prévia para aprovação | Faixa "Prévia" no topo, lista do que falta e marcadores `[a preencher]` à vista. Sem portão. |
| `npm run build:teste` | testar o envio dos formulários | Número fictício do `.env.teste` (DDD 00): o WhatsApp não chega em ninguém. Pendências à vista, sem portão. |

Na Netlify, o deploy de produção usa `npm run build`; deploy de branch e deploy preview de pull request usam
`npm run build:previa` (definido no `netlify.toml`).

A prévia usa o número real da empresa: botão de WhatsApp clicado na prévia abre conversa de verdade. Para testar o
envio, use `npm run build:teste`.

`npm run preview` serve o `dist/` localmente, sem os cabeçalhos do `netlify.toml`.

## Portão de publicação

`src/config/pendencias-build.js`, ligado ao build pelo `vite.config.js`. Só os modos `previa` e `teste` passam sem ele;
qualquer outro modo é tratado como produção.

1. **Antes do build**, confere em `src/config/site.js`, pelo formato:
   - `whatsapp`: `55` + DDD + número, só dígitos (ex.: `5511912345678`);
   - `email`: `nome@dominio.tld`;
   - `vigenciaDocs`: data `AAAA-MM-DD` que existe no calendário;
   - `docsRevisados`: `true` literal (textos legais revisados; tira a faixa "Minuta" das páginas legais).
2. **Depois do build**, varre o `dist/` (html, js, css, json, svg, txt, map) atrás de `PREENCHER` em maiúsculas e de
   qualquer marcador `[a preencher…`.

Faltou algo, o build falha e diz o campo, ou o arquivo e o trecho onde o marcador apareceu. Contato que ainda não
existe fica com a sentinela no próprio campo (`'55PREENCHER'`, `'PREENCHER'`), nunca com um valor inventado.

Dois interruptores em `src/config/site.js` não travam o build, mas mudam o que vai ao ar:

- `CONFIRMADO.exemplosProduto`: com `false`, a produção mostra cada categoria de produto só com a frase, sem a lista de
  exemplos.
- `SITE.medicaoPrivacidadeOk`: `true` só depois de conferir, na URL publicada, que o site não grava cookie nem carrega
  rastreador. Libera a frase "Sem cookies e sem rastreadores" no rodapé.

## Onde mudar

### Contatos e dados da empresa

`src/config/site.js`: razão social, CNPJ, bairro e cidade, WhatsApp, e-mail, Instagram, Reclame Aqui e a data de
vigência dos textos legais. Nenhum componente escreve número ou link de WhatsApp: tudo sai do `SITE` por
`src/lib/whatsapp.js`. O endereço completo não vai ao site, só bairro e cidade.

### Fotos

`src/data/fotos.js` é o mapa único: cada espaço de foto do site (`FotoReal`) lê dali pela chave. Trocar uma foto é
trocar os arquivos e a entrada no mapa; nenhuma página muda.

- Arquivos em `src/assets/fotos/`, em série: `{nome}-{proporção}-{largura}.webp` e `.jpg`, as mesmas larguras nos dois
  formatos (ex.: `inicio-abertura-4x5-480`, `-800`, `-1003`). A proporção no nome (`4x3`, `4x5`) define a altura
  reservada antes de a imagem baixar.
- Na entrada do mapa: `alt` (vazio em foto decorativa), `legenda`, `descricao` (o que a foto deve mostrar; aparece no
  espaço vazio da prévia) e `imagens: { base: serie('…'), desktop: serie('…') }`.
- Entrada sem `imagens`: na prévia aparece o espaço marcado com a descrição; em produção o espaço não existe.
- Foto de banco de imagens nunca representa o produto que o cliente recebe: só abertura, ambiente e processo.

### Textos

Todo texto visível mora em arquivo de conteúdo, nunca solto em componente.

| O quê | Onde |
|---|---|
| Texto de cada página | `src/components/<pagina>/conteudo.js` (home, comercios, produtos, como-funciona, produtor, qualidade, sobre, contato, nao-encontrada, privacidade, termos, repasse) e `src/components/como-funciona/faq.js` |
| Compartilhados | `src/data/`: categorias, formulários (rótulos, ajudas, erros), garantias, passos, navegação, atalhos de WhatsApp, tipos de comércio |
| Título de cada página | `src/router/index.js` |
| Modelo da mensagem do WhatsApp | `src/lib/whatsapp.js` |

Escrita: caixa de frase (nunca "Title Case"); rótulo em caixa de frase, o CSS põe em maiúsculas quando precisa;
travessão com espaço fixo antes (`'texto — resto'`), para não abrir a linha seguinte.

Os rótulos, opções e botões dos formulários e o modelo das mensagens estão escritos também nos testes
(`tests/unit/formularios.test.js` e `tests/unit/whatsapp.test.js`): mudou o texto, muda o teste.

### Textos legais

`src/components/privacidade/texto.js`, `src/components/termos/texto.js` e `src/components/repasse/texto.js` guardam o
texto integral em markdown restrito, lido por `src/components/privacidade/legal.js`: seção `## n. Título`, parágrafo,
`**negrito**`, link `[texto](https://…)`, lista (`- ` e `1. `) e tabela (`| a | b |`). Fora desse subconjunto, o leitor
lança erro.

Mudou o texto: atualizar a linha "Última atualização" no próprio texto e `SITE.vigenciaDocs` juntos. Marcador
`[a preencher…]` que sobrar barra a produção.

### Animações (Lottie)

- Todas passam por `src/components/marca/BrandLottie.vue`, que lê `src/assets/lottie/manifest.json`.
- Os JSON e o manifest são gerados por `scripts/lottie-build.mjs` (determinístico): `npm run lottie:build`. Não
  editar os JSON à mão.
- `npm run lottie:check` (roda antes de todo build) reprova cor fora da paleta, arquivo acima de 25 KB ou total acima de
  150 KB, expressão, imagem, texto, gradiente, efeito, taxa diferente de 30 fps, curva fora das da marca e manifest
  desatualizado.
- Origem e licença: `src/assets/lottie/LICENSES.md`.

## CSP por hash

A Content-Security-Policy do `netlify.toml` não tem `'unsafe-inline'`: cada `<script>` e cada `<style>` inline precisa
do seu hash.

- `script-src`: o script de pré-busca da rota (`CODIGO_PRE` no `vite.config.js`).
- `style-src`, nesta ordem: o `<style>` da paleta (`tokensDaPaleta` no `vite.config.js`), o `<style>` do tema que o
  Vuetify injeta e o hash do texto vazio (o Vuetify cria esse `<style>` vazio antes de pôr o tema).

**Inline do `index.html`** (pré-busca e paleta): o build confere sozinho (plugin `guarda-csp`). Se mudar, `npm run build`
falha com "CSP do netlify.toml desatualizada" e mostra o hash novo; trocar o antigo por ele no `netlify.toml`.

**Tema do Vuetify**: é injetado em tempo de execução, o build não vê. Mudou o tema (`src/plugins/vuetify.js`), a
paleta (`src/styles/paleta.js`) ou a versão do Vuetify, conferir:

1. `npm run build` e `npm run preview`;
2. abrir o site e rodar no console do navegador:

   ```js
   const t = document.getElementById('vuetify-theme-stylesheet').textContent
   const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t))
   console.log(`'sha256-${btoa(String.fromCharCode(...new Uint8Array(d)))}'`)
   ```

3. se o valor não estiver no `style-src` do `netlify.toml`, trocar o hash antigo do tema por ele.

No ar, hash errado aparece no console como `Refused to apply inline style … 'sha256-…'`. Ao atualizar o Vuetify, fixar
a versão exata no `package.json` (sem `^`) e refazer esta conferência.

## Convenções

- **Nenhum host externo.** Fontes, imagens e scripts saem do próprio site; a CSP bloqueia o resto. Instagram, Reclame
  Aqui e WhatsApp são só links de navegação.
- **Nada guardado no navegador.** Sem cookie, `localStorage`, `sessionStorage` ou IndexedDB; sem analytics nem pixel. Os
  formulários não enviam nada para servidor.
- **Cor só da paleta.** `src/styles/paleta.js` é a única fonte de hex: vira as variáveis `--fc-*` do `:root`, o tema do
  Vuetify e o `theme-color`. Componente usa `var(--fc-*)`, nunca hex solto.
- **Contraste.** Texto com contraste mínimo de 4,5:1 sobre o fundo em que está (3:1 para texto grande, ícone e borda de
  campo). Combinação nova de cor é medida antes de entrar.
- **Acessibilidade.** Todo campo com `<label>`; erro ligado ao campo (`aria-invalid` e `aria-describedby`); foco visível
  em todo elemento interativo; link "Pular para o conteúdo"; título por página; `alt` descritivo em foto de conteúdo e
  vazio em foto decorativa; `prefers-reduced-motion` respeitado no CSS e no JS (`reduzirAgora()` em `src/lib/motion.js`).
- **Movimento.** Durações e curvas vêm dos tokens de `src/styles/movimento.css`, espelhados em `src/lib/motion.js` (o
  teste `tests/unit/motion.test.js` confere que os números são os mesmos e que nenhuma transição usa as curvas
  genéricas do CSS). Anima-se `opacity`, `transform` e cor; a única altura animada é a abertura das perguntas frequentes.
- **Imagens.** WebP com JPEG de reserva, `width` e `height` no `<img>` para reservar o espaço.
