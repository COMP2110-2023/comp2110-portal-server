const mongoose = require('mongoose');
const config = require('../config.js');

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    name: String,
    password: String,
    data: Object,
  })

const User = mongoose.model('User', userSchema)

const sessionSchema = new mongoose.Schema({
    username: {type: String, unique: true},   // enforce one session per user
    key: String,
})

const Session = mongoose.model('Session', sessionSchema);

/* blog posts */
const postSchema = new mongoose.Schema({
    title: String,
    timestamp: {type: Date, default: Date.now},
    creator: {type: mongoose.Types.ObjectId, ref: 'User'},
    content: String
  })

const Post = mongoose.model('Post', postSchema)

const initDB = async () => {
  console.log("Connecting to database on ", config.mongoDBUrl);
  mongoose.set('strictQuery', false);
  await mongoose
      .connect(config.mongoDBUrl)
      .catch((error) => {    
          console.log('error connecting to MongoDB:', error.message)  
      })
  }

module.exports = { initDB, User, Session, Post }
