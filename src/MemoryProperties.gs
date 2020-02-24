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
  return extend_({}, this.properties);
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
