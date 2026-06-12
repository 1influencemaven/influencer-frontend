export function getEmailInitials(email: string): string {
  const localPart = email.split("@")[0] ?? email;
  const segments = localPart.split(/[._-]+/).filter(Boolean);

  if (segments.length >= 2) {
    return `${segments[0]!.charAt(0)}${segments[1]!.charAt(0)}`.toUpperCase();
  }

  return localPart.slice(0, 2).toUpperCase();
}
