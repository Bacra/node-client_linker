'use strict';

var Promise			= require('bluebird');
var expect			= require('expect.js');
var commandActions	= require('../bin/lib/command_actions');
var printTable		= require('../bin/lib/print_table');
var printTpl		= require('../bin/lib/print_tpl');

var CONFIG_FILE			= __dirname+'/conf/simple.conf.js';
var EMPTY_CONFIG_FILE	= __dirname+'/conf/empty.conf.js';

require('../bin/lib/rlutils').colors.enabled = false;

describe('#commandActions', function()
{
	it('#runAction', function()
	{
		var linker = require(CONFIG_FILE);

		return Promise.all(
			[
				commandActions.runAction(linker, 'client.success'),
				commandActions.runAction(linker, 'client.error')
					.then(function(){expect().fail()},
						function(err)
						{
							expect(err).to.be(undefined);
						})
			]);
	});


	describe('#listAction', function()
	{
		it('#base', function()
		{
			var output = [
				'    client               confighandler    pkghandler   ',
				' 1  error                confighandler $               ',
				' 2  error2               confighandler $               ',
				' 3  success              confighandler $               ',
				'                                                       ',
				'    client2              confighandler    pkghandler   ',
				' 4  method               confighandler $               ',
				' 5  method1                               pkghandler $ ',
				' 6  method2              confighandler $  pkghandler $ ',
				'                                                       ',
				'    client3              confighandler    pkghandler   ',
				'    ** No Methods **                                   ',
				'']
				.join('\n')
				.replace(/\$/g, printTable.useSymbole);

			return commandActions.listAction(CONFIG_FILE, {})
				.then(function(data)
				{
					expect(data.output.split('\n')).to.eql(output.split('\n'));
				});
		});

		it('#clients options', function()
		{
			var output = [
				'    client2     confighandler    pkghandler   ',
				' 1  method      confighandler $               ',
				' 2  method1                      pkghandler $ ',
				' 3  method2     confighandler $  pkghandler $ ',
				'']
				.join('\n')
				.replace(/\$/g, printTable.useSymbole);

			return commandActions.listAction(CONFIG_FILE,
				{
					clients: 'client2',
				})
				.then(function(data)
				{
					expect(data.output.split('\n')).to.eql(output.split('\n'));
				});
		});

		it('#clients width useAction', function()
		{
			var output = [
				'    client2             confighandler    pkghandler   ',
				' 1  client2.method      confighandler $               ',
				' 2  client2.method1                      pkghandler $ ',
				' 3  client2.method2     confighandler $  pkghandler $ ',
				'']
				.join('\n')
				.replace(/\$/g, printTable.useSymbole);

			return commandActions.listAction(CONFIG_FILE,
				{
					clients: 'client2',
					useAction: true
				})
				.then(function(data)
				{
					expect(data.output.split('\n')).to.eql(output.split('\n'));
				});
		});

		it('#no methods', function()
		{
			return commandActions.listAction(EMPTY_CONFIG_FILE, {})
				.then(function(){expect().fail()},
					function(err)
					{
						expect(err.message).to.be('No Client Has Methods');
					});
		});

		it('#flows options', function()
		{
			var output = ['    client      confighandler   ',
				' 1  error       confighandler $ ',
				' 2  error2      confighandler $ ',
				' 3  success     confighandler $ ',
				'']
				.join('\n')
				.replace(/\$/g, printTable.useSymbole);

			return commandActions.listAction(CONFIG_FILE,
				{
					clients: 'client',
					flows: 'not_exists_flow, confighandler'
				})
				.then(function(data)
				{
					expect(data.output.split('\n')).to.eql(output.split('\n'));
				});
		});
	});


	describe('#execAction', function()
	{
		it('#run suc', function()
		{
			return Promise.all(
				[
					commandActions.execAction(CONFIG_FILE, 'client.success', {}),
					commandActions.execAction(CONFIG_FILE, '5', {}),
					commandActions.execAction(CONFIG_FILE, 5, {})
				]);
		});

		it('#run err', function()
		{
			var promise1 = commandActions.execAction(CONFIG_FILE, 'client.error', {})
				.then(function(){expect().fail()},
					function(err)
					{
						expect(err).to.be(undefined);
					});

			var promise2 = commandActions.execAction(CONFIG_FILE, 'client.error2', {})
				.then(function(){expect().fail()},
					function(err)
					{
						expect(err).to.be('errmsg');
					});

			return Promise.all([promise1, promise2]);
		});

		it('#no methods err', function()
		{
			return commandActions.execAction(EMPTY_CONFIG_FILE, 1, {})
				.then(function(){expect().fail()},
					function(err)
					{
						expect(err.message).to.be('No Client Has Methods');
					});
		});

		it('#no action err', function()
		{
			return commandActions.execAction(CONFIG_FILE, 9999, {})
				.then(function(){expect().fail()},
					function(err)
					{
						expect(err.message).to.be('Not Found Action');
					});
		});

	});

	it('#parseFilterFlows', function()
	{
		var allFlows = ['flow1', 'flow2', 'flow3'];

		var items = commandActions.parseFilterFlows('flow1, flow3,', allFlows);
		expect(items).to.be.eql(['flow1', 'flow3']);

		var items = commandActions.parseFilterFlows('flow1,', allFlows);
		expect(items).to.be.eql(['flow1']);

		var items = commandActions.parseFilterFlows('flow4,', allFlows);
		expect(items).to.be.eql(allFlows);
	});

});


describe('#printTpl', function()
{
	it('#runActionUnexpectedError', function()
	{
		expect(printTpl.runActionUnexpectedError('action', 'errmsg'))
			.to.be("\n ========= Unexpected Error action ========= \n'errmsg'");
	});

	it('#rlRunHeader', function()
	{
		printTpl.rlRunHeader();
	});
});
