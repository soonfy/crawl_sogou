import { Weixiner } from './models/weixiner';

import * as tool from './tool';
import * as config from './config';

const getid = async () => {
  try {
    tool.clog(`start get ids`);
    tool.clog(config.dburl);
    let weixiners = await Weixiner.find({sostatus: 1});
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