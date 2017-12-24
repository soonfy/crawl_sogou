import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  title: {  // 文章标题
    type: String,
  },
  sogou_uri: {
    type: String,
  },
  create_time: {  // 采集时间
    type: Date,
  }
})

const ListArticle = mongoose.model('ListArticle', ArticleSchema, 'so_list_articles');

export default ListArticle;
