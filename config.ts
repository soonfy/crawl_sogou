import * as mongoose from 'mongoose';
// const dburl = `mongodb://localhost/sogou`;
let dburl;
if (process.argv[2] && process.argv[2].includes('mongodb')) {
  dburl = process.argv[2] ? process.argv[2].trim() : '';
  mongoose.connect(dburl);
}

const connection = mongoose.connection;
connection.on('connected', () => {
  console.log(`conected dburl ${dburl}`);
  console.log(`conected db ${connection.db.databaseName}`);
  let collections = connection.collections;
  for (let coll in collections) {
    console.log(`conected collection ${coll}`);
  }
})

const weixinhost = `mp.weixin.qq.com`;
const sogouhost = `weixin.sogou.com`;

const preContent = `https://mp.weixin.qq.com`;
const preRead = `https://mp.weixin.qq.com/mp/getcomment`;
const suf = `%3D&&uin=&key=&pass_ticket=&wxtoken=&devicetype=&clientversion=0&x5=0&f=json`;

const options = {
  url: '',
  method: 'GET',
  headers: {
    'Host': weixinhost,
    // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36'
  },
  timeout: 1000 * 30
};


export {
  dburl,
  weixinhost,
  sogouhost,
  suf,
  preContent,
  preRead,
  options
}