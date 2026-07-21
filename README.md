# Frontend - Panel Administrativo

Documentacion de contexto para el desarrollo del Frontend administrativo del sistema de inventariado. Este documento describe el Backend con el que este Frontend se integra: su modelo de datos, su esquema de autenticacion y el detalle de cada servicio disponible para consumo desde el panel de administracion.

Este documento no contiene credenciales, secretos ni valores de variables de entorno reales.

## Tabla de contenidos

1. Alcance de este Frontend
2. Relacion con el Backend
3. Modelo de datos del sistema
4. Autenticacion y sesion
5. Convencion de respuesta de la API
6. Catalogo de servicios disponibles
7. Flujos de negocio relevantes para el panel
8. Estructura de carpetas sugerida
9. Estado del Backend y limitaciones conocidas
10. Sistema de diseno: paleta de colores y tipografia

## 1. Alcance de este Frontend

Este proyecto es el panel de uso interno del negocio: quien lo usa es el propio administrador (o los administradores, si se da de alta a mas de uno) para gestionar el inventario completo, los clientes, los proveedores, el registro de ventas y la configuracion general del sistema. Se despliega en un dominio y URL separados del sitio publico que ve el cliente final (ver `Frontend/Client`), consumiendo la misma API de Backend pero ejercitando endpoints que requieren sesion autenticada.

Toda la superficie de este Frontend queda detras de un login: no hay ninguna pantalla de este panel que deba ser accesible sin sesion activa, salvo la pantalla de login en si misma.

## 2. Relacion con el Backend

El Backend es un servicio REST independiente (Express + TypeScript + Prisma sobre MySQL), documentado en detalle en `Backend/README.md`. Este Frontend no comparte codigo ni base de datos con el Backend: se comunica exclusivamente por HTTP contra la URL base configurable del servicio (`/api` como prefijo de todas las rutas).

Puntos clave del contrato entre ambos:

- Todas las respuestas siguen un envelope JSON unico (ver seccion 5).
- Todos los recursos se identifican por un `publicId` (UUID), nunca por un identificador numerico interno. Ninguna pantalla de este panel debe construir URLs ni referencias usando otro identificador que no sea `publicId`.
- Las rutas de gestion (Productos, Usuarios, Configuracion, Dimensiones, Clientes, Proveedores, Ventas) requieren un token de sesion valido en el encabezado `Authorization`.

## 3. Modelo de datos del sistema

Resumen de las entidades con las que este panel trabaja. El detalle completo de campos vive en `Backend/prisma/schema.prisma`; aqui se describe el proposito de cada una desde la perspectiva de quien construye las pantallas.

**Producto**: articulo en venta, de una de tres categorias (bolsa, accesorio, joyeria). Tiene nombre, descripcion, precio, descuento, una fotografia obligatoria, una referencia a una Dimension del catalogo, y un estado (existencia, apartado, agotado, eliminado). El estado eliminado es una baja logica: el registro no desaparece de la base de datos hasta que el proceso de limpieza programado lo purgue automaticamente. El panel debe permitir gestionar el ciclo de vida completo del producto, incluyendo la carga de su fotografia.

**Dimension**: catalogo reutilizable de tamanos (alto, ancho, profundidad, uso comun) que se asigna a los productos al darlos de alta. Es un catalogo administrable de forma independiente: el panel debe permitir mantenerlo sin depender de que existan productos usandolo todavia.

**Usuario**: cuenta con acceso a este mismo panel. Se identifica por un numero de telefono de 10 digitos (no por correo electronico) y una contrasena. Tiene un estado activo/inactivo: una cuenta inactiva no puede iniciar sesion, y si ya tenia una sesion abierta, pierde el acceso de inmediato (el Backend revoca la sesion en la siguiente peticion, no espera a que expire el token). El panel debe exponer la gestion completa de estas cuentas.

**Configuracion**: registro unico (no una lista) con los parametros globales del negocio: nombre del negocio, numero de WhatsApp del administrador, carpeta de referencia de fotografias, dias de retencion de productos dados de baja antes de su limpieza definitiva, moneda, logotipo y horario de atencion. El panel debe presentar esto como una pantalla de edicion de un unico formulario, no como una lista.

**Cliente**: datos generales de un cliente (nombre, telefono, correo, direccion), usado como referencia para el registro de ventas.

**Proveedor**: datos generales de un proveedor (nombre de tienda, telefono, enlace web de contacto). No tiene relacion con otras entidades del sistema.

**Venta**: movimiento de cuenta corriente de un cliente, con el formato fecha, concepto, debe, haber y saldo. El saldo **siempre lo calcula el Backend**, nunca se envia desde el Frontend: se recalcula en base al ultimo movimiento registrado para ese cliente. Por esta razon, la edicion de un movimiento ya creado solo permite corregir el concepto, no los montos; y el borrado de un movimiento solo esta permitido si es el ultimo de la cuenta del cliente (para no romper la cadena de saldos). El panel debe reflejar estas restricciones en la interfaz (por ejemplo, deshabilitando el borrado de movimientos que no sean el ultimo).

**JobLog**: bitacora de ejecucion de procesos automaticos del sistema (por ahora, el proceso de limpieza de productos dados de baja). Se expone como parte de la pantalla de Configuracion General, no como un modulo aparte.

## 4. Autenticacion y sesion

El esquema es JWT sin estado (sin sesiones de servidor). Flujo esperado en el Frontend:

1. Pantalla de login: formulario con telefono (10 digitos) y contrasena, contra `POST /api/auth/login`.
2. La respuesta exitosa entrega un token junto con los datos del usuario autenticado. El token debe guardarse en el cliente (segun la estrategia de almacenamiento que se defina para `src/app/auth/`) y adjuntarse en cada peticion subsecuente como `Authorization: Bearer <token>`, responsabilidad natural de un interceptor HTTP (`src/app/auth/interceptors/`).
3. `GET /api/auth/me` permite validar la sesion vigente y obtener los datos del usuario autenticado (util al recargar la aplicacion).
4. Cualquier respuesta 401 debe tratarse como sesion invalida: el Frontend debe limpiar el token guardado y redirigir a login. Esto incluye el caso de una cuenta desactivada mientras el token todavia no ha expirado (ver seccion 3, Usuario).
5. El login tiene un limite de 10 intentos cada 15 minutos por origen; una respuesta 429 en el login debe mostrarse como "demasiados intentos, espera unos minutos", no como un error de credenciales.

No existe endpoint de logout en el servidor (el esquema es sin estado): cerrar sesion es responsabilidad exclusiva del Frontend, descartando el token guardado localmente.

## 5. Convencion de respuesta de la API

Toda respuesta exitosa:

```
{
  "success": true,
  "data": <recurso o coleccion>,
  "message": "<mensaje opcional, para mostrar en un toast de confirmacion>"
}
```

Toda respuesta de error:

```
{
  "success": false,
  "message": "<descripcion legible del error>",
  "errors": [ ... detalle de validacion por campo, si aplica ... ]
}
```

El campo `errors`, cuando esta presente, contiene el detalle de validacion de Zod por campo (util para marcar errores especificos en un formulario). Los codigos HTTP relevantes que el panel debe manejar explicitamente: `400` (datos invalidos), `401` (sesion invalida o ausente), `404` (recurso no encontrado), `409` (conflicto de integridad, por ejemplo intentar borrar una Dimension en uso por productos, o un Cliente con ventas asociadas), `429` (limite de peticiones excedido).

## 6. Catalogo de servicios disponibles

Todas las rutas listadas abajo requieren `Authorization: Bearer <token>`, salvo el login. Prefijo comun: `/api`.

### Autenticacion (`/auth`)
- `POST /auth/login` — inicio de sesion (publico).
- `GET /auth/me` — datos del usuario autenticado.

### Productos (`/productos`)
- `GET /productos` — listado completo, sin filtrar por estado (el panel debe mostrar todos los estados para poder gestionarlos).
- `GET /productos/:publicId` — detalle de un producto.
- `POST /productos/foto` — sube una fotografia (multipart/form-data, campo `foto`; formatos jpg/png/webp, maximo 5MB) y devuelve `{ url, publicId }`. Este paso se ejecuta antes de crear o actualizar el producto: el Frontend sube la imagen primero, y usa la URL resultante en el paso siguiente.
- `POST /productos` — alta de producto. Requiere `dimensionPublicId` (no el id interno de la dimension) y `fotoUrl` (obligatoria).
- `PUT /productos/:publicId` — actualizacion. Si se envia una nueva `fotoPublicId`, el Backend borra automaticamente la fotografia anterior del repositorio de imagenes.
- `PATCH /productos/:publicId/status` — cambio de estado (existencia, apartado, agotado, eliminado). Es el mecanismo de baja logica: no existe un endpoint de borrado fisico de producto.

### Dimensiones (`/dimensiones`)
- `GET /dimensiones`, `GET /dimensiones/:publicId`, `POST /dimensiones`, `PUT /dimensiones/:publicId`, `DELETE /dimensiones/:publicId`.
- El borrado devuelve `409` si la dimension esta en uso por algun producto; el panel debe mostrar ese mensaje tal cual lo entrega el Backend.

### Clientes (`/clientes`)
- `GET /clientes`, `GET /clientes/:publicId`, `POST /clientes`, `PUT /clientes/:publicId`, `DELETE /clientes/:publicId`.
- El borrado devuelve `409` si el cliente tiene ventas asociadas.

### Proveedores (`/proveedores`)
- `GET /proveedores`, `GET /proveedores/:publicId`, `POST /proveedores`, `PUT /proveedores/:publicId`, `DELETE /proveedores/:publicId`.
- Sin restricciones de integridad: el borrado siempre es posible.

### Ventas (`/ventas`)
- `GET /ventas?clientePublicId=<publicId>` — estado de cuenta de un cliente (requiere el query param; no existe un listado global de todos los movimientos de todos los clientes en una sola llamada).
- `GET /ventas/:publicId` — un movimiento individual.
- `POST /ventas` — registrar un movimiento nuevo (`clientePublicId`, `concepto`, `debe`, `haber`, `fecha` opcional). El `saldo` no se envia: lo calcula el Backend.
- `PUT /ventas/:publicId` — solo permite actualizar `concepto`.
- `DELETE /ventas/:publicId` — solo permitido sobre el ultimo movimiento del cliente; devuelve `409` en cualquier otro caso.
- `GET /ventas/estado-cuenta/:clientePublicId/pdf` — descarga el estado de cuenta del cliente en PDF (respuesta binaria, `Content-Type: application/pdf`, no sigue el envelope JSON estandar). Limitado a 10 descargas cada 15 minutos por origen debido al costo de generacion.

### Usuarios (`/usuarios`)
- `GET /usuarios`, `GET /usuarios/:publicId`, `POST /usuarios`, `PUT /usuarios/:publicId`, `PATCH /usuarios/:publicId/status`.
- El campo `password` nunca se devuelve en ninguna respuesta. La actualizacion (`PUT`) acepta un nuevo `password` de forma opcional para cambiar la contrasena de una cuenta.
- `PATCH .../status` con `{ activo: false }` es el mecanismo para revocar acceso a un administrador; el efecto es inmediato (ver seccion 3).

### Configuracion General (`/configuracion`)
- `GET /configuracion` — obtiene el registro unico de configuracion (se crea automaticamente con valores por defecto si todavia no existe).
- `PUT /configuracion` — actualiza cualquier subconjunto de sus campos.
- `GET /configuracion/logs` — historial de ejecucion de procesos automaticos (hasta 50 registros mas recientes), para mostrar en la misma pantalla de configuracion.

## 7. Flujos de negocio relevantes para el panel

**Alta de producto con fotografia**: el formulario de alta debe subir la imagen (`POST /productos/foto`) apenas el administrador la selecciona, mostrar una vista previa con la URL devuelta, y solo entonces permitir enviar el resto del formulario (`POST /productos`) usando esa URL. La foto es un campo obligatorio a nivel de validacion del Backend: un envio sin `fotoUrl` sera rechazado con `400`.

**Reemplazo de fotografia**: al editar un producto y subir una nueva imagen, el Frontend repite el paso de subida y envia la nueva `fotoUrl`/`fotoPublicId` en la actualizacion. La limpieza de la imagen anterior en el repositorio es responsabilidad del Backend, el Frontend no necesita hacer nada adicional.

**Registro de una venta**: antes de registrar un movimiento, conviene mostrar el saldo actual del cliente (ultimo movimiento de su listado) para que el administrador tenga contexto, aunque el calculo real del nuevo saldo lo hace el Backend al confirmar.

**Exportacion de estado de cuenta**: la descarga de PDF es una peticion de archivo binario, no una llamada JSON habitual; debe manejarse con la API de descarga de archivos del cliente HTTP que se use en Angular (`responseType: 'blob'`), no con el manejo de respuesta JSON usado en el resto del panel.

**Gestion de acceso administrativo**: dado que desactivar una cuenta revoca el acceso de inmediato, la pantalla de usuarios es una herramienta de control de acceso real, no solo un listado informativo — conviene que la accion de desactivar tenga una confirmacion explicita (modal de confirmacion), dado su efecto inmediato.

## 8. Estructura de carpetas sugerida

Sigue la convencion ya definida para el proyecto (ver `CLAUDE.md` en la raiz):

```
src/app/auth/                  Login, guardas de ruta e interceptor de token
src/app/auth/environment/
src/app/auth/guard/             Protege todas las rutas del panel salvo login
src/app/auth/interceptors/       Adjunta el token y maneja 401 globalmente
src/app/components/principales/  sidebar, noti-toast, confirmation-modal, etc.
src/app/components/modales/
src/app/components/secundarios/
src/app/components/compuestos/
src/app/components/svgs/
src/app/models/                 Tipos que reflejan los recursos descritos en la seccion 3
src/app/services/                Un servicio HTTP por recurso (productos, usuarios, ventas, etc.)
src/app/utils/
src/app/views/admin/             Pantallas: dashboard, productos, dimensiones, clientes, proveedores, ventas, usuarios, configuracion
src/app/styles/
```

## 9. Estado del Backend y limitaciones conocidas

- No existe todavia un endpoint de "logout" ni de refresco de token: la sesion vive mientras el token no expire (`JWT_EXPIRES_IN`, configurado en el Backend) o hasta que el usuario sea desactivado.
- No hay paginacion en ningun listado (`GET /productos`, `GET /clientes`, etc. devuelven el total de registros). Si el catalogo crece de forma significativa, el panel debera anticipar la necesidad de paginacion del lado del Backend antes de que se convierta en un problema de rendimiento.
- El PDF del estado de cuenta es la unica exportacion disponible por ahora (no hay exportacion a imagen todavia).
- No existen pruebas automatizadas en el Backend: cualquier cambio de contrato en la API debe verificarse manualmente contra este documento y el `README.md` del Backend.

## 10. Sistema de diseno: paleta de colores y tipografia

Paleta de marca oficial ("Wordly"), a implementar como variables CSS globales en `src/app/styles/` y reutilizar en todos los componentes primarios, secundarios y compuestos. No se deben introducir colores fuera de esta paleta salvo los estados semanticos estandar (error, advertencia) que se definan aparte si el diseno lo requiere.

| Token | Nombre | Hex | Uso sugerido en el panel |
|---|---|---|---|
| `--color-sand` | Sand | `#E1D9C9` | Fondo base de la aplicacion, superficies claras |
| `--color-stone` | Stone | `#AE9372` | Bordes, separadores, estados deshabilitados |
| `--color-coffee` | Coffee | `#B27D57` | Acento secundario, botones secundarios, hover |
| `--color-ochre` | Ochre | `#7F4B30` | Acento primario, botones de accion principal (ej. "Guardar", "Crear producto") |
| `--color-gum` | Gum | `#7D8769` | Estados de exito suave, iconografia de confirmacion |
| `--color-moss` | Moss | `#424C21` | Texto secundario sobre fondos claros |
| `--color-forest` | Forest | `#173125` | Texto principal, encabezados, sidebar (fondo oscuro) |
| `--color-basalt` | Basalt | `#212E40` | Superficies oscuras alternativas, texto principal alternativo |

Tipografia: **Poppins** (Google Fonts), sans-serif geometrica. Uso recomendado siguiendo el estilo de referencia (negrita, mayusculas, letter-spacing amplio en titulos y etiquetas):

- Encabezados, nombres de secciones del sidebar, labels de botones: `Poppins`, peso 600-700 (SemiBold/Bold), `text-transform: uppercase`, `letter-spacing: 0.05em` aproximadamente.
- Cuerpo de texto, contenido de tablas, texto de formularios: `Poppins`, peso 400-500 (Regular/Medium), sin mayusculas forzadas, para mantener legibilidad en listados largos (productos, ventas).
- Cargar solo los pesos realmente usados (400, 500, 600, 700) para no penalizar el tiempo de carga, especialmente relevante dado el requisito de responsividad y uso en dispositivos moviles.

Este mismo sistema de diseno (paleta y tipografia) es compartido con el Frontend de cliente (`Frontend/Client/README.md`), para mantener consistencia de marca entre ambos sitios.
