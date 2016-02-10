var debug = require('debug')('client_linker:confighandler');

exports = module.exports = confighandler;

function confighandler(args, callback)
{
	var client = args.client;
	var options = client.options;
	if (!options.confighandler || !args.methodName in options.confighandler) return callback.next();

	var handler = options.confighandler[args.methodName];

	if (typeof handler == 'function')
		runHandler(args, callback, handler);
	else
		callback(null, handler);
}

exports.runHandler = runHandler;
function runHandler(args, callback, handler)
{
	// callback �ǰ�װ���ģ�������һ��callback
	var ret = handler(args.query, args.body, callback, args.runOptions);

	if (ret instanceof Promise)
	{
		ret.then(callback.resolve, callback.reject);
	}
}
