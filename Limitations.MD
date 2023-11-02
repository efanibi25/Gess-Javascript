

This files list previous limitations/ fixes to this problems


# env variables

This was fixed by using a inline script, I like this method a little bit more since it keeps the dom clean

<s>
The client side javascript server can't accept env variables for information like the socket.io server address
</s>

# Small Hit Zones
This was fixed with two changes

1. Phaser when setting an object as interactive sets a square around that object by default to handle input, but you can modify
this object. I modified the object to try to take the entire square a piece is in or most of it. This way it is easier to grab the piece, even if it center is hidden
2. Taking inspiration from fps, the piece is shrunk while mouse is held down on it making it easier to target the correct drop zone.
We also have some convience features like highlighting of start and end zones to make it easier to keep track of movement
<s>
Drop zone for pieces can be very small
Hit zone can be very small, this is also troublesome because some pieces are hidden so getting the right area for a nine square piece can be hard
</s>









# Better Support of Disconnect
This was fixed with redis and hardcoded socket.id to games

Which allows for us to use matching socket.id to match playernumber

<s>
A player could switch the playernumber, and take over for another player
- socket id change every connection
- we are trusting the localdata for restoring which player is which
</s>

# Socket ID
This was fixed by following guide to generate socket.sid

We have to use middleware to generate socket.id
since 3.0 

https://github.com/socketio/socket.io/discussions/4190
<s>
Redis Now saves the playerid, but this causes issue on re-entry since by default socket.io gets a new ID
</s>


# Incognito
Currently the socket.id is saved to localdata
If a user uses incognito and closes the browser, the game will no longer be accecible to them since the won't have a matching socket.id and a new one will be geneerated

## Fix
Probably need some sort of account system to tie a socket id to allow for restoration of games

# Cheating 

With the current implementation it is possible that the user could change the input to the socket, and present a invalid move

After some research, I found that there may be a few ways to meditate this 

## Update

I decided to go with server base confirmation
snapshot-interpolation is very interesting, but I think it is very cool, but I think it is overkill
for a board game

Once the cache system is made the steps for making a move will be
- The server cache system for the game will serve as source of truth
- user sends the move to the server and the server checks if move is legal, before updating or rejecting
- the second user does not receive the move until it is accepted
- Once both users confirm the move the game will switch players


<s>
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


## Move Obfuscation
https://incolumitas.com/2014/01/26/the-art-of-cheating-making-a-chess-com-chess-bot-using-a-unusual-approach/
</s>


