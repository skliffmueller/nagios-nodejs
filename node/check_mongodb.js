let MongoClient = require('mongodb').MongoClient

let argvs = {};

process.argv.forEach((val, index) => {
  	if(val.charAt(0)=="-") {
  		let key = "";
  		if(val.charAt(1)=="-") {
  			key = val.substr(2);
  		} else { 
  			key = val.substr(1);
  		}

  		let value = process.argv[index+1];

	  	if(value.charAt(0)=="-") {
	  		argvs[key] = true;
	  	} else {
	  		argvs[key] = value;
	  	}

  	}
});

main();

function main() {
	if(!argvs.connectionString) {
		return exit(1, "No --connectionString provided");
	}
	MongoClient.connect(argvs.connectionString, function(err, db) {
		if(err) {
			if(typeof err == 'string') {
				return exit(2, err);
			}
			try {
				let string = JSON.stringify(err, null, 2);
				exit(2, string)
			} catch(e) {
				exit(2, "Db connection failed, unable to parse error")
			}
			return;
		}
		if(argvs.action=="stats") {
			stats(db);
		}
		if(argvs.action=="connection") {
			db.close((err) => {
				// Skip error
				exit(0, "Connection successful");
			});
		}
	});

}

function stats(db) {
	let options = {
		scale: 1048576
	}
	if(argvs.scale) {
		options.scale = argvs.scale;
	}
	db.stats(options, (err, stat) => {
		if(err) {
			return handleError(err);
		}
		db.close((err) => {
			try {
				// label=value[UOM];[warn];[crit];[min];[max]
				let value = stat.dataSize+"MB";
				let warn = stat.storageSize*0.85;
				let crit = stat.storageSize*0.90;
				let min = 0;
				let max = stat.storageSize;
				let string = `Size: ${stat.dataSize}MB/${stat.storageSize}MB | mongodbSize=${value}MB;${warn};${crit};0;${max}\n`
				//let string = JSON.stringify(stat, null, 2);
				exit(0, string)
			} catch(e) {
				exit(1, "No stats error, but no data?")
			}
		})
	})
	/*{
		"db": "test",
		"collections": 0,
		"views": 0,
		"objects": 0,
		"avgObjSize": 0,
		"dataSize": 0,
		"storageSize": 0,
		"numExtents": 0,
		"indexes": 0,
		"indexSize": 0,
		"fileSize": 0,
		"ok": 1
	}*/
}

function status(db) {
	let options = {
		scale: 1048576
	}
	if(argvs.scale) {
		options.scale = argvs.scale;
	}
	db.stats(options, (err, stat) => {
		if(err) {
			return handleError(err);
		}
		db.close((err) => {
			try {
				// label=value[UOM];[warn];[crit];[min];[max]
				let string = `Size: ${stat.dataSize}MB/${stat.storageSize}MB \| mongodbSize=${stat.dataSize}MB;100;200;0;${stat.storageSize}\n`
				//let string = JSON.stringify(stat, null, 2);
				exit(0, string)
			} catch(e) {
				exit(1, "No stats error, but no data?")
			}
		})
	})
	/*{
		"db": "test",
		"collections": 0,
		"views": 0,
		"objects": 0,
		"avgObjSize": 0,
		"dataSize": 0,
		"storageSize": 0,
		"numExtents": 0,
		"indexes": 0,
		"indexSize": 0,
		"fileSize": 0,
		"ok": 1
	}*/
}

function handleError(err) {
	if(typeof err == 'string') {
		return exit(2, err);
	}
	try {
		let string = JSON.stringify(err, null, 2);
		exit(2, string)
	} catch(e) {
		exit(2, "Unable to parse error object")
	}
}

function exit(code, message) {
	process.stdout.write(message);
	process.exit(code);
}
