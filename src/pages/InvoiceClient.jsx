import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const primary = '#7367f0'

export default function InvoiceClient() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [stage, setStage] = useState('pw')
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [invoice, setInvoice] = useState(null)
  const [items, setItems] = useState([])
  const [agreed, setAgreed] = useState(false)
  const [signTab, setSignTab] = useState('draw')
  const [typedName, setTypedName] = useState('')
  const [hasDrawn, setHasDrawn] = useState(false)
  const canvasRef = useRef(null)
  const drawing = useRef(false)

  function checkPw() {
    if (pw === invoice?.access_password || pw === searchParams.get('pw')) {
      setStage('view')
    } else {
      setPwError(true)
      setTimeout(() => setPwError(false), 2500)
    }
  }

  useEffect(() => {
    async function load() {
      const [inv, itm] = await Promise.all([
        supabase.from('invoices_with_totals').select('*').eq('id', id).single(),
        supabase.from('invoice_items').select('*').eq('invoice_id', id),
      ])
      if (inv.data) {
        setInvoice(inv.data)
        setItems(itm.data || [])
        if (searchParams.get('pw') === inv.data.access_password) setStage('view')
        else setStage('pw')
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (stage !== 'view' || signTab !== 'draw') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    const ctx = canvas.getContext('2d')
    ctx.scale(ratio, ratio)
    ctx.strokeStyle = '#2c2c3e'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [stage, signTab])

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches ? e.touches[0] : e
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
  }
  function startDraw(e) {
    drawing.current = true
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const p = getPos(e, canvas)
    ctx.beginPath(); ctx.moveTo(p.x, p.y)
  }
  function draw(e) {
    if (!drawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const p = getPos(e, canvas)
    ctx.lineTo(p.x, p.y); ctx.stroke()
    setHasDrawn(true)
  }
  function endDraw() { drawing.current = false }
  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  async function submitSign() {
    const signData = signTab === 'draw' ? canvasRef.current.toDataURL() : `typed:${typedName}`
    await supabase.from('invoices').update({
      signed_at: new Date().toISOString(),
      signed_name: signTab === 'type' ? typedName : invoice.client_name,
      signed_data: signData,
      status: 'paid'
    }).eq('id', id)
    setStage('signed')
  }

  const canSign = agreed && (signTab === 'draw' ? hasDrawn : typedName.trim().length > 0)

  if (!invoice && stage !== 'pw') return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize:32, color:primary }} />
    </div>
  )

  if (stage === 'pw') return (
    <div style={{ minHeight:'100vh', background:'#f4f5fb', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Public Sans',sans-serif" }}>
      <div style={{ background:'#fff', borderRadius:20, padding:'44px 48px', boxShadow:'0 20px 60px rgba(51,48,100,.13)', textAlign:'center', width:380, maxWidth:'95vw' }}>
        <div style={{ width:52, height:52, borderRadius:14, background:primary, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', color:'#fff', fontSize:22 }}><i className="fa-solid fa-file-invoice-dollar" /></div>
        <div style={{ fontSize:20, fontWeight:800, marginBottom:6 }}>인보이스 확인</div>
        <div style={{ fontSize:13, color:'#a1a4b5', marginBottom:26, lineHeight:1.5 }}>보안을 위해 비밀번호가 필요합니다.<br/>담당자에게 비밀번호를 확인해 주세요.</div>
        <input value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&checkPw()}
          type="password" placeholder="••••" maxLength={8}
          style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:`2px solid ${pwError?'#ea5455':'#e7e7ff'}`, fontSize:18, textAlign:'center', letterSpacing:4, fontWeight:600, outline:'none', fontFamily:'inherit', boxSizing:'border-box', marginBottom:8 }} />
        {pwError && <div style={{ fontSize:12.5, color:'#ea5455', marginBottom:8 }}><i className="fa-solid fa-circle-xmark" /> 비밀번호가 올바르지 않습니다.</div>}
        <button onClick={checkPw} style={{ width:'100%', padding:13, borderRadius:10, background:primary, color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>확인하기</button>
        <div style={{ fontSize:12, color:'#a1a4b5', marginTop:16, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          <i className="fa-solid fa-lock" /> 이 링크는 수신인에게만 공유됩니다.
        </div>
      </div>
    </div>
  )

  if (stage === 'signed') return (
    <div style={{ minHeight:'100vh', background:'#f4f5fb', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Public Sans',sans-serif" }}>
      <div style={{ background:'#fff', borderRadius:20, padding:'48px 44px', textAlign:'center', maxWidth:420, width:'90%', boxShadow:'0 20px 60px rgba(51,48,100,.13)' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#dff5e9', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:32, color:'#28c76f' }}><i className="fa-solid fa-circle-check" /></div>
        <div style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>서명이 완료되었습니다!</div>
        <div style={{ fontSize:13.5, color:'#a1a4b5', lineHeight:1.6, marginBottom:24 }}>인보이스 #{invoice.invoice_number}에<br/>전자서명이 성공적으로 등록되었습니다.</div>
        <div style={{ background:'#f4f5fb', borderRadius:10, padding:'14px 18px', textAlign:'left', fontSize:13, lineHeight:2 }}>
          <div>🗓 <strong>서명 일시:</strong> {new Date().toLocaleString('ko-KR')}</div>
          <div>👤 <strong>서명자:</strong> {invoice.client_name}</div>
          <div>📋 <strong>인보이스:</strong> #{invoice.invoice_number}</div>
          <div>💰 <strong>금액:</strong> ₩{Number(invoice.total_amount).toLocaleString()}</div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#f4f5fb', fontFamily:"'Public Sans',sans-serif", padding:'40px 20px 80px' }}>
      <div style={{ maxWidth:760, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:primary, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14 }}>F</div>
            <span style={{ fontSize:16, fontWeight:700 }}>Freelance<span style={{ color:primary }}>OS</span></span>
          </div>
          <button onClick={()=>window.print()} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:8, border:'1.5px solid #e7e7ff', background:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            <i className="fa-solid fa-print" /> 인쇄
          </button>
        </div>

        <div style={{ background:'#fff', borderRadius:14, boxShadow:'0 4px 30px rgba(51,48,100,.09)', overflow:'hidden', marginBottom:20 }}>
          <div style={{ background:'linear-gradient(135deg,#7367f0,#a78bfa)', padding:'28px 36px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ fontSize:26, fontWeight:800, color:'#fff' }}>#{invoice.invoice_number}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.7)', marginTop:3 }}>INVOICE</div>
            </div>
            <span style={{ background:'rgba(255,255,255,.2)', border:'1.5px solid rgba(255,255,255,.4)', color:'#fff', fontSize:12, fontWeight:600, padding:'5px 14px', borderRadius:20 }}>
              {invoice.signed_at ? '✅ 서명 완료' : '⏳ 서명 대기 중'}
            </span>
          </div>
          <div style={{ padding:'32px 36px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:28, paddingBottom:28, borderBottom:'1px solid #e7e7ff' }}>
              <div>
                <div style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, color:primary, marginBottom:8 }}>발행인</div>
                <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>John Doe</div>
                <div style={{ fontSize:12.5, color:'#a1a4b5', lineHeight:1.8 }}>프리랜서 디자이너<br/>john@freelanceos.kr</div>
              </div>
              <div>
                <div style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, color:primary, marginBottom:8 }}>청구 대상</div>
                <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{invoice.client_name} 님</div>
                <div style={{ fontSize:12.5, color:'#a1a4b5', lineHeight:1.8 }}>{invoice.client_company}<br/>{invoice.client_email}</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, background:'#f4f5fb', borderRadius:10, padding:'16px 20px', marginBottom:28 }}>
              <div><div style={{ fontSize:10.5, fontWeight:600, color:'#a1a4b5', textTransform:'uppercase', marginBottom:4 }}>발행일</div><div style={{ fontSize:14, fontWeight:700 }}>{invoice.issue_date}</div></div>
              <div><div style={{ fontSize:10.5, fontWeight:600, color:'#a1a4b5', textTransform:'uppercase', marginBottom:4 }}>마감일</div><div style={{ fontSize:14, fontWeight:700, color:'#ff9f43' }}>{invoice.due_date}</div></div>
              <div><div style={{ fontSize:10.5, fontWeight:600, color:'#a1a4b5', textTransform:'uppercase', marginBottom:4 }}>결제 방법</div><div style={{ fontSize:14, fontWeight:700 }}>계좌이체</div></div>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:20 }}>
              <thead><tr>{['항목','수량','단가','금액'].map(h=><th key={h} style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', color:'#a1a4b5', padding:'10px 14px', textAlign:'left', background:'#f4f5fb' }}>{h}</th>)}</tr></thead>
              <tbody>
                {items.map(item=>(
                  <tr key={item.id} style={{ borderBottom:'1px solid #f4f4f9' }}>
                    <td style={{ padding:'13px 14px', fontSize:13.5, fontWeight:500 }}>{item.description}</td>
                    <td style={{ padding:'13px 14px', fontSize:13 }}>{item.quantity}</td>
                    <td style={{ padding:'13px 14px', fontSize:13 }}>₩{Number(item.unit_price).toLocaleString()}</td>
                    <td style={{ padding:'13px 14px', fontSize:13, fontWeight:600 }}>₩{Number(item.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginLeft:'auto', width:280 }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', fontSize:13, color:'#a1a4b5' }}><span>소계</span><span>₩{Number(invoice.subtotal).toLocaleString()}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', fontSize:13, color:'#a1a4b5' }}><span>부가세 ({invoice.tax_rate}%)</span><span>₩{Number(invoice.tax_amount).toLocaleString()}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', fontSize:16, fontWeight:800, color:primary, borderTop:'2px solid #e7e7ff', marginTop:4 }}><span>합계</span><span>₩{Number(invoice.total_amount).toLocaleString()}</span></div>
            </div>
            {invoice.note && (
              <div style={{ background:'#fff3e0', borderLeft:'3px solid #ff9f43', borderRadius:'0 8px 8px 0', padding:'12px 16px', marginTop:20, fontSize:12.5, color:'#7a5800', lineHeight:1.6 }}>
                <i className="fa-solid fa-circle-info" style={{ marginRight:6 }} />{invoice.note}
              </div>
            )}
          </div>
        </div>

        {!invoice.signed_at && (
          <div style={{ background:'#fff', borderRadius:14, boxShadow:'0 4px 30px rgba(51,48,100,.09)', padding:'28px 36px' }}>
            <div style={{ fontSize:18, fontWeight:800, marginBottom:6 }}>✍️ 전자서명</div>
            <div style={{ fontSize:13, color:'#a1a4b5', marginBottom:22, lineHeight:1.5 }}>인보이스 내용을 확인하셨으면 아래에 서명해 주세요.</div>
            <div style={{ display:'flex', background:'#f4f5fb', borderRadius:8, padding:4, marginBottom:20, width:'fit-content', gap:2 }}>
              {['draw','type'].map(tab=>(
                <button key={tab} onClick={()=>setSignTab(tab)} style={{ padding:'8px 20px', borderRadius:6, border:'none', background:signTab===tab?'#fff':'transparent', color:signTab===tab?primary:'#a1a4b5', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                  {tab==='draw'?<><i className="fa-solid fa-pen" /> 직접 서명</>:<><i className="fa-solid fa-keyboard" /> 이름 입력</>}
                </button>
              ))}
            </div>
            {signTab==='draw' ? (
              <div>
                <div style={{ position:'relative', border:'2px dashed #e7e7ff', borderRadius:10, overflow:'hidden', background:'#fafafe', marginBottom:10 }}>
                  <canvas ref={canvasRef} style={{ display:'block', width:'100%', height:180, cursor:'crosshair', touchAction:'none' }}
                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                    onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
                  {!hasDrawn && <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', color:'#a1a4b5', pointerEvents:'none' }}>
                    <i className="fa-solid fa-pen-nib" style={{ fontSize:22, marginBottom:6, display:'block' }} />
                    <span style={{ fontSize:13 }}>이곳에 서명해 주세요</span>
                  </div>}
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={clearCanvas} style={{ border:'1.5px solid #e7e7ff', background:'#fff', borderRadius:8, padding:'6px 14px', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}><i className="fa-solid fa-rotate-left" /> 다시 그리기</button>
                </div>
              </div>
            ) : (
              <div>
                <input value={typedName} onChange={e=>setTypedName(e.target.value)} placeholder="이름을 입력하세요" style={{ width:'100%', padding:'16px 20px', border:'2px solid #e7e7ff', borderRadius:10, fontSize:26, fontFamily:'Georgia,serif', color:'#444564', outline:'none', boxSizing:'border-box', marginBottom:10, fontStyle:'italic' }} />
                <div style={{ padding:'16px 20px', border:'1.5px solid #e7e7ff', borderRadius:10, minHeight:70, display:'flex', alignItems:'center' }}>
                  <span style={{ fontSize:30, color:primary, fontFamily:'Georgia,serif', fontStyle:'italic', letterSpacing:1 }}>{typedName || '—'}</span>
                </div>
              </div>
            )}
            <div style={{ background:'#f4f5fb', borderRadius:10, padding:'16px 18px', margin:'18px 0', display:'flex', gap:12, alignItems:'flex-start' }}>
              <div onClick={()=>setAgreed(!agreed)} style={{ width:20, height:20, borderRadius:5, border:`2px solid ${agreed?primary:'#e7e7ff'}`, flexShrink:0, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', background:agreed?primary:'#fff', color:'#fff', fontSize:11, marginTop:1 }}>
                {agreed && <i className="fa-solid fa-check" />}
              </div>
              <div style={{ fontSize:12.5, color:'#a1a4b5', lineHeight:1.6 }}>
                <strong style={{ color:'#444564' }}>위 인보이스 내용을 확인하였으며 동의합니다.</strong><br/>
                본 전자서명은 법적 효력을 가지며, 서명 완료 후 내용 변경이 불가합니다.
              </div>
            </div>
            <button onClick={submitSign} disabled={!canSign} style={{ width:'100%', padding:14, background:canSign?primary:'#ccc', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:canSign?'pointer':'not-allowed', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <i className="fa-solid fa-signature" /> 서명 완료 및 제출
            </button>
            <div style={{ textAlign:'center', marginTop:12, fontSize:11.5, color:'#a1a4b5' }}>
              <i className="fa-solid fa-shield-halved" /> 서명 정보는 암호화되어 안전하게 저장됩니다.
            </div>
          </div>
        )}

        {invoice.signed_at && (
          <div style={{ background:'#dff5e9', borderRadius:14, padding:'20px 24px', display:'flex', alignItems:'center', gap:14, fontSize:14, color:'#28c76f', fontWeight:600 }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize:24 }} />
            <div>서명 완료<div style={{ fontSize:12, fontWeight:400, marginTop:2 }}>서명자: {invoice.signed_name} · {new Date(invoice.signed_at).toLocaleString('ko-KR')}</div></div>
          </div>
        )}
      </div>
    </div>
  )
}