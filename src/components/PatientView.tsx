import { useMemo, useState } from 'react'

type RiskLevel = 'Bajo' | 'Moderado' | 'Alto'

type Patient = {
  id: string
  name: string
  age: number
  diagnosis: string
  lastControl: string
  nextAppointment: string
  lastOLeary: number
  periodontalRisk: RiskLevel
  notes: string
  generalData: {
    sex: string
    phone: string
    email: string
    insurance: string
  }
  history: string[]
}

type PatientViewProps = {
  patients: Patient[]
  selectedPatientId: string
  onSelectPatient: (id: string) => void
  onOpenControl: () => void
}

type ClinicalCard = {
  title: string
  description: string
  status: string
  statusClass: 'updated' | 'pending' | 'ready'
  actionLabel: string
  actionVariant: 'primary' | 'secondary'
}

type TimelineEvent = {
  title: string
  date: string
  description: string
}

const clinicalCards: ClinicalCard[] = [
  {
    title: 'Control de Placa',
    description: 'Registro activo de superficies con biofilm y seguimiento del O’Leary.',
    status: 'Actualizado',
    statusClass: 'updated',
    actionLabel: 'Abrir registro',
    actionVariant: 'primary',
  },
  {
    title: 'Periodontograma',
    description: 'Mapa clínico del estado periodontal y evolución de la encía.',
    status: 'En revisión',
    statusClass: 'pending',
    actionLabel: 'Ver detalle',
    actionVariant: 'secondary',
  },
  {
    title: 'Fotografías Clínicas',
    description: 'Comparativa visual de tejidos y respuesta terapéutica.',
    status: 'Listo',
    statusClass: 'ready',
    actionLabel: 'Abrir galería',
    actionVariant: 'secondary',
  },
  {
    title: 'Implantes',
    description: 'Plan de mantenimiento y estado de restauraciones implantológicas.',
    status: 'Sin alertas',
    statusClass: 'ready',
    actionLabel: 'Revisar',
    actionVariant: 'secondary',
  },
  {
    title: 'Reportes',
    description: 'Resumen ejecutivo para integración con el plan de seguimiento.',
    status: 'Preparado',
    statusClass: 'ready',
    actionLabel: 'Exportar',
    actionVariant: 'secondary',
  },
  {
    title: 'Notas',
    description: 'Observaciones breves del profesional para continuidad de atención.',
    status: 'Actualizado',
    statusClass: 'updated',
    actionLabel: 'Editar',
    actionVariant: 'secondary',
  },
  {
    title: 'Documentos',
    description: 'Consentimientos, diagnósticos y protocolos adjuntos al expediente.',
    status: 'Completos',
    statusClass: 'ready',
    actionLabel: 'Ver archivos',
    actionVariant: 'secondary',
  },
  {
    title: 'IA Clínica',
    description: 'Asistente para resúmenes, diferencias clínicas y recomendaciones.',
    status: 'Próximamente',
    statusClass: 'pending',
    actionLabel: 'Activar',
    actionVariant: 'secondary',
  },
]

const timelineEvents: TimelineEvent[] = [
  {
    title: 'Control de placa realizado',
    date: '12 jun 2026',
    description: 'Evaluación completa de superficies con porcentaje de biofilm actualizado.',
  },
  {
    title: 'Mantenimiento periodontal',
    date: '03 jun 2026',
    description: 'Revisión de encías y reforzamiento de higiene en domicilio.',
  },
  {
    title: 'Fotografía clínica agregada',
    date: '28 may 2026',
    description: 'Registro visual de tejido blando para comparación de evolución.',
  },
  {
    title: 'Próxima revisión programada',
    date: '18 jul 2026',
    description: 'Se recomienda revisión de control y actualización de plan de cuidado.',
  },
]

function PatientView({ patients, selectedPatientId, onSelectPatient, onOpenControl }: PatientViewProps) {
  const [search, setSearch] = useState('')

  const filteredPatients = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase()

    if (!normalizedQuery) {
      return patients
    }

    return patients.filter((patient) => {
      const haystack = [patient.name, patient.diagnosis, patient.generalData.insurance]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })
  }, [patients, search])

  const activePatient =
    filteredPatients.find((patient) => patient.id === selectedPatientId) ??
    patients.find((patient) => patient.id === selectedPatientId) ??
    patients[0]

  const initials = activePatient
    ? activePatient.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'PC'

  return (
    <section className="patients-view">
      <div className="patients-toolbar">
        <label className="search-field" htmlFor="patient-search">
          <span aria-hidden="true">⌕</span>
          <input
            id="patient-search"
            type="search"
            value={search}
            placeholder="Buscar por nombre o diagnóstico"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <button type="button" className="primary-btn">
          Nuevo paciente
        </button>
      </div>

      <div className="patients-content">
        <div className="patients-list-panel panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Seguimiento clínico</p>
              <h3>Pacientes recientes</h3>
            </div>
            <span className="pill">{filteredPatients.length} activos</span>
          </div>

          <div className="patient-list" role="list">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => {
                const isSelected = activePatient?.id === patient.id

                return (
                  <button
                    key={patient.id}
                    type="button"
                    className={`patient-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectPatient(patient.id)}
                  >
                    <div className="patient-card-top">
                      <div>
                        <h4>{patient.name}</h4>
                        <p>{patient.diagnosis}</p>
                      </div>
                      <span className="patient-age">{patient.age} años</span>
                    </div>
                    <div className="patient-card-meta">
                      <span>Último control</span>
                      <strong>{patient.lastControl}</strong>
                    </div>
                    <div className="patient-card-meta">
                      <span>Próxima cita</span>
                      <strong>{patient.nextAppointment}</strong>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="empty-state">
                <h4>No encontramos coincidencias</h4>
                <p>Prueba con otro nombre o diagnóstico para continuar.</p>
              </div>
            )}
          </div>
        </div>

        <aside className="patient-detail-panel panel">
          {activePatient ? (
            <>
              <div className="patient-detail-header">
                <div>
                  <p className="eyebrow">Centro clínico del paciente</p>
                  <h3>{activePatient.name}</h3>
                </div>
                <span className={`risk-pill ${activePatient.periodontalRisk.toLowerCase()}`}>
                  Riesgo {activePatient.periodontalRisk}
                </span>
              </div>

              <section className="patient-profile-card">
                <div className="patient-profile-main">
                  <div className="profile-avatar" aria-label={`Avatar de ${activePatient.name}`}>
                    {initials}
                  </div>
                  <div>
                    <h4>{activePatient.name}</h4>
                    <p>{activePatient.diagnosis}</p>
                    <div className="profile-tags">
                      <span>{activePatient.age} años</span>
                      <span>{activePatient.generalData.sex}</span>
                      <span>{activePatient.generalData.insurance}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-overview-grid">
                  <div className="summary-item">
                    <span>Teléfono</span>
                    <strong>{activePatient.generalData.phone}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Correo</span>
                    <strong>{activePatient.generalData.email}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Control de placa</span>
                    <strong>{activePatient.lastOLeary}%</strong>
                  </div>
                  <div className="summary-item">
                    <span>Próxima cita</span>
                    <strong>{activePatient.nextAppointment}</strong>
                  </div>
                </div>
              </section>

              <section className="clinical-cards-grid" aria-label="Módulos clínicos del expediente">
                {clinicalCards.map((card) => (
                  <article key={card.title} className="clinical-card">
                    <div className="clinical-card-top">
                      <div>
                        <h4>{card.title}</h4>
                        <p>{card.description}</p>
                      </div>
                      <span className={`status-pill ${card.statusClass}`}>{card.status}</span>
                    </div>
                    <div className="clinical-card-footer">
                      <button type="button" className={`action-btn ${card.actionVariant}`}>
                        {card.actionLabel}
                      </button>
                    </div>
                  </article>
                ))}
              </section>

              <section className="timeline-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Línea de tiempo</p>
                    <h4>Eventos clínicos</h4>
                  </div>
                  <span className="pill">Ficticio</span>
                </div>
                <ul className="timeline-list">
                  {timelineEvents.map((event) => (
                    <li key={event.title} className="timeline-item">
                      <span className="timeline-marker" aria-hidden="true" />
                      <div className="timeline-content">
                        <div className="timeline-top">
                          <strong>{event.title}</strong>
                          <span>{event.date}</span>
                        </div>
                        <p>{event.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="notes-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Notas clínicas</p>
                    <h4>Resumen breve</h4>
                  </div>
                </div>
                <p className="notes-copy">{activePatient.notes}</p>
                <ul className="history-list">
                  {activePatient.history.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <div className="detail-actions">
                <button type="button" className="primary-btn" onClick={onOpenControl}>
                  Nuevo control de placa
                </button>
                <button type="button" className="ghost-btn">
                  Ver periodontograma
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h4>Selecciona un paciente</h4>
              <p>El detalle clínico aparecerá aquí en cuanto elijas un registro.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

export default PatientView
export type { Patient }
