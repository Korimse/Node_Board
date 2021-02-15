var express = require('express');
var router = express.Router();
var User = require('../models/User');

router.get('/', (req, res) => {
    User.find({})
    .sort({username:1})
    .exec((err, users)=>{
        if(err) return res.json(err);
        res.render('users/index', {users:users});
    });
});

router.get('/new', (req, res)=>{
    res.render('users/new');
});

router.post('/', (req, res) => {
    User.create(req.body, (err, user) => {
        if(err) return res.json(err);
        res.redirect('/users');
    });
});

router.get('/:username', (req, res) => {
    User.findOne({username:req.params.username}, (err, user) => {
        if(err) return res.json(err);
        res.render('users/show', {user:user});
    });
});

router.get('/:username/edit', (req, res) => {
    User.findOne({username:req.params.username}, (err, user) => {
        if(err) return res.json(err);
        res.render('users/edit', {user:user});
    });
});

router.put('/:username', (req, res, next) => {
    User.findOne({username:req.params.username})
    .select('password')
    .exec((err, user) => {
        if(err) return res.json(err);

        user.originalPassword = user.password;
        user.password = req.body.newPassword? req.body.newPassword : user.password;
        for(var p in req.body) {
            user[p] = req.body[p];
        }

        user.save((err, user) => {
            if(err) return res.json(err);
            res.redirect('/users/'+user.username);
        });
    });
});

router.delete('/:username', (req, res) => {
    User.deleteOne({username:req.params.username}, (err) => {
        if (err) return res.json(err);
        res.redirect('/users');
    });
});

module.exports = router;

