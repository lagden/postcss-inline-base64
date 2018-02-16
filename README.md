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

Name        | Type    | Default | Description
----------- | ------- | ------- | -----------
baseDir     | string  | ./      | Relative path from css output file
useCache    | boolean | true    | Caching the encoded file


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
  background-image: url('b64---http://cdn.lagden.in/xxx.png---')
}

.example {
  background-image: url('http://cdn.lagden.in/mask.png');
}

.invalid {
  background-image: url('b64---http://invalid.com/err.png---');
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

.example {
  background-image: url('http://cdn.lagden.in/mask.png');
}

.invalid {
  background-image: url('http://invalid.com/err.png')
}
```

---

See [PostCSS](https://github.com/postcss/postcss/tree/master/docs) docs for examples for your environment.


## License

MIT © [Thiago Lagden](http://lagden.in)
