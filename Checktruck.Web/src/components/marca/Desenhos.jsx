// Desenhos do site (feitos para o CheckTruck): o caminhão na estrada e a estrada vazia

// Cores do caminhão: verde no fundo claro; no fundo verde (login), a cabine fica branca
const CORES = {
  claro: { cabine: '#0f6b42', cabineEscura: '#0a4a2e', vidro: '#c0e1cf', asfalto: '#26302b' },
  escuro: { cabine: '#ffffff', cabineEscura: '#cfe0d6', vidro: '#7fb59a', asfalto: '#0b2e1e' },
}
const CHASSI = '#24302b'
const METAL = '#9fb2a8'

function Estrada({ asfalto }) {
  return (
    <g>
      <rect x="0" y="152" width="340" height="18" fill={asfalto} />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={10 + i * 58} y="159" width="34" height="4" rx="2" fill="#f2c230" />)}
    </g>
  )
}

function Roda({ x }) {
  return (
    <g>
      <circle cx={x} cy="130" r="22" fill="#1c2420" />
      <circle cx={x} cy="130" r="12" fill="#c8d3cd" />
      <circle cx={x} cy="130" r="4" fill="#1c2420" />
    </g>
  )
}

// Cavalo mecânico "cara chata" de lado, numa estrada com a faixa amarela. fundo: 'claro' ou 'escuro'.
// estrada: false quando quem usa desenha a estrada mais comprida (ex.: o login, de ponta a ponta)
export function Caminhao({ largura = 320, fundo = 'claro', estrada = true, className = '' }) {
  const c = CORES[fundo]
  const altura = estrada ? 170 : 152 // sem a estrada, o desenho acaba embaixo das rodas
  return (
    <svg viewBox={`0 0 340 ${altura}`} width={largura} height={(largura * altura) / 340} aria-hidden="true" className={className}>
      {estrada && <Estrada asfalto={c.asfalto} />}
      <rect x="30" y="112" width="290" height="12" rx="3" fill={CHASSI} />
      <rect x="222" y="102" width="56" height="10" rx="3" fill={CHASSI} />
      <rect x="140" y="24" width="8" height="90" rx="4" fill={METAL} />
      <rect x="138" y="20" width="12" height="8" rx="2" fill={CHASSI} />
      <path d="M24 118 V52 Q24 34 42 34 H130 Q134 34 134 38 V118 Z" fill={c.cabine} />
      <path d="M46 34 L62 15 Q64 12 68 12 H128 Q132 12 132 16 V34 Z" fill={c.cabineEscura} />
      <rect x="32" y="44" width="52" height="30" rx="6" fill={c.vidro} />
      <path d="M40 70 L58 48" stroke="#fff" strokeOpacity=".45" strokeWidth="4" strokeLinecap="round" />
      <path d="M98 44 V110" stroke={c.cabineEscura} strokeWidth="2.5" strokeOpacity=".55" />
      <rect x="84" y="82" width="9" height="3.5" rx="1.75" fill={c.cabineEscura} />
      <rect x="24" y="92" width="110" height="7" fill="#f2c230" />
      <rect x="14" y="104" width="32" height="14" rx="4" fill={CHASSI} />
      <rect x="16" y="95" width="11" height="6" rx="2" fill="#ffe9a8" />
      <rect x="58" y="112" width="22" height="4" rx="2" fill={METAL} />
      <rect x="152" y="106" width="50" height="22" rx="10" fill={METAL} />
      <path d="M160 112 H194" stroke={CHASSI} strokeOpacity=".35" strokeWidth="2" />
      <path d="M38 122 A26 26 0 0 1 90 122" fill="none" stroke={CHASSI} strokeWidth="6" />
      <rect x="208" y="112" width="106" height="7" rx="3" fill={CHASSI} />
      <Roda x={64} />
      <Roda x={236} />
      <Roda x={290} />
    </svg>
  )
}

// Estrada vazia indo até o horizonte, com uma placa verde na beira: nas telas sem nada cadastrado
export function EstradaVazia({ largura = 150 }) {
  return (
    <svg viewBox="0 0 160 96" width={largura} height={(largura * 96) / 160} aria-hidden="true">
      <path d="M0 40 H160 V96 H0 Z" fill="#e0f1e7" />
      <path d="M74 40 H86 L128 96 H32 Z" fill="#3a4540" />
      <path d="M79.2 46 h1.6 l.5 6 h-2.6 Z M78.6 58 h2.8 l.9 10 h-4.6 Z M77.6 75 h4.8 l1.5 16 h-7.8 Z" fill="#f2c230" />
      <path d="M74 40 H86" stroke="#c0e1cf" strokeWidth="1.5" />
      <rect x="130" y="40" width="3" height="34" rx="1" fill="#9fb2a8" />
      <rect x="117" y="18" width="29" height="23" rx="4" fill="#0f6b42" />
      <rect x="119.5" y="20.5" width="24" height="18" rx="2.5" fill="none" stroke="#fff" strokeWidth="1.2" />
      <path d="M124 29.5 128.5 34 138 24.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
