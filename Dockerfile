# =========================
# STAGE 1 — BUILD
# =========================
# Используем официальный Node.js образ
# Alpine — лёгкий и быстрый
FROM node:23.10.0-alpine AS build

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем ТОЛЬКО package.json и lock-файл
# Это важно для кэширования зависимостей
COPY package.json package-lock.json* ./

# Устанавливаем зависимости
# --frozen-lockfile / ci — гарантирует одинаковые версии
RUN npm ci

# Копируем весь проект
COPY . .

# Собираем production-версию Vite
RUN npm run build


# =========================
# STAGE 2 — NGINX
# =========================
# Берём nginx для раздачи статики
FROM nginx:alpine

# Удаляем дефолтную конфигурацию nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копируем свою минимальную конфигурацию
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранный Vite-проект из build-stage
COPY --from=build /app/dist /usr/share/nginx/html

# Открываем порт 80
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
