import * as mongoose from 'mongoose';
const dburl = `mongodb://localhost/sogou`;
mongoose.connect(dburl);

const weixinhost = `mp.weixin.qq.com`;
const sogouhost = `weixin.sogou.com`;

const suf = `%3D&&uin=&key=&pass_ticket=&wxtoken=&devicetype=&clientversion=0&x5=0&f=json`;
const preContent = `https://mp.weixin.qq.com`;
const preRead = `https://mp.weixin.qq.com/mp/getcomment`;

const options = {
  url: '',
  method: 'GET',
  headers: {
    'Host': weixinhost,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
  },
  timeout: 1000 * 30
};


export {
  weixinhost,
  sogouhost,
  suf,
  preContent,
  preRead,
  options
}