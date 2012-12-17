/*
 * nano is used to copy only the files you need to a new directory.
 * A build gives you the entire dojo toolkit, which can be unweildy if you have
 * to copy the files to an FTP. Even copying to a local server can be a pain.
 * See teh README for details.
 */
define([
	'dojo/aspect',
	'ext-build/util/fs',

], function(aspect, fs){

	function isArray(it){
		return toString.call(it) == "[object Array]";
	}

	function copyStructure(paths, root, dest){
		//	summary:
		//		Key method. Use an object structure to determine which files
		//		from root shoud be copied to destination.
		//
		//console.log('paths\n', paths);
		paths.forEach(function(p){
			var src = fs.join(root,  p);
			var dst = fs.join(dest,  p);
			//console.log('   copy:', src, ' -- ', dst)
			fs.copy(src, dst);
		});

	}

	function resolvePaths(obj, path){
		//	summary:
		//		Recursively loops through an object and resolves
		//		properties into a flattened array of file paths.
		//		path arg usually starts with "".
		//
		path = path || '';
		var a = [];
		if(isArray(obj)){
			obj.forEach(function(fn){
				var result = resolvePaths(fn, path);
				a = a.concat(result);
			});
			return a.length == 1 ? a[0] : a;

		}else if(typeof obj == 'object'){
			for(var nm in obj){
				var result = resolvePaths(obj[nm], path + '/' + nm);
				a = a.concat(result);
			}

			return a.length == 1 ? a[0] : a;
		}

		var finalPath = fs.fileExists(path) ? path :  path + '/' + obj;

		finalPath = fs.fixPath(finalPath);
		//console.log('  path:', finalPath);

		return finalPath;
	}


	return function(buildArgs){
		console.log(' * copying nano build');
		if(buildArgs.profile.nano){
			var src = fs.getAbsolutePath(buildArgs.profile.nano.src + '/', buildArgs.baseDir);
			var dst = fs.getAbsolutePath(buildArgs.profile.nano.dst, buildArgs.baseDir);

			console.log('nano src:', src);
			console.log('nano dst:', dst);

			var dirToRemove = dst;
			if(fs.dirExists(dirToRemove)){
				if(fs.ensureRemoveDirSafe(dirToRemove, buildArgs.profile.projectName)){
					console.log('Deleting nano directory.');
					fs.rmdirSync(dirToRemove);
				}
			}else{
				console.log('Not deleting nano directory.');
			}

			var fileObj = buildArgs.profile.nano.files;
			var paths = resolvePaths(fileObj);

			copyStructure(paths, src, dst);
			console.log(' * nano copy complete');
		}else{
			console.log('No nano object in profile.');
		}
	};
});
