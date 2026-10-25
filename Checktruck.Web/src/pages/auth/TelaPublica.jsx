import Logo from '../../components/marca/Logo'
import { Caminhao } from '../../components/marca/Desenhos'

// Moldura da tela de quem ainda não entrou (login): à esquerda a marca e o caminhão na estrada, à direita o cartão.
// abaixo: o que fica embaixo do cartão (ex.: contas de demonstração).
export default function TelaPublica({ children, abaixo }) {
  return (
    <div className="flex min-h-screen bg-mist-50">
      <section className="relative hidden w-[46%] max-w-[680px] flex-col overflow-hidden bg-brand-900 lg:flex">
        <div className="px-14 pt-16">
          <h1><Logo tamanho={60} className="gap-4 text-[46px] text-white" /></h1>
          <p className="mt-4 max-w-sm text-lg text-brand-200">Controle de manutenção preventiva</p>
        </div>
        <div className="mt-auto">
          <Caminhao largura={460} fundo="escuro" estrada={false} className="ml-14 -mb-1" />
          <div className="h-8 bg-[#0b2e1e] pt-3">
            <div className="h-1 bg-[repeating-linear-gradient(90deg,var(--color-faixa)_0_46px,transparent_46px_78px)]" />
          </div>
          <div className="h-12" />
        </div>
      </section>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center lg:hidden">
            <h1><Logo tamanho={44} className="text-[32px] text-stone-900" /></h1>
            <p className="mt-2 text-stone-500">Controle de manutenção preventiva</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white px-8 py-8">{children}</div>
          {abaixo}
        </div>
      </main>
    </div>
  )
}
