/*
 * RENAME PAGE HTML
 *	pageHtml is so named because there are HTML templates for which this is not
 *	intended. It is intended for the index.html and potentially any other pages
 *	within your site.
 *	The transformation example here is minor. If it finds an example of
 *	isDebug:1 it changes that to isDebug:0. It strips HTML comments. And a
 *	final example shows how it can modify markup and add a date stamp using
 *	dojo/date/locale.
 **/

define([
	'dojo/date/locale'
], function(locale) {

	var transformHtml = function(str){

		// make any transformations to index.html here
		str = str.replace('isDebug: 1', 'isDebug: 0');

		str = str.replace("packages:[{name:'lib',location:'../../lib/src'}]", "packages:[]");

		str = str.replace('../src/dojo/dojo.js', './dojo/dojo.js');

		str = str.replace('./src/resources/app.css', './lib/resources/app.css');

		// remove comments
		str = str.replace(/(<!--(.|\s){1,}?-->\s*\n*)/gi, '');


		return str;
	};


	return function(resource, callback) {
		console.log(' ****** TRANSFORMINDEX', resource);

		resource.dest = resource.dest.replace('/lib', '/lib-built');
		resource.setText(transformHtml(resource.getText()));

		callback(resource);
		return callback;
	};
});




/*
 * REFERENCE
 *
 *
 What a resource looks like that was pulled in via files[] and is outside of the
 normal packages.
 Obviously we need to determine the dest ourselves
{
	src: '/Users/mike/Sites/dojo-scaffold/src/index.html',
	dest: '/Users/mike/Sites/dojo-scaffold/src/index.html',
	tag: { isIndex: 1 },
	job: [ [ [Function], 1 ] ],
	jobPos: 0
}

What the same resource looks like with the "read" job added
{
	src: '/Users/mike/Sites/dojo-scaffold/src/index.html',
	dest: '/Users/mike/Sites/dojo-scaffold/src/index.html',
	tag: { isIndex: 1 },
	job: [ [ [Function], 0 ], [ [Function], 1 ] ],
	jobPos: 1,
	getText: [Function],
	setText: [Function],
	encoding: 'utf8',
	text: <file text>
}

*/
