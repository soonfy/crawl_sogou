const puppeteer = require('puppeteer');
import * as tool from './tool';
import * as moment from 'moment';
import * as fs from 'fs';
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];

const start = async () => {
  try {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'));

    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    await page.goto('http://www.baidu.com/');
    console.log(await page.title());
    await browser.close();

  } catch (error) {
    console.error(error);
  }
}

start();
