# Usa una imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json
COPY package*.json ./

# Instala dependencias del proyecto + nodemon como dependencia global
RUN npm install && npm install -g nodemon

# Copia el resto del código al contenedor
COPY . .

# Expone el puerto en el que correrá la aplicación
EXPOSE 3000

# Comando por defecto (esto se puede sobreescribir desde docker-compose.yml)
CMD ["npm", "start"]
