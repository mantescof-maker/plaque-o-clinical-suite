import { useMemo, useState } from 'react'
import './App.css'
import ControlPlacaView from './components/ControlPlacaView'
import MetricCard from './components/MetricCard'
import PatientView, { type Patient } from './components/PatientView'
import Sidebar from './components/Sidebar'

type Metric = {
  title: string
  value: string
  detail: string
  accent: 'green' | 'blue' | 'gray'
}

type View = 'dashboard' | 'patients' | 'control' | 'photos' | 'reports' | 'settings'

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [selectedPatientId, setSelectedPatientId] = useState('carmen')

  const metrics: Metric[] = useMemo(
    () => [
      { title: 'Pacientes', value: '128', detail: 'Activos en seguimiento', accent: 'green' },
      { title: 'Controles realizados', value: '84', detail: 'Esta semana', accent: 'blue' },
      { title: 'Promedio O’Leary', value: '18%', detail: 'Mejoría continua', accent: 'gray' },
      { title: 'Alertas', value: '6', detail: 'Revisiones pendientes', accent: 'blue' },
    ],
    [],
  )

  const patients: Patient[] = useMemo(
    () => [
      {
        id: 'carmen',
        name: 'Carmen Rivas',
        age: 47,
        diagnosis: 'Gingivitis crónica moderada',
        lastControl: '12 jun 2026',
        nextAppointment: '18 jul 2026',
        lastOLeary: 24,
        periodontalRisk: 'Moderado',
        generalData: {
          sex: 'Femenino',
          phone: '+34 600 123 456',
          email: 'carmen.rivas@email.com',
          insurance: 'Sanitas',
        },
        history: ['Control de placa mejorado', 'Revisión de encías en 3 meses', 'Se mantiene higiene diaria'],
      },
      {
        id: 'daniel',
        name: 'Daniel Ortega',
        age: 39,
        diagnosis: 'Periodontitis inicial',
        lastControl: '09 jun 2026',
        nextAppointment: '16 jul 2026',
        lastOLeary: 36,
        periodontalRisk: 'Alto',
        generalData: {
          sex: 'Masculino',
          phone: '+34 611 234 567',
          email: 'daniel.ortega@email.com',
          insurance: 'Adeslas',
        },
        history: ['Ajuste de raspado', 'Retraso en controles previos', 'Se recomienda seguimiento semanal'],
      },
      {
        id: 'maria',
        name: 'María Soler',
        age: 54,
        diagnosis: 'Periodontitis estable',
        lastControl: '04 jun 2026',
        nextAppointment: '12 jul 2026',
        lastOLeary: 16,
        periodontalRisk: 'Bajo',
        generalData: {
          sex: 'Femenino',
          phone: '+34 622 345 678',
          email: 'maria.soler@email.com',
          insurance: 'Mapfre',
        },
        history: ['Evolución favorable', 'Mantenimiento periodontal', 'Sin nuevas complicaciones'],
      },
    ],
    [],
  )

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        activeView={activeView}
        onToggle={() => setCollapsed((value) => !value)}
        onNavigate={setActiveView}
      />

      <main className="main-panel">
        {activeView === 'patients' ? (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">Módulo de pacientes</p>
                <h1>Centro clínico de seguimiento periodontal</h1>
              </div>
              <div className="topbar-actions">
                <button type="button" className="ghost-btn">
                  Nuevo paciente
                </button>
                <div className="avatar">DM</div>
              </div>
            </header>
            <PatientView
              patients={patients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
            />
          </>
        ) : activeView === 'control' ? (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">Control de placa</p>
                <h1>Evaluación clínica de superficies dentales</h1>
              </div>
              <div className="topbar-actions">
                <div className="avatar">DM</div>
              </div>
            </header>
            <ControlPlacaView />
          </>
        ) : activeView === 'photos' ? (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">Fotografías</p>
                <h1>Galería clínica y seguimiento visual</h1>
              </div>
              <div className="topbar-actions">
                <button type="button" className="ghost-btn">
                  Añadir fotografía
                </button>
                <div className="avatar">DM</div>
              </div>
            </header>
            <section className="panel placeholder-panel">
              <h3>Sección de fotografías</h3>
              <p>La galería clínica se habilitará en el siguiente sprint con carga de imágenes y comparativas visuales.</p>
            </section>
          </>
        ) : activeView === 'reports' ? (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">Reportes</p>
                <h1>Resumen ejecutivo y exportación</h1>
              </div>
              <div className="topbar-actions">
                <button type="button" className="ghost-btn">
                  Exportar reporte
                </button>
                <div className="avatar">DM</div>
              </div>
            </header>
            <section className="panel placeholder-panel">
              <h3>Sección de reportes</h3>
              <p>Próximamente podrás generar informes de evolución, cumplimiento y seguimiento clínico.</p>
            </section>
          </>
        ) : activeView === 'settings' ? (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">Configuración</p>
                <h1>Preferencias de la clínica</h1>
              </div>
              <div className="topbar-actions">
                <button type="button" className="ghost-btn">
                  Guardar cambios
                </button>
                <div className="avatar">DM</div>
              </div>
            </header>
            <section className="panel placeholder-panel">
              <h3>Sección de configuración</h3>
              <p>Los ajustes de perfil, agenda y notificaciones quedarán disponibles aquí en próximos sprints.</p>
            </section>
          </>
        ) : (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">Dashboard clínico</p>
                <h1>Plataforma de seguimiento periodontal</h1>
              </div>
              <div className="topbar-actions">
                <button type="button" className="ghost-btn">
                  Nuevo paciente
                </button>
                <div className="avatar">DM</div>
              </div>
            </header>

            <section className="hero-banner">
              <div>
                <p className="eyebrow">Sprint 3 · Expediente clínico</p>
                <h2>Centraliza evaluaciones, controles y alertas en una experiencia clínica moderna.</h2>
                <p>
                  El dashboard está preparado para evolucionar con rutas, tablas de pacientes y vistas de detalle.
                </p>
              </div>
              <button type="button" className="primary-btn">
                Ver agenda de hoy
              </button>
            </section>

            <section className="metrics-grid" aria-label="KPI del dashboard">
              {metrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
              ))}
            </section>

            <section className="content-grid">
              <article className="panel panel-large">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Avance clínico</p>
                    <h3>Seguimiento semanal</h3>
                  </div>
                  <span className="pill">En progreso</span>
                </div>
                <div className="timeline">
                  <div>
                    <strong>01</strong>
                    <p>Evaluación inicial</p>
                  </div>
                  <div>
                    <strong>02</strong>
                    <p>Control de placa</p>
                  </div>
                  <div>
                    <strong>03</strong>
                    <p>Revisión final</p>
                  </div>
                </div>
              </article>

              <article className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Hoy</p>
                    <h3>Agenda</h3>
                  </div>
                </div>
                <ul className="agenda-list">
                  <li>
                    <span>09:00</span>
                    <strong>Lucía Pérez</strong>
                  </li>
                  <li>
                    <span>10:30</span>
                    <strong>Tomás Vidal</strong>
                  </li>
                  <li>
                    <span>12:00</span>
                    <strong>Marina Rojas</strong>
                  </li>
                </ul>
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App
