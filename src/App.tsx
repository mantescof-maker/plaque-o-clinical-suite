import { Component, useMemo, useState, type ErrorInfo, type ReactNode } from 'react'
import './App.css'

type View = 'dashboard' | 'patients' | 'control' | 'placeholder'
type SurfaceStatus = 'clean' | 'plaque' | 'excluded'
type SurfaceKey = 'V' | 'L' | 'M' | 'D'

interface TimelineEvent {
  date: string
  title: string
  description: string
}

interface Patient {
  id: number
  name: string
  age: number
  sex: string
  phone: string
  email: string
  diagnosis: string
  risk: string
  plaque: number
  nextVisit: string
  notes: string
  timeline: TimelineEvent[]
}

interface Tooth {
  number: string
  surfaces: Record<SurfaceKey, SurfaceStatus>
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-shell">
          <div className="error-card">
            <p className="eyebrow">Estado de la app</p>
            <h1>Se ha detectado un problema visual</h1>
            <p>La interfaz ha entrado en un estado inesperado, pero este mensaje sigue siendo visible para mantener la experiencia operativa.</p>
            <button type="button" onClick={() => window.location.reload()}>
              Recargar aplicación
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const patientsSeed: Patient[] = [
  {
    id: 1,
    name: 'Ana López',
    age: 42,
    sex: 'Femenino',
    phone: '+34 600 112 233',
    email: 'ana.lopez@clinic.com',
    diagnosis: 'Periodontitis leve moderada',
    risk: 'Medio',
    plaque: 18,
    nextVisit: '16 Jul 2026',
    notes: 'Respuesta adecuada a la terapia inicial y seguimiento de higiene diaria.',
    timeline: [
      { date: '09 Jul 2026', title: 'Control de placa realizado', description: 'Evaluación de biofilm con mejora clínica observable.' },
      { date: '04 Jul 2026', title: 'Mantenimiento periodontal', description: 'Limpieza profesional y reforzamiento de higiene oral.' },
      { date: '01 Jul 2026', title: 'Fotografía clínica agregada', description: 'Registro visual de la evolución del caso.' },
    ],
  },
  {
    id: 2,
    name: 'Javier Romero',
    age: 57,
    sex: 'Masculino',
    phone: '+34 611 442 115',
    email: 'javier.romero@clinic.com',
    diagnosis: 'Gingivitis crónica',
    risk: 'Alto',
    plaque: 31,
    nextVisit: '20 Jul 2026',
    notes: 'Requiere refuerzo de técnica de cepillado y control de biofilm.',
    timeline: [
      { date: '08 Jul 2026', title: 'Control de placa realizado', description: 'Se registraron múltiples superficies con placa visible.' },
      { date: '03 Jul 2026', title: 'Mantenimiento periodontal', description: 'Revisión de encías y reforzamiento de higiene oral.' },
      { date: '28 Jun 2026', title: 'Próxima revisión programada', description: 'Cita para control clínico en la próxima semana.' },
    ],
  },
  {
    id: 3,
    name: 'Marta Salas',
    age: 35,
    sex: 'Femenino',
    phone: '+34 620 771 882',
    email: 'marta.salas@clinic.com',
    diagnosis: 'Periodontitis estable',
    risk: 'Bajo',
    plaque: 9,
    nextVisit: '27 Jul 2026',
    notes: 'Mantenimiento periodontal en buen estado clínico con excelente adherencia.',
    timeline: [
      { date: '07 Jul 2026', title: 'Control de placa realizado', description: 'Mejora favorable y estabilidad periodontal.' },
      { date: '30 Jun 2026', title: 'Fotografía clínica agregada', description: 'Registro visual de la evolución clínica.' },
      { date: '22 Jun 2026', title: 'Próxima revisión programada', description: 'Seguimiento trimestral planificado.' },
    ],
  },
]

const toothOrder = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28',
  '48', '47', '46', '45', '44', '43', '42', '41',
  '31', '32', '33', '34', '35', '36', '37', '38',
]

const createInitialTeeth = (): Tooth[] =>
  toothOrder.map((number) => ({
    number,
    surfaces: {
      V: 'clean',
      L: 'clean',
      M: 'clean',
      D: 'clean',
    },
  }))

const navItems: Array<{ label: string; view: View }> = [
  { label: 'Dashboard', view: 'dashboard' },
  { label: 'Pacientes', view: 'patients' },
  { label: 'Control de Placa', view: 'control' },
  { label: 'Fotografías', view: 'placeholder' },
  { label: 'Reportes', view: 'placeholder' },
  { label: 'Configuración', view: 'placeholder' },
]

const clinicalCards = [
  { title: 'Control de Placa', description: 'Seguimiento de placa y protocolos de higiene.', status: 'Actualizado', accent: 'updated' },
  { title: 'Periodontograma', description: 'Mapa periodontal actualizado con hallazgos clínicos.', status: 'Pendiente', accent: 'pending' },
  { title: 'Fotografías Clínicas', description: 'Registros visuales de evolución del caso.', status: 'Listo', accent: 'ready' },
  { title: 'Implantes', description: 'Monitoreo de prótesis y estabilidad clínica.', status: 'Actualizado', accent: 'updated' },
  { title: 'Reportes', description: 'Resumen de sesiones y seguimiento del tratamiento.', status: 'En revisión', accent: 'ready' },
  { title: 'Notas', description: 'Observaciones clínicas breves y plan de acción.', status: 'Actualizado', accent: 'updated' },
  { title: 'Documentos', description: 'Consentimientos y documentos adjuntos del paciente.', status: 'Listo', accent: 'ready' },
  { title: 'IA Clínica', description: 'Recomendaciones asistidas para la próxima visita.', status: 'Disponible', accent: 'pending' },
]

const controlQuadrants = [
  { title: 'Superior derecho', teeth: ['18', '17', '16', '15', '14', '13', '12', '11'] },
  { title: 'Superior izquierdo', teeth: ['21', '22', '23', '24', '25', '26', '27', '28'] },
  { title: 'Inferior derecho', teeth: ['48', '47', '46', '45', '44', '43', '42', '41'] },
  { title: 'Inferior izquierdo', teeth: ['31', '32', '33', '34', '35', '36', '37', '38'] },
]

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [patients, setPatients] = useState<Patient[]>(patientsSeed)
  const [selectedPatientId, setSelectedPatientId] = useState(patientsSeed[0].id)
  const [search, setSearch] = useState('')
  const [teeth, setTeeth] = useState<Tooth[]>(() => createInitialTeeth())
  const [feedback, setFeedback] = useState('Sistema preparado para iniciar una evaluación clínica.')
  const [savedSummary, setSavedSummary] = useState<string | null>(null)

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? patients[0]

  const filteredPatients = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return patients
    }

    return patients.filter((patient) =>
      `${patient.name} ${patient.diagnosis} ${patient.risk}`.toLowerCase().includes(normalized),
    )
  }, [patients, search])

  const evaluation = useMemo(() => {
    const evaluatedSurfaces = teeth.reduce((total, tooth) => {
      const surfaceValues = Object.values(tooth.surfaces)
      return total + surfaceValues.filter((status) => status !== 'excluded').length
    }, 0)

    const plaqueSurfaces = teeth.reduce((total, tooth) => {
      const surfaceValues = Object.values(tooth.surfaces)
      return total + surfaceValues.filter((status) => status === 'plaque').length
    }, 0)

    const percentage = evaluatedSurfaces === 0 ? 0 : Math.round((plaqueSurfaces / evaluatedSurfaces) * 100)

    let classification = 'Excelente'
    if (percentage >= 11 && percentage <= 20) {
      classification = 'Bueno'
    } else if (percentage >= 21 && percentage <= 30) {
      classification = 'Regular'
    } else if (percentage > 30) {
      classification = 'Alto riesgo'
    }

    return {
      plaqueSurfaces,
      evaluatedSurfaces,
      percentage,
      classification,
    }
  }, [teeth])

  const toothLookup = useMemo(() => {
    return Object.fromEntries(teeth.map((tooth) => [tooth.number, tooth])) as Record<string, Tooth>
  }, [teeth])

  const setSurfaceStatus = (toothNumber: string, surfaceKey: SurfaceKey) => {
    setTeeth((current) =>
      current.map((tooth) => {
        if (tooth.number !== toothNumber) {
          return tooth
        }

        const nextStatus: Record<SurfaceStatus, SurfaceStatus> = {
          clean: 'plaque',
          plaque: 'excluded',
          excluded: 'clean',
        }

        const currentStatus = tooth.surfaces[surfaceKey]
        return {
          ...tooth,
          surfaces: {
            ...tooth.surfaces,
            [surfaceKey]: nextStatus[currentStatus],
          },
        }
      }),
    )
  }

  const resetEvaluation = () => {
    setTeeth(createInitialTeeth())
    setSavedSummary(null)
    setFeedback('Evaluación reiniciada. El panel está listo para una nueva valoración.')
  }

  const saveEvaluation = () => {
    const summary = `Control guardado: ${evaluation.percentage}% de superficies con placa · ${evaluation.plaqueSurfaces}/${evaluation.evaluatedSurfaces} superficies evaluadas · Clasificación ${evaluation.classification}`
    setPatients((current) =>
      current.map((patient) =>
        patient.id === selectedPatientId
          ? {
              ...patient,
              plaque: evaluation.percentage,
              timeline: [
                {
                  date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
                  title: 'Control de placa guardado',
                  description: `Evaluación registrada con ${evaluation.percentage}% de placa.`,
                },
                ...patient.timeline,
              ].slice(0, 4),
            }
          : patient,
      ),
    )
    setSavedSummary(summary)
    setFeedback('Resumen local guardado y listo para revisión clínica.')
  }

  return (
    <ErrorBoundary>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand-block">
            <div className="brand-mark">P</div>
            <div>
              <p className="eyebrow">Plaque·O</p>
              <h1>Clinical Suite</h1>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Navegación clínica">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`nav-item ${activeView === item.view ? 'active' : ''}`}
                onClick={() => {
                  setActiveView(item.view)
                  setFeedback(`${item.label} abierto.`)
                }}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-card">
            <p className="eyebrow">Sesión</p>
            <h3>Plan de seguimiento</h3>
            <p>El panel mantiene el flujo de pacientes, control de placa y alertas clínicas en una sola vista.</p>
          </div>
        </aside>

        <main className="main-panel">
          <header className="topbar">
            <div>
              <p className="eyebrow">Centro de operaciones</p>
              <h2>{activeView === 'dashboard' ? 'Dashboard clínico' : activeView === 'patients' ? 'Pacientes' : activeView === 'control' ? 'Control de Placa' : 'Módulo en preparación'}</h2>
            </div>
            <div className="topbar-chip">Hoy · 09 Jul 2026</div>
          </header>

          <div className="feedback-banner" role="status">
            {feedback}
          </div>

          {activeView === 'dashboard' && (
            <section className="view-section">
              <div className="hero-card">
                <div>
                  <p className="eyebrow">Resumen del día</p>
                  <h3>Flujo clínico estable y listo para la valoración periodontal.</h3>
                  <p>Monitoriza pacientes activos, controles completados y evaluaciones de placa con una vista premium y clara.</p>
                </div>
                <button type="button" className="primary-btn" onClick={() => { setActiveView('control'); setFeedback('Control de placa iniciado desde el dashboard.') }}>
                  Nuevo control de placa
                </button>
              </div>

              <div className="metrics-grid">
                <article className="metric-card">
                  <p>Pacientes activos</p>
                  <strong>128</strong>
                  <span>+8% vs. semana anterior</span>
                </article>
                <article className="metric-card">
                  <p>Controles realizados</p>
                  <strong>46</strong>
                  <span>12 pendientes hoy</span>
                </article>
                <article className="metric-card">
                  <p>Promedio Control de Placa</p>
                  <strong>17%</strong>
                  <span>Mejora continua</span>
                </article>
                <article className="metric-card">
                  <p>Alertas clínicas</p>
                  <strong>4</strong>
                  <span>2 requieren revisión</span>
                </article>
              </div>

              <div className="content-grid">
                <article className="panel-card">
                  <div className="panel-title-row">
                    <h3>Seguimiento diario</h3>
                    <span className="badge">En curso</span>
                  </div>
                  <ul className="timeline-list">
                    <li><strong>08:30</strong> Mantenimiento de Ana López</li>
                    <li><strong>10:15</strong> Revisión periodontal de Javier Romero</li>
                    <li><strong>13:40</strong> Control de biofilm de Marta Salas</li>
                  </ul>
                </article>
                <article className="panel-card">
                  <div className="panel-title-row">
                    <h3>Prioridades clínicas</h3>
                    <span className="badge muted">Hoy</span>
                  </div>
                  <p>Reforzar higiene en pacientes de riesgo alto y validar evolución del porcentaje de placa.</p>
                  <div className="detail-actions">
                    <button type="button" className="secondary-btn" onClick={() => { setActiveView('patients'); setFeedback('Vista de pacientes abierta.') }}>
                      Ver pacientes
                    </button>
                  </div>
                </article>
              </div>
            </section>
          )}

          {activeView === 'patients' && (
            <section className="view-section patients-view">
              <div className="patient-list-card">
                <div className="panel-title-row">
                  <h3>Pacientes</h3>
                  <button type="button" className="primary-btn" onClick={() => { setFeedback('Nuevo paciente listo para registrar en el flujo clínico.') }}>
                    Nuevo paciente
                  </button>
                </div>
                <label className="search-field">
                  <span>Buscar</span>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o diagnóstico" />
                </label>
                <div className="patient-list">
                  {filteredPatients.map((patient: Patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      className={`patient-row ${selectedPatient.id === patient.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedPatientId(patient.id)
                        setFeedback(`Perfil de ${patient.name} abierto.`)
                      }}
                    >
                      <div className="patient-row-main">
                        <div className="avatar-pill">{patient.name.split(' ').map((part: string) => part[0]).slice(0, 2).join('')}</div>
                        <div>
                          <strong>{patient.name}</strong>
                          <p>{patient.diagnosis}</p>
                        </div>
                      </div>
                      <span className="badge">{patient.risk}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="detail-stack">
                <article className="patient-profile-card">
                  <div className="patient-profile-hero">
                    <div className="patient-profile-main">
                      <div className="profile-avatar-large">{selectedPatient.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                      <div className="patient-profile-identity">
                        <div className="patient-name-row">
                          <h4>{selectedPatient.name}</h4>
                          <span className="status-pill updated">Activo</span>
                        </div>
                        <p>{selectedPatient.age} años · {selectedPatient.sex}</p>
                        <div className="profile-tags">
                          <span>{selectedPatient.phone}</span>
                          <span>{selectedPatient.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="patient-action-row">
                      <button type="button" className="primary-btn" onClick={() => { setActiveView('control'); setFeedback('Se abre el control de placa desde el paciente seleccionado.') }}>
                        Nuevo control de placa
                      </button>
                      <button type="button" className="secondary-btn" onClick={() => { setFeedback('Expediente clínico abierto para revisión.') }}>
                        Ver expediente
                      </button>
                      <button type="button" className="secondary-btn" onClick={() => { setFeedback('Modo edición del paciente activado.') }}>
                        Editar paciente
                      </button>
                    </div>
                  </div>

                  <div className="patient-section-title">
                    <h3>Centro Clínico del Paciente</h3>
                    <span className="badge">Seguimiento activo</span>
                  </div>

                  <div className="profile-overview-grid">
                    <div className="summary-item">
                      <p>Diagnóstico periodontal</p>
                      <strong>{selectedPatient.diagnosis}</strong>
                    </div>
                    <div className="summary-item">
                      <p>Riesgo periodontal</p>
                      <strong>{selectedPatient.risk}</strong>
                    </div>
                    <div className="summary-item">
                      <p>Último Control de Placa</p>
                      <strong>{selectedPatient.plaque}%</strong>
                    </div>
                    <div className="summary-item">
                      <p>Próxima cita</p>
                      <strong>{selectedPatient.nextVisit}</strong>
                    </div>
                    <div className="summary-item summary-item-wide">
                      <p>Notas clínicas breves</p>
                      <strong>{selectedPatient.notes}</strong>
                    </div>
                  </div>
                </article>

                <div className="clinical-cards-grid">
                  {clinicalCards.map((card) => (
                    <article key={card.title} className="clinical-card">
                      <div className="clinical-card-top">
                        <div>
                          <h4>{card.title}</h4>
                          <p>{card.description}</p>
                        </div>
                        <span className={`status-pill ${card.accent}`}>{card.status}</span>
                      </div>
                      <div className="clinical-card-footer">
                        <button type="button" className="action-btn secondary">Abrir</button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="content-grid">
                  <article className="panel-card">
                    <div className="panel-title-row">
                      <h3>Línea de tiempo clínica</h3>
                      <span className="badge">Reciente</span>
                    </div>
                    <ul className="timeline-list">
                      {selectedPatient.timeline.map((event) => (
                        <li key={`${event.title}-${event.date}`} className="timeline-entry">
                          <strong>{event.date}</strong>
                          <span>{event.title}</span>
                          <p>{event.description}</p>
                        </li>
                      ))}
                    </ul>
                  </article>
                  <article className="panel-card">
                    <div className="panel-title-row">
                      <h3>Notas clínicas</h3>
                      <span className="badge muted">Resumen</span>
                    </div>
                    <p>{selectedPatient.notes}</p>
                    <div className="detail-actions">
                      <button type="button" className="primary-btn" onClick={() => { setActiveView('control'); setFeedback('Se abre el control de placa desde el paciente seleccionado.') }}>
                        Nuevo control de placa
                      </button>
                    </div>
                  </article>
                </div>
              </div>
            </section>
          )}

          {activeView === 'control' && (
            <section className="view-section control-placa-view">
              <article className="control-patient-card">
                <div>
                  <p className="eyebrow">Paciente seleccionado</p>
                  <h3>{selectedPatient.name}</h3>
                  <p>{selectedPatient.age} años · {selectedPatient.sex} · {selectedPatient.diagnosis}</p>
                </div>
                <div className="patient-meta-grid">
                  <div><span>Riesgo</span><strong>{selectedPatient.risk}</strong></div>
                  <div><span>Último porcentaje</span><strong>{selectedPatient.plaque}%</strong></div>
                  <div><span>Próxima cita</span><strong>{selectedPatient.nextVisit}</strong></div>
                  <div><span>Fecha</span><strong>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
                </div>
                <div className="detail-actions">
                  <button type="button" className="secondary-btn" onClick={() => { setActiveView('patients'); setFeedback('Se devuelve al centro clínico del paciente.') }}>Volver al paciente</button>
                  <button type="button" className="secondary-btn" onClick={resetEvaluation}>Reiniciar evaluación</button>
                  <button type="button" className="primary-btn" onClick={saveEvaluation}>Guardar evaluación</button>
                </div>
              </article>

              <div className="control-summary-grid">
                <article className="metric-card compact">
                  <p>Superficies con placa</p>
                  <strong>{evaluation.plaqueSurfaces}</strong>
                </article>
                <article className="metric-card compact">
                  <p>Superficies evaluadas</p>
                  <strong>{evaluation.evaluatedSurfaces}</strong>
                </article>
                <article className="metric-card compact">
                  <p>Porcentaje final</p>
                  <strong>{evaluation.percentage}%</strong>
                </article>
                <article className="metric-card compact">
                  <p>Clasificación</p>
                  <strong>{evaluation.classification}</strong>
                </article>
              </div>

              <div className="progress-card">
                <div className="panel-title-row">
                  <h3>Barra de progreso</h3>
                  <span>{evaluation.percentage}%</span>
                </div>
                <div className="progress-bar" aria-label="Progreso de placa">
                  <div style={{ width: `${evaluation.percentage}%` }} />
                </div>
              </div>

              <div className="legend-row">
                <span><i className="legend-dot clean" />Sin placa</span>
                <span><i className="legend-dot plaque" />Con placa</span>
                <span><i className="legend-dot excluded" />Excluida</span>
              </div>

              <div className="odontogram-grid">
                {controlQuadrants.map((quadrant) => (
                  <section key={quadrant.title} className="odontogram-quadrant">
                    <div className="quadrant-title-row">
                      <h4>{quadrant.title}</h4>
                    </div>
                    <div className="quadrant-tooths">
                      {quadrant.teeth.map((number) => {
                        const tooth = toothLookup[number]
                        return tooth ? (
                          <div key={number} className="tooth-card">
                            <div className="tooth-number">{tooth.number}</div>
                            <div className="tooth-surface-grid">
                              <button type="button" className={`surface-btn surface-top ${tooth.surfaces.V}`} onClick={() => setSurfaceStatus(tooth.number, 'V')}>V</button>
                              <button type="button" className={`surface-btn surface-left ${tooth.surfaces.M}`} onClick={() => setSurfaceStatus(tooth.number, 'M')}>M</button>
                              <button type="button" className={`surface-btn surface-right ${tooth.surfaces.D}`} onClick={() => setSurfaceStatus(tooth.number, 'D')}>D</button>
                              <button type="button" className={`surface-btn surface-bottom ${tooth.surfaces.L}`} onClick={() => setSurfaceStatus(tooth.number, 'L')}>L/P</button>
                            </div>
                          </div>
                        ) : null
                      })}
                    </div>
                  </section>
                ))}
              </div>

              {savedSummary && (
                <article className="panel-card summary-card">
                  <div className="panel-title-row">
                    <h3>Resumen local guardado</h3>
                    <span className="badge">Guardado</span>
                  </div>
                  <p>{savedSummary}</p>
                </article>
              )}
            </section>
          )}

          {activeView === 'placeholder' && (
            <section className="view-section">
              <article className="panel-card placeholder-panel">
                <p className="eyebrow">Próximamente</p>
                <h3>Este módulo está preparado para ampliarse con más contenido clínico.</h3>
                <p>Por ahora, la navegación se mantiene visible y funcional para que la suite se comporte como una experiencia estable.</p>
              </article>
            </section>
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App
