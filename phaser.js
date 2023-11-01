express = require('express')
var path = require('path');
require('dotenv').config(".env")

var session = require('express-session')
const app = express();



app.use(express.static(__dirname + '/public'));

var exphbs  = require('express-handlebars');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())
app.engine('handlebars', exphbs.engine({ extname: '.handlebars', defaultLayout: "main"}));
app.set('view engine', 'handlebars');
app.set('views',  `${__dirname}/views`);
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
  console.log(process.env.SERVER_PORT)
  key={"key":req.params.key,"server":process.env.SERVER_PORT}
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
