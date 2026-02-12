# Estágio de Build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_ENABLE_MSW=false

# Define as variáveis de ambiente para o build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_ENABLE_MSW=$VITE_ENABLE_MSW
RUN npm run build

# Estágio de Produção
FROM nginx:alpine
# Copia o build do React
COPY --from=build /app/dist /usr/share/nginx/html
# Copia a configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
