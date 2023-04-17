const sqlite3 = require('sqlite3').verbose();
const config = require('../config.js');
const { open } = require('sqlite')
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');


let db;

const DB_DIR = process.env.DB_DIR ? process.env.DB_DIR : '.';

const initDB = async () => {
  // open the database
  // console.log('opening database at:', DB_DIR + '/database.db');
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

  await db.exec(`CREATE TABLE IF NOT EXISTS tasks (
      text TEXT,
      status TEXT,
      timestamp INTEGER,
      creator TEXT,
      FOREIGN KEY(creator) REFERENCES users(username)
    )`);
}


const clearTables = async () => {
  await db.run('DELETE FROM users');
  await db.run('DELETE FROM sessions');
  await db.run('DELETE FROM cookiesessions');
  await db.run('DELETE FROM posts');
  await db.run('DELETE FROM tasks');
}

const createUser = async (userinfo) => {

  const user = await getUser(userinfo.username);
  if (user) {
    console.log('user exists', userinfo.username, 'updating password');
    // update the password
    const hash = await bcrypt.hash(userinfo.password, config.saltRounds)
    const result = await db.run(
      "UPDATE users SET password=? WHERE username=?",
      hash, user.username
    )
    return result.lastID;
  }
  const hash = await bcrypt.hash(userinfo.password, config.saltRounds)
  const result = await db.run(
    'INSERT INTO users (username, name, password) VALUES (?, ?, ?)',
    userinfo.username, userinfo.name, hash
    )
  // console.log('user created', userinfo.username);
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

const getPosts = async (start, count) => {
  const result = await db.all(
    `SELECT posts.rowid as id, title, content, timestamp, creator, users.name
    FROM posts, users
    WHERE posts.creator=users.username
    ORDER BY timestamp DESC
    LIMIT ?`,
    count + start)
  if (!result) {
    return []
  }
  return result.slice(start-1, start+count-1)
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
    session = JSON.parse(get.data);
  }
  return {sessionID, session};
}


const getCookieSession = async (sessionid) => {
  const result = await db.get(
    "SELECT sessionid, data FROM cookiesessions WHERE sessionid=?",
    sessionid
  );
  if (result) {
    return JSON.parse(result.data);
  } else {
    console.log("no session for ", sessionid);
  }
}

const cookieSessionReport = async () => {
  const result = await db.all("SELECT sessionid, data FROM cookiesessions");
  if (result) {
    // need to parse all of the data JSON
    const report = {};
    result.map((entry) => {
      if (entry.data) {
        const data = JSON.parse(entry.data);
        if ('sites' in data) {
          for (url in data.sites) {
                        if (url in report) {
              const {users, views} = report[url]
              report[url] = {users: users+1, views: views + data.sites[url]};
            } else {
              report[url] = {users: 1, views: data.sites[url]};
            }
          }
        }
      }
    });
    return report;
  } else {
    return []
  }
}


const updateCookieSession = async (sessionid, data) => {
  console.log('updateCookieSession', sessionid, data);
  const result = await db.get(
    "UPDATE cookiesessions SET data=? WHERE sessionid=?",
    JSON.stringify(data), sessionid
  )
}


const createTask = async (creator, text) => {
  const timestamp = Date.now()
  const result = await db.run(
    'INSERT INTO tasks (text, timestamp, creator, status) VALUES (?, ?, ?, ?)',
    text, timestamp, creator, 'pending'
  );
  return result.lastID;
}

const getTasks = async (username, count) => {
  const result = await db.all(
    `SELECT rowid as id, text, status, timestamp
    FROM tasks
    WHERE creator=?
    ORDER BY timestamp
    LIMIT ?`,
    username, count)
  if (!result) {
    return []
  }
  return result;
}

const updateTask = async (creator, id, status) => {
  // check that creator owns the task
  const check = await db.get(
      'SELECT rowid as id FROM tasks WHERE rowid=? AND creator=?',
      id, creator);
  console.log("Check: ", check);
  if (!check) {
    return null;
  }

  console.log('updating task', id, status);
  const result = await db.run(
    'UPDATE tasks SET status=? WHERE rowid=?',
    status, id
  ); 
  console.log('done update', result);
  return result.lastID;
}

const getTask = async (username, id) => {
  const result = await db.get(
    'SELECT rowid as id, text, status, timestamp, creator FROM tasks WHERE rowid=? AND creator=?',
    id, username)
  return result;
}


module.exports = { 
  DB_DIR,
  initDB, 
  closeDB,
  createTables, 
  clearTables,
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
  updateCookieSession,
  cookieSessionReport,
  createTask,
  updateTask,
  getTask,
  getTasks,
}
