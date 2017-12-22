// var links = [];
// var casper = require('casper').create();

// casper.start('http://weixin.sogou.com', function () {
//   // Wait for the page to be loaded
//   this.waitForSelector('.qborder2 input[name=query]');
// });

// casper.then(function () {
//   // search for 'casperjs' from google form
//   this.fill('.qborder2 input[name=query]', 'ontheroad31', true);
// });

// casper.then(function () {
//   // aggregate results for the 'casperjs' search
//   links = [this.getTitle()];
//   // now search for 'phantomjs' by filling the form again
//   this.fill('form[action="/search"]', 'letzgopet', true);
// });

// casper.then(function () {
//   // aggregate results for the 'phantomjs' search
//   links.push(this.getTitle());
// });

// casper.run(function () {
//   // echo results in some pretty fashion
//   this.echo(links.length + ' links found:');
//   this.echo(' - ' + links.join('\n - ')).exit();
// });

var casper = require('casper').create();

casper.start('http://casperjs.org/', function() {
    this.echo(this.getTitle());
});

casper.thenOpen('http://phantomjs.org', function() {
    this.echo(this.getTitle());
});

casper.run();