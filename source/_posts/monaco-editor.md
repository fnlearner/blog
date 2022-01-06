---
title: 基于vite的monaco-editor
date: 2022-01-06 20:51:23
tags: 
    - monaco-editor
    - vite
---

`npm i -D monaco-editor vite-plugin-monaco-editor` 安装依赖


[discussions](https://github.com/vitejs/vite/discussions/1791)

```vue
<script setup lang="ts">

import { onMounted, ref } from 'vue'
import * as monaco from 'monaco-editor'
import 'monaco-editor/esm/vs/basic-languages/css/css.contribution'
import 'monaco-editor/esm/vs/basic-languages/xml/xml.contribution'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
//@ts-ignore
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
//@ts-ignore

import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
//@ts-ignore
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
//@ts-ignore
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
//@ts-ignore
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
// @ts-ignore
self.MonacoEnvironment = {
    getWorker(_: string, label: string) {
        if (label === 'typescript' || label === 'javascript') return new TsWorker()
        if (label === 'json') return new JsonWorker()
        if (label === 'css') return new CssWorker()
        if (label === 'html') return new HtmlWorker()
        return new EditorWorker()
    }
}

const monacoRef = ref();
const monacoInstance = ref<ReturnType<typeof monaco.editor.create>>()
onMounted(() => {
    monacoInstance.value = monaco.editor.create(monacoRef.value,{
        language:"typescript",
        value:"console.log('hello world')"
    })
})
</script>
<template>
    <div id="monaco" ref="monacoRef"></div>
</template>
<style scoped>
#monaco{
    height: 500px;
    width: 500px;
}
</style>
```

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const prefix = `monaco-editor/esm/vs`;
import monacoEditorPlugin from "vite-plugin-monaco-editor"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),monacoEditorPlugin()],
  build:{
    rollupOptions: {
      output: {
        manualChunks: {
          jsonWorker: [`${prefix}/language/json/json.worker`],
          cssWorker: [`${prefix}/language/css/css.worker`],
          htmlWorker: [`${prefix}/language/html/html.worker`],
          tsWorker: [`${prefix}/language/typescript/ts.worker`],
          editorWorker: [`${prefix}/editor/editor.worker`],
        },
      },
    }
  }
})

```

运行结果：

![结果](/images/monaco-editor/editor.jpg)