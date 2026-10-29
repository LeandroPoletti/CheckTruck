import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader, Tabela, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { Button, CampoBusca, Select } from '../components/ui/Form'
import { PlacaBadge, SeloPrimeiraTroca } from '../components/ui/Badges'
import AcoesLinha from '../components/ui/AcoesLinha'
import FiltroPeriodo from '../components/ui/FiltroPeriodo'
import VerMais from '../components/ui/VerMais'
import OrdemServicoModal from '../components/modals/OrdemServicoModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { ordemServicoService, tipoManutencaoService } from '../services'
import { useCarga, useCargaDaTela } from '../hooks/useCarga'
import { obterUsuario } from '../services/sessao'
import { pode } from '../data/acesso'
import { formatKm, formatData, formatDataHora } from '../data/domain'
import { TODO_O_PERIODO, limitesDoPeriodo } from '../data/periodo'
import { POR_VEZ } from '../data/pagina'

// As ordens de serviço da frota, da mais nova para a mais velha, com busca e filtros de tipo e de período. A API
// filtra e manda 50 de cada vez (Ver mais). Ver: Ver frota. Lançar, corrigir e excluir: Ordem de serviço.
export default function OrdensServico() {
  const navigate = useNavigate()
  const usuario = obterUsuario()
  const podeMexer = pode(usuario, 'OrdemServico')

  const [busca, setBusca] = useState('')
  const [buscaEnviada, setBuscaEnviada] = useState('')
  const [tipo, setTipo] = useState('')
  const [periodo, setPeriodo] = useState(TODO_O_PERIODO)
  const [quantos, setQuantos] = useState(POR_VEZ)
  const [modal, setModal] = useState(null) // { registro } (null ao lançar) enquanto o modal está aberto
  const [excluindo, setExcluindo] = useState(null)

  // A busca vai para a API quando a pessoa para de digitar. Filtro novo volta para as 50 primeiras
  useEffect(() => {
    const espera = setTimeout(() => {
      setBuscaEnviada(busca.trim())
      setQuantos(POR_VEZ)
    }, 400)
    return () => clearTimeout(espera)
  }, [busca])

  const [de, ate] = limitesDoPeriodo(periodo)
  const filtros = { tipoId: tipo || null, busca: buscaEnviada || null, de, ate }
  const comFiltro = Object.values(filtros).some(Boolean)
  const chaveDosFiltros = JSON.stringify(filtros)

  const { dados, carregando, erro, recarregar, tentarNovamente } = useCargaDaTela(async () => {
    const [pagina, todas] = await Promise.all([
      ordemServicoService.listarPagina(filtros, quantos),
      comFiltro ? ordemServicoService.listarPagina({}, 0) : null,
    ])
    return { ...pagina, lancadas: (todas ?? pagina).total }
  }, [chaveDosFiltros, quantos], { manter: 'ordens' })
  const { dados: tipos = [] } = useCarga(() => tipoManutencaoService.listar())

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

  const { itens: ordens, total, lancadas } = dados
  return (
    <>
      <PageHeader
        title="Ordens de serviço"
        subtitle={`${lancadas} lançada${lancadas === 1 ? '' : 's'} · trocas feitas nos caminhões da frota`}
        action={podeMexer && <Button onClick={() => setModal({ registro: null })}><Plus size={16} /> Lançar OS</Button>}
      />

      <div className="mb-3 flex gap-3">
        <CampoBusca value={busca} onChange={setBusca} placeholder="Buscar por placa ou nº da OS" className="flex-1" />
        <Select value={tipo} onChange={(e) => { setTipo(e.target.value); setQuantos(POR_VEZ) }} className="w-64">
          <option value="">Tipo: todos</option>
          {[...tipos].sort((a, b) => a.nome.localeCompare(b.nome)).map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </Select>
      </div>
      <FiltroPeriodo valor={periodo} onChange={(novo) => { setPeriodo(novo); setQuantos(POR_VEZ) }} quantas={total} className="mb-5" />

      {ordens.length === 0 ? (
        <EmptyState
          title={lancadas === 0 ? 'Nenhuma OS lançada' : 'Nenhuma OS encontrada'}
          action={lancadas === 0 && podeMexer && <Button onClick={() => setModal({ registro: null })}>Lançar OS</Button>}
        />
      ) : (
        <Tabela colunas={['OS', 'Caminhão', 'Serviço', 'Km', 'Mecânicos', 'Lançada', podeMexer && '']}>
          {ordens.map((o) => (
            <tr key={o.id} className="align-top">
              <td className="px-5 py-3.5">
                <p className="font-semibold text-stone-800">nº {o.numero}</p>
                <p className="text-xs text-stone-400">{formatData(o.dataRealizacao)}</p>
              </td>
              <td className="px-5 py-3.5">
                <button onClick={() => navigate(`/veiculos/${o.veiculoId}`)}>
                  <PlacaBadge placa={o.placa} size="sm" />
                </button>
                <p className="mt-1 text-xs text-stone-400">{o.motoristaNome ?? 'Sem motorista'}</p>
              </td>
              <td className="px-5 py-3.5">
                {o.itens.map((i) => (
                  // Nome, "1ª troca" e a próxima troca: o que não cabe vai inteiro para a linha de baixo
                  <p key={i.tipoId} className="flex flex-wrap items-baseline gap-x-2 font-medium text-stone-800">
                    {i.tipoNome}
                    {i.isPrimeiraTroca && <SeloPrimeiraTroca />}
                    <span className="whitespace-nowrap text-xs font-normal text-stone-400">próx. {formatKm(i.kmProximaTroca)}</span>
                  </p>
                ))}
                {o.concessionaria && <p className="text-xs text-stone-400">{o.concessionaria}</p>}
              </td>
              <td className="whitespace-nowrap px-5 py-3.5 text-stone-700">{formatKm(o.kmNaTroca)}</td>
              <td className="px-5 py-3.5 text-stone-700">{o.mecanicos.map((m) => m.nome).join(', ')}</td>
              <td className="px-5 py-3.5">
                <p className="text-stone-700">{o.lancadoPorNome ?? '—'}</p>
                <p className="text-xs text-stone-400">{formatDataHora(o.lancadoEm)}</p>
              </td>
              {podeMexer && (
                <td className="px-5 py-3.5 text-right">
                  <AcoesLinha onEditar={() => setModal({ registro: o })} onExcluir={() => setExcluindo(o)} />
                </td>
              )}
            </tr>
          ))}
        </Tabela>
      )}
      <VerMais
        quantos={quantos}
        mostrando={ordens.length}
        total={total}
        onVerMais={setQuantos}
        dicaNoMaximo="Use a busca ou o período para achar as outras."
        className="mt-5"
      />

      {modal && <OrdemServicoModal registro={modal.registro} onClose={() => setModal(null)} onSalvo={recarregar} />}
      {excluindo && (
        <ConfirmarExclusaoModal
          onClose={() => setExcluindo(null)}
          titulo="Excluir ordem de serviço"
          descricao={`Excluir a OS nº ${excluindo.numero} (${excluindo.itens.map((i) => i.tipoNome).join(', ')}) do caminhão ${excluindo.placa}? Ela sai do histórico e a próxima troca desses itens volta a ser calculada pela OS anterior. Não dá para desfazer.`}
          onConfirmar={async () => {
            await ordemServicoService.remover(excluindo.id)
            recarregar()
          }}
        />
      )}
    </>
  )
}
