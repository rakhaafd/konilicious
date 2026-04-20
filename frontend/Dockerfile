FROM node:20-alpine

WORKDIR /app

# Salin file package.json dan package-lock.json (jika ada) ke dalam container
COPY package*.json ./

# Install semua dependencies
RUN npm install

# Salin semua file source code frontend
COPY . .

# Ekspose port yang digunakan Vite
EXPOSE 5173

# Jalankan server Vite dalam mode development dengan akses network terbuka (host)
CMD ["npm", "run", "dev", "--", "--host"]
