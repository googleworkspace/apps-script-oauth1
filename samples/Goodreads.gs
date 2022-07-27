/*
 * This script must be published as a web app (Publish > Deploy as web app) in 
 * order to function. The web app URL is used instead of the normal callback
 * URL to work around a bug in the Goodreads API's OAuth implementation
 * (https://goo.gl/cRfdph).
 */ 

var CONSUMER_KEY = '...';
var CONSUMER_SECRET = '...';

/**
 * Authorizes and makes a request to the Goodreads API.
 */
function run() {
  var service = getService_();
  if (service.hasAccess()) {
    var url = 'https://www.goodreads.com/api/auth_user';
    var response = service.fetch(url);
    var result = response.getContentText();
    Logger.log(result);
  } else {
    var authorizationUrl = service.authorize();
    Logger.log('Open the following URL and re-run the script: %s',
        authorizationUrl);
  }
}

/**
 * Reset the authorization state, so that it can be re-tested.
 */
function reset() {
  var service = getService_();
  service.reset();
}

/**
 * Configures the service.
 */
function getService_() {
  var service = OAuth1.createService('Goodreads')
      // Set the endpoint URLs.
      .setAccessTokenUrl('https://www.goodreads.com/oauth/access_token')
      .setRequestTokenUrl('https://www.goodreads.com/oauth/request_token')
      .setAuthorizationUrl('https://www.goodreads.com/oauth/authorize')

      // Set the consumer key and secret.
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(CONSUMER_SECRET)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())
  
      // Set the OAuth version (default: 1.0a)
      .setOAuthVersion('1.0');
  
  // Override the callback URL method to use the web app URL instead.
  service.getCallbackUrl = function() {
    return ScriptApp.getService_().getUrl();
  };
  
  return service;
}

/**
 * Handles GET requests to the web app.
 */
function doGet(request) {
  // Determine if the request is part of an OAuth callback.
  if (request.parameter.oauth_token) {
    var service = getService_();
    var authorized = service.handleCallback(request);
    if (authorized) {
      return HtmlService.createHtmlOutput('Success!');
    } else {
      return HtmlService.createHtmlOutput('Denied');
    }
  }
}
