export function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhoneCN(phone: string) {
  return /^\d{11}$/.test(phone);
}

export function validatePassword(pw: string) {
  if (pw.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  return hasLetter && hasDigit;
}