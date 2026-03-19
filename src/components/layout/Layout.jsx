import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('fos_sidebar_collapsed') === '1'
  )

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('fos_sidebar_collapsed', next ? '1' : '0')
  }

  const sw = collapsed ? 68 : 260

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f5fb', fontFamily: "'Public Sans', sans-serif" }}>

      <aside style={{
        width: sw, flexShrink: 0, background: '#2f3349',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', zIndex: 100,
        transition: 'width .28s cubic-bezier(.4,0,.2,1)', overflow: 'hidden'
      }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,.06)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#7367f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>F</div>
          {!collapsed && <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>Freelance<span style={{ color: '#7367f0' }}>OS</span></span>}
        </div>

        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto', overflowX: 'hidden' }}>
          <NavSection label="Main" collapsed={collapsed} />
          <NavItem to="/" icon="fa-gauge-high" label="Dashboard" collapsed={collapsed} />
          <NavItem to="/projects" icon="fa-folder-open" label="Projects" badge="4" collapsed={collapsed} />
          <NavItem to="/calendar" icon="fa-calendar-days" label="Calendar" collapsed={collapsed} />
          <NavSection label="Finance" collapsed={collapsed} />
          <NavItem to="/invoices" icon="fa-file-invoice-dollar" label="Invoices" badge="2" badgeColor="#ff9f43" collapsed={collapsed} />
          <NavSection label="Clients" collapsed={collapsed} />
          <NavItem to="/clients" icon="fa-users" label="Clients" collapsed={collapsed} />
          <NavSection label="Settings" collapsed={collapsed} />
          <NavItem to="/settings" icon="fa-gear" label="Settings" collapsed={collapsed} />
        </nav>

        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 10, background: 'rgba(255,255,255,.05)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7367f0,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>J</div>
            {!collapsed && (
              <div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>John Doe</div>
                <div style={{ color: '#a3a8c3', fontSize: 11 }}>Freelancer</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <button onClick={toggle} style={{
        position: 'fixed', top: '50%', left: sw,
        transform: 'translateY(-50%) translateX(-50%)',
        width: 24, height: 48, background: '#fff',
        border: '1.5px solid #e7e7ff', borderRadius: '0 12px 12px 0',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#a1a4b5', fontSize: 11, zIndex: 101,
        transition: 'left .28s cubic-bezier(.4,0,.2,1)',
        boxShadow: '2px 0 10px rgba(51,48,100,.08)'
      }}>
        <i className={`fa-solid fa-chevron-${collapsed ? 'right' : 'left'}`} />
      </button>

      <div style={{ marginLeft: sw, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left .28s cubic-bezier(.4,0,.2,1)', minWidth: 0 }}>
        <header style={{ height: 64, background: '#fff', borderBottom: '1px solid #e7e7ff', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 28px', position: 'sticky', top: 0, zIndex: 90, boxShadow: '0 2px 12px rgba(51,48,100,.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HeaderBtn icon="fa-magnifying-glass" />
            <HeaderBtn icon="fa-bell" dot />
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7367f0,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginLeft: 4 }}>J</div>
          </div>
        </header>
        <main style={{ flex: 1, padding: 28 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NavSection({ label, collapsed }) {
  if (collapsed) return <div style={{ height: 8 }} />
  return <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: 1, color: 'rgba(163,168,195,.5)', textTransform: 'uppercase', padding: '16px 24px 6px' }}>{label}</div>
}

function NavItem({ to, icon, label, badge, badgeColor = '#7367f0', collapsed }) {
  return (
    <NavLink to={to} end={to === '/'} style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 20px', color: isActive ? '#fff' : '#a3a8c3',
      fontSize: 13.5, fontWeight: 500, textDecoration: 'none',
      background: isActive ? 'linear-gradient(270deg,rgba(115,103,240,.1),rgba(115,103,240,.22))' : 'transparent',
      position: 'relative', overflow: 'hidden', whiteSpace: 'nowrap',
      borderRight: isActive ? '3px solid #7367f0' : '3px solid transparent',
      transition: 'all .2s'
    })}>
      <i className={`fa-solid ${icon}`} style={{ width: 18, fontSize: 15, textAlign: 'center', flexShrink: 0 }} />
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && badge && (
        <span style={{ background: badgeColor, color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20 }}>{badge}</span>
      )}
    </NavLink>
  )
}

function HeaderBtn({ icon, dot }) {
  return (
    <button style={{ width: 38, height: 38, borderRadius: 8, border: 'none', background: '#f4f5fb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a4b5', fontSize: 15, position: 'relative' }}>
      <i className={`fa-solid ${icon}`} />
      {dot && <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#ea5455', border: '1.5px solid #fff' }} />}
    </button>
  )
}