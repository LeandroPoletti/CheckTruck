import { useEffect, useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Toggle, Button } from '../ui/Form'
import { formatKm, getUltimoRegistro, hoje, ANO_MINIMO } from '../../data/domain'
import {
  manutencaoService, tipoManutencaoService, intervaloVeiculoService, mecanicoService, usuarioService, veiculoService, filtro,
} from '../../services'
import MecanicoModal from './MecanicoModal'
import { obterUsuario } from '../../services/sessao'
import { pode, ehAutonomo } from '../../data/acesso'
import { ORIGENS_INTERVALO } from '../../data/intervalos'

const LISTAS_VAZIAS = { veiculos: [], tiposManutencao: [], mecanicos: [], motoristas: [] }

// Lançar ou corrigir uma ordem de serviço. Quem abre a tela só renderiza este modal quando ele está aberto.
// No Autônomo não tem motorista (é o dono) e o mecânico aparece como "oficina ou mecânico".
//   veiculo  → lançar no caminhão já escolhido (atalho na tela do caminhão)
//   registro → corrigir uma OS (o caminhão não muda; "lançada por" continua o original)
//   nenhum   → lançar escolhendo a placa (tela Ordens de serviço)
export default function OrdemServicoModal({ veiculo, registro, onClose, onSalvo }) {
  const corrigindo = !!registro
  const escolhePlaca = !veiculo && !corrigindo
  const usuario = obterUsuario()
  const podeCadastrarMecanico = pode(usuario, 'Cadastros')
  const autonomo = ehAutonomo(usuario)

  const [listas, setListas] = useState(LISTAS_VAZIAS)
  const { veiculos, tiposManutencao, mecanicos, motoristas } = listas
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState(null)
  const [veiculoId, setVeiculoId] = useState(veiculo?.id ?? registro?.veiculoId ?? '')
  const [form, setForm] = useState(() => ({
    tipoId: registro?.tipoId ?? '',
    mecanicoId: registro?.mecanicoId ?? '',
    motoristaId: registro?.motoristaId ?? '',
    kmNaTroca: String(registro?.kmNaTroca ?? veiculo?.kmAtual ?? ''),
    dataRealizacao: registro?.dataRealizacao ?? hoje(),
    isPrimeiraTroca: registro?.isPrimeiraTroca ?? null, // null = segue a sugestão (sem histórico do item)
    concessionaria: registro?.concessionaria ?? '',
    observacoes: registro?.observacoes ?? '',
  }))
  const [novoMecanicoOpen, setNovoMecanicoOpen] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  // Listas do formulário. Na correção, mecânico e motorista da OS entram mesmo se já estiverem inativos.
  useEffect(() => {
    let cancelado = false
    Promise.all([
      escolhePlaca ? veiculoService.listar(filtro.ativos()) : [],
      tipoManutencaoService.listar(),
      mecanicoService.listar(filtro.ativos()),
      usuarioService.listarMotoristas(),
    ])
      .then(([veiculos, tiposManutencao, mecanicos, motoristas]) => {
        if (cancelado) return
        if (registro && !mecanicos.some((m) => m.id === registro.mecanicoId)) {
          mecanicos.push({ id: registro.mecanicoId, nome: registro.mecanicoNome, funcao: registro.mecanicoFuncao })
        }
        if (registro?.motoristaId && !motoristas.some((m) => m.id === registro.motoristaId)) {
          motoristas.push({ id: registro.motoristaId, nome: registro.motoristaNome })
        }
        setListas({
          veiculos: veiculos.sort((a, b) => a.placa.localeCompare(b.placa)),
          tiposManutencao,
          mecanicos: mecanicos.sort((a, b) => a.nome.localeCompare(b.nome)),
          motoristas,
        })
        // Atalho do caminhão: o motorista já vem marcado com quem está com ele (se ainda estiver ativo)
        if (veiculo && motoristas.some((m) => m.id === veiculo.motoristaId)) {
          setForm((f) => ({ ...f, motoristaId: veiculo.motoristaId }))
        }
      })
      .catch((e) => { if (!cancelado) setErroCarga(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [escolhePlaca, registro, veiculo])

  // Intervalos do caminhão (dica de qual intervalo vale) e histórico dele (sugere 1ª troca), só ao lançar
  const [doCaminhao, setDoCaminhao] = useState({ veiculoId: null, intervalos: [], registros: [] })
  useEffect(() => {
    if (corrigindo || !veiculoId) return
    let cancelado = false
    Promise.all([
      intervaloVeiculoService.tabela(veiculoId),
      manutencaoService.listar(filtro.porId('Veiculo', veiculoId)),
    ])
      .then(([intervalos, registros]) => { if (!cancelado) setDoCaminhao({ veiculoId, intervalos, registros }) })
      .catch((e) => { if (!cancelado) setErroCarga(e.message) })
    return () => { cancelado = true }
  }, [corrigindo, veiculoId])

  const historicoPronto = doCaminhao.veiculoId === veiculoId
  // O primeiro da lista é o intervalo que vale para esse item no caminhão
  const intervaloQueVale = historicoPronto ? doCaminhao.intervalos.find((l) => l.tipoId === form.tipoId)?.emOrdem[0] : null
  const sugerePrimeira = !corrigindo && historicoPronto && !!form.tipoId
    && !getUltimoRegistro(veiculoId, form.tipoId, doCaminhao.registros)
  const primeiraTroca = form.isPrimeiraTroca ?? sugerePrimeira

  // Trocar a placa já traz o km e o motorista atuais daquele caminhão (e volta a seguir a sugestão da 1ª troca)
  function escolherCaminhao(id) {
    const escolhido = veiculos.find((v) => v.id === id)
    setVeiculoId(id)
    setForm((f) => ({
      ...f,
      isPrimeiraTroca: null,
      kmNaTroca: escolhido ? String(escolhido.kmAtual) : '',
      motoristaId: escolhido && motoristas.some((m) => m.id === escolhido.motoristaId) ? escolhido.motoristaId : '',
    }))
  }

  // Outro item: volta a seguir a sugestão da 1ª troca
  function escolherTipo(id) {
    setForm((f) => ({ ...f, tipoId: id, isPrimeiraTroca: null }))
  }

  // Mecânico cadastrado aqui mesmo: entra na lista e já fica selecionado
  function handleMecanicoCriado(novo) {
    if (!novo) return
    setListas((l) => ({ ...l, mecanicos: [...l.mecanicos, novo].sort((a, b) => a.nome.localeCompare(b.nome)) }))
    set('mecanicoId', novo.id)
  }

  async function salvar() {
    const km = Number(form.kmNaTroca)
    if (!veiculoId) { setErro('Escolha o caminhão.'); return }
    if (!form.tipoId) { setErro('Selecione o tipo de manutenção.'); return }
    if (!form.mecanicoId) { setErro(autonomo ? 'Escolha a oficina ou o mecânico.' : 'Escolha o mecânico que fez a troca.'); return }
    // OS antiga pode ter km menor que o atual; só não aceita km inválido
    if (form.kmNaTroca === '' || !Number.isInteger(km) || km < 0) { setErro('Informe o km do caminhão na troca (sem negativo).'); return }
    // A troca já foi feita: a data vai de 1900 até hoje
    if (!form.dataRealizacao || form.dataRealizacao < `${ANO_MINIMO}-01-01` || form.dataRealizacao > hoje()) {
      setErro(`A data da troca vai de ${ANO_MINIMO} até hoje.`)
      return
    }

    setSalvando(true)
    setErro('')
    try {
      // Próxima troca (km e data) em branco: a API calcula pelo intervalo que vale (caminhão → empresa → fábrica → padrão).
      // O km da OS atualiza o km do caminhão quando é maior que o atual. Ao lançar, o motorista
      // escolhido vira o motorista atual do caminhão (na correção, não).
      const dados = {
        ...form,
        veiculoId,
        kmNaTroca: km,
        kmProximaTroca: 0,
        dataProximaTroca: null,
        isPrimeiraTroca: primeiraTroca,
        concessionaria: form.concessionaria.trim() || null,
        observacoes: form.observacoes.trim() || null,
      }
      if (corrigindo) await manutencaoService.atualizar(registro.id, dados)
      else await manutencaoService.criar(dados)
      onSalvo()
      onClose()
    } catch (e) {
      setErro(e.message)
      setSalvando(false)
    }
  }

  return (
    <>
    <Modal
      open
      onClose={onClose}
      eyebrow={corrigindo ? `PUT /api/Manutencao/${registro.id}` : 'POST /api/Manutencao'}
      title={corrigindo ? `Corrigir OS nº ${registro.id}` : 'Lançar ordem de serviço'}
      subtitle={corrigindo ? registro.placa : veiculo?.placa ?? 'Escolha o caminhão'}
      width="max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} disabled={salvando || carregando || !!erroCarga}>
            {salvando ? 'Salvando…' : corrigindo ? 'Salvar correção' : 'Lançar OS'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {carregando && <p className="text-sm text-stone-400">Carregando tipos, mecânicos e motoristas…</p>}
        {erroCarga && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erroCarga}</p>}

        {escolhePlaca && (
          <Field label="Caminhão" required>
            <Select value={veiculoId} onChange={(e) => escolherCaminhao(e.target.value)}>
              <option value="">Escolha a placa</option>
              {veiculos.map((v) => <option key={v.id} value={v.id}>{v.placa}</option>)}
            </Select>
          </Field>
        )}

        <Field label="Tipo de manutenção" required>
          <Select value={form.tipoId} onChange={(e) => escolherTipo(e.target.value)}>
            <option value="">Selecione</option>
            {tiposManutencao.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </Select>
          <p className="mt-1.5 text-xs text-stone-400">
            {intervaloQueVale
              ? <>Vale o intervalo {ORIGENS_INTERVALO[intervaloQueVale.origem]}: {formatKm(intervaloQueVale.intervaloKm)}</>
              : 'A próxima troca é calculada pelo intervalo do caminhão, da empresa, de fábrica ou pelo padrão.'}
          </p>
        </Field>

        <Field label={autonomo ? 'Oficina ou mecânico' : 'Mecânico'} required>
          <div className="flex gap-2">
            <Select value={form.mecanicoId} onChange={(e) => set('mecanicoId', e.target.value)} className="flex-1">
              <option value="">{autonomo ? 'Selecione onde ou com quem fez a troca' : 'Selecione quem fez a troca'}</option>
              {mecanicos.map((m) => (
                <option key={m.id} value={m.id}>{m.nome} — {m.funcao}</option>
              ))}
            </Select>
            {podeCadastrarMecanico && (
              <Button type="button" variant="secondary" onClick={() => setNovoMecanicoOpen(true)}>+ Novo</Button>
            )}
          </div>
          {!carregando && mecanicos.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-600">
              {autonomo ? 'Nada cadastrado. Use “+ Novo” para cadastrar a oficina ou o mecânico.'
                : podeCadastrarMecanico ? 'Nenhum mecânico cadastrado. Use “+ Novo” para cadastrar.' : 'Nenhum mecânico cadastrado. Peça para quem cuida dos cadastros.'}
            </p>
          )}
        </Field>

        {!autonomo && (
          <Field
            label="Motorista"
            hint={corrigindo
              ? 'Quem estava com o caminhão. Corrigir a OS não muda o motorista atual do caminhão.'
              : 'Quem estava com o caminhão. Se escolher alguém, ele vira o motorista atual do caminhão.'}
          >
            <Select value={form.motoristaId} onChange={(e) => set('motoristaId', e.target.value)}>
              <option value="">Sem motorista</option>
              {motoristas.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </Select>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Km na troca" required>
            <Input type="number" min="0" value={form.kmNaTroca} onChange={(e) => set('kmNaTroca', e.target.value)} />
          </Field>
          <Field label="Data da realização" required>
            <Input type="date" min={`${ANO_MINIMO}-01-01`} max={hoje()} value={form.dataRealizacao} onChange={(e) => set('dataRealizacao', e.target.value)} />
          </Field>
        </div>

        <Toggle
          checked={primeiraTroca}
          onChange={(v) => set('isPrimeiraTroca', v)}
          label={sugerePrimeira ? 'Primeira troca (sugerido — sem histórico anterior)' : 'Marcar como primeira troca (amaciamento)'}
        />

        <Field label="Concessionária / oficina">
          <Input value={form.concessionaria} onChange={(e) => set('concessionaria', e.target.value)} placeholder="Opcional" />
        </Field>

        <Field label="Observações">
          <Input value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Opcional" />
        </Field>

        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </div>
    </Modal>
    {/* Fora do modal da OS para abrir por cima dele */}
    <MecanicoModal open={novoMecanicoOpen} onClose={() => setNovoMecanicoOpen(false)} onSalvo={handleMecanicoCriado} />
    </>
  )
}
