---
name: create_new_game
description: Guía paso a paso para estructurar un nuevo juego y registrarlo en el ecosistema ToyBox.
---

# Crear un Nuevo Juego en ToyBox

Esta skill te enseña cómo estructurar e integrar un nuevo juego al proyecto ToyBox usando Next.js, React y los sistemas globales ya existentes.

## 1. Estructura de Archivos

Los juegos modernos basados en React en este proyecto se colocan en `components/games/[NombreDelJuego].tsx`.
Si el juego necesita componentes o assets adicionales específicos, considera crear una carpeta `components/games/[NombreDelJuego]/`.

**Ejemplo de plantilla de componente funcional:**
```tsx
'use client';

import React, { useState, useEffect } from 'react';
// Import dependencies like Framer Motion or Three.js if needed

export default function MiNuevoJuego() {
  const [score, setScore] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white font-sans p-4">
      <h1 className="text-4xl font-bold mb-8">Mi Nuevo Juego</h1>
      <p className="text-xl">Puntaje: {score}</p>
      <button 
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
        onClick={() => setScore(s => s + 1)}
      >
        Sumar Puntaje
      </button>
    </div>
  );
}
```

## 2. Enrutamiento en App Router

Crea una página en `/app/games/[slug-del-juego]/page.tsx` para renderizar el componente.

```tsx
import MiNuevoJuego from '@/components/games/MiNuevoJuego';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi Nuevo Juego - ToyBox',
  description: 'Descripción atractiva del juego.',
};

export default function Page() {
  return (
    <main className="min-h-screen">
      <MiNuevoJuego />
    </main>
  );
}
```

## 3. Registrar el Juego en el Sistema Global

Para que el juego aparezca en la lista principal (`Navegación`, `Admin Panel`, y en la pantalla principal), debes registrarlo en `lib/games.ts` dentro del array de la constante `GAMES` o en la base de datos si es administrado de esa forma.

**En `lib/games.ts`:**
```typescript
import { Game } from '@/lib/types'; // O la interfaz correspondiente

export const GAMES: Game[] = [
  // ...otros juegos
  {
    id: 'mi-nuevo-juego',
    title: 'Mi Nuevo Juego',
    title_es: 'Título en Español',
    description: 'A fun internal experiment.',
    description_es: 'Un experimento interno divertido.',
    thumbnail: '/images/thumbnails/mi-nuevo-juego.png', // Añadir imagen a /public/images/thumbnails/
    path: '/games/mi-nuevo-juego',
    category: 'experimental',
    theme: {
      gradient: 'from-blue-600 to-indigo-900',
      accent: 'bg-blue-500',
      icon: '🎮',
      pattern: 'dots'
    },
    isNew: true
  }
];
```

## 4. Uso de Contextos Locales (Opcional)

Si tu juego requiere autenticación o datos globales del entorno, puedes usar los contextos existentes como `UserContext` o `GameContext`.

```tsx
import { useUser } from '@/components/user-context';
import { useGameContext } from '@/components/game-context';

export default function MiNuevoJuego() {
  const { user } = useUser();
  const { games } = useGameContext();
  
  // user.id, user.name ...
}
```

## Resumen de Pasos
1. Crear interfaz base en `components/games/`
2. Crear la hoja de ruta en `app/games/[ruta]/page.tsx`
3. Incluir metadata y assets en `public/`
4. Registrar globalmente en `lib/games.ts`.
