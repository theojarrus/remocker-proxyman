function getDefinedElement(parameters) {
    return parameters.find(element => element)
}

function filterDefinedProperty(parameters) {
    return parameters.filter(element => element[1])
}

function parseResponseKeys(body) {
    const matchRegex = /{([^{}]+)}/g
    const outRegex = /[{}]/g
    return body.match(matchRegex)?.map(match => match.replace(outRegex, ""))
}

function parsePathParameters(paths, key) {
    const index = paths.findIndex((element) => element === key)
    return (index >= 0 && index < paths.length - 2) ? paths[index + 1] : undefined
}

function parseQueryParameters(url, key) {
    const matchRegex = new RegExp(`${key}=([^&]*)`, "g")
    const outRegex = new RegExp(`${key}=`)
    return url.match(matchRegex)?.map(match => match.replace(outRegex, "")) || undefined
}

function parseBodyParameters(body, key) {
    const matchRegex = new RegExp(`"${key}":\\s*"([^"]+)"`, "g")
    const outRegex = new RegExp(`"${key}":\\s*`)
    const trimRegex = /"/g
    return body?.match(matchRegex)?.map(match => match.replace(outRegex, "").replace(trimRegex, "")) || undefined
}

function getPathParameters(url, key, transformAction) {
    return transformAction(key).flatMap(transformed => parsePathParameters(url.split("/"), transformed))
}

function getQueryParameters(url, key, transformAction) {
    return transformAction(key).flatMap(transformed => parseQueryParameters(url, transformed))
}

function getBodyParameters(body, key, transformAction) {
    return transformAction(key).flatMap(transformed => parseBodyParameters(body, transformed))
}

function getParameter(url, requestBody, key, defaults, transformAction) {
    return [
        key,
        getDefinedElement(getQueryParameters(url, key, transformAction))
        || getDefinedElement(getBodyParameters(requestBody, key, transformAction))
        || getDefinedElement(getPathParameters(url, key, transformAction))
        || defaults?.[key]
    ]
}

function getParameters(url, requestBody, responseBody, defaults, transformAction) {
    return Object.fromEntries(filterDefinedProperty(parseResponseKeys(responseBody).map(key => getParameter(url, requestBody, key, defaults, transformAction))))
}

function replaceBody(body, parameters) {
    return Object.keys(parameters).reduce((acc, key) => acc.replaceAll(new RegExp(`{${key}}`, "g"), parameters[key]), body)
}

function remockRawBody(url, requestBody, responseBody, defaults, transformAction = (key => [key])) {
    return replaceBody(responseBody, getParameters(url, requestBody, responseBody, defaults, transformAction))
}

function remockBody(url, requestBody, responseBody, defaults, transformAction = (key => [key])) {
    return JSON.parse(remockRawBody(url, JSON.stringify(requestBody), JSON.stringify(responseBody), defaults, transformAction))
}

exports.remockBody = remockBody
exports.remockRawBody = remockRawBody