'use strict';

var Promise			= require('bluebird');
var clientlinker	= require('../../');

var linker = clientlinker(
{
	flows: ['not_exists_flow', 'flowNext', 'confighandler', 'pkghandler'],
	clients:
	{
		client:
		{
			confighandler:
			{
				success: function(){return Promise.resolve()},
				error: function(){return Promise.reject()},
				error2: function(){return Promise.reject('errmsg')}
			},
		},
		client2:
		{
			confighandler:
			{
				method: function(query, body, callback, options)
				{
					return Promise.resolve(
					{
						query: query,
						body: body,
						options: options
					});
				},
				method2: function()
				{
					return Promise.resolve();
				}
			},
			pkghandler: __dirname+'/pkghandler/client2.js'
		},
		client3: null
	},
	customFlows:
	{
		flowNext: function(runtime, callback)
		{
			return callback.next();
		}
	}
});

linker.flow('confighandler', require('clientlinker-flow-confighandler'));
linker.flow('pkghandler', require('clientlinker-flow-pkghandler'));

module.exports = linker;
