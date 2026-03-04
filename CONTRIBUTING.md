# 🚀 Guía de Contribución - Marketplace Project

¡Bienvenido al equipo! Para mantener la calidad del código y la agilidad en nuestro flujo de Scrum, todos los desarrolladores deben seguir estas reglas.

---

## 🛠️ Requisitos Previos
Antes de empezar, asegúrate de tener:
* **Node.js** (Versión LTS)
* **Git** configurado con tu usuario de GitHub.
* Acceso al proyecto en **Jira** y a las credenciales de **Supabase**.

---

## 🌿 Estrategia de Ramas (GitFlow)

Nuestro flujo de trabajo se basa en el ID de los tickets de Jira (`OM-XXX`).

1. **`main`**: Código estable y desplegado. Nadie pulsa aquí directamente.
2. **`dev`**: Rama de integración. Aquí se unen todas las funcionalidades terminadas.
3. **`feat/OM-XXX-descripcion`**: Ramas para nuevas funcionalidades.
4. **`fix/OM-XXX-descripcion`**: Ramas para corrección de errores.

### Ciclo de vida de una tarea:
1. Sitúate en `dev` y actualiza: `git checkout dev && git pull origin dev`.
2. Crea tu rama: `git checkout -b feat/OM-12-login-supabase`.
3. Desarrolla y haz commits siguiendo los estándares.
4. Hazte un pull origin dev para resolver conflictos antes de subir a tu rama remota.
5. Sube tu rama: `git push origin feat/OM-12-login-supabase`.
6. Abre un **Pull Request (PR)** en GitHub hacia la rama `dev`.

---

## 💬 Convención de Commits

Usamos **Conventional Commits** para que el historial sea legible. El formato es:
`tipo: [ID-Jira] descripción en minúsculas`

* `feat`: Una nueva funcionalidad (ej: `feat: [OM-5] agregar filtro de precios`).
* `fix`: Solución de un bug (ej: `fix: [OM-10] error en validación de email`).
* `docs`: Cambios solo en documentación.
* `style`: Cambios que no afectan la lógica (espacios, formato, etc).
* `refactor`: Cambio de código que no corrige errores ni añade funciones.

---

## ✅ Reglas de Oro para Pull Requests (PR)

Para que tu código sea aprobado en **Code Review**, debe cumplir:
1. **Un ticket = Un PR**: No mezcles cambios de diferentes tareas.
2. **Sin conflictos**: Asegúrate de que tu rama esté actualizada con `dev` antes de pedir revisión.
3. **Variables de Entorno**: NUNCA subas archivos `.env`. Las llaves de Supabase deben configurarse localmente.
4. **Descripción**: Explica brevemente qué hiciste y cómo probarlo.

---

## 🚀 Sincronización con Jira

Recuerda que Jira y GitHub están conectados:
* Al crear una rama con el ID `OM-XXX`, el ticket pasará automáticamente a **"En curso"**.
* Al abrir un PR, el ticket pasará a **"Code Review"**.
* Si el PR es rechazado, vuelve a **"En curso"** para correcciones.

---

¡A darle átomos! ⚛️