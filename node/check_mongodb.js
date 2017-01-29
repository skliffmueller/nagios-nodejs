let MongoClient = require('mongodb').MongoClient

let argvs = require('./lib/argv');
let nagios = require('./lib/nagios');

main();

function main() {
	if(!argvs.connectionString) {
		return exit(1, "No --connectionString provided");
	}
	MongoClient.connect(argvs.connectionString, function(err, db) {
		if(err) {
			if(typeof err == 'string') {
				return nagios.exit(2, err);
			}
			try {
				let string = JSON.stringify(err, null, 2);
				nagios.exit(2, string)
			} catch(e) {
				nagios.exit(2, "Db connection failed, unable to parse error")
			}
			return;
		}
		if(argvs.action=="stats") {
			stats(db);
		}
		if(argvs.action=="connection") {
			db.close((err) => {
				// Skip error
				nagios.exit(0, "Connection successful");
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
			return nagios.handleError(err);
		}
		db.close((err) => {
			try {
				// label=value[UOM];[warn];[crit];[min];[max]
				let firstPerfData = nagios.perfData({
					label:"mongodbSize",
					value:Math.ceil(stat.dataSize*100)/100+"MB",
					warn:Math.ceil(stat.storageSize*85)/100,
					crit:Math.ceil(stat.storageSize*90)/100,
					min:0,
					max:Math.ceil(stat.storageSize*100)/100
				});

				let perfData = "";

				perfData += nagios.perfData({
					label:"mongodbIndex",
					value:stat.indexes,
					warn:0,
					crit:0,
					min:0,
					max:0
				})+"\n";

				perfData += nagios.perfData({
					label:"mongodbIndexSize",
					value:Math.ceil(stat.indexSize*100)/100+"MB",
					warn:0,
					crit:0,
					min:0,
					max:0
				})+"\n";

				perfData += nagios.perfData({
					label:"mongodbAvgObjSize",
					value:Math.ceil(stat.avgObjSize*100)/100+"MB",
					warn:0,
					crit:0,
					min:0,
					max:0
				})+"\n";

				perfData += nagios.perfData({
					label:"mongodbFileSize",
					value:Math.ceil(stat.fileSize*100)/100+"MB",
					warn:0,
					crit:0,
					min:0,
					max:0
				})+"\n";

				perfData += nagios.perfData({
					label:"mongodbObjects",
					value:stat.objects,
					warn:0,
					crit:0,
					min:0,
					max:0
				})+"\n";

				perfData += nagios.perfData({
					label:"mongodbViews",
					value:stat.views,
					warn:0,
					crit:0,
					min:0,
					max:0
				})+"\n";

				perfData += nagios.perfData({
					label:"mongodbCollections",
					value:stat.collections,
					warn:0,
					crit:0,
					min:0,
					max:0
				});

				let string = `Size: ${stat.dataSize}MB/${stat.storageSize}MB | ${firstPerfData}\n | ${perfData}\n`
				//let string = JSON.stringify(stat, null, 2);
				nagios.exit(0, string)
			} catch(e) {
				nagios.exit(1, "No stats error, but no data?")
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
			return nagios.handleError(err);
		}
		db.close((err) => {
			try {
				// label=value[UOM];[warn];[crit];[min];[max]
				let string = `Size: ${stat.dataSize}MB/${stat.storageSize}MB \| mongodbSize=${stat.dataSize}MB;100;200;0;${stat.storageSize}\n`
				//let string = JSON.stringify(stat, null, 2);
				nagios.exit(0, string)
			} catch(e) {
				nagios.exit(1, "No stats error, but no data?")
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
