import { useMemo, useState } from 'react'

type SurfaceStatus = 'sin' | 'con' | 'excluida'
type SurfaceKey = 'M' | 'D' | 'V' | 'L/P'
type QuadrantKey = 'Superior derecho' | 'Superior izquierdo' | 'Inferior derecho' | 'Inferior izquierdo'

type ToothState = Record<SurfaceKey, SurfaceStatus>

type Tooth = {
  id: string
  number: string
  surfaces: ToothState
}

const surfaceKeys: SurfaceKey[] = ['M', 'D', 'V', 'L/P']
const toothNumbers = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28',
  '48', '47', '46', '45', '44', '43', '42', '41',
  '31', '32', '33', '34', '35', '36', '37', '38',
]

const createInitialTeeth = (): Tooth[] =>
  toothNumbers.map((number) => ({
    id: number,
    number,
    surfaces: {
      M: 'sin',
      D: 'sin',
      V: 'sin',
      'L/P': 'sin',
    },
  }))

const getSurfaceId = (toothNumber: string, surface: SurfaceKey) => {
  const normalized = surface === 'L/P' ? 'LP' : surface
  return `${toothNumber}${normalized}`
}

const getQuadrantForTooth = (toothNumber: string): QuadrantKey => {
  if (['18', '17', '16', '15', '14', '13', '12', '11'].includes(toothNumber)) {
    return 'Superior derecho'
  }

  if (['21', '22', '23', '24', '25', '26', '27', '28'].includes(toothNumber)) {
    return 'Superior izquierdo'
  }

  if (['48', '47', '46', '45', '44', '43', '42', '41'].includes(toothNumber)) {
    return 'Inferior derecho'
  }

  return 'Inferior izquierdo'
}

const getStatusLabel = (status: SurfaceStatus) => {
  switch (status) {
    case 'con':
      return 'Con placa'
    case 'excluida':
      return 'Excluida'
    default:
      return 'Sin placa'
  }
}

function ControlPlacaView() {
  const [teeth, setTeeth] = useState<Tooth[]>(() => createInitialTeeth())
  const [savedEvaluation, setSavedEvaluation] = useState<string | null>(null)

  const stats = useMemo(() => {
    let surfacesWithPlaque = 0
    let surfacesEvaluated = 0

    teeth.forEach((tooth) => {
      surfaceKeys.forEach((surface) => {
        const status = tooth.surfaces[surface]

        if (status === 'excluida') {
          return
        }

        surfacesEvaluated += 1

        if (status === 'con') {
          surfacesWithPlaque += 1
        }
      })
    })

    const percentage = surfacesEvaluated === 0 ? 0 : Math.round((surfacesWithPlaque / surfacesEvaluated) * 100)

    let classification = 'Excelente'

    if (percentage > 10 && percentage <= 20) {
      classification = 'Bueno'
    } else if (percentage > 20 && percentage <= 30) {
      classification = 'Regular'
    } else if (percentage > 30) {
      classification = 'Alto riesgo'
    }

    return { surfacesWithPlaque, surfacesEvaluated, percentage, classification }
  }, [teeth])

  const quadrantStats = useMemo(() => {
    const quadrants: QuadrantKey[] = ['Superior derecho', 'Superior izquierdo', 'Inferior derecho', 'Inferior izquierdo']

    return quadrants.map((quadrant) => {
      let plaque = 0
      let evaluated = 0

      teeth.forEach((tooth) => {
        if (getQuadrantForTooth(tooth.number) !== quadrant) {
          return
        }

        surfaceKeys.forEach((surface) => {
          const status = tooth.surfaces[surface]

          if (status === 'excluida') {
            return
          }

          evaluated += 1

          if (status === 'con') {
            plaque += 1
          }
        })
      })

      return {
        quadrant,
        plaque,
        evaluated,
      }
    })
  }, [teeth])

  const toggleStatus = (toothId: string, surface: SurfaceKey) => {
    setTeeth((currentTeeth) =>
      currentTeeth.map((tooth) => {
        if (tooth.id !== toothId) {
          return tooth
        }

        const currentStatus = tooth.surfaces[surface]
        const nextStatus: SurfaceStatus = currentStatus === 'sin' ? 'con' : currentStatus === 'con' ? 'excluida' : 'sin'

        return {
          ...tooth,
          surfaces: {
            ...tooth.surfaces,
            [surface]: nextStatus,
          },
        }
      }),
    )
  }

  const resetEvaluation = () => {
    setTeeth(createInitialTeeth())
    setSavedEvaluation(null)
  }

  const saveEvaluation = () => {
    setSavedEvaluation(
      `Evaluación guardada: ${stats.surfacesWithPlaque} superficies con placa de ${stats.surfacesEvaluated} evaluadas (${stats.percentage}%). Clasificación: ${stats.classification}.`,
    )
  }

  return (
    <section className="control-placa-view">
      <div className="control-actions">
        <button type="button" className="ghost-btn" onClick={resetEvaluation}>
          Reiniciar evaluación
        </button>
        <button type="button" className="primary-btn" onClick={saveEvaluation}>
          Guardar evaluación
        </button>
      </div>

      <div className="control-summary-grid">
        <article className="panel control-summary-card">
          <p className="eyebrow">Resumen</p>
          <h3>Superficies con placa</h3>
          <strong>{stats.surfacesWithPlaque}</strong>
        </article>
        <article className="panel control-summary-card">
          <p className="eyebrow">Resumen</p>
          <h3>Superficies evaluadas</h3>
          <strong>{stats.surfacesEvaluated}</strong>
        </article>
        <article className="panel control-summary-card progress-card">
          <p className="eyebrow">Progreso</p>
          <h3>Porcentaje final</h3>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${stats.percentage}%` }} />
          </div>
          <strong>{stats.percentage}%</strong>
        </article>
        <article className="panel control-summary-card">
          <p className="eyebrow">Clasificación</p>
          <h3>{stats.classification}</h3>
          <strong>{stats.percentage <= 10 ? 'Excelente' : stats.percentage <= 20 ? 'Bueno' : stats.percentage <= 30 ? 'Regular' : 'Alto riesgo'}</strong>
        </article>
      </div>

      <div className="panel quadrant-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Control por cuadrante</p>
            <h3>Resumen clínico</h3>
          </div>
        </div>
        <div className="quadrant-grid">
          {quadrantStats.map((item) => (
            <article key={item.quadrant} className="quadrant-card">
              <h4>{item.quadrant}</h4>
              <p>{item.plaque} con placa</p>
              <span>{item.evaluated} evaluadas</span>
            </article>
          ))}
        </div>
      </div>

      <div className="panel odontogram-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Odontograma</p>
            <h3>FDI permanente</h3>
          </div>
          <div className="legend">
            <span><i className="legend-dot clean" />Sin placa</span>
            <span><i className="legend-dot plaque" />Con placa</span>
            <span><i className="legend-dot excluded" />Excluida</span>
          </div>
        </div>

        <div className="tooth-grid" aria-label="Odontograma interactivo">
          {teeth.map((tooth) => (
            <article key={tooth.id} className="tooth-card">
              <div className="tooth-illustration">
                <div className="tooth-center">{tooth.number}</div>
                {surfaceKeys.map((surface) => {
                  const status = tooth.surfaces[surface]
                  const badgeClass = status === 'con' ? 'plaque' : status === 'excluida' ? 'excluded' : 'clean'
                  const positionClass = surface === 'V' ? 'top' : surface === 'L/P' ? 'bottom' : surface === 'M' ? 'left' : 'right'

                  return (
                    <button
                      key={`${tooth.id}-${surface}`}
                      type="button"
                      className={`surface-btn ${badgeClass} ${positionClass}`}
                      onClick={() => toggleStatus(tooth.id, surface)}
                      aria-label={`${getSurfaceId(tooth.number, surface)} · ${getStatusLabel(status)}`}
                      title={`${tooth.number} · ${surface} · ${getStatusLabel(status)}`}
                    >
                      {surface}
                    </button>
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      </div>

      {savedEvaluation && (
        <div className="panel saved-evaluation-panel">
          <p className="eyebrow">Guardado local</p>
          <h3>Resumen de la evaluación</h3>
          <p>{savedEvaluation}</p>
        </div>
      )}
    </section>
  )
}

export default ControlPlacaView
