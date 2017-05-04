import * as fs from 'fs';

import * as rp from 'request-promise';

import * as tool from './tool';

const start = async (min = 0) => {
  try {
    console.log(new Date());
    let file = './ips.txt';
    let uri = 'https://jsonip.com';
    let data = await rp(uri);
    console.log(data);
    data = JSON.parse(data)
    fs.appendFileSync(file, `${data.ip}\t${new Date()}\n`);
    await tool.sleep(60 * min);
    setImmediate(async () => await start(min));
  } catch (error) {
    console.error(error);
    setImmediate(async () => await start(min));
  }
}

const stat = () => {
  try {
    let file = './ips.txt';
    let rfile = './ips-re.txt';
    let ufile = './ips-uni.txt';
    let data = fs.readFileSync(file, 'utf-8');
    let lines = data.split('\n'),
      last = '',
      ips = [];
    for (let i = 0, len = lines.length; i < len; i++){
      let ip = lines[i].split('\t')[0];
      if (ip !== last) {
        ips.push(ip);
        fs.appendFileSync(rfile, ip + '\n');
      }
      last = ip;
    }
    console.log(`lines over.`);
    console.log(ips.length);
    let unis = [];
    ips.map(x => {
      if (!unis.includes(x)) {
        unis.push(x);
      }
    });
    console.log(unis.length);
    unis.map(x => {
      fs.appendFileSync(ufile, x + '\n');
    })
  } catch (error) {
    console.error(error);
  }
}

start(2);
// stat();