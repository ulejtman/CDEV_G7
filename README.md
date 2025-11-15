# CDEV_G7 - Entorno Virtual Interactivo 3D

## Información Académica

**Universidad:** Universidad Tecnológica Nacional - Facultad Regional Córdoba (UTN-FRC)  
**Carrera:** Ingeniería en Sistemas de Información  
**Asignatura:** Creatividad y Desarrollo de Entornos Virtuales  
**Grupo:** G7  

## Descripción del Proyecto

Este proyecto es una **aplicación web interactiva 3D** desarrollada con Three.js que simula un entorno de bar virtual. La aplicación permite a los usuarios interactuar con objetos 3D (botellas, vasos, mesa) utilizando tanto controles de mouse como detección de manos mediante MediaPipe.

### Características Principales

- **Renderizado 3D en tiempo real** usando Three.js
- **Detección de manos** mediante MediaPipe Hands para interacción natural
- **Sistema de punteros contextuales** que cambian según la posición de la cámara
- **Modelos 3D detallados** con materiales realistas y transparencias
- **Audio interactivo** sincronizado con las interacciones
- **Interfaz dual** que permite alternar entre mouse y control por gestos

## Tecnologías Utilizadas

- **Three.js r158** - Motor de renderizado 3D
- **MediaPipe Hands** - Detección y seguimiento de manos
- **WebGL** - Renderizado acelerado por hardware
- **JavaScript ES6+** - Lógica de aplicación con módulos
- **GLTF** - Formato de modelos 3D
- **HTML5/CSS3** - Interfaz de usuario

## Estructura del Proyecto

```
CDEV_G7/
├── index.html              # Página principal
├── style.css               # Estilos de la aplicación
├── assets/                 # Recursos multimedia
│   ├── models/            # Modelos 3D GLTF
│   ├── sounds/            # Archivos de audio
│   └── textures/          # Texturas y skybox
├── libs/                   # Librerías de Three.js
├── src/                    # Código fuente
│   ├── main.js            # Punto de entrada
│   ├── state.js           # Gestión de estado centralizada
│   ├── animate.js         # Loop de renderizado
│   ├── core/              # Componentes principales (cámara, escena, luces)
│   ├── models/            # Cargadores de modelos 3D
│   └── input/             # Sistemas de entrada (mouse/manos)
```

## Instalación y Ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/ulejtman/CDEV_G7.git
   cd CDEV_G7
   ```

2. **Servir los archivos localmente:**
   
   Debido a las políticas CORS de los navegadores, es necesario servir los archivos a través de un servidor HTTP local:

   **Opción 1 - Python:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Opción 2 - Node.js:**
   ```bash
   npx http-server
   ```

   **Opción 3 - Live Server (VS Code):**
   - Instalar la extensión "Live Server"
   - Clic derecho en `index.html` → "Open with Live Server"

3. **Abrir en el navegador:**
   - Navegar a `http://localhost:8000` (o el puerto que indique el servidor)
   - **Importante:** Permitir el acceso a la cámara para la detección de manos

## Uso de la Aplicación

### Controles con Mouse
- **Clic izquierdo + arrastrar:** Rotar cámara
- **Scroll:** Zoom in/out
- **Clic derecho + arrastrar:** Desplazar vista

### Controles con Manos
1. Activar el modo de detección de manos en la interfaz
2. Colocar la mano frente a la cámara
3. **Puño cerrado:** Interactuar con objetos
4. **Mano abierta:** Navegación libre

### Sistema de Punteros
- **Puntero azul:** Modo normal de interacción
- **Puntero rojo:** Se activa en posiciones específicas de la cámara

## Arquitectura Técnica

### Gestión de Estado
El proyecto utiliza un **patrón de estado centralizado** donde todos los módulos comparten un objeto de estado común (`src/state.js`):

```javascript
import { state } from './state.js';
// Todos los modelos, configuraciones y datos se almacenan en 'state'
```

### Carga de Modelos
Los modelos GLTF siguen un patrón consistente basado en Promises:

```javascript
export function loadModel() {
  return new Promise((resolve, reject) => {
    // Lógica de carga con GLTFLoader
  });
}
```

### Detección de Manos
Integración con MediaPipe mediante una clase `HandController` que gestiona:
- Detección de landmarks de la mano
- Conversión de coordenadas normalizadas
- Reconocimiento de gestos (puño cerrado/abierto)

## Características de Renderizado

- **Cámara ortográfica** con cálculos de frustum y aspect ratio
- **Materiales diferenciados:**
  - Botellas: Materiales opacos realistas
  - Vasos: Transparencias con renderizado `DoubleSide`
  - Simulación de líquidos con geometrías dinámicas
- **Skybox:** Entorno inmersivo con texturas de cubo
- **Iluminación:** Sistema de luces direccionales y ambientales

## Contribuciones

Este proyecto fue desarrollado como parte del trabajo práctico de la asignatura **Creatividad y Desarrollo de Entornos Virtuales** por el **Grupo 7**.

## Licencia

Este proyecto es de uso académico para la Universidad Tecnológica Nacional - Facultad Regional Córdoba.

---

**Desarrollado con ❤️ por el Grupo 7 - UTN-FRC**