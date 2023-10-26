
cd ./server/&&npm start&

concurrently "npm ./client/server.js" "npm ./socket/server.js"