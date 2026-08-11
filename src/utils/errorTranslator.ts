/**
 * Utility to translate English error messages (from Supabase, browser fetch, etc.) into Spanish.
 */
export const translateError = (error: any, defaultFallback?: string): string => {
  if (!error) {
    return defaultFallback || 'Ha ocurrido un error inesperado.';
  }

  // Extract the message from string or object
  let message = '';
  if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    message = error.message || error.error_description || error.error || '';
  }

  if (!message) {
    return defaultFallback || 'Ha ocurrido un error inesperado.';
  }

  const msgLower = message.toLowerCase();

  // 1. Network / Connection errors
  if (
    msgLower.includes('networkerror') ||
    msgLower.includes('failed to fetch') ||
    msgLower.includes('fetch resource') ||
    msgLower.includes('load failed') ||
    msgLower.includes('network error')
  ) {
    return 'Error de red: No se pudo conectar con el servidor. Verifica tu conexión a internet e inténtalo de nuevo.';
  }

  // 2. Auth Credentials & Account errors
  if (
    msgLower.includes('invalid login credentials') ||
    msgLower.includes('invalid credentials') ||
    msgLower.includes('credentials incorrect')
  ) {
    return 'Credenciales incorrectas. Verifica tu correo y contraseña o crea una cuenta.';
  }
  if (msgLower.includes('email not confirmed')) {
    return 'El correo electrónico no ha sido verificado aún. Por favor verifica tu bandeja de entrada.';
  }
  if (
    msgLower.includes('user already registered') ||
    msgLower.includes('already exists') ||
    msgLower.includes('user_already_exists')
  ) {
    return 'Este correo electrónico ya se encuentra registrado. Intenta iniciar sesión.';
  }
  if (msgLower.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msgLower.includes('signup requires a valid email')) {
    return 'El registro requiere un correo electrónico válido.';
  }
  if (msgLower.includes('email address not allowed')) {
    return 'Esta dirección de correo no está autorizada para registrarse.';
  }
  if (msgLower.includes('invalid email') || msgLower.includes('email is invalid')) {
    return 'El correo electrónico ingresado no es válido.';
  }

  // 3. Rate limiting
  if (msgLower.includes('rate limit') || msgLower.includes('too many requests')) {
    return 'Límite de intentos excedido. Por favor, espera unos minutos e inténtalo de nuevo.';
  }

  // 4. Session / Token expiration
  if (
    msgLower.includes('invalid token') ||
    msgLower.includes('token expired') ||
    msgLower.includes('jwt expired') ||
    msgLower.includes('invalid claim')
  ) {
    return 'Tu sesión ha expirado o es inválida. Por favor, inicia sesión nuevamente.';
  }

  // 5. Database & Server errors
  if (msgLower.includes('database error') || msgLower.includes('postgres') || msgLower.includes('postgrest')) {
    return 'Error de base de datos central: Ocurrió un problema en el servidor. Intenta de nuevo más tarde.';
  }

  // If no match but we have a default fallback, return that instead of raw English if the message is in English
  // (We check if it has letters and doesn't look like Spanish)
  // A simple heuristic: if it contains common English words like 'user', 'error', 'invalid', 'request', 'fetch', 'not found'
  const commonEnglishWords = ['user', 'error', 'invalid', 'request', 'fetch', 'not found', 'login', 'signup', 'confirm'];
  const isEnglish = commonEnglishWords.some(word => msgLower.includes(word));
  if (isEnglish && defaultFallback) {
    return defaultFallback;
  }

  return message;
};
