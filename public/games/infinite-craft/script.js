// Infinite Craft - Main Game Logic

let discoveredElements = [];
let canvasElements = [];
let nextCanvasId = 0;
let dragState = null;
let searchQuery = "";
let currentLanguage = "es"; // Default language, updated via postMessage from parent

// Listen for language changes from parent frame
window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "LANGUAGE_CHANGE" && event.data.language) {
        currentLanguage = event.data.language;
    }
});

// Initialize game
function init() {
    loadState();
    if (discoveredElements.length === 0) {
        discoveredElements = BASE_ELEMENTS.map(e => ({ ...e }));
    }
    renderSidebar();
    renderCanvas();
    setupEventListeners();
}

// Save/Load state from localStorage
function saveState() {
    localStorage.setItem("infinite-craft-discovered", JSON.stringify(discoveredElements));
    localStorage.setItem("infinite-craft-canvas", JSON.stringify(canvasElements));
    localStorage.setItem("infinite-craft-nextId", nextCanvasId.toString());
}

function loadState() {
    try {
        const saved = localStorage.getItem("infinite-craft-discovered");
        const savedCanvas = localStorage.getItem("infinite-craft-canvas");
        const savedId = localStorage.getItem("infinite-craft-nextId");
        if (saved) discoveredElements = JSON.parse(saved);
        if (savedCanvas) canvasElements = JSON.parse(savedCanvas);
        if (savedId) nextCanvasId = parseInt(savedId);
    } catch (e) {
        console.error("Failed to load state:", e);
    }
}

// Render sidebar elements
function renderSidebar() {
    const container = document.getElementById("sidebar-elements");
    const countEl = document.getElementById("element-count");

    const sorted = [...discoveredElements].sort((a, b) => a.name.localeCompare(b.name));
    const filtered = searchQuery
        ? sorted.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : sorted;

    countEl.textContent = `${discoveredElements.length} elements`;

    container.innerHTML = "";
    filtered.forEach(el => {
        const div = document.createElement("div");
        div.className = "sidebar-element";
        div.setAttribute("data-name", el.name);
        div.setAttribute("data-emoji", el.emoji);
        div.draggable = false; // We handle drag manually
        div.innerHTML = `<span class="emoji">${el.emoji}</span><span class="name">${el.name}</span>`;

        // Mouse down to start drag from sidebar
        div.addEventListener("mousedown", (e) => startSidebarDrag(e, el));
        div.addEventListener("touchstart", (e) => startSidebarDragTouch(e, el), { passive: false });

        container.appendChild(div);
    });
}

// Render canvas elements
function renderCanvas() {
    const canvas = document.getElementById("canvas");
    // Remove old canvas elements
    canvas.querySelectorAll(".canvas-element").forEach(el => el.remove());

    canvasElements.forEach(el => {
        createCanvasElementDOM(el);
    });
}

function createCanvasElementDOM(el, isNew = false, isFirstDiscovery = false) {
    const canvas = document.getElementById("canvas");
    const div = document.createElement("div");
    div.className = "canvas-element" + (isNew ? " new-element" : "") + (isFirstDiscovery ? " first-discovery" : "");
    div.setAttribute("data-id", el.id);
    div.style.left = el.x + "px";
    div.style.top = el.y + "px";
    div.innerHTML = `<span class="emoji">${el.emoji}</span><span class="name">${el.name}</span>`;

    div.addEventListener("mousedown", (e) => startCanvasDrag(e, el.id));
    div.addEventListener("touchstart", (e) => startCanvasDragTouch(e, el.id), { passive: false });

    canvas.appendChild(div);
    return div;
}

// Add element to canvas
function addToCanvas(name, emoji, x, y, isNew = false, isFirstDiscovery = false) {
    const el = { id: nextCanvasId++, name, emoji, x, y };
    canvasElements.push(el);
    const dom = createCanvasElementDOM(el, isNew, isFirstDiscovery);
    saveState();
    return { el, dom };
}

// Remove element from canvas
function removeFromCanvas(id) {
    canvasElements = canvasElements.filter(e => e.id !== id);
    const dom = document.querySelector(`.canvas-element[data-id="${id}"]`);
    if (dom) dom.remove();
    saveState();
}

// Get recipe result (try both orderings since keys aren't always sorted)
function getRecipeResult(name1, name2) {
    const key1 = name1 + "+" + name2;
    const key2 = name2 + "+" + name1;
    return RECIPES[key1] || RECIPES[key2] || null;
}

// Check if element is already discovered
function isDiscovered(name) {
    return discoveredElements.some(e => e.name === name);
}

// Discover new element
function discoverElement(name, emoji) {
    if (!isDiscovered(name)) {
        discoveredElements.push({ name, emoji });
        renderSidebar();
        saveState();
        return true; // first discovery
    }
    return false;
}

// Text-to-Speech: speak the name of a newly created element
function speakElementName(name) {
    if (!('speechSynthesis' in window)) return;
    // Cancel any ongoing speech to avoid overlap
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(name);
    utterance.lang = currentLanguage === 'es' ? 'es-ES' : 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
}

// Combine two elements
function combineElements(id1, id2) {
    const el1 = canvasElements.find(e => e.id === id1);
    const el2 = canvasElements.find(e => e.id === id2);
    if (!el1 || !el2) return;

    const result = getRecipeResult(el1.name, el2.name);
    if (!result) {
        // No recipe - shake animation
        const dom2 = document.querySelector(`.canvas-element[data-id="${id2}"]`);
        if (dom2) {
            dom2.style.transition = "transform 0.1s";
            dom2.style.transform = "translateX(-5px)";
            setTimeout(() => { dom2.style.transform = "translateX(5px)"; }, 100);
            setTimeout(() => { dom2.style.transform = "translateX(0)"; }, 200);
            setTimeout(() => { dom2.style.transition = ""; }, 300);
        }
        return;
    }

    // Calculate position for new element (midpoint)
    const newX = (el1.x + el2.x) / 2;
    const newY = (el1.y + el2.y) / 2;

    // Remove both elements
    removeFromCanvas(id1);
    removeFromCanvas(id2);

    // Check if first discovery
    const isFirst = discoverElement(result.name, result.emoji);

    // Add result to canvas
    addToCanvas(result.name, result.emoji, newX, newY, true, isFirst);

    // Speak the name of the newly created element
    speakElementName(result.name);

    // Show toast if first discovery
    if (isFirst) {
        showDiscoveryToast(result.name, result.emoji);
    }
}

// Show discovery toast
function showDiscoveryToast(name, emoji) {
    const toast = document.getElementById("discovery-toast");
    toast.innerHTML = `<span class="badge">First Discovery!</span> ${emoji} ${name}`;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

// ==================== DRAG & DROP ====================

function startSidebarDrag(e, element) {
    e.preventDefault();
    const canvas = document.getElementById("canvas");
    const canvasRect = canvas.getBoundingClientRect();

    // Create a floating clone
    const clone = document.createElement("div");
    clone.className = "canvas-element dragging";
    clone.innerHTML = `<span class="emoji">${element.emoji}</span><span class="name">${element.name}</span>`;
    clone.style.position = "fixed";
    clone.style.left = (e.clientX - 40) + "px";
    clone.style.top = (e.clientY - 15) + "px";
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    document.body.appendChild(clone);

    dragState = {
        type: "sidebar",
        element: element,
        clone: clone,
        startX: e.clientX,
        startY: e.clientY,
    };

    showTrashZone();
}

function startSidebarDragTouch(e, element) {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = document.getElementById("canvas");

    const clone = document.createElement("div");
    clone.className = "canvas-element dragging";
    clone.innerHTML = `<span class="emoji">${element.emoji}</span><span class="name">${element.name}</span>`;
    clone.style.position = "fixed";
    clone.style.left = (touch.clientX - 40) + "px";
    clone.style.top = (touch.clientY - 15) + "px";
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    document.body.appendChild(clone);

    dragState = {
        type: "sidebar",
        element: element,
        clone: clone,
        startX: touch.clientX,
        startY: touch.clientY,
    };

    showTrashZone();
}

function startCanvasDrag(e, canvasId) {
    e.preventDefault();
    e.stopPropagation();

    const el = canvasElements.find(ce => ce.id === canvasId);
    if (!el) return;

    const dom = document.querySelector(`.canvas-element[data-id="${canvasId}"]`);
    if (!dom) return;

    dom.classList.add("dragging");

    dragState = {
        type: "canvas",
        canvasId: canvasId,
        dom: dom,
        offsetX: e.clientX - dom.getBoundingClientRect().left,
        offsetY: e.clientY - dom.getBoundingClientRect().top,
        startX: e.clientX,
        startY: e.clientY,
    };

    showTrashZone();
}

function startCanvasDragTouch(e, canvasId) {
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    const el = canvasElements.find(ce => ce.id === canvasId);
    if (!el) return;

    const dom = document.querySelector(`.canvas-element[data-id="${canvasId}"]`);
    if (!dom) return;

    dom.classList.add("dragging");

    dragState = {
        type: "canvas",
        canvasId: canvasId,
        dom: dom,
        offsetX: touch.clientX - dom.getBoundingClientRect().left,
        offsetY: touch.clientY - dom.getBoundingClientRect().top,
        startX: touch.clientX,
        startY: touch.clientY,
    };

    showTrashZone();
}

function onMouseMove(e) {
    if (!dragState) return;

    if (dragState.type === "sidebar") {
        dragState.clone.style.left = (e.clientX - 40) + "px";
        dragState.clone.style.top = (e.clientY - 15) + "px";
    } else if (dragState.type === "canvas") {
        const canvas = document.getElementById("canvas");
        const canvasRect = canvas.getBoundingClientRect();
        const newX = e.clientX - canvasRect.left - dragState.offsetX;
        const newY = e.clientY - canvasRect.top - dragState.offsetY;

        dragState.dom.style.left = newX + "px";
        dragState.dom.style.top = newY + "px";

        // Update data
        const el = canvasElements.find(ce => ce.id === dragState.canvasId);
        if (el) {
            el.x = newX;
            el.y = newY;
        }

        // Highlight nearby elements
        highlightNearby(dragState.canvasId, e.clientX, e.clientY);
    }
}

function onTouchMove(e) {
    if (!dragState) return;
    e.preventDefault();

    const touch = e.touches[0];

    if (dragState.type === "sidebar") {
        dragState.clone.style.left = (touch.clientX - 40) + "px";
        dragState.clone.style.top = (touch.clientY - 15) + "px";
    } else if (dragState.type === "canvas") {
        const canvas = document.getElementById("canvas");
        const canvasRect = canvas.getBoundingClientRect();
        const newX = touch.clientX - canvasRect.left - dragState.offsetX;
        const newY = touch.clientY - canvasRect.top - dragState.offsetY;

        dragState.dom.style.left = newX + "px";
        dragState.dom.style.top = newY + "px";

        const el = canvasElements.find(ce => ce.id === dragState.canvasId);
        if (el) {
            el.x = newX;
            el.y = newY;
        }

        highlightNearby(dragState.canvasId, touch.clientX, touch.clientY);
    }
}

function onMouseUp(e) {
    if (!dragState) return;

    hideTrashZone();
    clearHighlights();

    if (dragState.type === "sidebar") {
        dragState.clone.remove();

        const canvas = document.getElementById("canvas");
        const canvasRect = canvas.getBoundingClientRect();

        // Check if dropped on canvas
        if (e.clientX >= canvasRect.left && e.clientX <= canvasRect.right &&
            e.clientY >= canvasRect.top && e.clientY <= canvasRect.bottom) {
            const x = e.clientX - canvasRect.left - 40;
            const y = e.clientY - canvasRect.top - 15;

            // Check if dropped on existing canvas element
            const target = findCanvasElementAt(e.clientX, e.clientY);
            if (target) {
                // Create temp element and combine
                const { el } = addToCanvas(dragState.element.name, dragState.element.emoji, x, y);
                combineElements(el.id, target.id);
            } else {
                addToCanvas(dragState.element.name, dragState.element.emoji, x, y);
            }
        }
    } else if (dragState.type === "canvas") {
        dragState.dom.classList.remove("dragging");

        // Check if dropped in trash zone
        const trashZone = document.getElementById("trash-zone");
        const trashRect = trashZone.getBoundingClientRect();
        if (e.clientX >= trashRect.left && e.clientX <= trashRect.right &&
            e.clientY >= trashRect.top && e.clientY <= trashRect.bottom) {
            removeFromCanvas(dragState.canvasId);
        } else {
            // Check overlap with another canvas element
            const target = findCanvasElementAt(e.clientX, e.clientY, dragState.canvasId);
            if (target) {
                combineElements(dragState.canvasId, target.id);
            } else {
                saveState();
            }
        }
    }

    dragState = null;
}

function onTouchEnd(e) {
    if (!dragState) return;

    hideTrashZone();
    clearHighlights();

    const touch = e.changedTouches[0];

    if (dragState.type === "sidebar") {
        dragState.clone.remove();

        const canvas = document.getElementById("canvas");
        const canvasRect = canvas.getBoundingClientRect();

        if (touch.clientX >= canvasRect.left && touch.clientX <= canvasRect.right &&
            touch.clientY >= canvasRect.top && touch.clientY <= canvasRect.bottom) {
            const x = touch.clientX - canvasRect.left - 40;
            const y = touch.clientY - canvasRect.top - 15;

            const target = findCanvasElementAt(touch.clientX, touch.clientY);
            if (target) {
                const { el } = addToCanvas(dragState.element.name, dragState.element.emoji, x, y);
                combineElements(el.id, target.id);
            } else {
                addToCanvas(dragState.element.name, dragState.element.emoji, x, y);
            }
        }
    } else if (dragState.type === "canvas") {
        dragState.dom.classList.remove("dragging");

        const trashZone = document.getElementById("trash-zone");
        const trashRect = trashZone.getBoundingClientRect();
        if (touch.clientX >= trashRect.left && touch.clientX <= trashRect.right &&
            touch.clientY >= trashRect.top && touch.clientY <= trashRect.bottom) {
            removeFromCanvas(dragState.canvasId);
        } else {
            const target = findCanvasElementAt(touch.clientX, touch.clientY, dragState.canvasId);
            if (target) {
                combineElements(dragState.canvasId, target.id);
            } else {
                saveState();
            }
        }
    }

    dragState = null;
}

// Find canvas element at screen position
function findCanvasElementAt(clientX, clientY, excludeId = null) {
    const elements = document.querySelectorAll(".canvas-element");
    for (const dom of elements) {
        const id = parseInt(dom.getAttribute("data-id"));
        if (id === excludeId) continue;

        const rect = dom.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right &&
            clientY >= rect.top && clientY <= rect.bottom) {
            return canvasElements.find(e => e.id === id);
        }
    }
    return null;
}

// Highlight nearby canvas elements when dragging
function highlightNearby(dragId, clientX, clientY) {
    clearHighlights();
    const elements = document.querySelectorAll(".canvas-element");
    for (const dom of elements) {
        const id = parseInt(dom.getAttribute("data-id"));
        if (id === dragId) continue;

        const rect = dom.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.sqrt((clientX - centerX) ** 2 + (clientY - centerY) ** 2);

        if (dist < 80) {
            dom.classList.add("highlight");
        }
    }
}

function clearHighlights() {
    document.querySelectorAll(".canvas-element.highlight").forEach(el => {
        el.classList.remove("highlight");
    });
}

function showTrashZone() {
    document.getElementById("trash-zone").classList.add("visible");
}

function hideTrashZone() {
    document.getElementById("trash-zone").classList.remove("visible");
}

// Clear all canvas elements
function clearCanvas() {
    canvasElements = [];
    nextCanvasId = 0;
    const canvas = document.getElementById("canvas");
    canvas.querySelectorAll(".canvas-element").forEach(el => el.remove());
    saveState();
}

// Reset entire game
function resetGame() {
    if (confirm("Reset all progress? This will clear all discoveries and start fresh.")) {
        discoveredElements = BASE_ELEMENTS.map(e => ({ ...e }));
        canvasElements = [];
        nextCanvasId = 0;
        localStorage.removeItem("infinite-craft-discovered");
        localStorage.removeItem("infinite-craft-canvas");
        localStorage.removeItem("infinite-craft-nextId");
        renderSidebar();
        renderCanvas();
    }
}

// Setup event listeners
function setupEventListeners() {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);

    // Search
    document.getElementById("search-box").addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderSidebar();
    });

    // Clear canvas button
    document.getElementById("clear-btn").addEventListener("click", clearCanvas);

    // Reset button
    document.getElementById("reset-btn").addEventListener("click", resetGame);

    // Prevent context menu on canvas
    document.getElementById("canvas").addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });

    // Double-click on canvas to remove element
    document.getElementById("canvas").addEventListener("dblclick", (e) => {
        const target = findCanvasElementAt(e.clientX, e.clientY);
        if (target) {
            removeFromCanvas(target.id);
        }
    });
}

// Start game when DOM is ready
document.addEventListener("DOMContentLoaded", init);
