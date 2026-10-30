/** WhatsApp comercial do Milebag (HU38): o contato público da página, junto do formulário. */
export const WHATSAPP = "5562981057152";

export function linkWhatsApp(mensagem: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}
