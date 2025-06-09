FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and lock file
COPY package*.json ./

# Install all dependencies including devDependencies to allow build
RUN npm install

# Copy the rest of the app
COPY . .

# Compile TypeScript
RUN npm run build

# Expose the port your app listens on
EXPOSE 5004

# Start the app
CMD ["node", "dist/app.js"]
