// Session middleware for the COMP2110 portal

const COOKIE = 'sessionID';

const sessionMiddleware = async (request, response, next) => {

    if (COOKIE in request.cookies) {
        request.sessionID = request.cookies[COOKIE];
    }
    
    next();
};

module.exports = {COOKIE, sessionMiddleware}