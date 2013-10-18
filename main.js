/**
 * Generate a Psykick Component from a simplified syntax
 * Usage: node main.js inputfile [3d]
 */

'use strict';

if (process.argv.length < 3) {
    console.log('Usage: node main.js inputfile [3d]');
    process.exit(1);
}

var PEG = require('pegjs'),
    Generator = require('./generator.js'),
    fs = require('fs'),
    loadFile = function(path) {
        return fs.readFileSync(path).toString();
    },
    use3D = process.argv[3] === '3d';


// Generate a parser
var parser = PEG.buildParser(loadFile('./grammar.pegjs'));

// Load the source file
var source = loadFile(process.argv[2]);

// Create a code generator
var generator = new Generator(parser.parse(source), use3D);

// Generate code for each of the components
var components = generator.generateCode();

for (var i = 0, len = components.length; i < len; i++) {
    // Create a filename by converting the component name from
    // PascalCase into a dash-separated-style and removing 'Component' from the name
    var component = components[i],
        filename = component.name
            .replace(/component/gi, '')
            .replace(/^[A-Z]/, function(c) {
                return c.toLowerCase();
            })
            .replace(/[A-Z]/g, function(c) {
                return '-' + c.toLowerCase();
            }) + '.js';

    fs.writeFileSync(filename, component.code);
    console.log('Compiled ' + filename);
}

console.log('Done!');