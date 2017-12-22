const puppeteer = require('puppeteer');
import * as moment from 'moment';
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];
import Article from '../models/article';

const sleep = async (time = 10) => {
  return new Promise((resolve) => {
    console.log(`sleep ${time}s.`);
    setTimeout(resolve, time * 1000);
  })
}

class ChromeCrawler {
  page;
  constructor(page) {
    this.page = page;
  }

  async flush(uri) {
    await this.page.goto(uri);
    console.log('=== delete cookies ===');
    let cookies = await this.page.cookies(uri);
    for (let cookie of cookies) {
      await this.page.deleteCookie(cookie);
    }
    if (cookies.length === 0) {
      console.log(`=== delete cookies over ===`);
    }
    await sleep(15);
    await this.page.goto(uri);
  }

  async store_mongo(doc) {
    let article = await Article.findByIdAndUpdate(doc._id, { $set: doc }, { upsert: true, new: true });
    console.log(article);
  }

  async crawl_sogou(username) {
    let sogou = 'http://weixin.sogou.com/';
    console.log('=== next ===');
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
    await this.page.goto(sogou);

    await this.page.click('.logo', { delay: 20 });
    await this.page.waitForSelector('.qborder2 input[name=query]');
    await (await this.page.$('.qborder2 input[name=query]')).focus();
    await this.page.type('.qborder2 input[name=query]', username, { delay: 20 });
    await this.page.click('.swz2', { delay: 20 });

    await this.page.waitFor(1000);
    console.log('=== search title ===');
    console.log(await this.page.title());

    console.log('=== search uri ===');
    let uri = await this.page.url();
    console.log(uri);

    if ((await this.page.title()).trim() === '搜狗搜索') {
      this.flush(sogou);
      await this.crawl_sogou(username);
    } else {
      let usernames = await this.page.evaluate(() => {
        let as = [...document.querySelectorAll('div.txt-box')];
        return as.map((a) => {
          let label = a.getElementsByTagName('label')[0];
          return label.textContent.trim();
        });
      });
      console.log(usernames);
      if (usernames.length === 0) {
        return 300;
      }
      let location = usernames.indexOf(username);
      if (location === -1) {
        return 300;
      }

      await this.page.waitForSelector('.tit a');
      // await page.click('.tit a', { delay: 20 });
      await (await this.page.$$('.tit a'))[location].click({ delay: 20 });
      await this.page.waitFor(1000);

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
        console.log(await list_page.content());
      }
      while (index < list_count) {
        console.log(++index);
        console.log(`=== all ${list_count}, now ${index} ===`);
        await list_page.waitForSelector('h4');
        await (await list_page.$$('h4'))[index - 1].click({ delay: 20 });

        await list_page.waitForSelector('#post-date');
        console.log('=== content title ===');
        console.log(await list_page.title());
        console.log(await list_page.content());

        // console.log(await list_page.$eval('#post-date', el => el.outerHTML));
        console.log(await list_page.$eval('#post-date', el => el.textContent.trim()));
        console.log(await list_page.$eval('.rich_media_meta_nickname', el => el.textContent.trim()));
        console.log(await list_page.$eval('#js_content', el => el.textContent.trim()));
        // console.log(await list_page.$eval('#js_sg_bar a.meta_primary', el => el.href));

        let biz, mid, idx, id;
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
        id = `${biz}:${mid}:${idx}`;

        let author = await list_page.$eval('.rich_media_meta_nickname', el => el.textContent.trim());
        let last_modified_at = new Date(await list_page.$eval('#post-date', el => el.textContent.trim()));
        let content = await list_page.$eval('#js_content', el => el.textContent.trim());
        let copyright = (await list_page.$('#copyright_logo')) ? true : false;

        let doc = {
          id,
          biz,
          mid,
          idx,
          author,
          last_modified_at,
          content,
          copyright,
        }
        // console.log(doc);
        await this.store_mongo(doc);

        await list_page.goBack();
        list_count = (await list_page.$$('h4')).length;
      }
    }
  }
}

// const browser = await puppeteer.launch({
//   headless: true
// });
// const page = await browser.newPage();
// let crawler = new ChromeCrawler(page);
// page.flush()

// const crawl = async (username) => {
//   try {
//     console.log('=== next ===');
//     console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
//     let resp = {
//       statusCode: 0,
//     };

//     const browser = await puppeteer.launch({
//       headless: true
//     });
//     const page = await browser.newPage();
//     await page.goto('http://weixin.sogou.com/');

//     await page.click('.logo', { delay: 20 });
//     await page.waitForSelector('.qborder2 input[name=query]');
//     await (await page.$('.qborder2 input[name=query]')).focus();
//     await page.type('.qborder2 input[name=query]', username, { delay: 20 });
//     await page.click('.swz2', { delay: 20 });

//     await page.waitFor(1000);
//     console.log('=== search title ===');
//     console.log(await page.title());

//     console.log('=== search uri ===');
//     let uri = await page.url();
//     console.log(uri);
//     // console.log('=== search cookies ===');
//     // let cookies = await page.cookies(uri);
//     // console.log(cookies.length);

//     if ((await page.title()).trim() === '搜狗搜索') {
//       console.log('=== delete cookies ===');
//       let cookies = await page.cookies(uri);
//       for (let cookie of cookies) {
//         await page.deleteCookie(cookie);
//       }
//       if (cookies.length === 0) {
//         console.log(`=== delete cookies over. ===`);
//       }
//       resp.statusCode = 400;
//       return resp;
//     } else {
//       let usernames = await page.evaluate(() => {
//         let as = [...document.querySelectorAll('div.txt-box')];
//         return as.map((a) => {
//           let label = a.getElementsByTagName('label')[0];
//           return label.textContent.trim();
//         });
//       });
//       console.log(usernames);
//       if (usernames.length === 0) {
//         resp.statusCode = 300;
//         return resp;
//       }
//       let location = usernames.indexOf(username);
//       if (location === -1) {
//         resp.statusCode = 300;
//         return resp;
//       }

//       await page.waitForSelector('.tit a');
//       // await page.click('.tit a', { delay: 20 });
//       await (await page.$$('.tit a'))[location].click({ delay: 20 });
//       await page.waitFor(1000);

//       console.log('=== pages length ===');
//       console.log((await browser.pages()).length);
//       let list_page = (await browser.pages())[2];
//       console.log(await list_page.url());

//       console.log('=== list_page title ===');
//       console.log(await list_page.title());

//       let list_count = (await list_page.$$('h4')).length;
//       let index = 0;
//       console.log(`=== start -- all ${list_count}, now ${index} ===`);
//       if (list_count === 0) {
//         console.log(await list_page.content());
//       }
//       while (index < list_count) {
//         console.log(++index);
//         console.log(`=== all ${list_count}, now ${index} ===`);
//         await list_page.waitForSelector('h4');
//         await (await list_page.$$('h4'))[index - 1].click({ delay: 20 });

//         await list_page.waitForSelector('#post-date');
//         console.log('=== content title ===');
//         console.log(await list_page.title());
//         console.log(await list_page.content());

//         // console.log(await list_page.$eval('#post-date', el => el.outerHTML));
//         console.log(await list_page.$eval('#post-date', el => el.textContent.trim()));
//         console.log(await list_page.$eval('.rich_media_meta_nickname', el => el.textContent.trim()));
//         console.log(await list_page.$eval('#js_content', el => el.textContent.trim()));
//         // console.log(await list_page.$eval('#js_sg_bar a.meta_primary', el => el.href));

//         let biz, mid, idx, id;
//         let reg_biz = /var\s*biz\s*=([^;]+)\;/;
//         let reg_mid = /var\s*mid\s*=([^;]+)\;/;
//         let reg_idx = /var\s*idx\s*=([^;]+)\;/;
//         let reg_sn = /var\s*sn\s*=([^;]+)\;/;
//         let body = await list_page.content();
//         let match = body.match(reg_biz);
//         biz = match[1].replace(/[\"\||\s]/g, '');
//         match = body.match(reg_mid);
//         mid = match[1].replace(/[\"\||\s]/g, '');
//         match = body.match(reg_idx);
//         idx = match[1].replace(/[\"\||\s]/g, '');
//         id = `${biz}:${mid}:${idx}`;

//         let author = await list_page.$eval('.rich_media_meta_nickname', el => el.textContent.trim());
//         let last_modified_at = new Date(await list_page.$eval('#post-date', el => el.textContent.trim()));
//         let content = await list_page.$eval('#js_content', el => el.textContent.trim());
//         let copyright = (await list_page.$('#copyright_logo')) ? true : false;

//         let doc = {
//           id,
//           biz,
//           mid,
//           idx,
//           author,
//           last_modified_at,
//           content,
//           copyright,
//         }
//         // console.log(doc);
//         await this.store_mongo(doc);

//         await list_page.goBack();
//         list_count = (await list_page.$$('h4')).length;

//         resp = {
//           statusCode: 400,
//           doc
//         }
//         return resp;
//       }
//       await list_page.close();
//       await browser.close();
//     }
//   } catch (error) {
//     console.error(error);
//   }
// }

export default crawl;