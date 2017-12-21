import * as mongoose from 'mongoose';
import * as monitor from 'monitor-node';

import * as sogou from './crawlers/sogou';
import * as weixin from './crawlers/weixin';

import * as tool from './tool';
import * as config from './config';

import { Weixiner } from './models/weixiner';
import { List } from './models/list';


// sogou.search('rilegou');
// weixin.getContentList({
//   username: 'rmrbwx',
//   usercn: '人民日报',
//   userurl: 'http://mp.weixin.qq.com/profile?src=3&timestamp=1497229616&ver=1&signature=bSSQMK1LY77M4O22qTi37cbhjhwNV7C9V4aor9HLhAvbGc2ybWX*qg3WqxntZ7iqfr3vKay4XE0oA06M2z0HyA=='
// })

const main = async () => {
  try {
    // let weixiner = await Weixiner.findOneAndUpdate({ crawl_status: 1, crawl_update: { $lt: Date.now() - 1000 * 60 * 10 } }, { $set: { crawl_update: new Date() } }, { sort: { crawl_update: 1 } });
    // if (!weixiner) {
    //   weixiner = await Weixiner.findOneAndUpdate({ crawl_status: 0 }, { $set: { crawl_status: 1, crawl_update: new Date() } }, { sort: { crawl_update: 1 } });
    // }
    // let { username } = weixiner;
    let username = 'rmrbwx';
    tool.clog(`采集公众号 ${username}。`)
    // console.log(weixiner);
    let data = await sogou.search(username);
    // console.log(data);
    let { user, users } = data;
    if (!user.username) {
      tool.clog(`搜狗未找到微信号 ${username}.`);
      // return await Weixiner.findOneAndUpdate({ _id: weixiner._id }, { $set: { crawl_status: -2 } })
    }
    let lists = await weixin.getContentList(user);
    console.log(lists);
    if (!lists) {
      return;
    }
    // let promises = lists.map(async (x) => {
    //   return await List.create({
    //     username: username,
    //     crawl_url: x.content_url,
    //     crawl_status: 0,
    //     crawl_update: new Date()
    //   })
    // })
    // await Promise.all(promises);
    // await Weixiner.findOneAndUpdate({ _id: weixiner._id, crawl_status: 1 }, { $set: { crawl_status: 0, crawl_update: new Date() } });
    tool.clog(`微信号 ${username} 文章列表已存储。`);
  } catch (error) {
    tool.cerror(error);
    return await main();
  }
}

// main();

const start = async () => {
  try {
    while (true) {
      console.log('=== start ===');
      await main();
      await tool.sleep(60 * 1);
    }
  } catch (error) {
    tool.cerror(error);
  }
}

start();