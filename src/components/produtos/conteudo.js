// Textos de Produtos. Categorias, descrições, exemplos e fotos moram em src/data/categorias.js; a mensagem dos atalhos
// de WhatsApp vem de src/data/atalhosWhatsapp.js. Os exemplos repetem só o que a descrição já cita: nada de item
// inventado.

/** Abertura. O H1 tem um trecho em display-leve (1× por página). */
export const ABERTURA = {
  rotulo: 'Produtos',
  titulo: { antes: 'Pão, bolo, salgado e massa pro giro ', leve: 'do seu balcão', depois: '.' },
  sub: 'Sem tabela de preço por aqui: o valor depende do que, de quanto e de com que frequência. Pede um orçamento no WhatsApp.',
}

/** Filtro por categoria (demonstrativo). Sem contagem: os itens ainda são exemplos a confirmar. */
export const FILTRO = {
  rotulo: 'Filtrar por categoria', // rótulo visível e nome do grupo
  todos: 'Todos',
  mostrando: (nome) => `Mostrando: ${nome}.`,
  mostrandoTodas: 'Mostrando todas as categorias.',
  // categoria escolhida sem exemplo: a região viva soma a 1ª frase do vazio — quem não vê a tela ouve
  vazio: 'Nada nessa categoria por enquanto.',
  // recado da prévia: só em dev/prévia/teste, nunca no ar
  aConfirmar: 'Exemplos a confirmar',
}

/** Estado vazio: o texto padrão do EstadoVazio já serve. Nome da categoria na mensagem: minúsculo. */
export const nomeNaMensagem = (categoria) => (categoria ? categoria.titulo.toLowerCase() : 'todas')

/** Segurança alimentar no fim da página (a mesma faixa da Para comércios). */
export const SEGURANCA = {
  texto: 'Tudo o que chega no seu balcão vem de forno com regularização sanitária própria e passa pela conferência da rede.',
  // chega nas exigências da Qualidade, com o H2 no topo e o foco nele (como a Home)
  link: { rotulo: 'Ver o que a rede exige dos produtores', to: { path: '/qualidade', hash: '#exigencias-titulo' } },
}

/** Fim. */
export const FIM = {
  rotulo: 'Fora da lista', // o rótulo nomeia a seção, como nas outras; a pergunta fica só no H2
  titulo: 'Precisa de algo que não está aqui?',
  texto:
    'A rede junta fornos de vários tipos de panificação. Se o seu balcão precisa de um item fora desta lista, pergunta: se algum produtor da rede faz, a gente conecta.',
  pedir: 'Quero receber fornada', // → /para-comercios?produtos=<categoria ativa>
  orcamento: 'Pedir orçamento no WhatsApp', // mensagem com a categoria ativa ou "todas"
}
