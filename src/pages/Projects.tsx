import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const primary = '#7367f0'
const STATUSES = ['todo','inprogress','review','done']
const STATUS_LABELS = { todo:'대기', inprogress:'진행 중', review:'검토 중', done:'완료' }
const STATUS_COLORS = { todo:'#6e6b7b', inprogress:'#7367f0', review:'#ff9f43', done:'#28c76f' }

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('kanban')
  const [form, setForm] = useState(defaultForm())

  function defaultForm() {
    return { name:'', client_id:'', category:'웹', status:'todo', progress:0, start_date:'', due_date:'', budget:'', note:'' }
  }

  async function load() {
    const [p, c] = await Promise.all([
      supabase.from('projects').select('*, clients(name,company,avatar_color)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id,name,company').eq('status','active')
    ])
    setProjects(p.data || [])
    setClients(c.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    const data = { ...form, budget: form.budget ? Number(form.budget) : null, progress: Number(form.progress) }
    if (selected) await supabase.from('projects').update(data).eq('id', selected.id)
    else await supabase.from('projects').insert(data)
    setShowModal(false); setSelected(null); setForm(defaultForm()); load()
  }

  async function remove(id) {
    if (!confirm('삭제할까요?')) return
    await supabase.from('projects').delete().eq('id', id)
    load()
  }

  async function moveStatus(id, newStatus) {
    await supabase.from('projects').update({ status: newStatus }).eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? {...p, status: newStatus} : p))
  }

  function openEdit(p) {
    setSelected(p)
    setForm({ name:p.name, client_id:p.client_id||'', category:p.category||'웹', status:p.status, progress:p.progress, start_date:p.start_date||'', due_date:p.due_date||'', budget:p.budget||'', note:p.note||'' })
    setShowModal(true)
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:14 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700 }}>프로젝트 관리</div>
          <div style={{ color:'#a1a4b5', fontSize:13, marginTop:3 }}>총 {projects.length}개 · {projects.filter(p=>p.status==='inprogress').length}개 진행 중</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ display:'flex', background:'#fff', border:'1.5px solid #e7e7ff', borderRadius:8, overflow:'hidden' }}>
            <button onClick={()=>setView('kanban')} style={{ padding:'7px 14px', border:'none', background:view==='kanban'?primary:'none', color:view==='kanban'?'#fff':'#a1a4b5', cursor:'pointer', fontSize:13, fontFamily:'inherit' }}><i className="fa-solid fa-table-columns" /></button>
            <button onClick={()=>setView('list')} style={{ padding:'7px 14px', border:'none', background:view==='list'?primary:'none', color:view==='list'?'#fff':'#a1a4b5', cursor:'pointer', fontSize:13, fontFamily:'inherit' }}><i className="fa-solid fa-list" /></button>
          </div>
          <button onClick={()=>{ setSelected(null); setForm(defaultForm()); setShowModal(true) }} style={btn('primary')}>
            <i className="fa-solid fa-plus" /> 새 프로젝트
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:16, marginBottom:24 }}>
        {STATUSES.map(s => (
          <div key={s} style={{ background:'#fff', borderRadius:12, padding:'16px 20px', boxShadow:'0 4px 24px rgba(51,48,100,.06)', borderTop:`3px solid ${STATUS_COLORS[s]}` }}>
            <div style={{ fontSize:20, fontWeight:700 }}>{projects.filter(p=>p.status===s).length}</div>
            <div style={{ fontSize:11.5, color:'#a1a4b5', marginTop:3 }}>{STATUS_LABELS[s]}</div>
          </div>
        ))}
      </div>

      {loading ? <Spinner /> : view === 'kanban' ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:18 }}>
          {STATUSES.map(status => (
            <div key={status} style={{ background:'#f0f1f8', borderRadius:12, padding:16, borderTop:`3px solid ${STATUS_COLORS[status]}` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ fontSize:13, fontWeight:700, color:STATUS_COLORS[status], display:'flex', alignItems:'center', gap:8 }}>
                  <i className="fa-solid fa-circle" style={{ fontSize:8 }} />
                  {STATUS_LABELS[status]}
                  <span style={{ background:'#fff', color:'#a1a4b5', fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20 }}>{projects.filter(p=>p.status===status).length}</span>
                </div>
                <button onClick={()=>{ setSelected(null); setForm({...defaultForm(), status}); setShowModal(true) }} style={{ width:26, height:26, borderRadius:6, border:'none', background:'#fff', cursor:'pointer', color:'#a1a4b5', fontSize:13 }}><i className="fa-solid fa-plus" /></button>
              </div>
              {projects.filter(p=>p.status===status).map(p => (
                <div key={p.id} style={{ background:'#fff', borderRadius:10, padding:16, marginBottom:12, boxShadow:'0 2px 10px rgba(51,48,100,.05)', cursor:'pointer' }} onClick={() => openEdit(p)}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:10.5, fontWeight:600, padding:'2px 8px', borderRadius:4, background:STATUS_COLORS[status]+'22', color:STATUS_COLORS[status] }}>{p.category}</span>
                    <button onClick={e=>{ e.stopPropagation(); remove(p.id) }} style={{ border:'none', background:'none', cursor:'pointer', color:'#ea5455', fontSize:12 }}><i className="fa-solid fa-trash" /></button>
                  </div>
                  <div style={{ fontSize:13.5, fontWeight:600, marginBottom:4 }}>{p.name}</div>
                  <div style={{ fontSize:11.5, color:'#a1a4b5', marginBottom:12 }}>{p.clients?.company}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                    <div style={{ flex:1, height:5, background:'#eee', borderRadius:10, overflow:'hidden' }}>
                      <div style={{ width:`${p.progress}%`, height:'100%', background:STATUS_COLORS[status], borderRadius:10 }} />
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, color:'#a1a4b5' }}>{p.progress}%</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', gap:4 }}>
                      {STATUSES.filter(s=>s!==status).map(s => (
                        <button key={s} onClick={e=>{ e.stopPropagation(); moveStatus(p.id, s) }}
                          style={{ fontSize:10, padding:'2px 6px', borderRadius:4, border:'1px solid #e7e7ff', background:'#fff', cursor:'pointer', color:'#a1a4b5' }}>→{STATUS_LABELS[s]}</button>
                      ))}
                    </div>
                    {p.due_date && <span style={{ fontSize:11, color:'#a1a4b5' }}>{p.due_date}</span>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 4px 24px rgba(51,48,100,.06)', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['프로젝트명','클라이언트','상태','진행률','마감일','액션'].map(h=>(
                  <th key={h} style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:.6, color:'#a1a4b5', padding:'12px 18px', textAlign:'left', background:'#fafafe', borderBottom:'1px solid #e7e7ff' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map(p=>(
                <tr key={p.id} style={{ borderBottom:'1px solid #f4f4f9', cursor:'pointer' }} onClick={()=>openEdit(p)}>
                  <td style={{ padding:'14px 18px' }}>
                    <div style={{ fontSize:13.5, fontWeight:600 }}>{p.name}</div>
                    <div style={{ fontSize:11.5, color:'#a1a4b5' }}>{p.category}</div>
                  </td>
                  <td style={{ padding:'14px 18px', fontSize:13 }}>{p.clients?.company}</td>
                  <td style={{ padding:'14px 18px' }}><StatusBadge status={p.status} /></td>
                  <td style={{ padding:'14px 18px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:80, height:5, background:'#eee', borderRadius:10, overflow:'hidden' }}>
                        <div style={{ width:`${p.progress}%`, height:'100%', background:STATUS_COLORS[p.status] }} />
                      </div>
                      <span style={{ fontSize:11.5, color:'#a1a4b5' }}>{p.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding:'14px 18px', fontSize:13 }}>{p.due_date||'—'}</td>
                  <td style={{ padding:'14px 18px' }}>
                    <button onClick={e=>{e.stopPropagation();remove(p.id)}} style={{ border:'none', background:'#fde8e8', color:'#ea5455', borderRadius:6, padding:'5px 10px', cursor:'pointer', fontSize:12 }}><i className="fa-solid fa-trash" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={selected ? '프로젝트 수정' : '새 프로젝트'} onClose={()=>setShowModal(false)}>
          <Field label="프로젝트명 *" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:14 }}>
            <div>
              <label style={labelStyle}>클라이언트</label>
              <select value={form.client_id} onChange={e=>setForm(f=>({...f,client_id:e.target.value}))} style={inputStyle}>
                <option value="">선택</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>카테고리</label>
              <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={inputStyle}>
                {['웹','UI/UX','브랜드','랜딩','SEO','기타'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>시작일</label>
              <input type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>마감일</label>
              <input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>상태</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={inputStyle}>
                {STATUSES.map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>진행률 ({form.progress}%)</label>
              <input type="range" min="0" max="100" value={form.progress} onChange={e=>setForm(f=>({...f,progress:Number(e.target.value)}))} style={{ width:'100%' }} />
            </div>
            <div>
              <label style={labelStyle}>예산 (원)</label>
              <input type="number" value={form.budget} onChange={e=>setForm(f=>({...f,budget:e.target.value}))} style={inputStyle} placeholder="1000000" />
            </div>
          </div>
          <div style={{ marginTop:14 }}>
            <label style={labelStyle}>메모</label>
            <textarea value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} rows={2} style={{...inputStyle,resize:'vertical'}} />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
            <button onClick={()=>setShowModal(false)} style={btn('outline')}>취소</button>
            <button onClick={save} style={btn('primary')}>{selected?'수정 완료':'추가하기'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const bg = { todo:'#f0f0f0', inprogress:'#ede9fd', review:'#fff3e0', done:'#dff5e9' }
  return <span style={{ fontSize:10.5, fontWeight:600, padding:'3px 10px', borderRadius:20, background:bg[status], color:STATUS_COLORS[status] }}>{STATUS_LABELS[status]}</span>
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(30,28,60,.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(2px)' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#fff', borderRadius:16, width:540, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(51,48,100,.2)' }}>
        <div style={{ padding:'22px 26px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:17, fontWeight:700 }}>{title}</div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'none', background:'#f4f5fb', cursor:'pointer', fontSize:14, color:'#a1a4b5' }}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div style={{ padding:'20px 26px 26px' }}>{children}</div>
      </div>
    </div>
  )
}
const labelStyle: React.CSSProperties = { fontSize:12.5, fontWeight:600, color:'#444564', marginBottom:6, display:'block' }
const inputStyle: React.CSSProperties = { width:'100%', padding:'9px 14px', borderRadius:8, border:'1.5px solid #e7e7ff', fontSize:13.5, fontFamily:'inherit', color:'#444564', outline:'none', boxSizing:'border-box' }
function Field({ label, value, onChange }) {
  return <div><label style={labelStyle}>{label}</label><input value={value} onChange={e=>onChange(e.target.value)} style={inputStyle} /></div>
}
function btn(type) {
  if(type==='primary') return { display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:8, fontSize:13.5, fontWeight:600, cursor:'pointer', border:'none', background:'#7367f0', color:'#fff', fontFamily:'inherit' }
  return { display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:8, fontSize:13.5, fontWeight:600, cursor:'pointer', border:'1.5px solid #e7e7ff', background:'#fff', color:'#444564', fontFamily:'inherit' }
}
function Spinner() { return <div style={{ display:'flex', justifyContent:'center', padding:40 }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize:28, color:'#7367f0' }} /></div> }