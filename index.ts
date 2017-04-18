import * as rp from 'request-promise';
import * as cheerio from 'cheerio';

import * as fs from 'fs';

import * as tool from './tool';
import * as config from './config';

import { Weixiner } from './models/weixiner';
import { Content } from './models/content';

interface User {
  userid: string,
  username: string,
  userurl: string
}

interface Result {
  user: User,
  users: Object[]
}

interface ContentList {
  biz: string,
  contents: string
}

interface Content {
  _id: string,
  userid: string,
  commentid: number,
  sourceurl: string,
  biz: string,
  title: string,
  desc: string,
  // html: string,
  text: string,
  published: string,
  publishtime: string,
  cover: string,
}

/**
 *  搜索框查找微信号
 */
const search = async (weixin = 'rmrbwx') => {
  try {
    let url = weixin.includes(`weixin.sogou.com`) ? weixin : `http://weixin.sogou.com/weixin?type=1&query=${weixin}&ie=utf8&s_from=input&_sug_=y&_sug_type_=`;
    tool.clog(`now crawl ${url}`);

    let data: Result = {
      user: {
        userid: '',
        username: '',
        userurl: '',
      },
      users: []
    };

    config.options.url = url;
    config.options.headers['Host'] = config.sogouhost;
    let body = await rp(config.options);

    // html 写入文件
    // fs.writeFile(`./logs/${weixin}.html`, body, (error) => {
    //   if (error) {
    //     tool.cerror(error);
    //   } else {
    //     tool.clog(`html to file success.`);
    //   }
    // });

    let $ = cheerio.load(body);
    let divs = $('div.txt-box');
    divs.map((i, e) => {
      let user = $(e).find('.tit').children('a').text().trim();
      let userurl = $(e).find('.tit').children('a').attr('href');
      let username = $(e).find('.info').children('label').text().trim();
      let _user = {
        _id: username,
        user,
        userurl,
        updated: new Date
      };
      data.users.push(_user);
      if (username === weixin) {
        data.user = {
          userid: username,
          username: user,
          userurl,
        };
      }
    })
    // tool.clog(data);
    return data;
  } catch (error) {
    await tool.handler(error);
  }
}

/**
 *  获取微信号最近的文章列表
 */
const getContentList = async (user: User) => {
  try {
    let userurl;
    if (typeof user === 'string') {
      userurl = user;
    } else {
      ({ userurl } = user);
    }
    tool.clog(`now crawl ${userurl}`);

    let data: ContentList = {
      biz: '',
      contents: ''
    };
    let bizReg = /var\s*biz\s*=(.+);/;
    let msgReg = /var\s*msgList\s*=\s*([\w\W]*});/;

    config.options.url = userurl;
    config.options.headers['Host'] = config.weixinhost;
    let body = await rp(config.options);

    // html 写入文件
    // fs.writeFile(`./logs/rmrbwx-list.html`, body, (error) => {
    //   if (error) {
    //     tool.cerror(error);
    //   } else {
    //     tool.clog(`html to file success.`);
    //   }
    // });

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
    return data;
  } catch (error) {
    await tool.handler(error);
  }
}

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

    config.options.url = jsonurl;
    config.options.headers['Host'] = config.weixinhost;
    let body = await rp(config.options);
    // tool.clog(body);
    return body;
  } catch (error) {
    await tool.handler(error);
  }
}

/**
 *  获取文章阅读量
 */
const getRead = async (url) => {
  try {
    url = url.replace(/amp;/g, '');
    tool.clog(`now crawl ${url}`);

    config.options.url = url;
    config.options.headers['Host'] = config.weixinhost;
    let body = await rp(config.options);
    // tool.clog(body);
    return body;
  } catch (error) {
    await tool.handler(error);
  }
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
  return list;
}

const start = async (weixin = 'rmrbwx') => {
  try {
    let udata = await search(weixin);
    let {user, users} = udata;
    if(users.length === 0){
      await tool.handler(new Error('搜狗搜索被封。'));
      return;
    }
    let {userid} = user;
    // users 存入数据库
    let promises = users.map(async (_user) => {
      return await tool.insertdb(Weixiner, _user);
    })
    await Promise.all(promises);

    let cdata = await getContentList(user);
    let {biz, contents} = cdata;
    if (!contents.trim()) {
      await tool.handler(new Error('微信被封。'));
      return;
    }
    let _user = {
      _id: userid,
      biz: biz
    }
    await tool.insertdb(Weixiner, _user);
    let contentList = JSON.parse(contents).list;
    let lists = parseList(contentList);
    tool.clog(`${weixin} ${lists.length} 篇文章。`)

    let index = 0;
    for (let item of lists) {
      console.log(++index);
      // content 采集
      let temp = `${item.content_url.slice(0, -1)}${config.suf}`,
        sourceurl = item.source_url;
      temp = temp.replace(/amp;/g, '');
      let jsonurl = `${config.preContent}${temp}`;
      let _content = {
        userid: userid,
        contenturl: item.content_url,
        sourceurl: item.source_url,
        jsonurl: jsonurl,
        title: item.title,
        digest: item.digest,
        cover: item.cover
      }
      let cdata = await getContent(_content);
      cdata = JSON.parse(cdata);
      console.log(cdata.title);
      let commentid = cdata.comment_id;
      let text = cdata.content_noencode.replace(/<\/?[^>]*>/g, '').replace(/&nbsp;/ig, '');
      let _id = [userid, commentid].join('');
      let content: Content = {
        _id: _id,
        userid,
        commentid,
        sourceurl,
        biz: cdata.bizuin,
        title: cdata.title,
        desc: cdata.desc,
        // html: cdata.content_noencode,
        text: text,
        published: cdata.create_time,
        publishtime: cdata.ori_create_time,
        cover: cdata.cdn_url,
      }
      await tool.insertdb(Content, content);

      // read 采集
      let commenturl = `${config.preRead}${temp.slice(2)}`;
      let data = await getRead(commenturl);
      data = JSON.parse(data);
      let _read = {
        _id: _id,
        read: data.read_num,
        like: data.like_num
      }
      await tool.insertdb(Content, _read);
    }
    tool.clog(`${weixin} crawl over.`);
  } catch (error) {
    await tool.handler(error);
  }
}

const test = async () => {
  while(true){
    await start();
  }
}


if (module.parent) {
  module.exports = {
    search,
    getContentList,
    getContent,
    getRead
  }
} else {
  test();
}
