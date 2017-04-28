import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ContentSchema = new Schema({
  // 
  _id: {
    type: String,
    unique: true
  },
  username: {
    type: String,
  },
  nonce: {
    type: Number,
  },
  commentid: {
    type: Number,
  },
  contenturl: {
    type: String,
  },
  sourceurl: {
    type: String,
  },
  biz: {
    type: String,
  },
  title: {
    type: String,
  },
  desc: {
    type: String,
  },
  text: {
    type: String,
  },
  published: {
    type: String,
  },
  publishtime: {
    type: Number,
  },
  cover: {
    type: String,
  },
  read: {
    type: Number,
  },
  like: {
    type: Number,
  },
  created: {
    type: Date,
    index: true
  },
  server: {
    type: String
  }
})

const Content = mongoose.model('CONTENT', ContentSchema, 'so_articles');

export {
  Content
};
