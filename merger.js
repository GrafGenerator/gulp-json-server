"use strict";

var _ = require("lodash");

var Merger = function(options){
	var customizer = function(objValue, srcValue) {
		if (_.isArray(objValue)) {
			var byIdComparison = objValue.length > 0 && objValue[0].hasOwnProperty(options.id);
			return byIdComparison ? _.uniqBy(srcValue.concat(objValue), function(x){ return x[options.id]; }) : _.uniq(srcValue.concat(objValue));
		}
	};

	this.merge = function(source, target){
		_.mergeWith(source, target || {}, customizer);
		return source;
	};
};

module.exports = Merger;