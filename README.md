# PostCSS Inline Base64

[![Build Status][ci-img]][ci]
[![Coverage Status][cover-img]][cover]

[PostCSS](https://github.com/postcss/postcss) plugin for encode the file to base64

[PostCSS]:   https://github.com/postcss/postcss
[ci-img]:    https://travis-ci.org/lagden/postcss-inline-base64.svg
[ci]:        https://travis-ci.org/lagden/postcss-inline-base64
[cover-img]: https://codecov.io/gh/lagden/postcss-inline-base64/branch/master/graph/badge.svg
[cover]:     https://codecov.io/gh/lagden/postcss-inline-base64


## Usage

See the [example](#example) below

```js
postcss([ require('postcss-inline-base64')(options) ])
```

### Options

Name        | Type    | Default                           | Description
----------- | ------- | --------------------------------- | -----------
baseDir     | string  | [result.opts.to = process.cwd()]  | Relative path to load local files


## Example

### input

```css
@font-face {
  font-family: 'example';
  src: url('b64---./example.woff---') format('woff'), url('b64---./example.woff2---') format('woff2');
  font-weight: normal;
  font-style: normal;
}

body {
  background-color: gray;
  background-image: url('b64---https://cdn.lagden.in/xxx.png---')
}

.notfound {
  background-image: url('b64---https://file.not/found.png---');
}

.normal {
  background-image: url('https://cdn.lagden.in/mask.png');
}
```

### output

```css
@font-face {
  font-family: 'example';
  src: url('data:font/woff;charset=utf-8;base64,d09...eLAAAA==') format('woff'), url('data:font/woff2;charset=utf-8;base64,d09...eLAAAA==') format('woff2');
  font-weight: normal;
  font-style: normal;
}

body {
  background-color: gray;
  background-image: url('data:image/png;charset=utf-8;base64,iVBORw0K...SuQmCC');
}

.notfound {
  background-image: url('https://file.not/found.png')
}

.normal {
  background-image: url('https://cdn.lagden.in/mask.png');
}
```

---

See [PostCSS](https://github.com/postcss/postcss/tree/master/docs) docs for examples for your environment.


## License

MIT © [Thiago Lagden](https://github.com/lagden)
