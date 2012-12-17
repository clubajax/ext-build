define([
	'dojo/aspect'
], function(aspect){

	var methods = [];
	function register(method){
		methods.push(method);
	}

	function onBuildComplete(){
		methods.forEach(function(fn){ fn(); });
	}


	setTimeout(function(){
		// The timer is necessary because buildControl is empty when this file
		// first loads. Note the build is almost done by the time this fires due
		// to most of the build being synchronous.
		bc = require('build/buildControl');

		// check if the gates have already completed
		if(bc.currentGate >= bc.gates.length-1){
			onBuildComplete();
		}else{
			// if not wait until they do
			aspect.before(bc, 'passGate', function(){
				if(bc.currentGate >= bc.gates.length-1){
					onBuildComplete();
				}
			});
		}
	}, 1);

	return {
		onBuildComplete:register
	};

});
