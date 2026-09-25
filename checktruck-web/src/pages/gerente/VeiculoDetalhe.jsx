import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import VeiculoDetalhePanel from '../../components/VeiculoDetalhePanel'
import { Button } from '../../components/ui/Form'
import AtualizarKmModal from '../../components/modals/AtualizarKmModal'
import NovoVeiculoModal from '../../components/modals/NovoVeiculoModal'

export default function VeiculoDetalheGerente() {
  const { id } = useParams()
  const { veiculos } = useApp()
  const veiculo = veiculos.find((v) => v.id === id)
  const [kmOpen, setKmOpen] = useState(false)
  const [editarOpen, setEditarOpen] = useState(false)

  return (
    <>
      <VeiculoDetalhePanel
        backTo="/gerente/veiculos"
        actions={
          veiculo && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setKmOpen(true)}>Atualizar km</Button>
              <Button onClick={() => setEditarOpen(true)}>Editar</Button>
            </div>
          )
        }
      />
      <AtualizarKmModal open={kmOpen} onClose={() => setKmOpen(false)} veiculo={veiculo} />
      <NovoVeiculoModal open={editarOpen} onClose={() => setEditarOpen(false)} veiculoParaEditar={veiculo} />
    </>
  )
}
