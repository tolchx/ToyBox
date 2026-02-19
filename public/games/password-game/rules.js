const rules = [
    {
        id: 1,
        description: "Your password must be at least 5 characters.",
        translations: {
            en: "Your password must be at least 5 characters.",
            es: "Tu contraseña debe tener al menos 5 caracteres."
        },
        validator: (pw) => pw.length >= 5
    },
    {
        id: 2,
        description: "Your password must include a number.",
        translations: {
            en: "Your password must include a number.",
            es: "Tu contraseña debe incluir un número."
        },
        validator: (pw) => /\d/.test(pw)
    },
    {
        id: 3,
        description: "Your password must include an uppercase letter.",
        translations: {
            en: "Your password must include an uppercase letter.",
            es: "Tu contraseña debe incluir una letra mayúscula."
        },
        validator: (pw) => /[A-Z]/.test(pw)
    },
    {
        id: 4,
        description: "Your password must include a special character.",
        translations: {
            en: "Your password must include a special character.",
            es: "Tu contraseña debe incluir un carácter especial."
        },
        validator: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw)
    },
    {
        id: 5,
        description: "The digits in your password must add up to 25.",
        translations: {
            en: "The digits in your password must add up to 25.",
            es: "Los dígitos de tu contraseña deben sumar 25."
        },
        validator: (pw) => {
            const digits = pw.match(/\d/g);
            if (!digits) return false;
            const sum = digits.reduce((acc, curr) => acc + parseInt(curr), 0);
            return sum === 25;
        }
    },
    {
        id: 6,
        description: "Your password must include a month of the year.",
        translations: {
            en: "Your password must include a month of the year.",
            es: "Tu contraseña debe incluir un mes del año."
        },
        validator: (pw) => {
            const monthsEn = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
            const monthsEs = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

            // Check both languages regardless of current setting? 
            // Or only current language? The original game usually strict about exact strings.
            // Let's allow either for better UX, or strictly check valid months in ANY supported lang.
            const lower = pw.toLowerCase();
            return monthsEn.some(m => lower.includes(m)) || monthsEs.some(m => lower.includes(m));
        }
    },
    {
        id: 7,
        description: "Your password must include a roman numeral.",
        translations: {
            en: "Your password must include a roman numeral.",
            es: "Tu contraseña debe incluir un número romano."
        },
        validator: (pw) => /[IVXLCDM]/.test(pw)
    },
    {
        id: 8,
        description: "Your password must include one of our sponsors: Pepsi, Starbucks, or Shell.",
        translations: {
            en: "Your password must include one of our sponsors: Pepsi, Starbucks, or Shell.",
            es: "Tu contraseña debe incluir uno de nuestros patrocinadores: Pepsi, Starbucks o Shell."
        },
        validator: (pw) => /pepsi|starbucks|shell/i.test(pw)
    },
    {
        id: 9,
        description: "The roman numerals in your password should multiply to 35.",
        translations: {
            en: "The roman numerals in your password should multiply to 35.",
            es: "Los números romanos en tu contraseña deben multiplicar 35."
        },
        validator: (pw) => {
            // Validator will be handled/patched in script.js as before or logic moved here.
            // Keep simple placeholder here.
            return false;
        }
    }
];

window.gameRules = rules;
