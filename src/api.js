const BASE_URL = 'https://mikedevelop.app.n8n.cloud/webhook/cargamatch'

async function post(path, body) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  try {
    const response = await fetch(`${BASE_URL}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) throw new Error(data?.message || `El servicio respondió con el código ${response.status}.`)
    if (!data?.ok) throw new Error(data?.message || 'El servicio no pudo completar la solicitud.')
    return data
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('La solicitud tardó demasiado. Intenta de nuevo.')
    if (error instanceof TypeError) throw new Error('No pudimos conectar con CARGAI. Revisa tu conexión e intenta de nuevo.')
    throw error
  } finally { clearTimeout(timeout) }
}

export const crearSolicitud = text => post('solicitud', { text })
export const registrar = ({ name, email, password, role = 'empresa' }) => post('registro', { name, email, password, role })
export const iniciarSesion = ({ email, password }) => post('login', { email, password })
export const confirmarViaje = (shipment_id, carrier) => post('confirmar', {
  shipment_id,
  carrier_id: carrier.carrier_id,
  carrier_name: carrier.name,
  price: carrier.price ?? carrier.quote
})
export const generarOrden = shipment_id => post('orden', { shipment_id })
export const viajesDisponibles = () => post('viajes', {})
export const misViajes = carrier_id => post('mis-viajes', { carrier_id })
export const enviarOferta = (shipment_id, carrier, price) => post('ofertar', {
  shipment_id,
  carrier_id: carrier.id,
  carrier_name: carrier.name,
  price: Number(price)
})
export const listarOfertas = shipment_id => post('ofertas', { shipment_id })
export const elegirOferta = (shipment_id, offer_id) => post('elegir', { shipment_id, offer_id })
export const actualizarEtapa = (shipment_id, stage, role) => post('etapa', { shipment_id, stage, role })
