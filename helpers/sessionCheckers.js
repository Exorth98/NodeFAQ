
//middleWare for pages accessible ONLY WHEN CONNECTED
const sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        next();
    } else {
        res.redirect('/login');
    }    
};

//middleWare for pages accessible ONLY WHEN DISCONNECTED
const sessionCheckerOut = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/');
    } else {
        next();
    }    
};

module.exports = {sessionChecker,sessionCheckerOut}