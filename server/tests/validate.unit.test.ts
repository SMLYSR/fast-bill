import { validateEmail, validatePhoneCN, validatePassword } from '../utils/validate';

test('email validation', () => {
  expect(validateEmail('a@b.com')).toBe(true);
  expect(validateEmail('a@b')).toBe(false);
});

test('phone validation', () => {
  expect(validatePhoneCN('13800138000')).toBe(true);
  expect(validatePhoneCN('123456')).toBe(false);
});

test('password validation', () => {
  expect(validatePassword('abc12345')).toBe(true);
  expect(validatePassword('abcdefg')).toBe(false);
  expect(validatePassword('12345678')).toBe(false);
});