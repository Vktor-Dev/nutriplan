# 📱 Guía para generar el APK de NutriPlan

Tienes **dos rutas** para conseguir un `.apk` instalable. El proyecto ya viene **pre-configurado con Capacitor** (Ruta A), que es la recomendada porque genera un APK nativo real **sin necesitar hosting en internet**.

| | Ruta A — Capacitor | Ruta B — PWABuilder |
|---|---|---|
| Necesita Android Studio / SDK | ✅ Sí | ❌ No |
| Necesita hosting público | ❌ No | ✅ Sí |
| Tipo de app | WebView nativo (APK real) | TWA (Chrome embebido) |
| Control / personalización | Total | Limitado |
| Dificultad | Media | Muy fácil |

---

## 🟢 Ruta A — Capacitor (recomendada)

### Requisitos previos (instalar una vez)

1. **Node.js 18+** — ya lo tienes si has usado la app.
2. **Java JDK 17 o 21** — [Adoptium Temurin](https://adoptium.net/) (descarga el JDK 21 LTS).
3. **Android Studio** — https://developer.android.com/studio
   - Al instalarlo, en el asistente acepta que descargue el **Android SDK**, **Platform-Tools** y un **Android SDK Build-Tools**.
   - Abre Android Studio una vez para que termine de descargar componentes.

> 💡 Android Studio configura solo las variables `ANDROID_HOME` y el SDK. Si compilas por terminal sin haber abierto Studio nunca, tendrás que definir `ANDROID_HOME` a mano (apunta a `~/Android/Sdk` en Linux/Mac o `%LOCALAPPDATA%\Android\Sdk` en Windows).

### Paso a paso

Desde la carpeta del proyecto:

```bash
# 1. Instalar todas las dependencias (incluye Capacitor, ya está en package.json)
npm install

# 2. Construir la web app
npm run build

# 3. Añadir la plataforma Android (crea la carpeta android/)
npx cap add android

# 4. (Opcional pero recomendado) Generar iconos y splash nativos
#    desde los assets que ya incluí en la carpeta assets/
npm install -D @capacitor/assets
npx @capacitor/assets generate --android

# 5. Sincronizar la web app dentro del proyecto Android
npx cap sync
```

### Generar el APK

**Opción 1 — Desde Android Studio (más visual):**

```bash
npx cap open android
```

Esto abre el proyecto en Android Studio. Allí:
- Menú **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
- Cuando termine, sale una notificación con un enlace **"locate"**. El APK está en:
  `android/app/build/outputs/apk/debug/app-debug.apk`

**Opción 2 — Por terminal (más rápido):**

```bash
cd android
./gradlew assembleDebug          # Linux / Mac
# .\gradlew.bat assembleDebug    # Windows
```

El APK queda en:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

> 🎯 Atajo: he añadido un script. Tras el setup inicial (pasos 1-5), puedes regenerar el APK con un solo comando desde la raíz:
> ```bash
> npm run apk
> ```

### APK de debug vs release

- **`app-debug.apk`** — funciona perfectamente para uso personal. Se instala sin problema en tu móvil. Es lo que necesitas.
- **`app-release.apk`** — solo necesario si lo vas a publicar/distribuir. Requiere firmarlo con un keystore:
  ```bash
  cd android
  ./gradlew assembleRelease
  ```
  Para firmarlo, Android Studio tiene un asistente en **Build → Generate Signed Bundle / APK**.

---

## 🔵 Ruta B — PWABuilder (sin Android Studio)

Si no quieres instalar Android Studio:

1. **Despliega la PWA** en un hosting gratuito. Lo más rápido:
   ```bash
   npm run build
   ```
   Luego arrastra la carpeta `dist/` a **https://app.netlify.com/drop**. Te da una URL tipo `https://nutriplan-vktor.netlify.app`.

2. Ve a **https://www.pwabuilder.com** e introduce esa URL.

3. PWABuilder analiza la PWA (detectará el manifest e iconos que ya están configurados). Pulsa **"Package for stores"**.

4. Elige **Android** → **Download package**. Te descarga un `.zip` con:
   - `app-release-signed.apk` ← este es el que instalas.
   - Un keystore y las instrucciones de firma.

PWABuilder usa **Bubblewrap** (la herramienta oficial de Google) por debajo para empaquetar la PWA como TWA.

---

## 📲 Instalar el APK en tu Android

1. Copia el `.apk` a tu móvil (cable USB, Google Drive, Telegram a ti mismo, etc.).
2. Ábrelo desde la app **Archivos** o **Mis archivos**.
3. Android pedirá permiso para **"Instalar apps desconocidas"** para esa app (Archivos/Chrome). Actívalo.
4. Pulsa **Instalar**.
5. ¡Listo! NutriPlan aparece en tu cajón de apps con su icono de hoja turquesa.

> En tu **SEAT** no, pero en tu Samsung Galaxy S24+ el proceso es: al abrir el APK, te lleva directo a Ajustes → "Instalar apps desconocidas" → activas el toggle para la app desde la que abriste el archivo → vuelves atrás → Instalar.

---

## 🧩 Troubleshooting

**`SDK location not found`**
Crea el archivo `android/local.properties` con:
```
sdk.dir=/home/TU_USUARIO/Android/Sdk        # Linux
sdk.dir=/Users/TU_USUARIO/Library/Android/sdk  # Mac
sdk.dir=C\:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk  # Windows
```

**`Gradle build failed` / versión de Java**
Asegúrate de usar JDK 17 o 21. Comprueba con `java -version`. Capacitor 6 no soporta JDK 8/11.

**El APK abre en blanco**
Casi siempre es que olvidaste `npm run build` antes de `npx cap sync`. Reconstruye y sincroniza:
```bash
npm run build && npx cap sync
```

**Quiero cambiar el nombre o el ID de la app**
Edita `capacitor.config.json` (`appId`, `appName`) ANTES de `npx cap add android`. Si ya creaste la carpeta `android/`, bórrala y vuelve a añadirla.

**Actualizar la app tras cambios en el código**
```bash
npm run build && npx cap sync
```
Y vuelve a generar el APK.

---

## 📂 Qué incluye el proyecto para el APK

```
nutriplan/
├── capacitor.config.json     # config de Capacitor (appId: com.vktor.nutriplan)
├── assets/                   # fuentes para @capacitor/assets
│   ├── icon.png              # 1024x1024 icono completo
│   ├── icon-foreground.png   # capa frontal (adaptive icon)
│   ├── icon-background.png   # capa de fondo (adaptive icon)
│   ├── splash.png            # 2732x2732 pantalla de carga
│   └── splash-dark.png       # versión modo oscuro
└── package.json              # incluye @capacitor/* y el script "npm run apk"
```

Con esto, `npx @capacitor/assets generate --android` te genera automáticamente todos los tamaños de icono (mdpi → xxxhdpi), el adaptive icon de Android y las splash screens.
