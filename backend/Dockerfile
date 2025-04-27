# Use official Node.js LTS version
FROM node:18

# Create app directory
WORKDIR /app

# Install backend dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose backend port
EXPOSE 5000

# Run the backend
CMD ["npm", "start"]
