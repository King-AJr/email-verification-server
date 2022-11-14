const router = require('express').Router();
const {signup, login, verifyCredentials} = require('../controllers/AuthFunctions')
const path =require('path');



router.post('/signup', (req, res) => {
    signup(req, res);
})

router.post('/login', (req, res) => {
    login(req, res);
})


router.get('/verify/:userId/:uniqueString', (req, res) => {
    let {userId, uniqueString} = req.params;
        verifyCredentials(userId, uniqueString, res);

})

router.get('/verified/:error/&message', (req, res) => {
    res.sendFile(path.join(__dirname, "../views/verified"));
})

module.exports = router;