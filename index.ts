import * as rp from 'request-promise';
import * as cheerio from 'cheerio';

import * as fs from 'fs';

import * as tool from './tool';
import * as config from './config';

import { Weixiner } from './models/weixiner';
import { Content } from './models/content';

interface User {
  username: string,
  usercn: string,
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
  username: string,
  nonce: number,
  commentid: number,
  contenturl: string,
  sourceurl: string,
  biz: string,
  title: string,
  desc: string,
  // html: string,
  text: string,
  published: string,
  publishtime: string,
  cover: string,
  created: {}
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
      await tool.handler(new Error('搜狗搜索被封。'));
      // fs.writeFile(`./logs/error-${weixin}.html`, body, (error) => {
      //   if (error) {
      //     tool.cerror(error);
      //   } else {
      //     tool.clog(`html to file success.`);
      //   }
      // });
      await tool.changeip();
      return data = null;
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

    // 被封, html 写入文件
    if (!tool.check(body)) {
      await tool.handler(new Error('微信文章列表被封。'));
      // fs.writeFile(`./logs/error-${username}-list.html`, body, (error) => {
      //   if (error) {
      //     tool.cerror(error);
      //   } else {
      //     tool.clog(`html to file success.`);
      //   }
      // });
      // await tool.changeip();
      return data = null;
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

/**
 *  获取文章阅读量
 */
const getRead = async (url) => {
  try {
    url = url.replace(/amp;/g, '');
    tool.clog(`now crawl ${url}`);
    if (!url) {
      tool.cerror(`get read 链接参数是null`);
      return '';
    }

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
  list = list.filter(x => x.content_url);
  return list;
}

const start = async (id, weixin) => {
  try {
    let status = true;
    let udata = await search(weixin);
    if (!udata) {
      tool.cerror(`搜狗搜索被封。已自动重新拨号。`);
      return status = false;
    }
    let {user, users} = udata;
    // users 存入数据库
    // let promises = users.map(async (_user) => {
    //   _user._id = id;
    //   return await tool.insertdb(Weixiner, _user);
    // })
    // await Promise.all(promises);

    if (!user.username) {
      tool.clog(`微信 id- ${weixin} 未匹配到微信账号。跳过。`);
      return status;
    }
    tool.clog(user);

    // user 更新 usercn, userurl
    user._id = id;
    await tool.insertdb(Weixiner, user);
    
    let {username} = user;
    let cdata = await getContentList(user);
    if (!cdata) {
      tool.cerror(`微信文章列表被封。已自动重新拨号。`);
      return status = false;
    }
    let {biz, contents} = cdata;
    let _user = {
      _id: id,
      biz
    }
    // user 更新 biz
    await tool.insertdb(Weixiner, _user);

    let contentList = JSON.parse(contents).list;
    let lists = parseList(contentList);
    tool.clog(`${weixin} ${lists.length} 篇文章。`)

    let index = 0;
    for (let item of lists) {
      await tool.sleep(3);
      tool.clog(++index);

      // content 采集
      let temp = `${item.content_url.slice(0, -1)}${config.suf}`,
        sourceurl = item.source_url;
      temp = temp.replace(/amp;/g, '');
      
      // 部分链接没有阅读量接口提取不到阅读量，跳过
      // https://mp.weixin.qq.com/s?__biz=MjM5NzcxNzEyMA==&mid=2649675104&idx=3&sn=3638a6f427178805010b3eb5187139f5&chksm=becfc08f89b84999b31fef2cd28e7b4e1ac8e79a281300590dbdaae8f8ba12a705d590675e88&scene=27#wechat_redirect
      if (temp.includes('mp.weixin.qq.com') && (!temp.includes('signature'))) {
        tool.clog(temp);
        tool.clog(`上面链接没有阅读量接口提取不到阅读量，跳过`);
        continue;
      }

      let jsonurl = `${config.preContent}${temp}`;
      let _content = {
        username: username,
        contenturl: item.content_url,
        sourceurl: item.source_url,
        jsonurl: jsonurl,
        title: item.title,
        digest: item.digest,
        cover: item.cover
      }
      let cdata = await getContent(_content);
      if (!cdata) {
        tool.cerror(`文章内容数据返回 null`);
        return status = false;
      }
      cdata = JSON.parse(cdata);
      tool.clog(cdata.title);
      if (!cdata.title) {
        tool.clog(temp);
        tool.clog(`文章涉嫌违规已被删除。`);
        continue;
      }
      let nonce = cdata.csp_nonce_str;
      let text = cdata.content_noencode.replace(/<\/?[^>]*>/g, '').replace(/&nbsp;/ig, '');
      let _id = [username, nonce].join('');
      let content: Content = {
        _id: _id,
        username,
        nonce: cdata.csp_nonce_str,
        commentid: cdata.comment_id,
        contenturl: jsonurl,
        sourceurl,
        biz: cdata.bizuin,
        title: cdata.title,
        desc: cdata.desc,
        // html: cdata.content_noencode,
        text: text,
        published: cdata.create_time,
        publishtime: cdata.ori_create_time,
        cover: cdata.cdn_url,
        created: new Date()
      }
      // contents 插入数据库
      await tool.insertdb(Content, content);

      // read 采集
      let commenturl = `${config.preRead}${temp.slice(2)}`;
      let data = await getRead(commenturl);
      if (!data) {
        tool.cerror(`文章阅读数据返回 null`);
        return status = false;
      }
      try {
        data = JSON.parse(data);
      } catch (error) {
        data = data.replace('\u0014\u0003', ' ');
        data = JSON.parse(data);
      }
      let _read = {
        _id: _id,
        read: data.read_num,
        like: data.like_num
      }
      // contents 更新 read, like
      await tool.insertdb(Content, _read);
    }
    tool.clog(`${weixin} crawl over.`);
    return status;
  } catch (error) {
    await tool.handler(error);
  }
}

const test = async () => {
  try {
    while (true) {
      let weixiner = await Weixiner.findOneAndUpdate({ sostatus: 0 }, { $set: { sostatus: 1 } }, { sort: { soupdated: 1 } });
      if (weixiner) {
        let id = weixiner._id;
        let weixin = weixiner.username;
        tool.clog(`now crawl weixin ${weixin}`);
        let status = await start(id, weixin);
        tool.clog(status);
        if (status) {
          await Weixiner.findOneAndUpdate({ _id: id }, { $set: { sostatus: 0, soupdated: new Date() } });
        } else {
          await Weixiner.findOneAndUpdate({ _id: id }, { $set: { sostatus: 0 } });
        }
        tool.clog(`crawl ${weixin} over, next.`);
        tool.clog(`==> ==> ==> ==> ==> ==> ==> ==> ==>`);
        id = null;
        weixin = null;
      } else {
        tool.clog(`所有微信号已更新。休息十分钟。`);
        tool.clog(`====================================`);
        await tool.sleep(60 * 10);
      }
    }
  } catch (error) {
    tool.handler(error);
    await test();
  }
}


if (module.parent) {
  module.exports = {
    search,
    getContentList,
    getContent,
    getRead,
    start,
    parseList
  }
} else {
  tool.clog(`第 1 个参数是数据库地址，应用在 config 文件；第 2 个参数是服务器密码，应用在 tool 文件。`);
  tool.clog(process.argv);
  if (process.argv.length < 3) {
    tool.cerror(`缺少参数。`);
    process.exit();
  } else if(process.argv.length < 4) {
    tool.clog(`缺少服务器密码参数，只能本地测试或者初始化。`);
  }
  test();
}
