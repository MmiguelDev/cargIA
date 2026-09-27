import { useEffect, useMemo, useState } from "react";
import {
  actualizarEtapa,
  confirmarViaje,
  crearSolicitud,
  elegirOferta,
  enviarOferta,
  generarOrden,
  iniciarSesion,
  listarOfertas,
  misViajes,
  registrar,
  viajesDisponibles,
} from "./api";

const money = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value || 0);
const dateText = (value) =>
  value
    ? new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(
        new Date(`${value}T12:00:00`),
      )
    : "Por confirmar";
const initials = (value) =>
  value
    ?.split(/\s+/)
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CM";
const SESSION_KEY = "cargamatch_user";
const COMPANY_TRIP_KEY = "cargamatch_company_trip";
function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}
function readCompanyTrip() {
  try {
    return JSON.parse(localStorage.getItem(COMPANY_TRIP_KEY));
  } catch {
    return null;
  }
}

function Brand({ dark = false }) {
  return (
    <button
      className={`flex items-center gap-3 text-left font-extrabold tracking-tight ${dark ? "text-white" : "text-navy"}`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-wine text-sm text-white">
        CM
      </span>
      <span className={dark ? "rounded-md bg-white px-2 py-1 leading-none" : ""}>
        <span className="text-black">CARG</span>
        <span className="text-wine">AI</span>
      </span>
    </button>
  );
}

function Button({
  children,
  secondary = false,
  busy = false,
  className = "",
  ...props
}) {
  return (
    <button
      disabled={busy || props.disabled}
      className={`btn ${secondary ? "btn-secondary" : "btn-primary"} ${className}`}
      {...props}
    >
      {busy && <span className="spinner" />}
      {children}
    </button>
  );
}

function Sidebar({ page, go }) {
  const session = readSession();
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-navy px-5 py-6 text-white lg:flex">
      <Brand dark />
      <nav className="mt-12 space-y-2">
        {[
          ["dashboard", "Inicio", "⌂"],
          ["create", "Nueva carga", "＋"],
          ["requests", "Solicitudes", "▤"],
          ["trips", "Viajes", "▣"],
        ].map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() =>
              ["dashboard", "create", "requests", "trips"].includes(id) &&
              go(id)
            }
            className={`nav ${page === id ? "nav-active" : ""}`}
          >
            <span>{icon}</span>
            {label}
            {id === "requests" && <em>3</em>}
          </button>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-5">
        <div className="flex items-center gap-3">
          <span className="avatar">{initials(session?.name)}</span>
          <div>
            <b className="block text-sm">{session?.name || "Empresa demo"}</b>
            <small className="text-white/55">Empresa</small>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem(SESSION_KEY);
            go("login");
          }}
          className="mt-4 text-xs font-bold text-white/45 hover:text-white"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function Shell({ page, go, children, back }) {
  const session = readSession();
  return (
    <div className="min-h-screen bg-cloud lg:flex">
      <Sidebar page={page} go={go} />
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line/70 bg-cloud/90 px-5 backdrop-blur lg:px-10">
          <div className="lg:hidden">
            <Brand />
          </div>
          {back ? (
            <button
              className="hidden text-sm font-bold text-slate-600 hover:text-wine lg:block"
              onClick={back}
            >
              ← Volver
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-bold uppercase tracking-widest text-slate-500 sm:block">
              Operación segura
            </span>
            <span className="avatar">{initials(session?.name)}</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function Steps({ current }) {
  return (
    <ol className="steps">
      {["Describe", "Revisa", "Asigna"].map((label, i) => (
        <li key={label} className={i + 1 <= current ? "active" : ""}>
          <span>{i + 1 < current ? "✓" : i + 1}</span>
          <b>{label}</b>
        </li>
      ))}
    </ol>
  );
}

function Login({ authenticate, busy, error }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "miguel.demo@cargamatch.com",
    password: "Demo1234",
    role: "empresa",
  });
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    authenticate(mode, form);
  };
  return (
    <div className="grid min-h-screen bg-navy lg:grid-cols-[1.15fr_.85fr]">
      <section className="relative flex flex-col justify-between overflow-hidden p-8 text-white lg:p-16">
        <Brand dark />
        <div className="relative z-10 max-w-2xl py-20">
          <p className="eyebrow text-rose-200">LOGÍSTICA, RESUELTA</p>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.08] tracking-tight md:text-7xl">
            De una necesidad
            <br />a un viaje asignado.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-blue-100/75">
            Productores y transportistas coordinan cargas, cotizaciones y viajes
            desde un mismo lugar.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-blue-100/65 sm:grid-cols-3">
          <span>Cargas estructuradas</span>
          <span>Matches comparables</span>
          <span>Operación centralizada</span>
        </div>
        <div className="route-bg" />
      </section>
      <section className="grid place-items-center bg-slate-100 p-6">
        <form onSubmit={submit} className="panel w-full max-w-md p-8 lg:p-10">
          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              Crear cuenta
            </button>
          </div>
          <p className="eyebrow mt-7">
            {mode === "login" ? "ACCESO A CARGAI" : "REGISTRO DE USUARIO"}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-ink">
            {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </h2>
          <p className="mt-2 text-slate-500">
            {mode === "login"
              ? "Ingresa con tu correo y contraseña."
              : "Elige cómo participarás en la plataforma."}
          </p>
          {mode === "register" && (
            <>
              <label className="field-label mt-7">
                NOMBRE COMPLETO
                <input
                  className="field"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
              <div className="role-picker">
                <button
                  type="button"
                  className={form.role === "empresa" ? "active" : ""}
                  onClick={() => update("role", "empresa")}
                >
                  <b>Empresa</b>
                  <span>Publicar cargas</span>
                </button>
                <button
                  type="button"
                  className={form.role === "transportista" ? "active" : ""}
                  onClick={() => update("role", "transportista")}
                >
                  <b>Transportista</b>
                  <span>Cotizar viajes</span>
                </button>
              </div>
            </>
          )}
          <label
            className={`field-label ${mode === "login" ? "mt-8" : "mt-6"}`}
          >
            CORREO ELECTRÓNICO
            <input
              className="field"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="field-label">
            CONTRASEÑA
            <input
              className="field"
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
            />
          </label>
          {mode === "register" && (
            <p className="-mt-3 text-xs text-slate-400">
              Usa al menos 6 caracteres.
            </p>
          )}
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          <Button busy={busy} className="mt-5 w-full" type="submit">
            {busy
              ? "Procesando…"
              : mode === "login"
                ? "Iniciar sesión →"
                : "Crear cuenta →"}
          </Button>
          {mode === "login" && (
            <p className="mt-5 text-center text-xs text-slate-400">
              Prueba: miguel.demo@cargamatch.com · Demo1234
            </p>
          )}
        </form>
      </section>
    </div>
  );
}

function Dashboard({ go }) {
  const session = readSession();
  const firstName = session?.name?.split(" ")[0] || "equipo";
  return (
    <Shell page="dashboard" go={go}>
      <div className="page">
        <div className="heading">
          <div>
            <p className="eyebrow">OPERACIÓN DEL DÍA</p>
            <h1>Buenos días, {firstName}.</h1>
            <p>Tu operación logística está bajo control.</p>
          </div>
          <Button onClick={() => go("create")}>＋ Crear nueva carga</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Solicitudes activas", "03", "2 esta semana"],
            ["Viajes en curso", "01", "Entrega mañana"],
            ["Cotizaciones", "06", "3 por revisar"],
          ].map((x, i) => (
            <article className="panel metric" key={x[0]}>
              <span className="metric-icon">{["▤", "▰", "⌁"][i]}</span>
              <div>
                <small>{x[0]}</small>
                <b>{x[1]}</b>
                <p>{x[2]}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_.75fr]">
          <section className="panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold">Actividad reciente</h2>
                <p className="text-sm text-slate-500">
                  Solicitudes y viajes de tu empresa
                </p>
              </div>
              <button className="text-sm font-bold text-wine">
                Ver todas →
              </button>
            </div>
            <div className="mt-5 divide-y divide-line">
              {[
                [
                  "MTY → SLW",
                  "Autopartes · 8,000 kg",
                  "3 cotizaciones",
                  "$14,800",
                ],
                [
                  "QRO → GDL",
                  "Electrodomésticos · 4,500 kg",
                  "En tránsito",
                  "$21,300",
                ],
                ["CDMX → PUE", "Empaque · 2,200 kg", "Publicada", "—"],
              ].map((row) => (
                <div
                  className="grid gap-2 py-4 sm:grid-cols-[110px_1fr_auto_auto] sm:items-center"
                  key={row[0]}
                >
                  <b className="route-pill">{row[0]}</b>
                  <span className="font-bold">{row[1]}</span>
                  <span className="status">{row[2]}</span>
                  <strong>{row[3]}</strong>
                </div>
              ))}
            </div>
          </section>
          <aside className="rounded-xl bg-navy p-7 text-white shadow-panel">
            <p className="eyebrow text-rose-200">✦ CARGAI</p>
            <h2 className="mt-5 text-3xl font-extrabold">
              ¿Tienes algo que mover?
            </h2>
            <p className="mt-3 leading-7 text-blue-100/65">
              Describe qué necesitas transportar y encontraremos las mejores
              opciones.
            </p>
            <Button className="mt-8 w-full" onClick={() => go("create")}>
              Crear con IA →
            </Button>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function Requests({ go, shipment, carrier, order, viewOffers }) {
  const live = shipment
    ? {
        id: `CM-${String(shipment.shipment_id).padStart(4, "0")}`,
        route: `${shipment.cargo.origin} → ${shipment.cargo.destination}`,
        cargo: shipment.cargo.cargo_type,
        weight: `${Number(shipment.cargo.weight_kg).toLocaleString("es-MX")} kg`,
        date: dateText(shipment.cargo.date),
        status: order ? "Orden generada" : carrier ? "Asignada" : "Publicada",
        quotes: shipment.matches?.length || 0,
        live: true,
      }
    : null;
  const rows = [
    live,
    {
      id: "CM-1048",
      route: "Monterrey → Saltillo",
      cargo: "Autopartes",
      weight: "8,000 kg",
      date: "2 de octubre de 2026",
      status: "Asignada",
      quotes: 3,
    },
    {
      id: "CM-1052",
      route: "Querétaro → Guadalajara",
      cargo: "Electrodomésticos",
      weight: "4,500 kg",
      date: "4 de octubre de 2026",
      status: "Publicada",
      quotes: 2,
    },
    {
      id: "CM-1057",
      route: "Ciudad de México → Puebla",
      cargo: "Material de empaque",
      weight: "2,200 kg",
      date: "5 de octubre de 2026",
      status: "Borrador",
      quotes: 0,
    },
  ].filter(Boolean);
  function open(row) {
    if (!row.live) return;
    if (order) go("order");
    else if (carrier) go("confirmed");
    else viewOffers();
  }
  return (
    <Shell page="requests" go={go} back={() => go("dashboard")}>
      <div className="page max-w-7xl">
        <div className="heading">
          <div>
            <p className="eyebrow">OPERACIÓN LOGÍSTICA</p>
            <h1>Solicitudes</h1>
            <p>Consulta el estado de las cargas creadas en CARGAI.</p>
          </div>
          <Button onClick={() => go("create")}>＋ Nueva solicitud</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="panel metric">
            <span className="metric-icon">▤</span>
            <div>
              <small>TOTAL</small>
              <b>{String(rows.length).padStart(2, "0")}</b>
              <p>Solicitudes visibles</p>
            </div>
          </article>
          <article className="panel metric">
            <span className="metric-icon">⌁</span>
            <div>
              <small>PUBLICADAS</small>
              <b>
                {String(
                  rows.filter((x) => x.status === "Publicada").length,
                ).padStart(2, "0")}
              </b>
              <p>Buscando transportista</p>
            </div>
          </article>
          <article className="panel metric">
            <span className="metric-icon">✓</span>
            <div>
              <small>ASIGNADAS</small>
              <b>
                {String(
                  rows.filter((x) =>
                    ["Asignada", "Orden generada"].includes(x.status),
                  ).length,
                ).padStart(2, "0")}
              </b>
              <p>Con transportista</p>
            </div>
          </article>
        </div>
        <section className="panel mt-6 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold">
                Historial de solicitudes
              </h2>
              <p className="text-sm text-slate-500">
                La solicitud de esta sesión aparece primero.
              </p>
            </div>
            <span className="status">Todas</span>
          </div>
          <div className="request-table">
            <div className="request-row request-head">
              <span>Solicitud</span>
              <span>Ruta y carga</span>
              <span>Fecha</span>
              <span>Cotizaciones</span>
              <span>Estado</span>
              <span></span>
            </div>
            {rows.map((row) => (
              <article
                key={row.id}
                className={`request-row ${row.live ? "live" : ""}`}
              >
                <div>
                  <b>{row.id}</b>
                  {row.live && <small>Sesión actual</small>}
                </div>
                <div>
                  <b>{row.route}</b>
                  <small>
                    {row.cargo} · {row.weight}
                  </small>
                </div>
                <span>{row.date}</span>
                <strong>{row.quotes}</strong>
                <span
                  className={`request-status status-${row.status.toLowerCase().replace(" ", "-")}`}
                >
                  {row.status}
                </span>
                <button disabled={!row.live} onClick={() => open(row)}>
                  {row.live ? "Abrir →" : "Demo"}
                </button>
              </article>
            ))}
          </div>
        </section>
        <p className="mt-4 text-center text-xs text-slate-400">
          Los registros de demostración sirven como referencia visual. La API
          todavía no ofrece un endpoint de historial.
        </p>
      </div>
    </Shell>
  );
}

function Offers({ go, shipment, chooseOffer, busy }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listarOfertas(shipment.shipment_id);
      setOffers(data.offers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [shipment.shipment_id]);
  return (
    <Shell page="requests" go={go} back={() => go("requests")}>
      <div className="page max-w-6xl">
        <div className="heading">
          <div>
            <p className="eyebrow">SUBASTA DE TRANSPORTE</p>
            <h1>Cotizaciones recibidas</h1>
            <p>
              {shipment.cargo.origin} → {shipment.cargo.destination}
            </p>
          </div>
          <button className="filter-active" onClick={load}>
            ↻ Actualizar
          </button>
        </div>
        <div className="panel mb-5 p-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <Info
              label="SOLICITUD"
              value={`CM-${String(shipment.shipment_id).padStart(4, "0")}`}
            />
            <Info label="MERCANCÍA" value={shipment.cargo.cargo_type} />
            <Info
              label="PESO"
              value={`${Number(shipment.cargo.weight_kg).toLocaleString("es-MX")} kg`}
            />
            <Info label="OFERTAS" value={String(offers.length)} />
          </div>
        </div>
        {error && (
          <div className="auth-error mb-5 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={load}>Reintentar</button>
          </div>
        )}
        {loading ? (
          <div className="grid gap-4">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : offers.length ? (
          <div className="space-y-4">
            {offers.map((offer, index) => {
              const id = offer.offer_id ?? offer.id;
              const name =
                offer.carrier_name ||
                offer.name ||
                `Transportista #${offer.carrier_id}`;
              return (
                <article className="match-card" key={id ?? index}>
                  <div className="flex items-center gap-4">
                    <span className="carrier-logo">{initials(name)}</span>
                    <div>
                      <h2 className="text-xl font-extrabold">{name}</h2>
                      <p className="text-sm text-slate-500">Oferta #{id}</p>
                    </div>
                  </div>
                  <div className="score">
                    <b>{index + 1}</b>
                    <span>posición por precio</span>
                  </div>
                  <div className="text-sm">
                    <b className="block">Estado: {offer.status || "PENDING"}</b>
                    <p className="mt-2 text-slate-500">
                      La empresa conserva la decisión final; elegir esta
                      propuesta asignará el viaje.
                    </p>
                  </div>
                  <div className="text-right">
                    <small className="eyebrow">COTIZACIÓN</small>
                    <b className="mt-1 block text-2xl">{money(offer.price)}</b>
                    <Button
                      busy={busy === id}
                      className="mt-3"
                      onClick={() => chooseOffer(offer)}
                    >
                      Elegir oferta →
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="panel p-10 text-center">
            <h2 className="text-2xl font-extrabold">Aún no hay cotizaciones</h2>
            <p className="mt-2 text-slate-500">
              Los transportistas pueden enviar propuestas desde su portal.
              Actualiza esta vista cuando recibas una.
            </p>
            <Button secondary className="mt-5" onClick={load}>
              Actualizar ofertas
            </Button>
          </div>
        )}
      </div>
    </Shell>
  );
}

function CompanyTrips({ go, shipment, carrier, order }) {
  if (!shipment || !carrier)
    return (
      <Shell page="trips" go={go}>
        <div className="page max-w-6xl">
          <div className="heading">
            <div>
              <p className="eyebrow">OPERACIÓN LOGÍSTICA</p>
              <h1>Viajes</h1>
              <p>Consulta los servicios que ya fueron asignados.</p>
            </div>
          </div>
          <div className="panel p-10 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-2xl">
              ▣
            </span>
            <h2 className="mt-5 text-2xl font-extrabold">
              Aún no tienes viajes asignados
            </h2>
            <p className="mt-2 text-slate-500">
              Cuando confirmes un transportista, el viaje aparecerá aquí.
            </p>
            <Button className="mt-6" onClick={() => go("requests")}>
              Ver solicitudes
            </Button>
          </div>
        </div>
      </Shell>
    );
  const c = shipment.cargo;
  return (
    <Shell page="trips" go={go}>
      <div className="page max-w-6xl">
        <div className="heading">
          <div>
            <p className="eyebrow">OPERACIÓN LOGÍSTICA</p>
            <h1>Viajes</h1>
            <p>Servicios confirmados por tu empresa.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="panel metric">
            <span className="metric-icon">▰</span>
            <div>
              <small>ASIGNADOS</small>
              <b>01</b>
              <p>Viaje activo</p>
            </div>
          </article>
          <article className="panel metric">
            <span className="metric-icon">⌁</span>
            <div>
              <small>EN OPERACIÓN</small>
              <b>01</b>
              <p>Seguimiento disponible</p>
            </div>
          </article>
          <article className="panel metric">
            <span className="metric-icon">✓</span>
            <div>
              <small>DOCUMENTOS</small>
              <b>{order ? "01" : "00"}</b>
              <p>{order ? "Orden generada" : "Pendiente de generar"}</p>
            </div>
          </article>
        </div>
        <section className="panel mt-6 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="status">
                  CM-{String(shipment.shipment_id).padStart(4, "0")}
                </span>
                <span className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-extrabold text-wine">
                  ● ASIGNADO
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-extrabold">
                {c.origin} <span className="text-wine">→</span> {c.destination}
              </h2>
              <p className="mt-2 text-slate-500">
                {c.cargo_type} · {Number(c.weight_kg).toLocaleString("es-MX")}{" "}
                kg · {c.vehicle_type}
              </p>
              <div className="mt-5 flex flex-wrap gap-5 text-sm font-bold text-slate-500">
                <span>▣ {dateText(c.date)}</span>
                <span>Transportista: {carrier.name}</span>
                <span>{money(carrier.quote ?? carrier.price)}</span>
              </div>
            </div>
            <Button onClick={() => go(order ? "order" : "confirmed")}>
              Abrir operación →
            </Button>
          </div>
        </section>
      </div>
    </Shell>
  );
}

function Create({ go, text, setText, submit, busy }) {
  return (
    <Shell page="create" go={go} back={() => go("dashboard")}>
      <div className="page max-w-6xl">
        <div className="heading">
          <div>
            <p className="eyebrow">NUEVA SOLICITUD</p>
            <h1>¿Qué necesitas transportar?</h1>
            <p>Cuéntanos los detalles como lo harías con una persona.</p>
          </div>
        </div>
        <Steps current={1} />
        <div className="grid gap-5 lg:grid-cols-[1.5fr_.7fr]">
          <section className="panel overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line p-5">
              <span className="ai-icon">✦</span>
              <div>
                <b className="block">CARGAI</b>
                <small className="text-slate-500">
                  Describe tu carga en una sola frase
                </small>
              </div>
              <span className="ml-auto status">● Lista</span>
            </div>
            <div className="p-5">
              <textarea
                className="shipment-text"
                maxLength={500}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ej. Necesito transportar 15 toneladas de material de construcción de Chihuahua a Ciudad Juárez el próximo lunes."
              />
              <div className="mt-2 text-right text-xs font-bold text-slate-400">
                {text.length}/500 caracteres
              </div>
              <Button busy={busy} className="mt-5 w-full" onClick={submit}>
                {busy ? "Analizando solicitud…" : "Analizar solicitud ✦"}
              </Button>
            </div>
          </section>
          <aside className="rounded-xl bg-navy p-7 text-white shadow-panel">
            <p className="eyebrow text-rose-200">PARA UN MEJOR MATCH</p>
            <h2 className="mt-4 text-2xl font-extrabold">
              Incluye los datos clave.
            </h2>
            <ul className="mt-6 space-y-5 text-sm text-blue-100/70">
              {[
                "Origen y destino",
                "Tipo y peso de la mercancía",
                "Fecha de recolección",
              ].map((x, i) => (
                <li className="flex items-center gap-4" key={x}>
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 font-extrabold text-white">
                    0{i + 1}
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function Review({ go, shipment }) {
  const c = shipment.cargo;
  return (
    <Shell page="create" go={go} back={() => go("create")}>
      <div className="page max-w-6xl">
        <div className="heading">
          <div>
            <p className="eyebrow">SOLICITUD INTERPRETADA</p>
            <h1>Revisa los datos de tu carga</h1>
            <p>Esto es lo que CARGAI entendió.</p>
          </div>
          <span className="status">✦ Datos validados</span>
        </div>
        <Steps current={2} />
        <div className="grid gap-5 lg:grid-cols-[1.4fr_.75fr]">
          <section className="panel p-6">
            <h2 className="section-title">
              <span>01</span> Ruta del envío
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ReadField label="ORIGEN" value={c.origin} />
              <ReadField label="DESTINO" value={c.destination} />
            </div>
            <hr className="my-7 border-line" />
            <h2 className="section-title">
              <span>02</span> Detalles de la carga
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ReadField label="TIPO DE CARGA" value={c.cargo_type} />
              <ReadField
                label="PESO"
                value={`${Number(c.weight_kg).toLocaleString("es-MX")} kg`}
              />
              <ReadField label="RECOLECCIÓN" value={dateText(c.date)} />
              <ReadField label="VEHÍCULO SUGERIDO" value={c.vehicle_type} />
            </div>
          </section>
          <aside className="panel p-6">
            <p className="eyebrow">RESUMEN</p>
            <h2 className="mt-3 text-2xl font-extrabold">
              {c.origin} <span className="text-wine">→</span> {c.destination}
            </h2>
            <dl className="summary-list">
              <div>
                <dt>Mercancía</dt>
                <dd>{c.cargo_type}</dd>
              </div>
              <div>
                <dt>Peso total</dt>
                <dd>{Number(c.weight_kg).toLocaleString("es-MX")} kg</dd>
              </div>
              <div>
                <dt>Equipo</dt>
                <dd>{c.vehicle_type}</dd>
              </div>
              <div>
                <dt>Opciones encontradas</dt>
                <dd>{shipment.matches?.length || 0}</dd>
              </div>
            </dl>
            <div className="ready">✓ Todo listo para buscar transporte</div>
            <Button className="mt-5 w-full" onClick={() => go("analysis")}>
              Publicar y ver transportistas →
            </Button>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function ReadField({ label, value }) {
  return (
    <label className="field-label">
      {label}
      <input className="field" value={value || "Por confirmar"} readOnly />
    </label>
  );
}

function Analysis({ go, shipment }) {
  useEffect(() => {
    const timer = setTimeout(() => go("matches"), 1500);
    return () => clearTimeout(timer);
  }, [go]);
  return (
    <div className="grid min-h-screen place-items-center bg-navy p-6 text-white">
      <div className="w-full max-w-3xl">
        <div className="text-center">
          <p className="eyebrow text-rose-200">● CARGAI TRABAJANDO</p>
          <h1 className="mt-5 text-4xl font-extrabold md:text-5xl">
            Encontrando el transporte ideal
          </h1>
          <p className="mt-4 text-blue-100/65">
            Cruzamos tu solicitud con transportistas disponibles.
          </p>
        </div>
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[.06] p-7">
          <div className="flex justify-between text-sm font-bold">
            <span>PROGRESO DEL ANÁLISIS</span>
            <span>Procesando</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <i className="block h-full w-4/5 animate-pulse rounded-full bg-wine" />
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              "Carga estructurada",
              "Ruta validada",
              `${shipment.matches?.length || 0} coincidencias`,
            ].map((x) => (
              <div
                key={x}
                className="rounded-xl bg-white/[.06] p-4 text-sm font-bold"
              >
                <span className="mr-2 text-rose-300">✓</span>
                {x}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Matches({ go, shipment, choose, busyIndex, refresh, refreshing }) {
  const matches = (shipment.matches || []).slice(0, 3);
  return (
    <Shell page="create" go={go} back={() => go("review")}>
      <div className="page max-w-6xl">
        <div className="heading">
          <div>
            <p className="eyebrow">RESULTADOS DEL MATCHING</p>
            <h1>{matches.length} transportistas compatibles</h1>
            <p>Compara compatibilidad y cotización.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="route-pill">
              {shipment.cargo.origin} → {shipment.cargo.destination}
            </span>
            <button
              className="filter-active"
              disabled={refreshing}
              onClick={refresh}
            >
              {refreshing ? "Actualizando…" : "↻ Actualizar"}
            </button>
          </div>
        </div>
        <Steps current={3} />
        <div className="space-y-4">
          {matches.map((m, i) => (
            <article
              key={`${m.carrier_id}-${i}`}
              className={`match-card ${i === 0 ? "recommended" : ""}`}
            >
              {i === 0 && <span className="ribbon">MEJOR OPCIÓN</span>}
              <div className="flex items-center gap-4">
                <span className="carrier-logo">{initials(m.name)}</span>
                <div>
                  <h2 className="text-xl font-extrabold">{m.name}</h2>
                  <p className="text-sm text-slate-500">
                    {shipment.cargo.origin} → {shipment.cargo.destination}
                  </p>
                </div>
              </div>
              <div className="score">
                <b>{m.score}%</b>
                <span>compatibilidad</span>
              </div>
              <div className="text-sm">
                <b className="block">
                  {m.vehicle_type || shipment.cargo.vehicle_type}
                </b>
                <p className="mt-2 max-w-xl leading-6 text-slate-500">
                  {m.reason}
                </p>
              </div>
              <div className="text-right">
                <small className="eyebrow">COTIZACIÓN</small>
                <b className="mt-1 block text-2xl text-ink">{money(m.quote)}</b>
                <Button
                  busy={busyIndex === i}
                  className="mt-3"
                  onClick={() => choose(m, i)}
                >
                  {busyIndex === i ? "Confirmando…" : "Elegir propuesta →"}
                </Button>
              </div>
            </article>
          ))}
        </div>
        {!matches.length && (
          <div className="panel p-10 text-center">
            <h2 className="text-2xl font-extrabold">
              No encontramos coincidencias
            </h2>
            <p className="mt-2 text-slate-500">
              Modifica la descripción e intenta nuevamente.
            </p>
            <Button className="mt-5" onClick={() => go("create")}>
              Editar solicitud
            </Button>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Confirmed({ go, shipment, carrier, generate, busy }) {
  const c = shipment.cargo;
  return (
    <Shell page="trips" go={go}>
      <div className="page max-w-6xl">
        <section className="mb-5 flex flex-col gap-5 rounded-xl border border-rose-200 bg-rose-50 p-7 md:flex-row md:items-center">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-wine text-2xl font-extrabold text-white">
            ✓
          </span>
          <div>
            <p className="eyebrow">ASIGNACIÓN COMPLETADA</p>
            <h1 className="mt-1 text-3xl font-extrabold">
              ¡Tu viaje está confirmado!
            </h1>
            <p className="mt-1 text-slate-600">
              {carrier.name} recibió la asignación.
            </p>
          </div>
          <div className="md:ml-auto">
            <small className="eyebrow">FOLIO</small>
            <b className="block text-lg">
              CM-{String(shipment.shipment_id).padStart(5, "0")}
            </b>
          </div>
        </section>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_.7fr]">
          <section className="panel p-7">
            <span className="status">● CONFIRMADO</span>
            <h2 className="mt-5 text-3xl font-extrabold">
              {c.origin} → {c.destination}
            </h2>
            <p className="mt-2 text-slate-500">
              {c.cargo_type} · {Number(c.weight_kg).toLocaleString("es-MX")} kg
              · {c.vehicle_type}
            </p>
            <div className="route-visual">
              <span>
                ORIGEN<b>{c.origin}</b>
              </span>
              <i>━━━━━━━━ →</i>
              <span>
                DESTINO<b>{c.destination}</b>
              </span>
            </div>
            <div className="mt-7 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
              <Info label="RECOLECCIÓN" value={dateText(c.date)} />
              <Info label="VEHÍCULO" value={c.vehicle_type} />
              <Info label="TRANSPORTISTA" value={carrier.name} />
              <Info label="PRECIO ACORDADO" value={money(carrier.quote)} />
            </div>
          </section>
          <aside className="panel p-7">
            <div className="flex items-center gap-4">
              <span className="carrier-logo">{initials(carrier.name)}</span>
              <div>
                <small className="eyebrow">TRANSPORTISTA ASIGNADO</small>
                <h2 className="text-xl font-extrabold">{carrier.name}</h2>
              </div>
            </div>
            <dl className="summary-list">
              <div>
                <dt>Capacidad</dt>
                <dd>
                  {Number(carrier.capacity_kg).toLocaleString("es-MX")} kg
                </dd>
              </div>
              <div>
                <dt>Vehículo</dt>
                <dd>{carrier.vehicle_type}</dd>
              </div>
              <div>
                <dt>Compatibilidad</dt>
                <dd>{carrier.score}%</dd>
              </div>
            </dl>
            <div className="ready">✦ {carrier.reason}</div>
            <Button busy={busy} className="mt-5 w-full" onClick={generate}>
              {busy ? "Generando documento…" : "Generar orden PDF →"}
            </Button>
            <Button
              secondary
              className="mt-3 w-full"
              onClick={() => go("dashboard")}
            >
              Volver al inicio
            </Button>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <small className="eyebrow">{label}</small>
      <b className="mt-1 block">{value}</b>
    </div>
  );
}

function Order({ go, shipment, carrier, order }) {
  const c = shipment.cargo;
  return (
    <Shell page="trips" go={go} back={() => go("confirmed")}>
      <div className="page max-w-6xl">
        <div className="heading">
          <div>
            <p className="eyebrow">DOCUMENTACIÓN</p>
            <h1>Orden de servicio</h1>
            <p>El documento fue generado y está listo para abrirse.</p>
          </div>
          <a
            href={order.pdf_url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            Abrir PDF ↗
          </a>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_.55fr]">
          <article className="service-doc">
            <header>
              <Brand />
              <div className="text-right">
                <small className="eyebrow">ORDEN DE SERVICIO</small>
                <b className="block text-xl">{order.order_id}</b>
              </div>
            </header>
            <div className="doc-status">
              ✓ SERVICIO CONFIRMADO{" "}
              <span>
                Folio CM-{String(shipment.shipment_id).padStart(5, "0")}
              </span>
            </div>
            <section className="doc-grid">
              <div>
                <small>SOLICITANTE</small>
                <h2>Industrias Regiomontanas S.A.</h2>
                <p>Ana Martínez · Productor</p>
              </div>
              <div>
                <small>TRANSPORTISTA</small>
                <h2>{carrier.name}</h2>
                <p>Empresa asignada por CARGAI</p>
              </div>
            </section>
            <DocSection number="01" title="Ruta y programación">
              <div className="grid gap-5 sm:grid-cols-2">
                <Info label="ORIGEN" value={c.origin} />
                <Info label="DESTINO" value={c.destination} />
                <Info label="RECOLECCIÓN" value={dateText(c.date)} />
                <Info label="EQUIPO" value={c.vehicle_type} />
              </div>
            </DocSection>
            <DocSection number="02" title="Descripción del servicio">
              <div className="grid gap-4 sm:grid-cols-3">
                <Info label="MERCANCÍA" value={c.cargo_type} />
                <Info
                  label="PESO"
                  value={`${Number(c.weight_kg).toLocaleString("es-MX")} kg`}
                />
                <Info label="PRECIO" value={money(carrier.quote)} />
              </div>
            </DocSection>
            <footer className="mt-10 flex justify-between border-t border-line pt-4 text-xs text-slate-400">
              <span>Documento generado por CARGAI</span>
              <span>{order.order_id}</span>
            </footer>
          </article>
          <aside className="panel h-fit p-7">
            <div className="ready">✓ Documento listo</div>
            <h2 className="mt-6 text-xl font-extrabold">
              {order.order_id}.pdf
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              La liga del archivo es temporal. Descárgalo o guárdalo antes de
              que expire.
            </p>
            <a
              href={order.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-6 w-full"
            >
              Descargar orden ↗
            </a>
            <Button
              secondary
              className="mt-3 w-full"
              onClick={() => go("dashboard")}
            >
              Finalizar
            </Button>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function DocSection({ number, title, children }) {
  return (
    <section className="mt-8 border-t border-line pt-6">
      <h3 className="section-title">
        <span>{number}</span>
        {title}
      </h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const carrierLoads = [
  {
    id: "CM-2841",
    origin: "Monterrey, Nuevo León",
    destination: "Saltillo, Coahuila",
    cargo: "Autopartes",
    weight: "8,000 kg",
    date: "2 oct 2026",
    vehicle: "Caja seca · 48 pies",
    distance: "87 km",
    estimate: "$13,800 – $15,200",
    score: 96,
    pickup: "08:00 h",
    delivery: "12:30 h",
  },
  {
    id: "CM-2848",
    origin: "Querétaro, Querétaro",
    destination: "Guadalajara, Jalisco",
    cargo: "Electrodomésticos",
    weight: "4,500 kg",
    date: "4 oct 2026",
    vehicle: "Caja seca · 40 pies",
    distance: "355 km",
    estimate: "$20,000 – $23,500",
    score: 91,
    pickup: "07:00 h",
    delivery: "17:00 h",
  },
  {
    id: "CM-2853",
    origin: "Ciudad de México",
    destination: "Puebla, Puebla",
    cargo: "Material de empaque",
    weight: "2,200 kg",
    date: "5 oct 2026",
    vehicle: "Rabón",
    distance: "132 km",
    estimate: "$8,200 – $9,600",
    score: 84,
    pickup: "09:30 h",
    delivery: "14:00 h",
  },
];

function CarrierSidebar({ page, go }) {
  const session = readSession();
  const items = [
    ["carrier-dashboard", "Cargas disponibles", "▤"],
    ["carrier-trips", "Mis viajes", "▰"],
    ["carrier-quotes", "Cotizaciones", "$"],
    ["carrier-profile", "Mi flotilla", "▣"],
  ];
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-navy px-5 py-6 text-white lg:flex">
      <Brand dark />
      <span className="mt-5 w-fit rounded bg-white/10 px-3 py-1 text-[11px] font-extrabold tracking-widest text-blue-100">
        PORTAL TRANSPORTISTA
      </span>
      <nav className="mt-10 space-y-2">
        {items.map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() =>
              ["carrier-dashboard", "carrier-trips"].includes(id) && go(id)
            }
            className={`nav ${page === id ? "nav-active" : ""}`}
          >
            <span>{icon}</span>
            {label}
            {id === "carrier-dashboard" && <em>3</em>}
          </button>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-5">
        <div className="flex items-center gap-3">
          <span className="avatar bg-rose-100 text-wine">
            {initials(session?.name)}
          </span>
          <div>
            <b className="block text-sm">{session?.name || "Transportista"}</b>
            <small className="text-white/55">Cuenta transportista</small>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem(SESSION_KEY);
            go("login");
          }}
          className="mt-4 text-xs font-bold text-white/45 hover:text-white"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function CarrierShell({ page, go, children, back }) {
  const session = readSession();
  return (
    <div className="min-h-screen bg-cloud lg:flex">
      <CarrierSidebar page={page} go={go} />
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line/70 bg-cloud/90 px-5 backdrop-blur lg:px-10">
          <div className="lg:hidden">
            <Brand />
          </div>
          {back ? (
            <button
              className="hidden text-sm font-bold text-slate-600 hover:text-wine lg:block"
              onClick={back}
            >
              ← Volver a cargas
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-wine sm:block">
              ● Disponible para recibir cargas
            </span>
            <span className="avatar">{initials(session?.name)}</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function CarrierDashboard({ go, quoteSubmitted }) {
  return (
    <CarrierShell page="carrier-dashboard" go={go}>
      <div className="page max-w-7xl">
        <div className="heading">
          <div>
            <p className="eyebrow">CENTRO DE OPERACIONES</p>
            <h1>Cargas para tu flotilla</h1>
            <p>Oportunidades ordenadas por compatibilidad con tus unidades.</p>
          </div>
          <div className="flex gap-2">
            <button className="filter-active">Disponibles</button>
            <button className="filter-button">Cerca de mí</button>
          </div>
        </div>
        {quoteSubmitted && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-wine">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-wine text-white">
              ✓
            </span>
            Tu cotización fue enviada. Te avisaremos cuando el productor tome
            una decisión.
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Cargas compatibles", "03", "Actualizadas ahora"],
            [
              "Cotizaciones activas",
              quoteSubmitted ? "04" : "03",
              "En espera de respuesta",
            ],
            ["Viajes del mes", "08", "$118,400 facturados"],
          ].map((x, i) => (
            <article className="panel metric" key={x[0]}>
              <span className="metric-icon">{["▤", "$", "▰"][i]}</span>
              <div>
                <small>{x[0]}</small>
                <b>{x[1]}</b>
                <p>{x[2]}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_310px]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">Recomendadas para ti</h2>
              <span className="text-sm font-bold text-slate-400">
                3 resultados
              </span>
            </div>
            <div className="space-y-4">
              {carrierLoads.map((load, i) => (
                <article
                  key={load.id}
                  className={`load-card ${i === 0 ? "best" : ""}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="status">{load.id}</span>
                      {i === 0 && (
                        <span className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-extrabold text-wine">
                          Mejor match
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 text-xl font-extrabold">
                      {load.origin} <span className="text-wine">→</span>{" "}
                      {load.destination}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {load.cargo} · {load.weight} · {load.vehicle}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                      <span>▣ {load.date}</span>
                      <span>⌁ {load.distance}</span>
                      <span>▰ Carga completa</span>
                    </div>
                  </div>
                  <div className="load-score">
                    <b>{load.score}%</b>
                    <span>compatibilidad</span>
                  </div>
                  <div className="text-right">
                    <small className="eyebrow">RANGO ESTIMADO</small>
                    <b className="mt-1 block text-lg">{load.estimate}</b>
                    <Button className="mt-4" onClick={() => go("carrier-load")}>
                      Ver carga →
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <aside className="space-y-5">
            <section className="rounded-xl bg-navy p-6 text-white shadow-panel">
              <p className="eyebrow text-rose-200">VIAJE ASIGNADO</p>
              <h2 className="mt-3 text-xl font-extrabold">
                Apodaca → San Luis Potosí
              </h2>
              <p className="mt-2 text-sm text-blue-100/65">
                Hoy · Recolección 16:00 h
              </p>
              <button
                onClick={() => go("carrier-trip")}
                className="mt-6 text-sm font-extrabold text-rose-200"
              >
                Abrir operación →
              </button>
            </section>
            <section className="panel p-6">
              <h2 className="font-extrabold">Estado de tu perfil</h2>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <i className="block h-full w-[86%] rounded-full bg-wine" />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Perfil completo al 86%
              </p>
              <button className="mt-4 text-sm font-extrabold text-wine">
                Completar documentos →
              </button>
            </section>
          </aside>
        </div>
      </div>
    </CarrierShell>
  );
}

function CarrierLoad({ go }) {
  const load = carrierLoads[0];
  return (
    <CarrierShell
      page="carrier-dashboard"
      go={go}
      back={() => go("carrier-dashboard")}
    >
      <div className="page max-w-6xl">
        <div className="heading">
          <div>
            <div className="flex items-center gap-2">
              <span className="status">{load.id}</span>
              <span className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-extrabold text-wine">
                96% compatible
              </span>
            </div>
            <h1>
              {load.origin} → {load.destination}
            </h1>
            <p>Revisa la operación antes de cotizar.</p>
          </div>
          <Button onClick={() => go("carrier-quote")}>
            Enviar cotización →
          </Button>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_.7fr]">
          <section className="panel p-7">
            <div className="route-map-pro">
              <div>
                <small>ORIGEN</small>
                <b>{load.origin}</b>
                <span>
                  {load.date} · {load.pickup}
                </span>
              </div>
              <i>
                <em>{load.distance}</em>
              </i>
              <div className="text-right">
                <small>DESTINO</small>
                <b>{load.destination}</b>
                <span>Entrega estimada · {load.delivery}</span>
              </div>
            </div>
            <hr className="my-7 border-line" />
            <h2 className="section-title">
              <span>01</span>Información de la carga
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Info label="MERCANCÍA" value={load.cargo} />
              <Info label="PESO TOTAL" value={load.weight} />
              <Info label="EQUIPO REQUERIDO" value={load.vehicle} />
              <Info label="MODALIDAD" value="Viaje dedicado" />
            </div>
            <hr className="my-7 border-line" />
            <h2 className="section-title">
              <span>02</span>Requisitos del servicio
            </h2>
            <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <li className="requirement">✓ Seguro de carga vigente</li>
              <li className="requirement">✓ Rastreo GPS activo</li>
              <li className="requirement">✓ Operador con licencia federal</li>
              <li className="requirement">✓ Unidad modelo 2018 o posterior</li>
            </ul>
            <div className="mt-7 rounded-xl border border-line bg-slate-50 p-5">
              <small className="eyebrow">NOTAS DEL PRODUCTOR</small>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                La mercancía estará paletizada. Se requiere llegar 30 minutos
                antes para registro de acceso.
              </p>
            </div>
          </section>
          <aside className="space-y-5">
            <section className="panel p-6">
              <small className="eyebrow">ESTIMACIÓN CARGAI</small>
              <h2 className="mt-2 text-2xl font-extrabold">{load.estimate}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Calculado con distancia, equipo, disponibilidad y tarifas de la
                ruta.
              </p>
              <Button
                className="mt-5 w-full"
                onClick={() => go("carrier-quote")}
              >
                Preparar cotización
              </Button>
            </section>
            <section className="panel p-6">
              <h2 className="font-extrabold">Tu compatibilidad</h2>
              <dl className="summary-list">
                <div>
                  <dt>Ruta</dt>
                  <dd>100%</dd>
                </div>
                <div>
                  <dt>Capacidad</dt>
                  <dd>100%</dd>
                </div>
                <div>
                  <dt>Vehículo</dt>
                  <dd>100%</dd>
                </div>
                <div>
                  <dt>Disponibilidad</dt>
                  <dd>85%</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </CarrierShell>
  );
}

function CarrierQuote({ go, submitQuote }) {
  const [price, setPrice] = useState("14800");
  const [unit, setUnit] = useState("TN-482 · Kenworth T680");
  const [notes, setNotes] = useState(
    "Incluye casetas, seguro básico y rastreo GPS durante todo el trayecto.",
  );
  const [accepted, setAccepted] = useState(true);
  return (
    <CarrierShell
      page="carrier-dashboard"
      go={go}
      back={() => go("carrier-load")}
    >
      <div className="page max-w-5xl">
        <div className="heading">
          <div>
            <p className="eyebrow">NUEVA COTIZACIÓN · CM-2841</p>
            <h1>Prepara tu propuesta</h1>
            <p>La información será enviada al productor para su evaluación.</p>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_.7fr]">
          <section className="panel p-7">
            <h2 className="section-title">
              <span>01</span>Importe y unidad
            </h2>
            <label className="field-label mt-7">
              PRECIO TOTAL DE SERVICIO
              <div className="input-money">
                <span>$</span>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                />
                <b>MXN</b>
              </div>
            </label>
            <p className="-mt-3 text-xs text-slate-400">
              El rango sugerido es de $13,800 a $15,200 MXN.
            </p>
            <label className="field-label mt-7">
              UNIDAD ASIGNADA
              <select
                className="field"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option>TN-482 · Kenworth T680</option>
                <option>TN-514 · Freightliner Cascadia</option>
              </select>
            </label>
            <label className="field-label">
              NOTAS DE LA PROPUESTA
              <textarea
                className="field min-h-28 resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <label className="mt-5 flex cursor-pointer gap-3 rounded-lg border border-line p-4 text-sm">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 accent-wine"
              />
              <span>
                <b className="block">
                  Confirmo disponibilidad para la fecha indicada
                </b>
                <span className="mt-1 block text-slate-500">
                  La unidad y el operador podrán cubrir el servicio descrito.
                </span>
              </span>
            </label>
            <Button
              disabled={!accepted || !price}
              className="mt-6 w-full"
              onClick={() => submitQuote({ price, unit, notes })}
            >
              Enviar cotización →
            </Button>
          </section>
          <aside className="space-y-5">
            <section className="rounded-xl bg-navy p-6 text-white shadow-panel">
              <small className="eyebrow text-rose-200">RESUMEN DE CARGA</small>
              <h2 className="mt-3 text-xl font-extrabold">
                Monterrey → Saltillo
              </h2>
              <p className="mt-2 text-sm text-blue-100/65">
                Autopartes · 8,000 kg
              </p>
              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-white/55">Recolección</dt>
                  <dd className="font-bold">2 oct · 08:00</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/55">Distancia</dt>
                  <dd className="font-bold">87 km</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/55">Equipo</dt>
                  <dd className="font-bold">Caja seca</dd>
                </div>
              </dl>
            </section>
            <section className="panel p-6">
              <h2 className="font-extrabold">Después de enviar</h2>
              <ol className="mt-5 space-y-4 text-sm text-slate-500">
                <li>
                  <b className="mr-2 text-wine">1.</b>El productor compara
                  propuestas.
                </li>
                <li>
                  <b className="mr-2 text-wine">2.</b>Recibes una notificación
                  si eres elegido.
                </li>
                <li>
                  <b className="mr-2 text-wine">3.</b>Se genera la orden de
                  servicio.
                </li>
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </CarrierShell>
  );
}

function CarrierTrip({ go }) {
  const [status, setStatus] = useState("assigned");
  const stages = [
    ["assigned", "Asignado"],
    ["pickup", "En recolección"],
    ["transit", "En tránsito"],
    ["delivered", "Entregado"],
  ];
  const active = stages.findIndex((x) => x[0] === status);
  const advance = () => {
    if (active < stages.length - 1) setStatus(stages[active + 1][0]);
  };
  return (
    <CarrierShell page="carrier-trip" go={go}>
      <div className="page max-w-6xl">
        <div className="heading">
          <div>
            <p className="eyebrow">VIAJE CM-2796</p>
            <h1>Apodaca → San Luis Potosí</h1>
            <p>Orden OS-CM-2796 · Autopartes · 10,000 kg</p>
          </div>
          <span className="rounded-full bg-rose-100 px-4 py-2 text-sm font-extrabold text-wine">
            ● {stages[active][1]}
          </span>
        </div>
        <div className="panel mb-5 p-6">
          <div className="trip-progress">
            {stages.map((x, i) => (
              <div key={x[0]} className={i <= active ? "done" : ""}>
                <span>{i < active ? "✓" : i + 1}</span>
                <b>{x[1]}</b>
                {i < stages.length - 1 && <i />}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.35fr_.7fr]">
          <section className="panel p-7">
            <div className="route-map-pro">
              <div>
                <small>RECOLECCIÓN</small>
                <b>Apodaca, Nuevo León</b>
                <span>Hoy · 16:00 h</span>
              </div>
              <i>
                <em>492 km</em>
              </i>
              <div className="text-right">
                <small>ENTREGA</small>
                <b>San Luis Potosí, SLP</b>
                <span>Mañana · 08:00 h</span>
              </div>
            </div>
            <div className="mt-7 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
              <Info label="UNIDAD" value="TN-482 · Kenworth T680" />
              <Info label="OPERADOR" value="Jorge Salinas" />
              <Info label="TELÉFONO" value="+52 •••• 1842" />
              <Info label="PRECIO ACORDADO" value="$18,600 MXN" />
            </div>
            <div className="mt-7 rounded-xl bg-slate-50 p-5">
              <h2 className="font-extrabold">Indicaciones de recolección</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Presentarse en caseta 2 con identificación, licencia y número de
                orden. Ventana de acceso de 15:30 a 16:15 h.
              </p>
            </div>
          </section>
          <aside className="space-y-5">
            <section className="panel p-6">
              <small className="eyebrow">SIGUIENTE ACCIÓN</small>
              <h2 className="mt-3 text-xl font-extrabold">
                {active < 3
                  ? `Marcar como “${stages[active + 1][1]}”`
                  : "Viaje completado"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Actualiza el estado para mantener informado al productor.
              </p>
              {active < 3 && (
                <Button className="mt-5 w-full" onClick={advance}>
                  Actualizar estado →
                </Button>
              )}
            </section>
            <section className="panel p-6">
              <h2 className="font-extrabold">Documentos</h2>
              <button className="mt-4 flex w-full items-center justify-between rounded-lg border border-line p-4 text-left text-sm">
                <span>
                  <b className="block">Orden de servicio</b>
                  <small className="text-slate-400">OS-CM-2796.pdf</small>
                </span>
                <strong className="text-wine">Ver ↗</strong>
              </button>
              <button className="mt-3 flex w-full items-center justify-between rounded-lg border border-dashed border-line p-4 text-left text-sm text-slate-500">
                <span>＋ Comprobante de entrega</span>
              </button>
            </section>
          </aside>
        </div>
      </div>
    </CarrierShell>
  );
}

function LiveCarrierDashboard({ go, selectTrip, acceptedTrip }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadTrips = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await viajesDisponibles();
      setTrips(data.trips || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadTrips();
  }, []);
  return (
    <CarrierShell page="carrier-dashboard" go={go}>
      <div className="page max-w-7xl">
        <div className="heading">
          <div>
            <p className="eyebrow">CENTRO DE OPERACIONES</p>
            <h1>Viajes disponibles</h1>
            <p>Cargas publicadas que puedes tomar para tu flotilla.</p>
          </div>
          <button className="filter-active" onClick={loadTrips}>
            ↻ Actualizar
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Disponibles",
              loading ? "—" : String(trips.length).padStart(2, "0"),
              "Publicados ahora",
            ],
            [
              "Viaje asignado",
              acceptedTrip ? "01" : "00",
              acceptedTrip ? "Listo para operar" : "Sin asignación",
            ],
            ["Estado de cuenta", "Activa", "Transportista verificado"],
          ].map((x, i) => (
            <article className="panel metric" key={x[0]}>
              <span className="metric-icon">{["▤", "▰", "✓"][i]}</span>
              <div>
                <small>{x[0]}</small>
                <b>{x[1]}</b>
                <p>{x[2]}</p>
              </div>
            </article>
          ))}
        </div>
        {error && (
          <div className="auth-error mt-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={loadTrips}>Reintentar</button>
          </div>
        )}
        <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_310px]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">Cargas publicadas</h2>
              <span className="text-sm font-bold text-slate-400">
                {trips.length} resultados
              </span>
            </div>
            {loading ? (
              <div className="grid gap-4">
                <div className="skeleton-card" />
                <div className="skeleton-card" />
              </div>
            ) : trips.length ? (
              <div className="space-y-4">
                {trips.map((trip, i) => (
                  <article
                    key={trip.shipment_id}
                    className={`load-card ${i === 0 ? "best" : ""}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="status">
                          CM-{String(trip.shipment_id).padStart(4, "0")}
                        </span>
                        {i === 0 && (
                          <span className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-extrabold text-wine">
                            Nueva
                          </span>
                        )}
                      </div>
                      <h3 className="mt-4 text-xl font-extrabold">
                        {trip.origin} <span className="text-wine">→</span>{" "}
                        {trip.destination}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {trip.cargo_type} ·{" "}
                        {Number(trip.weight_kg).toLocaleString("es-MX")} kg ·{" "}
                        {trip.vehicle_type}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                        <span>▣ {dateText(trip.travel_date)}</span>
                        <span>● {trip.status}</span>
                      </div>
                    </div>
                    <div className="load-score">
                      <b>#{trip.shipment_id}</b>
                      <span>solicitud</span>
                    </div>
                    <div className="text-right">
                      <small className="eyebrow">ESTADO</small>
                      <b className="mt-1 block text-lg">Disponible</b>
                      <Button className="mt-4" onClick={() => selectTrip(trip)}>
                        Ver viaje →
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="panel p-10 text-center">
                <h2 className="text-xl font-extrabold">
                  No hay viajes disponibles
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Las nuevas cargas aparecerán aquí cuando una empresa las
                  publique.
                </p>
                <Button secondary className="mt-5" onClick={loadTrips}>
                  Actualizar
                </Button>
              </div>
            )}
          </section>
          <aside className="space-y-5">
            {acceptedTrip && (
              <section className="rounded-xl bg-navy p-6 text-white shadow-panel">
                <p className="eyebrow text-rose-200">VIAJE ASIGNADO</p>
                <h2 className="mt-3 text-xl font-extrabold">
                  {acceptedTrip.origin} → {acceptedTrip.destination}
                </h2>
                <p className="mt-2 text-sm text-blue-100/65">
                  {dateText(acceptedTrip.travel_date)} ·{" "}
                  {acceptedTrip.cargo_type}
                </p>
                <button
                  onClick={() => go("carrier-trip")}
                  className="mt-6 text-sm font-extrabold text-rose-200"
                >
                  Abrir operación →
                </button>
              </section>
            )}
            <section className="panel p-6">
              <h2 className="font-extrabold">Cómo tomar un viaje</h2>
              <ol className="mt-5 space-y-4 text-sm text-slate-500">
                <li>
                  <b className="mr-2 text-wine">1.</b>Revisa carga, fecha y
                  equipo.
                </li>
                <li>
                  <b className="mr-2 text-wine">2.</b>Confirma que tienes
                  disponibilidad.
                </li>
                <li>
                  <b className="mr-2 text-wine">3.</b>Toma el viaje antes que
                  otro transportista.
                </li>
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </CarrierShell>
  );
}

function LiveCarrierLoad({ go, trip, take, busy }) {
  if (!trip)
    return (
      <CarrierShell page="carrier-dashboard" go={go}>
        <div className="page">
          <div className="panel p-10 text-center">
            <h1 className="text-2xl font-extrabold">
              Selecciona un viaje disponible
            </h1>
            <Button className="mt-5" onClick={() => go("carrier-dashboard")}>
              Ver viajes
            </Button>
          </div>
        </div>
      </CarrierShell>
    );
  return (
    <CarrierShell
      page="carrier-dashboard"
      go={go}
      back={() => go("carrier-dashboard")}
    >
      <div className="page max-w-6xl">
        <div className="heading">
          <div>
            <div className="flex items-center gap-2">
              <span className="status">
                CM-{String(trip.shipment_id).padStart(4, "0")}
              </span>
              <span className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-extrabold text-wine">
                Disponible
              </span>
            </div>
            <h1>
              {trip.origin} → {trip.destination}
            </h1>
            <p>Verifica los datos antes de asignarlo a tu cuenta.</p>
          </div>
          <Button busy={busy} onClick={take}>
            {busy ? "Tomando viaje…" : "Tomar viaje →"}
          </Button>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_.7fr]">
          <section className="panel p-7">
            <div className="route-map-pro">
              <div>
                <small>ORIGEN</small>
                <b>{trip.origin}</b>
                <span>Recolección · {dateText(trip.travel_date)}</span>
              </div>
              <i>
                <em>Ruta publicada</em>
              </i>
              <div className="text-right">
                <small>DESTINO</small>
                <b>{trip.destination}</b>
                <span>Entrega por coordinar</span>
              </div>
            </div>
            <hr className="my-7 border-line" />
            <h2 className="section-title">
              <span>01</span>Información de la carga
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Info label="MERCANCÍA" value={trip.cargo_type} />
              <Info
                label="PESO TOTAL"
                value={`${Number(trip.weight_kg).toLocaleString("es-MX")} kg`}
              />
              <Info label="EQUIPO REQUERIDO" value={trip.vehicle_type} />
              <Info label="ESTADO" value={trip.status} />
            </div>
            <div className="mt-7 rounded-xl border border-rose-200 bg-rose-50 p-5">
              <small className="eyebrow">ASIGNACIÓN INMEDIATA</small>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Al tomar el viaje quedará asignado a tu cuenta. Si otro
                transportista lo acepta primero, CARGAI te avisará para
                evitar una doble asignación.
              </p>
            </div>
          </section>
          <aside className="space-y-5">
            <section className="panel p-6">
              <small className="eyebrow">CONFIRMACIÓN</small>
              <h2 className="mt-3 text-xl font-extrabold">
                ¿Tu unidad está disponible?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Confirma que cuentas con el equipo indicado para la fecha
                publicada.
              </p>
              <Button busy={busy} className="mt-5 w-full" onClick={take}>
                {busy ? "Confirmando…" : "Sí, tomar este viaje"}
              </Button>
            </section>
            <section className="panel p-6">
              <h2 className="font-extrabold">Solicitud</h2>
              <dl className="summary-list">
                <div>
                  <dt>Folio</dt>
                  <dd>CM-{String(trip.shipment_id).padStart(4, "0")}</dd>
                </div>
                <div>
                  <dt>Fecha</dt>
                  <dd>{dateText(trip.travel_date)}</dd>
                </div>
                <div>
                  <dt>Modalidad</dt>
                  <dd>Viaje dedicado</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </CarrierShell>
  );
}

function LiveCarrierTrip({ go, trip, offer }) {
  if (!trip)
    return (
      <CarrierShell page="carrier-trip" go={go}>
        <div className="page">
          <div className="panel p-10 text-center">
            <h1 className="text-2xl font-extrabold">
              Aún no tienes un viaje asignado
            </h1>
            <Button className="mt-5" onClick={() => go("carrier-dashboard")}>
              Ver disponibles
            </Button>
          </div>
        </div>
      </CarrierShell>
    );
  return (
    <CarrierShell page="carrier-trip" go={go}>
      <div className="page max-w-6xl">
        <div className="heading">
          <div>
            <p className="eyebrow">
              VIAJE CM-{String(trip.shipment_id).padStart(4, "0")}
            </p>
            <h1>
              {trip.origin} → {trip.destination}
            </h1>
            <p>
              {trip.cargo_type} ·{" "}
              {Number(trip.weight_kg).toLocaleString("es-MX")} kg ·{" "}
              {trip.vehicle_type}
            </p>
          </div>
          <span className="rounded-full bg-rose-100 px-4 py-2 text-sm font-extrabold text-wine">
            ● ASIGNADO
          </span>
        </div>
        <div className="panel mb-5 p-6">
          <div className="trip-progress">
            <div className="done">
              <span>✓</span>
              <b>Asignado</b>
              <i />
            </div>
            <div>
              <span>2</span>
              <b>En recolección</b>
              <i />
            </div>
            <div>
              <span>3</span>
              <b>En tránsito</b>
              <i />
            </div>
            <div>
              <span>4</span>
              <b>Entregado</b>
            </div>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.35fr_.7fr]">
          <section className="panel p-7">
            <div className="route-map-pro">
              <div>
                <small>RECOLECCIÓN</small>
                <b>{trip.origin}</b>
                <span>{dateText(trip.travel_date)}</span>
              </div>
              <i>
                <em>Viaje asignado</em>
              </i>
              <div className="text-right">
                <small>ENTREGA</small>
                <b>{trip.destination}</b>
                <span>Horario por coordinar</span>
              </div>
            </div>
            <div className="mt-7 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
              <Info label="MERCANCÍA" value={trip.cargo_type} />
              <Info
                label="PESO"
                value={`${Number(trip.weight_kg).toLocaleString("es-MX")} kg`}
              />
              <Info label="UNIDAD REQUERIDA" value={trip.vehicle_type} />
              <Info label="ESTADO" value="ASSIGNED" />
            </div>
          </section>
          <aside className="space-y-5">
            <section className="rounded-xl bg-navy p-6 text-white shadow-panel">
              <small className="eyebrow text-rose-200">
                ASIGNACIÓN CONFIRMADA
              </small>
              <h2 className="mt-3 text-xl font-extrabold">El viaje es tuyo</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100/65">
                La empresa ya puede ver que tu cuenta tomó esta carga.
              </p>
              {offer?.price && (
                <b className="mt-5 block text-2xl">{money(offer.price)}</b>
              )}
            </section>
            <Button
              secondary
              className="w-full"
              onClick={() => go("carrier-dashboard")}
            >
              Volver a disponibles
            </Button>
          </aside>
        </div>
      </div>
    </CarrierShell>
  );
}

const ASSIGNED_TRIP_STATUSES = new Set([
  "ASSIGNED",
  "ASIGNADA",
  "ASIGNADO",
  "EN_RECOLECCION",
  "EN_TRANSITO",
  "ENTREGADO",
  "CONFIRMADO",
]);

function tripStatusKey(status) {
  return String(status || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

function openTripsOnly(availableTrips, assignedTrips) {
  const assignedIds = new Set(
    assignedTrips.map((trip) => String(trip.shipment_id)),
  );
  return availableTrips.filter((trip) => {
    if (assignedIds.has(String(trip.shipment_id))) return false;
    if (trip.carrier_id) return false;
    return !ASSIGNED_TRIP_STATUSES.has(tripStatusKey(trip.status));
  });
}

function PendingCarrierDashboard({ go, selectTrip, pendingTrip }) {
  const session = readSession();
  const [trips, setTrips] = useState([]);
  const [assignedCount, setAssignedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function loadTrips() {
    setLoading(true);
    setError("");
    try {
      const [available, assigned] = await Promise.all([
        viajesDisponibles(),
        session?.carrier_id
          ? misViajes(session.carrier_id)
          : Promise.resolve({ trips: [] }),
      ]);
      const assignedList = assigned.trips || [];
      setTrips(openTripsOnly(available.trips || [], assignedList));
      setAssignedCount(assignedList.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadTrips();
  }, []);
  return (
    <CarrierShell page="carrier-dashboard" go={go}>
      <div className="page max-w-7xl">
        <div className="heading">
          <div>
            <p className="eyebrow">CENTRO DE OPERACIONES</p>
            <h1>Viajes disponibles</h1>
            <p>
              Envía tu disponibilidad; la empresa decide qué transportista
              asignar.
            </p>
          </div>
          <button className="filter-active" onClick={loadTrips}>
            ↻ Actualizar
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Disponibles",
              loading ? "—" : String(trips.length).padStart(2, "0"),
              "Publicados ahora",
            ],
            [
              "En revisión",
              pendingTrip ? "01" : "00",
              pendingTrip ? "Esperando a la empresa" : "Sin postulaciones",
            ],
            ["Viajes autorizados", loading ? "—" : String(assignedCount).padStart(2, "0"), "Confirmados por empresas"],
          ].map((x, i) => (
            <article className="panel metric" key={x[0]}>
              <span className="metric-icon">{["▤", "⌁", "✓"][i]}</span>
              <div>
                <small>{x[0]}</small>
                <b>{x[1]}</b>
                <p>{x[2]}</p>
              </div>
            </article>
          ))}
        </div>
        {error && (
          <div className="auth-error mt-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={loadTrips}>Reintentar</button>
          </div>
        )}
        <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_310px]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">Cargas publicadas</h2>
              <span className="text-sm font-bold text-slate-400">
                {trips.length} resultados
              </span>
            </div>
            {loading ? (
              <div className="grid gap-4">
                <div className="skeleton-card" />
                <div className="skeleton-card" />
              </div>
            ) : trips.length ? (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <article key={trip.shipment_id} className="load-card">
                    <div>
                      <span className="status">
                        CM-{String(trip.shipment_id).padStart(4, "0")}
                      </span>
                      <h3 className="mt-4 text-xl font-extrabold">
                        {trip.origin} <span className="text-wine">→</span>{" "}
                        {trip.destination}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {trip.cargo_type} ·{" "}
                        {Number(trip.weight_kg).toLocaleString("es-MX")} kg ·{" "}
                        {trip.vehicle_type}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                        <span>▣ {dateText(trip.travel_date)}</span>
                        <span>● {trip.status}</span>
                      </div>
                    </div>
                    <div className="load-score">
                      <b>#{trip.shipment_id}</b>
                      <span>solicitud</span>
                    </div>
                    <div className="text-right">
                      <small className="eyebrow">ACCIÓN</small>
                      <b className="mt-1 block text-lg">Mostrar interés</b>
                      <Button className="mt-4" onClick={() => selectTrip(trip)}>
                        Revisar →
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="panel p-10 text-center">
                <h2 className="text-xl font-extrabold">
                  No hay viajes disponibles
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Las nuevas cargas aparecerán aquí cuando una empresa las
                  publique.
                </p>
                <Button secondary className="mt-5" onClick={loadTrips}>
                  Actualizar
                </Button>
              </div>
            )}
          </section>
          <aside className="space-y-5">
            {pendingTrip && (
              <section className="rounded-xl bg-navy p-6 text-white shadow-panel">
                <p className="eyebrow text-rose-200">EN REVISIÓN</p>
                <h2 className="mt-3 text-xl font-extrabold">
                  {pendingTrip.origin} → {pendingTrip.destination}
                </h2>
                <p className="mt-2 text-sm text-blue-100/65">
                  La empresa aún no ha confirmado transportista.
                </p>
                <button
                  onClick={() => go("carrier-trip")}
                  className="mt-6 text-sm font-extrabold text-rose-200"
                >
                  Ver seguimiento →
                </button>
              </section>
            )}
            <section className="panel p-6">
              <h2 className="font-extrabold">Cómo funciona</h2>
              <ol className="mt-5 space-y-4 text-sm text-slate-500">
                <li>
                  <b className="mr-2 text-wine">1.</b>Revisa la carga y envía
                  disponibilidad.
                </li>
                <li>
                  <b className="mr-2 text-wine">2.</b>La empresa compara
                  transportistas.
                </li>
                <li>
                  <b className="mr-2 text-wine">3.</b>El viaje solo se asigna al
                  ser confirmado.
                </li>
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </CarrierShell>
  );
}

function PendingCarrierLoad({ go, trip, submitInterest, busy }) {
  const [price, setPrice] = useState("");
  if (!trip)
    return (
      <CarrierShell page="carrier-dashboard" go={go}>
        <div className="page">
          <div className="panel p-10 text-center">
            <h1 className="text-2xl font-extrabold">
              Selecciona un viaje disponible
            </h1>
            <Button className="mt-5" onClick={() => go("carrier-dashboard")}>
              Ver viajes
            </Button>
          </div>
        </div>
      </CarrierShell>
    );
  const send = () => {
    const amount = Number(price);
    if (!amount || amount <= 0) return;
    submitInterest(amount);
  };
  return (
    <CarrierShell
      page="carrier-dashboard"
      go={go}
      back={() => go("carrier-dashboard")}
    >
      <div className="page max-w-6xl">
        <div className="heading">
          <div>
            <span className="status">
              CM-{String(trip.shipment_id).padStart(4, "0")}
            </span>
            <h1>
              {trip.origin} → {trip.destination}
            </h1>
            <p>
              Tu cotización quedará pendiente hasta que la empresa la confirme.
            </p>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_.7fr]">
          <section className="panel p-7">
            <div className="route-map-pro">
              <div>
                <small>ORIGEN</small>
                <b>{trip.origin}</b>
                <span>{dateText(trip.travel_date)}</span>
              </div>
              <i>
                <em>Ruta publicada</em>
              </i>
              <div className="text-right">
                <small>DESTINO</small>
                <b>{trip.destination}</b>
                <span>Entrega por coordinar</span>
              </div>
            </div>
            <hr className="my-7 border-line" />
            <h2 className="section-title">
              <span>01</span>Información de la carga
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Info label="MERCANCÍA" value={trip.cargo_type} />
              <Info
                label="PESO TOTAL"
                value={`${Number(trip.weight_kg).toLocaleString("es-MX")} kg`}
              />
              <Info label="EQUIPO REQUERIDO" value={trip.vehicle_type} />
              <Info label="ESTADO" value="PUBLICADO" />
            </div>
          </section>
          <aside className="space-y-5">
            <section className="panel p-6">
              <small className="eyebrow">TU COTIZACIÓN</small>
              <h2 className="mt-3 text-xl font-extrabold">
                ¿Cuánto cobrarías?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Incluye casetas, operación y los conceptos que consideres en el
                precio final.
              </p>
              <label className="field-label mt-5">
                PRECIO EN MXN
                <input
                  className="field"
                  type="number"
                  min="1"
                  step="100"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Ej. 14500"
                />
              </label>
              <Button
                busy={submitInterest.busy}
                disabled={!Number(price)}
                className="mt-5 w-full"
                onClick={send}
              >
                Enviar cotización →
              </Button>
            </section>
            <section className="ready mt-0">
              Enviar una cotización no asigna el viaje. La empresa elegirá al
              ganador.
            </section>
          </aside>
        </div>
      </div>
    </CarrierShell>
  );
}

function PendingCarrierTrip({ go, trip }) {
  if (!trip)
    return (
      <CarrierShell page="carrier-trip" go={go}>
        <div className="page">
          <div className="panel p-10 text-center">
            <h1 className="text-2xl font-extrabold">
              No tienes postulaciones pendientes
            </h1>
            <Button className="mt-5" onClick={() => go("carrier-dashboard")}>
              Ver disponibles
            </Button>
          </div>
        </div>
      </CarrierShell>
    );
  return (
    <CarrierShell page="carrier-trip" go={go}>
      <div className="page max-w-6xl">
        <div className="heading">
          <div>
            <p className="eyebrow">
              SOLICITUD CM-{String(trip.shipment_id).padStart(4, "0")}
            </p>
            <h1>
              {trip.origin} → {trip.destination}
            </h1>
            <p>
              {trip.cargo_type} ·{" "}
              {Number(trip.weight_kg).toLocaleString("es-MX")} kg
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-extrabold text-amber-800">
            ● PENDIENTE DE CONFIRMACIÓN
          </span>
        </div>
        <div className="panel mb-5 p-6">
          <div className="trip-progress">
            <div className="done">
              <span>✓</span>
              <b>Disponibilidad enviada</b>
              <i />
            </div>
            <div>
              <span>2</span>
              <b>Confirmación de empresa</b>
              <i />
            </div>
            <div>
              <span>3</span>
              <b>Viaje asignado</b>
              <i />
            </div>
            <div>
              <span>4</span>
              <b>En operación</b>
            </div>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.35fr_.7fr]">
          <section className="panel p-7">
            <div className="route-map-pro">
              <div>
                <small>ORIGEN</small>
                <b>{trip.origin}</b>
                <span>{dateText(trip.travel_date)}</span>
              </div>
              <i>
                <em>Pendiente</em>
              </i>
              <div className="text-right">
                <small>DESTINO</small>
                <b>{trip.destination}</b>
                <span>Por coordinar</span>
              </div>
            </div>
            <div className="mt-7 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
              <Info label="MERCANCÍA" value={trip.cargo_type} />
              <Info
                label="PESO"
                value={`${Number(trip.weight_kg).toLocaleString("es-MX")} kg`}
              />
              <Info label="EQUIPO" value={trip.vehicle_type} />
              <Info label="AUTORIZACIÓN" value="Pendiente de la empresa" />
            </div>
          </section>
          <aside className="rounded-xl bg-navy p-6 text-white shadow-panel">
            <small className="eyebrow text-rose-200">SIGUIENTE PASO</small>
            <h2 className="mt-3 text-xl font-extrabold">
              Esperar confirmación
            </h2>
            <p className="mt-2 text-sm leading-6 text-blue-100/65">
              No se reservó ni asignó el viaje. Cuando la empresa elija
              transportista, el estado cambiará a confirmado.
            </p>
            <Button
              secondary
              className="mt-6 w-full"
              onClick={() => go("carrier-dashboard")}
            >
              Volver a disponibles
            </Button>
          </aside>
        </div>
      </div>
    </CarrierShell>
  );
}

function CompanyConfirmed({ go, shipment, carrier, generate, busy }) {
  const [status, setStatus] = useState("ASSIGNED");
  const [stageBusy, setStageBusy] = useState(false);
  const [error, setError] = useState("");
  async function confirmDelivery() {
    setStageBusy(true);
    setError("");
    try {
      const data = await actualizarEtapa(
        shipment.shipment_id,
        "entregado",
        "empresa",
      );
      setStatus(data.status || "ENTREGADO");
    } catch (err) {
      setError(err.message);
    } finally {
      setStageBusy(false);
    }
  }
  const c = shipment.cargo;
  return (
    <Shell page="trips" go={go}>
      <div className="page max-w-6xl">
        <section className="mb-5 flex flex-col gap-5 rounded-xl border border-rose-200 bg-rose-50 p-7 md:flex-row md:items-center">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-wine text-2xl font-extrabold text-white">
            ✓
          </span>
          <div>
            <p className="eyebrow">ASIGNACIÓN COMPLETADA</p>
            <h1 className="mt-1 text-3xl font-extrabold">Viaje confirmado</h1>
            <p className="mt-1 text-slate-600">
              {carrier.name} recibió la asignación.
            </p>
          </div>
          <span className="md:ml-auto rounded-full bg-white px-4 py-2 text-sm font-extrabold text-wine">
            ● {status}
          </span>
        </section>
        <div className="grid gap-5 lg:grid-cols-[1.35fr_.7fr]">
          <section className="panel p-7">
            <div className="route-map-pro">
              <div>
                <small>RECOLECCIÓN</small>
                <b>{c.origin}</b>
                <span>{dateText(c.date)}</span>
              </div>
              <i>
                <em>CM-{String(shipment.shipment_id).padStart(4, "0")}</em>
              </i>
              <div className="text-right">
                <small>ENTREGA</small>
                <b>{c.destination}</b>
                <span>Por coordinar</span>
              </div>
            </div>
            <div className="mt-7 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
              <Info label="TRANSPORTISTA" value={carrier.name} />
              <Info
                label="PRECIO"
                value={money(carrier.quote ?? carrier.price)}
              />
              <Info label="MERCANCÍA" value={c.cargo_type} />
              <Info label="EQUIPO" value={c.vehicle_type} />
            </div>
          </section>
          <aside className="space-y-5">
            <section className="panel p-6">
              <small className="eyebrow">DOCUMENTACIÓN</small>
              <h2 className="mt-3 text-xl font-extrabold">Orden de servicio</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Genera el PDF con los datos definitivos del viaje.
              </p>
              <Button busy={busy} className="mt-5 w-full" onClick={generate}>
                Generar orden PDF ↗
              </Button>
            </section>
            <section className="panel p-6">
              <small className="eyebrow">CIERRE DEL VIAJE</small>
              <h2 className="mt-3 text-xl font-extrabold">
                Confirmación de entrega
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Solo la empresa puede marcar la carga como entregada, después
                del tránsito.
              </p>
              {error && <div className="auth-error mt-4">{error}</div>}
              <Button
                secondary
                busy={stageBusy}
                disabled={status === "ENTREGADO"}
                className="mt-5 w-full"
                onClick={confirmDelivery}
              >
                {status === "ENTREGADO"
                  ? "Entrega confirmada ✓"
                  : "Confirmar entrega"}
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function CarrierTrips({ go, openTrip }) {
  const session = readSession();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    if (!session?.carrier_id) {
      setError(
        "Tu sesión todavía no incluye el perfil de transportista. Cierra sesión y vuelve a iniciar.",
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await misViajes(session.carrier_id);
      setTrips(data.trips || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [session?.carrier_id]);
  return (
    <CarrierShell page="carrier-trips" go={go}>
      <div className="page max-w-7xl">
        <div className="heading">
          <div>
            <p className="eyebrow">OPERACIÓN ASIGNADA</p>
            <h1>Mis viajes</h1>
            <p>Servicios confirmados para tu perfil de transportista.</p>
          </div>
          <button className="filter-active" onClick={load}>
            ↻ Actualizar
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="panel metric">
            <span className="metric-icon">▰</span>
            <div>
              <small>TOTAL ASIGNADOS</small>
              <b>{loading ? "—" : String(trips.length).padStart(2, "0")}</b>
              <p>Desde Supabase</p>
            </div>
          </article>
          <article className="panel metric">
            <span className="metric-icon">⌁</span>
            <div>
              <small>EN OPERACIÓN</small>
              <b>
                {String(
                  trips.filter((x) =>
                    ["EN_RECOLECCION", "EN_TRANSITO"].includes(x.status),
                  ).length,
                ).padStart(2, "0")}
              </b>
              <p>Con seguimiento activo</p>
            </div>
          </article>
          <article className="panel metric">
            <span className="metric-icon">✓</span>
            <div>
              <small>ENTREGADOS</small>
              <b>
                {String(
                  trips.filter((x) => x.status === "ENTREGADO").length,
                ).padStart(2, "0")}
              </b>
              <p>Viajes completados</p>
            </div>
          </article>
        </div>
        {error && (
          <div className="auth-error mt-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={load}>Reintentar</button>
          </div>
        )}
        <section className="mt-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Viajes de tu cuenta</h2>
            <span className="text-sm font-bold text-slate-400">
              {trips.length} resultados
            </span>
          </div>
          {loading ? (
            <div className="grid gap-4">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          ) : trips.length ? (
            <div className="space-y-4">
              {trips.map((trip) => (
                <article key={trip.shipment_id} className="load-card">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="status">
                        CM-{String(trip.shipment_id).padStart(4, "0")}
                      </span>
                      <span className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-extrabold text-wine">
                        ● {trip.status}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-extrabold">
                      {trip.origin} <span className="text-wine">→</span>{" "}
                      {trip.destination}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {trip.cargo_type} ·{" "}
                      {Number(trip.weight_kg).toLocaleString("es-MX")} kg ·{" "}
                      {trip.vehicle_type}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                      <span>▣ {dateText(trip.travel_date)}</span>
                      <span>Precio {money(trip.price)}</span>
                    </div>
                  </div>
                  <div className="load-score">
                    <b>{money(trip.price)}</b>
                    <span>precio acordado</span>
                  </div>
                  <div className="text-right">
                    <small className="eyebrow">ESTADO</small>
                    <b className="mt-1 block text-lg">
                      {trip.status.replaceAll("_", " ")}
                    </b>
                    <Button className="mt-4" onClick={() => openTrip(trip)}>
                      Abrir viaje →
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            !error && (
              <div className="panel p-10 text-center">
                <h2 className="text-2xl font-extrabold">
                  No tienes viajes asignados
                </h2>
                <p className="mt-2 text-slate-500">
                  Los servicios aparecerán aquí cuando una empresa acepte tu
                  oferta.
                </p>
                <Button
                  secondary
                  className="mt-5"
                  onClick={() => go("carrier-dashboard")}
                >
                  Ver cargas disponibles
                </Button>
              </div>
            )
          )}
        </section>
      </div>
    </CarrierShell>
  );
}

function CarrierBidStatus({ go, trip }) {
  const session = readSession();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(trip?.status || "ASSIGNED");
  const [busy, setBusy] = useState(false);
  async function refresh() {
    if (!trip) return;
    setLoading(true);
    setError("");
    try {
      if (session?.carrier_id) {
        const assigned = await misViajes(session.carrier_id);
        const liveTrip = (assigned.trips || []).find(
          (item) => String(item.shipment_id) === String(trip.shipment_id),
        );
        if (liveTrip) {
          trip.status = liveTrip.status;
          trip.price = liveTrip.price;
          setStatus(liveTrip.status || "ASSIGNED");
          setOffer({ status: "ACCEPTED", price: liveTrip.price });
        } else {
          const data = await listarOfertas(trip.shipment_id);
          setOffer(
            (data.offers || []).find(
              (item) =>
                String(item.carrier_id) === String(session.carrier_id) ||
                String(item.carrier_id) === String(session.id) ||
                item.carrier_name === session.name,
            ) || null,
          );
        }
      } else {
        setError("Cierra sesión y vuelve a iniciar para actualizar tu perfil de transportista.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, [trip?.shipment_id, session?.id]);
  useEffect(() => {
    if (!trip) return;
    const poll = setInterval(() => {
      refresh();
    }, 8000);
    return () => clearInterval(poll);
  }, [trip?.shipment_id, session?.id]);
  async function advance(stage) {
    setBusy(true);
    setError("");
    try {
      const data = await actualizarEtapa(
        trip.shipment_id,
        stage,
        "transportista",
      );
      setStatus(
        data.status ||
          (stage === "recoleccion" ? "EN_RECOLECCION" : "EN_TRANSITO"),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  if (!trip) return <PendingCarrierTrip go={go} trip={trip} />;
  const accepted =
    offer?.status === "ACCEPTED" ||
    ["ASSIGNED", "EN_RECOLECCION", "EN_TRANSITO", "ENTREGADO"].includes(
      trip.status,
    );
  return (
    <CarrierShell page="carrier-trip" go={go}>
      <div className="page max-w-6xl">
        <div className="heading">
          <div>
            <p className="eyebrow">
              SOLICITUD CM-{String(trip.shipment_id).padStart(4, "0")}
            </p>
            <h1>
              {trip.origin} → {trip.destination}
            </h1>
            <p>
              {trip.cargo_type} ·{" "}
              {Number(trip.weight_kg).toLocaleString("es-MX")} kg
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-extrabold ${accepted ? "bg-rose-100 text-wine" : "bg-amber-100 text-amber-800"}`}
          >
            ●{" "}
            {loading
              ? "CONSULTANDO"
              : accepted
                ? status
                : offer?.status || "PENDING"}
          </span>
        </div>
        {error && <div className="auth-error mb-5">{error}</div>}
        <div className="grid gap-5 lg:grid-cols-[1.35fr_.7fr]">
          <section className="panel p-7">
            <div className="route-map-pro">
              <div>
                <small>ORIGEN</small>
                <b>{trip.origin}</b>
                <span>{dateText(trip.travel_date)}</span>
              </div>
              <i>
                <em>{accepted ? "Viaje autorizado" : "Oferta en revisión"}</em>
              </i>
              <div className="text-right">
                <small>DESTINO</small>
                <b>{trip.destination}</b>
                <span>Por coordinar</span>
              </div>
            </div>
            <div className="mt-7 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
              <Info label="MERCANCÍA" value={trip.cargo_type} />
              <Info label="EQUIPO" value={trip.vehicle_type} />
              <Info
                label="COTIZACIÓN"
                value={offer?.price ? money(offer.price) : "Consultando"}
              />
              <Info label="DECISIÓN" value={offer?.status || "Pendiente"} />
            </div>
          </section>
          <aside className="space-y-5">
            <section className="panel p-6">
              <small className="eyebrow">SIGUIENTE ACCIÓN</small>
              <h2 className="mt-3 text-xl font-extrabold">
                {accepted ? "Actualiza la operación" : "Espera la decisión"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {accepted
                  ? "Puedes avanzar recolección y tránsito. La empresa confirmará la entrega."
                  : "La carga no se asignará hasta que la empresa elija una oferta."}
              </p>
              {accepted && (
                <div className="mt-5 grid gap-3">
                  <Button
                    busy={busy}
                    disabled={status !== "ASSIGNED"}
                    onClick={() => advance("recoleccion")}
                  >
                    Iniciar recolección
                  </Button>
                  <Button
                    secondary
                    busy={busy}
                    disabled={status !== "EN_RECOLECCION"}
                    onClick={() => advance("transito")}
                  >
                    Iniciar tránsito
                  </Button>
                </div>
              )}
              <Button secondary className="mt-3 w-full" onClick={refresh}>
                Actualizar estado
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </CarrierShell>
  );
}

export default function App() {
  const existingSession = readSession();
  const savedCompanyTrip = readCompanyTrip();
  const [page, setPage] = useState(
    existingSession?.role === "transportista"
      ? "carrier-dashboard"
      : existingSession
        ? "dashboard"
        : "login",
  );
  const [text, setText] = useState(
    "Necesito transportar 15 toneladas de material de construcción de Chihuahua a Ciudad Juárez el próximo lunes.",
  );
  const [shipment, setShipment] = useState(savedCompanyTrip?.shipment || null);
  const [carrier, setCarrier] = useState(savedCompanyTrip?.carrier || null);
  const [order, setOrder] = useState(savedCompanyTrip?.order || null);
  const [carrierQuote, setCarrierQuote] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [acceptedTrip, setAcceptedTrip] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cargamatch_pending_trip"));
    } catch {
      return null;
    }
  });
  const [takeOffer, setTakeOffer] = useState(null);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);
  const [authError, setAuthError] = useState("");
  const go = useMemo(() => (name) => setPage(name), []);
  const fail = (error) => {
    setNotice(error.message || "Ocurrió un error inesperado.");
    setTimeout(() => setNotice(null), 6000);
  };

  async function authenticate(mode, form) {
    setAuthError("");
    if (form.password.length < 6) {
      setAuthError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setBusy("auth");
    try {
      const data =
        mode === "register" ? await registrar(form) : await iniciarSesion(form);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      setPage(
        data.user.role === "transportista" ? "carrier-dashboard" : "dashboard",
      );
    } catch (error) {
      setAuthError(error.message || "No pudimos completar el acceso.");
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    if (text.trim().length < 10) {
      fail(new Error("Describe tu carga con al menos 10 caracteres."));
      return;
    }
    setBusy("create");
    try {
      const data = await crearSolicitud(text.trim());
      const normalized = {
        ...data,
        cargo: {
          ...data.cargo,
          date: data.cargo?.travel_date || data.cargo?.date,
        },
        matches: (data.matches || []).map((match) => ({
          ...match,
          quote: match.price ?? match.quote,
          reason: match.explanation || match.reason,
          capacity_kg: match.capacity_kg || data.cargo?.weight_kg,
          vehicle_type: match.vehicle_type || data.cargo?.vehicle_type,
        })),
      };
      setShipment(normalized);
      setPage("review");
    } catch (error) {
      fail(error);
    } finally {
      setBusy(null);
    }
  }
  async function choose(match, index) {
    setBusy(`carrier-${index}`);
    try {
      await confirmarViaje(shipment.shipment_id, match);
      setCarrier(match);
      localStorage.setItem(
        COMPANY_TRIP_KEY,
        JSON.stringify({ shipment, carrier: match, order: null }),
      );
      setPage("confirmed");
    } catch (error) {
      fail(error);
    } finally {
      setBusy(null);
    }
  }
  async function refreshMatches() {
    if (!shipment) return;
    setBusy("matches-refresh");
    try {
      const data = await listarOfertas(shipment.shipment_id);
      const offers = data.offers || [];
      setShipment((current) => {
        if (!current) return current;
        const updatedMatches = [...(current.matches || [])];
        offers.forEach((offer) => {
          const index = updatedMatches.findIndex(
            (match) =>
              String(match.carrier_id) === String(offer.carrier_id) ||
              match.name === offer.carrier_name,
          );
          const normalized = {
            carrier_id: offer.carrier_id,
            name: offer.carrier_name || offer.name || "Transportista",
            quote: offer.price,
            price: offer.price,
            score: index >= 0 ? updatedMatches[index].score : 0,
            vehicle_type:
              index >= 0
                ? updatedMatches[index].vehicle_type
                : current.cargo.vehicle_type,
            reason:
              index >= 0
                ? updatedMatches[index].reason
                : "Cotización recibida de un transportista compatible.",
            status: offer.status || "PENDING",
          };
          if (index >= 0) updatedMatches[index] = { ...updatedMatches[index], ...normalized };
          else updatedMatches.push(normalized);
        });
        updatedMatches.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
        return { ...current, matches: updatedMatches };
      });
      setNotice(
        offers.length
          ? `${offers.length} cotización${offers.length === 1 ? "" : "es"} actualizada${offers.length === 1 ? "" : "s"}.`
          : "No hay cotizaciones nuevas para esta solicitud.",
      );
      setTimeout(() => setNotice(null), 4500);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(null);
    }
  }
  async function generate() {
    setBusy("order");
    const tab = window.open("", "_blank");
    try {
      const data = await generarOrden(shipment.shipment_id);
      setOrder(data);
      localStorage.setItem(
        COMPANY_TRIP_KEY,
        JSON.stringify({ shipment, carrier, order: data }),
      );
      setPage("order");
      if (tab) tab.location = data.pdf_url;
    } catch (error) {
      tab?.close();
      fail(error);
    } finally {
      setBusy(null);
    }
  }
  function submitCarrierQuote(quote) {
    setCarrierQuote(quote);
    setNotice(
      "Cotización enviada correctamente. El productor ya puede revisarla.",
    );
    setTimeout(() => setNotice(null), 5000);
    setPage("carrier-dashboard");
  }
  function selectAvailableTrip(trip) {
    setSelectedTrip(trip);
    setPage("carrier-load");
  }
  function selectAssignedTrip(trip) {
    setAcceptedTrip(trip);
    localStorage.setItem("cargamatch_pending_trip", JSON.stringify(trip));
    setPage("carrier-trip");
  }
  async function acceptAvailableTrip(price) {
    if (!selectedTrip) {
      fail(new Error("Selecciona un viaje antes de enviar tu disponibilidad."));
      return;
    }
    const session = readSession();
    if (!session?.id) {
      fail(new Error("Inicia sesión nuevamente para enviar tu cotización."));
      return;
    }
    setBusy("offer");
    try {
      const data = await enviarOferta(selectedTrip.shipment_id, session, price);
      setCarrierQuote(data.offer || { price, status: "PENDING" });
      setAcceptedTrip(selectedTrip);
      localStorage.setItem(
        "cargamatch_pending_trip",
        JSON.stringify(selectedTrip),
      );
      setNotice(
        "Cotización enviada correctamente. La empresa ya puede revisarla.",
      );
      setPage("carrier-trip");
    } catch (error) {
      fail(error);
    } finally {
      setBusy(null);
    }
  }

  function viewOffers() {
    if (!shipment) {
      fail(new Error("Crea una solicitud antes de revisar ofertas."));
      return;
    }
    setPage("offers");
  }

  async function chooseAuctionOffer(offer) {
    const offerId = offer.offer_id ?? offer.id;
    if (!offerId) {
      fail(new Error("La oferta no incluye un identificador válido."));
      return;
    }
    setBusy(`offer-${offerId}`);
    try {
      await elegirOferta(shipment.shipment_id, offerId);
      const chosen = {
        carrier_id: offer.carrier_id,
        name: offer.carrier_name || offer.name || "Transportista seleccionado",
        quote: offer.price,
        price: offer.price,
      };
      setCarrier(chosen);
      localStorage.setItem(
        COMPANY_TRIP_KEY,
        JSON.stringify({ shipment, carrier: chosen, order: null }),
      );
      setPage("confirmed");
    } catch (error) {
      fail(error);
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);
  const props = { go };
  return (
    <>
      <div key={page} className="screen-enter">
        {page === "login" && (
          <Login
            authenticate={authenticate}
            busy={busy === "auth"}
            error={authError}
          />
        )}
        {page === "dashboard" && <Dashboard {...props} />}
        {page === "requests" && (
          <Requests
            {...props}
            shipment={shipment}
            carrier={carrier}
            order={order}
            viewOffers={viewOffers}
          />
        )}
        {page === "trips" && (
          <CompanyTrips
            {...props}
            shipment={shipment}
            carrier={carrier}
            order={order}
          />
        )}
        {page === "offers" && shipment && (
          <Offers
            {...props}
            shipment={shipment}
            chooseOffer={chooseAuctionOffer}
            busy={
              busy?.startsWith("offer-") ? Number(busy.split("-")[1]) : null
            }
          />
        )}
        {page === "create" && (
          <Create
            {...props}
            text={text}
            setText={setText}
            submit={submit}
            busy={busy === "create"}
          />
        )}
        {page === "review" && shipment && (
          <Review {...props} shipment={shipment} />
        )}
        {page === "analysis" && shipment && (
          <Analysis {...props} shipment={shipment} />
        )}
        {page === "matches" && shipment && (
          <Matches
            {...props}
            shipment={shipment}
            choose={choose}
            busyIndex={
              busy?.startsWith("carrier-") ? Number(busy.split("-")[1]) : -1
            }
            refresh={refreshMatches}
            refreshing={busy === "matches-refresh"}
          />
        )}
        {page === "confirmed" && shipment && carrier && (
          <CompanyConfirmed
            {...props}
            shipment={shipment}
            carrier={carrier}
            generate={generate}
            busy={busy === "order"}
          />
        )}
        {page === "order" && order && (
          <Order
            {...props}
            shipment={shipment}
            carrier={carrier}
            order={order}
          />
        )}
        {page === "carrier-dashboard" && (
          <PendingCarrierDashboard
            {...props}
            selectTrip={selectAvailableTrip}
            pendingTrip={acceptedTrip}
          />
        )}
        {page === "carrier-trips" && (
          <CarrierTrips {...props} openTrip={selectAssignedTrip} />
        )}
        {page === "carrier-load" && (
          <PendingCarrierLoad
            {...props}
            trip={selectedTrip}
            submitInterest={acceptAvailableTrip}
            busy={busy === "offer"}
          />
        )}
        {page === "carrier-trip" && (
          <CarrierBidStatus {...props} trip={acceptedTrip} />
        )}
      </div>
      {notice && (
        <div className="notice" role="alert">
          <b>
            {notice.startsWith("Cotización")
              ? "Operación exitosa"
              : "No se pudo completar"}
          </b>
          <span>{notice}</span>
          <button onClick={() => setNotice(null)}>×</button>
        </div>
      )}
    </>
  );
}
