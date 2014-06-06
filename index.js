/**
 * AssetManager
 * http://www.dadoune.com/
 *
 * Copyright (c) 2014 Reed Dadoune
 * Licensed under the MIT license.
 **/

'use strict';

var grunt = require('grunt'),
	fs = require('fs'),
	_ = require('underscore');

// Asset holder variable
var assets = {};

exports.process = function (options) {

	options = _.extend({
		assets: {},
		debug: true,
		webroot: false,
		fileArrayFormat: false,
        callback: null
	}, options);

	/**
	 * Get assets from patterns. Patterns could be
	 *  - an array
	 *  - a string
	 *  - external resource
	 *
	 * @param patterns
	 */
	var getAssets = function (patterns) {
		return grunt.file.expand(patterns);
	};

	/**
	 * Strip server path from from file path so
	 * that the file path is relative to the webroot
	 *
	 * @param  array files
	 * @return array files clean filenames
	 */
	var stripServerPath = function(files) {
		var regex = new RegExp('^' + options.webroot);
		_.each(files, function (value, key) {
			files[key] = value.replace(regex, '');
		});
		return files;
	};

    var processAssets = function (fn) {
        _.each(options.assets, function (group, groupName) {
            assets[groupName] = {};
            _.each(group, function (patterns, fileType) {
                assets[groupName][fileType] = fn(patterns);
                if (options.webroot) {
                    // Strip the webroot foldername from the filepath
                    assets[groupName][fileType] = stripServerPath(assets[groupName][fileType]);
                }
            });
        });
    };

    var processFileObjectFormat = function (patterns) {
        var files = [];
        _.each(patterns, function (value, key) {
            if (!options.debug) {
                // Production
                files.push(key);
            } else {
                // Development
                files = files.concat(getAssets(value));
            }
        });
        return files;
    };

    var processFileArrayFormat = function (patterns) {
        return ((options.debug) ? getAssets(patterns.src) : patterns.dest);
    };

    var callback = processFileObjectFormat;
    if (options.fileArrayFormat) {
        callback = processFileArrayFormat;
    } else if (options.callback) {
        callback = options.callback;
    }
    processAssets(callback);

	return assets;
};

exports.assets = assets;
