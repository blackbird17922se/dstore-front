# 🛒 DStore Frontend

Frontend de **DStore**, una aplicación web orientada a la gestión de ventas e inventario para pequeños comercios como papelerías, cacharrerías y tiendas locales.

La aplicación está desarrollada con **Angular** y consume una API REST construida con **Java y Spring Boot**.

Este repositorio contiene exclusivamente la interfaz web del sistema.

---

## 🔗 Repositorios

### Frontend

Este repositorio contiene la aplicación Angular de DStore.

### Backend

[DStore Backend - Spring Boot](https://github.com/blackbird17922se/rdstore)

---

## 🎯 Objetivo del proyecto

Construir una interfaz web sencilla, funcional y progresivamente mejorada que permita administrar las operaciones principales de DStore.

Actualmente el frontend permite interactuar con diferentes funcionalidades ya disponibles en el backend, manteniendo la autenticación mediante JWT y el control de acceso a las rutas de la aplicación.

---

## 🛠️ Stack tecnológico

- Angular 20
- TypeScript
- RxJS
- Angular Router
- HttpClient
- Functional Interceptors
- Route Guards
- HTML
- CSS

La aplicación utiliza componentes **standalone** de Angular.

---

## 🔐 Autenticación y seguridad

El frontend se encuentra integrado con el sistema de autenticación JWT del backend.

El flujo actual es:

```text
Usuario
   ↓
Login Angular
   ↓
POST /api/v2/auth/login
   ↓
Spring Boot valida credenciales
   ↓
JWT
   ↓
Angular almacena la sesión
   ↓
Interceptor agrega el token
   ↓
Authorization: Bearer TOKEN
```

Actualmente se encuentra implementado:

- Login de usuarios.
- Almacenamiento del JWT.
- Manejo del usuario autenticado.
- Manejo del rol del usuario.
- Estado reactivo de sesión mediante RxJS.
- Interceptor HTTP para enviar automáticamente el JWT.
- Protección de rutas.
- Cierre de sesión.
- Integración con endpoints protegidos de Spring Security.

---

## 📦 Funcionalidades implementadas

### 🔐 Autenticación

- Login.
- Manejo de sesión.
- Interceptor JWT.
- Guards de navegación.
- Logout.
- Control de acceso según autenticación.

### 🗂️ Catálogos

Actualmente existen interfaces para la gestión de:

- Categorías / tipos de producto.
- Presentaciones.
- Marcas.

Estas pantallas consumen información directamente desde la API de DStore.

### 📦 Productos

El módulo de productos permite actualmente:

- Listar productos.
- Visualizar nombre.
- Descripción.
- Precio.
- Tarifa de IVA.
- Marca.
- Categoría.
- Presentación.
- Código de barras.
- Stock calculado desde el backend.

El frontend ya se encuentra consumiendo la versión actual de la API Spring Boot.

---

## 🌐 Integración con el Backend

La URL de la API se encuentra centralizada mediante los archivos de configuración de Angular.

Ejemplo:

```typescript
export const environment = {
  apiUrl: 'http://localhost:8080/api/v2'
};
```

Los servicios utilizan esta configuración para construir las diferentes URLs:

```typescript
private apiUrl = `${environment.apiUrl}/auth`;
```

Esto evita definir URLs del backend directamente en cada componente.

---

## 🔑 Interceptor JWT

Las peticiones protegidas utilizan un interceptor funcional de Angular.

Ejemplo:

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned);
  }

  return next(req);
};
```

De esta forma los componentes y servicios no necesitan agregar manualmente el token en cada petición.

---

## 🧱 Organización actual

La aplicación se encuentra organizada principalmente en:

```text
src/app
│
├── components
├── guards
├── interceptors
├── model
├── pages
├── services
├── app.config.ts
└── app.routes.ts
```

### Responsabilidades

**Pages**

Contienen las vistas principales de la aplicación.

**Components**

Componentes reutilizables de interfaz.

**Services**

Centralizan la comunicación con la API REST.

**Guards**

Controlan el acceso a las rutas.

**Interceptors**

Interceptan peticiones HTTP y agregan información como el JWT.

**Model**

Contiene interfaces y modelos utilizados para representar la información intercambiada con el backend.

---

## ▶️ Ejecución

### Requisitos

- Node.js
- npm
- Angular CLI

Clonar el repositorio:

```bash
git clone https://github.com/blackbird17922se/dstore-front.git
cd dstore-front
```

Instalar dependencias:

```bash
npm install
```

Ejecutar el proyecto:

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

Para utilizar todas las funcionalidades es necesario tener ejecutándose también el backend de DStore.

---

## 🚧 Estado actual

### Implementado

- ✅ Angular Standalone.
- ✅ Login.
- ✅ Autenticación JWT.
- ✅ Interceptor HTTP.
- ✅ Guards.
- ✅ Manejo de sesión.
- ✅ Integración con Spring Boot.
- ✅ Consulta de catálogos.
- ✅ Consulta de productos.
- ✅ Visualización de stock proveniente del inventario.

### En adaptación / mejora

- 🚧 Formularios de creación y edición de productos.
- 🚧 Activación y desactivación de registros.
- 🚧 Actualización visual de la interfaz.
- 🚧 Mejor organización de componentes reutilizables.
- 🚧 Manejo centralizado de errores HTTP.
- 🚧 Manejo de expiración del JWT.

### Próximos módulos

- 🔜 Inventario.
- 🔜 Entradas de inventario.
- 🔜 Existencias.
- 🔜 Control de vencimientos.
- 🔜 Ajustes de inventario.
- 🔜 Clientes.
- 🔜 Ventas.
- 🔜 Pagos.
- 🔜 Dashboard.
- 🔜 Alertas de productos próximos a vencer.

---

## 🎨 UI / UX

La interfaz actual corresponde a una primera versión funcional.

El objetivo inmediato es priorizar:

1. Integración correcta con el backend.
2. Funcionalidad de los módulos.
3. Validaciones.
4. Seguridad.

Posteriormente se realizará una etapa específica de mejora de:

- Diseño visual.
- Responsive design.
- Componentes reutilizables.
- Experiencia de usuario.
- Feedback visual.
- Navegación.

---

## 🧠 Objetivo de aprendizaje

DStore Frontend también forma parte de un proyecto personal orientado al fortalecimiento de habilidades en desarrollo Full Stack.

El proyecto permite aplicar conocimientos de:

- Angular.
- TypeScript.
- RxJS.
- Consumo de APIs REST.
- JWT.
- Interceptors.
- Guards.
- Routing.
- Integración Angular + Spring Boot.
- Modelado de interfaces TypeScript.
- Manejo de sesión en frontend.

---

## 👨‍💻 Autor

**Mauricio Alarcón**

Proyecto personal orientado al fortalecimiento de habilidades en desarrollo Full Stack con **Angular, Java y Spring Boot**.