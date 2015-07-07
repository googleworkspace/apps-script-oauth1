var CONSUMER_KEY = '...';
var CONSUMER_SECRET = '...';

/**
 * Authorizes and makes a request to the QuickBooks API. Assumes the use of a
 * sandbox company.
 */
function run() {
  var service = getService();
  if (service.hasAccess()) {
    var companyId = PropertiesService.getUserProperties()
        .getProperty('QuickBooks.companyId');
    var url = 'https://sandbox-quickbooks.api.intuit.com/v3/company/' +
        companyId + '/companyinfo/' + companyId;
    var response = service.fetch(url, {
      headers: {
        'Accept': 'application/json'
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
  return OAuth1.createService('QuickBooks')
      // Set the endpoint URLs.
      .setAccessTokenUrl('https://oauth.intuit.com/oauth/v1/get_access_token')
      .setRequestTokenUrl('https://oauth.intuit.com/oauth/v1/get_request_token')
      .setAuthorizationUrl('https://appcenter.intuit.com/Connect/Begin')

      // Set the consumer key and secret.
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(CONSUMER_SECRET)

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
    PropertiesService.getUserProperties()
        .setProperty('QuickBooks.companyId', request.parameter.realmId);
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied');
  }
}
