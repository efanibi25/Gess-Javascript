
# Future Updates
The UI is very simple at the moment

I would like to upgrade it to a more modern look with React or another front-end framework
Phaser also handles the front end so the challenge is figuring out how to integrate it
See: Documentation/future.MD

# Accessing 

Main website is hosted on localhost:8090, unless you change the .env variables#




# Running/Install

## 1 Get Redis
```
You'll need an instance of Redis on the server/local machine 
If you have docker installed on your system, then the easiest way to run the program would be to start the start.sh script

With that method getting Redis separately won't be required
```

## 2 install modules


```
npm install
```

## 3 install concurrently globally


```
npm install -g concurrently

```



## 4 Update .env


```
You can change the .env file to better match your system

CLIENT_PORT=8090
SOCKET_IO=7500

#Used for redirection
CLIENT_URL=http://localhost:8090
#Used to communicate with backend socket.io
SOCKET_IO_URL=http://localhost:7500


```

## 5 run script 
```
run ./start.sh
Note: You can use the second line instead if you using a non docker version of Redis

```


