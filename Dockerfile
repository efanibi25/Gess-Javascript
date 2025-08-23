# Use a lightweight official Node.js image as the base
FROM node:20-alpine

# Install Python and other necessary build tools
# The `pkgconfig` and `cairo-dev` packages are often needed for node-canvas
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev


# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
# This step is done separately to leverage Docker's build cache
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the port your Node.js app runs on
EXPOSE 8090

# Define the command to run the application
CMD [ "npm", "start" ]