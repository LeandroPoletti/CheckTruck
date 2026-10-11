const CORES = { critico: 'bg-red-500', atencao: 'bg-amber-500', ok: 'bg-brand-600' }

// Quanto do ciclo de troca já foi rodado (barra cheia = na hora de trocar). A cor segue o status do item.
// Sem percentual (caminhão sem item acompanhado), a barra fica vazia.
export function BarraDeUso({ percentual, status }) {
  const largura = percentual == null ? 0 : Math.max(2, percentual)
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
      <div className={`h-full rounded-full ${CORES[status] ?? CORES.ok}`} style={{ width: `${largura}%` }} />
    </div>
  )
}
