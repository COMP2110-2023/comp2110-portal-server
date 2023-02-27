const sqlite3 = require('sqlite3').verbose();
const config = require('../config.js');
const { open } = require('sqlite')
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');


let db;

const DB_DIR = process.env.DB_DIR ? process.env.DB_DIR : '.';

const initDB = async () => {
  // open the database
  console.log('opening database at:', DB_DIR + '/database.db');
  db = await open({
    filename: DB_DIR + '/database.db',
    driver: sqlite3.Database
  })
  return db;
}

const closeDB = async () => {
  await db.close();
}

const createTables = async () => {
  // await db.exec('DROP TABLE IF EXISTS users');
  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    username TEXT unique primary key,
    name TEXT,
    password TEXT,
    data TEXT
        )`);

  // await db.exec('DROP TABLE IF EXISTS sessions');
  await db.exec(`CREATE TABLE IF NOT EXISTS sessions (
    key TEXT,
    username TEXT,
    FOREIGN KEY(username) REFERENCES users(username)
  )`);


  await db.exec(`CREATE TABLE IF NOT EXISTS cookiesessions (
    sessionid TEXT,
    data TEXT
  )`);

  // await db.exec('DROP TABLE IF EXISTS posts');
  await db.exec(`CREATE TABLE IF NOT EXISTS posts (
    title TEXT,
    content TEXT,
    timestamp INTEGER,
    creator TEXT,
    FOREIGN KEY(creator) REFERENCES users(username)
  )`);
}


const createUser = async (userinfo) => {

  const user = await getUser(userinfo.username);
  if (user) {
    console.log('user exists', userinfo.username);
    return user.id;
  }

  const hash = await bcrypt.hash(userinfo.password, config.saltRounds)
  const result = await db.run(
    'INSERT INTO users (username, name, password) VALUES (?, ?, ?)',
    userinfo.username, userinfo.name, hash
    )
  console.log('user created', userinfo.username);
  return result.lastID;
}

const getUser = async (username) => {
  const result = await db.get(
    'SELECT username, name, password, data FROM users WHERE username=?',
    username);
  return result;
}

const createUsers = async (users) => {
  return users.forEach(async userInfo => {
      const hash = await bcrypt.hash(userInfo.password, config.saltRounds)
      const newUserInfo = {...userInfo, password: hash};
      await createUser(newUserInfo);
      console.log("here", userInfo, newUserInfo);
  })
}

const createSession = async (username, key) => {
  const result = await db.run(
    'INSERT INTO sessions (username, key) VALUES (?, ?)',
    username, key
  );
  return {username, key}
}

const getUserSession = async (username) => {
  const result = await db.get(
    'SELECT username, key FROM sessions WHERE username=?',
    username)
  return result;
}

const getKeySession = async (key) => {
  const result = await db.get(
    'SELECT key, username FROM sessions WHERE key=?',
    key)
  return result;
}

const clearSessions = async () => {
  await db.exec('DROP FROM sessions');
}

const createPost = async (title, content, creator) => {
  const timestamp = Date.now()
  const result = await db.run(
    'INSERT INTO posts (title, content, timestamp, creator) VALUES (?, ?, ?, ?)',
    title, content, timestamp, creator
  );
  return result.lastID;
}

const getPosts = async (count) => {
  const result = await db.all(
    `SELECT posts.rowid as id, title, content, timestamp, creator, users.name
    FROM posts, users
    WHERE posts.creator=users.username
    ORDER BY timestamp
    LIMIT ?`,
    count)
  if (!result) {
    return []
  }
  return result;
}

const getPost = async (id) => {
  const result = await db.get(
    'SELECT rowid as id, title, content, timestamp, creator FROM posts WHERE rowid=?',
    id)
  return result;
}


const getOrCreateCookieSession = async (sessionID) => {
  let session = {}

  if (!sessionID || sessionID === 'undefined') {
    sessionID = randomUUID();
  }

  const created = await db.run(
    'INSERT INTO cookiesessions (sessionid, data) VALUES (?, ?)',
    sessionID, '{}'
  );
 
  const get = await db.get(
    "SELECT sessionid, data FROM cookiesessions WHERE sessionid=?",
    sessionID
  );
  if (get) {
    console.log("query result", get);
      session = JSON.parse(get.data);
  }
  console.log('GOCS', sessionID, session);
  return {sessionID, session};
}


const getCookieSession = async (sessionid) => {
  console.log('getCookieSession', sessionid);
  const result = await db.get(
    "SELECT sessionid, data FROM cookiesessions WHERE sessionid=?",
    sessionid
  );
  console.log('result', result);
  if (result) {
    return JSON.parse(result.data);
  } else {
    console.log("no session for ", sessionid);
  }
}


const updateCookieSession = async (sessionid, data) => {
  console.log('updateCookieSession', sessionid, data);
  const result = await db.get(
    "UPDATE cookiesessions SET data=? WHERE sessionid=?",
    JSON.stringify(data), sessionid
  )
}

module.exports = { 
  DB_DIR,
  initDB, 
  closeDB,
  createTables, 
  createUser, 
  createSession, 
  getUser, 
  createUsers,
  getUserSession, 
  getKeySession,
  clearSessions,
  createPost,
  getPost,
  getPosts,
  getOrCreateCookieSession,
  getCookieSession,
  updateCookieSession
}
