const puppeteer = require('puppeteer');
import * as moment from 'moment';
const devices = require('puppeteer/DeviceDescriptors');
// console.log(devices);
const device_logo = []
for (let device of devices) {
  if (device.viewport.width >= 1024 || device.viewport.height >= 1024) {
    device_logo.push(device);
  }
}
// console.log(device_logo);
const device_length = device_logo.length;
// console.log(device_length);
const device_error = ['iPad Pro landscape']
// const iPhone = devices['iPhone 6'];

import Article from './models/article';
import ListArticle from './models/list_article';
import Weixiner from './models/weixiner';

import * as config from './config';

const sleep = async (time = 10) => {
  return new Promise((resolve) => {
    console.log(`sleep ${time}s.`);
    setTimeout(resolve, time * 1000);
  })
}

const start = async () => {
  console.log('=== start ===');
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
  console.log(config.dburl);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    let no = Math.floor(Math.random() * device_length);
    let device = device_logo[1];
    console.log(device);
    await page.emulate(device);

    // let login_uri = 'https://account.sogou.com/web/webLogin';
    // await page.goto(login_uri);
    // await page.waitFor(1000);
    // await page.waitForSelector('.username input[name=username]');
    // await (await page.$('.username input[name=username]')).focus();
    // await page.type('.username input[name=username]', '17710822634', { delay: 20 });
    // await (await page.$('.password input[name=password]')).focus();
    // await page.type('.password input[name=password]', '200912001', { delay: 20 });
    // await page.click('#Login button', { delay: 20 });
    // await page.waitFor(1000);
    // console.log(await page.cookies());

    let search_uri = 'http://weixin.sogou.com/'
    await page.goto(search_uri);
    let start_time = moment();

    if (moment().subtract(10, 'seconds') < start_time) {
      await sleep(Math.random() * 10 + 20);
    } else {
      await sleep(Math.random() * 5 + 5);
    };
    await sleep(Math.random() * 5 + 100);
    start_time = moment();
    let weixiner = await Weixiner.findOneAndUpdate({ sogou_status: 1, sogou_update: { $lte: moment().subtract(10, 'minutes') } }, { $set: { sogou_status: 1, sogou_update: new Date() } }, { sort: { sogou_update: 1 } });
    if (!weixiner) {
      weixiner = await Weixiner.findOneAndUpdate({ sogou_status: 0 }, { $set: { sogou_status: 1, sogou_update: new Date() } }, { sort: { sogou_update: 1 } });
    }
    let username = weixiner['username'];

    console.log(`=== username -- ${username} ===`);

    if (!username) {
      weixiner = await Weixiner.findByIdAndUpdate(weixiner._id, { $set: { sogou_status: -1 } });
      await browser.close();
      return;
    }

    await page.waitFor(1000);
    if (await page.$('.logo')) {
      await page.click('.logo', { delay: 20 });
    } else if (await page.$('.i_logo')) {
      await page.click('.i_logo', { delay: 20 });
    } else if (await page.$('h3 a[data-uigs=logo]')) {
      await page.click('h3 a[data-uigs=logo]', { delay: 20 });
    } else {
      console.log(await page.content());
      process.exit();
    }

    // await page.waitForSelector('.qborder2 input[name=query]');
    // await (await page.$('.qborder2 input[name=query]')).focus();
    // await page.type('.qborder2 input[name=query]', username, { delay: 20 });
    // await page.click('.swz2', { delay: 20 });

    await page.waitForSelector('#query');
    await (await page.$('#query')).focus();
    await page.type('#query', username, { delay: 20 });
    await page.click('.swz2', { delay: 20 });

    await page.waitFor(1000);
    if(await page.$('.ip-time-p')){
    console.log(await page.content());    
    }
    await page.waitForSelector('.header');
    console.log('=== search title ===');
    console.log(await page.title());

    console.log('=== search uri ===');
    let uri = await page.url();
    console.log(uri);

    console.log('=== delete search cookies ===');
    let search_cookies = await page.cookies(search_uri);
    for (let cookie of search_cookies) {
      await page.deleteCookie(cookie);
    }
    if (search_cookies.length === 0) {
      console.log(`=== delete search cookies over. ===`);
    }

    if ((await page.title()).trim() === '搜狗搜索') {
      // console.log('=== delete cookies ===');
      // let cookies = await page.cookies(uri);
      // for (let cookie of cookies) {
      //   await page.deleteCookie(cookie);
      // }
      // if (cookies.length === 0) {
      //   console.log(`=== delete cookies over. ===`);
      // }
      await browser.close();
      return;
    } else {

      let usernames = await page.evaluate(() => {
        let as = [...document.querySelectorAll('div.txt-box')];
        return as.map((a) => {
          let label = a.getElementsByTagName('label')[0];
          return label ? label.textContent.trim() : '';
        });
      });

      console.log(usernames);

      if (usernames.length === 0) {
        weixiner = await Weixiner.findByIdAndUpdate(weixiner._id, { $set: { sogou_status: -1 } });
        await browser.close();
        return;
      }
      let location = usernames.indexOf(username);
      if (location === -1) {
        weixiner = await Weixiner.findByIdAndUpdate(weixiner._id, { $set: { sogou_status: -1 } });
        await browser.close();
        return;
      }

      await page.waitForSelector('.tit a');
      // await page.click('.tit a', { delay: 20 });
      await (await page.$$('.tit a'))[location].click({ delay: 20 });
      await page.waitFor(1000);

      console.log('=== pages length ===');
      console.log((await browser.pages()).length);
      let list_page = (await browser.pages()).pop();
      console.log(await list_page.url());

      console.log('=== list_page title ===');
      console.log(await list_page.title());

      let list_count = (await list_page.$$('h4')).length;
      if (list_count === 0) {
        console.log(await list_page.content());
      }

      let list_articles = await list_page.evaluate(() => {
        let as = [...document.querySelectorAll('h4')];
        return as.map((a) => {
          return {
            title: a ? a.textContent.trim() : '',
            sogou_uri: a.getAttribute('hrefs'),
          }
        });
      });
      list_articles = list_articles.map(x => {
        x.create_time = new Date()
        return x;
      });
      console.log(list_articles);

      await ListArticle.create(list_articles);

      let index = 0;
      console.log(`=== start -- all ${list_count}, now ${index} ===`);

      console.log('=== delete list cookies ===');
      let list_uri = await list_page.url();
      let list_cookies = await page.cookies(list_uri);
      for (let cookie of list_cookies) {
        await page.deleteCookie(cookie);
      }
      if (list_cookies.length === 0) {
        console.log(`=== delete list cookies over. ===`);
      }

      // if (list_count === 0) {
      //   console.log('=== delete cookies ===');
      //   let list_uri = await list_page.url();
      //   let cookies = await list_page.cookies(list_uri);
      //   for (let cookie of cookies) {
      //     await list_page.deleteCookie(cookie);
      //   }
      //   if (cookies.length === 0) {
      //     console.log(`=== delete cookies over. ===`);
      //   }
      //   console.log(await list_page.content());
      //   await list_page.close();
      //   await browser.close();
      //   return;
      // }
      // while (index < list_count) {
      //   console.log(++index);
      //   console.log(`=== all ${list_count}, now ${index} ===`);
      //   await list_page.waitForSelector('h4');
      //   await (await list_page.$$('h4'))[index - 1].click({ delay: 20 });

      //   await list_page.waitForSelector('#post-date');
      //   console.log('=== content title ===');
      //   console.log(await list_page.title());
      //   // console.log(await list_page.content());

      //   // console.log(await list_page.$eval('#post-date', el => el.outerHTML));
      //   // console.log(await list_page.$eval('#post-date', el => el.textContent.trim()));
      //   // console.log(await list_page.$eval('.rich_media_meta_nickname', el => el.textContent.trim()));
      //   // console.log(await list_page.$eval('#js_content', el => el.textContent.trim()));
      //   // console.log(await list_page.$eval('#js_sg_bar a.meta_primary', el => el.href));

      //   let sogou_uri = await list_page.url();
      //   let biz, mid, idx, _id;
      //   let reg_biz = /var\s*biz\s*=([^;]+)\;/;
      //   let reg_mid = /var\s*mid\s*=([^;]+)\;/;
      //   let reg_idx = /var\s*idx\s*=([^;]+)\;/;
      //   let reg_sn = /var\s*sn\s*=([^;]+)\;/;
      //   let body = await list_page.content();
      //   let match = body.match(reg_biz);
      //   biz = match[1].replace(/[\"\||\s]/g, '');
      //   match = body.match(reg_mid);
      //   mid = match[1].replace(/[\"\||\s]/g, '');
      //   match = body.match(reg_idx);
      //   idx = match[1].replace(/[\"\||\s]/g, '');
      //   _id = `${biz}:${mid}:${idx}`;

      //   let title = await list_page.title();
      //   let author = await list_page.$eval('.rich_media_meta_nickname', el => el.textContent.trim());
      //   let last_modified_at = new Date(await list_page.$eval('#post-date', el => el.textContent.trim()));
      //   let content = await list_page.$eval('#js_content', el => el.textContent.trim());
      //   let copyright = (await list_page.$('#copyright_logo')) ? true : false;

      //   let doc = {
      //     _id,
      //     biz,
      //     mid,
      //     idx,
      //     title,
      //     author,
      //     last_modified_at,
      //     content,
      //     copyright,
      //     sogou_uri,
      //     create_time: new Date(),
      //   }
      //   // console.log(doc);

      //   let article = await Article.findByIdAndUpdate(doc._id, { $set: doc }, { upsert: true, new: true });
      //   console.log(article);
      //   await sleep(Math.random() * 5 + 15);

      //   await list_page.goBack();
      //   list_count = (await list_page.$$('h4')).length;
      // }
      await list_page.close();
      await browser.close();
      weixiner = await Weixiner.findByIdAndUpdate(weixiner._id, { $set: { sogou_status: 0 } });
    }
  } catch (error) {
    console.error(error);
    console.log('=== error ===');
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
    await browser.close();
  }
}

const floop = async () => {
  while (true) {
    await start();
  }
}

import * as mongoose from 'mongoose';
let db = mongoose.connection;
let exit = () => {
  db.close(() => {
    console.log('[mongo] info: mongo is disconnected through app termination')
    process.exit(0)
  })
}

process.on('SIGINT', exit).on('SIGTERM', exit)

floop();
// start();

const login = async () => {
  try {
    let uri = 'http://www.sogou.com/qq?ru=http%3A%2F%2Fwww.sogou.com%2Flogin%2Fqq_login_callback_page_new.html%3Fxy%3Dhttps%26from%3Dhttps%253A%252F%252Fwww.sogou.com%252F';
    let sogou_uri = 'http://weixin.sogou.com/weixin?type=1&s_from=input&query=rmrbwx&ie=utf8&_sug_=n&_sug_type_='

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    let no = Math.floor(Math.random() * device_length);
    let device = device_logo[1];
    console.log(device);
    await page.emulate(device);

    await page.goto(sogou_uri);

    await page.waitFor(1000);
    // console.log(await page.content());
    // let list_uri = await list_page.url();
    let cookies = await page.cookies(uri);
    console.log('cookies no login');
    console.log(cookies);
    for (let cookie of cookies) {
      await page.deleteCookie(cookie);
    }

    await page.goto(uri);

    await page.waitFor(1000);
    // console.log(await page.content());
    // let list_uri = await list_page.url();
    cookies = await page.cookies(uri);
    console.log(cookies);
    // for (let cookie of cookies) {
    //   await page.deleteCookie(cookie);
    // }

    await page.waitForSelector('.username input[name=username]');
    await (await page.$('.username input[name=username]')).focus();
    await page.type('.username input[name=username]', '17710822634', { delay: 20 });
    await (await page.$('.password input[name=password]')).focus();
    await page.type('.password input[name=password]', '200912001', { delay: 20 });
    await page.click('#Login button', { delay: 20 });

    await page.waitFor(1000);
    // console.log(await page.content());
    // let list_uri = await list_page.url();
    let login_cookies = await page.cookies(uri);
    console.log(login_cookies);

    await page.goto(sogou_uri);
    // for (let cookie of cookies) {
    //   await page.setCookie(cookie);
    // }

    await page.waitFor(1000);
    // console.log(await page.content());
    // let list_uri = await list_page.url();
    cookies = await page.cookies(sogou_uri);
    console.log('cookies login');
    console.log(cookies);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

// login();
