var fs = require('fs');
var moment = require('moment');
var webpage = require('webpage');
var page = webpage.create();

console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
// let ids = fs.readFileSync('../weixin.txt', 'utf-8').split('\n');
// console.log(ids.length);

page.onConsoleMessage = function (msg) {
  console.log(msg);
};

page.open("http://weixin.sogou.com/weixin?type=1&query=ontheroad31&ie=utf8&s_from=input&_sug_=n&_sug_type_=", function (status) {
  if (status === "success") {
    page.evaluate(function () {
      console.log(document.title);
    });
    phantom.exit(0);
  } else {
    phantom.exit(1);
  }
});

// const start = () => {
//   try {
//     console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
//     let index = 0;
//     let ids = fs.readFileSync('./weixin.txt', 'utf-8').split('\n');
//     console.log(ids.length);
//     let random = Math.floor(Math.random() * 100);

//     page.onConsoleMessage = function (msg) {
//       console.log(msg);
//     };

//     page.open("http://weixin.sogou.com/weixin?type=1&query=ontheroad31&ie=utf8&s_from=input&_sug_=n&_sug_type_=", function (status) {
//       if (status === "success") {
//         page.evaluate(function () {
//           console.log(document.title);
//         });
//         phantom.exit(0);
//       } else {
//         phantom.exit(1);
//       }
//     });
//   } catch (error) {
//     console.error(error);
//   }
// }

// start();
