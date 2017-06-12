import * as mongoose from 'mongoose';
import * as monitor from 'monitor-node';

import * as weixin from './crawlers/weixin';

import * as tool from './tool';
import * as config from './config';

import { List } from './models/list';
import { Article } from './models/article';

const main = async () => {
  try {
    let list = await List.findOneAndUpdate({ crawl_status: 1, crawl_update: { $lt: Date.now() - 1000 * 60 * 10 } }, { $set: { crawl_update: new Date() } }, { sort: { crawl_update: 1 } });
    if (!list) {
      list = await List.findOneAndUpdate({ crawl_status: 0 }, { $set: { crawl_status: 1, crawl_update: new Date() } }, { sort: { crawl_update: 1 } });
    }
    if (!list) {
      tool.clog('所有文章列表已获取内容。休息1分钟。');
      return await tool.sleep(60);
    }
    let {username, crawl_url} = list;
    let temp = `${crawl_url.slice(0, -1)}${config.suf}`;
    temp = temp.replace(/amp;/g, '');
    let content_url = `${config.preContent}${temp}`;
    if (content_url.includes('mp.weixin.qq.com') && (!content_url.includes('signature'))) {
      tool.clog(content_url);
      tool.clog(`上面链接没有阅读量接口提取不到阅读量，跳过`);
      return await List.findOneAndUpdate({ _id: list._id }, { $set: { crawl_status: -1, crawl_update: new Date() } });
    }
    let body = await weixin.getContent(content_url);
    let cdata = JSON.parse(body);
    tool.clog(cdata.title);
    if (!cdata.title) {
      tool.clog(content_url);
      tool.clog(`文章涉嫌违规已被删除。`);
      return await List.findOneAndUpdate({ _id: list._id }, { $set: { crawl_status: -2, crawl_update: new Date() } });
    }
    let text = cdata.content_noencode.replace(/<\/?[^>]*>/g, '').replace(/&nbsp;/ig, '');
    let _id = `${cdata.bizuin}:${cdata.mid}:${cdata.idx}`;
    let article = {
      _id: _id,
      biz: cdata.bizuin,
      mid: cdata.mid,
      idx: cdata.idx,
      title: cdata.title,
      description: cdata.desc,
      content: text,
      cover: cdata.cdn_url,
      author: cdata.author,
      username,
      nickname: cdata.nick_name,
      publish_date: cdata.create_time,
      publish_time: cdata.filter_time ? new Date(cdata.filter_time * 1000) : cdata.ori_create_time ? new Date(cdata.ori_create_time * 1000) : new Date(cdata.create_time),
      created: new Date(),
      crawl_url,
      content_url,
      create_time: new Date()
    }
    await Article.findOneAndUpdate({ _id: article._id }, { $set: article }, { upsert: true });
    await List.findOneAndUpdate({ _id: list._id, crawl_status: 1 }, { $set: { crawl_status: 2, crawl_update: new Date() } });
    tool.clog(`文章链接 ${crawl_url} 采集成功。`);
  } catch (error) {
    tool.cerror(error);
    return await main();
  }
}

// main();
const start = async () => {
  try {
    while (true) {
      await main();
      let task = await monitor.update(mongoose);
      tool.clog(task);
    }
  } catch (error) {
    tool.cerror(error);
  }
}

start();