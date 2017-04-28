import { search, getContentList, parseList, getContent, getRead } from './index';

import * as tool from './tool';
import * as config from './config';

const start = async (weixin = 'rmrbwx', time = 60) => {
  try {
    tool.clog(`now is test ${weixin}.`);

    // await tool.sleep(time);
    let udata = await search(weixin);
    tool.clog(udata);

    let {user, users} = udata;
    let {username} = user;
    let cdata = await getContentList(user);
    if (!cdata) {
      console.log(`没有获取到数据。`);
      process.exit();
    }
    let {biz, contents} = cdata;
    let contentList = JSON.parse(contents).list;
    let lists = parseList(contentList);
    tool.clog(`${weixin} ${lists.length} 篇文章。`);

    let index = 0;
    for (let item of lists) {
      tool.clog(++index);

      // content 采集
      let temp = `${item.content_url.slice(0, -1)}${config.suf}`,
        sourceurl = item.source_url;
      temp = temp.replace(/amp;/g, '');

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
      await tool.sleep(time);
      let cdata = await getContent(_content);
      if (!cdata) {
        tool.cerror(`文章内容数据返回 null`);
        continue;
      }
      cdata = JSON.parse(cdata);
      tool.clog(cdata.title);

      if (!cdata.title) {
        tool.cerror(temp);
        tool.cerror(`文章涉嫌违规已被删除。`);
        continue;
      }

      // read 采集
      // let commenturl = `${config.preRead}${temp.slice(2)}`;
      // // await tool.sleep(time);
      // let data = await getRead(commenturl);
      // if (!data) {
      //   tool.cerror(`文章阅读数据返回 null`);
      //   continue;
      // }
      // try {
      //   data = JSON.parse(data);
      // } catch (error) {
      //   data = data.replace('\u0014\u0003', ' ');
      //   data = JSON.parse(data);
      // }
      // let _read = {
      //   read: data.read_num,
      //   like: data.like_num
      // }
      // tool.clog(_read);
    }
    tool.clog(`test over.`);
  } catch (error) {
    tool.cerror(error);
  }
}

const test = async (time) => {
  try {
    let index = 0;
    while (true) {
      tool.clog(++index);
      await start('rmrbwx', time);
    }
  } catch (error) {
    tool.cerror(error);
  }
}

if (process.argv[2] && process.argv[2].trim() === 'crawl') {
  let time = parseInt(process.argv[3] ? process.argv[3].trim(): '5');
  test(time);
} else if (process.argv[2] && process.argv[2].trim() === 'ip') {
  tool.changeip();
} else {
  tool.clog(`参数不正确。输入 crawl 或者 ip`);
}