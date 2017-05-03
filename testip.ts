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

start(2);