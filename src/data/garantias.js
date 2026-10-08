// Garantias da rede: os itens da Qualidade e o bloco de qualidade da Home.
export const GARANTIAS = [
  {
    titulo: 'Produtores com regularização sanitária',
    texto: 'Sem regularização sanitária própria, o produtor não entra na rede. É a primeira coisa que a gente pede.',
  },
  {
    titulo: 'Padrão de qualidade da rede',
    texto: 'Cada fornada é conferida no mesmo padrão, seja do nosso forno ou de um produtor parceiro.',
  },
  {
    titulo: 'Entrega no horário combinado',
    texto: 'Você combina o horário uma vez; a rota é montada em cima dele.',
  },
]

/** Bloco de qualidade da Home (QualidadeFoto). */
export const QUALIDADE_HOME = {
  rotulo: 'Qualidade e segurança alimentar',
  titulo: 'Todo produtor da rede tem regularização sanitária própria.',
  sub: 'É requisito de entrada, não detalhe. E todo produto, venha do nosso forno ou de um parceiro, segue o mesmo padrão até o seu balcão.',
  nota: 'Cada produtor responde pela própria regularização sanitária. A Fornada Conecta exige o documento, organiza a rede e cuida do padrão e da entrega.',
  // direto na seção "O que a rede exige" (o topo da Qualidade repete o bloco que a pessoa acabou de ler)
  acao: { rotulo: 'Ver o que a rede exige dos produtores', to: { path: '/qualidade', hash: '#exigencias-titulo' } },
}
