// Gatilho "uma vez" por IntersectionObserver, com o caso que o observador comum perde: a rolagem SALTOU por cima do
// alvo (link para âncora, "voltar" com rolagem restaurada, Home → rodapé). Um observador comum não avisa quando o alvo
// passa de "abaixo da tela" para "acima da tela" sem nunca cruzar o limiar — e o passo/selo/ícone ficaria vazio para
// sempre quando a pessoa rolasse de volta. Por isso a raiz é estendida para CIMA (ACIMA): tudo que está acima da tela
// conta como cruzado, e `passou` (alvo já acima da tela) é separado de `entrar` pela posição.
export const ACIMA = '100000px'

export function observarUmaVez(el, { limiar = 0, margemBaixo = '0px', entrar, passou = entrar }) {
  if (!el) return () => {}
  if (typeof IntersectionObserver === 'undefined') {
    entrar()
    return () => {}
  }
  const io = new IntersectionObserver(
    (es) => {
      const e = es[es.length - 1]
      if (!e.isIntersecting) return
      io.disconnect()
      if (e.boundingClientRect.bottom < 0) passou()
      else entrar()
    },
    { threshold: limiar, rootMargin: `${ACIMA} 0px ${margemBaixo} 0px` },
  )
  io.observe(el)
  return () => io.disconnect()
}
