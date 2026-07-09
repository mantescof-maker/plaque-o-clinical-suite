type MenuItem = {
  label: string
  icon: string
  view: 'dashboard' | 'patients' | 'control' | 'photos' | 'reports' | 'settings'
}

type SidebarProps = {
  collapsed: boolean
  activeView: 'dashboard' | 'patients' | 'control' | 'photos' | 'reports' | 'settings'
  onToggle: () => void
  onNavigate: (view: 'dashboard' | 'patients' | 'control' | 'photos' | 'reports' | 'settings') => void
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: '◉', view: 'dashboard' },
  { label: 'Pacientes', icon: '◌', view: 'patients' },
  { label: 'Control de Placa', icon: '◍', view: 'control' },
  { label: 'Fotografías', icon: '◐', view: 'photos' },
  { label: 'Reportes', icon: '◑', view: 'reports' },
  { label: 'Configuración', icon: '⚙', view: 'settings' },
]

function Sidebar({ collapsed, activeView, onToggle, onNavigate }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-top">
        <div className="brand-block">
          <div className="brand-mark">P</div>
          {!collapsed && (
            <div>
              <h2>Plaque·O</h2>
              <p>Clinical Suite</p>
            </div>
          )}
        </div>
        <button type="button" className="icon-btn" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Navegación principal">
        {menuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`nav-item ${activeView === item.view ? 'active' : ''}`}
            onClick={() => onNavigate(item.view)}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="sidebar-card">
          <p className="eyebrow">Próxima revisión</p>
          <strong>08:30 hs</strong>
          <p>Seguimiento periodontal programado.</p>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
