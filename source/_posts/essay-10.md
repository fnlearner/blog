---
title: 今日随笔
date: 2021-03-14 18:30:49
tags: JavaScript
---

### removeNonASCII

Removes non-printable ASCII characters.

Use a regular expression to remove non-printable ASCII characters.

```bash
const removeNonASCII = str => str.replace(/[^\x20-\x7E]/g, '')
```

```bash
removeNonASCII('äÄçÇéÉêlorem-ipsumöÖÐþúÚ'); // 'lorem-ipsum'
```