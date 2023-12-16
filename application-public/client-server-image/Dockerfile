# Use an official Node.js runtime as the base image
FROM node:18-alpine3.18


# Set the working directory in the container to /app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]