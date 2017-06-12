import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ListSchema = new Schema({
  username: {
    type: String, // zjjly008
  },
  crawl_url: {
    type: String
  },
  crawl_status: {
    // 0 - 准备, 1 - 正在, 2 - 成功, -2 - 错误, -1 - 无效链接
    type: Number,
    default: 0
  },
  crawl_update: {
    type: Date,
  }
})

ListSchema.index({username: 1 });
ListSchema.index({crawl_update: 1 });

ListSchema.index({_id: 1, crawl_status: 1});
ListSchema.index({crawl_status: 1, crawl_update: 1});

const List = mongoose.model('LIST', ListSchema, 'so_lists');

export {
  List
};