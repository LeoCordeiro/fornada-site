// Textos da Início. Só a Home usa. A seção 2 lê QUALIDADE_HOME (data/garantias, sem mudança); os títulos dos passos vêm de data/passos;
// os nomes das categorias, de data/categorias. As fotos moram em data/fotos.

/** Abertura. O H1 em 3 linhas (no desktop cada uma é bloco; no celular elas correm juntas). */
export const HERO = {
  // "Central de abastecimento · Guarulhos" — a cidade separada para descer de linha sem deixar o "·" solto
  rotulo: 'Central de abastecimento',
  cidade: 'Guarulhos',
  titulo: { linha1: 'Pão fresco no seu', linha2: 'balcão', leve: 'todo dia', virgula: ',', linha3: 'na hora combinada.' },
  // "— e tudo chega numa entrega só, com uma cobrança só" ficou para o passo 4 do Como funciona
  sub: 'Pão, bolo, salgado assado e massa fresca com entrega recorrente para o comércio de Guarulhos e região. Uma parte sai do nosso forno, a outra de produtores parceiros com regularização sanitária.',
}

/** Largura da foto da abertura ≥ 1024 (da coluna 9 até a borda): W/2 − 205,3 a partir de 1200 e (W − 16)/3
 *  abaixo. Um só texto para o <source> (HeroFoto) e o preload do index.html (vite.config): se divergirem, o
 *  navegador baixa a foto duas vezes. */
export const HERO_FOTO_SIZES_DESKTOP = '(min-width: 1200px) calc(50vw - 205px), calc(33.3vw - 5px)'

/** Como funciona: o sub cortado e uma frase por passo (o resto do texto de cada passo mora na página). */
export const COMO = {
  titulo: { l1: 'Do pedido ao balcão,', l2: 'em quatro passos' }, // quebra fixa depois de "balcão," no desktop
  sub: 'Você combina uma vez. O resto é com a gente.',
  frases: [
    'Pão todo dia, bolo às quartas.',
    'O nosso ou o de um produtor parceiro, conforme o produto e a região.',
    'Assado e conferido no padrão de qualidade da rede.',
    'Tudo na mesma rota, venha de quantos fornos vier.',
  ],
  link: { rotulo: 'Ver o passo a passo', to: { path: '/como-funciona', hash: '#trilha-comercio' } },
}

/** Produtos: categorias em texto (foto de banco nunca representa o produto). */
export const PRODUTOS = {
  titulo: 'O que sai das fornadas da rede',
  todos: { rotulo: 'Ver todos os produtos', to: '/produtos' },
  // o trecho do meio é o link (WhatsApp, ATALHOS.orcamento('todas'))
  orcamento: { antes: 'Sem tabela de preço por aqui: ', link: 'pede um orçamento no WhatsApp', depois: '.' },
}

/** As duas pontas (o problema, para quem é e a chamada final numa seção). */
export const PONTAS = {
  titulo: 'De um lado, balcão esperando pão. Do outro, forno parado.',
  sub: 'A Fornada Conecta liga as duas pontas: pedido recorrente de um lado, forno com capacidade do outro, e uma rota no meio.',
  comercio: {
    rotulo: 'Para o seu comércio',
    texto: 'Se o pão, o bolo ou o salgado precisa estar no balcão todo dia, do mesmo jeito, é pra você.',
  },
  produtor: {
    rotulo: 'Para quem tem forno',
    texto: 'Com forno, capacidade sobrando e regularização sanitária própria. Você assa; a gente cuida do cliente, da rota e da cobrança.',
  },
}
