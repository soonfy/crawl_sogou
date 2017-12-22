var moment = require('moment');
var webpage = require('webpage');
var page = webpage.create();

page.onConsoleMessage = function (msg) {
  console.log(msg);
};

// try {
//   console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
//   page.open("http://weixin.sogou.com/weixin?type=1&query=ontheroad31&ie=utf8&s_from=input&_sug_=n&_sug_type_=", function (status) {
//     if (status === "success") {
//       page.evaluate(function () {
//         // console.log(page.content);
//         console.log(document.body);
//         console.log(document.title);
//       });
//     } else {
//     }
//   });
// } catch (error) {
//   console.error(error);
// }

const crawl = function () {
  try {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
    return new Promise((res, rej) => {
      page.open("http://weixin.sogou.com/weixin?type=1&query=ontheroad31&ie=utf8&s_from=input&_sug_=n&_sug_type_=", function (status) {
        if (status === "success") {
          page.evaluate(function () {
            // console.log(page.content);
            console.log(document.body);
            console.log(document.title);
            res(document.title);
          });
        } else {
          rej('');
        }
      });
    })
  } catch (error) {
    console.error(error);
  }
}

crawl();
