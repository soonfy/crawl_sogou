import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import * as moment from 'moment';

import * as tool from '../tool';
import * as config from '../config';

export interface User {
  username: string,
  usercn: string,
  userurl: string
}

interface ContentList {
  biz: string,
  contents: string
}

const parseList = (contentList) => {
  let list = [];
  contentList.map(item => {
    list.push(item.app_msg_ext_info);
    let subList = item.app_msg_ext_info.multi_app_msg_item_list;
    if (subList.length > 0) {
      Array.prototype.push.apply(list, subList);
    }
  })
  list = list.filter(x => x.content_url);
  return list;
}


/**
 *  获取微信号最近的文章列表
 */
const getContentList = async (user: User) => {
  try {
    let username,
      userurl;
    if (typeof user === 'string') {
      username = userurl = user;
    } else {
      ({ username, userurl } = user);
    }
    tool.clog(`now crawl ${userurl}`);
    if (!userurl) {
      tool.cerror(`get content list 链接参数是null`);
      return null;
    }

    let data: ContentList = {
      biz: '',
      contents: ''
    };
    let bizReg = /var\s*biz\s*=(.+);/;
    let msgReg = /var\s*msgList\s*=\s*([\w\W]*});/;

    config.options.url = userurl;
    config.options.headers['Host'] = config.weixinhost;
    let body = await rp(config.options);

    // 被封
    if (!tool.check(body)) {
      await tool.handler(new Error('微信文章列表被封。休息1分钟再继续。'));
      // console.log(moment().format('YYYY-MM-DD hh:mm:ss'));
      await tool.sleep(60 * 1);
      return await getContentList(user);
    }

    let $ = cheerio.load(body);
    let scripts = $('script');
    scripts.map((i, e) => {
      let text = $(e).text();
      if (text.includes(`document.domain="qq.com";`)) {
        let match = text.match(bizReg);
        if (match) {
          let biz = match[1].replace(/[^\w=]/g, '');
          data.biz = biz.trim();
        }
        match = text.match(msgReg);
        if (match) {
          data.contents = match[1].trim();
        }
      }
    })
    // tool.clog(data);
    let {biz, contents} = data;
    let contentList = JSON.parse(contents).list;
    let lists = parseList(contentList);
    // tool.clog(lists);
    tool.clog(`${user.username} ${lists.length} 篇文章。`)
    return lists;
  } catch (error) {
    await tool.handler(error);
  }
}

// https://mp.weixin.qq.com/s?timestamp=1497231627&src=3&ver=1&signature=QUOtEw028BjTkmfM9qLizzmvRhZLgtzKJcn7noVSL-kxi4smkuiCFFFGuCfa1Qo0qEmUFqL7a2JHnh5A-cyS2QevF*ZiplzqZW7sj5rfarbEPH4Ujd9ufl52vICVQd5FvBU-SyGE5eTF2sFGPapggzq4syxSlv-XmfxAWNxiaM4%3D&&uin=&key=&pass_ticket=&wxtoken=&devicetype=&clientversion=0&x5=0&f=json
/**
 *  获取文章内容
 */
const getContent = async (_content) => {
  try {
    let jsonurl;
    if (typeof _content === 'string') {
      jsonurl = _content;
    } else {
      ({ jsonurl } = _content);
    }
    jsonurl = jsonurl.replace(/amp;/g, '');
    tool.clog(`now crawl ${jsonurl}`);
    if (!jsonurl) {
      tool.cerror(`get content 链接参数是null`);
      return '';
    }

    config.options.url = jsonurl;
    config.options.headers['Host'] = config.weixinhost;
    let body = await rp(config.options);
    // tool.clog(body);
    return body;
  } catch (error) {
    await tool.handler(error);
  }
}

export {
  getContentList,
  getContent
}