/*
 * DEPRECATED - Xero has deprecated OAuth1 support. Please use OAuth2 instead.
 * https://github.com/gsuitedevs/apps-script-oauth2/blob/master/samples/Xero.gs
 */

/*
 * Xero public applications guide:
 * https://developer.xero.com/documentation/auth-and-limits/public-applications
 *
 * This script must be published as a web app (Publish > Deploy as web app) in
 * order to function. The web app URL is used instead of the normal callback
 * URL to work around a limitation in the Xero API's OAuth implementation
 * (callback URLs are limited to 250 characters). Make sure to republish the
 * web app after updating the code.
 */

var CONSUMER_KEY = '...';
var CONSUMER_SECRET = '...';

/**
 * Authorizes and makes a request to the Xero API.
 */
function run() {
  var service = getService();
  if (service.hasAccess()) {
    var url = 'https://api.xero.com/api.xro/2.0/Organisations';
    var response = service.fetch(url, {
      headers: {
        Accept: 'application/json'
      }
    });
    var result = JSON.parse(response.getContentText());
    Logger.log(JSON.stringify(result, null, 2));
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
  var service = getService();
  service.reset();
}

/**
 * Configures the service.
 */
function getService() {
  var service = OAuth1.createService('Xero')
      // Set the endpoint URLs.
      .setRequestTokenUrl('https://api.xero.com/oauth/RequestToken')
      .setAuthorizationUrl('https://api.xero.com/oauth/Authorize')
      .setAccessTokenUrl('https://api.xero.com/oauth/AccessToken')

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
    return ScriptApp.getService().getUrl();
  };

  // Override the parseToken_ method to record the time granted.
  var originalParseToken = service.parseToken_;
  service.parseToken_ = function(content) {
    var token = originalParseToken.apply(this, [content]);
    token.granted_time = Math.floor((new Date()).getTime() / 1000);
    return token;
  }

  // Override the hasAccess method to handle token expiration.
  var orginalHasAccess = service.hasAccess;
  service.hasAccess = function() {
    // First do the normal check.
    if (!orginalHasAccess.apply(this)) return false;

    // Check to see if the access token has expired
    // (or will expire in the next 60 seconds).
    var token = this.getToken_();
    var expiresTime = token.granted_time + Number(token.oauth_expires_in);
    var now = Math.floor((new Date()).getTime() / 1000);
    return (expiresTime - now) > 60;
  }

  return service;
}

/**
 * Handles GET requests to the web app.
 */
function doGet(request) {
  // Determine if the request is part of an OAuth callback.
  if (request.parameter.oauth_token) {
    var service = getService();
    var authorized = service.handleCallback(request);
    if (authorized) {
      return HtmlService.createHtmlOutput('Success!');
    } else {
      return HtmlService.createHtmlOutput('Denied');
    }
  }
}
