/**
 * This sample demonstrates how to configure the library for the Jira REST API.
 * @see {@link https://developer.atlassian.com/cloud/jira/platform/jira-rest-api-oauth-authentication/}
 */

var SITE = 'https://something.atlassian.net';
var CONSUMER_KEY = '...';
// The private key must be in the PKCS#8 PEM format.
var PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n';

/**
 * Authorizes and makes a request to the Xero API.
 */
function run() {
  var service = getService();
  if (service.hasAccess()) {
    var url = SITE + '/rest/api/3/myself';
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
  getService().reset();
}

/**
 * Configures the service.
 */
function getService() {
  return OAuth1.createService('Jira')
      // Set the endpoint URLs.
      .setRequestTokenUrl(SITE + '/plugins/servlet/oauth/request-token')
      .setAuthorizationUrl(SITE + '/plugins/servlet/oauth/authorize')
      .setAccessTokenUrl(SITE + '/plugins/servlet/oauth/access-token')

      // Set the consumer key and secret.
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(PRIVATE_KEY)

      // Set the OAuth signature method.
      .setSignatureMethod('RSA-SHA1')

      // Set the method to POST, as required by Atlassian.
      .setMethod('post')

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties());
}

/**
 * Handles the OAuth callback.
 */
function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied');
  }
}
