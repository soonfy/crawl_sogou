const puppeteer = require('puppeteer');
import * as moment from 'moment';
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];

import Article from './models/article';
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
  console.log(config.dburl);

  const browser = await puppeteer.launch({
    headless: true
  });
  try {
    const page = await browser.newPage();
    await page.goto('http://weixin.sogou.com/');
    let start_time = moment();

    while (true) {
      console.log('=== next ===');
      console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
      if (moment().subtract(10, 'seconds') < start_time) {
        await sleep(30);
      };
      start_time = moment();
      let weixiner = await Weixiner.findOneAndUpdate({ sogou_status: 1, sogou_update: { $lte: moment().subtract(10, 'minutes') } }, { $set: { sogou_status: 1, sogou_update: new Date() } }, { sort: { sogou_update: 1 } });
      if (!weixiner) {
        weixiner = await Weixiner.findOneAndUpdate({ sogou_status: 0 }, { $set: { sogou_status: 1, sogou_update: new Date() } }, { sort: { sogou_update: 1 } });
      }
      let username = weixiner['username'];

      console.log(`=== username -- ${username} ===`);

      if (!username) {
        weixiner = await Weixiner.findByIdAndUpdate(weixiner._id, { $set: { sogou_status: -1 } });
        continue;
      }

      await page.click('.logo', { delay: 20 });
      await page.waitForSelector('.qborder2 input[name=query]');
      await (await page.$('.qborder2 input[name=query]')).focus();
      await page.type('.qborder2 input[name=query]', username, { delay: 20 });
      await page.click('.swz2', { delay: 20 });

      await page.waitFor(1000);
      await page.waitForSelector('.all-time-y');
      console.log('=== search title ===');
      console.log(await page.title());

      console.log('=== search uri ===');
      let uri = await page.url();
      console.log(uri);
      // console.log('=== search cookies ===');
      // let cookies = await page.cookies(uri);
      // console.log(cookies.length);

      if ((await page.title()).trim() === '搜狗搜索') {
        console.log('=== delete cookies ===');
        let cookies = await page.cookies(uri);
        for (let cookie of cookies) {
          await page.deleteCookie(cookie);
        }
        if (cookies.length === 0) {
          console.log(`=== delete cookies over. ===`);
        }
        continue;
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
          continue;
        }
        let location = usernames.indexOf(username);
        if (location === -1) {
          weixiner = await Weixiner.findByIdAndUpdate(weixiner._id, { $set: { sogou_status: -1 } });
          continue;
        }

        await page.waitForSelector('.tit a');
        // await page.click('.tit a', { delay: 20 });
        await (await page.$$('.tit a'))[location].click({ delay: 20 });
        await page.waitFor(1000);

        console.log('=== pages length ===');
        console.log((await browser.pages()).length);
        let list_page = (await browser.pages())[2];
        console.log(await list_page.url());

        console.log('=== list_page title ===');
        console.log(await list_page.title());

        let list_count = (await list_page.$$('h4')).length;
        let index = 0;
        console.log(`=== start -- all ${list_count}, now ${index} ===`);
        if (list_count === 0) {
          console.log('=== delete cookies ===');
          let list_uri = await list_page.url();
          let cookies = await list_page.cookies(list_uri);
          for (let cookie of cookies) {
            await list_page.deleteCookie(cookie);
          }
          if (cookies.length === 0) {
            console.log(`=== delete cookies over. ===`);
          }
          console.log(await list_page.content());
          continue;
        }
        while (index < list_count) {
          console.log(++index);
          console.log(`=== all ${list_count}, now ${index} ===`);
          await list_page.waitForSelector('h4');
          await (await list_page.$$('h4'))[index - 1].click({ delay: 20 });

          await list_page.waitForSelector('#post-date');
          console.log('=== content title ===');
          console.log(await list_page.title());
          // console.log(await list_page.content());

          // console.log(await list_page.$eval('#post-date', el => el.outerHTML));
          // console.log(await list_page.$eval('#post-date', el => el.textContent.trim()));
          // console.log(await list_page.$eval('.rich_media_meta_nickname', el => el.textContent.trim()));
          // console.log(await list_page.$eval('#js_content', el => el.textContent.trim()));
          // console.log(await list_page.$eval('#js_sg_bar a.meta_primary', el => el.href));

          let biz, mid, idx, _id;
          let reg_biz = /var\s*biz\s*=([^;]+)\;/;
          let reg_mid = /var\s*mid\s*=([^;]+)\;/;
          let reg_idx = /var\s*idx\s*=([^;]+)\;/;
          let reg_sn = /var\s*sn\s*=([^;]+)\;/;
          let body = await list_page.content();
          let match = body.match(reg_biz);
          biz = match[1].replace(/[\"\||\s]/g, '');
          match = body.match(reg_mid);
          mid = match[1].replace(/[\"\||\s]/g, '');
          match = body.match(reg_idx);
          idx = match[1].replace(/[\"\||\s]/g, '');
          _id = `${biz}:${mid}:${idx}`;

          let title = await list_page.title();
          let author = await list_page.$eval('.rich_media_meta_nickname', el => el.textContent.trim());
          let last_modified_at = new Date(await list_page.$eval('#post-date', el => el.textContent.trim()));
          let content = await list_page.$eval('#js_content', el => el.textContent.trim());
          let copyright = (await list_page.$('#copyright_logo')) ? true : false;

          let doc = {
            _id,
            biz,
            mid,
            idx,
            title,
            author,
            last_modified_at,
            content,
            copyright,
            create_time: new Date(),
          }
          // console.log(doc);

          let article = await Article.findByIdAndUpdate(doc._id, { $set: doc }, { upsert: true, new: true });
          console.log(article);
          await sleep(1);

          await list_page.goBack();
          list_count = (await list_page.$$('h4')).length;
          await sleep(1);
        }
        await list_page.close();
        weixiner = await Weixiner.findByIdAndUpdate(weixiner._id, { $set: { sogou_status: 0 } });
      }
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
