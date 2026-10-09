import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Button } from '../ui/Form'
import { geracaoService, modeloService } from '../../services'
import { NORMAS, ANO_MINIMO, ANO_MAXIMO, anoValido } from '../../data/domain'

const CV_MIN = 100
const CV_MAX = 1000

// Geração = época de um modelo (anos, norma, motor, câmbio) com as potências em que foi vendida.
// Quem abre a tela só renderiza este modal quando ele está aberto.
// registro: geração em edição · valoresIniciais: pré-seleção (ex.: { modeloId } vindo do Catálogo)
export default function GeracaoModal({ registro, valoresIniciais, onClose, onSalvo }) {
  const [form, setForm] = useState(() => ({
    nome: registro?.nome ?? '',
    modeloId: registro?.modeloId ?? valoresIniciais?.modeloId ?? '',
    anoInicio: registro?.anoInicio ?? '',
    anoFim: registro?.anoFim ?? '',
    norma: registro?.norma ?? '',
    motor: registro?.motor ?? '',
    cambio: registro?.cambio ?? '',
  }))
  const [potencias, setPotencias] = useState(() => registro?.potencias.map((p) => p.cv) ?? [])
  const [novaCv, setNovaCv] = useState('')
  const [modelos, setModelos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Modelos para o select, agrupados por fabricante
  useEffect(() => {
    let cancelado = false
    modeloService.listar()
      .then((lista) => {
        if (!cancelado) setModelos(lista.sort((a, b) => a.fabricanteNome.localeCompare(b.fabricanteNome) || a.nome.localeCompare(b.nome)))
      })
      .catch((e) => { if (!cancelado) setErro(`Não foi possível carregar os modelos: ${e.message}`) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [])
  const fabricantes = [...new Set(modelos.map((m) => m.fabricanteNome))]

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function adicionarPotencia() {
    const cv = Number(novaCv)
    if (!Number.isInteger(cv) || cv < CV_MIN || cv > CV_MAX) { setErro(`A potência vai de ${CV_MIN} a ${CV_MAX} cv.`); return }
    if (potencias.includes(cv)) { setErro(`${cv} cv já está na lista.`); return }
    setPotencias((lista) => [...lista, cv].sort((a, b) => a - b))
    setNovaCv('')
    setErro('')
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    const anoInicio = Number(form.anoInicio)
    const anoFim = form.anoFim === '' ? null : Number(form.anoFim)
    if (!form.modeloId) { setErro('Selecione o modelo.'); return }
    if (!form.nome.trim()) { setErro('Informe o nome da geração.'); return }
    if (!anoValido(anoInicio)) { setErro(`O primeiro ano-modelo vai de ${ANO_MINIMO} a ${ANO_MAXIMO}.`); return }
    if (anoFim !== null && (!anoValido(anoFim) || anoFim < anoInicio)) {
      setErro(`O último ano-modelo vai do primeiro até ${ANO_MAXIMO}.`)
      return
    }
    if (!form.norma) { setErro('Escolha a norma de emissão.'); return }
    if (potencias.length === 0) { setErro('Informe pelo menos uma potência.'); return }

    setSalvando(true)
    setErro('')
    try {
      const dados = {
        ...form,
        nome: form.nome.trim(),
        motor: form.motor.trim(),
        cambio: form.cambio.trim(),
        anoInicio,
        anoFim,
        potencias,
      }
      const salvo = registro ? await geracaoService.atualizar(registro.id, dados) : await geracaoService.criar(dados)
      onSalvo?.(salvo)
      onClose()
    } catch (err) {
      setErro(err.message)
      setSalvando(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={registro ? 'PUT /api/Geracao/{id}' : 'POST /api/Geracao'}
      title={registro ? 'Editar geração' : 'Nova geração'}
      subtitle="Época do modelo no Brasil e as potências em que foi vendida."
      width="max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={salvando || carregando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Modelo" required>
          <Select value={form.modeloId} onChange={(e) => set('modeloId', e.target.value)} disabled={carregando}>
            <option value="">{carregando ? 'Carregando…' : 'Selecione'}</option>
            {fabricantes.map((fabricante) => (
              <optgroup key={fabricante} label={fabricante}>
                {modelos.filter((m) => m.fabricanteNome === fabricante).map((m) => (
                  <option key={m.id} value={m.id}>{fabricante} {m.nome}</option>
                ))}
              </optgroup>
            ))}
          </Select>
        </Field>
        <Field label="Nome" required>
          <Input value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Novo FH (FH 4)" autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primeiro ano-modelo" required>
            <Input type="number" min={ANO_MINIMO} max={ANO_MAXIMO} value={form.anoInicio} onChange={(e) => set('anoInicio', e.target.value)} placeholder="2015" />
          </Field>
          <Field label="Último ano-modelo" hint="Vazio = ainda é vendida">
            <Input type="number" min={ANO_MINIMO} max={ANO_MAXIMO} value={form.anoFim} onChange={(e) => set('anoFim', e.target.value)} placeholder="2021" />
          </Field>
        </div>
        <Field label="Norma de emissão" required hint="Muda o padrão do sistema para o óleo do motor.">
          <Select value={form.norma} onChange={(e) => set('norma', e.target.value)}>
            <option value="">Selecione</option>
            {Object.entries(NORMAS).map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Motor">
            <Input value={form.motor} onChange={(e) => set('motor', e.target.value)} placeholder="D13C" />
          </Field>
          <Field label="Câmbio">
            <Input value={form.cambio} onChange={(e) => set('cambio', e.target.value)} placeholder="I-Shift" />
          </Field>
        </div>

        <Field label="Potências (cv)" required hint="Potência com caminhão cadastrado não pode sair da lista.">
          <div className="flex gap-2">
            <Input
              type="number"
              min={CV_MIN}
              max={CV_MAX}
              value={novaCv}
              onChange={(e) => setNovaCv(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarPotencia() } }}
              placeholder="460"
              className="w-32"
            />
            <Button type="button" variant="secondary" onClick={adicionarPotencia}>Adicionar</Button>
          </div>
          {potencias.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {potencias.map((cv) => (
                <span key={cv} className="inline-flex items-center gap-1 rounded-full bg-mist-100 py-1 pl-2.5 pr-1.5 text-xs font-semibold text-brand-800">
                  {cv} cv
                  <button
                    type="button"
                    onClick={() => setPotencias((lista) => lista.filter((c) => c !== cv))}
                    aria-label={`Tirar ${cv} cv`}
                    className="rounded-full p-0.5 text-brand-600 hover:bg-brand-100 hover:text-brand-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>
        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </form>
    </Modal>
  )
}
