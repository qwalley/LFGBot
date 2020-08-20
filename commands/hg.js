const config = require('../config.json');
const invite = require('./createInvite');

module.exports = {
	name: 'hg',
	description: 'create a group invitation for hellgates',
	execute(msg, args) {
		invite({role: 'developer', msg: msg, description: args})
	}
}