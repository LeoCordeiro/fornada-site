// Página não encontrada (404). A mensagem de WhatsApp leva o nome da página.
import { ATALHOS } from '@/data/atalhosWhatsapp'

export const NAO_ENCONTRADA = {
  rotulo: 'Erro 404',
  titulo: 'Essa página não saiu do forno.',
  texto: 'O endereço pode ter mudado ou ter sido digitado diferente. Volta pro começo ou fala direto com a gente.',
  // "Voltar ao início" no site inteiro: fim da Política e dos Termos, sucesso dos formulários e aqui
  inicio: { rotulo: 'Voltar ao início', to: '/' },
  whatsapp: { rotulo: 'Falar no WhatsApp', mensagem: ATALHOS.falar('Página não encontrada') },
  links: [
    { rotulo: 'Para comércios', to: '/para-comercios' },
    { rotulo: 'Seja produtor parceiro', to: '/seja-produtor' },
    { rotulo: 'Produtos', to: '/produtos' },
  ],
}
