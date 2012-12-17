/*
 * pageHtml
 *	pageHtml is so named because there are HTML templates for which this is not
 *	intended. It is intended for the index.html and potentially any other pages
 *	within your site.
 *	The transformation example here is minor. If it finds an example of
 *	isDebug:1 it changes that to isDebug:0. It strips HTML comments. And a
 *	final example shows how it can modify markup and add a date stamp using
 *	dojo/date/locale.
 **/

define([
	'dojo/date/locale',
	'build/buildControl',
], function(locale, bc) {

	// TODO - add this to the comment stripper for Windows
	//var EOL = fileContents.indexOf("\r\n") >= 0 ? "\r\n" : "\n";

	var transformHtml = function(str){

		// make any transformations to index.html here
		str = str.replace('isDebug: 1', 'isDebug: 0');

		// remove comments
		str = str.replace(/(<!--(.|\s){1,}?-->\s*\n*)/gi, '');

		// Add date to footer
		// A demonstration of how you can use dojo to modify the display text
		var dateStr = locale.format(new Date(), {datePattern:'MM-dd-yyyy'});
		str = str.replace('DATE_NOT_SET', dateStr);

		return str;
	};


	return function(resource, callback) {
		console.log(' ****** TRANSFORM', resource.src);

		// Hey, this sucks. Why does the build not give me the destination?
		var sa = resource.src.split('/');
		var da = bc.destBasePath.split('/');
		var dest = [];
		for(var i=0; i < da.length; i++){
			if(sa[0] == da[i]){
				dest.push(sa.shift());
			}else{
				dest.push(da[i]);
				sa.shift();
				dest = dest.concat(sa);
				break;
			}
		}

		dest = dest.join('/');
		console.log(' ****** TRANSFORM DEST', dest);

		//****** TRANSFORM /Users/mike/Sites/dojo-scaffold/src/login.html
		//****** TRANSFORM /Users/mike/Sites/dojo-scaffold/profiles
		//****** TRANSFORM /Users/mike/Sites/dojo-scaffold/basic-layers

		resource.dest = dest;

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
