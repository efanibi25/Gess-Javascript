Just a few things that were added or changed during the development process


# Handling Player Switch

I'd like to make sure that both players have the same board before switching players
Previously the server had no state of the game, so the game would have a player send a move to a server. This way the move could not be modified, and then it would send the move to the other player. This other player would have to confirm the move before the game could continue. During this time the first player would be in limbo with the status of "waiting on server" 

One issue with this is if the second player disconnected. Then the game could be stalled, which meant that we would have to have some confirmation system on the first system to ensure that the second player received the message. This ends up being complicated as it would require  pinging many messages back and forth and having to implement numerous client and server listeners to handle this.

A second issue was that the game had some logic for validating the moves, but a challenge was making sure that this code was not modified before sending data out to the server. During research, I was able to find methods like encrypting the code that can mitigate this, but it became clear the only way to reliably prevent this is to have some logic on the server.

Redis now servers as a single source of truth for the game, and this is where clients will update on the changing state of the game
For example, when a client makes a move the UI on the client side is not updated. Instead, the move is sent to the server.
- first, the server will check if it is the current player
- it will validate the move
- if that is all successful the server will update its game state

Each client no longer has to ensure that the other client receives the message. Instead, they can communicate directly with the server and can check if the server state has changed. This would typically only happen after a move is accepted, so a client will ask after they receive a board change message from the server

# Constant Socket.io ID
The default behavior is to reset the socket ID every time a reconnection happens

Previously the data for the games was held in a simple in-memory object, and this object was updated with a new socket id, with every reconnection. The localstorage was used to keep track of which player was which.

A player with no local storage on which player they were, would be given a slot based on which player slot was empty

A player slot was filled after a player connected, and a player slot was freed after they disconnected. This way the system would use this information to try to update the socket.id 

Also if the player information was lost, they might still be able to join as long as the slot they wanted was free


There were numerous issues with this system
- local storage for both systems had to be up to date, if they were not a player could easily switch places with another. This happened frequently as a used incognito mode, to simulate having a second machine. There was no way to confirm that the right player was trying to get the right player slot
- A user could easily modify this information in local storage, and again there is no way to confirm this information


## Fix

We can overwrite the generateid function
https://stackoverflow.com/questions/7702461/socket-io-custom-client-id

In addition, because of changes in 3.0 we have to use a middle function to handle the id hand -off

https://github.com/socketio/socket.io/discussions/4190

The new system is more secure, but the downside of this new system is that once the user loses the data. They can not return to a game, so a future update would be using session and userids to fix this




# Dropzone modification

One of my favorite moments of this project was figuring out a way to have the board handle moves
The process is 
- figuring out the piece neighbors of the selected piece, by the index
- keeping a reference of that information in memory, this is acquired only once, since as you'll see is never changed
- move all all up to 9 pieces together
- Once a dropzone is found the game actually keeps all the pieces in the original location, it does this by moving the moved piece back to the original place
- Now instead the color properties for the pieces are swapped, this means we don't have to worry about changing the location of any piece


One challenge remained frequently during testing the area dropped would not be the area I intended
The board area was 22*22, and the size of the boxes was mainly restricted by the width of the computer screen




## Making Pointer smaller
Each block in the 22*22 board has a drop zone that is basically used to detect when the piece has been moved to a new block

Having the pointer be too large when dropping, makes it harder to get it into the right area
The fix provided here partly comes from my experience in other games, such as fps where having a large area focused on makes it much harder to be accurate

When the user is clicking on a piece, we want it to be as large as possible as making it too small would make the picking up, and initiation of the drag process much harder.

After clicking on a piece, the pointerdown event handler is sent to reduce the size of the piece significantly. This change is only reversed with the pointer up or dragend handlers

The reduced piece size means that there is a lot more leeway in getting the piece into the dropzone, and the fact that the user can only see the squares, and not the actual dropzone themselves matters less

## Increase grab Area
Having the pieces be too large makes the board look weird, but actually, in phaser the area used to detect whether or not a piece has been clicked, and the visual object on the board is actually two different thing

The default is to use a square around the object. However to make the process a little easier for the user, a modification that was made was increasing the rectangle to cover most of the block that a piece is in


## Square Highlight

As the user moves a piece around the board, it is hard to keep track of where the original piece was 
certain pieces like a 9-color piece block, have 8 directions where they can move with no limitation on how far they can go other than the edge of the board.

Once the dragging process is started, a dragstart handler is used to highlight the block a pointer is used with
Each block or pointer also has interactivity enabled, so the mouseenter handler is used to highlight blocks as the pointer goes over, and mouseleave handler as the mouse moves to another block.

All this helps to make sure that the user is making the move, that they intend to make



# Issue with client listeners
During development, I ran into an issue where the game would work fine on the initial connection, but as soon as I tried to test a client resetting the game would run into issues.

Now I know the cause of the issue, but before that I went through a process of trying to debug the issue
## Fix

In short, the issue was caused by improper cleanup

https://newdocs.phaser.io/docs/3.60.0/Phaser.Scenes.Events.DESTROY


"
You should destroy any resources that may be in use by your Scene in this event handler.

"

## Debugging Process

The browser debugging was helpful in seeing that the issue only occurred within the event listener, and that it only occurred with a specific property called scene, and would not occur if that same property was copied to another property like  _scene
- The scene property refers to the sceneplugin value, and during the restart process the sceneplugin calls restart on scenemanger
- scene plugin remove function just calls remove on scenemanager https://github.com/photonstorm/phaser/blob/v3.55.2/src/scene/ScenePlugin.js
-  https://github.com/photonstorm/phaser/blob/v3.55.2/src/scene/Systems.js 
    *   Some values or props of scene.system are being set to null, so somehow this seems to be the cause of the issue  
    * Additionally there is a destroy event being sent
- additionally game objects or arrays don't seem to be affected, however, they are seem to have the scene value modified
- the values are also fine outside of the event listener even after restart
- At this point, I decided to try removing the listener, which ended up solving the issue







# Validation

At one point I started to think of how could the server validate the information that was being sent by the user?
Would it be possible for the server to guarantee that the message being sent was not modified?


In the end, I decided on having the server have a version of the board in its memory, unlike the client side of the board there was no requirement that this board be visible. So a lot of complexities were removed including the use of Phaser on the client side. 

All the code that was previously used for validation on the client side, was moved and modified to work with this modified board


Now the process of making a move is 
- The server cache system for the game will serve as the source of truth
- the user sends the move to the server 
- the user side of the board is not updated
- The server checks its internal board, and validates the move
- If successful the server updates its internal board, including +1 of the moves counter
- if successful then the server will then broadcast the new board to all players
- Both players will update their board, and both players will ask for interactivity from the server
- Depending on the player number they will get interactivity or have it disabled until the move counter changes again

One thing to note is that a big form of cheating on chess and similar websites is the use of AI. Which would not be caught even by normal software, handling that would require some sort of heuristic to detect human vs AI behaviors



Below are some of the other methods I looked into
Snapshot interpolation is one method I really liked, but in the end, it ended up being too complicated for a board game. And it would have required changing the entire code base


## snapshot-interpolation
https://www.gabrielgambetta.com/client-server-game-architecture.html

We can use this to have the server send snapshots of the game state to users, via the inputs that the users send to the server


This is a good example of how the system
works

https://github.com/geckosio/phaser-on-nodejs-example

- on the server, the Phraser instance creates a map of all players 
- The server add an entry from the socket.id on the new client connection
- the server sends snapshots at about 30 fps with the current state of the game, which ends up being where the dude character should be
- The client registers the current state of the movement and sends this via socket to the server

- on disconnect, we destroy the dude object and remove the character


This would probably be the most effective method as it would change the server from being stateless to holding the entire game state.

For example, this could be used to have the server keep track of where each piece should be

We also don't have physics or other complexities in this game

## Others
Code Obfuscation and Move Obfuscation are methods that could be used for validation but might be more effective against blocking bots as well
They also wouldn't require a complete overwrite



# Simplify Messaging
The official socket.io documentation states two ways to organize code
One method would be to split the listener into different files, for this project the number of required listeners is low. So I found it appropriate to just include all the listeners in one file, as also suggested by the documentation
https://socket.io/docs/v4/server-application-structure/


Since a gooding best practice is providing code that is portable/reusable, and a method for organizations I have used in the past called mvc offers this as one of its benefits. I decided to try to organize the code in this way. With the functionality of the listeners split off in separate controller functions

This allows for each listener function to increase in the complexity of tasks it handles while keeping the code readable, and provides an opportunity to make changes in the future.
See gess.drawio.pdf

Previously there were a lot more separate listeners. For example the process of swtichplayer and changing of interactivity used to be two listeners. However currently switching players only happens before the other player gets control of the board, so methods like these make sense to combine into one listener. I also found that reducing the number of listeners actually made the code a little easier to manage





