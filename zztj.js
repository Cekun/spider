const http = require('http');
const fs = require('fs');
const cheerio = require('cheerio');

var i = 0;
var url = 'http://www.gushiwen.org/GuShiWen_d349b8947b.aspx';

function fetchPage(url) {
      startRequest(url);
}

function startRequest(url) {
      http.get(url, (res) => {
            var html = '';
            res.setEncoding('utf-8');

            res.on('data', (chunk) => {
                  html += chunk;
            });

            res.on('end', () => {
                  i++;
                  if (i < 10) {
                        i = "00" + i;
                  }
                  else if (i >= 10 && i < 100) {
                        i = "0" + i;
                  }
                  var $ = cheerio.load(html);
                  var title = i.toString() + $('div.cont h1').text().trim();
                  var subhead = $('.cont .contson p').first().text().trim();
                  console.log(title + subhead);
                  var filename = './data/' + title + '——' + subhead + '.txt';

                  $('.cont .contson p').each(function (index, items) {
                        var p = $(this).text();
                        var y = p.substring(0, 2).trim();
                        if (y == '') {
                              p = p + '\n';
                              fs.appendFile(filename, p, 'utf-8', (err) => {
                                    if (err)
                                          console.log(err);
                              });
                        }
                  });

                  var nextLink = $('.cont .contson').first().find('p').last().find('strong a').first().attr('href');
                  console.log("********" + nextLink);
                  if (i < 294 && nextLink != '') {
                        fetchPage(nextLink);
                  }
            });
      }).on('error', (err) => { console.log(err) });
}

fetchPage(url);