# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]
