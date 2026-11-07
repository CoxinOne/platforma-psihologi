/**
 * Unele notificări istorice pot indica rutele modulului de programări, eliminat
 * din aplicație. Le redirecționăm către o pagină validă, ca să nu apară 404.
 */
export function notificationHref(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/dashboard/programari")) return "/dashboard";
  if (url.startsWith("/cabinet/programari")) return "/cabinet";
  if (url.startsWith("/cabinet/disponibilitate")) return "/cabinet/profil";
  return url;
}
