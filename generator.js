'use strict';

var HEADER = "var Component = require('psykick').Component,\n" +
             "    Helper = require('psykick').Helper;\n\n";

/**
 * Generates the Psykick Component code from an AST
 * @param {Object} ast  Abstract syntax tree
 * @constructor
 */
var Generator = function(ast) {
    this.ast = ast;
};

function createCode(component) {
    var name = component.name,
        properties = component.body.properties;

    var code = HEADER;
    code += createConstructor(name, properties);
    code += createInheritanceLine(name);
    code += createExports(name);
    return code;
}

function createConstructor(name, properties) {
    var code = "var " + name + " = function(options) {\n";
    code += createDefaults(properties);
    code += createProperties(properties);
    code += "};\n\n";
    return code;
}

function createDefaults(properties) {
    var code = "\toptions = Helper.defaults(options, {\n";

    for (var i = 0, len = properties.length; i < len; i++) {
        var property = properties[i],
            endOfLine = (i === len - 1) ? '\n' : ',\n';
        code += "\t\t" + property.name + ': ' + parseProperty(property, 2) + endOfLine;
    }

    code += "\t});\n\n";
    return code;
}

function parseProperty(property, depth) {
    switch(property.type) {
        case 'ObjectLiteral':
            return parseObject(property.value, depth + 1);
            break;

        case 'ArrayLiteral':
            return parseArray(property.value, depth + 1);
            break;

        case 'NullLiteral':
            return 'null';
            break;

        case 'UndefinedLiteral':
            return 'undefined';
            break;

        case 'BooleanLiteral':
            return property.value.toString();
            break;

        case 'StringLiteral':
            return '"' + property.value + '"';
            break;

        default:
            return property.value;
            break;
    }
}

function parseObject(objTree, depth) {
    var tabs = new Array(depth + 1).join('\t'),
        code = '{\n';
    for (var i = 0, len = objTree.length; i < len; i++) {
        code += tabs;

        var property = objTree[i],
            endOfLine = (i === len - 1) ? '\n' : ',\n';
        code += property.name + ': ' + parseProperty(property, depth + 1) + endOfLine;
    }


    if (depth === 3) {
        code += new Array(depth).join('\t');
    } else {
        code += new Array(depth - 1).join('\t');
    }
    code += '}';
    return code;
}

function parseArray(arrTree, depth) {
    var tabs = new Array(depth + 1).join('\t'),
        code = '[\n';

    for (var i = 0, len = arrTree.length; i < len; i++) {
        var element = arrTree[i],
            endOfLine = (i === len - 1) ? '\n' : ',\n';
        code += tabs + parseProperty(element, depth + 1) + endOfLine;
    }

    if (depth === 3) {
        code += new Array(depth).join('\t');
    } else {
        code += new Array(depth - 1).join('\t');
    }
    code += ']';
    return code;
}

function createProperties(properties) {
    var tab = "\t",
        code = "";
    for (var i = 0, len = properties.length; i < len; i++) {
        var property = properties[i];
        code += tab + "this." + property.name + " = options." + property.name + ";\n";
    }

    return code;
}

function createInheritanceLine(name) {
    return "Helper.inherit(" + name + ", Component);\n\n";
}

function createExports(name) {
    return "module.exports = " + name + ";";
}

Generator.prototype.generateCode = function() {
    var components = [];
    for (var i = 0, len = this.ast.length; i < len; i++) {
        var component = this.ast[i];
        components.push({
            name: component.name,
            code: createCode(component)
        });
    }

    return components;
};

Generator.prototype.parse = function(ast) {
    if (ast !== undefined) {
        this.ast = ast;
    }

    var components = [];

    for (var i = 0, len = this.ast.length; i < len; i++) {
        components.push(generateComponent(this.ast[i]));
    }

    return components;
};

module.exports = Generator;