/** Normalise un numéro pour wa.me (chiffres uniquement, 0… → 212…). */
export function normalizeWhatsAppPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  if (digits.startsWith("0") && digits.length <= 10) {
    return `212${digits.slice(1)}`;
  }
  return digits;
}

export function whatsappHref(phone: string, message: string): string | null {
  const n = normalizeWhatsAppPhone(phone);
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export function mailtoHref(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function defaultContactMessage(talentName: string): string {
  return `Bonjour ${talentName},\n\nJe vous contacte via KastMatch au sujet d'un casting.\n\nCordialement`;
}
