import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const WeixinerSchema = new Schema({
  _id: {
    type: String, // MjM5MzE3NTg3MA==
    unique: true
  },
  username: {
    type: String, // zjjly008
    index: true
  },
  usercn: {
    type: String, // 
  },
  userurl: {
    type: String,
  },
  soupdated: {
    type: Date,
  },
  sostatus: {
    // 0 - 准备, 1 - 正在, 2 - 错误
    type: Number,
    default: 0
  },
  biz: {
    type: String,
  }
})

WeixinerSchema.index({sostatus: 1, soupdated: 1});

const Weixiner = mongoose.model('WEIXINER', WeixinerSchema, 'so_weixiners');

export {
  Weixiner
};