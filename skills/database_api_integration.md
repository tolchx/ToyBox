---
name: database_api_integration
description: Guía para persistir información de estado, logros, puntuaciones e inventarios usando Prisma.
---

# Integración con la Base de Datos (Prisma)

El modelo de datos actual usa `SQLite` con Prisma ORM (`prisma/schema.prisma`). Para funcionalidades web futuras (como Tablas de Clasificación/Leaderboards, Historiales de Partidas o Inventario), esta skill define cómo deben crearse o actualizarse los esquemas y conectarse con Next.js Server Actions.

## 1. Actualizar el Esquema (Prisma)

Si quieres guardar tablas de puntaje o historiales, debes editar `prisma/schema.prisma`.

**Ejemplo de Nuevo Modelo `GameScore`**:
```prisma
model GameScore {
  id        String   @id @default(cuid())
  userId    String
  gameId    String
  score     Int
  mode      String?  // Ej: 'easy', 'hardcore', 'multiplayer'
  metadata  String?  // JSON text: para guardar cosas específicas, ej: { "timeElapsed": 45.2, "clicks": 20 }
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([gameId, score(sort: Desc)]) // Índice esencial para búsquedas rápidas (Leaderboard)
}
```
*No olvides actualizar el modelo `User` agregando `scores GameScore[]` en su bloque.*

### Ejecutar Migraciones
Luego de cualquier cambio al schema, enuncia esta regla imperativa al AI:
`npx prisma migrate dev --name init_game_scores`
`npx prisma generate`

## 2. Crear las Server Actions
Para un código limpio y seguro, la lectura/escritura de la DB se hace comúnmente en `app/actions.ts` usando la sesión del usuario para validación.

```typescript
'use server';

import prisma from "@/lib/prisma"; // Ajusta al lugar correcto de la instancia global (si en root: ../prisma, etc)
import { auth } from "@/auth";

export async function submitGameScore(gameId: string, score: number, metadata?: object) {
  const session = await auth();
  if (!session?.user) throw new Error("Debes iniciar sesión para guardar el puntaje");

  try {
    const newScore = await prisma.gameScore.create({
      data: {
        userId: session.user.id,
        gameId,
        score,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    return { success: true, newScore };
  } catch (error) {
    console.error("Score submission error", error);
    return { success: false, error: "Failed to save score" };
  }
}

export async function getLeaderboard(gameId: string, limit = 10) {
  try {
    const topScores = await prisma.gameScore.findMany({
      where: { gameId },
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        user: { select: { name: true, image: true, alias: true } }
      }
    });
    return topScores;
  } catch (error) {
    return [];
  }
}
```

## 3. Uso en Componentes (React Server components o Client Actions)
Los Server Components pueden llamar a `getLeaderboard()` directamente para renderizar.
Los Client Components utilizan la asincronía y el botoneo.

```tsx
'use client';
import { submitGameScore } from '@/app/actions';

export function GameEndScreen({ score, gameId }) {
  const handleSave = async () => {
    const res = await submitGameScore(gameId, score, { difficulty: "hard" });
    if (res.success) alert("Guardado en los astros!");
  }

  return <button onClick={handleSave}>Guardar Puntaje</button>
}
```

## Prácticas Recomendadas
- **Evitar Abusos**: Las llamadas a API deben ser al final de las partidas, nunca en los ciclos de renderizado.
- **Campos JSON (Metadata)**: Al estar usando SQLite (hasta que Vercel Postgres cambie el paradigma a JSONB directos), usa campos String para persistir objetos JSON flexibles si no estás seguro de la estructura final que tendrá el juego.
