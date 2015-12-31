var cluster = require('cluster');

function startWorker(){	
	var worker = cluster.fork(); // this starts a worker for each CPU in the system. 
	console.log('CLUSTER: Worker %d started', worker.id);
}
if(cluster.isMaster){ // determines the contex
	require('os').cpus().forEach(function(){
		startWorker();
	});
	//log any workers that disconnect; if a worker disconnects, it should then exit, so we'll wait for the exit event to spawn a new worker to replace it. 
	cluster.on('disconnect', function(worker){
		console.log('CLUSTER: Worker %d disconnected from the cluster', worker.id);
	});
	// when a worker dies (exits) create a new one to replace it. 
	cluster.on('exit', function(worker, code, signal){
		console.log('CLUSTER: Worker %d died with exit code %d (%s)', worker.id, code, signal);
		startWorker();
	});
} else { // here we handle the worker case. Since we configured meadowlark.js to be used as a module, we simply import it and immediately invoke it. 
	// start our app on worker; see meadowlark.js
	require('./meadowlark.js')();
}

/*
When this JavaScript is executed, it will either be in the context of master (when it is run directly with "node meadowlark_cluster.js"), 
or in the context of a worker, when Node's cluster system executes it. 
*/