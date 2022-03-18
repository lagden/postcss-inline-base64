# PostCSS Inline Base64

[![Node.js CI][ci-img]][ci]
[![Coverage Status][cover-img]][cover]
[![Snyk badge][snyk-img]][snyk]

[PostCSS](https://github.com/postcss/postcss) plugin used to replace value inside of url function to base64

[PostCSS]:   https://github.com/postcss/postcss
[ci-img]:    https://github.com/lagden/postcss-inline-base64/workflows/b64-ci/badge.svg
[ci]:        https://github.com/lagden/postcss-inline-base64/actions?query=workflow%3A%22b64-ci%22
[cover-img]: https://codecov.io/gh/lagden/postcss-inline-base64/branch/master/graph/badge.svg
[cover]:     https://codecov.io/gh/lagden/postcss-inline-base64
[snyk-img]:  https://snyk.io/test/github/lagden/postcss-inline-base64/badge.svg
[snyk]:      https://snyk.io/test/github/lagden/postcss-inline-base64


## Usage

See the [example](#example) below

```js
import postcssInlineBase64 from 'postcss-inline-base64'

postcss([
  postcssInlineBase64(options),
])
```


If you are using `CommonJS module`:

```js
postcss([
  require('postcss-inline-base64/dist/plugin.cjs')(options),
])


### Options

Name        | Type    | Default        | Description
----------- | ------- | -------------- | ------------
baseDir     | string  | process.cwd()  | Path to load files


## Example

Use the syntax below inside `url()` function:

```
Variations:

 - b64---{file}---
 - b64---'{file}'---
 - b64---"{file}"---
 - 'b64---{file}---'
 - "b64---{file}---"
```


### input

```css
:root {
  --image: 'b64---./example.gif---';
}

@font-face {
  font-family: 'example';
  src: url('b64---./example.woff---') format('woff'), url('b64---./example.woff2---') format('woff2');
  font-weight: normal;
  font-style: normal;
}

body {
  background-color: gray;
  background-image: url(var(--image));
}

.notfound {
  background-image: url('b64---https://file.not/found.png---');
}

.ignore {
  background-image: url('https://cdn.lagden.in/mask.png');
}
```


### output

```css
:root {
  --image: 'data:image/png;charset=utf-8;base64,iVBORw0K...SuQmCC';
}

@font-face {
  font-family: 'example';
  src: url('data:font/woff;charset=utf-8;base64,d09...eLAAAA==') format('woff'), url('data:font/woff2;charset=utf-8;base64,d09...eLAAAA==') format('woff2');
  font-weight: normal;
  font-style: normal;
}

body {
  background-color: gray;
  background-image: url(var(--image));
}

.notfound {
  background-image: url('https://file.not/found.png');
}

.ignore {
  background-image: url('https://cdn.lagden.in/mask.png');
}
```

---

See [PostCSS](https://github.com/postcss/postcss/tree/master/docs) docs for examples for your environment.


## License

MIT © [Thiago Lagden](https://github.com/lagden)
