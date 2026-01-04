# Stage 1: Base
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Stage 2: Development
FROM base AS development
COPY . .
CMD ["npm", "run", "dev", "--", "--host"]

# Stage 3: Build
FROM base AS build
COPY . .
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_AUDIENCE
ARG VITE_LOG_LEVEL
ARG VITE_API_BASE_URL
ENV VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN
ENV VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID
ENV VITE_AUTH0_AUDIENCE=$VITE_AUTH0_AUDIENCE
ENV VITE_LOG_LEVEL=$VITE_LOG_LEVEL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 4: Production
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
