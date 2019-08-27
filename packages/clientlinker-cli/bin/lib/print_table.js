'use strict';

var table = require('table');
var useSymbole
	= exports.useSymbole
	// = process.platform == 'win32' ? '\u221A' : '✓';
	= '*';

exports.printTable = printTable;
function printTable(data, allFlows, options)
{
	options || (options = {});
	var defaultFlowFromArr = [];
	var flowFromIndexMap = {};

	allFlows.forEach(function(from, index)
		{
			defaultFlowFromArr.push('');
			flowFromIndexMap[from] = index;
		});

	var tableData = [];
	data.forEach(function(item)
		{
			switch(item.type)
			{
				case 'header':
					// 空一行
					if (tableData.length)
					{
						var line = [' ', '', ''].concat(defaultFlowFromArr);
						tableData.push(line);
					}

					tableData.push(['', item.client, ' '].concat(allFlows));
					break;

				case 'nomethods':
					var line = ['', '** No Methods **', '']
							.concat(defaultFlowFromArr);
					tableData.push(line);
					break;

				default:
					var realFlowList = defaultFlowFromArr.slice();
					var froms = item.froms.map(function(name)
						{
							if (name === undefined) name = 'undefined';

							var flowTabIndex = flowFromIndexMap[name];
							if (flowTabIndex || flowTabIndex === 0)
							{
								realFlowList[flowTabIndex] = name+' '+useSymbole;
							}

							return name;
						});

					var line = [
							item.index,
							options.useAction ? item.action : item.method,
							'' && froms.join(',')
						]
						.concat(realFlowList);

					tableData.push(line);
			}
		});

	var output = table.table(tableData,
		{
			border: table.getBorderCharacters('void'),
			columnDefault:
			{
				paddingLeft: 1,
				paddingRight: 1
			},
			drawHorizontalLine: function()
			{
				return 0;
			}
		});

	return output;
}
