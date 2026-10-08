// Textos de Qualidade e segurança alimentar. Sub, itens e nota do posto são os da Home (src/data/garantias.js).
// Nenhuma frase promete mais do que a conferência faz: a seção 5 dos termos de uso (src/components/termos/texto.js)
// descreve a mesma conferência, e os dois textos mudam juntos.

/** Abertura (todo 1º bloco é creme; o posto partido vem logo abaixo, rotulado por este H1). */
export const ABERTURA = {
  rotulo: 'Qualidade e segurança alimentar',
  titulo: { antes: 'Todo produtor da rede tem regularização sanitária ', leve: 'própria', depois: '.' },
}

/** Foto do posto: mora no mapa único (src/data/fotos.js → 'qualidade-conferencia'). */

/** O que a rede exige. */
export const EXIGENCIAS = {
  rotulo: 'Exigências',
  titulo: 'O que a rede exige de cada produtor',
  itens: [
    {
      titulo: 'Regularização sanitária própria',
      texto: 'Documento da vigilância sanitária no nome do negócio do produtor, válido para o que ele produz. A gente pede antes do primeiro pedido. Regularização “em andamento” não entra: entra quando estiver concluída.',
    },
    {
      titulo: 'Boas práticas de fabricação',
      texto: 'Higiene da cozinha e de quem manipula, ingredientes dentro da validade, armazenamento e temperatura corretos. É o básico da segurança alimentar, e na rede é obrigatório.',
    },
    {
      titulo: 'Rastreabilidade do lote',
      texto: 'Cada lote sai identificado com o produtor e a data de produção. Se algo der errado, a gente sabe de onde veio e o que mais saiu daquele lote.',
    },
  ],
}

/** Como o padrão é mantido. O que a conferência olha é o que a seção 5 dos termos diz: o que pode ser visto e contado
 *  (não é análise de laboratório). */
export const PADRAO = {
  rotulo: 'O padrão',
  titulo: 'O mesmo padrão, venha de que forno vier',
  etapas: [
    { titulo: 'Padrão combinado por item', texto: 'Na entrada do produtor, a gente combina o padrão de cada produto: receita, peso, tamanho, aparência e\u00a0embalagem.' },
    // o mesmo texto da seção 5 dos termos: "conferência do que pode ser visto e contado, como a quantidade e a aparência"
    { titulo: 'Conferência antes da rota', texto: 'Antes de entrar na rota, a fornada é conferida no padrão da rede: o que dá para ver e contar, como a quantidade e a aparência dos produtos.' },
    {
      titulo: 'Documento em dia',
      // o que a seção 4 dos termos sustenta: o documento antes do 1º pedido, o direito de pedir de novo e a parada até
      // regularizar. O dever de avisar na hora está em Responsabilidades.
      texto: 'A gente confere o documento antes do primeiro pedido e pode pedir de novo a qualquer momento. Se vencer, o produtor para de receber pedidos até\u00a0regularizar.',
    },
  ],
  limite:
    'A conferência é feita no olho e no documento. Ela não é análise de laboratório e não substitui a fiscalização sanitária\u00a0— por isso a regularização de cada produtor é requisito de entrada, e não detalhe.',
}

/** Se alguma coisa vier errada. */
export const RECLAMACOES = {
  rotulo: 'Reclamações',
  titulo: 'Reclamação tem caminho certo',
  paradas: [
    { titulo: 'Você confere e avisa', texto: 'Confere o pedido na entrega. Faltou item ou veio produto avariado ou fora do padrão? Avisa pelo WhatsApp, de preferência com foto do produto e da etiqueta do lote.' },
    { titulo: 'A gente rastreia', texto: 'Pela etiqueta, a gente identifica o lote e o forno de origem, e verifica o que mais saiu daquele lote.' },
    { titulo: 'A gente resolve com você', texto: 'Troca, reposição ou desconto, combinados caso a caso.' },
    // o que a seção 5 dos termos sustenta: a Fornada apura com o produtor do lote e cobra a correção
    { titulo: 'O produtor corrige', texto: 'A gente apura a causa com ele e cobra a\u00a0correção.' },
  ],
  aviso: {
    titulo: 'Suspeita de problema de saúde?',
    texto: 'Procura atendimento médico primeiro. Depois avisa a gente na hora e guarda o produto e a embalagem: o lote é rastreado e o produtor responsável é acionado. Você também pode comunicar a vigilância sanitária do seu município.',
  },
  acao: 'Avisar pelo WhatsApp', // mensagem: ATALHOS.problemaPedido()
}

/** Quem responde pelo quê. */
export const RESPONSABILIDADES = {
  rotulo: 'Responsabilidades',
  titulo: 'Cada um responde pelo que faz',
  fornada: {
    titulo: 'A Fornada Conecta',
    itens: [
      'Exige e confere a regularização sanitária de cada produtor antes de ele entrar na rede',
      'Escolhe o forno de cada item conforme produto, capacidade e região',
      'Confere a fornada no padrão da rede antes da rota',
      'Monta a rota e entrega no horário combinado',
      'Atende a sua reclamação, rastreia o lote e cobra a correção',
      'Faz a cobrança única e o repasse a cada produtor',
    ],
  },
  produtor: {
    titulo: 'Cada produtor parceiro',
    itens: [
      'Mantém a própria regularização sanitária em dia\u00a0— e avisa na hora se ela vencer, for suspensa ou cancelada',
      'Produz dentro das boas práticas e do padrão combinado',
      'Identifica cada lote',
      'Informa os ingredientes e os alergênicos de cada produto',
      'Responde pela produção do seu forno: receita, ingredientes, higiene e armazenamento',
      'Corrige o que for apontado',
    ],
  },
  frase: 'No que sai do nosso forno, a Fornada Conecta responde como produtor, com as mesmas regras.',
  nota: 'A Fornada Conecta não emite, não substitui e não intermedeia a regularização sanitária de nenhum produtor. O que a gente assume é o que a gente faz: exigir o documento, conferir a fornada no padrão combinado e organizar a entrega.',
}

/** Chamada final (só título; botões = padrão do CtaFinal). */
export const CHAMADA = { titulo: 'Padrão combinado, conferido e entregue no horário.' }
