/*
 * Serve advertising images, keep track of users
 * and the pages they have visited in doing so
 * 
 */
const { randomInt } = require('crypto');
const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', (request, response) => {
    if (request.headers.referer) {
        if (request.session.sites) {
            request.session.sites.push(request.headers.referer);
        } else {
            request.session.sites = [request.headers.referer];
        }
    }
    // select an image
    const images = ['Slide1.png', 'Slide2.png']

    const choice = images[randomInt(images.length)]
    
    response.sendFile(`public/images/ad-images/${choice}`,
                       {root: '.'})
})


router.get('/report', (request, response) => {
    if (request.session.sites) {
        response.json(request.session.sites);
    } else {
        response.send('We have no referer information for you');
    }
})

module.exports = router