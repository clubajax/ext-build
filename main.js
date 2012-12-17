/*
 * This take the build arguments from bootstrap and kicks off the build.
 * If there is a trans property in your profile, it adds that transform to
 * the process.
 * If there is a nano property in your profile, it kicks off the nano-copy
 * after the build is complete.
 */
define([
	'build/buildControlDefault',
	'ext-build/util/fs'
],function(bcd, fs){

	return function(buildArgs){
		console.log(' * ext-build main');


		buildArgs.profilePath = buildArgs.profile;
		buildArgs.profile = fs.parse(buildArgs.profilePath, 'profile', true);
		var basePath = buildArgs.profilePath.substring(0, buildArgs.profilePath.lastIndexOf('/')) + '/';
		buildArgs.releaseDir = fs.join(basePath, buildArgs.profile.releaseDir);


		if(buildArgs.nano){
			// nano only, no build
			require(['ext-build/nano/main'], function(nano){
				nano(buildArgs);
			});
		}else{
			if(buildArgs.profile.nano){
				// Do nano after build
				// require events here instead of in deps in the case that this
				// is nano-only (and the events wouldn't have a build to attach
				// to)
				require(['ext-build/util/events'], function(events){
					events.onBuildComplete(function(){
						require(['ext-build/nano/main'], function(nano){
							nano(buildArgs);
						});
					});
				});
			}


			// Delete releaseDir
			// Since the system is now extremely flexible is describing where output is
			// written, a mistake in a profile could result in cleaning your hard drive.
			var dirToRemove = fs.getAbsolutePath(buildArgs.releaseDir, buildArgs.baseDir);
			if(buildArgs.deleteRelease && fs.dirExists(dirToRemove)){
				// ensureRemoveDirSafe ensures that the directory to delete is within
				// a determined path.
				if(fs.ensureRemoveDirSafe(dirToRemove, buildArgs.profile.projectName)){
					console.log('Deleting release directory.');
					fs.rmdirSync(dirToRemove);
				}
			}else{
				console.log('Not deleting release directory.');
			}


			console.log(' * add transform ', !!buildArgs.profile.trans);
			if(buildArgs.profile.trans){
				buildArgs.profile.trans.forEach(function(job){
					bcd.transforms[job.tag] = [job.file, job.type];
					bcd.transformJobs.unshift([
						function(resource){
							if(resource.tag[job.tag]){
								console.log('IS TAG', job.tag);
							}
							return resource.tag[job.tag];
						},
						job.gates
					]);
				});
			}

			require(['build/main']);
		}
	};
});
