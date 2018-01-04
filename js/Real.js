/*jslint esnext:true,browser:true*/
class Real {
	constructor(content, quantifier, flags) {
		this.min = 1;
		this.max = 1;
		this.content = [];
		this.start = false;
		this.end = false;
		this.capturing = false;
		this.grouping = false;
		this.global = false;
		this.insensitive = false;
		this.multiline = false;
		this.unicode = false;
		this.sticky = false;
		this.parentReal = null;
		this.greedy = true;
		this.add(content);
		this.quantifier = quantifier;
		this.flags = flags;
	}
	get flags() {
		var result, k;
		result = '';
		for (k in Real.FLAGS) {
			result += (this[k]) ? Real.FLAGS[k] : '';
		}
		return result;
	}
	set flags(val) {
		var result, k;
		if (!val) {return;}
		for (k in Real.FLAGS) {
			this[k] = (val.indexOf(Real.FLAGS[k] > -1));
		}
		return result;
	}
	get quantifier() {
		var result;
		if (this.max <= 0) {
			if (this.min <= 0) { result = "*"; }
			else if (this.min === 1) { result = "+"; }
			else { result = "{" + this.min + ",}"; }
		} else if (this.max === 1) {
			if (this.min <= 0) { result = "?"; }
			else if (this.min === 1) { result = ""; }
			else { result = "{" + this.min + "}"; } /*Should cause an exception*/
		} else {	// max > 1
			if (this.min <= 0) { result = "{0," + this.max + "}"; }
			else {
				if (this.min < this.max) { result = "{" + this.min + "," + this.max + "}"; }
				else { result = "{" + this.min + "}"; } //Should cause an exception if >
			}
		}
		if (!this.greedy) {
			if (!result) { result = "{1}"; }
			result += "?";
		}
		return result;
	}
	set quantifier(val) {
		if (!val) {return;}
		val = Real.findQuantifier(val);
		if (val.length > 1 && val.slice(-1) === "?") {
			this.greedy = false;
			val = val.slice(0,-1);
		}
		if (val === "?") {
			this.min = 0;
			this.max = 1;
		} else if (val === "*") {
			this.min = 0;
			this.max = -1;
		} else if (val === "+") {
			this.min = 1;
			this.max = -1;
		} else {
			let parts = val.match(/^\{([+-]?[0-9]+)(,([+-]?[0-9]+)?)?\}$/);
			if (!parts) {
				throw ("Invalid quantifier");
			}
			this.min = parseInt(parts[1]);
			if (parts[3]) {
				this.max = parseInt(parts[3]);
			} else if (parts[2]) {
				this.max = -1;
			} else {
				this.max = this.min;
			}
		}
	}
	static findQuantifier(str) {
		var result;
		result = str.match(/(?:[\?\*\+]|\{[\+\-]?[0-9]+(?:,(?:[\+\-]?[0-9]+)?)?\})\??$/);
		result = result || [""];
		return result[0];
	}
	add(item, id) {
		if (!item) {
			return this;
		}
		if (item instanceof Real) {
			item.parentReal = this;
		} else if (item instanceof Array) {
			item.forEach((i)=>(this.add(i)));
			return this;
		} else if (typeof item === "object") {
			let k;
			for (k in item) {
				this.add(item[k], k);
			}
			return this;
		} else if (typeof item === "string") {
			item = Real.escape(item);
		}
		this.content.push(item);
		if (id) {
			this.content[id] = item;
		}
		return this;
	}
	toString() {
		var result, qty;
		result = this.baseString();
		qty = this.quantifier;
		if (qty && this.capturing) {
			result = '(' + result + ')' + qty;
		} else if (qty && !this.capturing) {
			result = '(?:' + result + ')' + qty;
		} else if (this.capturing && this.parentReal) {
			result = '(' + result + ')';
		}
		if (!this.parentReal) {
			result = '/' + result + '/';
			result += this.flags;
		}
		return result;
	}
	baseString() {
		var result;
		result = this.content.join("");
		return result;
	}
	static escape(str) {
		var result, chars;
		chars = '\\' + (".^$*+?()[{\\|^-]/".split("").join("\\"));
		console.log(str);
		result = str.replace(new RegExp('(['+chars+'])', "g"), "\\$1");
		return result;
	}
	static init() {
		this.FLAGS = {
			global: "g",
			insensitive: "i",
			multiline: "m",
			unicode: "u",
			sticky: "y"
		};
	}
}
Real.init();

class RealOr extends Real {
	constructor() {
		super();
	}
	baseString() {
		var result;
		result = this.content.join("|");
		return result;
	}
	static init() {

	}
}
RealOr.init();
var r = new Real();
r.add("[0-9]", "digit");
r.add(new Real(["[\+\-]?","/digit/+"]), "integer");
r.start = true;
r.global = true;
console.log(r.toString());
