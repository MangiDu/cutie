# cutie

切图工作流

- gulp workflow
    - html template engine：pug
    - css pre-processer：stylus
    - browsersync reload
    - css sprite

## 结构说明

dist 文件夹下存放serve和compile后的结果

-----

|--assets(被原样不动地复制到 dist 下)

|--style(存放 stylus 样式文件，编译至 dist/css 下，app 这个层级保留，里面的样式作为单独注入页面的特殊样式，style/index.styl中的样式会作为公共样式插入到所有html中)

|--vendor(被原样不动地复制到 dist 下)

|--views(存放 pug 模板，第一层下的pug会被编译至 dist 下)

编译时会读取 pug 文件首个`-`中划线前的字符串作为为 html 注入的单独样式文件的名称


## 命令

```bash
# serve with livereload
# port is 8003
npm start
# 清理 dist
npm run clean
# 生成编译结果，并将vendor、css中的脚本或样式依赖插入html
npm run compile
# 生成雪碧图（必须在编译之后，手动执行）
npm run sprite
```

直接执行 gulp 命令需要安装`gulp-cli`

```bash
# serve with livereload
# port is 8003
gulp start
# 清理 dist
gulp clean
# 生成编译结果，并将vendor、css中的脚本或样式依赖插入html
gulp compile
# 生成雪碧图（必须在编译之后，手动执行）
gulp sprite
```
