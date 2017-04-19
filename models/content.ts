import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ContentSchema = new Schema({
  // 
  _id: {
    type: String,
    unique: true
  },
  userid: {
    type: String,
  },
  commentid: {
    type: Number,
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
  }
})

const Content = mongoose.model('CONTENT', ContentSchema, 'so_articles');

export {
  Content
};
