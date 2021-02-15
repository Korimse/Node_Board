var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.render('home/welcome');
});

router.get('/about', (req, res) => {
    res.render('home/about');
});

module.exports = router;