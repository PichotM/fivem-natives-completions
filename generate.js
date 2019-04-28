const request = require('request');
const fs = require('fs');
const completionsStyle = process.argv[2] ? Number(process.argv[2]) : 0;
const startDate = new Date();

const patternStyle = [
	'{\n	"scope": "source.lua",\n\n	"completions":\n	[\n%s	]\n}',
	'{\n%s\n}',
	"'.source.lua':\n%s"
]

const itemStyle = [
	'		{ "trigger": "%nativeName", "contents": "%nativeName(%nativeArgs)" },',
	'	"%nativeName": {\n		"prefix": "%nativeName",\n		"body": [\n			"%nativeName(%nativeArgs)"\n		]\n	},',
	"  '%nativeName':\n    'prefix': '%nativeName'\n    'body': '%nativeName(%nativeArgs)'"
]

const completionsName = ['fivem.sublime-completions', 'lua.json', 'snippets.cson']

request('https://runtime.fivem.net/doc/natives.json', function (err, response, content) {
	if (err || response.statusCode != 200) return console.log('fail');;

	var _strCompletions = "";

	const obj = JSON.parse(content);
	const pattern = patternStyle[completionsStyle];
	const item = itemStyle[completionsStyle];

	for (let category in obj) {
		for (let native in obj[category]) {
			let nativeStr = "";
			let nativeData = obj[category][native];
			let nativeName = (nativeData.name || native).toLowerCase().replace('0x', 'n_0x')
			.replace(/_([a-z])/g, (sub, bit) => bit.toUpperCase())
			.replace(/^([a-z])/, (sub, bit) => bit.toUpperCase());

			nativeStr += item.replace(/%nativeName/g, nativeName);

			let paramStr = "";
			for (let i = 0; i <= nativeData.params.length - 1; i++) {
				paramStr = paramStr + ((i != 0 ? ", " : "" ) + "${" + (i + 1) + ":" + nativeData.params[i].name + "}")
			}

			nativeStr = nativeStr.replace(/%nativeArgs/g, paramStr);
			_strCompletions += nativeStr + "\n";
		}
	}

	fs.writeFile('completions/' + completionsName[completionsStyle], pattern.replace(/%s/g, _strCompletions), err => {
		if (err) return console.error(err)
		console.info('Done in: %dms!', new Date() - startDate)
	});
});