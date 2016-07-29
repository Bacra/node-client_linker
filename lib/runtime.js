
exports.Runtime = Runtime;

function Runtime(client, methodKey, method,
	query, body, options)
{
	this.client = client;
	this.linker = client.linker;
	this.methodKey = methodKey;
	this.method = method;
	this.query = query;
	this.body = body;
	this.options = options;
	this.promise = null;
	this.navigationStart = Date.now();
	this.retry = [];
	this.timing = {};
}

Runtime.prototype = {
	lastFlow: function()
	{
		var retry = this.retry[this.retry.length-1];
		if (retry)
		{
			return retry.lastFlow();
		}
	}
};