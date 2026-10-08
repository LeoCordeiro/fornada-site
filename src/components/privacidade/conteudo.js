// Textos de interface da Política de privacidade. O texto da política mora em texto.js. H1 em caixa de frase e sem o
// nome da marca.
import { ATALHOS } from '@/data/atalhosWhatsapp'

export const PRIVACIDADE = {
  rotulo: 'Privacidade',
  titulo: 'Política de privacidade',
  // fim da página: botão contorno com a mensagem pronta de WhatsApp + link
  dados: { rotulo: 'Falar sobre seus dados', whatsapp: ATALHOS.dados() },
  inicio: { rotulo: 'Voltar ao início', to: '/' },
}
