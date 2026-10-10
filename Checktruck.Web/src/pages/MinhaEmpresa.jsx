import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Card, Carregando, ErroCarregamento } from '../components/Layout'
import { Button } from '../components/ui/Form'
import { empresaService } from '../services'
import { recarregarUsuario } from '../services/sessao'
import { TIPOS_CONTA, formatDocumento } from '../data/acesso'

// Dados da conta. No Autônomo, o botão Virar Frota (só Admin e Gestor chegam nesta tela).
export default function MinhaEmpresa() {
  const navigate = useNavigate()
  const [empresa, setEmpresa] = useState(null)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [confirmando, setConfirmando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroAcao, setErroAcao] = useState(null)

  useEffect(() => {
    let cancelado = false
    empresaService.obterMinha()
      .then((e) => { if (!cancelado) setEmpresa(e) })
      .catch((e) => { if (!cancelado) setErro(e.message) })
    return () => { cancelado = true }
  }, [versao])

  function tentarNovamente() {
    setErro(null)
    setVersao((v) => v + 1)
  }

  async function virarFrota() {
    setSalvando(true)
    setErroAcao(null)
    try {
      await empresaService.virarFrota()
      await recarregarUsuario() // a sessão passa a ser Frota: o menu ganha Chamados e Acesso
      navigate(0) // recarrega a tela para o menu ler a sessão nova
    } catch (e) {
      setErroAcao(e.message)
    } finally {
      setSalvando(false)
    }
  }

  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />
  if (!empresa) return <Carregando />

  const autonomo = empresa.tipoConta === 'Autonomo'
  // O documento é o da criação da conta: quem virou Frota continua com o CPF
  const nomeDocumento = (empresa.documento?.length ?? (autonomo ? 11 : 14)) === 14 ? 'CNPJ' : 'CPF'

  return (
    <>
      <PageHeader title="Minha empresa" subtitle="Dados da conta no CheckTruck" />

      <Card className="max-w-2xl p-6">
        <div className="grid grid-cols-3 gap-4">
          <Dado label="Nome" valor={empresa.nome} />
          <Dado label="Tipo de conta" valor={TIPOS_CONTA[empresa.tipoConta]} />
          <Dado label={nomeDocumento} valor={empresa.documento ? formatDocumento(empresa.documento) : '—'} />
        </div>
      </Card>

      {autonomo && (
        <Card className="mt-5 max-w-2xl p-6">
          <h3 className="font-semibold text-stone-900">Virar Frota</h3>
          <p className="mt-1 text-sm text-stone-500">
            Contratou motorista ou vai ter equipe? Na Frota você cadastra acessos (motoristas, mecânicos, gestor), cada
            um com o que pode fazer, e os motoristas abrem chamados. Seus caminhões, OS e intervalos continuam iguais.
            Não dá para voltar a Autônomo.
          </p>
          {erroAcao && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erroAcao}</p>}
          {confirmando ? (
            <div className="mt-4 flex gap-2">
              <Button onClick={virarFrota} disabled={salvando}>{salvando ? 'Mudando…' : 'Sim, virar Frota'}</Button>
              <Button variant="secondary" onClick={() => setConfirmando(false)} disabled={salvando}>Cancelar</Button>
            </div>
          ) : (
            <Button className="mt-4" onClick={() => setConfirmando(true)}>Virar Frota</Button>
          )}
        </Card>
      )}
    </>
  )
}

function Dado({ label, valor }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wide text-stone-400">{label.toUpperCase()}</p>
      <p className="mt-1 text-sm font-semibold text-stone-800">{valor}</p>
    </div>
  )
}
