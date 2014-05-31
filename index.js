var querystring = require('querystring'),
	_ = require('underscore'),
	request = require('request');

var Youku = function(config) {
    if (!config) return false;
    this.config = config;
};

/**
 * 使用code换取access_token与用户ID
 */
Youku.prototype.auth = function(code, callback) {
    if (!code)
    	return callback(new Error('code required'));
    if (typeof(code) !== 'string')
    	return callback(new Error('code must be string'));
    
    request.post('https://openapi.youku.com/v2/oauth2/token', {
	    	form : {
	    		grant_type	: 'authorization_code',
	    		code		: code,
	    		client_id	: this.config.app_key,
	    		client_secret:this.config.app_secret,
	    		redirect_uri: this.config.callback_url,
	    	},
	    	json : true
	    }, function(err, response, body){
	        if (err)
	        	return callback(err);
	        
	        if (response.body.error)
	        	return callback(new Error(response.body.error.description));
	        
	        return callback(err, response.body);
	    });
};

Youku.prototype.getClient = function(access_token){
	var client = new Youku.Client(access_token, this.config.app_key);
	
	return client;
};

/**
 * 构造一个Youku.Client实例
 * Youku.Client用于在拥有access token的情况下访问优酷接口
 */
Youku.Client = function(access_token, app_key){
	this.access_token = access_token;
	this.app_key = app_key;
};

Youku.Client.prototype.get = function(path, data, callback){
	var url = 'https://openapi.youku.com/v2/' + path + '.json';
		params = _.extend({
			client_id	: this.app_key,
			access_token: this.access_token,
		}, data);
	console.log(params);
	url += '?' + querystring.stringify(params);
	
	request.get(url, {json : true}, callback);
};

Youku.Client.prototype.post = function(path, data, callback){
	var url = 'https://openapi.youku.com/v2/' + path + '.json',
		params = _.extend({
			client_id	: this.app_key,
			access_token: this.access_token,
		}, data);
	
	request.post(url, {json : true, form:params}, callback);
};

module.exports = Youku;
