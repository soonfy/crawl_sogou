import * as child_process from 'child_process';
import * as fs from 'fs';
import * as os from 'os';

const clog = (...rest) => {
  rest.unshift(`[log]`, `[${new Date().toLocaleString()}]`);
  console.log.apply(console, rest);
}

const cerror = (...rest) => {
  rest.unshift(`[error]`, `[${new Date().toLocaleString()}]`);
  console.error.apply(console, rest);
}

const sleep = async (time = 10) => {
  return new Promise((resolve) => {
    console.log(`sleep ${time}s.`);
    setTimeout(resolve, time * 1000);
  })
}

const handler = async (error) => {
  let time = 10;
  // cerror(error);
  cerror(error.message);
  // fs.appendFile('./logs/error.log', JSON.stringify(error, null, 2), () => {
  //   if (error) {
  //     cerror(error);
  //   }
  // })
  cerror(`sleep ${time}s`);
  await sleep(time);
}

const insertdb = async (model, obj) => {
  try {
    let weixiner = await model.findOneAndUpdate({ _id: obj._id }, { $set: obj }, { upsert: true, new: true });
    clog(weixiner._id);
    return weixiner;
  } catch (error) {
    await handler(error);
    return await insertdb(model, obj);
  }
}

const changeip = async () => {
  try {
    if (os.platform() !== 'linux') {
      cerror(`不是 linux 服务器，不支持自动拨号。`);
      return;
    }
    const pppREG = /ppp(\d+)/gim;
    const password = process.argv[3] && process.argv[3].trim();
    clog(password);
    if (!password) {
      await handler(new Error(`no password.`));
      return;
    }
    clog(`start auto pppoe.`)
    child_process.execSync(`echo ${password} | sudo -S pon dsl1`);
    await sleep(2);
    child_process.execSync(`echo ${password} | sudo -S poff dsl1`);
    clog(`poff dsl1 success. wait 1m to pon dsl1.`)
    await sleep(40);
    child_process.execSync(`echo ${password} | sudo -S pon dsl1`);
    clog(`pon dsl1 success.`)
    await sleep(2);
    let ips = child_process.execSync(`ifconfig`).toString();
    clog(ips);
    let match = ips.match(pppREG),
      ppp;
    if (match) {
      ppp = match[0];
      clog(`match ${ppp}.`)
    } else {
      await handler(new Error(`no match ppp. wait 10s to restart auto pppoe.`));
      await changeip();
    }
    child_process.execSync(`echo ${password} | sudo -S ip route add default dev ${ppp} table weibo`);
    clog(`auto pppoe success.`);
  } catch (error) {
    await handler(error);
    await changeip();
  }
}

const check = (html) => {
  let auth = true;
  if (html && html.includes('请输入验证码')) {
    auth = false;
  }
  return auth;
}

export {
  sleep,
  clog,
  cerror,
  handler,
  insertdb,
  changeip,
  check
}
