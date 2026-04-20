FROM node:20-alpine

WORKDIR /app

# Salin file package.json dan package-lock.json (jika ada) ke dalam container
COPY package*.json ./

# Install semua dependencies
RUN npm install

# Salin semua file source code backend
COPY . .

EXPOSE 6001

# Jalankan server
CMD ["node", "server.js"]
