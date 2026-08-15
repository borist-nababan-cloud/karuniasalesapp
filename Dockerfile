# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (cache optimized)
COPY package.json package-lock.json ./
COPY shared ./shared
RUN npm ci

# Copy source and build
COPY . .

# Build Arguments (Required for Vite to bake in Env Vars)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_QR_BASE_URL
ARG VITE_APP_VERSION
ARG VITE_GOOGLE_MAPS_API_KEY

# Ensure environment variables are available during build
RUN VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_QR_BASE_URL=$VITE_QR_BASE_URL \
    VITE_APP_VERSION=$VITE_APP_VERSION \
    VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY \
    npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
