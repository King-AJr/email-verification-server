const router = require('express').Router();
const {signup, login, verifyCredentials} = require('../controllers/AuthFunctions')
const path =require('path');



router.post('/signup', (req, res) => {
    signup(req, res);
})

router.post('/login', (req, res) => {
    login(req, res);
})


router.get('/verify/:userid/:uniqueString', (req, res) => {
    let {userid, uniqueString} = req.params;
        verifyCredentials(userid, uniqueString, res);

})

router.get('/verified/:error/&message', (req, res) => {
    res.sendFile(path.join(__dirname, "../views/verified"));
})

module.exports = router;