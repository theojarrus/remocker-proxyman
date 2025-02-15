
# Remocker

Remocker. Proxyman addon for automatic substitution of parameters

## Problem

If you often work with mocks to test applications, you have encountered responses that have a set of parameters that need to be replaced. However, these parameters have to be changed frequently, for example, when changing a user, product, etc. Remocker allows you to simplify this process as much as possible: it can automatically substitute values ​​from request parameters or defaults into mocks.

Query parameters:

```http
GET /api/items?applicationId=yourId
```

Path parameters:

```http
GET /api/items/application/yourId
```

Body parameters:

```http
POST /api/items
```

| Parameter | Value     |
| :-------- | :------- |
| `applicationId`      | `yourId` |

## Installation

For ease of use, [download](https://github.com/theojarrus/remocker-proxyman/archive/refs/heads/main.zip) and move Remocker to [Proxyman Custom Addons Folder](https://docs.proxyman.com/scripting/write-your-own-addons). The path should look like this:

```
~/Library/Application\ Support/com.proxyman.NSProxy/users
```

Otherwise, correct the path to the files in the scripts from the instructions.

## Usage

1. Place required mocks inside `/remocker/mocks`
2. Define the keys, which must be replaced, inside your mock using brackets. For example, here is the mock with key `{applicationId}`:
```javascript
{
  "requestId": "af12fd8e4983c12f78fe",
  "result": [
    {
      "applicationId": "{applicationId}",
      "text": "Here is your result with matched id"
    }
  ],
  "success": true
}
```
3. Open the proxyman and select the `Scripting` option
4. Fill required fields and set check to `Run script on: Response`
5. Paste the code below into the script field, changing the parameters to yours

```javascript
// Response mock file name
const mock = "example.json"

// Import remocker
const { remockBody } = require("@users/remocker/app/remocker.js")

// Import transform action
const { transformActionExample } = require("@users/remocker/app/remocker-transform-action-example.js")

// Import defaults
const defaults = require("@users/remocker/app/defaults.json")

// Import mock
const mockBody = require("@users/remocker/mocks/" + mock)

async function onResponse(context, url, request, response) {
  // Replace response body with Remocker result
  response.body = remockBody(url, request.body, mockBody, defaults, transformActionExample)
  // Fix response
  response.headers["content-type"] = "application/json"
  response.statusCode = 200
  // Return response
  return response;
}
```

Tip: for instant work without waiting for a response from the server, in Proxyman you should set check to `Run as Mock API`.

#### Parameters

| Parameter | Type     |
| :-------- | :------- |
| `url`      | **required** |
| `requestBody`      | **required** |
| `mockBody`      | **required** |
| `defaults`      | *optional* |
| `transformAction`      | *optional* |

#### Defaults

To use default values ​​if the required key is not present in the request parameters simply add them to `remocker/app/defaults.json`:

```javascript
{
  "exampleKey": "exampleDefaultValue"
  ...
}
```

#### Raw body

To use Remocker on a raw body call `remockRawBody` instead of `remockBody`.

#### Transform action

Transform action allows you to reduce different keys to one. For example, you have a parameter `applicationId`, but in requests parameters it can be also called `integrationId` or `application`. You can define this logic by transforming initial key:

```javascript
function transformActionExample(key) {
    return [...new Set([
        key,
        key.replace("Id", ""),
        key.replace("application", "integration")
    ])]
}

exports.transformActionExample = transformActionExample
```

## Contribution

At the moment, Remocker is considered ready and does not need any improvements. But if you have any ideas on how to improve it, feel free to contribute.