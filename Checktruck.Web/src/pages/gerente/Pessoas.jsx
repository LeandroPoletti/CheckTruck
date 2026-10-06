import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Card, Carregando, ErroCarregamento } from '../../components/Layout'
import { Button, Select } from '../../components/ui/Form'
import { PlacaBadge } from '../../components/ui/Badges'
import NovaPessoaModal from '../../components/modals/NovaPessoaModal'
import MecanicoModal from '../../components/modals/MecanicoModal'
import AcessoMecanicoModal from '../../components/modals/AcessoMecanicoModal'
import ConfirmarExclusaoModal from '../../components/modals/ConfirmarExclusaoModal'
import { motoristaService, mecanicoService, veiculoService, filtro } from '../../services'

const TABS = [
  { id: 'motorista', label: 'Motoristas' },
  { id: 'mecanico', label: 'Mecânicos' },
  { id: 'inativos', label: 'Inativos' },
]

const VAZIO = { motoristas: [], mecanicos: [], veiculosLivres: [] }

export default function Pessoas() {
  const [tab, setTab] = useState('motorista')
  const [novoOpen, setNovoOpen] = useState(false)
  const [mecanicoModal, setMecanicoModal] = useState(null) // { registro } ao cadastrar/editar
  const [acessoPara, setAcessoPara] = useState(null) // mecânico que vai ganhar login
  const [removerAcessoDe, setRemoverAcessoDe] = useState(null)
  const [erroVinculo, setErroVinculo] = useState('')
  const [dados, setDados] = useState(VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let cancelado = false
    Promise.all([
      motoristaService.listar(),
      mecanicoService.listar(),
      veiculoService.listar(filtro.semVinculo('Motorista')),
    ])
      .then(([motoristas, mecanicos, semMotorista]) => {
        if (!cancelado) setDados({ motoristas, mecanicos, veiculosLivres: semMotorista.filter((v) => v.ativo) })
      })
      .catch((e) => { if (!cancelado) setErro(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [versao])

  // Após salvar: atualiza em segundo plano, sem desmontar a tela (e os modais abertos)
  function recarregar() {
    setErro(null)
    setVersao((v) => v + 1)
  }

  function tentarNovamente() {
    setCarregando(true)
    recarregar()
  }

  const { veiculosLivres } = dados
  const usuarios = useMemo(() => [...dados.motoristas], [dados])

  const contagens = {
    motorista: usuarios.filter((u) => u.perfil === 'motorista' && u.ativo).length,
    mecanico: dados.mecanicos.filter((m) => m.ativo).length,
    inativos: usuarios.filter((u) => !u.ativo && u.perfil !== 'gerente').length,
  }

  const listaFiltrada = useMemo(() => {
    if (tab === 'inativos') return usuarios.filter((u) => !u.ativo && u.perfil !== 'gerente')
    return usuarios.filter((u) => u.perfil === tab && u.ativo)
  }, [usuarios, tab])

  async function vincular(veiculoId, motoristaId) {
    setErroVinculo('')
    try {
      // a API exige o veículo completo no PUT
      const veiculo = veiculosLivres.find((v) => v.id === veiculoId)
      await veiculoService.atualizar(veiculoId, { ...veiculo, motoristaId })
      recarregar()
    } catch (e) {
      setErroVinculo(e.message)
    }
  }

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title="Pessoas"
        subtitle="Contas de acesso, CPF e vínculo com veículos"
        action={
          <Button onClick={() => (tab === 'mecanico' ? setMecanicoModal({ registro: null }) : setNovoOpen(true))}>
            <Plus size={16} /> {tab === 'mecanico' ? 'Novo mecânico' : 'Nova pessoa'}
          </Button>
        }
      />

      <div className="mb-5 flex gap-6 border-b border-stone-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-semibold transition ${
              tab === t.id ? 'border-brand-700 text-brand-800' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            {t.label} · {contagens[t.id]}
          </button>
        ))}
      </div>

      {erroVinculo && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erroVinculo}</p>}

      {tab === 'mecanico' ? (
        <MecanicosGrid
          mecanicos={dados.mecanicos}
          onNovo={() => setMecanicoModal({ registro: null })}
          onEditar={(m) => setMecanicoModal({ registro: m })}
          onDarAcesso={setAcessoPara}
          onRemoverAcesso={setRemoverAcessoDe}
        />
      ) : (
      <div className="grid grid-cols-3 gap-4">
        {listaFiltrada.map((p) => {
          const veiculo = p.veiculoId ? { id: p.veiculoId, placa: p.veiculoPlaca } : null
          return (
            <Card key={p.key} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-stone-900">{p.nome}</p>
                  <p className="text-xs text-stone-500">{p.email}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                    !p.ativo
                      ? 'border-stone-300 bg-stone-50 text-stone-500'
                      : p.perfil === 'motorista' && !veiculo
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'border-brand-300 bg-brand-50 text-brand-700'
                  }`}
                >
                  {!p.ativo ? 'INATIVO' : p.perfil === 'motorista' && !veiculo ? 'SEM VEÍCULO' : 'ATIVO'}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-stone-400">CPF</span>
                <span className="font-mono-label text-stone-700">{p.cpf || '—'}</span>
              </div>

              {p.perfil === 'motorista' && (
                <div className="mt-1.5 flex items-center justify-between text-sm">
                  <span className="text-stone-400">Veículo</span>
                  {veiculo ? (
                    <PlacaBadge placa={veiculo.placa} size="sm" />
                  ) : (
                    <VincularSelect
                      veiculosLivres={veiculosLivres}
                      onVincular={(veiculoId) => vincular(veiculoId, p.id)}
                    />
                  )}
                </div>
              )}
            </Card>
          )
        })}

        <button
          onClick={() => setNovoOpen(true)}
          className="flex min-h-[140px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-stone-300 text-stone-400 transition hover:border-brand-400 hover:text-brand-600"
        >
          <Plus size={20} />
          <span className="text-sm font-semibold">Cadastrar motorista</span>
          <span className="text-xs">conta de acesso · CPF · veículo</span>
        </button>
      </div>
      )}

      <NovaPessoaModal
        open={novoOpen}
        perfilInicial="motorista"
        onClose={() => setNovoOpen(false)}
        onSalvo={recarregar}
      />
      <MecanicoModal open={!!mecanicoModal} registro={mecanicoModal?.registro} onClose={() => setMecanicoModal(null)} onSalvo={recarregar} />
      <AcessoMecanicoModal open={!!acessoPara} mecanico={acessoPara} onClose={() => setAcessoPara(null)} onSalvo={recarregar} />
      <ConfirmarExclusaoModal
        open={!!removerAcessoDe}
        onClose={() => setRemoverAcessoDe(null)}
        titulo="Remover acesso"
        rotulo="Remover acesso"
        descricao={`Tirar o login de "${removerAcessoDe?.nome}"? Ele continua no cadastro e no histórico das OS, só não entra mais no sistema.`}
        onConfirmar={async () => {
          await mecanicoService.removerAcesso(removerAcessoDe.id)
          recarregar()
        }}
      />
    </>
  )
}

// Mecânicos: cadastro (nome e função) e, se precisar, login para consultar pelo celular
function MecanicosGrid({ mecanicos, onNovo, onEditar, onDarAcesso, onRemoverAcesso }) {
  const ordenados = [...mecanicos].sort((a, b) => (a.ativo === b.ativo ? a.nome.localeCompare(b.nome) : a.ativo ? -1 : 1))
  return (
    <div className="grid grid-cols-3 gap-4">
      {ordenados.map((m) => (
        <Card key={m.id} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-semibold ${m.ativo ? 'text-stone-900' : 'text-stone-400'}`}>{m.nome}</p>
              <p className="text-xs text-stone-500">{m.funcao}</p>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                !m.ativo
                  ? 'border-stone-300 bg-stone-50 text-stone-500'
                  : m.temAcesso
                  ? 'border-brand-300 bg-brand-50 text-brand-700'
                  : 'border-amber-300 bg-amber-50 text-amber-700'
              }`}
            >
              {!m.ativo ? 'INATIVO' : m.temAcesso ? 'COM ACESSO' : 'SEM ACESSO'}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-stone-400">Login no sistema</span>
            {m.temAcesso ? (
              <button type="button" onClick={() => onRemoverAcesso(m)} className="text-xs font-semibold text-red-600 hover:underline">
                Remover acesso
              </button>
            ) : (
              <button type="button" onClick={() => onDarAcesso(m)} className="text-xs font-semibold text-brand-700 hover:underline">
                Dar acesso
              </button>
            )}
          </div>
          <div className="mt-1.5 flex justify-end">
            <button type="button" onClick={() => onEditar(m)} className="text-xs text-stone-500 hover:underline">Editar</button>
          </div>
        </Card>
      ))}

      <button
        onClick={onNovo}
        className="flex min-h-[140px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-stone-300 text-stone-400 transition hover:border-brand-400 hover:text-brand-600"
      >
        <Plus size={20} />
        <span className="text-sm font-semibold">Cadastrar mecânico</span>
        <span className="text-xs">nome · função · acesso opcional</span>
      </button>
    </div>
  )
}

function VincularSelect({ veiculosLivres, onVincular }) {
  if (veiculosLivres.length === 0) {
    return <span className="text-xs text-stone-400">Nenhum livre</span>
  }
  return (
    <Select
      className="!w-auto py-1 text-xs"
      defaultValue=""
      onChange={(e) => {
        if (e.target.value) onVincular(e.target.value)
      }}
    >
      <option value="">Vincular</option>
      {veiculosLivres.map((v) => (
        <option key={v.id} value={v.id}>{v.placa}</option>
      ))}
    </Select>
  )
}
