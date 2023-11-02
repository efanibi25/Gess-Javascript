concurrently "docker run --name redis --rm -p 6379:6379 -v ./data/:/data redis:7.2.2" "nodemon ./server/socket.js" "nodemon phaser.js" 
#concurrently "nodemon ./server/socket.js" "nodemon phaser.js"