// Moldura das telas de quem ainda não entrou (login e criar conta): fundo verde, marca e o cartão branco.
// abaixo: o que fica embaixo do cartão (ex.: contas de demonstração).
export default function TelaPublica({ largura = 'max-w-sm', children, abaixo }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-900 px-4 py-10">
      <div className={`w-full ${largura}`}>
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-700 text-sm font-bold text-white">
            CT
          </div>
          <h1 className="text-2xl font-bold text-white">CheckTruck</h1>
          <p className="mt-1 text-xs font-semibold tracking-widest text-brand-300">
            CONTROLE DE MANUTENÇÃO PREVENTIVA
          </p>
        </div>

        <div className="rounded-2xl bg-white px-7 py-7 shadow-2xl">{children}</div>

        {abaixo}
      </div>
    </div>
  )
}
