import { useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Toggle, Button, MensagemErro } from '../ui/Form'
import { SelecaoMultipla } from '../ui/SelecaoMultipla'
import { formatKm, hoje, ANO_MINIMO } from '../../data/domain'
import { ordemServicoService, tipoManutencaoService, mecanicoService, usuarioService, veiculoService, filtro } from '../../services'
import { useCarga } from '../../hooks/useCarga'
import { obterUsuario } from '../../services/sessao'
import { pode, ehAutonomo } from '../../data/acesso'
import { ORIGENS_INTERVALO } from '../../data/intervalos'

const porNome = (a, b) => a.nome.localeCompare(b.nome)

// Lançar ou corrigir uma ordem de serviço: um ou mais itens trocados e um ou mais mecânicos.
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

  // Listas do formulário. Na correção, os mecânicos e o motorista da OS entram mesmo se já estiverem inativos.
  const listas = useCarga(async () => {
    const [veiculos, tiposManutencao, mecanicos, motoristas] = await Promise.all([
      escolhePlaca ? veiculoService.listar(filtro.ativos()) : [],
      tipoManutencaoService.listar(),
      mecanicoService.listar(filtro.ativos()),
      usuarioService.listarMotoristas(),
    ])
    for (const mecanico of registro?.mecanicos ?? []) {
      if (!mecanicos.some((m) => m.id === mecanico.id)) mecanicos.push(mecanico)
    }
    if (registro?.motoristaId && !motoristas.some((m) => m.id === registro.motoristaId)) {
      motoristas.push({ id: registro.motoristaId, nome: registro.motoristaNome })
    }
    return { veiculos: veiculos.sort((a, b) => a.placa.localeCompare(b.placa)), tiposManutencao, mecanicos: mecanicos.sort(porNome), motoristas }
  })
  const veiculos = listas.dados?.veiculos ?? []
  const tiposManutencao = listas.dados?.tiposManutencao ?? []
  const mecanicos = listas.dados?.mecanicos ?? []
  const motoristas = listas.dados?.motoristas ?? []

  const [veiculoId, setVeiculoId] = useState(veiculo?.id ?? registro?.veiculoId ?? '')
  const [form, setForm] = useState(() => ({
    mecanicoIds: registro?.mecanicos.map((m) => m.id) ?? [],
    // No atalho do caminhão, já vem quem está com ele (se ainda estiver ativo)
    motoristaId: registro?.motoristaId ?? veiculo?.motoristaId ?? '',
    kmNaTroca: String(registro?.kmNaTroca ?? veiculo?.kmAtual ?? ''),
    dataRealizacao: registro?.dataRealizacao ?? hoje(),
    concessionaria: registro?.concessionaria ?? '',
    observacoes: registro?.observacoes ?? '',
  }))
  // Itens escolhidos, na ordem em que entraram. isPrimeiraTroca null = segue a sugestão do caminhão
  const [itens, setItens] = useState(() => (registro?.itens ?? []).map((i) => ({ tipoId: i.tipoId, isPrimeiraTroca: i.isPrimeiraTroca })))
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Situação do caminhão, só ao lançar: o intervalo que vale para cada item (a dica) e se a próxima troca dele é a 1ª
  const situacao = useCarga(
    () => (veiculoId && !corrigindo ? veiculoService.obterSituacao(veiculoId) : Promise.resolve(null)),
    [veiculoId, corrigindo],
  )
  const doCaminhao = (tipoId) => situacao.dados?.itens.find((i) => i.tipoId === tipoId)
  const sugerePrimeira = (tipoId) => !corrigindo && !!doCaminhao(tipoId)?.isPrimeiraTroca
  const primeiraTroca = (item) => item.isPrimeiraTroca ?? sugerePrimeira(item.tipoId)

  // Motorista que não está na lista (ex.: o do caminhão foi desativado) fica "Sem motorista"
  const motoristaId = motoristas.some((m) => m.id === form.motoristaId) ? form.motoristaId : ''
  const erroCarga = listas.erro?.message ?? situacao.erro?.message
  const carregando = listas.carregando || situacao.carregando

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  // Trocar a placa já traz o km e o motorista atuais daquele caminhão, e a 1ª troca volta a seguir a sugestão
  function escolherCaminhao(id) {
    const escolhido = veiculos.find((v) => v.id === id)
    setVeiculoId(id)
    setForm((f) => ({ ...f, kmNaTroca: escolhido ? String(escolhido.kmAtual) : '', motoristaId: escolhido?.motoristaId ?? '' }))
    setItens((atuais) => atuais.map((i) => ({ ...i, isPrimeiraTroca: null })))
  }

  // O item que já estava continua com a marca de 1ª troca dele; o novo segue a sugestão
  function escolherItens(tipoIds) {
    setItens((atuais) => tipoIds.map((tipoId) => atuais.find((i) => i.tipoId === tipoId) ?? { tipoId, isPrimeiraTroca: null }))
  }

  function marcarPrimeiraTroca(tipoId, isPrimeiraTroca) {
    setItens((atuais) => atuais.map((i) => (i.tipoId === tipoId ? { ...i, isPrimeiraTroca } : i)))
  }

  async function salvar() {
    const km = Number(form.kmNaTroca)
    if (!veiculoId) { setErro('Escolha o caminhão.'); return }
    if (itens.length === 0) { setErro('Escolha pelo menos um item trocado.'); return }
    if (form.mecanicoIds.length === 0) { setErro(autonomo ? 'Escolha pelo menos uma oficina ou mecânico.' : 'Escolha pelo menos um mecânico.'); return }
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
      // A próxima troca de cada item a API calcula pelo intervalo que vale (caminhão → empresa → fábrica → padrão).
      // O km da OS atualiza o km do caminhão quando é maior que o atual. Ao lançar, o motorista
      // escolhido vira o motorista atual do caminhão (na correção, não).
      const dados = {
        ...form,
        veiculoId,
        motoristaId,
        kmNaTroca: km,
        itens: itens.map((i) => ({ tipoId: i.tipoId, isPrimeiraTroca: primeiraTroca(i) })),
        concessionaria: form.concessionaria.trim() || null,
        observacoes: form.observacoes.trim() || null,
      }
      if (corrigindo) await ordemServicoService.atualizar(registro.id, dados)
      else await ordemServicoService.criar(dados)
      onSalvo()
      onClose()
    } catch (e) {
      setErro(e.message)
      setSalvando(false)
    }
  }

  return (
    <Modal
      onClose={onClose}
      eyebrow={corrigindo ? `PUT /api/OrdemServico/${registro.id}` : 'POST /api/OrdemServico'}
      title={corrigindo ? `Corrigir OS nº ${registro.id}` : 'Lançar ordem de serviço'}
      subtitle={corrigindo ? registro.placa : veiculo?.placa ?? 'Escolha o caminhão'}
      width="max-w-xl"
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
        {listas.carregando && <p className="text-sm text-stone-400">Carregando tipos, mecânicos e motoristas…</p>}
        <MensagemErro>{erroCarga}</MensagemErro>

        {escolhePlaca && (
          <Field label="Caminhão" required>
            <Select value={veiculoId} onChange={(e) => escolherCaminhao(e.target.value)}>
              <option value="">Escolha a placa</option>
              {veiculos.map((v) => <option key={v.id} value={v.id}>{v.placa}</option>)}
            </Select>
          </Field>
        )}

        <Field
          label="Itens trocados"
          required
          group
          hint="A próxima troca de cada item é calculada pelo intervalo do caminhão, da empresa, de fábrica ou pelo padrão."
        >
          <SelecaoMultipla
            opcoes={tiposManutencao}
            selecionados={itens.map((i) => i.tipoId)}
            onChange={escolherItens}
            placeholder="Escolha o que foi trocado"
          />
          {itens.length > 0 && (
            <div className="mt-2 divide-y divide-stone-100 rounded-lg bg-stone-50 px-3">
              {itens.map((item) => {
                const intervalo = doCaminhao(item.tipoId)
                return (
                  <div key={item.tipoId} className="flex items-center justify-between gap-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{tiposManutencao.find((t) => t.id === item.tipoId)?.nome}</p>
                      {intervalo && (
                        <p className="text-xs text-stone-400">
                          Vale o intervalo {ORIGENS_INTERVALO[intervalo.origemIntervalo]}: {formatKm(intervalo.intervaloKm)}
                        </p>
                      )}
                    </div>
                    <Toggle
                      checked={primeiraTroca(item)}
                      onChange={(v) => marcarPrimeiraTroca(item.tipoId, v)}
                      label={sugerePrimeira(item.tipoId) ? '1ª troca (sugerido)' : '1ª troca'}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </Field>

        <Field label={autonomo ? 'Oficina ou mecânico' : 'Mecânicos'} required group hint="Pode escolher mais de um. Quem fez o quê, se precisar, vai nas observações.">
          <SelecaoMultipla
            opcoes={mecanicos.map((m) => ({ id: m.id, nome: `${m.nome} (${m.funcao})` }))}
            selecionados={form.mecanicoIds}
            onChange={(ids) => set('mecanicoIds', ids)}
            placeholder={autonomo ? 'Escolha onde ou com quem fez a troca' : 'Escolha quem fez a troca'}
          />
          {!listas.carregando && mecanicos.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-600">
              {autonomo ? 'Nada cadastrado. Cadastre a oficina ou o mecânico em Oficinas e mecânicos.'
                : podeCadastrarMecanico ? 'Nenhum mecânico cadastrado. Cadastre em Cadastros → Mecânicos.' : 'Nenhum mecânico cadastrado. Peça para quem cuida dos cadastros.'}
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
            <Select value={motoristaId} onChange={(e) => set('motoristaId', e.target.value)}>
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

        <Field label="Concessionária / oficina">
          <Input value={form.concessionaria} onChange={(e) => set('concessionaria', e.target.value)} placeholder="Opcional" />
        </Field>

        <Field label="Observações">
          <Input value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Opcional" />
        </Field>

        <MensagemErro>{erro}</MensagemErro>
      </div>
    </Modal>
  )
}
