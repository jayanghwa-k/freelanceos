import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const primary = '#7367f0'
const DAYS = ['일','월','화','수','목','금','토']
const CATEGORIES = ['미팅','마감일','인보이스','개인','기타']
const CAT_COLORS = { '미팅':'#7367f0','마감일':'#ff9f43','인보이스':'#28c76f','개인':'#00cfe8','기타':'#e91e8c' }

export default function Calendar() {
  const [events, setEvents] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [cur, setCur] = useState({ y:new Date().getFullYear(), m:new Date().getMonth() })
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(defaultForm())
  const today = new Date()

  function defaultForm(date='') {
    return { title:'', category:'미팅', color:primary, start_date:date, end_date:'', start_time:'', end_time:'', all_day:false, client_id:'', note:'' }
  }

  async function load() {
    const [ev, cl] = await Promise.all([
      supabase.from('events').select('*, clients(name,company)').order('start_date'),
      supabase.from('clients').select('id,name,company').eq('status','active'),
    ])
    setEvents(ev.data || [])
    setClients(cl.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    const data = { ...form, color:CAT_COLORS[form.category]||primary }
    if (selected) await supabase.from('events').update(data).eq('id', selected.id)
    else await supabase.from('events').insert(data)
    setShowModal(false); setSelected(null); setForm(defaultForm()); load()
  }

  async function remove(id) {
    await supabase.from('events').delete().eq('id', id)
    load()
  }

  function openEdit(ev) {
    setSelected(ev)
    setForm({ title:ev.title, category:ev.category, color:ev.color, start_date:ev.start_date, end_date:ev.end_date||'', start_time:ev.start_time||'', end_time:ev.end_time||'', all_day:ev.all_day, client_id:ev.client_id||'', note:ev.note||'' })
    setShowModal(true)
  }

  const firstDay = new Date(cur.y, cur.m, 1).getDay()
  const daysInMonth = new Date(cur.y, cur.m+1, 0).getDate()
  const prevDays = new Date(cur.y, cur.m, 0).getDate()

  function eventsOnDay(d) {
    const dateStr = `${cur.y}-${String(cur.m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    return events.filter(e=>e.start_date===dateStr)
  }

  const upcomingEvents = events.filter(e=>e.start_date>=today.toISOString().slice(0,10)).slice(0,6)

  return (
    <div style={{ display:'flex', gap:20, height:'calc(100vh - 128px)' }}>
      <div style={{ width:260, flexShrink:0, background:'#fff', borderRadius:12, padding:20, boxShadow:'0 4px 24px rgba(51,48,100,.06)', overflowY:'auto' }}>
        <button onClick={()=>{ setSelected(null); setForm(defaultForm(today.toISOString().slice(0,10))); setShowModal(true) }} style={{ ...btn('primary'), width:'100%', justifyContent:'center', marginBottom:20 }}>
          <i className="fa-solid fa-plus" /> 일정 추가
        </button>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <button onClick={()=>setCur(c=>c.m===0?{y:c.y-1,m:11}:{...c,m:c.m-1})} style={miniNav}><i className="fa-solid fa-chevron-left" /></button>
          <span style={{ fontSize:14, fontWeight:700 }}>{cur.y}년 {cur.m+1}월</span>
          <button onClick={()=>setCur(c=>c.m===11?{y:c.y+1,m:0}:{...c,m:c.m+1})} style={miniNav}><i className="fa-solid fa-chevron-right" /></button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1, textAlign:'center', marginBottom:16 }}>
          {DAYS.map(d=><div key={d} style={{ fontSize:10, fontWeight:700, color:'#a1a4b5', padding:'4px 0' }}>{d}</div>)}
          {Array.from({length:firstDay},(_,i)=><div key={'p'+i} style={{ fontSize:12, padding:'5px 2px', color:'#ccc' }}>{prevDays-firstDay+1+i}</div>)}
          {Array.from({length:daysInMonth},(_,i)=>{
            const d=i+1
            const isToday=cur.y===today.getFullYear()&&cur.m===today.getMonth()&&d===today.getDate()
            return <div key={d} style={{ fontSize:12, padding:'5px 2px', borderRadius:6, cursor:'pointer', background:isToday?primary:'transparent', color:isToday?'#fff':'#444564', fontWeight:isToday?700:'normal', position:'relative' }}
              onClick={()=>{ setSelected(null); setForm(defaultForm(`${cur.y}-${String(cur.m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`)); setShowModal(true) }}>
              {d}
              {eventsOnDay(d).length>0 && <span style={{ position:'absolute', bottom:1, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:isToday?'rgba(255,255,255,.7)':'#ff9f43' }} />}
            </div>
          })}
        </div>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, color:'#a1a4b5', marginBottom:10 }}>카테고리</div>
        {CATEGORIES.map(cat=>(
          <div key={cat} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', fontSize:13, fontWeight:500 }}>
            <div style={{ width:12, height:12, borderRadius:3, background:CAT_COLORS[cat] }} />{cat}
          </div>
        ))}
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, color:'#a1a4b5', margin:'16px 0 10px', borderTop:'1px solid #f0f0f7', paddingTop:16 }}>다가오는 일정</div>
        {upcomingEvents.map(ev=>(
          <div key={ev.id} style={{ display:'flex', gap:8, padding:'8px 0', borderBottom:'1px solid #f4f4f9', cursor:'pointer' }} onClick={()=>openEdit(ev)}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:ev.color||primary, flexShrink:0, marginTop:5 }} />
            <div>
              <div style={{ fontSize:12.5, fontWeight:600 }}>{ev.title}</div>
              <div style={{ fontSize:11, color:'#a1a4b5', marginTop:2 }}>{ev.start_date} {ev.start_time?.slice(0,5)}</div>
            </div>
          </div>
        ))}
        {upcomingEvents.length===0 && <div style={{ fontSize:12, color:'#a1a4b5' }}>다가오는 일정이 없어요</div>}
      </div>

      <div style={{ flex:1, background:'#fff', borderRadius:12, boxShadow:'0 4px 24px rgba(51,48,100,.06)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e7e7ff', display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>setCur(c=>c.m===0?{y:c.y-1,m:11}:{...c,m:c.m-1})} style={navBtn}><i className="fa-solid fa-chevron-left" /></button>
          <button onClick={()=>setCur({y:today.getFullYear(),m:today.getMonth()})} style={{ padding:'7px 16px', borderRadius:8, border:'1.5px solid #e7e7ff', background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit' }}>오늘</button>
          <button onClick={()=>setCur(c=>c.m===11?{y:c.y+1,m:0}:{...c,m:c.m+1})} style={navBtn}><i className="fa-solid fa-chevron-right" /></button>
          <span style={{ fontSize:18, fontWeight:800 }}>{cur.y}년 {cur.m+1}월</span>
        </div>
        {loading ? <Spinner /> : (
          <div style={{ flex:1, overflowY:'auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'#fafafe', borderBottom:'1px solid #e7e7ff' }}>
              {DAYS.map((d,i)=><div key={d} style={{ padding:10, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:.6, color:i===0||i===6?'#ea5455':'#a1a4b5', textAlign:'center' }}>{d}</div>)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
              {Array.from({length:firstDay},(_,i)=>(
                <div key={'p'+i} style={{ minHeight:100, padding:8, borderRight:'1px solid #f0f0f7', borderBottom:'1px solid #f0f0f7', background:'#fafafe' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#ccc', width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center' }}>{prevDays-firstDay+1+i}</div>
                </div>
              ))}
              {Array.from({length:daysInMonth},(_,i)=>{
                const d=i+1
                const isToday=cur.y===today.getFullYear()&&cur.m===today.getMonth()&&d===today.getDate()
                const dayEvs=eventsOnDay(d)
                return (
                  <div key={d} style={{ minHeight:100, padding:8, borderRight:'1px solid #f0f0f7', borderBottom:'1px solid #f0f0f7', cursor:'pointer', background:isToday?'rgba(115,103,240,.02)':'#fff' }}
                    onClick={()=>{ setSelected(null); setForm(defaultForm(`${cur.y}-${String(cur.m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`)); setShowModal(true) }}>
                    <div style={{ fontSize:13, fontWeight:600, width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', background:isToday?primary:'transparent', color:isToday?'#fff':'#444564', marginBottom:4 }}>{d}</div>
                    {dayEvs.slice(0,2).map(ev=>(
                      <div key={ev.id} onClick={e=>{ e.stopPropagation(); openEdit(ev) }}
                        style={{ fontSize:11, fontWeight:600, padding:'2px 7px', borderRadius:4, marginBottom:3, background:(ev.color||primary)+'22', color:ev.color||primary, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', cursor:'pointer' }}>
                        {ev.title}
                      </div>
                    ))}
                    {dayEvs.length>2 && <div style={{ fontSize:11, color:'#a1a4b5' }}>+{dayEvs.length-2}개 더</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(30,28,60,.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(2px)' }} onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={{ background:'#fff', borderRadius:16, width:500, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(51,48,100,.2)' }}>
            <div style={{ padding:'22px 26px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:17, fontWeight:700 }}>{selected?'일정 수정':'일정 추가'}</div>
              <button onClick={()=>setShowModal(false)} style={{ width:32, height:32, borderRadius:8, border:'none', background:'#f4f5fb', cursor:'pointer', fontSize:14, color:'#a1a4b5' }}><i className="fa-solid fa-xmark" /></button>
            </div>
            <div style={{ padding:'20px 26px 26px' }}>
              <div style={{ marginBottom:16 }}>
                <label style={labelStyle}>제목 *</label>
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={inputStyle} placeholder="일정 제목" />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={labelStyle}>카테고리</label>
                  <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value,color:CAT_COLORS[e.target.value]}))} style={inputStyle}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>클라이언트</label>
                  <select value={form.client_id} onChange={e=>setForm(f=>({...f,client_id:e.target.value}))} style={inputStyle}>
                    <option value="">없음</option>
                    {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>날짜 *</label><input type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))} style={inputStyle} /></div>
                <div><label style={labelStyle}>종료 날짜</label><input type="date" value={form.end_date} onChange={e=>setForm(f=>({...f,end_date:e.target.value}))} style={inputStyle} /></div>
                <div><label style={labelStyle}>시작 시간</label><input type="time" value={form.start_time} onChange={e=>setForm(f=>({...f,start_time:e.target.value}))} style={inputStyle} /></div>
                <div><label style={labelStyle}>종료 시간</label><input type="time" value={form.end_time} onChange={e=>setForm(f=>({...f,end_time:e.target.value}))} style={inputStyle} /></div>
              </div>
              <div style={{ marginTop:14 }}>
                <label style={labelStyle}>메모</label>
                <textarea value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} rows={2} style={{...inputStyle,resize:'vertical'}} />
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
                {selected && <button onClick={()=>remove(selected.id).then(()=>setShowModal(false))} style={{ ...btn('outline'), color:'#ea5455', borderColor:'#ea5455' }}>삭제</button>}
                <button onClick={()=>setShowModal(false)} style={btn('outline')}>취소</button>
                <button onClick={save} style={btn('primary')}>{selected?'수정 완료':'추가하기'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const miniNav: React.CSSProperties = { width:26, height:26, borderRadius:6, border:'1.5px solid #e7e7ff', background:'none', cursor:'pointer', color:'#a1a4b5', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }
const navBtn: React.CSSProperties = { width:34, height:34, borderRadius:8, border:'1.5px solid #e7e7ff', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#a1a4b5', fontSize:13 }
const labelStyle: React.CSSProperties = { fontSize:12.5, fontWeight:600, color:'#444564', marginBottom:6, display:'block' }
const inputStyle: React.CSSProperties = { width:'100%', padding:'9px 14px', borderRadius:8, border:'1.5px solid #e7e7ff', fontSize:13.5, fontFamily:'inherit', color:'#444564', outline:'none', boxSizing:'border-box' }
function btn(type) {
  if(type==='primary') return { display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:8, fontSize:13.5, fontWeight:600, cursor:'pointer', border:'none', background:'#7367f0', color:'#fff', fontFamily:'inherit' }
  return { display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:8, fontSize:13.5, fontWeight:600, cursor:'pointer', border:'1.5px solid #e7e7ff', background:'#fff', color:'#444564', fontFamily:'inherit' }
}
function Spinner() { return <div style={{ display:'flex', justifyContent:'center', padding:40 }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize:28, color:'#7367f0' }} /></div> }