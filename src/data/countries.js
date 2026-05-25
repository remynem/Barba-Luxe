// Country list with ISO code, French name, English name, dial code, and flag emoji
export const COUNTRIES = [
  { code: "BE", fr: "Belgique",           en: "Belgium",              dial: "+32",  flag: "🇧🇪" },
  { code: "FR", fr: "France",             en: "France",               dial: "+33",  flag: "🇫🇷" },
  { code: "LU", fr: "Luxembourg",         en: "Luxembourg",           dial: "+352", flag: "🇱🇺" },
  { code: "NL", fr: "Pays-Bas",           en: "Netherlands",          dial: "+31",  flag: "🇳🇱" },
  { code: "DE", fr: "Allemagne",          en: "Germany",              dial: "+49",  flag: "🇩🇪" },
  { code: "GB", fr: "Royaume-Uni",        en: "United Kingdom",       dial: "+44",  flag: "🇬🇧" },
  { code: "IT", fr: "Italie",             en: "Italy",                dial: "+39",  flag: "🇮🇹" },
  { code: "ES", fr: "Espagne",            en: "Spain",                dial: "+34",  flag: "🇪🇸" },
  { code: "PT", fr: "Portugal",           en: "Portugal",             dial: "+351", flag: "🇵🇹" },
  { code: "CH", fr: "Suisse",             en: "Switzerland",          dial: "+41",  flag: "🇨🇭" },
  { code: "AT", fr: "Autriche",           en: "Austria",              dial: "+43",  flag: "🇦🇹" },
  { code: "PL", fr: "Pologne",            en: "Poland",               dial: "+48",  flag: "🇵🇱" },
  { code: "CZ", fr: "République tchèque", en: "Czech Republic",       dial: "+420", flag: "🇨🇿" },
  { code: "SK", fr: "Slovaquie",          en: "Slovakia",             dial: "+421", flag: "🇸🇰" },
  { code: "HU", fr: "Hongrie",            en: "Hungary",              dial: "+36",  flag: "🇭🇺" },
  { code: "RO", fr: "Roumanie",           en: "Romania",              dial: "+40",  flag: "🇷🇴" },
  { code: "BG", fr: "Bulgarie",           en: "Bulgaria",             dial: "+359", flag: "🇧🇬" },
  { code: "HR", fr: "Croatie",            en: "Croatia",              dial: "+385", flag: "🇭🇷" },
  { code: "SI", fr: "Slovénie",           en: "Slovenia",             dial: "+386", flag: "🇸🇮" },
  { code: "RS", fr: "Serbie",             en: "Serbia",               dial: "+381", flag: "🇷🇸" },
  { code: "GR", fr: "Grèce",             en: "Greece",               dial: "+30",  flag: "🇬🇷" },
  { code: "SE", fr: "Suède",             en: "Sweden",               dial: "+46",  flag: "🇸🇪" },
  { code: "NO", fr: "Norvège",           en: "Norway",               dial: "+47",  flag: "🇳🇴" },
  { code: "DK", fr: "Danemark",          en: "Denmark",              dial: "+45",  flag: "🇩🇰" },
  { code: "FI", fr: "Finlande",          en: "Finland",              dial: "+358", flag: "🇫🇮" },
  { code: "IE", fr: "Irlande",           en: "Ireland",              dial: "+353", flag: "🇮🇪" },
  { code: "US", fr: "États-Unis",        en: "United States",        dial: "+1",   flag: "🇺🇸" },
  { code: "CA", fr: "Canada",            en: "Canada",               dial: "+1",   flag: "🇨🇦" },
  { code: "MA", fr: "Maroc",             en: "Morocco",              dial: "+212", flag: "🇲🇦" },
  { code: "DZ", fr: "Algérie",           en: "Algeria",              dial: "+213", flag: "🇩🇿" },
  { code: "TN", fr: "Tunisie",           en: "Tunisia",              dial: "+216", flag: "🇹🇳" },
  { code: "SN", fr: "Sénégal",           en: "Senegal",              dial: "+221", flag: "🇸🇳" },
  { code: "CI", fr: "Côte d'Ivoire",     en: "Ivory Coast",          dial: "+225", flag: "🇨🇮" },
  { code: "CM", fr: "Cameroun",          en: "Cameroon",             dial: "+237", flag: "🇨🇲" },
  { code: "CD", fr: "Congo (RDC)",       en: "Congo (DRC)",          dial: "+243", flag: "🇨🇩" },
  { code: "JP", fr: "Japon",             en: "Japan",                dial: "+81",  flag: "🇯🇵" },
  { code: "AU", fr: "Australie",         en: "Australia",            dial: "+61",  flag: "🇦🇺" },
  { code: "NZ", fr: "Nouvelle-Zélande",  en: "New Zealand",          dial: "+64",  flag: "🇳🇿" },
  { code: "ZA", fr: "Afrique du Sud",    en: "South Africa",         dial: "+27",  flag: "🇿🇦" },
  { code: "BR", fr: "Brésil",            en: "Brazil",               dial: "+55",  flag: "🇧🇷" },
  { code: "MX", fr: "Mexique",           en: "Mexico",               dial: "+52",  flag: "🇲🇽" },
  { code: "AR", fr: "Argentine",         en: "Argentina",            dial: "+54",  flag: "🇦🇷" },
  { code: "IL", fr: "Israël",            en: "Israel",               dial: "+972", flag: "🇮🇱" },
  { code: "AE", fr: "Émirats arabes unis", en: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { code: "LB", fr: "Liban",             en: "Lebanon",              dial: "+961", flag: "🇱🇧" },
];

/** Returns country by ISO code */
export function getCountryByCode(code) {
  return COUNTRIES.find(c => c.code === code) || null;
}

/** Returns country by dial code (returns first match) */
export function getCountryByDial(dial) {
  return COUNTRIES.find(c => c.dial === dial) || null;
}
