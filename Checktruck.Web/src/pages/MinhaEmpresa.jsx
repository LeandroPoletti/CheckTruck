import { PageHeader, Card, Carregando, ErroCarregamento } from '../components/Layout'
import { empresaService } from '../services'
import { useCarga } from '../hooks/useCarga'
import { formatDocumento } from '../data/acesso'

// Dados da empresa no CheckTruck (só Admin e Gestor chegam nesta tela)
export default function MinhaEmpresa() {
  const { dados: empresa, carregando, erro, tentarNovamente } = useCarga(() => empresaService.obterMinha())

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

  // O CNPJ; nas contas antigas de uma pessoa só, o CPF dela
  const nomeDocumento = empresa.documento?.length === 11 ? 'CPF' : 'CNPJ'

  return (
    <>
      <PageHeader title="Minha empresa" subtitle="Dados da conta no CheckTruck" />

      <Card className="max-w-2xl p-6">
        <div className="grid grid-cols-3 gap-4">
          <Dado label="Nome" valor={empresa.nome} />
          <Dado label={nomeDocumento} valor={empresa.documento ? formatDocumento(empresa.documento) : '—'} />
        </div>
      </Card>
    </>
  )
}

function Dado({ label, valor }) {
  return (
    <div>
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-stone-800">{valor}</p>
    </div>
  )
}
