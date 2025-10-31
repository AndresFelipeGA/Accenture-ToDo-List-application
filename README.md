# Accenture ToDo List

## Compilar y Ejecutar la Aplicación

### Prerrequisitos

**Para Android:**
- Android Studio
- Android SDK (API level 22+)
- JDK 11+

**Para iOS (solo macOS):**
- Xcode 12+
- CocoaPods

### Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Construir la aplicación:
```bash
npm run build
```

### Android

1. Sincronizar proyecto:
```bash
npx cap sync android
```

2. Abrir en Android Studio:
```bash
npx cap open android
```

3. Ejecutar en dispositivo/emulador desde Android Studio: Run > Run 'app'

### iOS

1. Sincronizar proyecto:
```bash
npx cap sync ios
```

2. Abrir en Xcode:
```bash
npx cap open ios
```

3. Ejecutar en dispositivo/simulador desde Xcode: Product > Run
