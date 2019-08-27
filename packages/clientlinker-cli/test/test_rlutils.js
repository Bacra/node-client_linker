'use strict';

var rlutils			= require('../bin/lib/rlutils');
var expect			= require('expect.js');
var clientlinker	= require('../');
var path			= require('path');

rlutils.colors.enabled = false;

describe('#rlutils', function()
{
	it('#printObject', function()
	{
		expect(rlutils.printObject(new Error('errmsg')))
			.to.contain('Error: errmsg')
			.contain(__dirname)
			.contain(__filename);

		expect(rlutils.printObject('something')).to.be("'something'");
		expect(rlutils.printObject(undefined)).to.be('undefined');
		expect(rlutils.printObject(1)).to.be('1');
		expect(rlutils.printObject(null)).to.be('null');
		expect(rlutils.printObject({a:1,b:"b"})).to.be("{ a: 1, b: 'b' }");
	});


	it('#methods', function()
	{
		var linker = clientlinker(
		{
			flows: ['confighandler'],
			clients:
			{
				client_its:
				{
					confighandler: require('clientlinker-flow-confighandler-test').methods
				}
			}
		});

		linker.flow('confighandler', require('clientlinker-flow-confighandler'));

		return linker.methods()
			.then(function(list)
			{
				return rlutils.getAllMethods(list);
			})
			.then(function(allMethods)
			{
				expect(allMethods).to.not.be.empty();
				expect(allMethods[2]).to.be('client_its.method_callback_error_error');
				expect(allMethods.lines[2].index).to.be(2);

				expect(rlutils.parseAction('2', allMethods))
					.to.be('client_its.method_callback_data');
				expect(rlutils.parseAction('client_its.method_callback_data', allMethods))
					.to.be('client_its.method_callback_data');

				expect(rlutils.parseAction('', allMethods)).to.be(undefined);
				expect(rlutils.parseAction('1999', allMethods)).to.be(undefined);
				expect(rlutils.parseAction('client_not_exists.method', allMethods))
					.to.be(undefined);
				expect(rlutils.parseAction('client_its.not_exists_method', allMethods))
					.to.be(undefined);
			});
	});

	it('#methods width *', function()
	{
		var linker = clientlinker(
		{
			flows: ['confighandler', 'custom'],
			clients:
			{
				client_its:
				{
					pkghandler: __dirname+'/pkghandler/client_its'
				}
			}
		});

		linker.flow('confighandler', require('clientlinker-flow-confighandler'));
		linker.flow('custom', function(flow)
		{
			flow.register('methods', function(){return ['*'];});
		});

		return linker.methods()
			.then(function(list)
			{
				return rlutils.getAllMethods(list);
			})
			.then(function(allMethods)
			{
				expect(rlutils.parseAction('', allMethods)).to.be(undefined);
				expect(rlutils.parseAction('1999', allMethods)).to.be(undefined);
				expect(rlutils.parseAction('client_not_exists.method', allMethods))
					.to.be(undefined);
				expect(rlutils.parseAction('client_its.not_exists_method', allMethods))
					.to.be('client_its.not_exists_method');
			});
	});


	it('#resolve', function()
	{
		expect(path.normalize(rlutils.resolve('~/xxx')))
			.to.be(path.normalize(rlutils.USER_HOME+'/xxx'));
		expect(path.normalize(rlutils.resolve('./xxx')))
			.to.be(path.normalize(process.cwd()+'/xxx'));
	});

});
