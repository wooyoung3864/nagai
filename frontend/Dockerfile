# Use Node.js to build the React app
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Install frontend dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Build the React app for production
RUN npm run build

# --- Serve the built React app using nginx ---

# Use nginx as the final lightweight server
FROM nginx:stable-alpine

# Copy the React build files into nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expose nginx port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
