var events = require('events');
var util = require('util');

var Bus = function () {
    events.EventEmitter.call(this);
};

util.inherits(Bus, events.EventEmitter);

var bus = new Bus();

var emit = bus.emit;

bus.emit = function (event, data) {
    emit.apply(bus, arguments);
};

module.exports = bus;
