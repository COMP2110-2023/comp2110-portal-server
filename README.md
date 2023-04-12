# Server Implementation for the COMP2110 Portal

This repository implements the server side of a portal application. 
It provides authentication, an advertising server and a blog application
that can be used as part of a front-end web portal. 

The application is written using Express and uses a SQLite database
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

## API Documentation

The server supports a few different API endpoints to implement login, a blog, a task list
and an advertising server.

### Login

`POST /users/login` - authenticate a user.  POST body should contain `username` and `password`: 

```JSON
{"username": "bobalooba", "password": "bob"}
```

If successful, the response will contain:

```JSON
{
    "token": "a login token",
    "name": "the user's full name",
    "username": "the username"
}
```

The `token` should be sent back with any subsequent request requiring authorisation in
an `Authorization` header preceeded by the `Basic` keyword, eg:

```HTTP
Authorization: Basic 167fa0eb-a8ba-450c-b967-95fca3991b09
```

### Blog

`GET /blog` - Returns all current blog posts, most recent first.

```JSON
{
    "posts":[
        {
            "id":1,
            "title":"Test Post",
            "content":"Test Post Content",
            "timestamp":1679273291293,
            "creator":"bobalooba",
            "name":"Bob Bobalooba"
            }
        ]
}
```

The blog post record consists mainly of a title and the content.  The
`timestamp` field is a millisecond count suitable for creating a Javascript date
with `new Date(timestamp)`.  Creator username and name are included for convenience in
displaying the blog post.

By default, this will return up to 10 posts. The query parameters `count` and
`start` can be used to get a subset of posts.  For example `/blog?count=3` will
return three posts, `/blog?start=5&count=3`
will return three posts starting at the fifth (the `start` index starts at 1).

`GET /blog/:id` - get one blog post given it's id.  Returns the same format as
the list of posts above, just one of them.

`POST /blog` - creates a new blog post. Requires authorisation (see above).  Request
body should contain the title and content, eg:

```JSON
{
    "title": "sample blog post",
    "content": "this is my post"
}
```

The creator and timestamp for the post will be added automatically.

### Tasks 

`GET /tasks` - Returns a list of all tasks for the authenticated user, requires
authorisation (see above).  Returns a list of tasks: 

```JSON
{
  "tasks": [
    {
      "id": 1,
      "text": "Test Task",
      "status": "pending",
      "timestamp": 1679274783764
    }
  ]
}
```

The task has two parts, the text is the task description, the status is initialised
to 'pending' but can be updated to any string via a POST request (below).  The timestamp
shows the creation time of the task. Tasks are returned most recent first.

`POST /tasks` - create a new task.  Requires authorisation. The request body should
contain the task text:

```JSON
{"text":"please do this thing"}
```

Status will be initialised to 'pending'.


`POST /tasks/:id` - update the status of a task.  Requires authorisation.  The request body should contain the new status:

```JSON
{"status": "completed"}
```

The status value can be any string.

### Advertising Server

`GET /adserver`  - returns a random advertisment image.  

The advertising server also issues a session cookie and keeps track of the referring site
for each request in the user session.

`GET /adserver/tracker` - return information about sites visited by the user.  Based on
the session cookie, reports the sites that have served ads for the current user. 

`GET /adserver/report` - return overall data about session tracking with counts of users
and sessions for each referrer URL that has been recorded.