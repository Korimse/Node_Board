var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var app = express();

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
require('dotenv').config()
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once('open', () => {
    console.log('DB connected');
});
db.once('error', (err) => {
    console.log('DB ERROR : ', err);
});

app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.use('/', require('./routes/home'));

var port = 3000;
app.listen(port, ()=> {
    console.log('server on! http://localhost:' + port);
});