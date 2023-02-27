/*
 * Serve advertising images, keep track of users
 * and the pages they have visited in doing so
 * 
 */
const {randomInt} = require('crypto');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const models = require('../models');
const cookie = require('cookie');
const {COOKIE} = require('../sessions');

router.get('/', async (request, response) => {

    const referer = request.headers.referer;
    const {sessionID, session} = await models.getOrCreateCookieSession(request.sessionID);;

    if (request.headers.referer) {
        if ('sites' in session) {
            const entry = session.sites;
            if (referer in entry) {
                entry[referer] += 1;
            } else {
                entry[referer] = 1;
            }
            session.sites = entry;
        } else {
            session.sites = {};
            session.sites[referer] = 1;
        }
        await models.updateCookieSession(sessionID, session);
    }
    const cookieHeader = cookie.serialize(COOKIE, sessionID, {sameSite: "none", secure: true});
    response.setHeader('Set-Cookie', cookieHeader);

    // select an image
    const images = fs.readdirSync('public/images/ad-images/');
    const choice = images[randomInt(images.length)];    
    response.sendFile(`public/images/ad-images/${choice}`,
                       {root: '.'});
})


router.get('/tracker', async (request, response) => {
    const {session} = await models.getOrCreateCookieSession(request.sessionID);;

    if ('sites' in session) {
        response.json(session.sites);
    } else {
        response.send('We have no referer information for you');
    }
})

router.get('/report', async (request, response) => {
    const report = await models.cookieSessionReport();
    response.json(report);
})

module.exports = router