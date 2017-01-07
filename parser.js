var Promise = require("bluebird");
var request = Promise.promisifyAll(require("request"));
var fs =  Promise.promisifyAll(require("fs"));

function parseFile(options) {
	return new Promise(function (resolve, reject) {
		fs.readFileAsync(options.filePath, 'utf-8').then(function(content) {
			resolve({
				filePath: options.filePath,
				body: content
			});
		}).catch(function (error) {
			reject(error);
		});
	});
}

function parseUrl(options) {
	if (!options.uri) {
		return Promise.reject(new TypeError('uri is required'));
	}
	return new Promise(function (resolve, reject) {
		request.getAsync(options.uri).get(1).then(function (body) {
			if (options.saveToFile) {
				fs.writeFileAsync(options.saveToFile, body).then(function () {
					resolve({
						filePath: options.saveToFile,
						body: body
					});
				}).catch(function (error) {
					reject(error);
				});
			} else {
				resolve({
					body: body
				});
			}
		}).catch(function (error) {
			reject(error);
		});
	});
}

module.exports = {
	parseFile: parseFile,
	parseUrl: parseUrl
};