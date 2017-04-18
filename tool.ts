
const sleep = async (time = 10) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time * 1000);
  })
}

const clog = (...rest) => {
  rest.unshift(`[log]`, `[${new Date().toLocaleString()}]`);
  console.log.apply(console, rest);
}

const cerror = (...rest) => {
  rest.unshift(`[error]`, `[${new Date().toLocaleString()}]`);
  console.error.apply(console, rest);
}

const handler = async (error) => {
  let time = 10;
  cerror(error);
  cerror(error.message);
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

export {
  sleep,
  clog,
  cerror,
  handler,
  insertdb
}
