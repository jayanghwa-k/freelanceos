import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const primary = '#7367f0'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(defaultForm())

  function defaultForm() {
    return { name:'', company:'', email:'', phone:'', address:'', website:'', category:'웹개발', status:'active', avatar_color:'linear-gradient(135deg,#7367f0,#a78bfa)', note:'' }
  }

  async function load() {
    const { data } = await supabase.from('clients').select('*, projects(id)').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (selected) await supabase.from('clients').update(form).eq('id', selected.id)
    else await supabase.from('clients').insert(form)
    setShowModal(false); setSelected(null); setForm(defaultForm()); load()
  }

  async function remove(id) {
    if (!confirm('삭제할까요?')) return
    await supabase.from('clients').delete().eq('id', id)
    load()
  }

  function openEdit(c) {
    setSelected(c)
    setForm({ name:c.name, company:c.company||'', email:c.email||'', phone:c.phone||'', address:c.address||'', website:c.website||'', category:c.category||'웹개발', status:c.status, avatar_color:c.avatar_color, note:c.note||'' })
    setShowModal(true)
  }

  const filtered = clients.filter(c => c.name?.includes(search) || c.company?.includes(search) || c.email?.includes(search))
  const COLORS = ['linear-gradient(135deg,#7367f0,#a78bfa)','linear-gradient(135deg,#28c76f,#48da89)','linear-gradient(135deg,#ff9f43,#ffb976)','linear-gradient(135deg,#00cfe8,#1de9b6)','linear-gradient(135deg,#ea5455,#f08182)','linear-gradient(135deg,#667eea,#764ba2)']

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:14 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700 }}>클라이언트 관리</div>
          <div style={{ color:'#a1a4b5', fontSize:13, marginTop:3 }}>총 {clients.length}명 · {clients.filter(c=>c.status==='active').length}명 활성</div>
        </div>
        <button onClick={()=>{ setSelected(null); setForm(defaultForm()); setShowModal(true) }} style={btnStyle('primary')}>
          <i className="fa-solid fa-plus" /> 클라이언트 추가
        </button>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1.5px solid #e7e7ff', borderRadius:8, padding:'7px 14px', flex:1, maxWidth:300 }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color:'#a1a4b5', fontSize:13 }} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="이름, 회사, 이메일 검색..." style={{ border:'none', outline:'none', fontSize:13, fontFamily:'inherit', width:'100%' }} />
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
          {filtered.map(c => (
            <div key={c.id} style={{ background:'#fff', borderRadius:12, boxShadow:'0 4px 24px rgba(51,48,100,.06)', overflow:'hidden', transition:'transform .2s', cursor:'pointer' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='none'}>
              <div style={{ padding:'20px 20px 0', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                <div style={{ width:54, height:54, borderRadius:14, background:c.avatar_color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:20, color:'#fff' }}>{c.name?.charAt(0)}</div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:10.5, fontWeight:600, padding:'3px 10px', borderRadius:20, background:c.status==='active'?'#dff5e9':'#f0f0f0', color:c.status==='active'?'#28c76f':'#888' }}>{c.status==='active'?'활성':'비활성'}</span>
                  <button onClick={()=>openEdit(c)} style={{ border:'none', background:'none', cursor:'pointer', color:'#a1a4b5', fontSize:14 }}><i className="fa-solid fa-ellipsis" /></button>
                </div>
              </div>
              <div style={{ padding:'14px 20px 18px' }}>
                <div style={{ fontSize:15, fontWeight:700 }}>{c.name}</div>
                <div style={{ fontSize:12.5, color:'#a1a4b5', marginBottom:12, display:'flex', alignItems:'center', gap:5 }}>
                  <i className="fa-solid fa-building" style={{ fontSize:10 }} /> {c.company}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop:'1px solid #f0f0f7', paddingTop:12, textAlign:'center' }}>
                  <div><div style={{ fontSize:15, fontWeight:700 }}>{c.projects?.length||0}</div><div style={{ fontSize:10.5, color:'#a1a4b5' }}>프로젝트</div></div>
                  <div style={{ borderLeft:'1px solid #f0f0f7', borderRight:'1px solid #f0f0f7' }}><div style={{ fontSize:13, fontWeight:700 }}>—</div><div style={{ fontSize:10.5, color:'#a1a4b5' }}>수익</div></div>
                  <div><div style={{ fontSize:13, fontWeight:700 }}>⭐{c.rating}</div><div style={{ fontSize:10.5, color:'#a1a4b5' }}>만족도</div></div>
                </div>
              </div>
              <div style={{ padding:'12px 20px', borderTop:'1px solid #f0f0f7', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', gap:6 }}>
                  {c.email && <a href={`mailto:${c.email}`} style={contactBtn}><i className="fa-solid fa-envelope" /></a>}
                  {c.phone && <a href={`tel:${c.phone}`} style={contactBtn}><i className="fa-solid fa-phone" /></a>}
                </div>
                <button onClick={()=>remove(c.id)} style={{ border:'none', background:'none', cursor:'pointer', color:'#ea5455', fontSize:13 }}><i className="fa-solid fa-trash" /></button>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div style={{ gridColumn:'1/-1', textAlign:'center', color:'#a1a4b5', padding:40 }}>클라이언트가 없어요</div>}
        </div>
      )}

      {showModal && (
        <Modal title={selected?'클라이언트 수정':'클라이언트 추가'} onClose={()=>setShowModal(false)}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
            <div style={{ width:56, height:56, borderRadius:14, background:form.avatar_color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'#fff' }}>{form.name?.charAt(0)||'?'}</div>
            <div>
              <div style={{ fontSize:12.5, fontWeight:600, marginBottom:8 }}>아바타 색상</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {COLORS.map(col=>(
                  <div key={col} onClick={()=>setForm(f=>({...f,avatar_color:col}))}
                    style={{ width:28, height:28, borderRadius:6, background:col, cursor:'pointer', border:form.avatar_color===col?'2.5px solid #2c2c3e':'2.5px solid transparent', transition:'all .15s' }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Field label="이름 *" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} />
            <Field label="회사명" value={form.company} onChange={v=>setForm(f=>({...f,company:v}))} />
            <Field label="이메일" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} type="email" />
            <Field label="전화번호" value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} />
            <Field label="주소" value={form.address} onChange={v=>setForm(f=>({...f,address:v}))} />
            <Field label="웹사이트" value={form.website} onChange={v=>setForm(f=>({...f,website:v}))} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:14 }}>
            <div>
              <label style={labelStyle}>카테고리</label>
              <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={inputStyle}>
                {['웹개발','UI/UX','브랜딩','콘텐츠','SEO','기타'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>상태</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={inputStyle}>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop:14 }}>
            <label style={labelStyle}>메모</label>
            <textarea value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} rows={3} style={{...inputStyle,resize:'vertical'}} placeholder="커뮤니케이션 방식, 결제 방법 등..." />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
            <button onClick={()=>setShowModal(false)} style={btnStyle('outline')}>취소</button>
            <button onClick={save} style={btnStyle('primary')}>{selected?'수정 완료':'추가하기'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

const contactBtn = { width:30, height:30, borderRadius:7, border:'1.5px solid #e7e7ff', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', color:'#a1a4b5', fontSize:12, cursor:'pointer', textDecoration:'none' }
const labelStyle = { fontSize:12.5, fontWeight:600, color:'#444564', marginBottom:6, display:'block' }
const inputStyle = { width:'100%', padding:'9px 14px', borderRadius:8, border:'1.5px solid #e7e7ff', fontSize:13.5, fontFamily:'inherit', color:'#444564', outline:'none', boxSizing:'border-box' }
function Field({ label, value, onChange, type='text' }) {
  return <div><label style={labelStyle}>{label}</label><input type={type} value={value} onChange={e=>onChange(e.target.value)} style={inputStyle} /></div>
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(30,28,60,.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(2px)' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#fff', borderRadius:16, width:540, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(51,48,100,.2)' }}>
        <div style={{ padding:'22px 26px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:17, fontWeight:700 }}>{title}</div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'none', background:'#f4f5fb', cursor:'pointer', fontSize:14, color:'#a1a4b5' }}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div style={{ padding:'20px 26px 26px' }}>{children}</div>
      </div>
    </div>
  )
}
function btnStyle(type) {
  if(type==='primary') return { display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:8, fontSize:13.5, fontWeight:600, cursor:'pointer', border:'none', background:'#7367f0', color:'#fff', fontFamily:'inherit' }
  return { display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:8, fontSize:13.5, fontWeight:600, cursor:'pointer', border:'1.5px solid #e7e7ff', background:'#fff', color:'#444564', fontFamily:'inherit' }
}
function Spinner() { return <div style={{ display:'flex', justifyContent:'center', padding:40 }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize:28, color:'#7367f0' }} /></div> }