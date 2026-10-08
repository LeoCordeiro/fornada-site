// Dados da empresa e contatos. Nunca inventar contato: contato pendente fica com a sentinela no próprio campo e é
// detectado por formato (pendencias-build.js). O build de produção falha enquanto houver pendência; a prévia para
// aprovação é `npm run build:previa` (--mode previa).
import { emailValido, listarPendencias, whatsappValido } from './pendencias-build.js'

// O vite.config importa este arquivo em node (sem import.meta.env). O `typeof` protege o node SEM impedir o Vite de
// dobrar as expressões no build — medido: com `import.meta.env?.MODE` ou `const env = import.meta.env ?? {}` o
// "[a preencher]" e os avisos da prévia sobreviviam no dist de produção; com esta forma, somem.
const temEnv = typeof import.meta.env !== 'undefined'

export const SITE = {
  marca: 'Fornada Conecta',
  // Razão social pública do CNPJ, completa.
  razaoSocial: '68.998.077 Izaquiel Jose Caitano de Araujo',
  cnpj: '68.998.077/0001-36',
  bairro: 'Parque Uirapuru',
  cidade: 'Guarulhos',
  uf: 'SP',
  // WhatsApp da empresa (55 + DDD + número, só dígitos) . Na tela: "(11) 92203-7628".
  // Modo `teste`: número com DDD 00 do .env.teste — ninguém real recebe. Nenhum teste automático usa o número real:
  // atalho e formulário só abrem conversa no clique da pessoa.
  whatsapp: temEnv && import.meta.env.MODE === 'teste' ? import.meta.env.VITE_WHATSAPP_TESTE : '5511922037628',
  email: 'contato@fornadaconecta.com.br',
  // Perfis públicos (links externos: rodapé e painel de canais do Contato)
  instagram: 'https://www.instagram.com/fornada_conecta/',
  instagramUsuario: '@fornada_conecta',
  reclameAqui: 'https://www.reclameaqui.com.br/empresa/fornadaconecta/',
  // Data da versão da Política, dos Termos e da Política de repasse (AAAA-MM-DD) — os textos dizem "a partir da
  // publicação neste site · Última atualização: 8 de outubro de 2026". Vazio = pendente.
  vigenciaDocs: '2026-10-08',
  // true depois da revisão jurídica dos textos legais: some a faixa "Minuta" e o portão libera.
  docsRevisados: true,
  // true só depois de conferir na URL publicada que não há cookie nem rastreador: libera "Sem cookies e sem
  // rastreadores" no rodapé.
  medicaoPrivacidadeOk: false,
}

// Conteúdo que a empresa já confirmou.
// exemplosProduto: false → em PRODUÇÃO cada categoria mostra só o nome e a descrição, sem a linha de exemplos; na
// prévia os exemplos continuam, com o selo "Exemplos a confirmar". Trocar para true quando a lista de produtos
// estiver confirmada.
export const CONFIRMADO = { exemplosProduto: false }

/** Espaço de foto (FotoReal): na prévia sempre (o rótulo "Foto real da Fornada — …" é o briefing da foto); em
 *  PRODUÇÃO só com a foto de verdade — sem `src` o espaço não existe e quem o reservava fecha o layout (um espaço
 *  vazio lia como imagem que não carregou). */
export const mostraFoto = (src) => Boolean(src) || mostrarPendencias

export const whatsappPendente = !whatsappValido(SITE.whatsapp)
export const emailPendente = !emailValido(SITE.email)

/** Dev, prévia e teste mostram pendência (faixa, aviso, "[a preencher]"). Produção dobra tudo isso para fora. */
export const mostrarPendencias = temEnv && (import.meta.env.DEV || import.meta.env.MODE === 'previa' || import.meta.env.MODE === 'teste')

/** Texto que ocupa o lugar de um contato pendente. Vazio em produção (o literal não chega no dist). */
export const TEXTO_PENDENTE = mostrarPendencias ? '[a preencher]' : ''

/** Só em dev: lista no console o que falta do cliente (main.js chama sob import.meta.env.DEV). */
export function verificarPendencias() {
  const falta = listarPendencias(SITE)
  if (falta.length) console.info(`[Fornada Conecta] ${falta.length} pendência(s) do cliente — produção bloqueada:\n - ${falta.join('\n - ')}`)
  return falta
}
