'use strict';

var _			= require('lodash');
var rlutils		= require('./rlutils');
var printTable	= require('./print_table').printTable;
var printTpl	= require('./print_tpl');
var stdout		= require('./stdout');
var pkg			= require('../../package.json');

var commandActions = exports;


exports.execAction = function execAction(conf_file, action, options, ignoreRunError)
{
	options || (options = {});
	var linker = requireLinker(conf_file);

	return commandActions.filterAllMehtods(linker, options.clients)
		.then(function(allMethods)
		{
			var realaction = rlutils.parseAction(action, allMethods);
			if (!realaction)
			{
				var err = new Error('Not Found Action');
				err.action = action;
				throw err;
			}

			return commandActions.runAction(linker, realaction,
					options.query,
					options.body,
					options.options,
					ignoreRunError
				);
		})
		.catch(function(err)
		{
			stdout.error(printTpl.errorInfo(err));
			throw err;
		});
}


exports.listAction = function listAction(conf_file, options)
{
	options || (options = {});
	var linker = requireLinker(conf_file);

	return commandActions.filterAllMehtods(linker, options.clients)
		.then(function(allMethods)
		{
			var flows = parseFilterFlows(options.flows, allMethods.allFlows);
			var output = printTable(allMethods.lines, flows, options);
			stdout.log(output);

			return {
				output: output,
				linker: linker,
				methods: allMethods
			};
		})
		.catch(function(err)
		{
			stdout.error(printTpl.errorInfo(err));
			throw err;
		});
}


/**
 * 解析cli的flow字符串
 *
 * 只包含可用的flow，如果没有可用flow，则返回全部flows
 *
 * @param  {String} flowsStr
 * @param  {Array}  allFlows
 * @return {Array}
 */
function parseFilterFlows(flowsStr, allFlows)
{
	var flows = flowsStr && flowsStr.split(/ *, */);
	if (flows) flows = _.intersection(flows, allFlows);
	if (!flows || !flows.length) flows = allFlows;

	return flows;
}
exports.parseFilterFlows = parseFilterFlows;


exports.filterAllMehtods = function filterAllMehtods(linker, clients)
{
	return linker.methods()
		.then(function(list)
		{
			var reallist;

			if (!clients)
				reallist = list;
			else
			{
				reallist = {};
				clients.split(/ *, */).forEach(function(name)
				{
					reallist[name] = list[name];
				});
			}

			return rlutils.getAllMethods(reallist);
		})
		.then(function(allMethods)
		{
			if (!allMethods || !allMethods.length)
				throw new Error('No Client Has Methods');
			else
				return allMethods;
		});
}



exports.runAction = function runAction(linker, action, query, body, options, ignoreRunError)
{
	options || (options = {});
	var retPromise;
	var args = [action, query, body, null, options];
	var str = printTpl.runActionStart(action, query, body, options);
	stdout.log(str);

	// 兼容老的linker
	if (linker.runIn)
		retPromise = linker.runIn(args, 'cli');
	else
		retPromise = linker.run.apply(linker, args);

	return retPromise
		.then(function(data)
		{
			var str = printTpl.runActionEnd(action, 'data', retPromise.runtime, data);
			stdout.log(str);

			return data;
		},
		function(err)
		{
			var str = printTpl.runActionEnd(action, 'error', retPromise.runtime, err);
			stdout.error(str);

			if (!ignoreRunError) throw err;
		});
}


function requireLinker(conf_file)
{
	var linker = require(rlutils.resolve(conf_file));

	if (linker.version != pkg.version)
	{
		var str = printTpl.linkerVersionNotMatch(pkg.version, linker.version);
		stdout.warn(str);
	}

	return linker;
}
