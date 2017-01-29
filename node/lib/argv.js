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

module.exports = argvs;