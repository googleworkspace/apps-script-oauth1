/*
 * DEPRECATED - Xero has deprecated OAuth1 support. Please use OAuth2 instead.
 * https://github.com/googleworkspace/apps-script-oauth2/blob/master/samples/Xero.gs
 */

/**
 * This sample demonstrates how to configure the library for the Xero API when
 * using a private application. Although the Xero documentation calls it a
 * "2 legged" flow it is really a 1-legged flow. Public Xero applications use
 * a 3-legged flow not shown here.
 * @see {@link https://developer.xero.com/documentation/auth-and-limits/private-applications}
 */

var CONSUMER_KEY = '...';
// The private key must be in the PKCS#8 PEM format.
var PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n';

/**
 * Authorizes and makes a request to the Xero API.
 */
function run() {
  var service = getService();
  var url = 'https://api.xero.com/api.xro/2.0/Organisations';
  var response = service.fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });
  var result = JSON.parse(response.getContentText());
  Logger.log(JSON.stringify(result, null, 2));
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
  return OAuth1.createService('Xero')
      // Set the consumer key and secret.
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(PRIVATE_KEY)

      // Manually set the token to be the consumer key.
      .setAccessToken(CONSUMER_KEY)

      // Set the OAuth signature method.
      .setSignatureMethod('RSA-SHA1');
}
