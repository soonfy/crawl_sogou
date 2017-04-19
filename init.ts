import { Weixiner } from './models/weixiner';

import * as tool from './tool';
import * as config from './config';

const getid = async () => {
  try {
    tool.clog(`参数是数据库地址，应用在 config 文件。`);
    tool.clog(process.argv);
    if (process.argv.length < 3) {
      tool.cerror(`缺少参数。`);
      process.exit();
    }
    tool.clog(config.dburl);
    let weixiners = await Weixiner.find({ sostatus: 1 });
    tool.clog(weixiners);
    tool.clog(`get ids success.`);
    let update = await Weixiner.update({ sostatus: 1 }, { $set: { sostatus: 0 } }, { multi: true });
    tool.clog(update);
    tool.clog(`update ids success.`);
    process.exit();
  } catch (error) {
    tool.cerror(error);
  }
}

getid();