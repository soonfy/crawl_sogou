import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const WeixinerSchema = new Schema({
  _id: {
    type: String,
    unique: true
  },
  user: {
    type: String,
  },
  userurl: {
    type: String,
  },
  updated: {
    type: Date,
  },
  biz: {
    type: String,
  }
})

const Weixiner = mongoose.model('WEIXINER', WeixinerSchema, 'weixiners');

export {
  Weixiner
};