/*
 * This script must be published as a web app (Publish > Deploy as web app) in
 * order to function. The web app URL is used instead of the normal callback
 * URL to work around a limitation in the Etsy API's OAuth implementation
 * (callback URLs are limited to 255 characters).
 */

var CONSUMER_KEY = '...';
var CONSUMER_SECRET = '...';

/**
 * Authorizes and makes a request to the Etsy API.
 */
function run() {
  var service = getService_();
  if (service.hasAccess()) {
    var url = 'https://openapi.etsy.com/v2/users/__SELF__/profile';
    var response = service.fetch(url);
    var result = JSON.parse(response.getContentText());
    Logger.log(JSON.stringify(result, null, 2));
  } else {
    service.authorize();
    // Retrieve the authorization URL from the "login_url" field of the request
    // token.
    var authorizationUrl = service.getToken_().login_url;
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
  var service = OAuth1.createService('Etsy')
      // Set the endpoint URLs.
      // Pass the desired scopes in the request token URL.
      .setRequestTokenUrl('https://openapi.etsy.com/v2/oauth/request_token?scope=profile_r')
      // The authorization URL isn't used, since Etsy sends it back in the
      // "login_url" field of the request token.
      .setAuthorizationUrl('N/A')
      .setAccessTokenUrl('https://openapi.etsy.com/v2/oauth/access_token')

      // Set the consumer key and secret.
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(CONSUMER_SECRET)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties());

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
