# 🔥 Hot Stuff 🔥
various NodeJS utils with type definition inference

## Table of Contents
- 💨 [HotRequests](#HotRequests)
- ⏲️ [Stopwatch](#Stopwatch)
- ⚙️ [HotUrl](#HotUrl)
- 📜 [HotLogger](#HotLogger)
- 💫 [HotObj](#HotObj)
- ⚡ [Languages and tools](#languages-and-tools)

<br />

## 💨 HotRequests <a name="HotRequests"></a>
---
### supports all http methods

<br />

usage
```ts
import { HotRequests } from "@p.zarkov/hotstuff";

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
#### response is one of the two:
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

## ⏲️ Stopwatch <a name="Stopwatch"></a>
---
### for timing
<br />

usage
```ts
import { Stopwatch } from "@p.zarkov/hotstuff";

const mySW = new Stopwatch();

(() => Promise)(); // Some action

mySW.getElapsedMs(); // elapsed miliseconds since construction
mySW.getElapsedS(); // elapsed seconds since construction
```

<br />

## ⚙️ HotUrl <a name="HotUrl"></a>
---
### Build your URL from an already existing URL or a string with optional query params
#### or just use the methods in isolation
<br />

- buildQuery
```ts
import { HotUrl } from "@p.zarkov/hotstuff";


// All three result in http://localhost:4444/?query1=val1&query2=true
HotUrl.buildQuery("http://localhost:4444/", { query1: "val1", query2: true  });
HotUrl.buildQuery("http://localhost:4444", { query1: "val1", query2: true  });
HotUrl.buildQuery(new URL("http://localhost:4444/"), { query1: "val1", query2: true  });

// Nullables are ignored
// Results in http://localhost:4444/?query1=val1
HotUrl.buildQuery(new URL("http://localhost:4444/"), { query1: "val1", query2: undefined  });
```

- replacePathParams - basically a formatUnicorn
```ts
import { HotUrl } from "@p.zarkov/hotstuff";

// Results in "Some text."
HotUrl.replacePathParams("Some {replacement}.", { replacement: "text" });
```

- buildFromString - builds a new URL from string
```ts
import { HotUrl } from "@p.zarkov/hotstuff";

// Domain can end with / or not
// Path can start with / or not
// Both result in "http://localhost:4444/some/path/params/"
HotUrl.buildFromString("http://localhost:4444/", "/some/path/params/");
HotUrl.buildFromString("http://localhost:4444", "some/path/params/");
```

- build - combines buildQuery, buildFromString, replacePathParams
```ts
import { HotUrl } from "@p.zarkov/hotstuff";

// Results in "http://localhost:4444/base/path/somedynamicpath/?someQ=1"
HotUrl.build({
    base: "http://localhost:4444/{someBasePath}",
    path: "/path/{dynamic}/",
    pathParams: { someBasePath: "base", dynamic: "somedynamicpath" },
    queryParams: { someQ: "1"}
});
```

<br />

## 📜 HotLogger <a name="HotLogger"></a>
---
### Log all you need
<br />

usage
```ts
import { HotLogger } from "@p.zarkov/hotstuff";

const myLogger = new HotLogger.createLogger("MyLoggerContext");

// Logs
[{"Message":"Some info msg","LogLevel":"Trace","SourceContext":"MyLoggerContext","data":{"smh":"ye"},"ProcessID":21268,"AppVersion":"0.0.5","AppName":"@p.zarkov/hotstuff","Env":"development","LogTimestamp":"2021-12-08T13:06:01.911Z"}]
myLogger.trace("Some info msg", { data: { smh: "ye"} });

// Logs
[{"Message":"Some err msg","LogLevel":"Error","SourceContext":"WeHot","ExceptionMessage":"yer error","ExceptionStacktrace":"Error: yer error at Object.<anonymous> at (C:\\hotstuff\\index.js:18:40),"ProcessID":15320,"AppVersion":"0.0.5","AppName":"@p.zarkov/hotstuff","Env":"development","LogTimestamp":"2021-12-08T13:32:45.847Z"}]
myLogger.error("Some err msg", { err: new Error("yer error") });

```

<br />


## 💫 HotObj <a name="HotObj"></a>
---
### Object utils
<br />

usage
```ts
import { HotObj } from "./utils";

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


```

<br />

## Languages and Tools <a name="languages-and-tools"></a>
---
[<img align="left" title="Visual Studio Code" alt="vsCode" width="26px" src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/visual-studio-code/visual-studio-code.png" />](https://code.visualstudio.com/)
[<img align="left" title="JavaScript" alt="JavaScript" width="26px" src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/javascript/javascript.png" />](https://www.javascript.com/)
[<img align="left" title="Typescript" alt="Typescript" width="26px" src="https://www.typescriptlang.org/favicon-32x32.png?v=8944a05a8b601855de116c8a56d3b3ae" />](https://www.typescriptlang.org/)
[<img align="left" title="NodeJS" alt="NodeJS" width="26px" src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/nodejs/nodejs.png" />](https://nodejs.org/en/)
[<img align="left" title="Docker" alt="Docker" width="26px" src="https://www.docker.com/sites/default/files/d8/Docker-R-Logo-08-2018-Monochomatic-RGB_Moby-x1.png" />](https://www.docker.com/)
