// Os 4 passos do comércio, com a chave Lottie e a faixa do U de cada um. "Escolha do forno" e "Uma entrega, uma
// cobrança": linguagem do balcão, não de bastidor; o texto do passo 4 não repete o título.
export const PASSOS = [
  {
    numero: 1,
    titulo: 'Pedido recorrente',
    texto: 'Você combina o que precisa e com que frequência: pão todo dia, bolo às quartas. A gente anota e repete.',
    lottie: 'passo-1-pedido',
    faixa: 'creme',
  },
  {
    numero: 2,
    titulo: 'Escolha do forno',
    texto: 'A gente manda cada item pro forno certo\u00a0— o nosso ou o de um produtor parceiro\u00a0—, conforme o produto, a capacidade e a região.',
    lottie: 'passo-2-atribuicao',
    faixa: 'marrom',
  },
  {
    numero: 3,
    titulo: 'Fornada',
    texto: 'Assado e conferido no padrão de qualidade da rede antes de sair pra rota.',
    lottie: 'passo-3-fornada',
    faixa: 'marrom',
  },
  {
    numero: 4,
    titulo: 'Uma entrega, uma cobrança',
    texto: 'Tudo chega na mesma rota, venha de quantos fornos vier. A gente acerta com cada produtor; você não precisa correr atrás de vários fornecedores.',
    lottie: 'passo-4-entrega',
    faixa: 'creme',
  },
]

/** Cabeçalho do U. */
export const CABECALHO_PASSOS = {
  rotulo: 'Como funciona',
  titulo: 'Do pedido ao balcão, em quatro passos',
  sub: 'Você combina uma vez. O resto é com a gente: escolher o forno, conferir a fornada e montar a rota.',
  faixaComercio: 'No seu comércio',
  faixaRede: 'Na rede Fornada Conecta',
}
