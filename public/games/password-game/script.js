const passwordInput = document.getElementById('password-input');
const rulesContainer = document.getElementById('rules-container');
const charCountDisplay = document.getElementById('char-count');
const langToggleBtn = document.getElementById('lang-toggle');
const adminToggleBtn = document.getElementById('admin-toggle');
const adminPanel = document.getElementById('admin-panel');
const addRuleBtn = document.getElementById('add-rule-btn');
const closeAdminBtn = document.getElementById('close-admin');
const subTitle = document.getElementById('subtitle');

let visibleRules = []; // Array of rule IDs currently visible
let currentLang = 'en'; // 'en' or 'es'

const uiTranslations = {
    en: {
        title: "* The Password Game *",
        subtitle: "Please choose a password",
        langBtn: "ES"
    },
    es: {
        title: "* El Juego de la Contraseña *",
        subtitle: "Por favor elige una contraseña",
        langBtn: "EN"
    }
}

// Initial Setup
function init() {
    updateGame();
    updateUI();
}

function updateUI() {
    // Update static UI elements
    const t = uiTranslations[currentLang];
    document.querySelector('h1').textContent = t.title;
    subTitle.textContent = t.subtitle;
    langToggleBtn.textContent = t.langBtn;

    // Update existing rule text
    visibleRules.forEach(id => {
        const rule = window.gameRules.find(r => r.id === id);
        if (rule) {
            const ruleEl = document.getElementById(`rule-${id}`);
            if (ruleEl) {
                const headerEl = ruleEl.querySelector('.rule-header');
                const descEl = ruleEl.querySelector('.rule-desc');

                if (headerEl) headerEl.textContent = `Rule ${rule.id}`;
                if (descEl) descEl.textContent = getRuleDesc(rule);
            }
        }
    });

    // Also need to re-render or re-sort DOM elements if IDs changed,
    // but typically we just redraw the whole container if structure changes significantly
    // to avoid complex DOM manipulation.
    // For simplicity, let's keep it additive unless we do a full re-render.
}

function getRuleDesc(rule) {
    if (rule.translations && rule.translations[currentLang]) {
        return rule.translations[currentLang];
    }
    return rule.description; // Fallback
}


// --- Game Logic ---

// Helper to convert Roman numerals
function romanToInt(s) {
    const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let result = 0;
    for (let i = 0; i < s.length; i++) {
        const curr = map[s[i]];
        const next = map[s[i + 1]];
        if (next > curr) {
            result += next - curr;
            i++;
        } else {
            result += curr;
        }
    }
    return result;
}

// Patch Rule 9 validator (reused)
const rule9 = window.gameRules.find(r => r.id === 9);
if (rule9) {
    rule9.validator = (pw) => {
        let romans = pw.match(/[IVXLCDM]+/g);
        if (!romans) return false;

        let product = 1;
        for (let roman of romans) {
            product *= romanToInt(roman);
        }
        return product === 35;
    };
}


function updateGame() {
    const password = passwordInput.value;
    charCountDisplay.textContent = password.length;

    // We need to check if the visibleRules array matches the current gameRules order/IDs
    // If we inserted a rule, IDs shifted. visibleRules might contain old IDs or be out of sync.
    // Easiest is to re-evaluate "visible" status based on logic:
    // "Show rule N if rule N-1 is satisfied".

    // However, we want to keep the "revealed" state. i.e. if rule 5 was revealed, 
    // and we insert a new rule only at 6, rule 5 stays revealed.
    // If we insert at 1, everything shifts.

    // Simple approach:
    // Clear the container and re-render everything based on current validation state
    // UP TO the first invalid rule (or the last revealed rule).
    // But animations will trigger again. 

    // Better approach:
    // Determine the "target" number of visible rules.
    // It's the index of the first rule that fails validation + 1.
    // (Or if all valid, all rules + maybe next one? No, just all).

    // Wait, the game mechanics are: 
    // You see Rule 1. Validate it -> Rule 2 appears.
    // If Rule 1 becomes invalid later, Rule 2 *stays* visible.
    // So `visibleRules` is a persistent high-water mark of progress.

    // If we insert a rule at ID X:
    // If X <= high-water mark, the new rule should probably appear immediately?
    // Let's rely on the `index === visibleRules.length` logic. 
    // But validation needs to run linearly.

    const visibleCount = visibleRules.length;
    let allPreviousValid = true;

    // Clear visibleRules and rebuild based on DOM? No, array is source of truth.
    // Problem: with ID shifting, `visibleRules` array containing simple IDs [1, 2, 3] 
    // might now refer to different rules if we changed IDs.
    // Actually, `window.gameRules` has the IDs.

    // Check if we need to full re-render because of structural changes (admin add).
    // If so, handled in addRule logic.

    window.gameRules.forEach((rule, index) => {
        let isSatisfied = false;
        try {
            isSatisfied = rule.validator(password);
        } catch (e) {
            isSatisfied = false;
        }

        // Check if this rule is currently rendered in DOM
        const ruleEl = document.getElementById(`rule-${rule.id}`);
        // Also check if we *should* consider it "visible" (unlocked)
        // It is unlocked if: It was already unlocked OR (previous rules are valid AND it's next)

        let isVisible = false;
        if (ruleEl) {
            isVisible = true;
        } else if (allPreviousValid && index === visibleCount) {
            // Unlock new rule!
            addRuleUI(rule);
            visibleRules.push(rule.id);
            isVisible = true;
        }

        if (isVisible) {
            updateRuleUI(rule, isSatisfied);
            if (!isSatisfied) allPreviousValid = false;
        }
    });
}

function addRuleUI(rule) {
    if (document.getElementById(`rule-${rule.id}`)) return; // Prevent duplicates

    const div = document.createElement('div');
    div.className = 'rule-box invalid';
    div.id = `rule-${rule.id}`;

    div.innerHTML = `
        <div class="rule-header">Rule ${rule.id}</div>
        <div class="rule-desc">${getRuleDesc(rule)}</div>
    `;

    // Correct insertion order in DOM
    // Container is flex-column-reverse.
    // rule-1 is at bottom. rule-2 above it.
    // DOM order: rule-1, rule-2...
    // So appending adds to the "top" visually.

    // But if we inserted a rule in the middle (e.g., ID 5 created, old 5 becomes 6),
    // we need to re-render the whole container to fix order?
    // Yes, simpler to just re-render all visible rules if IDs shifted.

    // If simple append:
    rulesContainer.appendChild(div);
}

function fullReRender() {
    rulesContainer.innerHTML = '';
    // Re-add all supposedly visible rules in order
    // But we need to check if they should still be visible?
    // Let's just re-add everything up to `visibleRules.length`

    // Actually, when IDs shift, we probably just want to reset `visibleRules` 
    // to match the new count OR reset high-water mark?
    // Let's reset visibleRules to [] and let `updateGame` rebuild the UI naturally.
    visibleRules = [];
    updateGame();
}


function updateRuleUI(rule, isValid) {
    const el = document.getElementById(`rule-${rule.id}`);
    if (!el) return;

    if (isValid) {
        el.classList.remove('invalid');
        el.classList.add('valid');
    } else {
        el.classList.remove('valid');
        el.classList.add('invalid');
    }
}

// --- Event Listeners ---

passwordInput.addEventListener('input', updateGame);

langToggleBtn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'es' : 'en';
    updateUI();
});

adminToggleBtn.addEventListener('click', () => {
    adminPanel.classList.toggle('hidden');
});

const closeAdminBtnEl = document.getElementById('close-admin'); // Fixed var name
if (closeAdminBtnEl) {
    closeAdminBtnEl.addEventListener('click', () => {
        adminPanel.classList.add('hidden');
    });
}

const addRuleBtnEl = document.getElementById('add-rule-btn'); // Fixed var name
if (addRuleBtnEl) {
    addRuleBtnEl.addEventListener('click', () => {
        const idInput = document.getElementById('new-rule-id').value.trim();
        const descEn = document.getElementById('new-rule-desc-en').value.trim();
        const descEs = document.getElementById('new-rule-desc-es').value.trim();
        const regexStr = document.getElementById('new-rule-regex').value.trim();

        if (!descEn || !regexStr) {
            alert("Please fill in English Description and Regex");
            return;
        }

        try {
            const regex = new RegExp(regexStr);
            let targetId = parseInt(idInput);

            // If targetId provided, shift rules
            if (targetId && targetId > 0) {
                // Check if valid
                if (targetId > window.gameRules.length + 1) targetId = window.gameRules.length + 1;

                // Shift existing rules
                window.gameRules.forEach(r => {
                    if (r.id >= targetId) {
                        r.id++;
                    }
                });
            } else {
                targetId = window.gameRules.length + 1;
            }

            const newRule = {
                id: targetId,
                description: descEn,
                translations: {
                    en: descEn,
                    es: descEs || descEn
                },
                validator: (pw) => regex.test(pw)
            };

            window.gameRules.push(newRule);
            // Sort by ID
            window.gameRules.sort((a, b) => a.id - b.id);

            // Clear inputs
            document.getElementById('new-rule-id').value = '';
            document.getElementById('new-rule-desc-en').value = '';
            document.getElementById('new-rule-desc-es').value = '';
            document.getElementById('new-rule-regex').value = '';

            alert(`Rule added at Position ${targetId}!`);

            // Trigger full refresh to handle re-ordering and ID updates
            fullReRender();

        } catch (e) {
            alert("Error: " + e.message);
        }
    });
}

// Listen for messages from parent (NealFun wrapper)
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'LANGUAGE_CHANGE') {
        const newLang = event.data.language;
        if (newLang === 'en' || newLang === 'es') {
            currentLang = newLang;
            updateUI();
        }
    }
});

// Auto-translate simulation
const descEsInput = document.getElementById('new-rule-desc-es');
const descEnInput = document.getElementById('new-rule-desc-en');

if (descEsInput && descEnInput) {
    descEsInput.addEventListener('blur', () => {
        if (descEsInput.value && !descEnInput.value) {
            // Mock translation: Just append "(Translated)" or simple mapping
            // In a real app, this would call an API.
            // For fun, let's try some simple heuristics or just placeholders.
            const val = descEsInput.value;
            let translated = val
                .replace(/tu contraseña/i, "your password")
                .replace(/debe/i, "must")
                .replace(/contener/i, "contain")
                .replace(/incluir/i, "include")
                .replace(/al menos/i, "at least")
                .replace(/numero/i, "number")
                .replace(/caracter/i, "character")
                .replace(/la suma/i, "the sum")
                .replace(/es/i, "is");

            if (translated === val) {
                translated = val + " (EN)";
            }
            descEnInput.value = translated;
        }
    });
}

// Start
init();
