express = require('express')
var session = require('express-session')
const app = express();
const {check, validationResult} = require('express-validator');
const crypto = require("crypto");

app.use(express.static(__dirname + '/public'));

var exphbs  = require('express-handlebars');

const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.engine('handlebars', exphbs.engine({ extname: '.hbs', defaultLayout: "main.handlebars"}));
app.set('view engine', 'handlebars');
app.use(session({ secret: 'edlBz4FDdbvgIuZlOGEresgliR0', cookie: { maxAge: 60000 }}))



app.get('/', function (req, res) {
  console.log("Session ID",req.session.id)
  res.sendFile(__dirname + '/index.html');
})


app.get('/create_game', function (req, res) {
  res.render('create_game');
})


app.post('/create_game',function (req, res) {
key=require("crypto").randomBytes(64).toString('hex');


addtable(key)
function addtable(key)

{
  var player1array="0000000000000000000000101011111111010100011101011110101011100010101111111101010000000000000000000000000000000000000000000010010010010010010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
  var player2array="00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100100100100100100000000000000000000000000000000000000000000101011111111010100011101011110101011100010101111111101010000000000000000000000";

  pool.query("INSERT INTO Games (id, player1,player1board,player2,player2board,currentplayer,winner) VALUES (?,?,?,0,?,1,0)",[key,req.session.id,player1array,player2array], function (err, result) {
    if (err){
        errors={"msg":"Issue with Table"}
        console.log(err)
        res.render('create_game',errors);
        return
    }
    console.log("Added New Table")

    msg={"msg":"Created New Game Please Share Key with player2 "+key}
    res.render('create_game',msg);
})


}


})










app.get('/join_game/', function (req, res) {
  res.render('join_game')
})

app.post('/join_game/', function (req, res) {
  check_table(req.body.key)
  function check_table(key)

  {

    pool.query("SELECT * FROM Games WHERE id=?",[key], function (err, result,field) {
      if (err){
          errors={"msg":"Game Key incorrect"}
          console.log(err)
          res.render('join_game',errors);
          return
      }
      console.log(result)
      msg={"msg":"Table Found"}
      res.redirect('/game/'+key)
  })


  }

})




app.get('/game/:key', function (req, res) {
  key={"key":req.params.key}
  res.render('game',key)
})



app.get('/database/:key', function (req, res) {
  check_table(req.params.key)
  function check_table(key)

  {

    pool.query("SELECT * FROM Games WHERE id=?",[key], function (err, result,field) {
      if (err){
          console.log(err)
      }
      res.send(result[0])
  })


  }

})


//database
var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit : 20,
  host: "localhost",
  user: "root",
  password: "password",
  database: "gess",
  port:'3308'
});






















 
const PORT = process.env.PORT || 8090
app.listen(PORT, () => {
    console.log(`App listening to ${PORT}....`)
    console.log('Press Ctrl+C to quit.')
})
