# Cheating 

With the current implementation it is possible that the user could change the input to the socket, and present a invalid move

After some research I found that they may be a few ways to medigate this 

## Code Obfuscation
One idea would be simply to run a tool like javascript-obfuscator as a webpack plugin. This would make the code unreadable to humans, and thus increase the difficulty of cheating
### Upsides
- relatively easy to implement
- good effectiveness

### Downsides
- The code is still client side
- As stated on the FAQ it could still be possible to reverse engineer
https://obfuscator.io/
- The size of the files will increase


## snapshot-interpolation
https://www.gabrielgambetta.com/client-server-game-architecture.html

We can use this to have the server send snapshots of the game state to users, via the inputs that the users send to the server


This is a good example of how the system
works

https://github.com/geckosio/phaser-on-nodejs-example

- on the server the phraser instance creates a map of all players 
- The server add a entry from the socket.id on new client connection
- the server sends snapshots at about 30 fps with the current state of the game, which ends up being where the dude character should be
- The client registers the current state of the movement, and sends this via socket to the server

- on disconnect, we destroy the dude object and remove the character


This would probably be the most effective method as it would change the server from being stateless, to holding the entire game state.

For example this could be used to have the server keep track of where each piece should be

We also don't have physics or other complexities in this game

## Upsides
- most of the code could be hidden from the client
- great effectiveness against cheating

## Downsides
- requires rewrite
- increase debugging difficulty
- increased load on server
- client needs to get updates from server



## Server Validation
Anothdd

## Move Obfuscation
https://incolumitas.com/2014/01/26/the-art-of-cheating-making-a-chess-com-chess-bot-using-a-unusual-approach/



