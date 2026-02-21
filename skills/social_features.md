---
name: social_features
description: Guía de integración para características sociales como invitaciones, amigos, chat en-juego.
---

# Extender Funciones Sociales de la Web

ToyBox implementa componentes orientados a lo social (en base de datos ya existen modelos como `Friend`, `Message`, `Notification` y `FriendRequest`). Para un sitio online, estas funciones motivan el uso recurrente.

## 1. Integración de Autenticación
Todos los componentes sociales necesitan estar asegurados. Verifica siempre la sesión antes de generar un componente condicional o interfaz de usuario:

```tsx
import { auth } from "@/auth";

export default async function AnyPage() {
  const session = await auth();
  
  if (!session) {
    return <LoginPrompt />;
  }

  return <SocialDashboard userId={session.user.id} />
}
```

## 2. Desarrollo de Desafíos ("Challenge")

Un pilar de juegos web online es el reto directo. Extiende el modelo actual `Message` de Prisma usando un `type = "challenge"` (ya documentado en el schema).

**Lógica sugerida en acciones:**
1. El Jugador A envía un `Message` (tipo "challenge") al Jugador B.
2. El `metadata` contiene `{ "gameId": "speed-of-light", "opponentScore": 2500 }`.
3. El Chat renderizará este mensaje como una Card con un botón de "Aceptar Desafío".

**Implementación hipotética de UI:**
```tsx
export function ChallengeCard({ message }) {
  const metadata = JSON.parse(message.metadata);
  
  const handleAccept = () => {
    // Redirigir al juego con un Query parameter especial, 
    // ej: /games/speed-of-light?challengeId=XXX
    window.location.href = `/games/${metadata.gameId}?challengeId=${message.id}`;
  };

  return (
    <div className="bg-neutral-800 border border-purple-500 rounded p-4">
      <p className="font-bold">{message.sender.name} te ha desafiado!</p>
      <p>Juego: {metadata.gameId}</p>
      <button onClick={handleAccept} className="bg-purple-600 px-4 py-2 mt-2">
        Aceptar
      </button>
    </div>
  )
}
```

## 3. Estado Online (Presence)

El modelo de `User` de Prisma posee un campo `lastSeen DateTime?`.

**Técnica de Pooling (Para SQLite sin WebSockets)**
Crea un componente transparente que haga un *heartbeat* o pulso (ping) a la base de datos cada vez que pase a otra vista o cada minuto para actualizar este slot y verificar amistades recientemente conectadas:

1. Crea endpoint `app/api/presence/ping` que actualiza `lastSeen = now()` donde un token coincida.
2. Crea lógica para consultar qué de los amigos del usuario tienen un lastseen menor a X minutos.

**Tercera alternativa (con WebSockets/Pusher)**: El "Channel Presence" (como vimos en `add_multiplayer_websocket.md`) reporta la presencia de usuarios directamente en caché sin tocar SQLite repetidas veces para evitar saturaciones.

## 4. Chats de Grupo
Para futuros juegos cooperativos, se puede extender `Message` en `schema.prisma` utilizando su campo opcional `groupId`.

Los grupos pueden ser referenciados simplemente con un modelo de Room, con los `Message` siendo fetcheados mediante `where: { groupId: currentRoomId }`.
