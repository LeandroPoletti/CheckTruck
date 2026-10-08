import { useState } from 'react'
import { intervaloService, intervaloVeiculoService } from '../../services'
import { Modal } from '../ui/Overlay'
import { Field, Input, Button } from '../ui/Form'
import { nomeDoModelo } from '../../data/domain'

// Intervalo de um item para uma geração (geracao) ou para um caminhão só (veiculo). O item (tipo) é fixo.
// intervalo = o que já existe (editar); sem ele, define um novo começando pela sugestão (o que vale hoje).
// O da geração também tem km da 1ª troca (amaciamento) e fonte. Quem abre a tela só renderiza este modal quando ele está aberto.
export default function IntervaloModal({ geracao, veiculo, tipo, intervalo, sugestao, onClose, onSalvo }) {
  const daGeracao = !!geracao
  const base = intervalo ?? sugestao
  const [form, setForm] = useState(() => ({
    intervaloKm: base?.intervaloKm ?? '',
    intervaloKmPrimeira: intervalo?.intervaloKmPrimeira ?? '',
    intervaloMeses: base?.intervaloMeses ?? '',
    fonte: intervalo?.fonte ?? '',
    observacao: intervalo?.observacao ?? '',
  }))
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function salvar() {
    const km = Number(form.intervaloKm)
    const primeira = Number(form.intervaloKmPrimeira || 0)
    const meses = Number(form.intervaloMeses || 0)
    if (!Number.isInteger(km) || km <= 0) { setErro('Informe o intervalo em km.'); return }
    if (!Number.isInteger(primeira) || primeira < 0) { setErro('O km da 1ª troca não pode ser negativo.'); return }
    if (!Number.isInteger(meses) || meses < 0 || meses > 120) { setErro('O prazo vai de 0 a 120 meses.'); return }

    setSalvando(true)
    setErro('')
    try {
      const dados = { ...form, tipoId: tipo.id, fonte: form.fonte.trim(), observacao: form.observacao.trim() }
      const servico = daGeracao ? intervaloService : intervaloVeiculoService
      const alvo = daGeracao ? { geracaoId: geracao.id } : { veiculoId: veiculo.id }
      if (intervalo) await servico.atualizar(intervalo.id, { ...dados, ...alvo })
      else await servico.criar({ ...dados, ...alvo })
      onSalvo()
      onClose()
    } catch (e) {
      setErro(e.message)
      setSalvando(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={intervalo ? 'Editar intervalo' : daGeracao ? 'Definir intervalo da geração' : 'Definir intervalo do caminhão'}
      subtitle={`${daGeracao ? `${nomeDoModelo(geracao)} · ${geracao.nome}` : veiculo.placa} · ${tipo.nome}`}
      width="max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        {!intervalo && sugestao && (
          <p className="rounded-lg bg-mist-100 px-3 py-2 text-xs text-brand-800">
            Os valores começam pelo que vale hoje. Ajuste se o plano for diferente.
          </p>
        )}

        <div className={daGeracao ? 'grid grid-cols-2 gap-3' : ''}>
          <Field label="Intervalo (km)" required>
            <Input type="number" min="1" value={form.intervaloKm} onChange={(e) => set('intervaloKm', e.target.value)} placeholder="40000" />
          </Field>
          {daGeracao && (
            <Field label="1ª troca (km)" hint="Vazio = igual ao intervalo">
              <Input type="number" min="0" value={form.intervaloKmPrimeira} onChange={(e) => set('intervaloKmPrimeira', e.target.value)} placeholder="Amaciamento" />
            </Field>
          )}
        </div>

        <Field label="Prazo (meses)" hint="Vence pelo que chegar primeiro: km ou prazo. Vazio = vence só por km.">
          <Input type="number" min="0" max="120" value={form.intervaloMeses} onChange={(e) => set('intervaloMeses', e.target.value)} placeholder="6" />
        </Field>

        {daGeracao && (
          <Field label="Fonte">
            <Input value={form.fonte} onChange={(e) => set('fonte', e.target.value)} placeholder="Ex.: manual do fabricante" />
          </Field>
        )}

        <Field label="Observação">
          <Input
            value={form.observacao}
            onChange={(e) => set('observacao', e.target.value)}
            placeholder={daGeracao ? 'Opcional' : 'Ex.: plano da concessionária'}
          />
        </Field>

        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </div>
    </Modal>
  )
}
