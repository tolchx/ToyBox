---
name: add_multiplayer_websocket
description: Guía de integración de tecnologías en tiempo real (WebSockets/Pusher) para funcionalidades multijugador.
---

# Añadir Capacidades Multijugador en Tiempo Real

Para convertir a ToyBox en una plataforma online, el componente más crítico es una capa de comunicación bidireccional de baja latencia. El proyecto actualmente es basado en Next.js (Server Actions y API Routes) que son `stateless`. Por lo tanto, necesitamos un servicio externo o un servidor websocket adjunto.

## Opciones Recomendadas
1. **Pusher (Recomendado)**: API as a Service. Excelente integración comercial, SDKs de React, y permite canales públicos/privados usando la misma lógica que Next.js.
2. **Socket.io + Custom Node.js Server**: Requiere desmontar/modificar la forma actual de alojar la app en Vercel, creando un servidor custom expresso + Next.js.
3. **Supabase Realtime**: Usa la BD PostgreSQL para emitir eventos de inserción/actualización vía websockets (Si el proyecto llegara a migrar de SQLite a Postgres en Vercel Postgres).
4. **PartyKit**: Excelente para plataformas edge de juegos multiusuario.

## Ejemplo de Integración de Arquitectura con Pusher

### 1. Instalación
Si se decide usar Pusher, ejecuta en el terminal:
```bash
npm install pusher pusher-js
```

### 2. Configurar el Backend (Next.js App API)
Crea una ruta en `app/api/pusher/auth/route.ts` para autenticar a los clientes en los canales privados:
```typescript
import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";
import { auth } from "@/auth"; // Tu sistema actual next-auth

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const socketId = req.headers.get("socket_id");
  const channelName = req.headers.get("channel_name");

  const presenceData = {
    user_id: session.user.id,
    user_info: { name: session.user.name, avatar: session.user.image }
  };

  const authResponse = pusher.authorizeChannel(socketId!, channelName!, presenceData);
  return NextResponse.json(authResponse);
}
```

### 3. Crear el Hook del Cliente
Comunica al componente React del juego utilizando un hook. `useEffect` será tu canal principal.

```tsx
'use client';
import { useEffect, useState } from 'react';
import PusherClient from 'pusher-js';

export function useMultiplayer(gameRoomId: string) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Configura el cliente de Pusher
    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth', // Usamos el endpoint para seguridad
    });

    const channel = pusher.subscribe(`presence-game-${gameRoomId}`);

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      // Registrar jugadores actuales
      const initialUsers = Object.keys(members.members).map(key => members.members[key]);
      setPlayers(initialUsers);
    });

    channel.bind('pusher:member_added', (member: any) => {
      setPlayers(prev => [...prev, member.info]);
    });

    channel.bind('pusher:member_removed', (member: any) => {
      setPlayers(prev => prev.filter(p => p.id !== member.id));
    });

    // Escuchar a eventos custom (movimientos, ataque, chat)
    channel.bind('player-action', (data: any) => {
      // Lógica de estado in-game
    });

    return () => {
      pusher.unsubscribe(`presence-game-${gameRoomId}`);
      pusher.disconnect();
    };
  }, [gameRoomId]);

  return { players };
}
```

## Reglas Clave Multijugador
1. **El Estado Confiable**: En juegos competitivos, valora usar una lógica Autoritaria, donde una `Server Action` y la API calculan el ganador, en vez del cliente react.
2. **Predicción de Cliente**: Enseña al cliente a mostrar las animaciones de movimiento o impactos *antes* de que llegue la respuesta del Websocket para mejorar la percepción de velocidad.
3. **Room IDs**: Utiliza un modelo en Prisma (ej. `GameLobby`) de donde puedes mapear UUIDs a Canales de Pusher. Nunca reveles IDs predecibles.
