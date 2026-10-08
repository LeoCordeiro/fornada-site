// Perguntas frequentes de Como funciona. Resposta: parágrafos separados por linha em branco; onde o texto cita outra
// página, `paragrafos` com a parte do link (SecaoFaq): o texto visível não muda.

export const FAQ = [
  {
    pergunta: 'Quem pode comprar da Fornada Conecta?',
    resposta:
      'Comércio que vende ou serve panificação no dia a dia: lanchonetes, cafeterias, mercadinhos, escolas, empresas com copa ou refeitório e eventos pequenos. Se o seu negócio é de outro tipo, pergunta\u00a0— se a rota chega e a rede faz o produto, a gente conversa.',
  },
  {
    pergunta: 'Quem pode ser produtor parceiro?',
    paragrafos: [
      [
        'Padarias artesanais, confeiteiras e fabricantes de salgados e massas de pequena escala, com forno, capacidade sobrando e regularização sanitária própria. Sem a regularização, não tem entrada\u00a0— é requisito, não detalhe. Os requisitos completos estão em ',
        { rotulo: 'Seja produtor parceiro', to: { path: '/seja-produtor', hash: '#requisitos' } },
        '.',
      ],
    ],
  },
  {
    pergunta: 'Tem frequência mínima ou pedido mínimo?',
    resposta:
      'Você escolhe a frequência: todo dia, alguns dias da semana, uma vez por semana ou de vez em quando. Mínimo de frequência ou de quantidade, quando houver, a gente combina no primeiro contato\u00a0— depende do produto e de onde fica o seu comércio.',
  },
  {
    pergunta: 'Até onde vocês entregam?',
    resposta:
      'Guarulhos e região. A rota é montada bairro a bairro, então o jeito mais rápido de saber é mandar o seu bairro no pedido: a gente confirma se a rota chega até você e em que horário.',
  },
  {
    pergunta: 'Como é cobrado?',
    resposta:
      'Uma cobrança só, mesmo que o pedido venha de mais de um forno\u00a0— a gente acerta com cada produtor. Valores, forma de pagamento e prazo são combinados no primeiro contato, conforme o que, o quanto e com que frequência você pede. Pedido pequeno pode ter taxa de entrega; se tiver, você sabe antes de fechar. Para quem compra sempre, existe a assinatura de fornada, sob consulta.',
  },
  {
    pergunta: 'Como funciona a rede de produtores?',
    resposta:
      'Parte do que a gente entrega sai do nosso forno. O resto vem de produtores parceiros selecionados\u00a0— padarias artesanais, confeiteiras e fabricantes de salgados e massas\u00a0—, todos com regularização sanitária própria. Para cada item, a gente escolhe o forno conforme o produto, a capacidade e a região, e tudo segue o mesmo padrão até o seu balcão.',
  },
  {
    pergunta: 'Dá pra mudar o pedido depois de combinado?',
    resposta: 'Dá. Com quanta antecedência, a gente combina no primeiro contato, porque depende de quando a fornada começa.',
  },
  {
    pergunta: 'E se vier alguma coisa fora do padrão?',
    // como na seção 5 dos termos de uso: a Fornada identifica o lote, apura com o produtor e combina troca, reposição ou
    // desconto caso a caso
    paragrafos: [
      [
        'Avisa pelo WhatsApp, de preferência com foto do produto e da etiqueta do lote. Como todo lote é identificado, a gente sabe de qual forno ele veio e apura a causa com quem produziu. Troca, reposição ou desconto são combinados caso a caso. O passo a passo está em ',
        { rotulo: 'Qualidade e segurança alimentar', to: '/qualidade' },
        '.',
      ],
    ],
  },
]
