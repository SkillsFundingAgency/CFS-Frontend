// Defines the regular expressions which Uglify JS can't minify for prod
var variableRegex = /(?<!\S|"( )+)Dim\s+([a-zA-Z][(\w}|\d){0-254}]*([,][ ])*)+/g;