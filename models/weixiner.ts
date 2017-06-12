import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const WeixinerSchema = new Schema({
  _id: {
    type: String, // MjM5MzE3NTg3MA==
  },
  username: {
    type: String, // zjjly008
  },
  crawl_status: {
    // 0 - 准备, 1 - 正在, 2 - 错误, -2 - 名字不匹配, -1 - 没名字
    type: Number,
    default: 0
  },
  crawl_update: {
    type: Date,
  }
})

WeixinerSchema.index({username: 1 });
WeixinerSchema.index({crawl_update: 1 });

WeixinerSchema.index({_id: 1, crawl_status: 1});
WeixinerSchema.index({crawl_status: 1, crawl_update: 1});

const Weixiner = mongoose.model('WEIXINER', WeixinerSchema, 'so_weixiners');

export {
  Weixiner
};