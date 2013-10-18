'use strict';

var PEG = require('pegjs'),
    fs = require('fs'),
    loadFile = function(path) {
        return fs.readFileSync(path).toString();
    },
    source = loadFile('./examples/basic.component'),
    parser = PEG.buildParser(loadFile('./grammar.pegjs'));

var Generator = require('./generator.js'),
    generator = new Generator(parser.parse(source)),
    components = generator.generateCode();

for (var i = 0, len = components.length; i < len; i++) {
    var defaultFilename = components[i].name
        .replace(/component/gi, '')
        .replace(/^[A-Z]/, function(c) {
            return c.toLowerCase();
        })
        .replace(/[A-Z]/g, function(c) {
            return '-' + c.toLowerCase();
        }) + '.js';
    console.log(defaultFilename);
    console.log(components[i].code);
    console.log('');
}