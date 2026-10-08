// Página Sobre. Nada de história inventada: o que depende da empresa só entra quando ela confirmar.
import { mostrarPendencias } from '@/config/site'

/** Abertura [creme] → costura → [marrom]. H1: o 2º período em display-leve (1× por página). */
export const ABERTURA = {
  rotulo: 'Sobre a Fornada Conecta',
  titulo: { forte: 'Fornada é o produto.', leve: 'Conecta é o que a gente faz.' },
  sub: 'A Fornada Conecta é uma central de abastecimento de panificação para o comércio de Guarulhos e região. Parte da produção sai do nosso forno; o resto, de produtores parceiros selecionados. A gente junta tudo numa rota, numa entrega e numa cobrança.',
}

/** De onde a gente fala [creme]. */
export const ORIGEM = {
  // o lugar aparece uma vez, no título (estava no rótulo, no título e na 1ª frase); o rótulo é o do Contato
  rotulo: 'Onde a gente fica',
  // espaço fixo no nome do bairro: "Parque Uirapuru" não se parte no fim da linha
  titulo: 'Do Parque\u00a0Uirapuru para os balcões de Guarulhos',
  texto: 'É daqui que a gente organiza a rede: recebe os pedidos, manda cada item pro forno certo e monta a rota para chegar no horário combinado.',
  // a foto mora no mapa único: src/data/fotos.js → 'sobre-forno'. Sem ela, em produção a seção fica só com o texto
}

/** A proposta [marrom] — o ícone oficial invertido com pontos-conecta mora aqui. */
export const PROPOSTA = {
  rotulo: 'A proposta',
  titulo: 'Duas pontas que precisavam se encontrar',
  texto: 'Quem tem comércio precisa de constância: pão no balcão todo dia, na hora, do mesmo jeito. Quem tem forno e mão boa muitas vezes tem capacidade sobrando, mas não tem cliente fixo nem como entregar. A Fornada Conecta fica no meio: produz uma parte, coordena a rede, monta a rota e cuida do padrão.',
  principios: [
    { titulo: 'Constância antes de volume', texto: 'Melhor assumir menos e entregar sempre.' },
    { titulo: 'Regularização sanitária antes de tudo', texto: 'Sem ela, nenhum forno entra na rede.' },
    { titulo: 'Uma conversa, uma entrega, uma cobrança', texto: 'O comércio fala com a gente; a gente resolve com a rede.' },
  ],
}

/** Quem está por trás [creme]. */
export const QUEM = {
  // Título que a FICHA responde sozinha: em produção a seção mostra só a ficha da marca. Quando o responsável quiser
  // ser apresentado, o título pode virar o nome dele.
  rotulo: 'Quem está por trás',
  titulo: 'A empresa que organiza a rede',
  // esta frase vai SÓ na prévia; o build de produção a deixa de fora
  texto: mostrarPendencias ? 'A Fornada Conecta é a empresa de Izaquiel Jose Caitano de Araujo.' : '',
  // só na prévia: o que falta para esta seção; em produção some
  pendente: mostrarPendencias
    ? '[a preencher: apresentação do responsável\u00a0— nome, trajetória com panificação, papel no forno e na rede e\u00a0foto]'
    : '',
  // foto do responsável: só com a autorização dele (sem ela, nem o espaço marcado aparece)
}

/** Chamada final [marrom]: só o título; os 2 botões são os padrões do CtaFinal. */
export const FIM = { titulo: 'Vamos combinar a sua fornada?' }
