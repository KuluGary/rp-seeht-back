module.exports.getNestedKey = (string, element) => string.split(".").reduce((p, c) => (p && p[c]) || null, element);
