import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const primary = '#7367f0'

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('전체')
  const [selected, setSelected] = useState(null)
  const [items, setItems] = useState([{ description:'', quantity:1, unit_price:0 }])
  const [form, setForm] = useState(defaultForm())

  function defaultForm() {
    return { invoice_number:`INV-${Date.now().toString().slice(-4)}`, client_id:'', project_id:'', issue_date:new Date().toISOString().slice(0,10), due_date:'', status:'draft', tax_rate:10, note:'' }
  }

  async function load() {
    const [inv, cli] = await Promise.all([
      supabase.from('invoices_with_totals').select('*').order('created_at', { ascending:false }),
      supabase.from('clients').select('id,name,company').eq('status','active'),
    ])
    setInvoices(inv.data || [])
    setClients(cli.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    let invId
    if (selected) {
      await supabase.from('invoices').update(form).eq('id', selected.id)
      invId = selected.id
      await supabase.from('invoice_items').delete().eq('invoice_id', invId)
    } else {
      const { data } = await supabase.from('invoices').insert(form).select('id').single()
      invId = data.id
    }
    await supabase.from('invoice_items').insert(
      items.filter(i=>i.description).map(i=>({ invoice_id:invId, description:i.description, quantity:Number(i.quantity), unit_price:Number(i.unit_price) }))
    )
    setShowModal(false); setSelected(null); setForm(defaultForm()); setItems([{description:'',quantity:1,unit_price:0}]); load()
  }

  async function remove(id) {
    if (!confirm('삭제할까요?')) return
    await supabase.from('invoices').delete().eq('id', id)
    load()
  }

  async function updateStatus(id, status) {
    await supabase.from('invoices').update({ status }).eq('id', id)
    load()
  }

  function copyLink(inv) {
    const url = `${window.location.origin}/invoice/${inv.id}?pw=${inv.access_password}`
    navigator.clipboard.writeText(url)
    alert('링크가 복사됐어요!\n' + url)
  }

  const subtotal = items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.unit_price||0),0)
  const tax = subtotal * (Number(form.tax_rate)/100)
  const total = subtotal + tax

  const TABS = ['전체','초안','발송됨','대기','완료','연체']
  const STATUS_MAP = { '전체':null, '초안':'draft', '발송됨':'sent', '대기':'pending', '완료':'paid', '연체':'overdue' }
  const filtered = filter==='전체' ? invoices : invoices.filter(i=>i.status===STATUS_MAP[filter])
  const totalRevenue = invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+Number(i.total_amount),0)
  const pendingAmt = invoices.filter(i=>['pending','sent'].includes(i.status)).reduce((s,i)=>s+Number(i.total_amount),0)
  const overdueAmt = invoices.filter(i=>i.status==='overdue').reduce((s,i)=>s+Number(i.total_amount),0)

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:14 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700 }}>인보이스 관리</div>
          <div style={{ color:'#a1a4b5', fontSize:13, marginTop:3 }}>총 {invoices.length}건</div>
        </div>
        <button onClick={()=>{ setSelected(null); setForm(defaultForm()); setItems([{description:'',quantity:1,unit_price:0}]); setShowModal(true) }} style={btn('primary')}>
          <i className="fa-solid fa-plus" /> 인보이스 작성
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:24 }}>
        <StatCard icon="fa-circle-check" color="#28c76f" label="수금 완료" value={`₩${(totalRevenue/10000).toFixed(0)}만`} />
        <StatCard icon="fa-clock" color="#ff9f43" label="미결 금액" value={`₩${(pendingAmt/10000).toFixed(0)}만`} />
        <StatCard icon="fa-triangle-exclamation" color="#ea5455" label="연체 금액" value={`₩${(overdueAmt/10000).toFixed(0)}만`} />
        <StatCard icon="fa-file-invoice" color={primary} label="전체 인보이스" value={invoices.length} />
      </div>

      <div style={{ display:'flex', background:'#fff', borderRadius:8, border:'1.5px solid #e7e7ff', overflow:'hidden', marginBottom:20, width:'fit-content' }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setFilter(t)} style={{ padding:'8px 16px', fontSize:13, fontWeight:500, cursor:'pointer', color:filter===t?'#fff':'#a1a4b5', background:filter===t?primary:'transparent', border:'none', fontFamily:'inherit' }}>{t}</button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 4px 24px rgba(51,48,100,.06)', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['번호','클라이언트','발행일','마감일','금액','상태','전자서명','액션'].map(h=>(
                <th key={h} style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:.6, color:'#a1a4b5', padding:'13px 18px', textAlign:'left', background:'#fafafe', borderBottom:'1px solid #e7e7ff' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(inv=>(
                <tr key={inv.id} style={{ borderBottom:'1px solid #f4f4f9' }}>
                  <td style={{ padding:'15px 18px', fontWeight:700, color:primary, fontSize:13 }}>#{inv.invoice_number}</td>
                  <td style={{ padding:'15px 18px', fontSize:13 }}>
                    <div style={{ fontWeight:600 }}>{inv.client_name}</div>
                    <div style={{ fontSize:11.5, color:'#a1a4b5' }}>{inv.client_company}</div>
                  </td>
                  <td style={{ padding:'15px 18px', fontSize:13 }}>{inv.issue_date}</td>
                  <td style={{ padding:'15px 18px', fontSize:13, color:inv.status==='overdue'?'#ea5455':'inherit', fontWeight:inv.status==='overdue'?600:'normal' }}>{inv.due_date}</td>
                  <td style={{ padding:'15px 18px', fontSize:14, fontWeight:700 }}>₩{Number(inv.total_amount).toLocaleString()}</td>
                  <td style={{ padding:'15px 18px' }}><StatusBadge status={inv.status} /></td>
                  <td style={{ padding:'15px 18px', fontSize:11.5 }}>
                    {inv.signed_at
                      ? <span style={{ color:'#28c76f', display:'flex', alignItems:'center', gap:4 }}><i className="fa-solid fa-circle-check" /> 서명 완료</span>
                      : <span style={{ color:'#a1a4b5', display:'flex', alignItems:'center', gap:4 }}><i className="fa-regular fa-circle-xmark" /> 미서명</span>
                    }
                  </td>
                  <td style={{ padding:'15px 18px' }}>
                    <div style={{ display:'flex', gap:4 }}>
                      <ActionBtn icon="fa-link" title="링크 복사" onClick={()=>copyLink(inv)} />
                      <ActionBtn icon="fa-paper-plane" title="발송" onClick={()=>updateStatus(inv.id,'sent')} />
                      <ActionBtn icon="fa-trash" title="삭제" onClick={()=>remove(inv.id)} danger />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={8} style={{ padding:30, textAlign:'center', color:'#a1a4b5' }}>인보이스가 없어요</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="새 인보이스 작성" onClose={()=>setShowModal(false)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div><label style={labelStyle}>인보이스 번호</label><input value={form.invoice_number} onChange={e=>setForm(f=>({...f,invoice_number:e.target.value}))} style={inputStyle} /></div>
            <div>
              <label style={labelStyle}>클라이언트 *</label>
              <select value={form.client_id} onChange={e=>setForm(f=>({...f,client_id:e.target.value}))} style={inputStyle}>
                <option value="">선택</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>발행일</label><input type="date" value={form.issue_date} onChange={e=>setForm(f=>({...f,issue_date:e.target.value}))} style={inputStyle} /></div>
            <div><label style={labelStyle}>마감일</label><input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} style={inputStyle} /></div>
          </div>
          <div style={{ marginTop:20, marginBottom:8, fontSize:13, fontWeight:700 }}>청구 항목</div>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:8 }}>
            <thead><tr>{['항목명','수량','단가','합계',''].map(h=><th key={h} style={{ fontSize:11, fontWeight:600, color:'#a1a4b5', padding:'6px 8px', textAlign:'left', background:'#f4f5fb' }}>{h}</th>)}</tr></thead>
            <tbody>
              {items.map((item,i)=>(
                <tr key={i}>
                  <td style={{ padding:'4px' }}><input value={item.description} onChange={e=>{ const n=[...items]; n[i].description=e.target.value; setItems(n) }} style={{...inputStyle,padding:'7px 10px'}} placeholder="디자인 작업" /></td>
                  <td style={{ padding:'4px', width:60 }}><input type="number" value={item.quantity} onChange={e=>{ const n=[...items]; n[i].quantity=e.target.value; setItems(n) }} style={{...inputStyle,padding:'7px 10px'}} /></td>
                  <td style={{ padding:'4px', width:120 }}><input type="number" value={item.unit_price} onChange={e=>{ const n=[...items]; n[i].unit_price=e.target.value; setItems(n) }} style={{...inputStyle,padding:'7px 10px'}} placeholder="500000" /></td>
                  <td style={{ padding:'4px 8px', fontSize:13, fontWeight:600, whiteSpace:'nowrap' }}>₩{(Number(item.quantity)*Number(item.unit_price)).toLocaleString()}</td>
                  <td><button onClick={()=>setItems(items.filter((_,j)=>j!==i))} style={{ border:'none', background:'none', cursor:'pointer', color:'#ea5455' }}><i className="fa-solid fa-xmark" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={()=>setItems([...items,{description:'',quantity:1,unit_price:0}])} style={{ color:primary, border:'none', background:'none', cursor:'pointer', fontSize:12.5, fontWeight:600, padding:'4px 0' }}>
            <i className="fa-solid fa-plus" /> 항목 추가
          </button>
          <div style={{ background:'#f4f5fb', borderRadius:8, padding:'12px 16px', marginTop:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'3px 0', color:'#a1a4b5' }}><span>소계</span><span>₩{subtotal.toLocaleString()}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'3px 0', color:'#a1a4b5', alignItems:'center' }}>
              <span>부가세 <select value={form.tax_rate} onChange={e=>setForm(f=>({...f,tax_rate:e.target.value}))} style={{ border:'none', background:'transparent', fontSize:12, color:'#a1a4b5' }}><option value="0">0%</option><option value="10">10%</option></select></span>
              <span>₩{tax.toLocaleString()}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:800, color:primary, borderTop:'1px solid #e7e7ff', paddingTop:8, marginTop:4 }}><span>합계</span><span>₩{total.toLocaleString()}</span></div>
          </div>
          <div style={{ marginTop:14 }}>
            <label style={labelStyle}>메모</label>
            <textarea value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} rows={2} style={{...inputStyle,resize:'vertical'}} />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
            <button onClick={()=>setShowModal(false)} style={btn('outline')}>취소</button>
            <button onClick={()=>{ setForm(f=>({...f,status:'draft'})); save() }} style={btn('outline')}><i className="fa-solid fa-floppy-disk" /> 초안 저장</button>
            <button onClick={()=>{ setForm(f=>({...f,status:'sent'})); save() }} style={btn('primary')}><i className="fa-solid fa-paper-plane" /> 발행 & 발송</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function StatCard({ icon, color, label, value }) {
  return (
    <div style={{ background:'#fff', borderRadius:12, padding:'16px 20px', boxShadow:'0 4px 24px rgba(51,48,100,.06)', display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ width:42, height:42, borderRadius:8, background:color+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color, flexShrink:0 }}><i className={`fa-solid ${icon}`} /></div>
      <div><div style={{ fontSize:18, fontWeight:700 }}>{value}</div><div style={{ fontSize:11.5, color:'#a1a4b5', marginTop:3 }}>{label}</div></div>
    </div>
  )
}
function StatusBadge({ status }) {
  const map = { draft:['초안','#f0f0f0','#888'], sent:['발송됨','#d9f7fb','#00cfe8'], pending:['대기','#fff3e0','#ff9f43'], paid:['완료','#dff5e9','#28c76f'], overdue:['연체','#fde8e8','#ea5455'] }
  const [label,bg,color] = map[status]||[status,'#f0f0f0','#888']
  return <span style={{ fontSize:10.5, fontWeight:600, padding:'3px 10px', borderRadius:20, background:bg, color }}>{label}</span>
}
function ActionBtn({ icon, title, onClick, danger }) {
  return <button onClick={onClick} title={title} style={{ width:30, height:30, borderRadius:6, border:'none', background:danger?'#fde8e8':'#f4f5fb', cursor:'pointer', color:danger?'#ea5455':'#a1a4b5', fontSize:12 }}><i className={`fa-solid ${icon}`} /></button>
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(30,28,60,.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(2px)' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#fff', borderRadius:16, width:620, maxWidth:'95vw', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(51,48,100,.2)' }}>
        <div style={{ padding:'22px 26px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:17, fontWeight:700 }}>{title}</div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'none', background:'#f4f5fb', cursor:'pointer', fontSize:14, color:'#a1a4b5' }}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div style={{ padding:'20px 26px 26px' }}>{children}</div>
      </div>
    </div>
  )
}
const labelStyle = { fontSize:12.5, fontWeight:600, color:'#444564', marginBottom:6, display:'block' }
const inputStyle = { width:'100%', padding:'9px 14px', borderRadius:8, border:'1.5px solid #e7e7ff', fontSize:13.5, fontFamily:'inherit', color:'#444564', outline:'none', boxSizing:'border-box' }
function btn(type) {
  if(type==='primary') return { display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:8, fontSize:13.5, fontWeight:600, cursor:'pointer', border:'none', background:'#7367f0', color:'#fff', fontFamily:'inherit' }
  return { display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:8, fontSize:13.5, fontWeight:600, cursor:'pointer', border:'1.5px solid #e7e7ff', background:'#fff', color:'#444564', fontFamily:'inherit' }
}
function Spinner() { return <div style={{ display:'flex', justifyContent:'center', padding:40 }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize:28, color:'#7367f0' }} /></div> }