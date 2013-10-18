start
    = __ program:Program __ { return program; }

SourceCharacter
    = .

_
    = (WhiteSpace)*

__
    = (WhiteSpace / LineTerminator / Comment)*

WhiteSpace
    = [' '\t\v]

LineTerminator
    = [\r\n]

Comment
    = SingleLineComment
    / MultiLineComment

SingleLineComment
    = "//" (!LineTerminator SourceCharacter)*

MultiLineComment
    = "/*" (!"*/" SourceCharacter)* "*/"

ComponentDeclaration
    = name:ComponentName __ body:Block __ {
        return {
            type: "ComponentDeclaration",
            name: name[0] + name[1].join(''),
            body: body
        };
    }

ComponentName
    = [A-Z][a-zA-Z0-9]+

Block
    = "{" __ properties:(PropertyList __)? "}" {
        return {
            type: "Block",
            properties: properties !== "" ? properties[0] : []
        }
    }

PropertyList
    = head:PropertyDeclaration tail:(__ "," __ PropertyDeclaration)* {
        var result = [
            {
                name: head.name,
                type: head.value.type,
                value: head.value.value
            }
        ];
        for (var i = 0, len = tail.length; i < len; i++) {
            var declaration = tail[i][3],
                property = declaration.value
            result.push({
                name: declaration.name,
                type: property.type,
                value: property.value
            });
        }
        return result;
    }

PropertyDeclaration
    = name:Identifier _ "=>" _ value:Literal {
        return {
            type: "PropertyDeclaration",
            name: name,
            value: value
        }
    }

Identifier
    = name:IdentifierName { return name; }

IdentifierName
    = start:IdentifierStart parts:(IdentifierParts)* {
        return start + parts.join('');
    }

IdentifierStart
    = "_"
    / "$"
    / [a-zA-Z]

IdentifierParts
    = "_"
    / "$"
    / [a-zA-Z]
    / [0-9]

Literal
    = NullLiteral
    / UndefinedLiteral
    / BooleanLiteral
    / value:NumericLiteral {
        return {
            type: "NumericLiteral",
            value: value
        }
    }
    / value:StringLiteral {
        return {
            type: "StringLiteral",
            value: value
        }
    }
    / ObjectLiteral
    / ArrayLiteral

NullLiteral
    = "null" { return { type: "NullLiteral", value: null }; }

UndefinedLiteral
    = "undefined" { return { type: "UndefinedLiteral", value: undefined }; }

BooleanLiteral
    = value:("true" / "false") {
        return {
            type: "BooleanLiteral",
            value: (value === "true")
        }
    }

NumericLiteral "number"
  = literal:(HexIntegerLiteral / DecimalLiteral) {
      return literal;
    }

DecimalLiteral
  = parts:$(DecimalIntegerLiteral "." DecimalDigits? ExponentPart?) {
      return parts;
    }
  / parts:$("." DecimalDigits ExponentPart?)     { return parseFloat(parts); }
  / parts:$(DecimalIntegerLiteral ExponentPart?) { return parseFloat(parts); }

DecimalIntegerLiteral
  = "0" / NonZeroDigit DecimalDigits?

DecimalDigits
  = DecimalDigit+

DecimalDigit
  = [0-9]

NonZeroDigit
  = [1-9]

ExponentPart
  = ExponentIndicator SignedInteger

ExponentIndicator
  = [eE]

SignedInteger
  = [-+]? DecimalDigits

HexIntegerLiteral
  = "0" [xX] digits:$HexDigit+ { return "0x" + digits; }

HexDigit
  = [0-9a-fA-F]

StringLiteral "string"
    = parts:('"' DoubleStringCharacters? '"') {
          return parts[1];
      }

DoubleStringCharacters
  = chars:DoubleStringCharacter+ { return chars.join(""); }

DoubleStringCharacter
  = !('"' / "\\" / LineTerminator) char_:SourceCharacter { return char_; }

ObjectLiteral
    = "{" __ properties:(PropertyList __)? "}" {
          return {
              type: "ObjectLiteral",
              value: properties !== "" ? properties[0] : []
          }
      }

ArrayLiteral
    = "[" __ elements:(ElementList __)? "]" {
        return {
            type: "ArrayLiteral",
            value: elements !== "" ? elements[0] : []
        }
    }

ElementList
    = head: Literal tail:(__ "," __ Literal)* {
        var result = [
            {
                type: head.type,
                value: head.value
            }
        ];
        for (var i = 0, len = tail.length; i < len; i++) {
            var literal = tail[i][3];
            result.push({
                type: literal.type,
                value: literal.value
            });
        }
        return result;
    }

Program
    = ComponentDeclaration*