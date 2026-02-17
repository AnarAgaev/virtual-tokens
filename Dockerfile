# =========================
# BUILD IMAGE
# =========================
FROM node:23.10.0-alpine AS build

WORKDIR /app

# Копируем только package.json и package-lock.json для кэширования зависимостей
COPY package.json package-lock.json* ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь проект
COPY . .

RUN npm run build