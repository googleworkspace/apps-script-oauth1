(function (host, expose) {
   var module = { exports: {} };
   var exports = module.exports;
   /****** code begin *********/
/**
 * Creates a new MemoryProperties, an implementation of the Properties
 * interface that stores values in memory.
 * @constructor
 */
var MemoryProperties = function() {
  this.properties = {};
};

/**
 * @see {@link https://developers.google.com/apps-script/reference/properties/properties#deleteallproperties}
 */
MemoryProperties.prototype.deleteAllProperties = function() {
  this.properties = {};
};

/**
 * @see {@link https://developers.google.com/apps-script/reference/properties/properties#deletepropertykey}
 */
MemoryProperties.prototype.deleteProperty = function(key) {
  delete this.properties[key];
};

/**
 * @see {@link https://developers.google.com/apps-script/reference/properties/properties#getkeys}
 */
MemoryProperties.prototype.getKeys = function() {
  return Object.keys(this.properties);
};

/**
 * @see {@link https://developers.google.com/apps-script/reference/properties/properties#getproperties}
 */
MemoryProperties.prototype.getProperties = function() {
  return _.clone(this.properties);
};

/**
 * @see {@link https://developers.google.com/apps-script/reference/properties/properties#getproperty}
 */
MemoryProperties.prototype.getProperty = function(key) {
  return this.properties[key];
};

/**
 * @see {@link https://developers.google.com/apps-script/reference/properties/properties#setpropertiesproperties-deleteallothers}
 */
MemoryProperties.prototype.setProperties = function(properties, opt_deleteAllOthers) {
  if (opt_deleteAllOthers) {
    this.deleteAllProperties();
  }
  Object.keys(properties).forEach(function(key) {
    this.setProperty(key, properties[key]);
  });
};

/**
 * @see {@link https://developers.google.com/apps-script/reference/properties/properties#setpropertykey-value}
 */
MemoryProperties.prototype.setProperty = function(key, value) {
  this.properties[key] = String(value);
};

// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Contains the methods exposed by the library, and performs any
 * required setup.
 */

// Load the Underscore.js library. This library was added using the script ID
// "1I21uLOwDKdyF3_W_hvh6WXiIKWJWno8yG9lB8lf1VBnZFQ6jAAhyNTRG".


/**
 * Creates a new OAuth1 service with the name specified. It's usually best to
 * create and configure your service once at the start of your script, and then
 * reference it during the different phases of the authorization flow.
 * @param {string} serviceName The name of the service.
 * @return {Service_} The service object.
 */
function createService(serviceName) {
  return new Service_(serviceName);
}

/**
 * Returns the callback URL that will be used for a given script. Often this URL
 * needs to be entered into a configuration screen of your OAuth provider.
 * @param {string} scriptId The ID of your script, which can be found in the
 *     Script Editor UI under "File > Project properties".
 * @return {string} The callback URL.
 */
function getCallbackUrl(scriptId) {
  return Utilities.formatString(
    'https://script.google.com/macros/d/%s/usercallback', scriptId);
}

if (typeof module != 'undefined') {
  module.exports = {
    createService: createService,
    getCallbackUrl: getCallbackUrl,
    MemoryProperties: MemoryProperties
  };
}

// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Contains the Service_ class.
 */

// Disable JSHint warnings for the use of eval(), since it's required to prevent
// scope issues in Apps Script.
// jshint evil:true

/**
 * Creates a new OAuth1 service.
 * @param {string} serviceName The name of the service.
 * @constructor
 */
var Service_ = function(serviceName) {
  validate_({
    'Service name': serviceName
  });
  this.serviceName_ = serviceName;
  this.paramLocation_ = 'auth-header';
  this.method_ = 'get';
  this.oauthVersion_ = '1.0a';
  this.scriptId_ = eval('Script' + 'App').getScriptId();
  this.signatureMethod_ = 'HMAC-SHA1';
  this.propertyStore_ = new MemoryProperties();
};

/**
 * The maximum amount of time that information can be cached.
 * @type {Number}
 */
Service_.MAX_CACHE_TIME = 21600;

/**
 * Sets the request URL for the OAuth service (required).
 * @param {string} url The URL given by the OAuth service provider for obtaining
 *     a request token.
 * @return {Service_} This service, for chaining.
 */
Service_.prototype.setRequestTokenUrl = function(url) {
  this.requestTokenUrl_ = url;
  return this;
};

/**
 * Sets the URL for the OAuth authorization service (required).
 * @param {string} url The URL given by the OAuth service provider for
 *     authorizing a token.
 * @return {Service_} This service, for chaining.
 */
Service_.prototype.setAuthorizationUrl = function(url) {
  this.authorizationUrl_ = url;
  return this;
};

/**
 * Sets the URL to get an OAuth access token from (required).
 * @param {string} url The URL given by the OAuth service provider for obtaining
 *     an access token.
 * @return {Service_} This service, for chaining.
 */
Service_.prototype.setAccessTokenUrl = function(url) {
  this.accessTokenUrl_ = url;
  return this;
};

/**
 * Sets the parameter location in OAuth protocol requests (optional). The
 * default parameter location is 'auth-header'.
 * @param {string} location The parameter location for the OAuth request.
 *     Allowed values are 'post-body', 'uri-query' and 'auth-header'.
 * @return {Service_} This service, for chaining.
 */
Service_.prototype.setParamLocation = function(location) {
  this.paramLocation_ = location;
  return this;
};

/**
 * Sets the HTTP method used to complete the OAuth protocol (optional). The
 *     default method is 'get'.
 * @param {string} method The method to be used with this service. Allowed
 *     values are 'get' and 'post'.
 * @return {Service_} This service, for chaining.
 */
Service_.prototype.setMethod = function(method) {
  this.method_ = method;
  return this;
};

/**
 * Sets the OAuth signature method to use. 'HMAC-SHA1' is the default.
 * @param {string} signatureMethod The OAuth signature method. Allowed values
 *     are 'HMAC-SHA1' and 'PLAINTEXT'.
 * @return {Service_} This service, for chaining.
 */
Service_.prototype.setSignatureMethod = function(signatureMethod) {
  this.signatureMethod_ = signatureMethod;
  return this;
};

/**
 * Sets the specific OAuth version to use. The default is '1.0a'.
 * @param {string} oauthVersion The OAuth version. Allowed values are '1.0a'
 *     and '1.0'.
 * @return {Service_} This service, for chaining.
 */
Service_.prototype.setOAuthVersion = function(oauthVersion) {
  this.oauthVersion_ = oauthVersion;
  return this;
};

/**
 * Sets the ID of the script that contains the authorization callback
 * function (required). The script ID can be found in the Script Editor UI
 * under "File > Project properties".
 * @param {string} scriptId The ID of the script containing the callback
 *     function.
 * @return {Service_} This service, for chaining.
 * @deprecated The script ID is now be determined automatically.
 */
Service_.prototype.setScriptId = function(scriptId) {
  this.scriptId_ = scriptId;
  return this;
};

/**
 * Sets the name of the authorization callback function (required). This is the
 * function that will be called when the user completes the authorization flow
 * on the service provider's website. The callback accepts a request parameter,
 * which should be passed to this service's <code>handleCallback()</code> method
 * to complete the process.
 * @param {string} callbackFunctionName The name of the callback function.
 * @return {Service_} This service, for chaining.
 */
Service_.prototype.setCallbackFunction = function(callbackFunctionName) {
  this.callbackFunctionName_ = callbackFunctionName;
  return this;
};

/**
 * Sets the consumer key, which is provided when you register with an OAuth
 * service (required).
 * @param {string} consumerKey The consumer key provided by the OAuth service
 *     provider.
 * @return {Service_} This service, for chaining.
 */
Service_.prototype.setConsumerKey = function(consumerKey) {
  this.consumerKey_ = consumerKey;
  return this;
};

/**
 * Sets the consumer secret, which is provided when you register with an OAuth
 * service (required).
 * @param {string} consumerSecret The consumer secret provided by the OAuth
 *     service provider.
 * @return {Service_} This service, for chaining.
 */
Service_.prototype.setConsumerSecret = function(consumerSecret) {
  this.consumerSecret_ = consumerSecret;
  return this;
};

/**
 * Sets the property store to use when persisting credentials (optional). In
 * most cases this should be user properties, but document or script properties
 * may be appropriate if you want to share access across users. If not set tokens
 * will be stored in memory only.
 * @param {PropertiesService.Properties} propertyStore The property store to use
 *     when persisting credentials.
 * @return {Service_} This service, for chaining.
 */
Service_.prototype.setPropertyStore = function(propertyStore) {
  this.propertyStore_ = propertyStore;
  return this;
};

/**
 * Sets the cache to use when persisting credentials (optional). Using a cache
 * will reduce the need to read from the property store and may increase
 * performance. In most cases this should be a private cache, but a public cache
 * may be appropriate if you want to share access across users.
 * @param {CacheService.Cache} cache The cache to use when persisting
 *     credentials.
 * @return {Service_} This service, for chaining.
 */
Service_.prototype.setCache = function(cache) {
  this.cache_ = cache;
  return this;
};

/**
 * Sets the access token and token secret to use (optional). For use with APIs
 * that support a 1-legged flow where no user interaction is required.
 * @param {string} token The access token.
 * @param {string} secret The token secret.
 * @return {Service_} This service, for chaining.
 */
Service_.prototype.setAccessToken = function(token, secret) {
  this.saveToken_({
    public: token,
    secret: secret,
    type: 'access'
  });
  return this;
};

/**
 * Starts the authorization process. A new token will be generated and the
 * authorization URL for that token will be returned. Have the user visit this
 * URL and approve the authorization request. The user will then be redirected
 * back to your application using the script ID and callback function name
 * specified, so that the flow may continue.
 * @returns {string} The authorization URL for a new token.
 */
Service_.prototype.authorize = function() {
  validate_({
    'Authorization URL': this.authorizationUrl_
  });

  var token = this.getRequestToken_();
  this.saveToken_(token);

  var oauthParams = {
    oauth_token: token.public
  };
  if (this.oauthVersion_ == '1.0') {
    oauthParams.oauth_callback = this.getCallbackUrl();
  }
  return buildUrl_(this.authorizationUrl_, oauthParams);
};

/**
 * Completes the OAuth1 flow using the request data passed in to the callback
 * function.
 * @param {Object} callbackRequest The request data recieved from the callback
 *     function.
 * @return {boolean} True if authorization was granted, false if it was denied.
 */
Service_.prototype.handleCallback = function(callbackRequest) {
  var requestToken = callbackRequest.parameter.oauth_token;
  var verifier = callbackRequest.parameter.oauth_verifier;
  var token = this.getToken_();

  if (requestToken && requestToken != token.public) {
    throw 'Error handling callback: token mismatch';
  }

  if (this.oauthVersion_ == '1.0a' && !verifier) {
    return false;
  }

  token = this.getAccessToken_(verifier);
  this.saveToken_(token);
  return true;
};

/**
 * Determines if the service has access (has been authorized).
 * @return {boolean} true if the user has access to the service, false
 *     otherwise.
 */
Service_.prototype.hasAccess = function() {
  var token = this.getToken_();
  return token && token.type == 'access';
};

/**
 * Fetches a URL using the OAuth1 credentials of the service. Use this method
 * the same way you would use `UrlFetchApp.fetch()`.
 * @param {string} url The URL to fetch.
 * @param {Object} params The request parameters. See the corresponding method
 *     in `UrlFetchApp`.
 * @returns {UrlFetchApp.HTTPResponse} The response.
 */
Service_.prototype.fetch = function(url, params) {
  if (!this.hasAccess()) {
    throw 'Service not authorized.';
  }
  var token = this.getToken_();
  return this.fetchInternal_(url, params, token);
};

/**
 * Resets the service, removing access and requiring the service to be
 * re-authorized.
 */
Service_.prototype.reset = function() {
  validate_({
    'Property store': this.propertyStore_
  });
  var key = this.getPropertyKey_();
  this.propertyStore_.deleteProperty(key);
  if (this.cache_) {
    this.cache_.remove(key);
  }
};

/**
 * Get a new request token.
 * @returns {Object} A request token.
 */
Service_.prototype.getRequestToken_ = function() {
  validate_({
    'Request Token URL': this.requestTokenUrl_,
    'Method': this.method_,
  });
  var url = this.requestTokenUrl_;
  var params = {
    method: this.method_,
    muteHttpExceptions: true
  };
  var oauthParams = {};
  if (this.oauthVersion_ == '1.0a') {
    oauthParams.oauth_callback = this.getCallbackUrl();
  }

  var response = this.fetchInternal_(url, params, null, oauthParams);
  if (response.getResponseCode() >= 400) {
    throw 'Error starting OAuth flow: ' + response.getContentText();
  }

  var token = this.parseToken_(response.getContentText());
  token.type = 'request';
  return token;
};

/**
 * Get a new access token.
 * @param {string} opt_verifier The value of the `oauth_verifier` URL parameter
 *     in the callback. Not used by OAuth version '1.0'.
 * @returns {Object} An access token.
 */
Service_.prototype.getAccessToken_ = function(opt_verifier) {
  validate_({
    'Access Token URL': this.accessTokenUrl_,
    'Method': this.method_
  });
  var url = this.accessTokenUrl_;
  var params = {
    method: this.method_,
    muteHttpExceptions: true
  };
  var token = this.getToken_();

  var oauthParams = {};
  if (opt_verifier) {
    oauthParams.oauth_verifier = opt_verifier;
  }

  var response = this.fetchInternal_(url, params, token, oauthParams);
  if (response.getResponseCode() >= 400) {
    throw 'Error completing OAuth flow: ' + response.getContentText();
  }

  token = this.parseToken_(response.getContentText());
  token.type = 'access';
  return token;
};

/**
 * Makes a `UrlFetchApp` request using the optional OAuth1 token and/or
 * additional parameters.
 * @param {string} url The URL to fetch.
 * @param {Object} params The request parameters. See the corresponding method
 *     in `UrlFetchApp`.
 * @params {Object} opt_token OAuth token to use to sign the request (optional).
 * @param {Object} opt_oauthParams Additional OAuth parameters to use when
 *     signing the request (optional).
 * @returns {UrlFetchApp.HTTPResponse} The response.
 */
Service_.prototype.fetchInternal_ = function(url, params, opt_token,
      opt_oauthParams) {
  validate_({
    'URL': url,
    'OAuth Parameter Location': this.paramLocation_,
    'Consumer Key': this.consumerKey_,
    'Consumer Secret': this.consumerSecret_
  });
  params = params || {};
  params.method = params.method || 'get';
  var token = opt_token || null;
  var oauthParams = opt_oauthParams || null;
  var signer = new Signer({
    signature_method: this.signatureMethod_,
    consumer: {
      public: this.consumerKey_,
      secret: this.consumerSecret_
    }
  });
  var request = {
    url: url,
    method: params.method
  };
  if (params.payload && (!params.contentType ||
      params.contentType == 'application/x-www-form-urlencoded')) {
    var data = params.payload;
    if (typeof(data) == 'string') {
      data = signer.deParam(data);
    }
    request.data = data;
  }
  oauthParams = signer.authorize(request, token, oauthParams);
  switch (this.paramLocation_) {
    case 'auth-header':
      params.headers = _.extend({}, params.headers,
          signer.toHeader(oauthParams));
      break;
    case 'uri-query':
      url = buildUrl_(url, oauthParams);
      break;
    case 'post-body':
      params.payload = _.extend({}, params.payload, oauthParams);
      break;
    default:
      throw 'Unknown param location: ' + this.paramLocation_;
  }
  if (params.payload && (!params.contentType ||
      params.contentType == 'application/x-www-form-urlencoded')) {
    // Disable UrlFetchApp escaping and use the signer's escaping instead.
    // This will ensure that the escaping is consistent between the signature and the request.
    var payload = request.data;
    payload = Object.keys(payload).map(function(key) {
      return signer.percentEncode(key) + '=' + signer.percentEncode(payload[key]);
    }).join('&');
    params.payload = payload;
    params.escaping = false;
  }
  return UrlFetchApp.fetch(url, params);
};

/**
 * Parses the token from the response.
 * @param {string} content The serialized token content.
 * @return {Object} The parsed token.
 * @private
 */
Service_.prototype.parseToken_ = function(content) {
  var fields = content.split('&').reduce(function(result, pair) {
    var parts = pair.split('=');
    result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    return result;
  }, {});
  return {
    public: fields.oauth_token,
    secret: fields.oauth_token_secret
  };
};

/**
 * Saves a token to the service's property store and cache.
 * @param {Object} token The token to save.
 * @private
 */
Service_.prototype.saveToken_ = function(token) {
  validate_({
    'Property store': this.propertyStore_
  });
  var key = this.getPropertyKey_();
  var value = JSON.stringify(token);
  this.propertyStore_.setProperty(key, value);
  if (this.cache_) {
    this.cache_.put(key, value, Service_.MAX_CACHE_TIME);
  }
};

/**
 * Gets the token from the service's property store or cache.
 * @return {Object} The token, or null if no token was found.
 * @private
 */
Service_.prototype.getToken_ = function() {
  validate_({
    'Property store': this.propertyStore_
  });
  var key = this.getPropertyKey_();
  var token;
  if (this.cache_) {
    token = this.cache_.get(key);
  }
  if (!token) {
    token = this.propertyStore_.getProperty(key);
  }
  if (token) {
    if (this.cache_) {
      this.cache_.put(key, token, Service_.MAX_CACHE_TIME);
    }
    return JSON.parse(token);
  } else {
    return null;
  }
};

/**
 * Generates the property key for this service.
 * @return {string} The property key.
 * @private
 */
Service_.prototype.getPropertyKey_ = function() {
  return 'oauth1.' + this.serviceName_;
};

/**
 * Gets a callback URL to use for the OAuth flow.
 * @return {string} A callback URL.
 */
Service_.prototype.getCallbackUrl = function() {
  validate_({
    'Callback Function Name': this.callbackFunctionName_,
    'Service Name': this.serviceName_,
    'Script ID': this.scriptId_
  });
  var stateToken = eval('Script' + 'App').newStateToken()
      .withMethod(this.callbackFunctionName_)
      .withArgument('serviceName', this.serviceName_)
      .withTimeout(3600)
      .createToken();
  return buildUrl_(getCallbackUrl(this.scriptId_), {
    state: stateToken
  });
};

// The MIT License (MIT)
//
// Copyright (c) 2014 Ddo
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * A modified version of the oauth-1.0a javascript library:
 * https://github.com/ddo/oauth-1.0a
 * The cryptojs dependency was removed in favor of native Apps Script functions.
 * A new parameter was added to authorize() for additional oauth params.
 */

(function(global) {
  /**
  * Constructor
  * @param {Object} opts consumer key and secret
  */
  function OAuth(opts) {
    if(!(this instanceof OAuth)) {
      return new OAuth(opts);
    }

    if(!opts) {
      opts = {};
    }

    if(!opts.consumer) {
      throw new Error('consumer option is required');
    }

    this.consumer            = opts.consumer;
    this.signature_method    = opts.signature_method || 'HMAC-SHA1';
    this.nonce_length        = opts.nonce_length || 32;
    this.version             = opts.version || '1.0';
    this.parameter_seperator = opts.parameter_seperator || ', ';

    if(typeof opts.last_ampersand === 'undefined') {
      this.last_ampersand = true;
    } else {
      this.last_ampersand = opts.last_ampersand;
    }

    switch (this.signature_method) {
      case 'HMAC-SHA1':
        this.hash = function(base_string, key) {
          var sig = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_1, base_string, key);
          return Utilities.base64Encode(sig);
        };
        break;
      case 'PLAINTEXT':
        this.hash = function(base_string, key) {
          return key;
        };
        break;
      case 'RSA-SHA1':
        throw new Error('oauth-1.0a does not support this signature method right now. Coming Soon...');
      default:
        throw new Error('The OAuth 1.0a protocol defines three signature methods: HMAC-SHA1, RSA-SHA1, and PLAINTEXT only');
    }
  }

  /**
  * OAuth request authorize
  * @param  {Object} request data
  * {
  *     method,
  *     url,
  *     data
  * }
  * @param  {Object} public and secret token
  * @return {Object} OAuth Authorized data
  */
  OAuth.prototype.authorize = function(request, token, opt_oauth_data) {
    var oauth_data = {
      oauth_consumer_key: this.consumer.public,
      oauth_nonce: this.getNonce(),
      oauth_signature_method: this.signature_method,
      oauth_timestamp: this.getTimeStamp(),
      oauth_version: this.version
    };

    if (opt_oauth_data) {
      oauth_data = this.mergeObject(oauth_data, opt_oauth_data);
    }

    if(!token) {
      token = {};
    }

    if(token.public) {
      oauth_data.oauth_token = token.public;
    }

    if(!request.data) {
      request.data = {};
    }

    oauth_data.oauth_signature = this.getSignature(request, token.secret, oauth_data);

    return oauth_data;
  };

  /**
  * Create a OAuth Signature
  * @param  {Object} request data
  * @param  {Object} token_secret public and secret token
  * @param  {Object} oauth_data   OAuth data
  * @return {String} Signature
  */
  OAuth.prototype.getSignature = function(request, token_secret, oauth_data) {
    return this.hash(this.getBaseString(request, oauth_data), this.getSigningKey(token_secret));
  };

  /**
  * Base String = Method + Base Url + ParameterString
  * @param  {Object} request data
  * @param  {Object} OAuth data
  * @return {String} Base String
  */
  OAuth.prototype.getBaseString = function(request, oauth_data) {
    return request.method.toUpperCase() + '&' + this.percentEncode(this.getBaseUrl(request.url)) + '&' + this.percentEncode(this.getParameterString(request, oauth_data));
  };

  /**
  * Get data from url
  * -> merge with oauth data
  * -> percent encode key & value
  * -> sort
  *
  * @param  {Object} request data
  * @param  {Object} OAuth data
  * @return {Object} Parameter string data
  */
  OAuth.prototype.getParameterString = function(request, oauth_data) {
    var base_string_data = this.sortObject(this.percentEncodeData(this.mergeObject(oauth_data, this.mergeObject(request.data, this.deParamUrl(request.url)))));

    var data_str = '';

    //base_string_data to string
    for(var key in base_string_data) {
      data_str += key + '=' + base_string_data[key] + '&';
    }

    //remove the last character
    data_str = data_str.substr(0, data_str.length - 1);
    return data_str;
  };

  /**
  * Create a Signing Key
  * @param  {String} token_secret Secret Token
  * @return {String} Signing Key
  */
  OAuth.prototype.getSigningKey = function(token_secret) {
    token_secret = token_secret || '';

    if(!this.last_ampersand && !token_secret) {
      return this.percentEncode(this.consumer.secret);
    }

    return this.percentEncode(this.consumer.secret) + '&' + this.percentEncode(token_secret);
  };

  /**
  * Get base url
  * @param  {String} url
  * @return {String}
  */
  OAuth.prototype.getBaseUrl = function(url) {
    return url.split('?')[0];
  };

  /**
  * Get data from String
  * @param  {String} string
  * @return {Object}
  */
  OAuth.prototype.deParam = function(string) {
    var arr = string.replace(/\+/g, ' ').split('&');
    var data = {};

    for(var i = 0; i < arr.length; i++) {
      var item = arr[i].split('=');
      data[item[0]] = decodeURIComponent(item[1]);
    }
    return data;
  };

  /**
  * Get data from url
  * @param  {String} url
  * @return {Object}
  */
  OAuth.prototype.deParamUrl = function(url) {
    var tmp = url.split('?');

    if (tmp.length === 1)
      return {};

    return this.deParam(tmp[1]);
  };

  /**
  * Percent Encode
  * @param  {String} str
  * @return {String} percent encoded string
  */
  OAuth.prototype.percentEncode = function(str) {
    return encodeURIComponent(str)
    .replace(/\!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/\'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
  };

  /**
  * Percent Encode Object
  * @param  {Object} data
  * @return {Object} percent encoded data
  */
  OAuth.prototype.percentEncodeData = function(data) {
    var result = {};

    for(var key in data) {
      result[this.percentEncode(key)] = this.percentEncode(data[key]);
    }

    return result;
  };

  /**
  * Get OAuth data as Header
  * @param  {Object} oauth_data
  * @return {String} Header data key - value
  */
  OAuth.prototype.toHeader = function(oauth_data) {
    oauth_data = this.sortObject(oauth_data);

    var header_value = 'OAuth ';

    for(var key in oauth_data) {
      if (key.indexOf('oauth_') === -1)
        continue;
      header_value += this.percentEncode(key) + '="' + this.percentEncode(oauth_data[key]) + '"' + this.parameter_seperator;
    }

    return {
      Authorization: header_value.substr(0, header_value.length - this.parameter_seperator.length) //cut the last chars
    };
  };

  /**
  * Create a random word characters string with input length
  * @return {String} a random word characters string
  */
  OAuth.prototype.getNonce = function() {
    var word_characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';

    for(var i = 0; i < this.nonce_length; i++) {
      result += word_characters[parseInt(Math.random() * word_characters.length, 10)];
    }

    return result;
  };

  /**
  * Get Current Unix TimeStamp
  * @return {Int} current unix timestamp
  */
  OAuth.prototype.getTimeStamp = function() {
    return parseInt(new Date().getTime()/1000, 10);
  };

  ////////////////////// HELPER FUNCTIONS //////////////////////

  /**
  * Merge object
  * @param  {Object} obj1
  * @param  {Object} obj2
  * @return {Object}
  */
  OAuth.prototype.mergeObject = function(obj1, obj2) {
    var merged_obj = obj1;
    for(var key in obj2) {
      merged_obj[key] = obj2[key];
    }
    return merged_obj;
  };

  /**
  * Sort object by key
  * @param  {Object} data
  * @return {Object} sorted object
  */
  OAuth.prototype.sortObject = function(data) {
    var keys = Object.keys(data);
    var result = {};

    keys.sort();

    for(var i = 0; i < keys.length; i++) {
      var key = keys[i];
      result[key] = data[key];
    }

    return result;
  };

  global.Signer = OAuth;
})(this);

// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Contains utility methods used by the library.
 */

/**
 * Builds a complete URL from a base URL and a map of URL parameters.
 * @param {string} url The base URL.
 * @param {Object.<string, string>} params The URL parameters and values.
 * @returns {string} The complete URL.
 * @private
 */
function buildUrl_(url, params) {
  var paramString = Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + paramString;
}

/**
 * Validates that all of the values in the object are non-empty. If an empty
 * value is found, an error is thrown using the key as the name.
 * @param {Object.<string, string>} params The values to validate.
 * @private
 */
function validate_(params) {
  Object.keys(params).forEach(function(name) {
    var value = params[name];
    if (isEmpty_(value)) {
      throw Utilities.formatString('%s is required.', name);
    }
  });
}

/**
 * Returns true if the given value is empty, false otherwise. An empty value
 * is one of null, undefined, a zero-length string, a zero-length array or an
 * object with no keys.
 * @param {?} value The value to test.
 * @returns {boolean} True if the value is empty, false otherwise.
 * @private
 */
function isEmpty_(value) {
  return value === null || value === undefined ||
      ((_.isObject(value) || _.isString(value)) && _.isEmpty(value));
}

/**
 * Gets the time in seconds, rounded down to the nearest second.
 * @param {Date} date The Date object to convert.
 * @returns {Number} The number of seconds since the epoch.
 * @private
 */
function getTimeInSeconds_(date) {
  return Math.floor(date.getTime() / 1000);
}

   /****** code end *********/
   ;(
function copy(src, target, obj) {
    obj[target] = obj[target] || {};
    if (src && typeof src === 'object') {
        for (var k in src) {
            if (src.hasOwnProperty(k)) {
                obj[target][k] = src[k];
            }
        }
    } else {
        obj[target] = src;
    }
}
   ).call(null, module.exports, expose, host);
}).call(this, this, "OAuth1");