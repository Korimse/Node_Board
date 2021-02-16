var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport');
const User = require('./models/User');
const util = require('./util');
require('dotenv').config()
var app = express();

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
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
app.use(flash());
app.use(session({secret:process.env.SESSION_SECRET, resave:true, saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

app.use('/', require('./routes/home'));
app.use('/posts', util.getPostQueryString, require('./routes/posts'));
app.use('/users', require('./routes/users'));
app.get('/confirm', function(req, res){  
    User.updateOne({key_for_verify:req.query.key}, {$set:{email_verified:true}}, function(err,user){
          if (err) {
        }
        else if(user.n==0){
            res.send('<script type="text/javascript">alert("Not verified"); window.location="/"; </script>');
        }
        else {
            res.send('<script type="text/javascript">alert("Successfully verified"); window.location="/"; </script>');
        }
    });
  });
  
var port = 3000;
app.listen(port, ()=> {
    console.log('server on! http://localhost:' + port);
});