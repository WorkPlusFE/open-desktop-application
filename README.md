# @w6s/open-desktop-application [![npm version](https://badge.fury.io/js/%40w6s%2Fopen-desktop-application.svg)](https://badge.fury.io/js/%40w6s%2Fopen-desktop-application)

> 通过 URL协议 打开桌面应用

**注意**

在`IE`浏览器上，通过协议打开应用时，链接会自动补上`/`，如：`workplus://chat/?id=123`，被打开应用在实现监听打开事件时，要兼容处理！

## 安装

```bash
yarn add @w6s/open-desktop-application
// or
npm install @w6s/open-desktop-application -S
```

可以直接通过`script`标签引入，全局暴露`openDesktopApplication`方法，使用方法和参数跟下面的一致，详情请查看[example/index.html](https://github.com/WorkPlusFE/open-desktop-application/blob/master/example/index.html)。

脚本资源请从[release页面](https://github.com/WorkPlusFE/open-desktop-application/releases)下载。

## 使用

```js
import openDesktopApplication from '@w6s/open-desktop-application';

const params = {
    protocol: 'workplus',
    action: 'joinchat',
    query: {
        id: 1,
        name: 'test',
    },
    fail: function() {},
    success: function() {},
};
openDesktopApplication(params);
```

## 参数说明

* protocol [必须]应用协议名，一般跟注册表有关系
* action [必须]调用的方法名，需要和应用开发者进行约定
* query 传入的参数，需要和应用开发者约定
* fail 错误回调方法；不支持时，会返回`{ supported: false }`
* success 成功回调方法

