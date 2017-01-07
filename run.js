var Parser = require("./parser");

Parser.parseUrl({
	uri: "http://games.espn.go.com/ffl/boxscorefull?leagueId=403286&teamId=10&scoringPeriodId=16&seasonId=2014&view=scoringperiod&version=full",
	saveToFile: "test-save-1.html"
}).then(function (data) {
	console.log('Saved to: ' + data.filePath);
	console.log('Data Length: ' + data.body.length);
}).catch(function (error) {
	console.error(error);
});

/*Parser.parseFile({
	filePath: 'test-save.html'
}).then(function (data) {
	console.log('Read from: ' + data.filePath);
	console.log('Data Length: ' + data.body.length);
}).catch(function (error) {
	console.error(error);
});*/