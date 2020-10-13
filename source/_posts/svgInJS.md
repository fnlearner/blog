---
title: 在JS文件使用svg加载svg文件
date: 2020-10-13 21:27:37
tags:
---

### 怎么在js文件中用引用svg文件


使用webpack的require.context,它接收三个参数
+ 要搜索的文件夹目录
+ 是否还应该搜索它的子目录，
+ 以及一个匹配文件的正则表达式。
```bash
const req = require.context('./svg', false, /\.svg$/)
```
req返回的是一个方法
```bash
function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
```
包含三个属性
+ id
+ keys 
+ resolve
```bash

webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
webpackContext.id = "./src/icons/svg sync \\.svg$";
```

在使用```const requireAll = requireContext => requireContext.keys().map(requireContext)```之后，会得到一个Module的数组,数组的每一项就是执行import后的Module
![dom](/images/svg-in-js/map.png)
![image](/images/svg-in-js/image.png)
Module数组
![module](/images/svg-in-js/module.png)
__webpack_require__方法
```bash
function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
```
svg example
```bash
/***/ "./src/icons/svg/bug.svg":
/*!*******************************!*\
  !*** ./src/icons/svg/bug.svg ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var svg_baker_runtime_browser_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svg-baker-runtime/browser-symbol */ \"./node_modules/svg-baker-runtime/browser-symbol.js\");\n/* harmony import */ var svg_baker_runtime_browser_symbol__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(svg_baker_runtime_browser_symbol__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var svg_sprite_loader_runtime_browser_sprite_build__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! svg-sprite-loader/runtime/browser-sprite.build */ \"./node_modules/svg-sprite-loader/runtime/browser-sprite.build.js\");\n/* harmony import */ var svg_sprite_loader_runtime_browser_sprite_build__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(svg_sprite_loader_runtime_browser_sprite_build__WEBPACK_IMPORTED_MODULE_1__);\n\n\nvar symbol = new svg_baker_runtime_browser_symbol__WEBPACK_IMPORTED_MODULE_0___default.a({\n  \"id\": \"icon-bug\",\n  \"use\": \"icon-bug-usage\",\n  \"viewBox\": \"0 0 128 128\",\n  \"content\": \"<symbol xmlns=\\\"http://www.w3.org/2000/svg\\\" viewBox=\\\"0 0 128 128\\\" id=\\\"icon-bug\\\"><path d=\\\"M127.88 73.143c0 1.412-.506 2.635-1.518 3.669-1.011 1.033-2.209 1.55-3.592 1.55h-17.887c0 9.296-1.783 17.178-5.35 23.645l16.609 17.044c1.011 1.034 1.517 2.257 1.517 3.67 0 1.412-.506 2.635-1.517 3.668-.958 1.033-2.155 1.55-3.593 1.55-1.438 0-2.635-.517-3.593-1.55l-15.811-16.063a15.49 15.49 0 0 1-1.196 1.06c-.532.434-1.65 1.208-3.353 2.322a50.104 50.104 0 0 1-5.192 2.974c-1.758.87-3.94 1.658-6.546 2.364-2.607.706-5.189 1.06-7.748 1.06V47.044H58.89v73.062c-2.716 0-5.417-.367-8.106-1.102-2.688-.734-5.003-1.631-6.945-2.692a66.769 66.769 0 0 1-5.268-3.179c-1.571-1.057-2.73-1.94-3.476-2.65L33.9 109.34l-14.611 16.877c-1.066 1.14-2.344 1.711-3.833 1.711-1.277 0-2.422-.434-3.434-1.304-1.012-.978-1.557-2.187-1.635-3.627-.079-1.44.333-2.705 1.236-3.794l16.129-18.51c-3.087-6.197-4.63-13.644-4.63-22.342H5.235c-1.383 0-2.58-.517-3.592-1.55S.125 74.545.125 73.132c0-1.412.506-2.635 1.518-3.668 1.012-1.034 2.21-1.55 3.592-1.55h17.887V43.939L9.308 29.833c-1.012-1.033-1.517-2.256-1.517-3.669 0-1.412.505-2.635 1.517-3.668 1.012-1.034 2.21-1.55 3.593-1.55s2.58.516 3.593 1.55l13.813 14.106h67.396l13.814-14.106c1.012-1.034 2.21-1.55 3.592-1.55 1.384 0 2.581.516 3.593 1.55 1.012 1.033 1.518 2.256 1.518 3.668 0 1.413-.506 2.636-1.518 3.67l-13.814 14.105v23.975h17.887c1.383 0 2.58.516 3.593 1.55 1.011 1.033 1.517 2.256 1.517 3.668l-.005.01zM89.552 26.175H38.448c0-7.23 2.489-13.386 7.466-18.469C50.892 2.623 56.92.082 64 .082c7.08 0 13.108 2.541 18.086 7.624 4.977 5.083 7.466 11.24 7.466 18.469z\\\" /></symbol>\"\n});\nvar result = svg_sprite_loader_runtime_browser_sprite_build__WEBPACK_IMPORTED_MODULE_1___default.a.add(symbol);\n/* harmony default export */ __webpack_exports__[\"default\"] = (symbol);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvaWNvbnMvc3ZnL2J1Zy5zdmcuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvaWNvbnMvc3ZnL2J1Zy5zdmc/MjI4NiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3ByaXRlU3ltYm9sIGZyb20gXCJzdmctYmFrZXItcnVudGltZS9icm93c2VyLXN5bWJvbFwiO1xuaW1wb3J0IHNwcml0ZSBmcm9tIFwic3ZnLXNwcml0ZS1sb2FkZXIvcnVudGltZS9icm93c2VyLXNwcml0ZS5idWlsZFwiO1xudmFyIHN5bWJvbCA9IG5ldyBTcHJpdGVTeW1ib2woe1xuICBcImlkXCI6IFwiaWNvbi1idWdcIixcbiAgXCJ1c2VcIjogXCJpY29uLWJ1Zy11c2FnZVwiLFxuICBcInZpZXdCb3hcIjogXCIwIDAgMTI4IDEyOFwiLFxuICBcImNvbnRlbnRcIjogXCI8c3ltYm9sIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgdmlld0JveD1cXFwiMCAwIDEyOCAxMjhcXFwiIGlkPVxcXCJpY29uLWJ1Z1xcXCI+PHBhdGggZD1cXFwiTTEyNy44OCA3My4xNDNjMCAxLjQxMi0uNTA2IDIuNjM1LTEuNTE4IDMuNjY5LTEuMDExIDEuMDMzLTIuMjA5IDEuNTUtMy41OTIgMS41NWgtMTcuODg3YzAgOS4yOTYtMS43ODMgMTcuMTc4LTUuMzUgMjMuNjQ1bDE2LjYwOSAxNy4wNDRjMS4wMTEgMS4wMzQgMS41MTcgMi4yNTcgMS41MTcgMy42NyAwIDEuNDEyLS41MDYgMi42MzUtMS41MTcgMy42NjgtLjk1OCAxLjAzMy0yLjE1NSAxLjU1LTMuNTkzIDEuNTUtMS40MzggMC0yLjYzNS0uNTE3LTMuNTkzLTEuNTVsLTE1LjgxMS0xNi4wNjNhMTUuNDkgMTUuNDkgMCAwIDEtMS4xOTYgMS4wNmMtLjUzMi40MzQtMS42NSAxLjIwOC0zLjM1MyAyLjMyMmE1MC4xMDQgNTAuMTA0IDAgMCAxLTUuMTkyIDIuOTc0Yy0xLjc1OC44Ny0zLjk0IDEuNjU4LTYuNTQ2IDIuMzY0LTIuNjA3LjcwNi01LjE4OSAxLjA2LTcuNzQ4IDEuMDZWNDcuMDQ0SDU4Ljg5djczLjA2MmMtMi43MTYgMC01LjQxNy0uMzY3LTguMTA2LTEuMTAyLTIuNjg4LS43MzQtNS4wMDMtMS42MzEtNi45NDUtMi42OTJhNjYuNzY5IDY2Ljc2OSAwIDAgMS01LjI2OC0zLjE3OWMtMS41NzEtMS4wNTctMi43My0xLjk0LTMuNDc2LTIuNjVMMzMuOSAxMDkuMzRsLTE0LjYxMSAxNi44NzdjLTEuMDY2IDEuMTQtMi4zNDQgMS43MTEtMy44MzMgMS43MTEtMS4yNzcgMC0yLjQyMi0uNDM0LTMuNDM0LTEuMzA0LTEuMDEyLS45NzgtMS41NTctMi4xODctMS42MzUtMy42MjctLjA3OS0xLjQ0LjMzMy0yLjcwNSAxLjIzNi0zLjc5NGwxNi4xMjktMTguNTFjLTMuMDg3LTYuMTk3LTQuNjMtMTMuNjQ0LTQuNjMtMjIuMzQySDUuMjM1Yy0xLjM4MyAwLTIuNTgtLjUxNy0zLjU5Mi0xLjU1Uy4xMjUgNzQuNTQ1LjEyNSA3My4xMzJjMC0xLjQxMi41MDYtMi42MzUgMS41MTgtMy42NjggMS4wMTItMS4wMzQgMi4yMS0xLjU1IDMuNTkyLTEuNTVoMTcuODg3VjQzLjkzOUw5LjMwOCAyOS44MzNjLTEuMDEyLTEuMDMzLTEuNTE3LTIuMjU2LTEuNTE3LTMuNjY5IDAtMS40MTIuNTA1LTIuNjM1IDEuNTE3LTMuNjY4IDEuMDEyLTEuMDM0IDIuMjEtMS41NSAzLjU5My0xLjU1czIuNTguNTE2IDMuNTkzIDEuNTVsMTMuODEzIDE0LjEwNmg2Ny4zOTZsMTMuODE0LTE0LjEwNmMxLjAxMi0xLjAzNCAyLjIxLTEuNTUgMy41OTItMS41NSAxLjM4NCAwIDIuNTgxLjUxNiAzLjU5MyAxLjU1IDEuMDEyIDEuMDMzIDEuNTE4IDIuMjU2IDEuNTE4IDMuNjY4IDAgMS40MTMtLjUwNiAyLjYzNi0xLjUxOCAzLjY3bC0xMy44MTQgMTQuMTA1djIzLjk3NWgxNy44ODdjMS4zODMgMCAyLjU4LjUxNiAzLjU5MyAxLjU1IDEuMDExIDEuMDMzIDEuNTE3IDIuMjU2IDEuNTE3IDMuNjY4bC0uMDA1LjAxek04OS41NTIgMjYuMTc1SDM4LjQ0OGMwLTcuMjMgMi40ODktMTMuMzg2IDcuNDY2LTE4LjQ2OUM1MC44OTIgMi42MjMgNTYuOTIuMDgyIDY0IC4wODJjNy4wOCAwIDEzLjEwOCAyLjU0MSAxOC4wODYgNy42MjQgNC45NzcgNS4wODMgNy40NjYgMTEuMjQgNy40NjYgMTguNDY5elxcXCIgLz48L3N5bWJvbD5cIlxufSk7XG52YXIgcmVzdWx0ID0gc3ByaXRlLmFkZChzeW1ib2wpO1xuZXhwb3J0IGRlZmF1bHQgc3ltYm9sIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/icons/svg/bug.svg\n");

/***/ })
```
所以在JS中使用svg标签来加载对应的svg文件的时候只需要在svg标签加入use 然后给id属性赋值为对应symbol的id，比如`id="#icon-404"`