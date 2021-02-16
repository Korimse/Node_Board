var express = require('express');
var router = express.Router();
var Post = require('../models/Post');
var util = require('../util');

const checkPermission = (req, res, next) => {
    Post.findOne({_id:req.params.id}, (err, post) => {
        if(err) return res.json(err);
        if(post.author != req.user.id) return util.noPermission(req, res);

        next();
    });
}

router.get('/', async (req, res) => {
    var page = Math.max(1, parseInt(req.query.page));
    var limit = Math.max(1, parseInt(req.query.limit));
    console.log(req.query.page, req.query.limit)
    page = !isNaN(page)?page:1;
    limit = !isNaN(limit)?limit:10;

    var skip = (page-1)*limit;
    var count = await Post.countDocuments({});
    var maxPage = Math.ceil(count/limit);
    var posts = await Post.find({})
        .populate('author')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .exec();

    res.render('posts/index', {
        posts:posts,
        currentPage:page,
        maxPage:maxPage,
        limit:limit
    });
});

router.get('/new', util.isLoggedin, (req, res) => {
    var post = req.flash('post')[0] || {}
    var errors = req.flash('errors')[0] || {};
    res.render('posts/new', {post:post, errors:errors});
});

router.post('/', util.isLoggedin, (req, res) => {
    req.body.author = req.user._id;
    Post.create(req.body, (err, post) => {
        if(err){
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/new' + res.locals.getPostQueryString());
        }
        res.redirect('/posts' + res.locals.getPostQueryString(false, {page:1}));
    });
});

router.get('/:id', (req, res) => {
    Post.findOne({_id:req.params.id})
        .populate('author')
        .exec((err, post) => {
        if(err) return res.json(err);
        res.render('posts/show', {post:post});
    });
});

router.get('/:id/edit', util.isLoggedin, checkPermission, function(req, res){
  var post = req.flash('post')[0];
  var errors = req.flash('errors')[0] || {};
  if(!post){
    Post.findOne({_id:req.params.id}, function(err, post){
        if(err) return res.json(err);
        res.render('posts/edit', { post:post, errors:errors });
      });
  }
  else {
    post._id = req.params.id;
    res.render('posts/edit', { post:post, errors:errors });
  }
});

router.put('/:id', util.isLoggedin, checkPermission, function(req, res){
    req.body.updatedAt = Date.now();
    Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, post){
      if(err){
        req.flash('post', req.body);
        req.flash('errors', util.parseError(err));
        return res.redirect('/posts/'+req.params.id+'/edit'+res.locals.getPostQueryString());
      }
      res.redirect('/posts/'+req.params.id + res.locals.getPostQueryString());
    });
});

router.delete('/:id', util.isLoggedin, checkPermission, (req, res) => {
    Post.deleteOne({_id:req.params.id}, (err) => {
        if(err) return res.json(err);
        res.redirect('/posts' + res.locals.getPostQueryString());
    });
});

module.exports = router;
