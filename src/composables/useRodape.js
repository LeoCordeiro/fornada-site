// Costura da página para o rodapé (marrom-profundo): o halo da parada é o tom do ÚLTIMO bloco da página.
// Padrão: o AppFooter descobre sozinho (último BlocoRota de 1º nível dentro do <main>). A página que precisar
// fixar (bloco partido no fim, coluna da costura) chama useRodape({ tom, coluna, colunaTablet }) no setup — vale só
// para ela. `colunaTablet` (1–8): sem ela o RotaDivisa deduz da coluna do desktop (coluna × 8/12).
import { onBeforeUnmount, reactive, readonly } from 'vue'

const pedido = reactive({ tom: null, coluna: null, colunaTablet: null, dono: null })

export function useRodape({ tom = null, coluna = null, colunaTablet = null } = {}) {
  const dono = Symbol('pagina')
  Object.assign(pedido, { tom, coluna, colunaTablet, dono })
  onBeforeUnmount(() => {
    if (pedido.dono === dono) Object.assign(pedido, { tom: null, coluna: null, colunaTablet: null, dono: null })
  })
}

export const pedidoDoRodape = readonly(pedido)
