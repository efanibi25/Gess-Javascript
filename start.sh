concurrently "docker run --name redis --rm -p 6379:6379 -v ./data/:/data redis:7.2.2" "node ./server/socket/listeners.js" "nodemon ./server/phaser.js" 
#concurrently "nodemon ./server/socket.js" "./server/nodemon phaser.js"