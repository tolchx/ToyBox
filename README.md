# 🎮 ToyBox - Interactive Web Playground

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> Una caja de juguetes digital llena de experimentos web interactivos, física, IA y desafíos mentales. Sin fricción, pura diversión.

---

## 📖 Descripción del Proyecto

**ToyBox** es un playground web interactivo que alberga una colección diversa de juegos y experimentos digitales. Inspirado en plataformas como Neal.fun, este proyecto ofrece experiencias únicas que van desde simuladores de física hasta desafíos de habilidad, pasando por juegos basados en IA y visualizaciones de datos a escala cósmica.

### 🌟 Características Principales

- **18+ Juegos Únicos**: Cada juego es una experiencia completamente diferente
- **6 Categorías Temáticas**: Organizadas por tipo de gameplay
- **Bilingüe**: Soporte completo para inglés y español
- **Modo Oscuro/Claro**: Interfaz adaptable a tus preferencias
- **Sistema de Premium**: Controles adicionales para usuarios premium
- **Panel de Administración**: Gestión dinámica de juegos
- **Reproductor Global de Música**: Música de fondo mientras juegas
- **Diseño Responsivo**: Funciona perfectamente en todos los dispositivos

---

## 🎮 Categorías de Juegos

### ⚡ Modo Dios (God Mode)
Controla fuerzas omnipotentes y observa las consecuencias.

- **Pocket Ecosystem** 🦠: Crea y observa vida evolucionar en una grilla
- **Chaos Conductor** 🌪️: Controla el clima de una ciudad (lluvia, sol, tornados, invasiones alienígenas)
- **Spend All The Money** 💰: ¿Puedes gastar $100 mil millones?

### 🧲 Juguetes de Física (Physics Toys)
Experimenta con las leyes de la física de manera interactiva.

- **Precarious Architect** 🏗️: Apila formas irregulares lo más alto posible
- **Orbital Slingshot** 🚀: Domina la mecánica orbital para lanzar sondas

### 📊 Datos y Escala (Data & Scale)
Visualiza conceptos a escala cósmica y temporal.

- **The Infinite Timeline** ⏳: Viaja desde el Big Bang hasta la muerte térmica del universo
- **Speed of Light Voyager** 💫: Viaja a la velocidad de luz y observa el cosmos en tiempo real

### 🤖 IA y Texto (AI & Text)
Interactúa con inteligencia artificial de formas creativas.

- **Infinite Craft** ✨: Combina elementos para descubrir nuevos (Agua, Fuego, Tierra, Viento)
- **AI Lie Detector** 🔍: Cuenta historias y deja que la IA determine si mientes
- **Infinite Debate** 🎭: Genera debates épicos entre personajes seleccionados

### 🎯 Habilidad y Dolor (Skill & Pain)
Desafía tu precisión y paciencia con juegos de alta dificultad.

- **Perfect Alignment** 📐: Alinea objetos con precisión al píxel
- **The Dead Pixel** 🔲: Encuentra el único píxel diferente
- **Loading Simulator** ⏳: Lleva la barra de carga al 100% evitando popups y errores
- **Mouse Balancer** 🖱️: Mantén el cursor en caminos que se mueven y encogen

### 🌍 Geografía (Geography)
Explora el mundo a través de experiencias sensoriales.

- **City Guesser Audio** 🎧: Identifica ciudades por sus sonidos ambientales

---

## 💎 Sistema de Usuarios

### 🆓 Usuarios Free
- Acceso completo a todos los juegos
- Interfaz básica de juego
- Sin controles personalizados
- Experiencia estándar

### 👑 Usuarios Premium
- **Controles Personalizados**: 
  - Imágenes de fondo personalizadas para cada juego
  - Música de fondo desde YouTube
  - Interfaz mejorada con efectos visuales
- **Experiencia Ad-Free**: Sin interrupciones mientras juegas
- **Guardado Progresivo**: Tu progreso se guarda en la nube
- **Acceso Anticipado**: Nuevos juegos antes que los usuarios free
- **Temas Exclusivos**: Skins personalizados para la interfaz

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: React Context API
- **Internacionalización**: Sistema de traducción personalizado
- **Despliegue**: Vercel (recomendado)

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tolchx/ToyBox.git
cd ToyBox
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
# o
yarn dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
ToyBox/
├── app/                    # Páginas de Next.js
│   ├── admin/             # Panel de administración
│   ├── login/             # Página de login
│   ├── play/              # Páginas de juegos dinámicas
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── GameCard.tsx      # Tarjeta de juego
│   ├── Navbar.tsx        # Navegación
│   ├── GlobalMusicPlayer.tsx # Reproductor de música
│   └── games/             # Componentes de juegos individuales
├── lib/                   # Utilidades y configuración
│   ├── games.ts          # Definición de juegos
│   ├── language.tsx      # Sistema de traducción
│   ├── game-context.tsx  # Contexto de juegos
│   └── user-context.tsx  # Contexto de usuario
├── public/                # Archivos estáticos
│   └── games/            # Juegos HTML/CSS/JS standalone
└── README.md             # Este archivo
```

---

## 🎯 Cómo Agregar Nuevos Juegos

### Método 1: Juegos Standalone (HTML/CSS/JS)

1. Crea una carpeta en `public/games/tu-juego/`
2. Agrega tu juego con `index.html`, `style.css`, `script.js`
3. Ve al panel de administración (`/admin`)
4. Agrega el juego con la ruta `/games/tu-juego/index.html`

### Método 2: Componentes React

1. Crea un componente en `components/games/TuJuego.tsx`
2. Agrega el juego a `lib/games.ts`
3. Crea una página dinámica en `app/play/tu-juego/page.tsx`

### Ejemplo de configuración de juego:

```typescript
{
  id: "tu-juego",
  title: "Tu Juego",
  title_es: "Tu Juego en Español",
  description: "Descripción en inglés",
  description_es: "Descripción en español",
  path: "/games/tu-juego/index.html",
  category: 'skill',
  difficulty: 'medium',
  tags: ['tag1', 'tag2'],
  isNew: true,
  isFeatured: false,
  theme: {
    gradient: ['#1e1b4b', '#312e81'],
    accent: '#a78bfa',
    icon: '🎮',
    pattern: 'pattern-name',
  },
}
```

---

## 🔧 Configuración de Administración

### Acceso al Panel Admin
- URL: `/admin`
- Credenciales por defecto: `admin` / `admin`

### Funciones del Panel
- ✅ Agregar nuevos juegos dinámicamente
- ✅ Eliminar juegos existentes
- ✅ Editar metadatos de juegos
- ✅ Previsualizar juegos antes de publicar

---

## 🌍 Internacionalización

El proyecto soporta múltiples idiomas mediante un sistema de traducción personalizado.

### Idiomas Soportados
- 🇺🇸 Inglés (English)
- 🇪🇸 Español (Spanish)

### Agregar Nuevo Idioma

1. Abre `lib/language.tsx`
2. Agrega las traducciones al objeto `translations`
3. Actualiza el tipo `Language` si es necesario

```typescript
// Ejemplo de agregar francés
fr: {
  "title": "ToyBox",
  "subtitle": "Une boîte à jouets numérique...",
  // ... más traducciones
}
```

---

## 🎨 Personalización y Temas

### Sistema de Temas
Cada juego tiene un tema personalizado con:
- **Gradiente de fondo**: Colores principales del juego
- **Color de acento**: Color para elementos interactivos
- **Icono**: Emoji representativo
- **Patrón**: Nombre del patrón de fondo (opcional)

### Modo Oscuro/Claro
La interfaz se adapta automáticamente a las preferencias del sistema o permite el cambio manual mediante el interruptor en la navegación.

---

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Netlify
1. Construye el proyecto: `npm run build`
2. Sube la carpeta `.next`
3. Configura redirecciones si es necesario

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

### Cómo Contribuir
1. Fork el proyecto
2. Crea una rama: `git checkout - feature/nueva-funcionalidad`
3. Realiza tus cambios
4. Commit: `git commit -m 'Agrega nueva funcionalidad'`
5. Push: `git push origin feature/nueva-funcionalidad`
6. Abre un Pull Request

### Directrices de Contribución
- Sigue el estilo de código existente
- Agrega comentarios si es necesario
- Prueba tus cambios
- Actualiza la documentación si es requerido

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - revisa el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- **Neal.fun** - Inspiración para el concepto de playground web
- **Next.js Team** - Framework increíble para aplicaciones React
- **Tailwind CSS** - Framework de CSS utilitario
- **Comunidad Open Source** - Por todas las herramientas y librerías

---

## 📞 Contacto

- **GitHub**: [@tolchx](https://github.com/tolchx)
- **Proyecto**: https://github.com/tolchx/ToyBox
- **Demo**: https://toybox-demo.vercel.app (ejemplo)

---

## 🗺️ Roadmap

### Versión 2.0 (Próximamente)
- [ ] Sistema de logros y trofeos
- [ ] Multijugador en tiempo real
- [ ] Editor de juegos visual
- [ ] API pública para desarrolladores
- [ ] Marketplace de juegos comunitarios

### Versión 3.0 (Futuro)
- [ ] Aplicación móvil nativa
- [ ] Realidad aumentada (AR) games
- [ ] Integración con blockchain para NFTs de juegos
- [ ] IA para generar juegos automáticamente

---

<div align="center">

**🎮 ¡Disfruta explorando ToyBox! 🎮**

*Hecho con ❤️ y ☕ por [tolchx](https://github.com/tolchx)*

</div>
