concurrently "docker run --name redis --rm -p 6379:6379 -v ./data:/data redis:7.2.2 --save 15 1" "nodemon ./server/socket/listeners.js" "nodemon ./server/phaser.js" 
#concurrently "nodemon ./server/socket/listeners.js" "./server/nodemon phaser.js"
