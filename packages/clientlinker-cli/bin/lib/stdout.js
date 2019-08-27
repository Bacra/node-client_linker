'use strict';

var Promise		= require('bluebird');
var util		= require('util');

exports.is_verbose = true;
exports.promise = Promise.resolve();
exports.stdout = process.stdout;
exports.stderr = process.stderr;


'log|warn|error|info|verbose'.split('|').forEach(function(name)
	{
		exports[name] = function()
		{
			if (name != 'verbose' || exports.is_verbose)
			{
				var str = util.format.apply(null, arguments) + '\n';
				if (name == 'verbose') str = '[verbose] '+str;
				exports.write(str, name);
			}
		}

		console[name] = function()
		{
			if (exports.is_verbose)
			{
				var str = util.format.apply(null, arguments) + '\n';
				exports.write(str, name);
			}
		}
	});


exports.write = write;
function write(str, name)
{
	var stdout = name == 'error' ? exports.stderr : exports.stdout;
	var ok = stdout.write(''+str);

	if (!ok && !stdout._clientlinker_writing)
	{
		stdout._clientlinker_writing = true;
		var promise = new Promise(function(resolve)
			{
				stdout.once('drain', function()
				{
					stdout._clientlinker_writing = false;
					resolve();
				});
			});

		exports.promise = Promise.all([exports.promise, promise]);
	}

	return ok;
}
