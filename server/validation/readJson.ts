import { readFailure } from './core';
import { MAX_JSON_AUTH_BYTES, type JsonReadResult } from './types';

/**
 * Lee el cuerpo JSON acotado por tamaño y con `Content-Type` correcto.
 *
 * Se lee el stream por trozos para no llegar a alojar en memoria un body
 * enorme antes de rechazarlo (defensa contra DoS por cuerpo gigante).
 */
export async function readJson(
  request: Request,
  maxBytes: number = MAX_JSON_AUTH_BYTES
): Promise<JsonReadResult> {
  const contentType = request.headers.get('content-type');
  const mediaType = (contentType ?? '').split(';')[0].trim().toLowerCase();
  if (mediaType !== 'application/json') {
    return readFailure(
      'content-type',
      'Content-Type debe ser application/json',
      415
    );
  }

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declared) && declared > maxBytes) {
    return readFailure(
      'body',
      `Cuerpo demasiado grande (máximo ${maxBytes} bytes)`,
      413
    );
  }

  let text = '';
  const body = request.body;

  if (body) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let total = 0;

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        total += value.byteLength;
        if (total > maxBytes) {
          await reader.cancel().catch(() => undefined);
          return readFailure(
            'body',
            `Cuerpo demasiado grande (máximo ${maxBytes} bytes)`,
            413
          );
        }
        text += decoder.decode(value, { stream: true });
      }
      text += decoder.decode();
    } catch {
      return readFailure('body', 'No se pudo leer el cuerpo');
    }
  }

  if (text.trim().length === 0) {
    return readFailure('body', 'Cuerpo vacío');
  }

  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return readFailure('body', 'El cuerpo debe ser un objeto JSON');
    }
    return { ok: true, body: parsed as Record<string, unknown> };
  } catch {
    return readFailure('body', 'JSON inválido');
  }
}
