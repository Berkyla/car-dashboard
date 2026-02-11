# Car Dashboard (Docker Compose)

## Запуск через Docker Compose

```bash
docker compose up --build
```

### Порты
- Frontend (nginx): http://localhost:3000
- Backend WebSocket (ControlBlock): ws://localhost:8080

### Настройка WebSocket URL
По умолчанию фронтенд использует `ws://localhost:8080`. Переопределить URL можно через переменную
окружения `WS_URL` на этапе сборки фронта. В `docker-compose.yml` это значение уже установлено:

```yaml
services:
  frontend:
    build:
      args:
        WS_URL: ws://controlblock:8080
    environment:
      WS_URL: ws://controlblock:8080
```

### Проверка работоспособности
1. Откройте http://localhost:3000.
2. В DevTools убедитесь, что WebSocket соединение установлено на `ws://localhost:8080`.

## Важно про ControlBlock на Linux
Проект ControlBlock — это WinForms-приложение с таргетом `net8.0-windows`, поэтому сборка
в Linux-контейнере потребует портирования. Для Linux-совместимости требуется отдельная доработка
в ветке `fix/controlblock-linux-net8` (перевод на `net8.0` без Windows Forms, замена UI и/или
выделение WebSocket-сервера в отдельный сервис).