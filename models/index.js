const sqlite3 = require('sqlite3').verbose();
const config = require('../config.js');
const { open } = require('sqlite')
const bcrypt = require('bcrypt');


let db;


const initDB = async () => {
  // open the database
  db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  })
  return db;
}

const closeDB = async () => {
  await db.close();
}

const createTables = async () => {
  await db.exec('DROP TABLE IF EXISTS users');
  await db.exec(`CREATE TABLE users (
    username TEXT unique primary key,
    name TEXT,
    password TEXT,
    data TEXT
        )`);

  await db.exec('DROP TABLE IF EXISTS sessions');
  await db.exec(`CREATE TABLE sessions (
    key TEXT,
    username TEXT,
    FOREIGN KEY(username) REFERENCES users(username)
  )`);

  await db.exec('DROP TABLE IF EXISTS posts');
  await db.exec(`CREATE TABLE posts (
    title TEXT,
    content TEXT,
    timestamp INTEGER,
    creator TEXT,
    FOREIGN KEY(creator) REFERENCES users(username)
  )`);
}


const createUser = async (userinfo) => {

  const hash = await bcrypt.hash(userinfo.password, config.saltRounds)
  const result = await db.run(
    'INSERT INTO users (username, name, password) VALUES (?, ?, ?)',
    userinfo.username, userinfo.name, hash
    )
  return result.lastID;
}

const getUser = async (username) => {
  const result = await db.get(
    'SELECT username, name, password, data FROM users WHERE username=?',
    username)
  return result;
}


const createUsers = async (users) => {
  return users.forEach(async userInfo => {
      const hash = await bcrypt.hash(userInfo.password, config.saltRounds)
      const newUserInfo = {...userInfo, password: hash};
      await createUser(newUserInfo);
      console.log(newUserInfo);
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
    'SELECT username, key FROM sessions WHERE key=?',
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

module.exports = { 
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
  getPosts
}
