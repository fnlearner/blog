---
title: 今日随笔
date: 2021-03-14 18:30:49
tags: JavaScript
---

### removeNonASCII

Removes non-printable ASCII characters.

Use a regular expression to remove non-printable ASCII characters.

```js
const removeNonASCII = str => str.replace(/[^\x20-\x7E]/g, '')
```

```js
removeNonASCII('äÄçÇéÉêlorem-ipsumöÖÐþúÚ'); // 'lorem-ipsum'
```
<!-- more -->
### Constant width to height ratio

iven an element of variable width, it will ensure its height remains proportionate in a responsive fashion (i.e., its width to height ratio remains constant).

`html`
```html
<div class="constant-width-to-height-ratio"></div>
```
`css`
```css
.constant-width-to-height-ratio {
  background: #333;
  width: 50%;
}
.constant-width-to-height-ratio::before {
  content: '';
  padding-top: 100%;
  float: left;
}
.constant-width-to-height-ratio::after {
  content: '';
  display: block;
  clear: both;
}
```

`description`
padding-top on the ::before pseudo-element causes the height of the element to equal a percentage of its width. 100% therefore means the element's height will always be 100% of the width, creating a responsive square.

This method also allows content to be placed inside the element normally.

`browser support`

✅ No caveats.
