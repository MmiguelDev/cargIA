import { useEffect, useMemo, useState } from 'react'
import { confirmarViaje, crearSolicitud, generarOrden } from './api'

const money = value => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value || 0)
const dateText = value => value ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`)) : 'Por confirmar'
const initials = value => value?.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase() || 'CM'

function Brand({ dark = false }) {
  return <button className={`flex items-center gap-3 text-left font-extrabold tracking-tight ${dark ? 'text-white' : 'text-navy'}`}><span className="grid h-10 w-10 place-items-center rounded-lg bg-wine text-sm text-white">CM</span><span>CARGA<span className="text-wine">MATCH</span></span></button>
}

function Button({ children, secondary = false, busy = false, className = '', ...props }) {
  return <button disabled={busy || props.disabled} className={`btn ${secondary ? 'btn-secondary' : 'btn-primary'} ${className}`} {...props}>{busy && <span className="spinner" />}{children}</button>
}

function Sidebar({ page, go }) {
  return <aside className="hidden w-64 shrink-0 flex-col bg-navy px-5 py-6 text-white lg:flex">
    <Brand dark />
    <nav className="mt-12 space-y-2">
      {[['dashboard','Inicio','⌂'],['create','Nueva carga','＋'],['requests','Solicitudes','▤'],['trips','Viajes','▣']].map(([id,label,icon]) =>
        <button key={id} onClick={() => ['dashboard','create'].includes(id) && go(id)} className={`nav ${page === id ? 'nav-active' : ''}`}><span>{icon}</span>{label}{id === 'requests' && <em>3</em>}</button>)}
    </nav>
    <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-5"><span className="avatar">AM</span><div><b className="block text-sm">Ana Martínez</b><small className="text-white/55">Productor</small></div></div>
  </aside>
}

function Shell({ page, go, children, back }) {
  return <div className="min-h-screen bg-cloud lg:flex"><Sidebar page={page} go={go} /><main className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line/70 bg-cloud/90 px-5 backdrop-blur lg:px-10"><div className="lg:hidden"><Brand /></div>{back ? <button className="hidden text-sm font-bold text-slate-600 hover:text-wine lg:block" onClick={back}>← Volver</button> : <span /> }<div className="flex items-center gap-3"><span className="hidden text-xs font-bold uppercase tracking-widest text-slate-500 sm:block">Operación segura</span><span className="avatar">AM</span></div></header>{children}</main></div>
}

function Steps({ current }) {
  return <ol className="steps">{['Describe','Revisa','Asigna'].map((label, i) => <li key={label} className={i + 1 <= current ? 'active' : ''}><span>{i + 1 < current ? '✓' : i + 1}</span><b>{label}</b></li>)}</ol>
}

function Login({ go }) {
  return <div className="grid min-h-screen bg-navy lg:grid-cols-[1.15fr_.85fr]"><section className="relative flex flex-col justify-between overflow-hidden p-8 text-white lg:p-16"><Brand dark /><div className="relative z-10 max-w-2xl py-20"><p className="eyebrow text-rose-200">LOGÍSTICA, RESUELTA</p><h1 className="mt-5 text-5xl font-extrabold leading-[1.08] tracking-tight md:text-7xl">De una necesidad<br/>a un viaje asignado.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-blue-100/75">Describe tu carga y encuentra transportistas compatibles con cotizaciones claras en segundos.</p></div><div className="grid gap-3 text-sm text-blue-100/65 sm:grid-cols-3"><span>IA que entiende tu carga</span><span>Matches comparables</span><span>Orden centralizada</span></div><div className="route-bg" /></section><section className="grid place-items-center bg-slate-100 p-6"><div className="panel w-full max-w-md p-8 lg:p-10"><p className="eyebrow">ACCESO AL MVP</p><h2 className="mt-3 text-3xl font-extrabold text-ink">Bienvenido</h2><p className="mt-2 text-slate-500">Entra como productor para iniciar la demostración.</p><label className="field-label mt-8">Correo electrónico<input className="field" defaultValue="productor@demo.mx" /></label><label className="field-label">Contraseña<input className="field" type="password" defaultValue="cargamatch" /></label><Button className="mt-3 w-full" onClick={() => go('dashboard')}>Entrar a CargaMatch →</Button><p className="mt-5 text-center text-xs font-bold text-slate-400">● DATOS DE DEMOSTRACIÓN LISTOS</p></div></section></div>
}

function Dashboard({ go }) {
  return <Shell page="dashboard" go={go}><div className="page"><div className="heading"><div><p className="eyebrow">OPERACIÓN DEL DÍA</p><h1>Buenos días, Ana.</h1><p>Tu operación logística está bajo control.</p></div><Button onClick={() => go('create')}>＋ Crear nueva carga</Button></div><div className="grid gap-4 md:grid-cols-3">{[['Solicitudes activas','03','2 esta semana'],['Viajes en curso','01','Entrega mañana'],['Cotizaciones','06','3 por revisar']].map((x,i)=><article className="panel metric" key={x[0]}><span className="metric-icon">{['▤','▰','⌁'][i]}</span><div><small>{x[0]}</small><b>{x[1]}</b><p>{x[2]}</p></div></article>)}</div><div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_.75fr]"><section className="panel p-6"><div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold">Actividad reciente</h2><p className="text-sm text-slate-500">Solicitudes y viajes de tu empresa</p></div><button className="text-sm font-bold text-wine">Ver todas →</button></div><div className="mt-5 divide-y divide-line">{[['MTY → SLW','Autopartes · 8,000 kg','3 cotizaciones','$14,800'],['QRO → GDL','Electrodomésticos · 4,500 kg','En tránsito','$21,300'],['CDMX → PUE','Empaque · 2,200 kg','Publicada','—']].map(row=><div className="grid gap-2 py-4 sm:grid-cols-[110px_1fr_auto_auto] sm:items-center" key={row[0]}><b className="route-pill">{row[0]}</b><span className="font-bold">{row[1]}</span><span className="status">{row[2]}</span><strong>{row[3]}</strong></div>)}</div></section><aside className="rounded-xl bg-navy p-7 text-white shadow-panel"><p className="eyebrow text-rose-200">✦ CARGAMATCH AI</p><h2 className="mt-5 text-3xl font-extrabold">¿Tienes algo que mover?</h2><p className="mt-3 leading-7 text-blue-100/65">Describe qué necesitas transportar y encontraremos las mejores opciones.</p><Button className="mt-8 w-full" onClick={() => go('create')}>Crear con IA →</Button></aside></div></div></Shell>
}

function Create({ go, text, setText, submit, busy }) {
  return <Shell page="create" go={go} back={() => go('dashboard')}><div className="page max-w-6xl"><div className="heading"><div><p className="eyebrow">NUEVA SOLICITUD</p><h1>¿Qué necesitas transportar?</h1><p>Cuéntanos los detalles como lo harías con una persona.</p></div></div><Steps current={1}/><div className="grid gap-5 lg:grid-cols-[1.5fr_.7fr]"><section className="panel overflow-hidden"><div className="flex items-center gap-3 border-b border-line p-5"><span className="ai-icon">✦</span><div><b className="block">CargaMatch AI</b><small className="text-slate-500">Describe tu carga en una sola frase</small></div><span className="ml-auto status">● Lista</span></div><div className="p-5"><textarea className="shipment-text" maxLength={500} value={text} onChange={e=>setText(e.target.value)} placeholder="Ej. Necesito transportar 15 toneladas de material de construcción de Chihuahua a Ciudad Juárez el próximo lunes."/><div className="mt-2 text-right text-xs font-bold text-slate-400">{text.length}/500 caracteres</div><Button busy={busy} className="mt-5 w-full" onClick={submit}>{busy ? 'Analizando solicitud…' : 'Analizar solicitud ✦'}</Button></div></section><aside className="rounded-xl bg-navy p-7 text-white shadow-panel"><p className="eyebrow text-rose-200">PARA UN MEJOR MATCH</p><h2 className="mt-4 text-2xl font-extrabold">Incluye los datos clave.</h2><ul className="mt-6 space-y-5 text-sm text-blue-100/70">{['Origen y destino','Tipo y peso de la mercancía','Fecha de recolección'].map((x,i)=><li className="flex items-center gap-4" key={x}><span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 font-extrabold text-white">0{i+1}</span>{x}</li>)}</ul></aside></div></div></Shell>
}

function Review({ go, shipment }) {
  const c = shipment.cargo
  return <Shell page="create" go={go} back={() => go('create')}><div className="page max-w-6xl"><div className="heading"><div><p className="eyebrow">SOLICITUD INTERPRETADA</p><h1>Revisa los datos de tu carga</h1><p>Esto es lo que CargaMatch AI entendió.</p></div><span className="status">✦ Datos validados</span></div><Steps current={2}/><div className="grid gap-5 lg:grid-cols-[1.4fr_.75fr]"><section className="panel p-6"><h2 className="section-title"><span>01</span> Ruta del envío</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><ReadField label="ORIGEN" value={c.origin}/><ReadField label="DESTINO" value={c.destination}/></div><hr className="my-7 border-line"/><h2 className="section-title"><span>02</span> Detalles de la carga</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><ReadField label="TIPO DE CARGA" value={c.cargo_type}/><ReadField label="PESO" value={`${Number(c.weight_kg).toLocaleString('es-MX')} kg`}/><ReadField label="RECOLECCIÓN" value={dateText(c.date)}/><ReadField label="VEHÍCULO SUGERIDO" value={c.vehicle_type}/></div></section><aside className="panel p-6"><p className="eyebrow">RESUMEN</p><h2 className="mt-3 text-2xl font-extrabold">{c.origin} <span className="text-wine">→</span> {c.destination}</h2><dl className="summary-list"><div><dt>Mercancía</dt><dd>{c.cargo_type}</dd></div><div><dt>Peso total</dt><dd>{Number(c.weight_kg).toLocaleString('es-MX')} kg</dd></div><div><dt>Equipo</dt><dd>{c.vehicle_type}</dd></div><div><dt>Opciones encontradas</dt><dd>{shipment.matches?.length || 0}</dd></div></dl><div className="ready">✓ Todo listo para buscar transporte</div><Button className="mt-5 w-full" onClick={() => go('analysis')}>Publicar y ver transportistas →</Button></aside></div></div></Shell>
}

function ReadField({label,value}) { return <label className="field-label">{label}<input className="field" value={value || 'Por confirmar'} readOnly /></label> }

function Analysis({ go, shipment }) {
  useEffect(() => { const timer=setTimeout(()=>go('matches'), 1500); return ()=>clearTimeout(timer) }, [go])
  return <div className="grid min-h-screen place-items-center bg-navy p-6 text-white"><div className="w-full max-w-3xl"><div className="text-center"><p className="eyebrow text-rose-200">● CARGAMATCH AI TRABAJANDO</p><h1 className="mt-5 text-4xl font-extrabold md:text-5xl">Encontrando el transporte ideal</h1><p className="mt-4 text-blue-100/65">Cruzamos tu solicitud con transportistas disponibles.</p></div><div className="mt-10 rounded-2xl border border-white/10 bg-white/[.06] p-7"><div className="flex justify-between text-sm font-bold"><span>PROGRESO DEL ANÁLISIS</span><span>Procesando</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><i className="block h-full w-4/5 animate-pulse rounded-full bg-wine"/></div><div className="mt-7 grid gap-3 sm:grid-cols-3">{['Carga estructurada','Ruta validada',`${shipment.matches?.length || 0} coincidencias`].map(x=><div key={x} className="rounded-xl bg-white/[.06] p-4 text-sm font-bold"><span className="mr-2 text-rose-300">✓</span>{x}</div>)}</div></div></div></div>
}

function Matches({ go, shipment, choose, busyIndex }) {
  const matches=(shipment.matches || []).slice(0,3)
  return <Shell page="create" go={go} back={() => go('review')}><div className="page max-w-6xl"><div className="heading"><div><p className="eyebrow">RESULTADOS DEL MATCHING</p><h1>{matches.length} transportistas compatibles</h1><p>Compara compatibilidad, capacidad y cotización.</p></div><span className="route-pill">{shipment.cargo.origin} → {shipment.cargo.destination}</span></div><Steps current={3}/><div className="space-y-4">{matches.map((m,i)=><article key={`${m.carrier_id}-${i}`} className={`match-card ${i===0?'recommended':''}`}>{i===0&&<span className="ribbon">MEJOR OPCIÓN</span>}<div className="flex items-center gap-4"><span className="carrier-logo">{initials(m.name)}</span><div><h2 className="text-xl font-extrabold">{m.name}</h2><p className="text-sm text-slate-500">{m.origin} → {m.destination}</p></div></div><div className="score"><b>{m.score}%</b><span>compatibilidad</span></div><div className="text-sm"><b className="block">{Number(m.capacity_kg).toLocaleString('es-MX')} kg · {m.vehicle_type}</b><p className="mt-2 max-w-xl leading-6 text-slate-500">{m.reason}</p></div><div className="text-right"><small className="eyebrow">COTIZACIÓN</small><b className="mt-1 block text-2xl text-ink">{money(m.quote)}</b><Button busy={busyIndex===i} className="mt-3" onClick={()=>choose(m,i)}>{busyIndex===i?'Confirmando…':'Elegir propuesta →'}</Button></div></article>)}</div>{!matches.length&&<div className="panel p-10 text-center"><h2 className="text-2xl font-extrabold">No encontramos coincidencias</h2><p className="mt-2 text-slate-500">Modifica la descripción e intenta nuevamente.</p><Button className="mt-5" onClick={()=>go('create')}>Editar solicitud</Button></div>}</div></Shell>
}

function Confirmed({ go, shipment, carrier, generate, busy }) {
  const c=shipment.cargo
  return <Shell page="trips" go={go}><div className="page max-w-6xl"><section className="mb-5 flex flex-col gap-5 rounded-xl border border-rose-200 bg-rose-50 p-7 md:flex-row md:items-center"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-wine text-2xl font-extrabold text-white">✓</span><div><p className="eyebrow">ASIGNACIÓN COMPLETADA</p><h1 className="mt-1 text-3xl font-extrabold">¡Tu viaje está confirmado!</h1><p className="mt-1 text-slate-600">{carrier.name} recibió la asignación.</p></div><div className="md:ml-auto"><small className="eyebrow">FOLIO</small><b className="block text-lg">CM-{String(shipment.shipment_id).padStart(5,'0')}</b></div></section><div className="grid gap-5 lg:grid-cols-[1.4fr_.7fr]"><section className="panel p-7"><span className="status">● CONFIRMADO</span><h2 className="mt-5 text-3xl font-extrabold">{c.origin} → {c.destination}</h2><p className="mt-2 text-slate-500">{c.cargo_type} · {Number(c.weight_kg).toLocaleString('es-MX')} kg · {c.vehicle_type}</p><div className="route-visual"><span>ORIGEN<b>{c.origin}</b></span><i>━━━━━━━━ →</i><span>DESTINO<b>{c.destination}</b></span></div><div className="mt-7 grid gap-4 border-t border-line pt-6 sm:grid-cols-2"><Info label="RECOLECCIÓN" value={dateText(c.date)}/><Info label="VEHÍCULO" value={c.vehicle_type}/><Info label="TRANSPORTISTA" value={carrier.name}/><Info label="PRECIO ACORDADO" value={money(carrier.quote)}/></div></section><aside className="panel p-7"><div className="flex items-center gap-4"><span className="carrier-logo">{initials(carrier.name)}</span><div><small className="eyebrow">TRANSPORTISTA ASIGNADO</small><h2 className="text-xl font-extrabold">{carrier.name}</h2></div></div><dl className="summary-list"><div><dt>Capacidad</dt><dd>{Number(carrier.capacity_kg).toLocaleString('es-MX')} kg</dd></div><div><dt>Vehículo</dt><dd>{carrier.vehicle_type}</dd></div><div><dt>Compatibilidad</dt><dd>{carrier.score}%</dd></div></dl><div className="ready">✦ {carrier.reason}</div><Button busy={busy} className="mt-5 w-full" onClick={generate}>{busy?'Generando documento…':'Generar orden PDF →'}</Button><Button secondary className="mt-3 w-full" onClick={()=>go('dashboard')}>Volver al inicio</Button></aside></div></div></Shell>
}

function Info({label,value}) { return <div><small className="eyebrow">{label}</small><b className="mt-1 block">{value}</b></div> }

function Order({ go, shipment, carrier, order }) {
  const c=shipment.cargo
  return <Shell page="trips" go={go} back={() => go('confirmed')}><div className="page max-w-6xl"><div className="heading"><div><p className="eyebrow">DOCUMENTACIÓN</p><h1>Orden de servicio</h1><p>El documento fue generado y está listo para abrirse.</p></div><a href={order.pdf_url} target="_blank" rel="noreferrer" className="btn btn-primary">Abrir PDF ↗</a></div><div className="grid gap-5 lg:grid-cols-[1.4fr_.55fr]"><article className="service-doc"><header><Brand/><div className="text-right"><small className="eyebrow">ORDEN DE SERVICIO</small><b className="block text-xl">{order.order_id}</b></div></header><div className="doc-status">✓ SERVICIO CONFIRMADO <span>Folio CM-{String(shipment.shipment_id).padStart(5,'0')}</span></div><section className="doc-grid"><div><small>SOLICITANTE</small><h2>Industrias Regiomontanas S.A.</h2><p>Ana Martínez · Productor</p></div><div><small>TRANSPORTISTA</small><h2>{carrier.name}</h2><p>Empresa asignada por CargaMatch</p></div></section><DocSection number="01" title="Ruta y programación"><div className="grid gap-5 sm:grid-cols-2"><Info label="ORIGEN" value={c.origin}/><Info label="DESTINO" value={c.destination}/><Info label="RECOLECCIÓN" value={dateText(c.date)}/><Info label="EQUIPO" value={c.vehicle_type}/></div></DocSection><DocSection number="02" title="Descripción del servicio"><div className="grid gap-4 sm:grid-cols-3"><Info label="MERCANCÍA" value={c.cargo_type}/><Info label="PESO" value={`${Number(c.weight_kg).toLocaleString('es-MX')} kg`}/><Info label="PRECIO" value={money(carrier.quote)}/></div></DocSection><footer className="mt-10 flex justify-between border-t border-line pt-4 text-xs text-slate-400"><span>Documento generado por CargaMatch</span><span>{order.order_id}</span></footer></article><aside className="panel h-fit p-7"><div className="ready">✓ Documento listo</div><h2 className="mt-6 text-xl font-extrabold">{order.order_id}.pdf</h2><p className="mt-2 text-sm leading-6 text-slate-500">La liga del archivo es temporal. Descárgalo o guárdalo antes de que expire.</p><a href={order.pdf_url} target="_blank" rel="noreferrer" className="btn btn-primary mt-6 w-full">Descargar orden ↗</a><Button secondary className="mt-3 w-full" onClick={()=>go('dashboard')}>Finalizar</Button></aside></div></div></Shell>
}

function DocSection({number,title,children}) { return <section className="mt-8 border-t border-line pt-6"><h3 className="section-title"><span>{number}</span>{title}</h3><div className="mt-5">{children}</div></section> }

export default function App() {
  const [page,setPage]=useState('login')
  const [text,setText]=useState('Necesito transportar 15 toneladas de material de construcción de Chihuahua a Ciudad Juárez el próximo lunes.')
  const [shipment,setShipment]=useState(null)
  const [carrier,setCarrier]=useState(null)
  const [order,setOrder]=useState(null)
  const [busy,setBusy]=useState(null)
  const [notice,setNotice]=useState(null)
  const go=useMemo(()=>name=>setPage(name),[])
  const fail=error=>{setNotice(error.message || 'Ocurrió un error inesperado.');setTimeout(()=>setNotice(null),6000)}

  async function submit() {
    if(text.trim().length<10){fail(new Error('Describe tu carga con al menos 10 caracteres.'));return}
    setBusy('create')
    try { const data=await crearSolicitud(text.trim()); setShipment(data); setPage('review') }
    catch(error){fail(error)} finally{setBusy(null)}
  }
  async function choose(match,index) {
    setBusy(`carrier-${index}`)
    try { await confirmarViaje(shipment.shipment_id,match); setCarrier(match); setPage('confirmed') }
    catch(error){fail(error)} finally{setBusy(null)}
  }
  async function generate() {
    setBusy('order')
    const tab=window.open('', '_blank')
    try { const data=await generarOrden(shipment.shipment_id); setOrder(data); setPage('order'); if(tab) tab.location=data.pdf_url }
    catch(error){tab?.close();fail(error)} finally{setBusy(null)}
  }

  useEffect(()=>{ window.scrollTo({top:0,behavior:'smooth'}) },[page])
  const props={go}
  return <><div key={page} className="screen-enter">{page==='login'&&<Login {...props}/>} {page==='dashboard'&&<Dashboard {...props}/>} {page==='create'&&<Create {...props} text={text} setText={setText} submit={submit} busy={busy==='create'}/>} {page==='review'&&shipment&&<Review {...props} shipment={shipment}/>} {page==='analysis'&&shipment&&<Analysis {...props} shipment={shipment}/>} {page==='matches'&&shipment&&<Matches {...props} shipment={shipment} choose={choose} busyIndex={busy?.startsWith('carrier-')?Number(busy.split('-')[1]):-1}/>} {page==='confirmed'&&shipment&&carrier&&<Confirmed {...props} shipment={shipment} carrier={carrier} generate={generate} busy={busy==='order'}/>} {page==='order'&&order&&<Order {...props} shipment={shipment} carrier={carrier} order={order}/>}</div>{notice&&<div className="notice" role="alert"><b>No se pudo completar</b><span>{notice}</span><button onClick={()=>setNotice(null)}>×</button></div>}</>
}
