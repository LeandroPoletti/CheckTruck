import { useState } from 'react'
import { intervaloService } from '../../services'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Button } from '../ui/Form'

// Intervalo de um item para um modelo: km, km da 1ª troca (amaciamento) e prazo em meses.
// intervalo = null cria; senão edita (o item não muda). tipos = itens que ainda não têm intervalo no modelo.
// Quem abre a tela só renderiza este modal quando ele está aberto, então o formulário já nasce com os dados certos.
export default function IntervaloModal({ modelo, intervalo, tipos, nomeDoTipo, onClose, onSalvo }) {
  const editando = !!intervalo
  const [form, setForm] = useState(() => ({
    tipoId: intervalo?.tipoId ?? tipos[0]?.id ?? '',
    intervaloKm: intervalo?.intervaloKm ?? '',
    intervaloKmPrimeira: intervalo?.intervaloKmPrimeira ?? '',
    intervaloMeses: intervalo?.intervaloMeses ?? '',
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
    if (!form.tipoId) { setErro('Escolha o tipo de manutenção.'); return }
    if (!Number.isInteger(km) || km <= 0) { setErro('Informe o intervalo em km.'); return }
    if (!Number.isInteger(primeira) || primeira < 0) { setErro('O km da 1ª troca não pode ser negativo.'); return }
    if (!Number.isInteger(meses) || meses < 0 || meses > 120) { setErro('O prazo vai de 0 a 120 meses.'); return }

    setSalvando(true)
    setErro('')
    try {
      const dados = { ...form, modeloId: modelo.id, fonte: form.fonte.trim(), observacao: form.observacao.trim() }
      if (editando) await intervaloService.atualizar(intervalo.id, dados)
      else await intervaloService.criar(dados)
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
      title={editando ? 'Editar intervalo' : 'Novo intervalo'}
      subtitle={editando ? `${modelo.nome} · ${nomeDoTipo(intervalo.tipoId)}` : modelo.nome}
      width="max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        {!editando && (
          <Field label="Tipo de manutenção" required>
            <Select value={form.tipoId} onChange={(e) => set('tipoId', e.target.value)}>
              {tipos.map((t) => <option key={t.id} value={t.id}>{t.nome} · {t.componente}</option>)}
            </Select>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Intervalo (km)" required>
            <Input type="number" min="1" value={form.intervaloKm} onChange={(e) => set('intervaloKm', e.target.value)} placeholder="40000" />
          </Field>
          <Field label="1ª troca (km)" hint="Vazio = igual ao intervalo">
            <Input type="number" min="0" value={form.intervaloKmPrimeira} onChange={(e) => set('intervaloKmPrimeira', e.target.value)} placeholder="Amaciamento" />
          </Field>
        </div>

        <Field label="Prazo (meses)" hint="Vence pelo que chegar primeiro: km ou prazo. Vazio = vence só por km.">
          <Input type="number" min="0" max="120" value={form.intervaloMeses} onChange={(e) => set('intervaloMeses', e.target.value)} placeholder="6" />
        </Field>

        <Field label="Fonte">
          <Input value={form.fonte} onChange={(e) => set('fonte', e.target.value)} placeholder="Ex.: manual do fabricante, plano da concessionária" />
        </Field>

        <Field label="Observação">
          <Input value={form.observacao} onChange={(e) => set('observacao', e.target.value)} placeholder="Opcional" />
        </Field>

        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </div>
    </Modal>
  )
}
