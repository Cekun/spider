var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var i = 0;

//要爬虫的网址
var url = "http://www.ss.pku.edu.cn/index.php/newscenter/news/2391"; 

function fetchPage(x) {
      startRequest(x);
}

function startRequest(x) {
      //采用http模块向服务端发送一次get请求
      http.get(x, (res) => {
            var html = '';    //用来存储请求网页的整个html内容
            var titles = [];
            res.setEncoding('utf-8');  //防止中文乱码

            //监听data事件，每次取一快数据
            res.on('data', (chunk) => {
                  html += chunk;
            });

            //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
            res.on('end', () => {
                  var $ = cheerio.load(html);         //解析HTML    
                  var time = $('.article-info a:first-child').next().text().trim();
                  var news_item = {
                        title: $('.article-title a').text().trim(),
                        Time: time,
                        link: "http://www.ss.pku.edu.cn" + $('.article-title a').attr('href'),
                        author: $('a[title=供稿]').text().trim(),
                        i: i = i + 1,         //用于判断获取了多少文章
                  };
                  console.log(news_item);  //打印新闻信息

                  var news_title = $('.article-title a').text().trim();

                  //保存网页内容和图片
                  saveContent($, news_title);
                  saveImage($, news_title);

                  var nextLink = "http://www.ss.pku.edu.cn" + $("li.next a").attr('href'),
                        str1 = nextLink.split('-'),
                        str = encodeURI(str1[0]);
                  //控制要爬虫的数量
                  if (i < 10) {
                        fetchPage(str);
                  }

            });
      }).on('error', (err) => { console.log(err) });
}

//在本地存储所爬到的新闻内容
function saveContent($, news_title) {
      $('.article-content p').each(function (index, item) {
            var x = $(this).text();
            var y = x.substring(0, 2).trim();
            if (y == '') {
                  x = x + '\n';
                  //将新闻文本内容一段一段添加到/data文件夹下，并用新闻的标题来命名文件
                  fs.appendFile('./data/' + news_title + '.txt', x, 'utf-8', function (err) {
                        if (err) {
                              console.log(err);
                        }
                  });
            }
      })
}

function saveImage($, news_title) {
      $('.article-content img').each(function (index, item) {
            var img_title = $(this).parent().next().text().trim();
            if (img_title.length > 35 || img_title == '')
                  img_title = "NULL";
            var img_filename = img_title + '.jpg';
            var img_src = "http://www.ss.pku.edu.cn" + $(this).attr('src');

            //向服务器发起一次请求获取图片资源
            request.head(img_src, (err, res, body) => {
                  if (err)
                        conosole.log(err);
            });
            //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
            request(img_src).pipe(fs.createWriteStream('./image/'+news_title+'-'+img_filename));
      });
}

fetchPage(url);
