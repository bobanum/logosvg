/*jslint esnext:true, browser: true,evil:true*/
Object.defineProperties(Object.prototype, {
	forEach: {
		value: function (callback, thisArg) {
			var k, idx;
			idx = 0;
			thisArg = thisArg || this;
			for (k in this) {
				idx += 1;
				callback.call(thisArg, k, this[k], idx, this);
			}
			return this;
		}
	}
});
class Syntaxe {
	constructor (elements) {
		this.elements = {};
		this.add(elements || {});
	}
	add(id, element) {
		if (arguments.length === 1) {
			let arg = arguments[0];
			return arg.forEach((arg instanceof Array) ? a=>this.add.apply(this, a) : this.add, this);
		}
		this.elements[id] = element;
		return this;
	}
	static init() {

	}
}
Syntaxe.init();

class SyntaxeGroup {
	constructor () {
		this.open = "(";
		this.close = ")";
		this.separate = " ";
		this.min = 0;
		this.max = -1;
		this.content = [];
	}
	static init() {

	}
}
SyntaxeGroup.init();

class SyntaxeElement {
	constructor (token, sequence) {
		this.token = token;
		this.sequence = sequence;
	}
	static init() {

	}
}
SyntaxeElement.init();


var logo = new Syntaxe();
logo.add({
	"comment.line": new SyntaxeElement("comment.line", /;.*$/),
	"number.integer.absolute": new SyntaxeElement("number.integer.absolute", /[0-9+]/),
	"number.integer": new SyntaxeElement("number.integer", [/[\-\+]?/, "number.integer.absolute"]),
	"number.float": new SyntaxeElement("number.float", [["number.integer", /(?:\.[0-9+])?/], [/[\-\+]?0\.[0-9+]/]])
});

class Rex {
	static init() {

	}
}
Rex.init();
class RexSequence {
	static init() {

	}
}
RexSequence.init();
