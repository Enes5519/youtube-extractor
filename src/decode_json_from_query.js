function decodeJSONFromQuery(query) {
    const result = {};
    query.split('&').forEach(function (part) {
        const item = part.split('=');
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}

module.exports = decodeJSONFromQuery;