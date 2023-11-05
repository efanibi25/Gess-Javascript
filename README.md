
# Future Updates
The UI is very simple at the moment

I would like to upgrade it to a more modern look with react or another front-end frame work
Phaser also handles the front-end so the challenge is figuring out how to integrate it

# Running/Install

## 1 Get redis
```
You'll need an instance of redis on the server/local machine 
If you have docker installed on your system, then the easiest way to run the program would be to start the start.sh script

With that method getting redis seperately won't be required
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
You can change the .env file to better match with your system

```

## 5 run script 
```
run ./start.sh
Note: You can use the second line instead if your using a non docker version of redis

```


