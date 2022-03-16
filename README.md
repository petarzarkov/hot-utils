<div align="center">
    <h1>🔥 Hot Utils 🔥</h1>
	<p>Various NodeJS utils with type definition inference</p>
	<a href="https://github.com/petarzarkov/hotstuff/actions/"><img src="https://github.com/petarzarkov/hotstuff/actions/workflows/docker-build.yml/badge.svg?branch=main" alt="Build status""></a>
	<a href="https://packagephobia.now.sh/result?p=hot-utils"><img src="https://badgen.net/packagephobia/install/hot-utils" alt="Current version"></a>
	<a href="https://www.npmjs.com/package/hot-utils"><img src="https://img.shields.io/npm/v/hot-utils" alt="Install size"></a>
	<a href="https://github.com/petarzarkov/hotstuff/blob/main/LICENSE"><img src="https://img.shields.io/github/license/petarzarkov/hotstuff" alt="License"></a>
    <p>Stack</p>
    <a href="https://www.javascript.com/"><img title="JavaScript" alt="JavaScript" width="26px" height="26px" src="https://github.com/get-icon/geticon/raw/master/icons/javascript.svg" /></a>
    <a href="https://www.typescriptlang.org/"><img title="Typescript" alt="Typescript" width="26px" height="26px" src="https://github.com/get-icon/geticon/raw/master/icons/typescript-icon.svg" /></a>
    <a href="https://nodejs.org/en/"><img title="NodeJS" alt="NodeJS" width="26px" height="26px" src="https://github.com/get-icon/geticon/raw/master/icons/nodejs-icon.svg" /></a>
    <a href="https://www.docker.com/"><img title="Docker" alt="Docker" width="26px" height="26px" src="https://github.com/get-icon/geticon/raw/master/icons/docker-icon.svg" /></a>
    <a href="https://github.com/" title="Github"><img src="https://github.com/get-icon/geticon/raw/master/icons/github-icon.svg" alt="Github" width="26px" height="26px" style="background-color: white; border-radius: 12px"></a>
    <a href="https://code.visualstudio.com/" title="Visual Studio Code"><img src="https://github.com/get-icon/geticon/raw/master/icons/visual-studio-code.svg" alt="Visual Studio Code" width="26px" height="26px"></a>
    <a href="https://www.npmjs.com/" title="npm"><img src="https://github.com/get-icon/geticon/raw/master/icons/npm.svg" alt="npm" width="26px" height="26px"></a>
    <a href="https://jestjs.io/" title="Jest"><img src="https://github.com/get-icon/geticon/raw/master/icons/jest.svg" alt="Jest" width="26px" height="26px"></a>
    <a href="https://eslint.org/" title="ESLint"><img src="https://github.com/get-icon/geticon/raw/master/icons/eslint.svg" alt="ESLint" width="26px" height="26px"></a>
</div>

## Install

```bash
npm install hot-utils
```

## Requirements

- NodeJS version >= `v15.4.0`

## Table of Contents

<!-- TOC -->

- [HotRequests](#hotrequests)
- [HotWatch](#hotwatch)
- [HotUrl](#hoturl)
- [HotLogger](#hotlogger)
- [HotObj](#hotobj)
- [HotPromise](#hotpromise)

<!-- /TOC -->
<br />

## HotRequests
### [Top](#table-of-contents)

### Supports all http methods

---

<br />

```ts
import { HotRequests } from "hot-utils";

    const res = await HotRequests.get({
        url: "https://wisdoms-app.herokuapp.com/api/{myPath}",
        options: {
            timeout: 400,
            pathParams: { myPath: "getWisdom" },
            queryParams: { lang: "en" }
        }
    });

  // A successful response results in the following
  res: {
    isGood: true,
    statusCode: 200,
    response: {
      sucess: true,
      wisdom: 'But he who gives them to him, the bad guys get along easily, one does not live on bread alone.',
      lang: 'en'
    },
    elapsed: 374
  }
  // Or if it times out
  res: {
    isGood: false,
    error: 'The operation was aborted.',
    statusCode: 500,
    elapsed: 322
  }
```

#### Response is one of the two:

```ts
type HttpSuccessResponse<T> = {
    isGood: true;
    statusCode: number;
    elapsed: number;
    response: T;
};

type HttpErrorResponse<T> = {
    isGood: false;
    error: string;
    elapsed: number;
    statusCode: number;
    response?: T;
};
```

<br />

## HotWatch
### [Top](#table-of-contents)
### For timing

---
<br />

```ts
import { HotWatch } from "hot-utils";

const myWatch = new HotWatch();

(() => Promise)(); // Some action

myWatch.getElapsedMs(); // elapsed miliseconds since construction
myWatch.getElapsedS(); // elapsed seconds since construction
```

<br />

## HotUrl
### [Top](#table-of-contents)
### Build your URL from an already existing URL or a string with optional query params
---
<br />

```ts
import { HotUrl } from "hot-utils";

// Results in "http://localhost:4444/base/path/somedynamicpath/?someQ=1"
HotUrl.build({
    base: "http://localhost:4444/{someBasePath}",
    path: "/path/{dynamic}/",
    pathParams: { someBasePath: "base", dynamic: "somedynamicpath" },
    queryParams: { someQ: "1"}
});

// Results in "Some text."
HotUrl.replacePathParams("Some {replacement}.", { replacement: "text" });

// All three result in http://localhost:4444/?query1=val1&query2=true
HotUrl.buildQuery("http://localhost:4444/", { query1: "val1", query2: true  });
HotUrl.buildQuery("http://localhost:4444", { query1: "val1", query2: true  });
HotUrl.buildQuery(new URL("http://localhost:4444/"), { query1: "val1", query2: true  });

// Nullables are ignored
// Results in http://localhost:4444/?query1=val1
HotUrl.buildQuery(new URL("http://localhost:4444/"), { query1: "val1", query2: undefined  });

// Domain can end with / or not
// Path can start with / or not
// Both result in "http://localhost:4444/some/path/params/"
HotUrl.buildFromString("http://localhost:4444/", "/some/path/params/");
HotUrl.buildFromString("http://localhost:4444", "some/path/params/");
```

<br />

## HotLogger
### [Top](#table-of-contents)
### Log all you need
---
<br />

Example config:
```js
    log: {
        level: "DEBUG",
        filters: [{
            key: "eventName",
            values: [
                "/_filterRoute"
            ]
        }],
        serializers: [{
            key: "eventName",
            values: ["/serializeThisEvent"],
            modifiers: [{ properties: ["data.smh"] }]
        }]
    }
```

```ts
import { HotLogger } from "hot-utils";

const myLogger = HotLogger.createLogger("MyLoggerContext");

myLogger.trace("Some trace msg");
// Will not be logged due to the log.level = "DEBUG" from the above configuration

myLogger.debug("Some trace filter route", { someKey: "/_filterRoute" });
// Will not be logged due to the log.filters[0].key = "someKey" with value "/_filterRoute"

myLogger.debug("Some info msg", { data: { smh: "ye"}, someKey: "/serializeThisEvent" });
// [{"Message":"Some info msg","LogLevel":"Debug","SourceContext":"MyLoggerContext","Properties":{"ProcessID":22172,"AppVersion":"1.0.3","AppName":"hot-utils","AppId":"development-hot-utils","Env":"development","data":{"smh":"********"},"someKey":"/serializeThisEvent"},"LogTimestamp":"2021-12-10T06:46:17.478Z"}]

myLogger.error("Some err msg", { err: new Error("Test err"), data: { smh: "ye"}, someKey: "/serializeThisEvent" });
//[{"Message":"Some err msg","LogLevel":"Error","SourceContext":"MyLoggerContext","ExceptionMessage":"Test err","ExceptionStacktrace":"Error: Test err\n    at Object.<anonymous> (G:\\hehe\\hotstuff\\hot-utils\\index.js:19:39)\n    at Module._compile (internal/modules/cjs/loader.js:1068:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1097:10)\n    at Module.load (internal/modules/cjs/loader.js:933:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:774:14)\n    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:72:12)\n    at internal/main/run_main_module.js:17:47","Properties":{"ProcessID":4444,"AppVersion":"1.0.3","AppName":"hot-utils","AppId":"development-hot-utils","Env":"development","data":{"smh":"********"},"someKey":"/serializeThisEvent"},"LogTimestamp":"2021-12-10T06:51:21.375Z"}]
```

<br />


## HotObj
### [Top](#table-of-contents)
### Object utils
---
<br />

```ts
import { HotObj } from "hot-utils";

const a = { 1: "one", "one": 1 };
const b = { 1: "one", "one": 1 };

HotObj.shallowEquals(a, b); // true

const someObj = {
    prop: "val",
    propTwo: "val2",
    propThree: "val3"
};
const result = HotObj.extract(someObj, ["propTwo", "propThree"]);; // { propTwo: "val2", propThree: "val3" }

// Type def for extract is inferred
(method) HotObj.extract<{
    prop: string;
    propTwo: string;
    propThree: string;
}, "propTwo" | "propThree">(obj: {
    prop: string;
    propTwo: string;
    propThree: string;
}, keys: ("propTwo" | "propThree")[]): {
    propTwo: string;
    propThree: string;
}

HotObj.hasProp(a, 1); // true
HotObj.hasProp(a, "one"); // true
HotObj.getValue(a, "one"); // 1
HotObj.getValue(a, "e"); // Argument of type '"e"' is not assignable to parameter of type '"one" | 1'.
// Type definition is inferred:
HotObj.getValue<{
    1: string;
    one: number;
}, "one" | 1>(obj: {
    1: string;
    one: number;
}, key: "one" | 1): string | number | undefined


const nullableObj = {
    ble: "undefined",
    notaNum: Number("undefined"),
    thisIsFine: 1
};

HotObj.cleanUpNullables(nullableObj); // { thisIsFine: 1 }
```

<br />

## HotPromise
### [Top](#table-of-contents)
### Promise utils
---
<br />

```ts
import { HotPromise } from "hot-utils";

// Results in
// {
//  isGood: false,
//  error: Timed out in 1000 ms.
// }
//
const promiseTimeout = async () => {
    try {
        await HotPromise.promiseTimeout(HotPromise.delay(1010), 1000);
        return { isGood: true, result: "good" };
    } catch (error) {
        return { isGood: false, result: error };
    }
};


// Results in
// {
//  isGood: false,
//  error: Error: Fail, total tries: 5
// }
//
const runTillSuccess = async () => {
    try {
        // Default retry times are 5, you can pass in "forever" to retry indefinitely
        // retries will stop as soon as isGood: true has been returned by the retried action
        const ehee = await HotPromise.runTillSuccess(promiseTimeout);
        return { isGood: true, result: { code: "OK", ehee } };
    } catch (error) {
        return { isGood: false, error };
    }
};

```
