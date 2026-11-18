FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./
# The application initializes an external database from this shared schema.
COPY database /database
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "index.js"]
