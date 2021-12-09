# 🔥 Hot Utils 🔥
various NodeJS utils with type definition inference

## Install
`npm install hot-utils`

## Table of Contents
- 💨 [HotRequests](#HotRequests)
- ⏲ [HotWatch](#HotWatch)
- ⚙️ [HotUrl](#HotUrl)
- 📜 [HotLogger](#HotLogger)
- 💫 [HotObj](#HotObj)
- 🚥 [HotPromise](#HotPromise)
- ⚡ [Languages and tools](#languages-and-tools)

<br />

## 💨 HotRequests <a name="HotRequests"></a>
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

## ⏲️ HotWatch <a name="HotWatch"></a>
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

## ⚙️ HotUrl <a name="HotUrl"></a>
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

## 📜 HotLogger <a name="HotLogger"></a>
### Log all you need
---
<br />

```ts
import { HotLogger } from "hot-utils";

const myLogger = new HotLogger.createLogger("MyLoggerContext");

myLogger.trace("Some info msg", { data: { smh: "ye"} });
// [{"Message":"Some info msg","LogLevel":"Trace","SourceContext":"MyLoggerContext","data":{"smh":"ye"},"ProcessID":21268,"AppVersion":"0.0.5","AppName":"hot-utils","Env":"development","LogTimestamp":"2021-12-08T13:06:01.911Z"}]

myLogger.error("Some err msg", { err: new Error("yer error") });
// [{"Message":"Some err msg","LogLevel":"Error","SourceContext":"WeHot","ExceptionMessage":"yer error","ExceptionStacktrace":"Error: yer error at Object.<anonymous> at (C:\\hot-utils\\index.js:18:40),"ProcessID":15320,"AppVersion":"0.0.5","AppName":"hot-utils","Env":"development","LogTimestamp":"2021-12-08T13:32:45.847Z"}]
```

<br />


## 💫 HotObj <a name="HotObj"></a>
### Object utils
---
<br />

```ts
import { HotObj } from "hot-utils";

const a = { 1: "one", "one": 1 };
const b = { 1: "one", "one": 1 };

HotObj.shallowEquals(a, b); // true
HotObj.strip(a, [1, 1]); // { '1': 'one' }
HotObj.strip(a, [1, 2]); // Type '2' is not assignable to type '"one" | 1'.
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

## 🚥 HotPromise <a name="HotPromise"></a>
### Promise utils
---
<br />

```ts
import { HotPromise } from "./utils";

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

<br />

## Languages and Tools <a name="languages-and-tools"></a>
---
[<img align="left" title="Visual Studio Code" alt="vsCode" width="26px" src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/visual-studio-code/visual-studio-code.png" />](https://code.visualstudio.com/)
[<img align="left" title="JavaScript" alt="JavaScript" width="26px" src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/javascript/javascript.png" />](https://www.javascript.com/)
[<img align="left" title="Typescript" alt="Typescript" width="26px" src="https://www.typescriptlang.org/favicon-32x32.png?v=8944a05a8b601855de116c8a56d3b3ae" />](https://www.typescriptlang.org/)
[<img align="left" title="NodeJS" alt="NodeJS" width="26px" src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/nodejs/nodejs.png" />](https://nodejs.org/en/)
[<img align="left" title="Docker" alt="Docker" width="26px" src="https://www.docker.com/sites/default/files/d8/Docker-R-Logo-08-2018-Monochomatic-RGB_Moby-x1.png" />](https://www.docker.com/)