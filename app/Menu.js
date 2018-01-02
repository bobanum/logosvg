/*jslint esnext:true, browser:true, evil:true*/
/*globals*/
class Menu {
	constructor (props) {
		this.label = "";
		this.shortcut = "";
		this._click = null;
		this.content = [];
		this.icon = "";
		this.parentElement = null;
		this.class = "";
		this.actif = null;
		this.setProperties(props);
		this._dom = null;
		this._dom_content = null;
	}
	get dom() {
		if (this._dom) {
			return this._dom;
		}
		var result;
		result = document.createElement("div");
		result.classList.add("menu");
		if (this.class) {
			result.classList.add(this.class);
		}
		result.appendChild(this.dom_label);
		result.appendChild(this.dom_content);

		this._dom = result;
		result.obj = this;
		return result;
	}
	get dom_content() {
		if (this._dom_content) {
			return this._dom_content;
		}
		var result;
		result = document.createElement("ul");
		this.content.forEach(function(c) {
			let li = result.appendChild(document.createElement("li"));
			li.appendChild(c.dom);
		}, this);
		this._dom_content = result;
		result.obj = this;
		return result;
	}

	get click() {
		return this._click;
	}
	set click(val) {
		if (val.click) {
			val = val.click;
		}
		this._click = val;
	}
	setProperties(props) {
		var k;
		props = props || {};
		for (k in props) {
			this[k] = props[k];
		}
		return this;
	}
	get dom_label() {
		if (this._dom_label) {
			return this._dom_label;
		}
		var result, span;
		if (typeof this.click === "string") {
			result = document.createElement("a");
			result.setAttribute("href", this.click);
		} else if (typeof this.click === "function") {
			result = document.createElement("div");
			result.addEventListener("click", this.click);
		} else {
			result = document.createElement("div");
		}
		result.classList.add("label");

		span = result.appendChild(document.createElement("span"));
		span.classList.add("icon");
		span.innerHTML = this.icon;

		span = result.appendChild(document.createElement("span"));
		span.classList.add("label");
		span.innerHTML = this.label;

		span = result.appendChild(document.createElement("span"));
		span.classList.add("shortcut");
		span.innerHTML = this.shortcut;

		this._dom_label = result;
		result.obj = this;
		return result;
	}
	addElementDom(element) {
		var result = document.createElement("li");
		result.appendChild(element.dom);
		this.dom_content.appendChild(element.dom);
		return result;
	}
	add(element) {
		if (element instanceof Menu) {
			this.content.push(element);
			if (this._dom) {
				this.addElementDom(element);
			}
		} else if (element instanceof Array) {
			element.forEach((e)=>(this.add(e)), this);
		} else {
			this.add(new Menu(element));
		}
		return this;
	}
	static init() {

	}
}
Menu.init();
