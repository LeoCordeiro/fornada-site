// Página Contato. O contato da empresa NUNCA é digitado aqui: WhatsApp e e-mail vêm de src/config/site.js (sentinela
// enquanto pendente); o endereço completo fica fora do site de propósito — só bairro e cidade.
import { ATALHOS } from '@/data/atalhosWhatsapp'
import { SITE } from '@/config/site'

/** Abertura [creme] — 1ª tela partida com os canais. */
export const ABERTURA = {
  rotulo: 'Contato',
  titulo: { forte: 'Fala com a gente', leve: 'pelo WhatsApp', fim: '.' },
  sub: 'Pedido, parceria ou dúvida: o WhatsApp é o caminho mais direto.',
  // 2º período só quando o e-mail existir (enquanto pendente, a linha do e-mail some e a frase prometeria um canal que
  // não está na tela). Produção exige e-mail: no ar, a frase vai sempre inteira.
  subEmail: 'Se preferir, manda um e-mail.',
}

/** Canais [marrom] — linhas com fio, sem cartões. Sem endereço de rua e sem mapa (host de terceiro). */
export const CANAIS = {
  whatsapp: {
    rotulo: 'WhatsApp',
    botao: 'Falar no WhatsApp',
    mensagem: ATALHOS.falar('Contato'),
    // sem legenda de atendimento: ela só entra com dias e horário — sozinha, a palavra não informa nada
  },
  email: { rotulo: 'E-mail', link: 'Escrever um e-mail' },
  // Instagram e Reclame Aqui: endereços em SITE; os dois abrem em nova aba.
  instagram: { rotulo: 'Instagram', link: 'Ver o Instagram' },
  reclameAqui: { rotulo: 'Reclame Aqui', link: 'Ver a página no Reclame Aqui' },
  local: {
    rotulo: 'Onde a gente fica',
    valor: `${SITE.bairro}, ${SITE.cidade}/${SITE.uf}`,
    legenda: 'O atendimento é por pedido combinado.',
  },
  area: {
    rotulo: 'Área de entrega',
    valor: 'Guarulhos e região',
    legenda: 'Manda o seu bairro que a gente confirma se a rota chega.',
  },
}

/** Atalhos [creme] — os dois formulários; botões e destinos = data/navegacao (CTA_COMERCIO, CTA_PRODUTOR). */
export const ATALHOS_CONTATO = {
  titulo: 'Prefere mandar tudo de uma vez?',
  comercio: { titulo: 'Tem comércio?', texto: 'Conta o que o seu balcão precisa.' },
  produtor: { titulo: 'Tem forno?', texto: 'Manda o seu cadastro.' },
}
