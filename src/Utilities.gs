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
 * value is found, and error is thrown using the key as the name.
 * @param {Object.<string, string>} params The values to validate.
 * @private
 */
function validate_(params) {
  Object.keys(params).forEach(function(name) {
    var value = params[name];
    if (!value) {
      throw new Error(name + ' is required.');
    }
  });
}

/**
 * Polyfill for Object.assign, which isn't available on the legacy runtime.
 * Not assigning to Object to avoid overwriting behavior in the parent
 * script(s).
 * @param {Object} target The target object to apply the sources’ properties to,
 *     which is returned after it is modified.
 * @param {...Object} sources The source object(s) containing the properties you
 *     want to apply.
 * @returns {Object} The target object.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill}
 * @license Any copyright is dedicated to the Public Domain. http://creativecommons.org/publicdomain/zero/1.0/
 */
function assign_(target, varArgs) {
  if (typeof Object.assign === 'function') {
    return Object.assign.apply(null, arguments);
  }
  if (target === null || target === undefined) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  var to = Object(target);
  for (var index = 1; index < arguments.length; index++) {
    var nextSource = arguments[index];

    if (nextSource !== null && nextSource !== undefined) {
      for (var nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }
  return to;
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
