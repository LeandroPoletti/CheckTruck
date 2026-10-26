// Logo do CheckTruck: uma placa de estrada (na cor do tema; verde no padrão), com o "visto" desenhado como uma
// estrada (asfalto, beira branca e a faixa amarela no meio). No tema verde é o mesmo desenho do favicon.svg.
function Simbolo({ tamanho = 32 }) {
  return (
    <svg viewBox="0 0 100 100" width={tamanho} height={tamanho} aria-hidden="true" className="shrink-0">
      <rect x="2" y="2" width="96" height="96" rx="20" style={{ fill: 'var(--color-logo)' }} />
      <rect x="8" y="8" width="84" height="84" rx="15" fill="none" strokeWidth="3.5" style={{ stroke: 'var(--color-logo-moldura)' }} />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 52 42 70 77 30" stroke="#fff" strokeWidth="21" />
        <path d="M24 52 42 70 77 30" stroke="#26302b" strokeWidth="14" />
        <path d="M24 52 42 70 77 30" stroke="#f2c230" strokeWidth="3" strokeDasharray="6 6" />
      </g>
    </svg>
  )
}

// O símbolo com o nome do lado. A cor do nome vem de quem usa (a do topo no menu, escura no fundo claro).
export default function Logo({ tamanho = 32, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-titulo font-extrabold ${className}`}>
      <Simbolo tamanho={tamanho} />
      CheckTruck
    </span>
  )
}
