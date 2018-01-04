/*globals ace:true*/
ace.define('ace/mode/logo', function(require, exports, module) {
	var oop = require("ace/lib/oop");
	var TextMode = require("ace/mode/text").Mode;
	var LogoHighlightRules = require("ace/mode/logo_highlight_rules").LogoHighlightRules;

	var Mode = function() {
		this.HighlightRules = LogoHighlightRules;
	};
	oop.inherits(Mode, TextMode);

	(function() {
		// Extra logic goes here. (see below)
	}).call(Mode.prototype);

	exports.Mode = Mode;
});

ace.define('ace/mode/logo_highlight_rules', function(require, exports, module) {

	var oop = require("ace/lib/oop");
	var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;
	var identifiant = "[a-z][a-zA-Z0-9_]*";
	var LogoHighlightRules = function() {

//    this.$rules = new TextHighlightRules().getRules();
	this.$rules = {
		start: [{
			token: "comment",
			regex: /COULEUR/,
		},{
			token: ["keyword.function", "espace", "entity.name.function"],
			regex: "(pour)(\\s+)("+identifiant+")",
			next: "function_param"
		}],
		function_param: [{
			token: "variable.parametre",
			regex: ":"+identifiant+"",
		},{
			token: "ponctuation",
			regex: "(,\\s*)",
		}]
	};

};

oop.inherits(LogoHighlightRules, TextHighlightRules);

exports.LogoHighlightRules = LogoHighlightRules;
});
