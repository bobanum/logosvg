/*jslint esnext:true, browser: true,evil:true*/
class ElementMenu {
	constructor (props) {
		this.label = "";
		this.raccourcis = "";
		this._click = null;
		this.contenu = [];
		this.icone = "";
		this.parentElement = null;
		this.class = "";
		this.actif = null;
		this.setProperties(props);
	}
	get dom() {
		if (!this._dom) { this._dom = this.dom_creer(); }
		return this._dom;
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
	dom_creer() {
		var resultat, span;
		resultat = document.createElement("li");
		resultat.appendChild(this.dom_label());
		resultat.contenu = this.dom_contenu();
		resultat.appendChild(resultat.contenu);

		span = resultat.appendChild(document.createElement("span"));
		span.setAttribute("class", "extra");

		return resultat;
	}
	dom_label() {
		var resultat, span;
		if (typeof this.click === "string") {
			resultat = document.createElement("a");
			resultat.setAttribute("href", this.click);
		} else if (typeof this.click === "function") {
			resultat = document.createElement("div");
			resultat.addEventListener("click", this.click);
		} else {
			resultat = document.createElement("div");
		}
		if (this.class) {
			resultat.setAttribute("class", this.class);
		}
		resultat.classList.add("label");
		resultat.obj = this;

		span = resultat.appendChild(document.createElement("span"));
		span.setAttribute("class", "icone");
		span.innerHTML = this.icone;

		span = resultat.appendChild(document.createElement("span"));
		span.setAttribute("class", "label");
		span.innerHTML = this.label;

		span = resultat.appendChild(document.createElement("span"));
		span.setAttribute("class", "raccourcis");
		span.innerHTML = this.raccourcis;

		return resultat;
	}
	dom_contenu() {
		var resultat, i, n;
		resultat = document.createElement("ul");
		for (i = 0, n = this.contenu.length; i < n; i += 1) {
			resultat.appendChild(this.contenu[i].dom);
		}
		return resultat;
	}
	ajouter(element) {
		if (element instanceof ElementMenu) {
			this.contenu.push(element);
			this.dom.contenu.appendChild(element.dom);
		} else if (element instanceof Array) {
			element.forEach((e)=>(this.ajouter(e)), this);
		} else {
			this.ajouter(new ElementMenu(element));
		}
		return this;
	}
	static init() {

	}
}
ElementMenu.init();

class Menu extends ElementMenu {
	constructor (props) {
		super();
		this.icone = "&#xE116;";
		this.setProperties(props);
	}
	dom_creer() {
		var resultat, span;
		resultat = document.createElement("div");
		resultat.classList.add("menu");
		if (this.id) {
			resultat.setAttribute("id", this.id);
		}
		span = resultat.appendChild(document.createElement("span"));
		span.setAttribute("tabindex", "1");
		span.innerHTML = this.icone;
		resultat.contenu = this.dom_contenu();
		resultat.appendChild(resultat.contenu);
		return resultat;
	}
	static init() {

	}
}
Menu.init();
