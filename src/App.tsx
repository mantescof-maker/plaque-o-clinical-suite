import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ErrorInfo,
  type FormEvent,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import './App.css'
import { isSupabaseConfigured, supabase } from './supabaseClient'

type View = 'dashboard' | 'patients' | 'control' | 'settings' | 'placeholder'
type SurfaceStatus = 'clean' | 'plaque' | 'excluded'
type SurfaceKey = 'V' | 'L' | 'M' | 'D'

interface TimelineEvent {
  date: string
  title: string
  description: string
}

interface Patient {
  id: string
  name: string
  age: number
  sex: string
  phone: string
  email: string
  diagnosis: string
  risk: string
  plaque: number
  nextVisit: string
  insurance: string
  notes: string
  timeline: TimelineEvent[]
}

interface Tooth {
  number: string
  surfaces: Record<SurfaceKey, SurfaceStatus>
}

interface ToothCardProps {
  tooth: string
  isRightQuadrant: boolean
  surfaces: {
    V: SurfaceStatus
    M: SurfaceStatus
    D: SurfaceStatus
    LP: SurfaceStatus
  }
  onSurfaceClick: (tooth: string, surface: 'V' | 'M' | 'D' | 'LP') => void
}

interface PlaqueControlRecord {
  id: string
  patientId: string
  patientName: string
  date: string
  plaqueSurfaces: number
  evaluatedSurfaces: number
  percentage: number
  classification: string
  interpretation: string
}

interface PatientFormState {
  fullName: string
  age: string
  sex: string
  phone: string
  email: string
  diagnosis: string
  riskLevel: string
  nextAppointment: string
  insurance: string
  notes: string
}

type AuthMode = 'login' | 'signup' | 'recovery'

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
    id: 'demo-1',
    name: 'Ana López',
    age: 42,
    sex: 'Femenino',
    phone: '+34 600 112 233',
    email: 'ana.lopez@clinic.com',
    diagnosis: 'Periodontitis leve moderada',
    risk: 'Medio',
    plaque: 18,
    nextVisit: '16 Jul 2026',
    insurance: 'No registrado',
    notes: 'Respuesta adecuada a la terapia inicial y seguimiento de higiene diaria.',
    timeline: [
      { date: '09 Jul 2026', title: 'Control de placa realizado', description: 'Evaluación de biofilm con mejora clínica observable.' },
      { date: '04 Jul 2026', title: 'Mantenimiento periodontal', description: 'Limpieza profesional y reforzamiento de higiene oral.' },
      { date: '01 Jul 2026', title: 'Fotografía clínica agregada', description: 'Registro visual de la evolución del caso.' },
    ],
  },
  {
    id: 'demo-2',
    name: 'Javier Romero',
    age: 57,
    sex: 'Masculino',
    phone: '+34 611 442 115',
    email: 'javier.romero@clinic.com',
    diagnosis: 'Gingivitis crónica',
    risk: 'Alto',
    plaque: 31,
    nextVisit: '20 Jul 2026',
    insurance: 'No registrado',
    notes: 'Requiere refuerzo de técnica de cepillado y control de biofilm.',
    timeline: [
      { date: '08 Jul 2026', title: 'Control de placa realizado', description: 'Se registraron múltiples superficies con placa visible.' },
      { date: '03 Jul 2026', title: 'Mantenimiento periodontal', description: 'Revisión de encías y reforzamiento de higiene oral.' },
      { date: '28 Jun 2026', title: 'Próxima revisión programada', description: 'Cita para control clínico en la próxima semana.' },
    ],
  },
  {
    id: 'demo-3',
    name: 'Marta Salas',
    age: 35,
    sex: 'Femenino',
    phone: '+34 620 771 882',
    email: 'marta.salas@clinic.com',
    diagnosis: 'Periodontitis estable',
    risk: 'Bajo',
    plaque: 9,
    nextVisit: '27 Jul 2026',
    insurance: 'No registrado',
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
  { label: 'Configuración', view: 'settings' },
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

const controlArcades = [
  { title: 'Arcada superior', quadrants: controlQuadrants.slice(0, 2) },
  { title: 'Arcada inferior', quadrants: controlQuadrants.slice(2, 4) },
]

const plaqueHistoryStorageKey = 'plaque-control-history-v1'

const emptyPatient: Patient = {
  id: '',
  name: 'Sin paciente seleccionado',
  age: 0,
  sex: 'Sin datos',
  phone: 'Sin teléfono',
  email: 'Sin correo',
  diagnosis: 'Sin diagnóstico',
  risk: 'Sin clasificar',
  plaque: 0,
  nextVisit: 'Sin cita programada',
  insurance: 'Sin datos',
  notes: 'Registra o selecciona un paciente para abrir su expediente clínico.',
  timeline: [],
}

const emptyPatientForm: PatientFormState = {
  fullName: '',
  age: '',
  sex: '',
  phone: '',
  email: '',
  diagnosis: '',
  riskLevel: '',
  nextAppointment: '',
  insurance: '',
  notes: '',
}

const formatDateLabel = (value: string | null | undefined) => {
  if (!value) {
    return 'Sin cita programada'
  }

  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getSurfaceClass = (surface: SurfaceStatus): 'surface-clean' | 'surface-plaque' | 'surface-excluded' => {
  if (surface === 'plaque') {
    return 'surface-plaque'
  }

  if (surface === 'excluded') {
    return 'surface-excluded'
  }

  return 'surface-clean'
}

function ToothCard({ tooth, isRightQuadrant, surfaces, onSurfaceClick }: ToothCardProps) {
  return (
    <div className={`tooth-card ${isRightQuadrant ? 'tooth-card-right-quadrant' : 'tooth-card-left-quadrant'}`}>
      <button type="button" className={`surface-button surface-v ${getSurfaceClass(surfaces.V)}`} onClick={() => onSurfaceClick(tooth, 'V')}>V</button>

      <button type="button" className={`surface-button surface-m ${getSurfaceClass(surfaces.M)}`} onClick={() => onSurfaceClick(tooth, 'M')}>M</button>

      <div className="tooth-number">{tooth}</div>

      <button type="button" className={`surface-button surface-d ${getSurfaceClass(surfaces.D)}`} onClick={() => onSurfaceClick(tooth, 'D')}>D</button>

      <button type="button" className={`surface-button surface-lp ${getSurfaceClass(surfaces.LP)}`} onClick={() => onSurfaceClick(tooth, 'LP')}>L/P</button>
    </div>
  )
}

const isRightQuadrant = (tooth: string) => {
  const quadrant = Number(tooth[0])
  return quadrant === 1 || quadrant === 4
}

const getClinicalInterpretation = (percentage: number) => {
  if (percentage <= 10) {
    return 'Excelente control de placa. Mantener técnica de higiene.'
  }

  if (percentage <= 20) {
    return 'Buen control. Reforzar zonas retentivas e interproximales.'
  }

  if (percentage <= 30) {
    return 'Control regular. Reforzar técnica de cepillado e higiene interdental.'
  }

  return 'Alto riesgo. Indicar motivación de higiene y seguimiento estrecho.'
}

const getSimulatedTrend = (record: PlaqueControlRecord, previousRecord?: PlaqueControlRecord) => {
  if (!previousRecord) {
    return 'Linea basal'
  }

  if (record.percentage < previousRecord.percentage) {
    return 'Mejorando'
  }

  if (record.percentage > previousRecord.percentage) {
    return 'Incremento de placa'
  }

  return 'Estable'
}

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [patients, setPatients] = useState<Patient[]>(isSupabaseConfigured ? [] : patientsSeed)
  const [selectedPatientId, setSelectedPatientId] = useState(isSupabaseConfigured ? '' : patientsSeed[0].id)
  const [search, setSearch] = useState('')
  const [teeth, setTeeth] = useState<Tooth[]>(() => createInitialTeeth())
  const [feedback, setFeedback] = useState('Sistema preparado para iniciar una evaluación clínica.')
  const [savedSummary, setSavedSummary] = useState<PlaqueControlRecord | null>(null)
  const [plaqueControlHistory, setPlaqueControlHistory] = useState<PlaqueControlRecord[]>(() => {
    if (isSupabaseConfigured) {
      return []
    }

    try {
      const raw = window.localStorage.getItem(plaqueHistoryStorageKey)
      if (!raw) {
        return []
      }

      const parsed = JSON.parse(raw) as PlaqueControlRecord[]
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('No se pudo leer el historial local de placa:', error)
      return []
    }
  })
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'configured' | 'missing' | 'error'>(
    isSupabaseConfigured ? 'checking' : 'missing',
  )
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [supabaseError, setSupabaseError] = useState<string | null>(null)
  const [patientsLoading, setPatientsLoading] = useState(false)
  const [patientsError, setPatientsError] = useState<string | null>(null)
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
  const [patientForm, setPatientForm] = useState<PatientFormState>(emptyPatientForm)
  const [patientFormError, setPatientFormError] = useState<string | null>(null)
  const [patientSaving, setPatientSaving] = useState(false)
  const [controlSaving, setControlSaving] = useState(false)

  useEffect(() => {
    if (session) {
      return
    }

    try {
      window.localStorage.setItem(plaqueHistoryStorageKey, JSON.stringify(plaqueControlHistory))
    } catch (error) {
      console.error('No se pudo guardar el historial local de placa:', error)
    }
  }, [plaqueControlHistory, session])

  useEffect(() => {
    let isCurrent = true

    const client = supabase

    const verifySupabaseSession = async () => {
      if (!isSupabaseConfigured || !client) {
        if (!isCurrent) {
          return
        }

        setSupabaseStatus('missing')
        setSession(null)
        setAuthReady(true)
        setSupabaseError(null)
        return
      }

      if (!isCurrent) {
        return
      }

      setSupabaseStatus('checking')

      try {
        const { data, error } = await client.auth.getSession()

        if (error) {
          throw error
        }

        if (!isCurrent) {
          return
        }

        setSupabaseStatus('configured')
        setSession(data.session)
        setAuthReady(true)
        setSupabaseError(null)
      } catch (error) {
        if (!isCurrent) {
          return
        }

        setSupabaseStatus('error')
        setSession(null)
        setAuthReady(true)
        setSupabaseError(error instanceof Error ? error.message : 'No se pudo verificar la sesión de Supabase.')
      }
    }

    void verifySupabaseSession()

    const { data: authListener } = client?.auth.onAuthStateChange((event, nextSession) => {
      if (!isCurrent) {
        return
      }

      setSession(nextSession)
      setAuthReady(true)
      setSupabaseStatus('configured')
      setSupabaseError(null)

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
        setAuthMessage(null)
      }
    }) ?? { data: { subscription: null } }

    return () => {
      isCurrent = false
      authListener.subscription?.unsubscribe()
    }
  }, [])

  const loadPatients = useCallback(async () => {
    const userId = session?.user.id
    if (!supabase || !userId) {
      return
    }

    setPatientsLoading(true)
    setPatientsError(null)

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error cargando pacientes:', error)
      setPatientsError(error.message)
      setPatientsLoading(false)
      return
    }

    const mappedPatients: Patient[] = (data ?? []).map((row) => ({
      id: String(row.id),
      name: row.full_name ?? 'Paciente sin nombre',
      age: Number(row.age ?? 0),
      sex: row.sex ?? 'Sin datos',
      phone: row.phone ?? 'Sin teléfono',
      email: row.email ?? 'Sin correo',
      diagnosis: row.diagnosis ?? 'Sin diagnóstico',
      risk: row.risk_level ?? 'Sin clasificar',
      plaque: Number(row.last_plaque_percentage ?? 0),
      nextVisit: formatDateLabel(row.next_appointment),
      insurance: row.insurance ?? 'Sin datos',
      notes: row.notes ?? 'Sin notas clínicas.',
      timeline: [],
    }))

    setPatients(mappedPatients)
    setSelectedPatientId((current) => (
      mappedPatients.some((patient) => patient.id === current) ? current : mappedPatients[0]?.id ?? ''
    ))
    setPatientsLoading(false)
  }, [session])

  useEffect(() => {
    if (!session) {
      return
    }

    void Promise.resolve().then(() => loadPatients())
  }, [loadPatients, session])

  const loadPatientPlaqueHistory = useCallback(async (patientId: string) => {
    const userId = session?.user.id
    if (!supabase || !userId || !patientId) {
      return
    }

    const [controlsResult, eventsResult] = await Promise.all([
      supabase
        .from('plaque_controls')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('clinical_events')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ])

    if (controlsResult.error) {
      console.error('Error cargando historial de placa:', controlsResult.error)
      setPatientsError(controlsResult.error.message)
      return
    }

    const records: PlaqueControlRecord[] = (controlsResult.data ?? []).map((row) => ({
      id: String(row.id),
      patientId,
      patientName: 'Paciente',
      date: formatDateLabel(row.control_date ?? row.created_at),
      plaqueSurfaces: Number(row.plaque_surfaces ?? 0),
      evaluatedSurfaces: Number(row.evaluated_surfaces ?? 0),
      percentage: Number(row.percentage ?? 0),
      classification: row.classification ?? 'Sin clasificar',
      interpretation: row.interpretation ?? 'Sin interpretación registrada.',
    }))

    setPlaqueControlHistory((current) => [
      ...current.filter((record) => record.patientId !== patientId),
      ...records,
    ])

    if (eventsResult.error) {
      console.error('Error cargando eventos clínicos:', eventsResult.error)
      return
    }

    const timeline: TimelineEvent[] = (eventsResult.data ?? []).map((row) => ({
      date: formatDateLabel(row.event_date ?? row.created_at),
      title: row.title ?? 'Evento clínico',
      description: row.description ?? 'Sin descripción.',
    }))

    setPatients((current) => current.map((patient) => (
      patient.id === patientId ? { ...patient, timeline } : patient
    )))
  }, [session])

  useEffect(() => {
    if (session && selectedPatientId) {
      void Promise.resolve().then(() => loadPatientPlaqueHistory(selectedPatientId))
    }
  }, [loadPatientPlaqueHistory, selectedPatientId, session])

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? emptyPatient

  const filteredPatients = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return patients
    }

    return patients.filter((patient) =>
      `${patient.name} ${patient.diagnosis} ${patient.risk}`.toLowerCase().includes(normalized),
    )
  }, [patients, search])

  const patientPlaqueHistory = useMemo(() => {
    return plaqueControlHistory.filter((record) => record.patientId === selectedPatientId)
  }, [plaqueControlHistory, selectedPatientId])

  const latestPatientControl = patientPlaqueHistory[0] ?? null
  const latestTimelineControl = selectedPatient.timeline.find((event) => event.title.toLowerCase().includes('control de placa'))

  const evaluation = useMemo(() => {
    const evaluatedSurfaces = teeth.reduce((total, tooth) => {
      const surfaceValues = Object.values(tooth.surfaces)
      return total + surfaceValues.filter((status) => status !== 'excluded').length
    }, 0)

    const plaqueSurfaces = teeth.reduce((total, tooth) => {
      const surfaceValues = Object.values(tooth.surfaces)
      return total + surfaceValues.filter((status) => status === 'plaque').length
    }, 0)

    const percentage = evaluatedSurfaces === 0
      ? 0
      : Number(((plaqueSurfaces / evaluatedSurfaces) * 100).toFixed(2))

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

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) {
      setAuthMessage('Faltan las variables de Supabase para iniciar sesión.')
      return
    }

    setAuthLoading(true)
    setAuthMessage(null)

    if (authMode === 'recovery') {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail.trim(), {
        redirectTo: `${window.location.origin}/?recovery=1`,
      })

      if (error) {
        console.error('Error al solicitar la recuperación:', error)
        setAuthMessage(error.message)
      } else {
        setAuthMessage('Si existe una cuenta con este correo, recibirás un enlace para restablecer la contraseña.')
      }

      setAuthLoading(false)
      return
    }

    const result = authMode === 'signup'
      ? await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: { emailRedirectTo: window.location.origin },
        })
      : await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        })

    if (result.error) {
      console.error('Error de autenticación:', result.error)
      setAuthMessage(result.error.message)
      setAuthLoading(false)
      return
    }

    if (authMode === 'signup' && !result.data.session) {
      const accountAlreadyExists = result.data.user?.identities?.length === 0
      setAuthMessage(accountAlreadyExists
        ? 'Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.'
        : 'Cuenta creada. Revisa tu correo para confirmar el acceso.')
    } else {
      setAuthMessage('Sesión iniciada correctamente.')
    }

    setAuthLoading(false)
  }

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || !session) {
      setAuthMessage('El enlace de recuperación ya no es válido. Solicita uno nuevo.')
      return
    }

    if (newPassword.length < 6) {
      setAuthMessage('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setAuthMessage('Las contraseñas no coinciden.')
      return
    }

    setAuthLoading(true)
    setAuthMessage(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      console.error('Error al actualizar la contraseña:', error)
      setAuthMessage(error.message)
    } else {
      setNewPassword('')
      setConfirmNewPassword('')
      setIsPasswordRecovery(false)
      window.history.replaceState({}, document.title, window.location.pathname)
      setFeedback('Contraseña actualizada correctamente.')
    }

    setAuthLoading(false)
  }

  const handleSignOut = async () => {
    if (!supabase) {
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      setFeedback(`No se pudo cerrar sesión: ${error.message}`)
      return
    }

    setFeedback('Sesión cerrada correctamente.')
    setPlaqueControlHistory([])
    setSavedSummary(null)
  }

  const handleCreatePatient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const userId = session?.user.id

    if (!supabase || !userId) {
      setPatientFormError('No hay usuario autenticado. Inicia sesión nuevamente.')
      return
    }

    if (!patientForm.fullName.trim()) {
      setPatientFormError('El nombre completo es obligatorio.')
      return
    }

    setPatientSaving(true)
    setPatientFormError(null)

    const patientPayload = {
      user_id: userId,
      full_name: patientForm.fullName.trim(),
      age: patientForm.age ? Number(patientForm.age) : null,
      sex: patientForm.sex || null,
      phone: patientForm.phone.trim() || null,
      email: patientForm.email.trim() || null,
      diagnosis: patientForm.diagnosis.trim() || null,
      risk_level: patientForm.riskLevel || null,
      next_appointment: patientForm.nextAppointment || null,
      insurance: patientForm.insurance.trim() || null,
      notes: patientForm.notes.trim() || null,
    }

    const { data, error } = await supabase
      .from('patients')
      .insert([patientPayload])
      .select()
      .single()

    if (error) {
      console.error('Error guardando paciente:', error)
      setPatientsError(error.message)
      setPatientFormError(`No se pudo guardar el paciente: ${error.message}`)
      setPatientSaving(false)
      return
    }

    setPatientForm(emptyPatientForm)
    setIsPatientModalOpen(false)
    setPatientSaving(false)
    setFeedback('Paciente guardado correctamente.')
    await loadPatients()
    if (data?.id) {
      setSelectedPatientId(String(data.id))
    }
  }

  const createLocalRecord = () => {
    const dateLabel = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    const interpretation = getClinicalInterpretation(evaluation.percentage)
    const newRecord: PlaqueControlRecord = {
      id: `local-${plaqueControlHistory.length + 1}`,
      patientId: selectedPatientId,
      patientName: selectedPatient.name,
      date: dateLabel,
      plaqueSurfaces: evaluation.plaqueSurfaces,
      evaluatedSurfaces: evaluation.evaluatedSurfaces,
      percentage: evaluation.percentage,
      classification: evaluation.classification,
      interpretation,
    }

    setPlaqueControlHistory((current) => [newRecord, ...current])

    setPatients((current) =>
      current.map((patient) =>
        patient.id === selectedPatientId
          ? {
              ...patient,
              plaque: evaluation.percentage,
              timeline: [
                {
                  date: dateLabel,
                  title: 'Control de placa realizado',
                  description: `Evaluacion registrada con ${evaluation.percentage}% de placa.`,
                },
                ...patient.timeline,
              ].slice(0, 4),
            }
          : patient,
      ),
    )
    setSavedSummary(newRecord)
    setFeedback('Resumen local guardado y agregado al historial clinico del paciente.')
    return newRecord
  }

  const saveEvaluation = async () => {
    if (!isSupabaseConfigured) {
      createLocalRecord()
      return
    }

    const userId = session?.user.id
    if (!supabase || !userId) {
      setFeedback('No hay usuario autenticado. Inicia sesión nuevamente.')
      return
    }

    if (!selectedPatient.id) {
      setFeedback('Selecciona un paciente antes de guardar el control de placa.')
      return
    }

    setControlSaving(true)
    setPatientsError(null)

    const today = new Date().toISOString().slice(0, 10)
    const interpretation = getClinicalInterpretation(evaluation.percentage)
    const controlPayload = {
      user_id: userId,
      patient_id: selectedPatient.id,
      control_date: today,
      plaque_surfaces: evaluation.plaqueSurfaces,
      evaluated_surfaces: evaluation.evaluatedSurfaces,
      percentage: evaluation.percentage,
      classification: evaluation.classification,
      interpretation,
    }

    const { data: savedControl, error: controlError } = await supabase
      .from('plaque_controls')
      .insert([controlPayload])
      .select()
      .single()

    if (controlError || !savedControl) {
      const message = controlError?.message ?? 'Supabase no devolvió el control guardado.'
      console.error('Error guardando control de placa:', controlError)
      setFeedback(`No se pudo guardar el control: ${message}`)
      setControlSaving(false)
      return
    }

    const surfaceRows = teeth.flatMap((tooth) => (
      (Object.entries(tooth.surfaces) as Array<[SurfaceKey, SurfaceStatus]>).map(([surface, status]) => ({
        user_id: userId,
        patient_id: selectedPatient.id,
        control_id: savedControl.id,
        tooth: tooth.number,
        surface: surface === 'L' ? 'LP' : surface,
        status,
      }))
    ))

    const { error: surfacesError } = await supabase.from('plaque_surfaces').insert(surfaceRows)
    if (surfacesError) {
      console.error('Error guardando superficies:', surfacesError)
      setFeedback(`No se pudo guardar el control: ${surfacesError.message}`)
      setControlSaving(false)
      return
    }

    const { error: patientUpdateError } = await supabase
      .from('patients')
      .update({
        last_plaque_percentage: evaluation.percentage,
        last_plaque_classification: evaluation.classification,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedPatient.id)
      .eq('user_id', userId)

    if (patientUpdateError) {
      console.error('Error actualizando paciente:', patientUpdateError)
      setFeedback(`El control se guardó, pero no se actualizó el paciente: ${patientUpdateError.message}`)
      setControlSaving(false)
      return
    }

    const { error: eventError } = await supabase.from('clinical_events').insert([{
      user_id: userId,
      patient_id: selectedPatient.id,
      event_date: today,
      title: 'Control de placa realizado',
      description: `Evaluación de biofilm: ${evaluation.percentage.toFixed(2)}%. Clasificación: ${evaluation.classification}.`,
      event_type: 'plaque_control',
    }])

    if (eventError) {
      console.error('Error guardando evento clínico:', eventError)
      setFeedback(`El control se guardó, pero no se creó el evento clínico: ${eventError.message}`)
      setControlSaving(false)
      return
    }

    const savedRecord: PlaqueControlRecord = {
      id: String(savedControl.id),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      date: formatDateLabel(today),
      plaqueSurfaces: evaluation.plaqueSurfaces,
      evaluatedSurfaces: evaluation.evaluatedSurfaces,
      percentage: evaluation.percentage,
      classification: evaluation.classification,
      interpretation,
    }

    setSavedSummary(savedRecord)
    setFeedback('Control de placa guardado correctamente.')
    await loadPatients()
    await loadPatientPlaqueHistory(selectedPatient.id)
    setSelectedPatientId(selectedPatient.id)
    setControlSaving(false)
  }

  const progressTone =
    evaluation.percentage <= 10
      ? 'excellent'
      : evaluation.percentage <= 20
        ? 'good'
        : evaluation.percentage <= 30
          ? 'regular'
          : 'risk'

  const supabaseStatusCard = (
    <article className="panel-card supabase-card">
      <div className="panel-title-row">
        <h3>Estado Supabase</h3>
        <span className={`badge ${supabaseStatus === 'error' ? 'badge-alert' : ''}`}>
          {supabaseStatus === 'configured' && 'Supabase configurado'}
          {supabaseStatus === 'missing' && 'Faltan variables de Supabase'}
          {supabaseStatus === 'checking' && 'Verificando sesión'}
          {supabaseStatus === 'error' && 'Error de conexión'}
        </span>
      </div>
      <p>Configuración: {isSupabaseConfigured ? 'Configurado' : 'Faltan variables'}</p>
      <p>Usuario autenticado: {session ? 'Sí' : 'No'}</p>
      {session?.user.email && <p>Cuenta activa: {session.user.email}</p>}
      {supabaseError && <p className="supabase-error">Error: {supabaseError}</p>}
    </article>
  )

  if (isSupabaseConfigured && !authReady) {
    return (
      <div className="auth-shell">
        <section className="auth-card auth-loading-card">
          <div className="brand-mark">P</div>
          <p className="eyebrow">Plaque·O Clinical Suite</p>
          <h1>Verificando sesión clínica</h1>
          <p>Preparando un acceso seguro a los datos del profesional.</p>
        </section>
      </div>
    )
  }

  if (isSupabaseConfigured && isPasswordRecovery) {
    return (
      <div className="auth-shell">
        <section className="auth-card">
          <div className="auth-brand">
            <div className="brand-mark">P</div>
            <div>
              <p className="eyebrow">Plaque·O</p>
              <h1>Clinical Suite</h1>
            </div>
          </div>
          <div className="auth-copy">
            <p className="eyebrow">Recuperación de acceso</p>
            <h2>Crea una nueva contraseña</h2>
            <p>Elige una contraseña nueva para volver a acceder a tu información clínica.</p>
          </div>
          <form className="auth-form" onSubmit={handlePasswordUpdate}>
            <label>
              <span>Nueva contraseña</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
            <label>
              <span>Confirmar nueva contraseña</span>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
            {authMessage && <p className="form-message">{authMessage}</p>}
            <button type="submit" className="primary-btn" disabled={authLoading}>
              {authLoading ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        </section>
      </div>
    )
  }

  if (isSupabaseConfigured && !session) {
    return (
      <div className="auth-shell">
        <section className="auth-card">
          <div className="auth-brand">
            <div className="brand-mark">P</div>
            <div>
              <p className="eyebrow">Plaque·O</p>
              <h1>Clinical Suite</h1>
            </div>
          </div>
          <div className="auth-copy">
            <p className="eyebrow">Acceso profesional</p>
            <h2>{authMode === 'login' ? 'Inicia sesión en tu clínica' : authMode === 'signup' ? 'Crea tu cuenta clínica' : 'Recupera el acceso a tu cuenta'}</h2>
            <p>{authMode === 'recovery' ? 'Te enviaremos un enlace seguro para crear una nueva contraseña.' : 'Los pacientes y evaluaciones se consultan únicamente desde tu sesión de Supabase.'}</p>
          </div>
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <label>
              <span>Correo electrónico</span>
              <input
                type="email"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            {authMode !== 'recovery' && (
              <label>
                <span>Contraseña</span>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  minLength={6}
                  required
                />
              </label>
            )}
            {authMessage && <p className="form-message">{authMessage}</p>}
            <button type="submit" className="primary-btn" disabled={authLoading}>
              {authLoading ? 'Procesando…' : authMode === 'login' ? 'Iniciar sesión' : authMode === 'signup' ? 'Crear cuenta' : 'Enviar enlace de recuperación'}
            </button>
          </form>
          {authMode === 'login' && (
            <button
              type="button"
              className="auth-mode-button"
              onClick={() => {
                setAuthMode('recovery')
                setAuthMessage(null)
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
          <button
            type="button"
            className="auth-mode-button"
            onClick={() => {
              setAuthMode((current) => current === 'signup' ? 'login' : 'signup')
              setAuthMessage(null)
            }}
          >
            {authMode === 'signup' ? 'Ya tengo cuenta' : authMode === 'recovery' ? 'Volver a iniciar sesión' : '¿Primera vez? Crear cuenta'}
          </button>
        </section>
      </div>
    )
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
            <h3>{session?.user.email ?? 'Modo demostración'}</h3>
            <p>El panel mantiene el flujo de pacientes, control de placa y alertas clínicas en una sola vista.</p>
            {session && (
              <button type="button" className="sidebar-signout" onClick={() => { void handleSignOut() }}>
                Cerrar sesión
              </button>
            )}
          </div>
        </aside>

        <main className="main-panel">
          <header className="topbar">
            <div>
              <p className="eyebrow">Centro de operaciones</p>
              <h2>{activeView === 'dashboard' ? 'Dashboard clínico' : activeView === 'patients' ? 'Pacientes' : activeView === 'control' ? 'Control de Placa' : activeView === 'settings' ? 'Configuración' : 'Módulo en preparación'}</h2>
            </div>
            <div className="topbar-chip">Hoy · {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
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

              {supabaseStatusCard}

              <div className="metrics-grid">
                <article className="metric-card">
                  <p>Pacientes activos</p>
                  <strong>{patients.length}</strong>
                  <span>{session ? 'Registros reales en Supabase' : 'Datos de demostración'}</span>
                </article>
                <article className="metric-card">
                  <p>Controles realizados</p>
                  <strong>{plaqueControlHistory.length}</strong>
                  <span>Historial disponible</span>
                </article>
                <article className="metric-card">
                  <p>Promedio Control de Placa</p>
                  <strong>{plaqueControlHistory.length > 0 ? `${Number((plaqueControlHistory.reduce((sum, record) => sum + record.percentage, 0) / plaqueControlHistory.length).toFixed(2))}%` : '—'}</strong>
                  <span>Promedio de controles cargados</span>
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
                  <button
                    type="button"
                    className="primary-btn"
                    disabled={!session}
                    onClick={() => {
                      setPatientForm(emptyPatientForm)
                      setPatientFormError(null)
                      setIsPatientModalOpen(true)
                    }}
                  >
                    Nuevo paciente
                  </button>
                </div>
                <label className="search-field">
                  <span>Buscar</span>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o diagnóstico" />
                </label>
                {patientsLoading && <p className="history-empty">Cargando pacientes…</p>}
                {patientsError && <p className="supabase-error">Error: {patientsError}</p>}
                <div className="patient-list">
                  {!patientsLoading && filteredPatients.length === 0 && (
                    <p className="history-empty">No hay pacientes registrados. Crea el primero para iniciar el seguimiento.</p>
                  )}
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
                  <div className={`patient-profile-hero ${selectedPatient.id ? '' : 'empty-profile'}`}>
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
                      <button type="button" className="primary-btn" disabled={!selectedPatient.id} onClick={() => { setActiveView('control'); setFeedback('Se abre el control de placa desde el paciente seleccionado.') }}>
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
                          {card.title === 'Control de Placa' ? (
                            <>
                              <p>Seguimiento de placa y protocolos de higiene en el centro clinico.</p>
                              <div className="clinical-inline-data">
                                <span>Ultimo porcentaje registrado: {latestPatientControl ? `${latestPatientControl.percentage}%` : `${selectedPatient.plaque}%`}</span>
                                <span>Ultima fecha de control: {latestPatientControl ? latestPatientControl.date : latestTimelineControl?.date ?? 'Sin registro local'}</span>
                                <span>Estado actualizado: {latestPatientControl ? 'Actualizado' : 'Pendiente local'}</span>
                              </div>
                            </>
                          ) : (
                            <p>{card.description}</p>
                          )}
                        </div>
                        <span className={`status-pill ${card.title === 'Control de Placa' ? (latestPatientControl ? 'updated' : 'pending') : card.accent}`}>
                          {card.title === 'Control de Placa' ? (latestPatientControl ? 'Actualizado' : 'Pendiente') : card.status}
                        </span>
                      </div>
                      <div className="clinical-card-footer">
                        <button type="button" className="action-btn secondary">Abrir</button>
                      </div>
                    </article>
                  ))}
                </div>

                <article className="panel-card plaque-history-card">
                  <div className="panel-title-row">
                    <h3>Historial de Control de Placa</h3>
                    <span className="badge">{session ? 'Supabase' : 'Local'}</span>
                  </div>
                  {patientPlaqueHistory.length === 0 ? (
                    <p className="history-empty">Sin controles de placa registrados.</p>
                  ) : (
                    <div className="plaque-history-list">
                      {patientPlaqueHistory.slice(0, 6).map((record, index) => (
                        <article key={record.id} className="plaque-history-item">
                          <div><span>Fecha</span><strong>{record.date}</strong></div>
                          <div><span>Porcentaje</span><strong>{record.percentage}%</strong></div>
                          <div><span>Clasificacion</span><strong>{record.classification}</strong></div>
                          <div><span>Tendencia simulada</span><strong>{getSimulatedTrend(record, patientPlaqueHistory[index + 1])}</strong></div>
                          <div className="history-interpretation"><span>Interpretacion breve</span><strong>{record.interpretation}</strong></div>
                        </article>
                      ))}
                    </div>
                  )}
                </article>

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
              <article className="control-patient-card compact-header">
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
                  <button
                    type="button"
                    className="primary-btn"
                    disabled={controlSaving || !selectedPatient.id}
                    onClick={() => { void saveEvaluation() }}
                  >
                    {controlSaving ? 'Guardando…' : 'Guardar evaluación'}
                  </button>
                </div>
              </article>

              <article className="panel-card control-overview-card">
                <div className="panel-title-row">
                  <h3>Resumen clínico de evaluación</h3>
                  <span className={`status-pill overview-pill ${progressTone}`}>{evaluation.classification}</span>
                </div>
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

                <div className={`progress-card progress-tone-${progressTone}`}>
                  <div className="panel-title-row">
                    <h3>Barra de progreso</h3>
                    <span className="progress-percentage">{evaluation.percentage}%</span>
                  </div>
                  <div className="progress-bar" aria-label="Progreso de placa">
                    <div style={{ width: `${evaluation.percentage}%` }} />
                  </div>
                </div>
              </article>

              <div className="legend-row">
                <span><i className="legend-dot clean" />Sin placa</span>
                <span><i className="legend-dot plaque" />Con placa</span>
                <span><i className="legend-dot excluded" />Excluida</span>
              </div>

              {controlArcades.map((arcade) => (
                <section key={arcade.title} className="arcade-section">
                  <div className="arcade-title-row">
                    <h3>{arcade.title}</h3>
                  </div>
                  <div className="quadrants-grid">
                    {arcade.quadrants.map((quadrant) => (
                      <section key={quadrant.title} className="quadrant-card">
                        <div className="quadrant-title-row">
                          <h4>{quadrant.title}</h4>
                        </div>
                        <div className="quadrant-teeth">
                          {quadrant.teeth.map((number) => {
                            const tooth = toothLookup[number] ?? {
                              number,
                              surfaces: {
                                V: 'clean' as SurfaceStatus,
                                M: 'clean' as SurfaceStatus,
                                D: 'clean' as SurfaceStatus,
                                L: 'clean' as SurfaceStatus,
                              },
                            }
                            return (
                              <ToothCard
                                key={number}
                                tooth={tooth.number}
                                isRightQuadrant={isRightQuadrant(tooth.number)}
                                surfaces={{
                                  V: tooth.surfaces.V,
                                  M: tooth.surfaces.M,
                                  D: tooth.surfaces.D,
                                  LP: tooth.surfaces.L,
                                }}
                                onSurfaceClick={(toothNumber, surface) => {
                                  if (surface === 'LP') {
                                    setSurfaceStatus(toothNumber, 'L')
                                    return
                                  }

                                  setSurfaceStatus(toothNumber, surface)
                                }}
                              />
                            )
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </section>
              ))}

              {savedSummary && (
                <article className="panel-card summary-card clinical-summary-card">
                  <div className="panel-title-row">
                    <h3>Resumen clínico guardado</h3>
                    <span className="badge">Guardado</span>
                  </div>
                  <div className="saved-grid">
                    <div><span>Paciente</span><strong>{savedSummary.patientName}</strong></div>
                    <div><span>Fecha</span><strong>{savedSummary.date}</strong></div>
                    <div><span>Superficies con placa</span><strong>{savedSummary.plaqueSurfaces}</strong></div>
                    <div><span>Superficies evaluadas</span><strong>{savedSummary.evaluatedSurfaces}</strong></div>
                    <div><span>Porcentaje final</span><strong>{savedSummary.percentage}%</strong></div>
                    <div><span>Clasificación</span><strong>{savedSummary.classification}</strong></div>
                  </div>
                  <p className="clinical-message"><strong>Interpretacion clinica:</strong> {savedSummary.interpretation}</p>
                </article>
              )}
            </section>
          )}

          {activeView === 'settings' && (
            <section className="view-section">
              <article className="hero-card compact">
                <div>
                  <p className="eyebrow">Configuración</p>
                  <h3>Conectividad y parámetros de plataforma</h3>
                  <p>Estado actual de integración con Supabase para validar inicialización y sesión.</p>
                </div>
              </article>

              {supabaseStatusCard}
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

        {isPatientModalOpen && (
          <div className="modal-backdrop" role="presentation">
            <section className="patient-modal" role="dialog" aria-modal="true" aria-labelledby="new-patient-title">
              <div className="panel-title-row">
                <div>
                  <p className="eyebrow">Expediente clínico</p>
                  <h3 id="new-patient-title">Nuevo paciente</h3>
                </div>
                <button type="button" className="modal-close" onClick={() => setIsPatientModalOpen(false)} aria-label="Cerrar formulario">×</button>
              </div>
              <form className="patient-form" onSubmit={handleCreatePatient}>
                <label className="field-wide">
                  <span>Nombre completo *</span>
                  <input value={patientForm.fullName} onChange={(event) => setPatientForm((current) => ({ ...current, fullName: event.target.value }))} required />
                </label>
                <label>
                  <span>Edad</span>
                  <input type="number" min="0" max="120" value={patientForm.age} onChange={(event) => setPatientForm((current) => ({ ...current, age: event.target.value }))} />
                </label>
                <label>
                  <span>Sexo</span>
                  <select value={patientForm.sex} onChange={(event) => setPatientForm((current) => ({ ...current, sex: event.target.value }))}>
                    <option value="">Seleccionar</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">Otro</option>
                    <option value="Prefiere no indicar">Prefiere no indicar</option>
                  </select>
                </label>
                <label>
                  <span>Teléfono</span>
                  <input type="tel" value={patientForm.phone} onChange={(event) => setPatientForm((current) => ({ ...current, phone: event.target.value }))} />
                </label>
                <label>
                  <span>Correo</span>
                  <input type="email" value={patientForm.email} onChange={(event) => setPatientForm((current) => ({ ...current, email: event.target.value }))} />
                </label>
                <label className="field-wide">
                  <span>Diagnóstico periodontal</span>
                  <input value={patientForm.diagnosis} onChange={(event) => setPatientForm((current) => ({ ...current, diagnosis: event.target.value }))} />
                </label>
                <label>
                  <span>Nivel de riesgo</span>
                  <select value={patientForm.riskLevel} onChange={(event) => setPatientForm((current) => ({ ...current, riskLevel: event.target.value }))}>
                    <option value="">Seleccionar</option>
                    <option value="Bajo">Bajo</option>
                    <option value="Medio">Medio</option>
                    <option value="Alto">Alto</option>
                  </select>
                </label>
                <label>
                  <span>Próxima cita</span>
                  <input type="date" value={patientForm.nextAppointment} onChange={(event) => setPatientForm((current) => ({ ...current, nextAppointment: event.target.value }))} />
                </label>
                <label className="field-wide">
                  <span>Seguro</span>
                  <input value={patientForm.insurance} onChange={(event) => setPatientForm((current) => ({ ...current, insurance: event.target.value }))} />
                </label>
                <label className="field-wide">
                  <span>Notas clínicas</span>
                  <textarea rows={4} value={patientForm.notes} onChange={(event) => setPatientForm((current) => ({ ...current, notes: event.target.value }))} />
                </label>
                {patientFormError && <p className="supabase-error field-wide">{patientFormError}</p>}
                <div className="modal-actions field-wide">
                  <button type="button" className="secondary-btn" onClick={() => setIsPatientModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="primary-btn" disabled={patientSaving}>{patientSaving ? 'Guardando…' : 'Guardar paciente'}</button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App
