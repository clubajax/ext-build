/*
 * fs is a utility file that provides all of the APIs from dojo build fileUtils
 * and fs in one convenient file.
 * It adds the ability to delete files and directories - which should be stated,
 * needs to be used with exterme caution. You have been warned!!!
 **/
define([
	'dojo/_base/lang',
	'dojo/has',
	'build/fileUtils',
	'build/fs'
], function(lang, has, fileUtils, fs){

	var
		nodeFS,
		removeRequiresExp = /require\(.*\)\]\);/g,

		ensureRemoveDirSafe = function(path, withinFolder){
			var dirToRemove = path;
			if(this.dirExists(dirToRemove)){
				if(withinFolder && ~dirToRemove.indexOf(withinFolder)){
					console.log('Deleting directory is safe.');
					return 1;
				}else{
					var msg =	'Deleting directory appeared unsafe. ' +
								'You are either missing projectName in your profile or ' +
								'the release directory does not contain the projectName ' +
								' in its path.';
					console.log(msg);
				}
			}else{
				console.log('Not deleting directory, because it does not exist.');
			}
			return 0;
		},

		parse = function(path, variable, removeRequires){
			// replaces readAndEval in the build tool
			// pass the path to the file and the variable name to
			// be eval'd. Of course there should be one variable/object
			// in the file.
			var txt = this.readFileSync(path, 'utf8');
			if(removeRequires){
				txt = txt.replace(removeRequiresExp, '');
			}
			var code = (new Function(txt + '; return '+variable+';'))();
			return code;
		},

		node_unlinkSync = function(path){
			if(this.dirExists(path)){
				return this.rmdirSync(path);
			}else if(!this.fileExists(path)){
				console.warn('file to delete does not exist: ', path);
				return 0;
			}
			return nodeFS.unlinkSync(path);
		},

		node_rmdirSync = function(path){
			var i, file, files;
			if(!this.dirExists(path)){
				console.error('dir does not exist:', path);
				return 0;
			}
			files = fs.readdirSync(path);
			if(files.length){
				for(i = 0; i < files.length; i++) {
					file = this.catPath(path, files[i]);
					if(this.dirExists(file)){
						this.rmdirSync(file);
					}else if(this.fileExists(file)){
						this.unlinkSync(file);
					}else{
						console.warn('dir item cannot be found: ', file);
					}
				}
			}
			return nodeFS.rmdirSync(path);
		},

		java_unlinkSync = function(path){
			var file = new java.io.File(path);
			console.log('dir:', file.isDirectory());
			if(!file.exists()){
				console.log(' file does not exist: ' + path);
				return false;
			}
			if(file.isDirectory()){
				return this.rmdirSync(path);
			}else{
				return file['delete']();
			}
		},

		java_rmdirSync = function(path){
			var i, file, files;
			var dir = new java.io.File(path);
			files = dir.list();

			for(i=0; i < files.length; i++){
				file = new java.io.File(dir, files[i]);
				if(file.isDirectory()){
					this.rmdirSync(file);
				}else{
					file['delete']();
				}
			}
			return dir['delete']();
		},

		copyFile = function(src, dst){
			// Makin copies.
			if(!this.fileExists(src)){
				console.log('file to copy does not exist:', src);
				return 0;
			}

			if(this.fileExists(dst)){
				this.unlinkSync(dst);
			}
			this.ensureDirectoryByFilename(dst);
			return this.writeFileSync(dst, this.readFileSync(src, 'utf8'), 'utf8');
		},

		/*copyDirectory = function(src, dst){
			if(!this.dirExists(src)){ return 0; }
			if(this.dirExists(dst)){
				this.rmdirSync(dst);
			}
			this.ensureDirectory(dst);
			this.readdirSync(src).forEach(function(srcFile){
				console.log(' copy:', srcFile);
				// convert to dstFile

				if(this.dirExists(srcFile)){
					//this.rmdirSync(file);
				}else if(this.fileExists(srcFile)){
					//this.unlinkSync(file);
				}
			});
		},*/

		copy = function(src, dst){
			// Copies files.
			// Copying dirs in not supported at this time. Generally, find the
			// files you need copied and the dirs will be created as you copy
			// them.
			if(this.fileExists(src)){
				return this.copyFile(src, dst);
			}else if(this.dirExists(src)){
				return this.copyDirectory(src, dst);
			}
			console.log('(copy) resource does not exist.');
			return 0;
		},

		join = function(){
			// does a more thorough job of joining and cleaning paths than catPath
			return this.fixPath(this.catPath.apply(this, arguments));
		},

		fixPath = function(){
			var path = Array.prototype.slice.call(arguments)
				.join('/')
				.replace(/\\/g, '/')
				.replace(/\/+/g, '/')
				.replace(/\/\.\//g, '/');

			// Windows doubles up the path like:
			// C:/dev/foo/C:/dev/foo/
			var dblPath = (/(C:)/).exec(path);
			if(dblPath && dblPath.length > 1){
				var parts = path.split('C:');
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
		};

	if(has('host-node')){
		nodeFS = require.nodeRequire("fs");
		unlinkSync = node_unlinkSync;
		rmdirSync = node_rmdirSync;
	}else{
		unlinkSync = java_unlinkSync;
		rmdirSync = java_rmdirSync;
	}

	return {
		getFilename:					fileUtils.getFilename,
		getFilepath:					fileUtils.getFilepath,
		getFiletype:					fileUtils.getFiletype,
		cleanupPath:					fileUtils.cleanupPath,
		isAbsolutePath:					fileUtils.isAbsolutePath,
		normalize:						fileUtils.normalize,
		getAbsolutePath:				fileUtils.getAbsolutePath,
		catPath:						fileUtils.catPath,
		compactPath:					fileUtils.compactPath,
		computePath:					fileUtils.computePath,
		getTimestamp:					fileUtils.getTimestamp,
		dirExists:						fileUtils.dirExists,
		readAndEval:					fileUtils.readAndEval,
		maybeRead:						fileUtils.maybeRead,
		fileExists:						fileUtils.fileExists,
		ensureDirectory:				fileUtils.ensureDirectory,
		ensureDirectoryByFilename:		fileUtils.ensureDirectoryByFilename,
		clearCheckedDirectoriesCache:	fileUtils.clearCheckedDirectoriesCache,

		statSync:		fs.statSync,
		mkdirSync:		fs.mkdirSync,
		readFileSync:	fs.readFileSync,
		writeFileSync:	fs.writeFileSync,
		readdirSync:	fs.readdirSync,
		readFile:		fs.readFile,
		writeFile:		fs.writeFile,

		ensureRemoveDirSafe: ensureRemoveDirSafe,
		unlinkSync: unlinkSync,
		rmdirSync: rmdirSync,
		parse: parse,
		copyFile: copyFile,
		copy: copy,
		fixPath: fixPath,
		join: join
	};

});
