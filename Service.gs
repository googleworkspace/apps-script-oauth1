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
  this.projectKey_ = eval('Script' + 'App').getProjectKey();
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
 * Sets the project key of the script that contains the authorization callback
 * function (required). The project key can be found in the Script Editor UI
 * under "File > Project properties".
 * @param {string} projectKey The project key of the project containing the
 *     callback function.
 * @return {Service_} This service, for chaining.
 * @deprecated The project key is now be determined automatically.
 */
Service_.prototype.setProjectKey = function(projectKey) {
  this.projectKey_ = projectKey;
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
 * Sets the property store to use when persisting credentials (required). In
 * most cases this should be user properties, but document or script properties
 * may be appropriate if you want
 * to share access across users.
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
 * Starts the authorization process. A new token will be generated and the
 * authorization URL for that token will be returned. Have the user visit this
 * URL and approve the authorization request. The user will then be redirected
 * back to your application using the project key and callback function name
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
    oauthParams['oauth_callback'] = this.getCallbackUrl_();
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
    throw 'Error handling callback: token mismatch'
  }

  if (this.oauthVersion_ == '1.0a' && !verifier) {
    return false;
  }

  var token = this.getAccessToken_(verifier);
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
}

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
    oauthParams['oauth_callback'] = this.getCallbackUrl_();
  }

  var response = this.fetchInternal_(url, params, null, oauthParams);
  if (response.getResponseCode() != 200) {
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
    oauthParams['oauth_verifier'] = opt_verifier;
  }

  var response = this.fetchInternal_(url, params, token, oauthParams);
  if (response.getResponseCode() != 200) {
    throw 'Error completing OAuth flow: ' + response.getContentText();
  }

  var token = this.parseToken_(response.getContentText());
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
    consumer: {
      public: this.consumerKey_,
      secret: this.consumerSecret_
    }
  });
  var payload = _.extend({}, params.payload, oauthParams);
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
 * @private
 */
Service_.prototype.getCallbackUrl_ = function() {
  validate_({
    'Callback Function Name': this.callbackFunctionName_,
    'Service Name': this.serviceName_,
    'Project Key': this.projectKey_
  });
  var stateToken = eval('Script' + 'App').newStateToken()
      .withMethod(this.callbackFunctionName_)
      .withArgument('serviceName', this.serviceName_)
      .withTimeout(3600)
      .createToken();
  return buildUrl_(getCallbackUrl(this.projectKey_), {
    state: stateToken
  });
};
