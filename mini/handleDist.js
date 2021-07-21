const fs = require('fs'),
  path = require('path');
const miniConfig = require('./src/app.config');

(async () => {


  // 删除主包中app.wxss最后一行的错误import
  const filename = './dist/app.wxss';
  let str = fs.readFileSync(filename, 'utf8');
  str = str.replace('@import "./subPages/common.wxss";', '').replace('@import "./indexPages/common.wxss";', '');
  fs.writeFileSync(filename, str, 'utf8');


  // 给没有index.wxss的子页面创建index.wxss文件
  const subPages = miniConfig.subPackages[0].pages;
  subPages.forEach((page) => {
    const subPageWxss = `./dist/indexPages/${page.substring(0, page.length - 6)}/index.wxss`;
    try {
      fs.accessSync(subPageWxss);
    } catch(e) {
      fs.writeFile(subPageWxss, '', (error) => {});
      console.log(`${subPageWxss} 成功创建！`)
    }
  });

  const indexPages = miniConfig.subPackages[1].pages;
  indexPages.forEach((page) => {
    const subPageWxss = `./dist/subPages/${page.substring(0, page.length - 6)}/index.wxss`;
    try {
      fs.accessSync(subPageWxss);
    } catch(e) {
      fs.writeFile(subPageWxss, '', (error) => {});
      console.log(`${subPageWxss} 成功创建！`)
    }
  });


  // 分包子页面中的wxss文件添加对分包中common.wxss的引用
  function subPagesAddWxss(url, package) {
    const ext = '.wxss';
    fs.readdir(url, function (err, files) {
      if (err) {
        return console.log(err);
      }
      files.forEach((file) => {
        const p = url + file;
        fs.stat(p, (err, stats) => {
          if (err) {
            return console.log(err);
          }
          if (stats.isFile()) {
            if (path.extname(p) === ext) {
              if (p !== `./dist/${package}/common.wxss`) {
                const data = fs.readFileSync(p, 'utf8').split(/\r\n|\n|\r/gm);
                const relativePath = path.relative(p, `./dist/${package}/common.wxss`).replace(/\\/g, '/');
                data.push(`@import '${relativePath.replace('../', '')}';`);
                fs.writeFileSync(p, data.join('\r\n'))
              }
            }
          } else if (stats.isDirectory()) {
            subPagesAddWxss(p + '/', package);
          }/*  */
        });
      });
    });
  }
  subPagesAddWxss('./dist/subPages/', 'subPages');
  subPagesAddWxss('./dist/indexPages/', 'indexPages');


  // 复制依赖文件
  function copy(file, target) {
    const read = fs.createReadStream(file);
    const write = fs.createWriteStream(target);
    read.pipe(write);
  }
  copy('./dist/indexPages/common.js', './dist/subPages/common.js');
  copy('./dist/indexPages/common.wxss', './dist/subPages/common.wxss');



  console.log('dist目录处理成功，请在微信开发者工具中进行调试！');
})();
