// "Uma vez por visita": rota já vista NESTA visita monta direto no estado final (rota acesa,
// reveal visível, Lottie no poster). Memória do módulo, sem storage — recarregar é outra visita.
import { useRoute } from 'vue-router'

const vistas = new Set()

/** O router marca a rota que a pessoa está DEIXANDO (beforeEach): a volta para ela não reanima. */
export const marcarVista = (path) => vistas.add(path)
export const jaVista = (path) => vistas.has(path)

/** Valor fixo no setup: a página atual já foi vista nesta visita? */
export function usePaginaVista() {
  const route = useRoute()
  return jaVista(route?.path ?? '')
}
