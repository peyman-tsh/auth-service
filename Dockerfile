# مرحله مشترک: نصب وابستگی‌ها (برای هر دو dev و prod)
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

# نصب همه وابستگی‌ها (شامل devDependencies برای development)
RUN npm ci

# مرحله توسعه (Development Stage) - برای dev با hot-reload
FROM node:20-alpine AS development

WORKDIR /app

# کپی وابستگی‌ها از مرحله deps
COPY --from=deps /app/node_modules ./node_modules

# کپی تمام کد منبع
COPY . .

# تنظیم پورت
EXPOSE 3000

# اجرای اپ در حالت dev (با nodemon یا ts-node برای hot-reload)
CMD ["npm", "run", "start:dev"]

# مرحله تولید (Production Stage) - برای deploy نهایی
FROM node:20-alpine AS production

WORKDIR /app

# کپی وابستگی‌های تولید از مرحله deps (بدون devDependencies)
COPY --from=deps /app/node_modules ./node_modules

# کپی کد منبع و ساخت
COPY . .
RUN npm run build

# کپی فایل‌های ساخته‌شده
COPY --from=builder /app/dist ./dist  # اگر stage builder داری، تنظیم کن

# تنظیم پورت
EXPOSE 3000

# اجرای اپ در حالت تولید
CMD ["npm", "run", "start:prod"]