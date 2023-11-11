express = require('express')
var path = require('path');
require('dotenv').config(".env")

var session = require('express-session')
const app = express();



app.use(express.static(path.join(__dirname, '../public')));
var exphbs  = require('express-handlebars');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())
app.engine('handlebars', exphbs.engine({ extname: '.handlebars', defaultLayout: "main"}));
app.set('view engine', 'handlebars');
app.set('views',  `${__dirname}/views`);
app.use(session({ secret: 'edlBz4FDdbvgIuZlOGEresgliR0', cookie: { maxAge: 60000 }}))
const {checkGameFree}= require("./redis.js")
const crypto = require('crypto')





app.get('/', function (req, res) {
  res.render('home_page');
})

app.get('/full', function (req, res) {
  res.render('full');
})


app.get('/create', function (req, res) {
  key={"server":process.env.CLIENT_URL}
  res.render('create_game',key);
})

app.get('/create_game', function (req, res) {
  let code=crypto.randomBytes(15).toString('hex');
  res.json(code)
})


app.get('/join/', function (req, res) {
  key={"server":process.env.CLIENT_URL}
  res.render('join_game',key)
})

app.post('/check_game', async function (req, res) {
  let status=await checkGameFree(req.body.key)
  res.json(status)
})



app.get('/game/:key', function (req, res) {
  key={"key":req.params.key,"server":process.env.SOCKET_IO_URL}
  res.render('game',key)
})




const PORT = process.env.CLIENT_PORT || 8090
app.listen(PORT, () => {
    console.log(`Express App listening to ${PORT}....`)
    console.log('Press Ctrl+C to quit.')
})
