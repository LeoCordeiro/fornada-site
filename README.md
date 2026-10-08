# Fornada Conecta

Site institucional da Fornada Conecta, central de abastecimento de panificação para o comércio de Guarulhos/SP.

Site estático em Vue 3 + Vuetify + Vite, sem servidor nem banco de dados: os formulários montam a mensagem e abrem o
WhatsApp da empresa. Nada fica guardado no navegador.

## Rodar

Node 24.

```bash
npm ci
npm run dev            # http://localhost:5195
npm run test           # testes de unidade
npm run build          # build de produção em dist/
```

`npm run build:previa` gera a prévia para aprovação (faixa "Prévia" e pendências à vista).

## Publicar na Netlify

Conectar este repositório na Netlify (Add new site → Import an existing project). O `netlify.toml` já define o comando
de build, a pasta publicada (`dist`), a versão do Node, o redirecionamento das rotas e os cabeçalhos de segurança: não
há nada a configurar no painel.

- Deploy de produção: `npm run build`. O build falha de propósito se faltar dado obrigatório da empresa (WhatsApp,
  e-mail, vigência dos textos legais) ou se sobrar marcador `[a preencher]` no texto.
- Deploy de branch e deploy preview de pull request: `npm run build:previa`.

## Onde mudar

| O quê | Onde |
|---|---|
| Contatos e dados da empresa | `src/config/site.js` |
| Fotos | `src/data/fotos.js` (arquivos em `src/assets/fotos/`) |
| Textos das páginas | `src/components/<pagina>/conteudo.js` |
| Textos legais | `src/components/privacidade/texto.js`, `termos/texto.js` e `repasse/texto.js` |

Estrutura, modos de build, portão de publicação, animações e CSP: [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md).
