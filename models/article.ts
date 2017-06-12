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
    type: String,
  },
  idx: {  // 消息偏移
    type: String,
  },
  title: {  // 文章标题
    type: String,
  },
  description: {  // 文章摘要
    type: String,
  },
  content: {  // 文章内容
    type: String,
  },
  cover: {  // 插图链接
    type: String,
  },
  author: { // 作者
    type: String,
  },
  username: { // 账号名
    type: String,
  },
  nickname: { // 中文名
    type: String,
  },
  publish_date: { // 发布日期
    type: String,
  },
  publish_time: { // 发布时间
    type: Date,
  },
  read: { // 阅读量
    type: Number,
  },
  like: { // 点赞量
    type: Number,
  },
  crawl_url: { // 列表链接
    type: String,
  },
  content_url: { // 内容链接
    type: String,
  },
  create_time: {  // 采集时间
    type: Date,
  }
})

ArticleSchema.index({username: 1 });
ArticleSchema.index({create_time: 1 });
ArticleSchema.index({publish_time: 1 });


const Article = mongoose.model('ARTICLE', ArticleSchema, 'so_articles');

export {
  Article
};
