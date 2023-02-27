// Session middleware for the COMP2110 portal

const COOKIE = 'sessionID';

const sessionMiddleware = async (request, response, next) => {

    console.log('middleware', request.cookies);
    if (COOKIE in request.cookies) {
        console.log('got sessionid from cookie');
        request.sessionID = request.cookies[COOKIE];
    }
    
    next();
};

module.exports = {COOKIE, sessionMiddleware}