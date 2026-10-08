import { useEffect, useState } from 'react'
import { chamadoService } from '../../services'
import { Modal } from '../ui/Overlay'
import { Field, Select, Textarea, Button } from '../ui/Form'
import { TIPOS_OCORRENCIA, URGENCIAS } from '../../data/chamados'

// Abrir chamado (chamado = null) ou editar um pendente. Quem abre a tela só renderiza este modal
// quando ele está aberto, então o formulário já nasce com os dados certos.
// O caminhão só se escolhe ao abrir: caminhão errado = exclui e abre outro.
export default function ChamadoModal({ chamado, onClose, onSalvo }) {
  const editando = !!chamado
  const [veiculos, setVeiculos] = useState([])
  const [form, setForm] = useState(() => ({
    veiculoId: chamado?.veiculoId ?? '',
    tipo: chamado?.tipo ?? TIPOS_OCORRENCIA[0].id,
    urgencia: chamado?.urgencia ?? 'Media',
    descricao: chamado?.descricao ?? '',
  }))
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Placas para escolher (só ao abrir)
  useEffect(() => {
    if (editando) return
    let cancelado = false
    chamadoService.listarVeiculos()
      .then((lista) => { if (!cancelado) setVeiculos(lista) })
      .catch((e) => { if (!cancelado) setErro(`Não foi possível carregar os caminhões: ${e.message}`) })
    return () => { cancelado = true }
  }, [editando])

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function salvar() {
    if (!editando && !form.veiculoId) {
      setErro('Escolha o caminhão.')
      return
    }
    if (!form.descricao.trim()) {
      setErro('Conte o que aconteceu.')
      return
    }
    setSalvando(true)
    setErro('')
    try {
      if (editando) await chamadoService.editar(chamado.id, form)
      else await chamadoService.abrir(form)
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
      title={editando ? 'Editar chamado' : 'Abrir chamado'}
      subtitle={editando ? `Caminhão ${chamado.placa}` : 'Conte o que está acontecendo com o caminhão'}
      width="max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} disabled={salvando}>
            {salvando ? 'Enviando…' : editando ? 'Salvar' : 'Abrir chamado'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!editando && (
          <Field label="Caminhão" required>
            <Select value={form.veiculoId} onChange={(e) => set('veiculoId', e.target.value)}>
              <option value="">Escolha a placa</option>
              {veiculos.map((v) => <option key={v.id} value={v.id}>{v.placa}</option>)}
            </Select>
          </Field>
        )}

        <Field label="Tipo de ocorrência" required>
          <Select value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
            {TIPOS_OCORRENCIA.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </Select>
        </Field>

        <Field label="Urgência" required>
          <div className="grid grid-cols-3 gap-2">
            {URGENCIAS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => set('urgencia', u.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  form.urgencia === u.id ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-stone-300 text-stone-500'
                }`}
              >
                {u.nome}
              </button>
            ))}
          </div>
        </Field>

        <Field label="O que aconteceu?" required>
          <Textarea
            rows={4}
            value={form.descricao}
            onChange={(e) => set('descricao', e.target.value)}
            placeholder="Quando começou, o que você percebeu, em que situação acontece..."
          />
        </Field>

        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </div>
    </Modal>
  )
}
