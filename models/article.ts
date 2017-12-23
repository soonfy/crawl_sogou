import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  _id: {  // biz:mid:idx
    type: String,
  },
  biz: {  // 账号id
    type: String,
  },
  mid: {  // 消息id
    type: Number,
  },
  idx: {  // 消息偏移
    type: Number,
  },
  title: {  // 文章标题
    type: String,
  },
  author: { // 作者
    type: String,
  },
  content: {  // 文章内容
    type: String,
  },
  read: { // 阅读量
    type: Number,
  },
  like: { // 点赞量
    type: Number,
  },
  copyright: {  // 文章内容
    type: Boolean,
  },
  last_modified_at: {
    type: Date,
  },
  sogou_uri: {
    type: String,
  },
  create_time: {  // 采集时间
    type: Date,
  }
})

const Article = mongoose.model('ARTICLE', ArticleSchema, 'so_articles');

export default Article;
