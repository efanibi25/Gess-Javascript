concurrently "docker run --name redis --rm -p 127.0.0.1:6379:6379 -v ./data:/data redis:7.2.2 --save 15 1" "nodemon ./src/server/socket/listeners.js" "nodemon ./src/server/phaser.js" 
#no redis example
#concurrently "nodemon ./src/server/socket/listeners.js" "./src/server/nodemon phaser.js"

