/*
 * boostrap
 * This file coverts the command line arguments and kicks off the build tool.
 * Its primary responsibility is to allow for shortcut switches, like
 * -o for --optimizeLayers = 'closure'. It also finds the profile path so you
 * need only pass in the short name of the profile file - the path and the
 * .profile.js suffix are not needed.
 */
define(
	//	Because this is happening so early in the process, we can't put a
	//	configuration object here.
[
	'require',
	'dojo/has',
	'dojo/_base/lang'
], function(require, has, lang){

	console.log(' * bootstrap');

	var
		keyValuePair = /\=/,
		isLoad = /load=/,
		isSwitch = /^-/,
		isDojo = /\/dojo.js/,
		fs;


	function fixPath(){
		// this same functionality is in /util/fs
		var
			parts,
			path = Array.prototype.slice.call(arguments)
			.join('/')
			.replace(/\\/g, '/')
			.replace(/\/+/g, '/')
			.replace(/\/\.\//g, '/');

		// Windows doubles up the path like:
		// C:/dev/foo/C:/dev/foo/
		var dblPath = (/(C:)/).exec(path);
		if(dblPath && dblPath.length > 1){
			parts = path.split('C:');
			// leave off C: prefix, the build will add that back when
			// converting to an absolute path
			path = parts[1];
		}

		// removes redundant up/down paths, converting
		// /User/src/dojo/foo/../../bar
		// to
		// /User/src/bar
		var r = /\/[A-Za-z0-9]+\/\.\./g;
		while(r.exec(path)){
			path = path.replace(r, '');
		}

		return path;
	}

	function convertMiniSWitches(argKey){
		argKey = argKey.replace(/-/g, '');
		if(argKey == 'p'){ return 'profile'; }
		if(argKey == 'r'){ return 'release'; }
		return argKey;
	}

	function normalizeArgs(map){
		// Convert p to profile, r to release,
		// get profile path, convert custom shortcut switches
		//
		var newArgs = {}, value, key;
		for(key in map){
			if(map.hasOwnProperty(key)){
				value = map[key];
				key = convertMiniSWitches(key);
				newArgs[key] = value;
			}
		}

		/*  For reference
		stripConsole (default = "normal")
		["none"] No console applications are stripped.
		["normal"] All console applications are stripped except console.error and console.warn.
		["warn"] All console applications are stripped except console.error.
		["all"] All console applications are stripped.

		"--check":
		"--check-args":
		"--check-discovery":
		"--debug-check":
		*/

		var
			optimize = newArgs.optimize || '0',
			optimizeLayers = newArgs.optimizeLayers || '0';

		if(!newArgs.check && !newArgs['check-args'] && !newArgs['check-doiscovery'] && !newArgs['debug-check']){

			// custom shortcuts
			if(newArgs.d || newArgs.clean){
				// delete release directory
				delete newArgs.d;
				delete newArgs.clean;
				newArgs.deleteRelease = "1";
			}

			// default
			// [falsy] (using none of the switches below)
			// Layer modules are not optimized; the stripConsole profile property,
			// if any, is ignored.

			if(newArgs.c){
				// ["comment"]
				// All comments are removed form all layer modules; new-lines are
				// not preserved; the stripConsole profile property, if any, is
				// ignored.
				optimizeLayers = 'comment';
			}
			if(newArgs.ck){
				// ["comment.keeplines"] All comments are removed from all layer
				// modules; new-lines are preserved; the stripConsole profile
				// property, if any, is ignored.
				optimizeLayers = 'comment.keepLines';
			}
			if(newArgs.s){
				// ["shrinksafe"]
				// All layer modules are processed by shrinksafe; new-lines are
				// not preserved; the semantics of the stripConsole property are
				// executed.
				optimizeLayers = 'shrinksafe';
			}
			if(newArgs.sk){
				// ["shrinksafe.keeplines"]
				// All layer modules are processed by shrinksafe; new-lines are
				// preserved; the semantics of the stripConsole property are
				// executed.
				optimizeLayers = 'shrinksafe.keeplines';
			}
			if(newArgs.o){
				// ["closure"] All layer modules are processed by the Google
				// Closure compiler, simple-mode; new-lines are not preserved;
				// the semantics of the stripConsole property are executed.
				optimizeLayers = 'closure';
			}
			if(newArgs.ok){
				// ["closure.keepLines"]
				// All layer modules are processed by the Google Closure
				// compiler, simple-mode; new-lines are preserved; the semantics
				// of the stripConsole property are executed.
				optimizeLayers = 'closure.keeplines';
			}
			if(newArgs.oa){
				// optimize files the same as layers (default is to not optimize
				// files)
				optimize = optimizeLayers;
			}

		}

		delete newArgs.c;
		delete newArgs.ck;
		delete newArgs.s;
		delete newArgs.sk;
		delete newArgs.o;
		delete newArgs.ok;
		delete newArgs.oa;

		newArgs.optimize = optimize;
		newArgs.optimizeLayers = optimizeLayers;
		newArgs.action = 'release';
		newArgs.cssOptimize = newArgs.cssOptimize === undefined ? 'keepLayers' : newArgs.cssOptimize;

		newArgs.profile = fixPath(newArgs.baseUrl, '../../profiles/', newArgs.profile || 'basic') + '.profile.js';

		console.log('profle path', newArgs.profile);

		return newArgs;
	}

	function argsToObject(array){
		// convert the native arguments array into a hash map
		var
			o = {},
			key;

		array.forEach(function(item){

			// throw away 'node' and any files to be loaded, since they
			// are already loaded (at least for now)
			if(item == 'node' || isDojo.test(item) || isLoad.test(item)){ return; }

			if(keyValuePair.test(item)){
				var pair = item.split('=').map(function(str){ return lang.trim(str); });
				o[pair[0]] = pair[1];
			}else if(isSwitch.test(item)){
				if(key){
					// if there is an unassigned key, this must be a standalone
					// switch
					o[key] = true;
				}
				key = item;
			}else if(isDojo.test(item)){
				o[item] = true;
			}else{
				o[key] = parseInt(item,10) == item ? parseInt(item,10) : item ;
				key = null;
			}
		});
		// trailing standalone switch
		if(key){ o[key] = true; }
		return o;
	}

	function argObjectToArray(map, environment){
		// convert the hash map back into an arguments array
		var array = [];
		for(var key in map){
			if(map.hasOwnProperty(key)){
				var value = map[key];
				if(!isSwitch.test(key)){
					key = '--' + key;
				}
				array.push(key);
				if(value !== true){
					array.push(value);
				}
			}
		}
		//	build is expecting to skip the first argument
		array.unshift(environment || 'host');

		return array;
	}

	var argsObject, argsArray, packLoc;

	if(has("host-node")){
		console.log('Node.js bootstrap');
		argsObject = normalizeArgs(argsToObject(process.argv));
		argsArray = argObjectToArray(argsObject, 'node');
		process.argv = argsArray;
		argsObject.baseDir = process.cwd().toString();

	}else if(has("host-rhino")){
		console.log('Java Rhino bootstrap');
		argsObject = normalizeArgs(argsToObject(require.rawConfig.commandLineArgs));
		argsArray = argObjectToArray(argsObject, 'java');
		require.rawConfig.commandLineArgs = argsArray;
		argsObject.baseDir = environment["user.dir"];


	}else{
		console.log("unknown environment; terminating.");
		return 0;
	}

	packLoc = fixPath(argsObject.baseDir, 'ext-build');

	console.log(' * bootstrap finished');

	require(
		// If the first argument of a require is an object, it is mixed into the
		// configuration.
	{
		// We need to set the package where our transforms are placed (which happens
		// to be the same folder as this file). The package tells the builder where
		// to find /ext-build.
		// We don't set the package in the profile, because we don't want the
		// build tool to try and build it.
		packages:[{name:'ext-build', location: packLoc}]
	},[
		'ext-build/main'
	], function(main){
		main(argsObject);
	});

	return 1;
});
