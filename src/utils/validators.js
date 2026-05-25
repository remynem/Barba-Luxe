// ─── Email ────────────────────────────────────────────────────────────────────
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// ─── Phone ────────────────────────────────────────────────────────────────────
/**
 * Validates the local part of a phone number (digits, spaces, dashes, parens).
 * Minimum 6 digits after stripping non-numeric chars.
 */
export function isValidPhone(phone) {
  if (!phone || !phone.trim()) return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 15;
}

// ─── ZIP / Postal code ────────────────────────────────────────────────────────
const ZIP_PATTERNS = {
  BE: /^\d{4}$/,
  FR: /^\d{5}$/,
  LU: /^\d{4}$/,
  NL: /^\d{4}\s?[A-Z]{2}$/i,
  DE: /^\d{5}$/,
  GB: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
  IT: /^\d{5}$/,
  ES: /^\d{5}$/,
  PT: /^\d{4}-?\d{3}$/,
  CH: /^\d{4}$/,
  AT: /^\d{4}$/,
  PL: /^\d{2}-\d{3}$/,
  CZ: /^\d{3}\s?\d{2}$/,
  SK: /^\d{3}\s?\d{2}$/,
  HU: /^\d{4}$/,
  RO: /^\d{6}$/,
  BG: /^\d{4}$/,
  HR: /^\d{5}$/,
  SI: /^\d{4}$/,
  RS: /^\d{5}$/,
  GR: /^\d{3}\s?\d{2}$/,
  SE: /^\d{3}\s?\d{2}$/,
  NO: /^\d{4}$/,
  DK: /^\d{4}$/,
  FI: /^\d{5}$/,
  IE: /^[A-Z]\d{2}\s?[A-Z\d]{4}$/i,
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
  AU: /^\d{4}$/,
  NZ: /^\d{4}$/,
  BR: /^\d{5}-?\d{3}$/,
  MX: /^\d{5}$/,
  AR: /^[A-Z]?\d{4}[A-Z]{0,3}$/i,
  JP: /^\d{3}-?\d{4}$/,
  ZA: /^\d{4}$/,
};

export function isValidZip(zip, countryCode) {
  if (!zip || !zip.trim()) return false;
  const pattern = ZIP_PATTERNS[countryCode];
  if (!pattern) return zip.trim().length >= 2; // fallback: any non-empty value
  return pattern.test(zip.trim());
}

// ─── Shipping form ────────────────────────────────────────────────────────────
export function validateShipping(fields, lang) {
  const isFr = lang === "fr";
  const req   = isFr ? "Champ requis"            : "Required field";
  const errs  = {};

  if (!fields.firstName?.trim())  errs.firstName = req;
  if (!fields.lastName?.trim())   errs.lastName  = req;
  if (!fields.address?.trim())    errs.address   = req;
  if (!fields.city?.trim())       errs.city      = req;

  // ZIP validation — country-aware
  if (!fields.zip?.trim()) {
    errs.zip = req;
  } else if (!isValidZip(fields.zip, fields.country)) {
    errs.zip = isFr ? "Code postal invalide" : "Invalid postal code";
  }

  // Country — must be a valid ISO code (non-empty string)
  if (!fields.country?.trim()) {
    errs.country = isFr ? "Veuillez choisir un pays" : "Please select a country";
  }

  // Phone — optional but validated if present
  if (fields.phone?.trim() && !isValidPhone(fields.phone)) {
    errs.phone = isFr ? "Numéro invalide (min 6 chiffres)" : "Invalid number (min 6 digits)";
  }

  // Email — optional but validated if present
  if (fields.email?.trim() && !isValidEmail(fields.email)) {
    errs.email = isFr ? "Email invalide" : "Invalid email";
  }

  return errs;
}

// ─── Contact form ─────────────────────────────────────────────────────────────
export function validateContact(fields, lang) {
  const isFr = lang === "fr";
  const errs = {};

  if (!fields.name?.trim()) {
    errs.name = isFr ? "Champ requis" : "Required field";
  }
  if (!fields.email?.trim()) {
    errs.email = isFr ? "Champ requis" : "Required field";
  } else if (!isValidEmail(fields.email)) {
    errs.email = isFr ? "Email invalide" : "Invalid email";
  }
  if (!fields.message?.trim()) {
    errs.message = isFr ? "Champ requis" : "Required field";
  } else if (fields.message.trim().length < 10) {
    errs.message = isFr ? "Message trop court (min 10 caractères)" : "Message too short (min 10 chars)";
  }

  return errs;
}

export function validatePayment(card, lang) {
  const errs = {};
  const isFr = lang === "fr";
  if (!card.name.trim()) errs.name = isFr ? "Champ requis" : "Required";
  const digits = card.number.replace(/\s/g, "");
  if (!digits || digits.length !== 16 || !/^\d+$/.test(digits))
    errs.number = isFr ? "16 chiffres requis" : "16 digits required";
  if (!card.expiry || !/^\d{2}\/\d{2}$/.test(card.expiry)) {
    errs.expiry = isFr ? "Format MM/AA" : "Format MM/YY";
  } else {
    const [mm, yy] = card.expiry.split("/").map(Number);
    const now = new Date();
    const curYY = now.getFullYear() % 100;
    const curMM = now.getMonth() + 1;
    if (mm < 1 || mm > 12) errs.expiry = isFr ? "Mois invalide" : "Invalid month";
    else if (yy < curYY || (yy === curYY && mm < curMM))
      errs.expiry = isFr ? "Carte expirée" : "Card expired";
  }
  if (!card.cvv || !/^\d{3}$/.test(card.cvv))
    errs.cvv = isFr ? "3 chiffres requis" : "3 digits required";
  return errs;
}
