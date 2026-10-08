// Navegação global: cabeçalho, gaveta e rodapé.

/** Cabeçalho ≥ 1280: os 5 links; as páginas de conversão viram os 2 botões. */
export const NAV_PRINCIPAL = [
  { rotulo: 'Produtos', to: '/produtos' },
  { rotulo: 'Como funciona', to: '/como-funciona' },
  { rotulo: 'Qualidade', to: '/qualidade' },
  { rotulo: 'Sobre', to: '/sobre' },
  { rotulo: 'Contato', to: '/contato' },
]

/** Os 2 CTAs de conversão (cabeçalho, gaveta, hero, chamada final). */
export const CTA_COMERCIO = { rotulo: 'Quero receber fornada', to: '/para-comercios' }
export const CTA_PRODUTOR = { rotulo: 'Sou produtor, quero entrar na rede', to: '/seja-produtor' }
export const CTA_PRODUTOR_CURTO = { rotulo: 'Seja produtor', to: '/seja-produtor' } // cabeçalho ≥ 1280

/** Gaveta, em ordem de funil, com "Início". */
export const NAV_GAVETA = [
  { rotulo: 'Início', to: '/' },
  { rotulo: 'Para comércios', to: '/para-comercios' },
  { rotulo: 'Seja produtor parceiro', to: '/seja-produtor' },
  { rotulo: 'Produtos', to: '/produtos' },
  { rotulo: 'Como funciona', to: '/como-funciona' },
  { rotulo: 'Qualidade e segurança alimentar', to: '/qualidade' },
  { rotulo: 'Sobre', to: '/sobre' },
  { rotulo: 'Contato', to: '/contato' },
]

/** Rodapé: navegação. */
export const NAV_RODAPE = [
  { rotulo: 'Para comércios', to: '/para-comercios' },
  { rotulo: 'Seja produtor parceiro', to: '/seja-produtor' },
  { rotulo: 'Produtos', to: '/produtos' },
  { rotulo: 'Como funciona', to: '/como-funciona' },
  { rotulo: 'Qualidade e segurança alimentar', to: '/qualidade' },
  { rotulo: 'Sobre', to: '/sobre' },
  { rotulo: 'Contato', to: '/contato' },
]

export const NAV_LEGAL = [
  { rotulo: 'Política de privacidade', to: '/privacidade' },
  { rotulo: 'Termos de uso', to: '/termos' },
  { rotulo: 'Política de repasse', to: '/repasse' },
]
