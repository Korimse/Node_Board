var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../util');
const crypto = require('crypto');
var mailSender = require('../config/email')

const checkPermission = (req, res, next) => {
  User.findOne({username:req.params.username}, function(err, user){
   if(err) return res.json(err);
   if(user.id != req.user.id) return util.noPermission(req, res);
 
   next();
  });
}

router.get('/new', (req, res)=>{
    var user = req.flash('user')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('users/new', {user:user, errors:errors});
});

router.post('/', (req, res) => {
  var key_one = crypto.randomBytes(256).toString('hex').substr(100, 5);
  var key_two = crypto.randomBytes(256).toString('hex').substr(50, 5);
  var key_for_verify = key_one + key_two;
  req.body['key_for_verify'] = key_for_verify;
  User.create(req.body, (err, user) => {
    if(err) {
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/users/new');
    }
    let emailParam = {
      toEmail : req.body.email,
      key_for_verify: req.body.key_for_verify
    };
    mailSender.sendGmail(emailParam);
    res.redirect('/')
  });
});

router.get('/:username', util.isLoggedin, (req, res) => {
  User.findOne({username:req.params.username}, (err, user) => {
    if(err) return res.json(err);
    res.render('users/show', {user:user});
  });
});

router.get('/:username/edit', util.isLoggedin, checkPermission, (req, res) => {
    var user = req.flash('user')[0];
    var errors = req.flash('errors')[0] || {};
    if(!user){
      User.findOne({username:req.params.username}, (err, user) => {
        if(err) return res.json(err);
        res.render('users/edit', { username:req.params.username, user:user, errors:errors });
      });
    }
    else {
      res.render('users/edit', { username:req.params.username, user:user, errors:errors });
    }
  });

router.put('/:username', util.isLoggedin, checkPermission, (req, res, next) => {
  User.findOne({username:req.params.username})
    .select('password')
    .exec((err, user) => {
      if(err) return res.json(err);

      user.originalPassword = user.password;
      user.password = req.body.newPassword? req.body.newPassword : user.password;
      for(var p in req.body){
        user[p] = req.body[p];
      }
  
      user.save((err, user) => {
        if(err){
          req.flash('user', req.body);
          req.flash('errors', util.parseError(err));
          return res.redirect('/users/'+req.params.username+'/edit');
        }
        res.redirect('/users/'+user.username);
      });
  });
});

module.exports = router;
