function transformActionExample(key) {
    return [...new Set([
        key,
        key.replace("Id", ""),
        key.replace("application", "integration")
    ])]
}

exports.transformActionExample = transformActionExample