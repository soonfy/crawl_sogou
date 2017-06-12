import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import * as moment from 'moment';

import * as tool from '../tool';
import * as config from '../config';

interface User {
  username: string,
  usercn: string,
  userurl: string
}

interface Result {
  user: User,
  users: Object[]
}

/**
 *  搜索框查找微信号
 */
const search = async (weixin) => {
  try {
    let url = weixin.includes(`weixin.sogou.com`) ? weixin : weixin ? `http://weixin.sogou.com/weixin?type=1&query=${weixin}&ie=utf8&s_from=input&_sug_=y&_sug_type_=` : weixin;
    tool.clog(`now crawl ${url}`);
    if (!url) {
      tool.cerror(`search 链接参数是null`);
      return null;
    }

    let data: Result = {
      user: {
        username: '',
        usercn: '',
        userurl: '',
      },
      users: []
    };

    config.options.url = url;
    config.options.headers['Host'] = config.sogouhost;
    let body = await rp(config.options);

    // 被封, html 写入文件
    if (!tool.check(body)) {
      await tool.handler(new Error('搜狗搜索被封。休息一分钟再继续。'));
      // console.log(moment().format('YYYY-MM-DD hh:mm:ss'));
      await tool.sleep(60 * 1);
      return await search(weixin);
    }

    let $ = cheerio.load(body);
    let divs = $('div.txt-box');
    divs.map((i, e) => {
      let usercn = $(e).find('.tit').children('a').text().trim();
      let userurl = $(e).find('.tit').children('a').attr('href');
      let username = $(e).find('.info').children('label').text().trim();
      let _user = {
        username,
        usercn,
        userurl,
        updated: new Date
      };
      data.users.push(_user);
      if (username === weixin) {
        data.user = {
          username,
          usercn,
          userurl,
        };
      }
    })
    tool.clog(data);
    return data;
  } catch (error) {
    await tool.handler(error);
  }
}

export {
  search
}