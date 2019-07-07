'use strict';

var _		= require('lodash');
var util	= require('util');
var path	= require('path');
var chalk	= require('chalk');
var clientlinker = require('clientlinker-core');
var rlutils	= exports;

var colors = exports.colors = new chalk.constructor();

exports.parseAction = parseAction;
function parseAction(str, allMethods)
{
	str = str && (''+str).trim();
	if (!str)
		return;
	else if (allMethods.indexOf(str) != -1)
		return str;
	else if (!isNaN(str))
		return allMethods[Number(str)-1];
	else
	{
		var clientName = clientlinker.util.parseAction(str).clientName;
		if (allMethods.indexOf(clientName+'.*') != -1)
			return str;
	}
}



exports.resolve = resolve;
exports.USER_HOME = process.env.HOME || process.env.USERPROFILE;
function resolve(str)
{
	if (str.substr(0, 2) == '~/' && rlutils.USER_HOME)
		return path.resolve(rlutils.USER_HOME, str.substr(2));
	else
		return path.resolve(str);
}



exports.printObject = printObject;
function printObject(obj)
{
	if (obj instanceof Error)
		return obj.stack;
	else
		return util.inspect(obj, {depth: 8, colors: colors.enabled});
}


exports.getAllMethods = getAllMethods;
function getAllMethods(list)
{
	var allMethods	= [];
	var lines		= [];
	var allFlows	= [];
	var clientNames	= Object.keys(list).sort();

	clientNames.forEach(function(clientName)
	{
		var item = list[clientName];
		lines.push(
		{
			type: 'header',
			client: clientName
		});

		var methods = item && item.methods && Object.keys(item.methods).sort();
		if (methods && methods.length)
		{
			methods.forEach(function(method)
			{
				var froms = item.methods[method]
						.map(function(from)
						{
							return from && from.name;
						});

				var action = clientName+'.'+method;
				allFlows.push.apply(allFlows, froms);

				lines.push(
					{
						type	: 'line',
						index	: allMethods.push(action),
						client	: clientName,
						method	: method,
						action	: action,
						froms	: froms
					});
			});
		}
		else
		{
			lines.push({type: 'nomethods'});
		}
	});


	allMethods.lines = lines;
	allMethods.allFlows = _.uniq(allFlows)
		.sort()
		.map(function(name)
		{
			return name === undefined ? 'undefined' : name;
		});

	return allMethods;
}
