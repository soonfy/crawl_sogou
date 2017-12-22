import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const WeixinerSchema = new Schema({
  _id: {
    type: String, // MjM5MzE3NTg3MA==
  },
  username: {
    type: String, // zjjly008
  },
  crawl_interval: {
    type: Number,
  },
  sogou_status: {
    // 0 - 准备, 1 - 正在, 2 - 错误, -2 - 名字不匹配, -1 - 没名字
    type: Number,
    default: 0
  },
  sogou_update: {
    // 0 - 准备, 1 - 正在, 2 - 错误, -2 - 名字不匹配, -1 - 没名字
    type: Date,
    default: 0
  },
})

WeixinerSchema.index({ sogou_status: 1, sogou_update: 1 });

const Weixiner = mongoose.model('WEIXINER', WeixinerSchema, 'weixiners');

export default Weixiner;
