

function perfData(obj) {
	/*{
		label:"",
		value:"",
		warn:0,
		crit:0,
		min:0,
		max:0
	}*/
	return `${obj.label}=${obj.value};${obj.warn};${obj.crit};${obj.min};${obj.max}`
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

module.exports = {
	perfData: perfData,
	handleError: handleError,
	exit: exit
}