# 🔥 Hot Stuff 🔥
Various NodeJS utils

## Install
`npm i @p.zarkov/hotstuff`

## Utils
### fetchService
---
#### for everything http

<br />

usage
```ts
import { fetchService } from "@p.zarkov/hotstuff";

const myRes = await fetchService({
    url: "https://www.yoururl.com/{pathParamToReplace}",
    method: "POST",
    payload: { some: "payload" },
    options: {
        pathParams: {
            pathParamToReplace: "myDynamicPathParam"
        },
        queryParams: {
            someQueryParam: true
        }
    }
});
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

### Stopwatch
---
#### for timing
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

### replacePathParams
---
#### basically a formatUnicorn
<br />

usage
```ts
import { replacePathParams } from "@p.zarkov/hotstuff";

const myNewReplacedString = replacePathParams("Some {replacement}.", { replacement: "text" });

console.log(myNewReplacedString);
// Outputs
// Some text.
```

<br />

## Languages and Tools
---
[<img align="left" title="Visual Studio Code" alt="vsCode" width="26px" src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/visual-studio-code/visual-studio-code.png" />](https://code.visualstudio.com/)
[<img align="left" title="JavaScript" alt="JavaScript" width="26px" src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/javascript/javascript.png" />](https://www.javascript.com/)
[<img align="left" title="Typescript" alt="Typescript" width="26px" src="https://www.typescriptlang.org/favicon-32x32.png?v=8944a05a8b601855de116c8a56d3b3ae" />](https://www.typescriptlang.org/)
[<img align="left" title="NodeJS" alt="NodeJS" width="26px" src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/nodejs/nodejs.png" />](https://nodejs.org/en/)
[<img align="left" title="Docker" alt="Docker" width="26px" src="https://www.docker.com/sites/default/files/d8/Docker-R-Logo-08-2018-Monochomatic-RGB_Moby-x1.png" />](https://www.docker.com/)
