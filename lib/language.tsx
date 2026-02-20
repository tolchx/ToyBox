"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string>) => string;
}

const translations: Record<string, Record<string, string>> = {
    en: {
        // General
        "title": "ToyBox",
        "subtitle": "A digital toy box full of interactive web experiments.",
        "footer": "© {year} ToyBox. All rights reserved.",

        // Hero
        "hero_badge": "Interactive Web Playground",
        "hero_subtitle": "Explore a universe of creative experiments, physics toys, AI games, and mind-bending challenges. Zero friction, pure fun.",
        "search_placeholder": "Search games, categories, or tags...",
        "stat_games": "games",
        "stat_categories": "categories",
        "stat_new": "new",
        "showing_games": "Showing {count} games",
        "clear_filters": "Clear filters",
        "no_results_title": "No games found",
        "no_results_desc": "Try a different search or category.",

        // Navbar
        "back": "← Back to ToyBox",
        "admin_panel": "Admin Panel",
        "premium_label": "PREMIUM",
        "free_label": "FREE",
        "switch_light": "Switch to light mode",
        "switch_dark": "Switch to dark mode",

        // Admin page
        "add_game": "Add Game",
        "admin_title_label": "Title",
        "admin_title_placeholder": "My New Game",
        "admin_desc_label": "Description",
        "admin_desc_placeholder": "Describe your game...",
        "admin_path_label": "Game URL / Path",
        "admin_path_placeholder": "/games/my-game/index.html or https://...",
        "admin_path_hint": "For local games, place folder in public/games/ and use path /games/folder/index.html",
        "admin_submit": "Add Game to Library",
        "admin_manage": "Manage Games",
        "admin_delete": "Delete",
        "admin_confirm_delete": "Are you sure you want to delete this game?",
        "admin_game_added": "Game added!",
        "game_hidden": "Game hidden",
        "confirm_hide": "Hide this game from your library?",
        "confirm_delete_global": "DELETE GLOBALLY? This will remove the game for ALL users.",

        // Login page
        "login_title": "Admin Login",
        "login_username": "Username",
        "login_password": "Password",
        "login_submit": "Login",
        "login_error": "Invalid credentials (try admin/admin)",

        // Play page
        "premium_controls": "👑 Premium Controls",
        "bg_image_label": "Background Image URL",
        "music_label": "Music (YouTube Embed)",
        "music_placeholder": "Video ID (e.g. dQw4w9WgXcQ)",

        // Music Player
        "global_player": "♫ Global Player",
        "playing": "Playing:",
        "no_track": "No Track",
        "queue": "Queue",
        "queue_empty": "Queue is empty. Add a YouTube link!",
        "paste_youtube": "Paste YouTube URL...",
        "add": "Add",
        "previous": "Previous",
        "next": "Next",
        "play_pause": "Play/Pause",
        "pip": "Picture-in-Picture",
        "pip_exit": "Exit Picture-in-Picture",
        "video_controls": "Video Player Controls Below",
        "invalid_url": "Invalid YouTube URL or ID",
        "parse_error": "Could not parse URL",
        "pip_not_supported": "Picture-in-Picture is not supported in this browser. Use Chrome 116+ for best support.",

        // Infinite Craft elements
        "water": "Water",
        "fire": "Fire",
        "earth": "Earth",
        "wind": "Wind",

        // Spend Money game
        "spend_title": "Spend All The Money",
        "spend_budget": "Your Budget",
        "spend_total_spent": "Total Spent",
        "spend_remaining": "Remaining",
        "spend_reset": "Reset All",
        "spend_receipt": "Your Receipt",
        "spend_empty_cart": "Start shopping! Click + to buy items.",
        "spend_share": "Share Result",

        // Perfect Alignment game
        "align_title": "Perfect Alignment",
        "align_score": "Score",
        "align_level": "Level",
        "align_instruction": "Drag to straighten the object. Get as close to perfect as possible!",
        "align_perfect": "PERFECT!",
        "align_close": "So close!",
        "align_next": "Next Level",
        "align_accuracy": "Accuracy",

        // Loading Simulator game
        "load_title": "Loading Simulator",
        "load_progress": "Progress",
        "load_dismiss": "DISMISS",
        "load_close": "X",
        "load_win": "Download Complete!",
        "load_restart": "Download Again",
        "load_dismissed": "Dismissed",
        "load_traps": "Traps hit",
        "load_active": "Active",
        "load_close_popups": "Close all popups to continue downloading!",
        "load_fake_hint": "Something feels off about that X button...",

        // Dead Pixel game
        "pixel_title": "The Dead Pixel",
        "pixel_instruction": "Find the pixel that's slightly different. Click on it!",
        "pixel_found": "Found it!",
        "pixel_time": "Time",
        "pixel_level": "Level",
        "pixel_next": "Next Level",
        "pixel_clicks": "Clicks",

        // Mouse Balancer game
        "mouse_title": "Mouse Balancer",
        "mouse_instruction": "Keep your cursor on the path! Don't touch the edges.",
        "mouse_score": "Score",
        "mouse_best": "Best",
        "mouse_start": "Hover here to start",
        "mouse_gameover": "Game Over!",
        "mouse_retry": "Try Again",
    },
    es: {
        // General
        "title": "ToyBox",
        "subtitle": "Una caja de juguetes digital llena de experimentos web interactivos.",
        "footer": "© {year} ToyBox. Todos los derechos reservados.",

        // Hero
        "hero_badge": "Playground Web Interactivo",
        "hero_subtitle": "Explora un universo de experimentos creativos, juguetes de física, juegos de IA y desafíos alucinantes. Sin fricción, pura diversión.",
        "search_placeholder": "Buscar juegos, categorías o etiquetas...",
        "stat_games": "juegos",
        "stat_categories": "categorías",
        "stat_new": "nuevos",
        "showing_games": "Mostrando {count} juegos",
        "clear_filters": "Limpiar filtros",
        "no_results_title": "No se encontraron juegos",
        "no_results_desc": "Prueba con otra búsqueda o categoría.",

        // Navbar
        "back": "← Volver a ToyBox",
        "admin_panel": "Panel de Admin",
        "premium_label": "PREMIUM",
        "free_label": "GRATIS",
        "switch_light": "Cambiar a modo claro",
        "switch_dark": "Cambiar a modo oscuro",

        // Admin page
        "add_game": "Agregar Juego",
        "admin_title_label": "Título",
        "admin_title_placeholder": "Mi Nuevo Juego",
        "admin_desc_label": "Descripción",
        "admin_desc_placeholder": "Describe tu juego...",
        "admin_path_label": "URL / Ruta del Juego",
        "admin_path_placeholder": "/games/mi-juego/index.html o https://...",
        "admin_path_hint": "Para juegos locales, coloca la carpeta en public/games/ y usa la ruta /games/carpeta/index.html",
        "admin_submit": "Agregar Juego a la Biblioteca",
        "admin_manage": "Administrar Juegos",
        "admin_delete": "Eliminar",
        "admin_confirm_delete": "¿Estás seguro de que quieres eliminar este juego?",
        "admin_game_added": "¡Juego agregado!",
        "game_hidden": "Juego oculto",
        "confirm_hide": "¿Ocultar este juego de tu biblioteca?",
        "confirm_delete_global": "¿ELIMINAR GLOBALMENTE? Esto borrará el juego para TODOS los usuarios.",

        // Login page
        "login_title": "Inicio de Sesión Admin",
        "login_username": "Usuario",
        "login_password": "Contraseña",
        "login_submit": "Iniciar Sesión",
        "login_error": "Credenciales inválidas (prueba admin/admin)",

        // Play page
        "premium_controls": "👑 Controles Premium",
        "bg_image_label": "URL de Imagen de Fondo",
        "music_label": "Música (YouTube Embed)",
        "music_placeholder": "ID del Video (ej. dQw4w9WgXcQ)",

        // Music Player
        "global_player": "♫ Reproductor Global",
        "playing": "Reproduciendo:",
        "no_track": "Sin Pista",
        "queue": "Cola",
        "queue_empty": "La cola está vacía. ¡Agrega un enlace de YouTube!",
        "paste_youtube": "Pega URL de YouTube...",
        "add": "Agregar",
        "previous": "Anterior",
        "next": "Siguiente",
        "play_pause": "Reproducir/Pausar",
        "pip": "Imagen en Imagen",
        "pip_exit": "Salir de Imagen en Imagen",
        "video_controls": "Controles del Reproductor de Video Abajo",
        "invalid_url": "URL o ID de YouTube inválido",
        "parse_error": "No se pudo analizar la URL",
        "pip_not_supported": "Imagen en Imagen no es compatible con este navegador. Usa Chrome 116+ para mejor soporte.",

        // Infinite Craft elements
        "water": "Agua",
        "fire": "Fuego",
        "earth": "Tierra",
        "wind": "Viento",

        // Spend Money game
        "spend_title": "Gasta Todo El Dinero",
        "spend_budget": "Tu Presupuesto",
        "spend_total_spent": "Total Gastado",
        "spend_remaining": "Restante",
        "spend_reset": "Reiniciar Todo",
        "spend_receipt": "Tu Recibo",
        "spend_empty_cart": "¡Empieza a comprar! Haz clic en + para comprar.",
        "spend_share": "Compartir Resultado",

        // Perfect Alignment game
        "align_title": "Alineación Perfecta",
        "align_score": "Puntuación",
        "align_level": "Nivel",
        "align_instruction": "Arrastra para enderezar el objeto. ¡Acércate lo más posible a la perfección!",
        "align_perfect": "¡PERFECTO!",
        "align_close": "¡Casi!",
        "align_next": "Siguiente Nivel",
        "align_accuracy": "Precisión",

        // Loading Simulator game
        "load_title": "Simulador de Carga",
        "load_progress": "Progreso",
        "load_dismiss": "CERRAR",
        "load_close": "X",
        "load_win": "¡Descarga Completa!",
        "load_restart": "Descargar de Nuevo",
        "load_dismissed": "Cerrados",
        "load_traps": "Trampas",
        "load_active": "Activos",
        "load_close_popups": "¡Cierra todos los popups para continuar la descarga!",
        "load_fake_hint": "Algo raro tiene ese botón X...",

        // Dead Pixel game
        "pixel_title": "El Píxel Muerto",
        "pixel_instruction": "Encuentra el píxel que es ligeramente diferente. ¡Haz clic en él!",
        "pixel_found": "¡Encontrado!",
        "pixel_time": "Tiempo",
        "pixel_level": "Nivel",
        "pixel_next": "Siguiente Nivel",
        "pixel_clicks": "Clics",

        // Mouse Balancer game
        "mouse_title": "Equilibrista de Ratón",
        "mouse_instruction": "¡Mantén tu cursor en el camino! No toques los bordes.",
        "mouse_score": "Puntuación",
        "mouse_best": "Mejor",
        "mouse_start": "Pasa el cursor aquí para empezar",
        "mouse_gameover": "¡Fin del Juego!",
        "mouse_retry": "Intentar de Nuevo",
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('es'); // Default to Spanish as per user request context (the prompt is in Spanish)

    const t = (key: string, params?: Record<string, string>) => {
        let text = translations[language]?.[key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, v);
            });
        }
        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
