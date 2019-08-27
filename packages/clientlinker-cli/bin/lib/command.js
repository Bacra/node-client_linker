'use strict';

var Command2		= require('commander').Command;
var pkg				= require('../../package.json');
var rlutils			= require('./rlutils');
var stdout			= require('./stdout');
var util			= require('util');
var EventEmitter	= require('events').EventEmitter;


exports.Command = Command;
function Command()
{
	// 强制使用clientlinker作为name
	var program = this.program = new Command2(pkg.name);
	program.version('v'+pkg.version)
		.option('-C, --no-color', 'Disable colored output.')
		.option('-v, --verbose', 'Verbose mode. A lot more information output.')
		.on('color', function(){rlutils.colors.enabled = false})
		.on('verbose', function()
		{
			stdout.is_verbose = true;
			require('debug').enable(pkg.name+':* '+pkg.name);
		});
}

var proto = Command.prototype;

proto.list = function list()
{
	var options = {};

	return this.program
		.command('list <conf_file>')
		.alias('ls')
		.description('list methods of clients')
		.option('-a', 'print action instead of method', function()
		{
			options.useAction = true;
			return null;
		})
		.option('--flows <name,name>', 'only those flows', function(val)
		{
			options.flows = val;
			return null;
		})
		.option('--clients <name,name>', 'only those clients', function(val)
		{
			options.clients = val;
			return null;
		})
		.action(function()
		{
			this.__clk_options__ = options;
			options = {};
		});
};

proto.exec = function exec()
{
	var options = {};

	return this.program
		.command('exec <conf_file> <action>')
		.alias('ex')
		.description('exec [action] of clients')
		.option('-q, --query <string>', 'run param [query]', function(val)
		{
			options.query = val;
			return null;
		})
		.option('    --query-json <json>', ' ', function(val)
		{
			options.query = JSON.parse(val);
			return null;
		})
		.option('-b, --body <string>', 'run param [body]', function(val)
		{
			options.body = val;
			return null;
		})
		.option('    --body-json <json>', ' ', function(val)
		{
			options.body = JSON.parse(val);
			return null;
		})
		.option('-o, --options <string>', 'run param [options]', function(val)
		{
			options.options = val;
			return null;
		})
		.option('    --options-json <json>', ' ', function(val)
		{
			options.options = JSON.parse(val);
			return null;
		})
		.option('--clients <name,name>', 'only those clients', function(val)
		{
			options.clients = val;
			return null;
		})
		.action(function()
		{
			this.__clk_options__ = options;
			options = {};
		});
};

proto.help = function help()
{
	return this.program
		.command('help <cmd>')
		.description('display help for [cmd]')
		.action(function(cmd)
		{
			var self = this;

			var command = findSubCommand(self.parent, cmd);
			if (!command) throw new Error('No Defined Command, '+cmd);

			// command.help();
			// remove help info
			command.outputHelp(function(info)
			{
				return info
					// 删除Options下的help
					.replace(/ +-h, --help [^\n]+\n/, '')
					// 在命令行前加上父节点前缀
					.replace(/Usage: */, 'Usage: '+self.parent.name()+' ')
					// 如果没有多余的Options，就把这一项干掉
					.replace(/ +Options:\s+$/, '');
			});
		});
};

proto.anycmd = function anycmd()
{
	return this.program
		.command('* [conf_file] [cmd]', null, {noHelp: true})
		.allowUnknownOption(true)
		.action(function(conf_file, cmd)
		{
			var command = cmd && cmd != 'help'
					&& findSubCommand(this.parent, cmd);

			// 默认输出帮助信息
			if (!command)
				this.parent.help();
			else
			{
				var avgs = this.parent.rawArgs.slice();
				avgs.splice(2, 2, cmd, conf_file);
				this.parent.parse(avgs);
			}
		});
};


// find sub command
function findSubCommand(program, cmd)
{
	var command;
	program.commands.some(function(item)
	{
		if (item.name() == cmd || item.alias() == cmd)
		{
			command = item;
			return true;
		}
	});

	return command;
}


// Update Command Error Print Hanlder
Command2.prototype.emitError = function()
{
	var msg = util.format.apply(util, arguments);

	var command = this;
	while(command.parent) command = command.parent;

	var listenerCount;
	if (command.listenerCount)
		listenerCount = command.listenerCount('error');
	else
		listenerCount = EventEmitter.listenerCount(command, 'error');

	if (listenerCount)
		command.emit('error', msg);
	else
	{
		stdout.error('\n  error: '+msg+'\n');
		process.exit(1);
	}
};
Command2.prototype.missingArgument = function(name)
{
	this.emitError("missing required argument `%s'", name);
};
Command2.prototype.optionMissingArgument = function(option, flag)
{
	if (flag)
		this.emitError("option `%s' argument missing, got `%s'", option.flags, flag);
	else
		this.emitError("option `%s' argument missing", option.flags);
};
Command2.prototype.unknownOption = function(flag)
{
	if (this._allowUnknownOption) return;
	this.emitError("unknown option `%s'", flag);
};
Command2.prototype.variadicArgNotLast = function(name)
{
	this.emitError("variadic arguments must be last `%s'", name);
};
