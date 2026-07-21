export function buildWhatsappLink(numero: string, mensaje: string): string {
  const numeroLimpio = numero.replace(/\D/g, '');
  return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
}

export function mensajeContactoProveedor(nombreTienda: string): string {
  return `Hola, me gustaria consultar con "${nombreTienda}" sobre sus productos.`;
}
