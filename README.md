
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



## 4 add .env
This should be in the root of the repo


### CLIENT_PORT
This refers to the port used to host the main client UI/Website
It is used by the backend to host the express service

### CLIENT_URL
This is the url/domain the client uses to access the main client

### SOCKET_IO_PORT
This is the port used to host the socket.io service, used by the backend


### SOCKET_IO_URL
This is the url/domain the client uses to access the socket.io service

### Example

```
CLIENT_PORT=8090
SOCKET_IO_PORT=7500
CLIENT_URL=http://localhost:8090
SOCKET_IO_URL=http://localhost:7500
```


```
You can change the .env file to better match your system

```

## 5 run script 
```
run ./start.sh
Note: You can use the second line instead if you using a non docker version of Redis

```


