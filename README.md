# 🛒 DStore Frontend

Frontend de **DStore**, una aplicación web para la gestión de ventas e inventario orientada a pequeños comercios como papelerías, cacharrerías y tiendas locales.

La aplicación está desarrollada con **Angular 20** y consume una API REST construida con **Java 21 y Spring Boot**.

Este repositorio contiene exclusivamente la interfaz web del sistema.

---

## 🔗 Repositorios

### Frontend

Este repositorio contiene la aplicación Angular de DStore.

### Backend

[DStore Backend - Spring Boot](https://github.com/blackbird17922se/rdstore)

---

## 🎯 Objetivo del proyecto

DStore busca cubrir un flujo comercial completo y coherente:

```text
Productos
   ↓
Entradas de inventario
   ↓
Existencias
   ↓
Ventas
   ↓
Descuento automático de inventario
   ↓
Movimientos y trazabilidad
```

El frontend permite operar los principales módulos del sistema, administrar información comercial y consultar el estado del inventario mediante una interfaz protegida por autenticación JWT.

---

## 🛠️ Stack tecnológico

- Angular 20
- TypeScript
- RxJS
- Angular Router
- HttpClient
- Standalone Components
- Functional Interceptors
- Route Guards
- HTML
- SCSS

---

## 🔐 Autenticación y seguridad

El frontend está integrado con el sistema de autenticación JWT del backend.

```text
Usuario
   ↓
Login Angular
   ↓
POST /api/v2/auth/login
   ↓
Spring Security valida credenciales
   ↓
JWT
   ↓
Angular mantiene la sesión
   ↓
Interceptor HTTP
   ↓
Authorization: Bearer TOKEN
```

Actualmente se encuentra implementado:

- Login de usuarios.
- Persistencia del JWT.
- Manejo del usuario autenticado.
- Manejo del rol del usuario.
- Estado reactivo de sesión mediante RxJS.
- Interceptor HTTP para agregar automáticamente el JWT.
- Protección de rutas mediante guard.
- Cierre de sesión.
- Manejo de respuestas `401`.
- Validación inicial de expiración del token.
- Perfil del usuario autenticado.
- Cambio de contraseña desde **Mi perfil**.

---

## 👤 Gestión de usuarios

El módulo administrativo permite:

- Listar usuarios.
- Crear usuarios.
- Editar datos generales.
- Asignar roles.
- Activar y desactivar usuarios.
- Mantener la contraseña fuera del flujo normal de edición administrativa.

Cada usuario dispone además de una sección **Mi perfil**, desde la cual puede:

- Consultar sus datos.
- Actualizar nombre y apellido.
- Consultar su nombre de usuario y rol.
- Cambiar su contraseña validando la contraseña actual.

---

## 🗂️ Catálogos

DStore dispone de interfaces para administrar:

- Categorías.
- Marcas.
- Presentaciones.
- Tarifas de IVA.

Los registros manejan estados activo/inactivo sin eliminación física como flujo principal.

---

## 📦 Productos

El módulo de productos permite:

- Crear y editar productos.
- Consultar productos.
- Activar y desactivar productos.
- Manejar código de barras.
- Asociar marca.
- Asociar categoría.
- Asociar presentación.
- Asociar tarifa de IVA.
- Indicar si el producto controla vencimiento.
- Visualizar el stock calculado por el backend.

El stock no se administra directamente desde el producto. La fuente de verdad del inventario es el módulo de **Existencias**.

---

## 👥 Clientes

El módulo de clientes permite:

- Crear clientes.
- Editar clientes.
- Consultar clientes.
- Activar y desactivar clientes.
- Manejar diferentes tipos de documento.
- Registrar información de contacto y observaciones.

El cliente es opcional al momento de registrar una venta.

---

## 📥 Inventario

El frontend incluye un módulo de inventario compuesto por varias operaciones.

### Entradas de inventario

Permite registrar entradas con múltiples productos y consultar posteriormente el detalle histórico de cada entrada.

Cada detalle puede manejar:

- Producto.
- Cantidad.
- Número de lote.
- Fecha de vencimiento.

### Existencias

Permite consultar las existencias generadas a partir de las entradas de inventario.

Incluye:

- Filtro por producto.
- Filtro de solo existencias disponibles.
- Cantidad actual.
- Lote.
- Fecha de vencimiento.
- Fecha de ingreso.

### Próximos a vencer

Permite consultar productos próximos a vencer indicando un rango de días.

### Movimientos de inventario

Permite consultar la trazabilidad histórica de un producto.

Los movimientos pueden representar operaciones como:

- Entradas.
- Ventas.
- Ajustes de entrada.
- Ajustes de salida.
- Anulación de ventas.

### Ajustes de inventario

Permite registrar ajustes sobre una existencia específica.

Los ajustes pueden:

- Incrementar una existencia.
- Disminuir una existencia.
- Registrar motivo y observación.
- Generar automáticamente un movimiento de inventario.

---

## 🛒 Ventas

El módulo de ventas cubre el flujo principal de una operación comercial.

### Nueva venta

La pantalla de nueva venta permite:

- Seleccionar un cliente opcional.
- Buscar productos mediante código de barras.
- Agregar productos al carrito.
- Modificar cantidades.
- Eliminar productos del carrito.
- Visualizar subtotales.
- Calcular el total de la venta.
- Registrar observaciones.
- Calcular visualmente dinero recibido y cambio.

El precio mostrado al cliente corresponde al **precio final con IVA incluido**.

El frontend envía al backend únicamente la información necesaria para procesar la operación:

```json
{
  "idCliente": null,
  "observacion": null,
  "detalles": [
    {
      "idProducto": 11,
      "cantidad": 2
    }
  ]
}
```

El backend es responsable de validar precios, IVA e inventario.

### Historial de ventas

Permite consultar:

- Fecha.
- Cliente.
- Total.
- Vendedor.
- Estado.

### Detalle de venta

Permite visualizar:

- Información general de la venta.
- Productos vendidos.
- Cantidades.
- Precio unitario.
- Subtotal.
- Estado.
- Información de anulación cuando aplica.

### Anulación

Una venta confirmada puede ser anulada indicando un motivo.

La anulación se integra con el backend para:

- Cambiar el estado de la venta.
- Registrar fecha y motivo de anulación.
- Restaurar las existencias afectadas.
- Conservar el movimiento original.
- Generar movimientos inversos de inventario para mantener trazabilidad.

---

## 📊 Estrategia de inventario aplicada en ventas

La selección de existencias se realiza en el backend, por lo que Angular no necesita conocer qué lote específico debe consumir.

```text
Producto con vencimiento
        ↓
       FEFO
        ↓
vence primero → sale primero
```

```text
Producto sin vencimiento
        ↓
       FIFO
        ↓
entra primero → sale primero
```

El frontend solamente indica:

```text
Producto + Cantidad
```

y el backend se encarga de resolver la salida de inventario.

---

## 🎨 UI / UX

La interfaz fue reorganizada para ofrecer una experiencia más consistente y presentable.

Actualmente incluye:

- Sidebar lateral.
- Navegación agrupada por módulos.
- Indicador visual de la ruta activa.
- Página de inicio con accesos rápidos.
- Diseño específico para Nueva Venta.
- Pantalla de login renovada.
- Página Mi perfil.
- Footer.
- Tablas con estilo unificado.
- Estados visuales activo/inactivo.
- Botones reutilizables.
- Formularios y filtros consistentes.
- Mensajes para listados vacíos.
- Diseño responsive básico.

Los estilos comunes se centralizan para evitar duplicación entre módulos.

---

## 🧱 Organización del proyecto

La aplicación se encuentra organizada principalmente en:

```text
src/app
│
├── components
├── guards
├── interceptors
├── models
│   ├── cliente
│   ├── producto
│   ├── usuario
│   └── venta
├── pages
├── services
├── app.config.ts
└── app.routes.ts
```

### Responsabilidades

**Pages**  
Contienen las pantallas principales de la aplicación.

**Components**  
Contienen elementos reutilizables de interfaz, como la navegación.

**Services**  
Centralizan la comunicación con la API REST.

**Guards**  
Controlan el acceso a las rutas protegidas.

**Interceptors**  
Interceptan peticiones HTTP para agregar el JWT y manejar respuestas relacionadas con autenticación.

**Models**  
Contienen las interfaces TypeScript utilizadas para representar Request, Response y modelos auxiliares del frontend.

---

## 🌐 Integración con el backend

La URL base de la API se centraliza mediante los archivos de configuración de Angular.

Ejemplo:

```typescript
export const environment = {
  apiUrl: 'http://localhost:8080/api/v2'
};
```

Los servicios construyen sus endpoints a partir de esta URL:

```typescript
private apiUrl = `${environment.apiUrl}/ventas`;
```

Esto evita mantener URLs del backend directamente en los componentes.

---

## 🔑 Interceptor JWT

Las peticiones protegidas utilizan un interceptor funcional.

Conceptualmente:

```typescript
const token = localStorage.getItem('token');

if (token) {
  const requestConToken = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(requestConToken);
}

return next(req);
```

De esta forma los componentes y servicios no agregan manualmente el token en cada petición.

---

## ▶️ Ejecución

### Requisitos

- Node.js
- npm
- Angular CLI
- Backend de DStore en ejecución

Clonar el repositorio:

```bash
git clone https://github.com/blackbird17922se/dstore-front.git
cd dstore-front
```

Instalar dependencias:

```bash
npm install
```

Ejecutar:

```bash
npm start
```

o:

```bash
ng serve
```

La aplicación estará disponible normalmente en:

```text
http://localhost:4200
```

La API REST debe estar disponible según la URL configurada en `environment`.

---

## ✅ Estado actual

### Autenticación

- ✅ Login.
- ✅ JWT.
- ✅ Interceptor HTTP.
- ✅ Route Guard.
- ✅ Logout.
- ✅ Manejo de expiración y respuestas 401.
- ✅ Mi perfil.
- ✅ Cambio de contraseña.

### Administración

- ✅ Usuarios.
- ✅ Roles.
- ✅ Activación y desactivación de usuarios.

### Catálogos

- ✅ Categorías.
- ✅ Marcas.
- ✅ Presentaciones.
- ✅ Tarifas de IVA.

### Operación

- ✅ Productos.
- ✅ Clientes.
- ✅ Entradas de inventario.
- ✅ Detalle de entradas.
- ✅ Existencias.
- ✅ Próximos a vencer.
- ✅ Movimientos de inventario.
- ✅ Ajustes.
- ✅ Nueva venta.
- ✅ Historial de ventas.
- ✅ Detalle de venta.
- ✅ Anulación de venta.

### Interfaz

- ✅ Sidebar.
- ✅ Página de inicio.
- ✅ Login renovado.
- ✅ Estilos reutilizables.
- ✅ Tablas y formularios unificados.
- ✅ Responsive básico.

---

## 🗺️ Alcance de esta versión

Esta versión está enfocada en completar y presentar correctamente el flujo principal de ventas e inventario.

No forman parte del alcance actual:

- Caja con apertura y cierre.
- Balance de caja.
- Medios de pago configurables.
- Proveedores.
- Compras a proveedores.
- Crédito o ventas fiadas.
- Dashboard de métricas y reportes avanzados.

Estas funcionalidades pueden incorporarse en futuras versiones sin afectar el flujo principal ya implementado.

---

## 🚀 Posibles mejoras futuras

- Dashboard con indicadores reales.
- Reportes de ventas.
- Alertas visuales avanzadas.
- Paginación y filtros adicionales.
- Manejo centralizado de mensajes y notificaciones.
- Refresh Token.
- Mejoras adicionales de accesibilidad.
- Mayor cobertura responsive.
- Caja y medios de pago.
- Compras y proveedores.
- Crédito a clientes.

---

## 🧠 Objetivo de aprendizaje

DStore forma parte de un proyecto personal orientado al fortalecimiento de habilidades Full Stack.

El frontend permite aplicar conocimientos de:

- Angular moderno.
- Standalone Components.
- TypeScript.
- RxJS.
- Consumo de APIs REST.
- JWT.
- Interceptors.
- Guards.
- Routing.
- Formularios.
- Modelado de Request y Response.
- Manejo de sesión.
- Integración Angular + Spring Boot.
- Diseño y organización de interfaces administrativas.

---

## 👨‍💻 Autor

**Mauricio Alarcón**

Proyecto personal orientado al fortalecimiento de habilidades en desarrollo Full Stack con **Angular, Java y Spring Boot**.
