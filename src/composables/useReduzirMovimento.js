// prefers-reduced-motion AO VIVO: ref atualizada no evento `change`. Todo movimento que nasce
// em JS consulta o valor no instante em que vai animar — o @media do CSS não desliga Lottie, observador nem rolagem.
import { readonly, ref } from 'vue'
export { reduzirAgora } from '@/lib/motion'

const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
const reduzir = ref(Boolean(mq?.matches))
mq?.addEventListener('change', (e) => {
  reduzir.value = e.matches
})

export function useReduzirMovimento() {
  return readonly(reduzir)
}
