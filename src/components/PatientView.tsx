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
}

function PatientView({ patients, selectedPatientId, onSelectPatient }: PatientViewProps) {
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
                  <p className="eyebrow">Detalle del paciente</p>
                  <h3>{activePatient.name}</h3>
                </div>
                <span className={`risk-pill ${activePatient.periodontalRisk.toLowerCase()}`}>
                  Riesgo {activePatient.periodontalRisk}
                </span>
              </div>

              <section className="patient-clinic-center">
                <h4>Centro clínico del paciente</h4>
                <div className="clinic-grid">
                  <div className="summary-item">
                    <span>Nombre</span>
                    <strong>{activePatient.name}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Edad</span>
                    <strong>{activePatient.age} años</strong>
                  </div>
                  <div className="summary-item">
                    <span>Diagnóstico</span>
                    <strong>{activePatient.diagnosis}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Riesgo periodontal</span>
                    <strong>{activePatient.periodontalRisk}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Último O’Leary</span>
                    <strong>{activePatient.lastOLeary}%</strong>
                  </div>
                  <div className="summary-item">
                    <span>Próxima cita</span>
                    <strong>{activePatient.nextAppointment}</strong>
                  </div>
                </div>
              </section>

              <div className="detail-summary">
                <div className="summary-item">
                  <span>Edad</span>
                  <strong>{activePatient.age} años</strong>
                </div>
                <div className="summary-item">
                  <span>Diagnóstico</span>
                  <strong>{activePatient.diagnosis}</strong>
                </div>
                <div className="summary-item">
                  <span>Próxima cita</span>
                  <strong>{activePatient.nextAppointment}</strong>
                </div>
              </div>

              <div className="detail-section">
                <h4>Datos generales</h4>
                <div className="detail-grid">
                  <div>
                    <span>Sexo</span>
                    <strong>{activePatient.generalData.sex}</strong>
                  </div>
                  <div>
                    <span>Teléfono</span>
                    <strong>{activePatient.generalData.phone}</strong>
                  </div>
                  <div>
                    <span>Correo</span>
                    <strong>{activePatient.generalData.email}</strong>
                  </div>
                  <div>
                    <span>Seguro</span>
                    <strong>{activePatient.generalData.insurance}</strong>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Último porcentaje O’Leary</h4>
                <div className="olleary-card">
                  <div className="olleary-value">{activePatient.lastOLeary}%</div>
                  <div className="meter-bar" aria-hidden="true">
                    <span style={{ width: `${Math.min(activePatient.lastOLeary, 100)}%` }} />
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Riesgo periodontal</h4>
                <p className="detail-copy">
                  {activePatient.periodontalRisk === 'Bajo' && 'Control estable y evolución favorable.'}
                  {activePatient.periodontalRisk === 'Moderado' && 'Requiere seguimiento próximo para reforzar la higiene.'}
                  {activePatient.periodontalRisk === 'Alto' && 'Prioridad de intervención y control intensivo.'}
                </p>
              </div>

              <div className="detail-section">
                <h4>Historial breve</h4>
                <ul className="history-list">
                  {activePatient.history.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="detail-actions">
                <button type="button" className="primary-btn">
                  Nuevo control de placa
                </button>
                <button type="button" className="ghost-btn">
                  Ver expediente
                </button>
                <button type="button" className="ghost-btn">
                  Editar
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
