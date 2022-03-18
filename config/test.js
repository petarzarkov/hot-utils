// Will be merged with default
module.exports = {
    log: {
        serializers: [{
            key: "event",
            values: ["e2eTest"],
            modifiers: [{ properties: ["data"] }]
        }]
    }
}