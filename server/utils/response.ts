import { Response } from 'express';

export function success(res: Response, data: any) {
  return res.status(200).json({ code: 0, message: 'ok', data });
}

export function badRequest(res: Response, message: string) {
  return res.status(400).json({ code: 40001, message });
}

export function unauthorized(res: Response, message: string) {
  return res.status(401).json({ code: 40101, message });
}

export function tooManyRequests(res: Response, message: string) {
  return res.status(429).json({ code: 42901, message });
}