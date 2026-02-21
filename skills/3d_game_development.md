---
name: 3d_game_development
description: Guía de uso y buenas prácticas para escenarios 3D web usando React Three Fiber, Drei y Cannon.
---

# Desarrollo de Juegos 3D Web (Three.js Stack)

El entorno del proyecto ToyBox ha incorporado librerías potentes para crear experiencias interactivas y asombrosas en 3D (`@react-three/fiber`, `@react-three/drei`, `@react-three/cannon`).

Esta guía enmarca las pautas básicas para asegurar la excelencia en renderizada y simulación en nuevos juegos.

## 1. Uso Inicial del Canvas

Las escenas de React Three Fiber deben inicializarse en un componente envuelto por un `Canvas`. Asegúrate de dimensionar el DOM padre correctamente (ej: 100vw y 100vh).

```tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Physics } from '@react-three/cannon';

export default function My3DGame() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        {/* Iluminación básica */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} castShadow intensity={1} />
        
        {/* Entorno HDR PBR */}
        <Environment preset="city" />

        <Physics>
          {/* Aquí irán componentes físicos */}
          <Player cube />
          <Ground />
        </Physics>

        {/* Controles de cámara si son necesarios */}
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
```

## 2. Gestión de Físicas (react-three-cannon)

Si hay interacciones del mundo real (colisiones, rebotes, caídas, masas), los materiales deben estar envueltos en sus componentes hook correspondientes (`useBox`, `useSphere`, `usePlane`, etc.).

**Ejemplo de una Caja (Jugador) que sufre gravedad**:
```tsx
import { useBox } from '@react-three/cannon';

function Player() {
  // `ref` mapea a Three.js Object3D, `api` provee comandos para intervenir la física.
  const [ref, api] = useBox(() => ({ mass: 1, position: [0, 5, 0] }));

  const jump = () => {
    // Aplicar fuerza de salto al objeto físico
    api.velocity.set(0, 5, 0);
  };

  return (
    <mesh ref={ref} onClick={jump} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

// Ejemplo del Suelo Estático
function Ground() {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -1, 0] }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="lightgreen" />
    </mesh>
  );
}
```

## 3. Optimización para Interfaces Web Modernas

Renderizar 3D cuesta procesador y batería. Siempre aplica estas estrategias para priorizar la estética excelente fluida (WOW effect) o un comportamiento ameno:

1. **Uso de `.glb` o `.gltf` Modelos**: Carga modelos mediante el hook `useGLTF` proporcionado por Drei en vez de construir en runtime geometrías inmensamente complejas. Usa `npx gltfjsx tu-modelo.glb` para auto-generar los componentes de React desde los assets!
2. **Sombras Optimas**: No actives `castShadow` y `receiveShadow` en objetos que el usuario no notará (como la iluminación de ambiente lejana).
3. **Instancing (`InstancedMesh`)**: Si necesitas clonar cientos de objetos (árboles, estrellas, asteroides en un juego *Speed of Light* multiplayer), usa `InstancedMesh`. Nunca loopees un render `<mesh>`.
4. **HTML y HUD**: Usa las herramientas `<Html>` de Drei para superponer DOM interactivo, etiquetas e interfaces (vidas, puntajes) al espacio del canvas en 3-dimensiones, o apoya UI absolutizada por encima del Canvas.

## 4. Sincronización 3D en Multiplayer (Cuidado Clave)

Webhooks o Websockets deben mandar Posiciones, Rotaciones y Eventos de animación, en vez de mandar input del control directamente (a menos que estéticamente tu motor sea determinístico).
Usa el hook base `useFrame((state, delta))` de React Three Fiber para realizar interpolación lineal (`lerp`) entre los puntos que te provea la fuente remota de multiplayer (Pusher/Socket), creando movimientos suaves en tu pantalla, en lugar de telestransportes del otro jugador por cada latido de la red sincronizada.
