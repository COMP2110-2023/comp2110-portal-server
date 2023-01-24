# Server Implementation for the COMP2110 Portal

This repository implements the server side of a portal application. 
It provides authentication, an advertising server and a blog application
that can be used as part of a front-end web portal. 

The application is written using Express and uses a MongoDB database
to store data.

## Running

To run the server requires `node`.  First install the dependant modules:

```bash
npm install
```

Copy the file `.env.dist` to `.env` and edit to add the correct connection
URL for your MongoDB database.

Then run the server:

```bash
npm start
```
