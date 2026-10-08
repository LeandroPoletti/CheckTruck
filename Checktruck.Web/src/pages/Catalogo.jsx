import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Card, Carregando, ErroCarregamento } from '../components/Layout'
import { Button } from '../components/ui/Form'
import { fabricanteService, modeloService, geracaoService, veiculoService, intervaloService } from '../services'
import FabricanteModal from '../components/modals/FabricanteModal'
import ModeloModal from '../components/modals/ModeloModal'
import GeracaoModal from '../components/modals/GeracaoModal'
import { obterUsuario } from '../services/sessao'
import { pode } from '../data/acesso'

const VAZIO = { fabricantes: [], modelos: [], geracoes: [], veiculos: [], intervalos: [] }
const porNome = (a, b) => a.nome.localeCompare(b.nome)
const quantos = (n, um, varios) => `${n} ${n === 1 ? um : varios}`

// Fabricante → modelo → gerações (com anos, norma, motor, câmbio e potências), usados no cadastro de veículos
export default function Catalogo() {
  // A contagem de caminhões por geração só aparece para quem vê a frota
  const verFrota = pode(obterUsuario(), 'VerFrota')
  const [fabricanteSel, setFabricanteSel] = useState(null)
  const [modeloSel, setModeloSel] = useState(null)
  const [dados, setDados] = useState(VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [modal, setModal] = useState(null) // 'fabricante' | 'modelo' | 'geracao' enquanto o modal está aberto

  useEffect(() => {
    let cancelado = false
    Promise.all([
      fabricanteService.listar(),
      modeloService.listar(),
      geracaoService.listar(),
      verFrota ? veiculoService.listar() : [],
      intervaloService.listar(),
    ])
      .then(([fabricantes, modelos, geracoes, veiculos, intervalos]) => {
        if (cancelado) return
        fabricantes.sort(porNome)
        modelos.sort(porNome)
        geracoes.sort((a, b) => a.anoInicio - b.anoInicio || a.nome.localeCompare(b.nome))
        setDados({ fabricantes, modelos, geracoes, veiculos, intervalos })
      })
      .catch((e) => { if (!cancelado) setErro(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [versao, verFrota])

  // Após salvar: atualiza em segundo plano, sem desmontar a tela
  function recarregar() {
    setErro(null)
    setVersao((v) => v + 1)
  }

  function tentarNovamente() {
    setCarregando(true)
    recarregar()
  }

  const { fabricantes, modelos, geracoes, veiculos, intervalos } = dados
  // Sem seleção, o primeiro fabricante e o primeiro modelo dele ficam ativos
  const fabricante = fabricantes.find((f) => f.id === fabricanteSel) ?? fabricantes[0]
  const modelosDoFabricante = useMemo(() => modelos.filter((m) => m.fabricanteId === fabricante?.id), [modelos, fabricante])
  const modelo = modelosDoFabricante.find((m) => m.id === modeloSel) ?? modelosDoFabricante[0]
  const geracoesDoModelo = geracoes.filter((g) => g.modeloId === modelo?.id)

  const contar = (lista, campo, id, um, varios) => quantos(lista.filter((x) => x[campo] === id).length, um, varios)

  function escolherFabricante(id) {
    setFabricanteSel(id)
    setModeloSel(null)
  }

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title="Catálogo"
        subtitle="Fabricante → modelo → geração → potência, usados no cadastro de veículos"
        action={<Button onClick={() => setModal('geracao')}><Plus size={16} /> Nova geração</Button>}
      />

      <div className="grid grid-cols-4 gap-5">
        <Card className="p-4">
          <p className="mb-3 text-xs font-bold tracking-wide text-stone-400">FABRICANTE</p>
          <div className="space-y-1">
            {fabricantes.map((f) => (
              <ItemColuna
                key={f.id}
                ativo={f.id === fabricante?.id}
                onClick={() => escolherFabricante(f.id)}
                titulo={f.nome}
                detalhe={`${f.pais} · ${contar(modelos, 'fabricanteId', f.id, 'modelo', 'modelos')}`}
              />
            ))}
            <BotaoNovo onClick={() => setModal('fabricante')}>+ Fabricante</BotaoNovo>
          </div>
        </Card>

        <Card className="p-4">
          <p className="mb-3 text-xs font-bold tracking-wide text-stone-400">MODELO · {fabricante?.nome?.toUpperCase() ?? '—'}</p>
          <div className="space-y-1">
            {modelosDoFabricante.length === 0 && <p className="px-3 py-4 text-sm text-stone-400">Nenhum modelo cadastrado.</p>}
            {modelosDoFabricante.map((m) => (
              <ItemColuna
                key={m.id}
                ativo={m.id === modelo?.id}
                onClick={() => setModeloSel(m.id)}
                titulo={m.nome}
                detalhe={contar(geracoes, 'modeloId', m.id, 'geração', 'gerações')}
              />
            ))}
            {fabricante && <BotaoNovo onClick={() => setModal('modelo')}>+ Modelo</BotaoNovo>}
          </div>
        </Card>

        <Card className="col-span-2 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold tracking-wide text-stone-400">
              GERAÇÕES · {modelo ? `${fabricante.nome} ${modelo.nome}`.toUpperCase() : '—'}
            </p>
            {modelo && (
              <button onClick={() => setModal('geracao')} className="text-xs font-semibold text-brand-600 hover:text-brand-800">
                + Geração
              </button>
            )}
          </div>
          <div className="space-y-3">
            {modelo && geracoesDoModelo.length === 0 && <p className="px-3 py-4 text-sm text-stone-400">Nenhuma geração cadastrada.</p>}
            {geracoesDoModelo.map((g) => (
              <div key={g.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-900">{g.nome}</p>
                    <p className="text-xs text-stone-500">
                      {[g.periodo, g.normaNome, g.motor && `Motor ${g.motor}`, g.cambio].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-stone-400">
                    {verFrota && `${contar(veiculos, 'geracaoId', g.id, 'caminhão', 'caminhões')} · `}
                    {contar(intervalos, 'geracaoId', g.id, 'intervalo', 'intervalos')}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {g.potencias.map((p) => (
                    <span key={p.id} className="rounded-full bg-mist-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">{p.cv} cv</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <FabricanteModal
        open={modal === 'fabricante'}
        onClose={() => setModal(null)}
        onSalvo={(f) => { escolherFabricante(f.id); recarregar() }}
      />
      {modal === 'modelo' && (
        <ModeloModal
          valoresIniciais={{ fabricanteId: fabricante?.id }}
          onClose={() => setModal(null)}
          onSalvo={(m) => { setFabricanteSel(m.fabricanteId); setModeloSel(m.id); recarregar() }}
        />
      )}
      {modal === 'geracao' && (
        <GeracaoModal
          valoresIniciais={{ modeloId: modelo?.id }}
          onClose={() => setModal(null)}
          onSalvo={(g) => { setFabricanteSel(g.fabricanteId); setModeloSel(g.modeloId); recarregar() }}
        />
      )}
    </>
  )
}

function ItemColuna({ ativo, onClick, titulo, detalhe }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition ${
        ativo ? 'bg-brand-50 text-brand-800' : 'hover:bg-stone-50'
      }`}
    >
      <span>
        <span className="block text-sm font-semibold">{titulo}</span>
        <span className="block text-xs text-stone-400">{detalhe}</span>
      </span>
      <span className="text-stone-300">›</span>
    </button>
  )
}

function BotaoNovo({ onClick, children }) {
  return (
    <button onClick={onClick} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-brand-600 hover:bg-brand-50">
      {children}
    </button>
  )
}
