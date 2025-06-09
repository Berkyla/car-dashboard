type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

// Возвращает текущую дату и время в ISO формате
function formatTimestamp(): string {
  return new Date().toISOString();
}

// Универсальный вывод логов с поддержкой уровня, области и данных
function log(level: LogLevel, scope: string, message: string, data?: unknown): void {
  const timestamp = formatTimestamp();
  const prefix = `[${level}] ${timestamp} [${scope}]`;

  if (data !== undefined) {
    console.log(`${prefix} ${message} –`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// Глобальный логгер приложения с разделением по уровню
export const logger = {
  info: (scope: string, msg: string, data?: unknown) => log("INFO", scope, msg, data),
  warn: (scope: string, msg: string, data?: unknown) => log("WARN", scope, msg, data),
  error: (scope: string, msg: string, data?: unknown) => log("ERROR", scope, msg, data),

  // DEBUG доступен только вне production-сборки
  debug: (scope: string, msg: string, data?: unknown) => {
    if (process.env.NODE_ENV !== "production") {
      log("DEBUG", scope, msg, data);
    }
  },
};
