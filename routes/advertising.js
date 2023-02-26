/*
 * Serve advertising images, keep track of users
 * and the pages they have visited in doing so
 * 
 */
const {randomInt} = require('crypto');
const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', (request, response) => {
    if (request.headers.referer) {
        const referer = request.headers.referer;
        if (request.session.sites) {
            const entry = request.session.sites;
            if (referer in entry) {
                entry[referer] += 1;
            } else {
                entry[referer] = 1;
            }
            request.session.sites = entry;
        } else {
            request.session.sites = {};
            request.session.sites[referer] = 1;
        }
    }
    // select an image
    const images = fs.readdirSync('public/images/ad-images/');
    const choice = images[randomInt(images.length)];    
    response.sendFile(`public/images/ad-images/${choice}`,
                       {root: '.'});
})


router.get('/report', (request, response) => {
    if (request.session.sites) {
        response.json(request.session.sites);
    } else {
        response.send('We have no referer information for you');
    }
})

module.exports = router