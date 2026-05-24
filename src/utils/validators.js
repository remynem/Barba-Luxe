export function validateShipping(fields, t) {
  const errs = {};
  if (!fields.firstName.trim()) errs.firstName = t.lang === "EN" ? "Champ requis" : "Required field";
  if (!fields.lastName.trim()) errs.lastName = t.lang === "EN" ? "Champ requis" : "Required field";
  if (!fields.address.trim()) errs.address = t.lang === "EN" ? "Champ requis" : "Required field";
  if (!fields.city.trim()) errs.city = t.lang === "EN" ? "Champ requis" : "Required field";
  if (!fields.zip.trim()) errs.zip = t.lang === "EN" ? "Champ requis" : "Required field";
  if (!fields.country.trim()) errs.country = t.lang === "EN" ? "Champ requis" : "Required field";
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
