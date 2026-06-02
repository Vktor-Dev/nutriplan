# NutriPlan — Plan Nutricional Mediterráneo

App **PWA (Progressive Web App)** para seguir tu plan nutricional mediterráneo, gestionar la lista de la compra y generar comidas aleatorias para reducción de grasa corporal. Funciona offline y se instala como app nativa en Android, iOS y escritorio.

![Stack: React 18 + Vite + Tailwind CSS 3 + Workbox](https://img.shields.io/badge/stack-React%2018%20%C2%B7%20Vite%205%20%C2%B7%20Tailwind%203-1ba5be)

---

## 🚀 Instalación local en Android (5 minutos)

### Paso 1 — Instalar dependencias y construir la app

En tu PC (Windows / Mac / Linux), abre una terminal en la carpeta del proyecto:

```bash
npm install
npm run build
```

Esto genera la versión optimizada en la carpeta `dist/`.

### Paso 2 — Servir la app en tu red local

```bash
npm run preview
```

Verás algo como:

```
➜  Local:   http://localhost:4173/
➜  Network: http://192.168.1.42:4173/   ← esta es la importante
```

> ⚠️ Tu móvil y tu PC deben estar conectados a la **misma red WiFi**.

Si el comando no muestra la IP de red, usa `npm run preview -- --host` o averigua tu IP local:
- **Windows:** `ipconfig` (busca "IPv4")
- **Mac/Linux:** `ifconfig` o `ip addr`

### Paso 3 — Abrir desde el móvil

1. Abre **Chrome** en tu Android (o cualquier navegador moderno: Edge, Brave, Samsung Internet).
2. Escribe la URL de red: `http://192.168.1.42:4173` (la que te haya dado el paso 2).
3. La app cargará exactamente igual que en el PC.

### Paso 4 — Instalar como app

Una vez abierta en Chrome:

- Chrome mostrará automáticamente un banner **"Añadir a la pantalla de inicio"**. Acepta.
- Si no aparece: pulsa el menú **⋮** (arriba a la derecha) → **"Instalar app"** o **"Añadir a pantalla principal"**.

Resultado:
- ✅ Icono de NutriPlan en tu launcher de Android.
- ✅ Se abre en pantalla completa (sin barra del navegador).
- ✅ Funciona offline después de la primera carga (gracias al service worker).
- ✅ Aparece en el cajón de apps como cualquier app nativa.

---

## 💡 Si quieres usarla siempre, sin depender del PC

La opción anterior requiere que tu PC esté encendido cuando uses la app. Hay tres alternativas para hacerla 100% autónoma:

### Opción A — Hosting gratuito (recomendado, 2 minutos)

Sube la carpeta `dist/` a cualquiera de estos servicios gratuitos:

- **Netlify Drop** → https://app.netlify.com/drop (arrastra la carpeta `dist`)
- **Vercel** → https://vercel.com (deploy con un click conectando GitHub)
- **GitHub Pages** → gratis si subes a un repo

Te dan una URL pública (ej: `nutriplan-victor.netlify.app`). Abres esa URL en el móvil, "Añadir a pantalla de inicio", y ya tienes la app instalada permanentemente. Funciona offline tras la primera visita.

### Opción B — Generar un APK real

Si quieres un **.apk** instalable como cualquier app de fuera de Play Store:

1. Despliega la app primero (Opción A).
2. Ve a **https://www.pwabuilder.com**
3. Pega la URL de tu PWA.
4. Pulsa "Package for stores" → "Android" → "Download package".
5. Te descargas un APK firmado que puedes instalar con **Archivos → APK → Instalar** (habilita "Instalar apps desconocidas" para tu navegador o gestor de archivos).

PWABuilder usa **Bubblewrap** (Google) por debajo, que empaqueta tu PWA como TWA (Trusted Web Activity). Es la forma oficial recomendada por Google.

### Opción C — Bubblewrap directo (avanzado)

Si quieres generar el APK localmente con Node:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://tu-url-pwa.com/manifest.webmanifest
bubblewrap build
```

Esto requiere tener instalado **Java JDK 17+** y **Android SDK**.

---

## 🛠️ Desarrollo

```bash
npm run dev       # arranca Vite en modo desarrollo (hot reload)
npm run build     # construye para producción → dist/
npm run preview   # sirve dist/ localmente para probar
```

### Estructura

```
nutriplan/
├── public/
│   ├── pwa-192x192.png          # icono PWA pequeño
│   ├── pwa-512x512.png          # icono PWA grande
│   ├── pwa-maskable-512x512.png # icono adaptable Android
│   ├── apple-touch-icon.png     # icono iOS
│   ├── favicon.ico
│   └── masked-icon.svg
├── src/
│   ├── App.jsx                  # toda la app (3 vistas + modal de receta)
│   ├── main.jsx                 # entry point
│   └── index.css                # tailwind directives
├── index.html
├── vite.config.js               # config + plugin PWA (workbox)
├── tailwind.config.js
└── package.json
```

### Stack técnico

| Capa            | Tecnología                                 |
|-----------------|--------------------------------------------|
| UI              | React 18                                   |
| Estilos         | Tailwind CSS 3                             |
| Iconos          | lucide-react                               |
| Bundler         | Vite 5                                     |
| PWA             | vite-plugin-pwa (Workbox)                  |
| Caché offline   | StaleWhileRevalidate sobre todo el origen  |

### Modificar el plan o las recetas

Todo está en `src/App.jsx`:

- `dietData.planSemanal` — plan de comidas por día (Desayuno / Comida / Cena).
- `dietData.listaCompra` — lista de la compra por categorías.
- `dietData.porPlato` — lista por plato.
- `dietData.generador` — pool de comidas y cenas aleatorias.
- `recetas` — diccionario indexado por palabra clave del plato. Cada receta tiene: `tiempo`, `dificultad`, `macros {kcal, p, c, g}`, `ingredientes [{nombre, cantidad}]`, `pasos [string]`.

Al modificar `recetas`, basta con que la **key** sea un substring del nombre del plato en el plan (case-insensitive). Por ejemplo, `'quinoa con pollo'` hace match con `'Quinoa con pollo a la plancha 110g'`.

---

## 🎨 Diseño

- **Color primario:** `#1ba5be` (turquesa) con sombras y gradientes a `#138aa0` / `#0e8aa0`.
- **Fondo:** `#f9fafb` (gris muy claro).
- **Tipografía:** stack de sistema (SF Pro en iOS, Roboto en Android, Segoe UI en Windows).
- **Navegación inferior:** 3 pestañas con pill turquesa para la activa.
- **Bottom sheet** para detalles de receta con animación `cubic-bezier(0.32, 0.72, 0, 1)` (iOS-like).

---

## 🔒 Privacidad

NutriPlan es 100% local: **no envía datos a ningún servidor**. Todo el estado (toggles de la compra, plan, configuración) vive en memoria. Si quieres persistir los toggles entre sesiones, puedes añadir `localStorage` en `src/App.jsx`.

---

## 📜 Licencia

Uso personal libre. Construido como proyecto privado.
