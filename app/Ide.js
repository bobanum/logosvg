/*jslint esnext:true, browser: true,evil:true*/
/*globals ace,Main,Menu*/
class Ide extends Main {
	constructor() {
		super();
        this.encours = undefined;
        this.langage = new Ide.langage(this);
		this.latence = 1000;
		this.menu = new Menu();
		this.menu.class = "main";
		this.menu.icon = "&#xE116;";
		this.menu.add(this.menu_ouvrir());
		this.menu.add({obj:this, icon:"&#xe064;", label:"Sauvegarder"});
		this.menu.add({obj:this, icon:"", label:"Affichage de la grille", click: Ide.evt.mnu_grille});
	}
	get dom() {
		if (!this._dom) {this._dom = this.dom_creer();}
		return this._dom;
	}
	get code() {
		return this.editor.getValue();
	}
	set code(val) {
		this.editor.setValue(val, -1);
	}
	get vitesse() {
        var v = 200 * Math.pow(1 - (this._vitesse.value / 11), 2);
		return v;
	}
	set vitesse(val) {
        var v = Math.pow(1 - (val / 200), 2) * 11;
		this._vitesse.value = v;
	}
	get grille() {
		return (this.svg.grille.style.display !== "none");
	}
	set grille(val) {
		if (val === true) {
			this.svg.grille.style.display = "";
		} else if (val === false) {
			this.svg.grille.style.display = "none";
		}
	}
	ajouterDom(logo, menu) {
		document.getElementById(logo).appendChild(this.dom);
		if (menu) {
			document.getElementById(menu).appendChild(this.menu.dom);
		}
		return this;
	}
	dom_creer() {
		var div;
		div = document.createElement('div');
		div.setAttribute('id', 'ide');
		div.appendChild(this.dom_control());
		div.appendChild(this.dom_plan());
		return div;
	}
	dom_control() {
		var section, code;
		section = document.createElement('section');
		section.setAttribute('id', 'control');
		section.style.width = "350px";
		section.appendChild(this.dom_icons());
		code = section.appendChild(this.dom_code());
//		code = section.appendChild(this.dom_console());
		section.appendChild(this.dom_poignee());
		return section;
	}
	dom_code() {
		var resultat, editor;
		resultat = document.createElement('section');
		resultat.setAttribute("id", "code");

		editor = resultat.appendChild(document.createElement('div'));
		editor = ace.edit(editor);
		editor.setTheme("ace/theme/chrome");
		editor.getSession().setMode("ace/mode/python");
		editor.on("guttermousedown", function(e){
			var target = e.domEvent.target;
			if (target.className.indexOf("ace_gutter-cell") == -1) {
				return;
			}
			if (!editor.isFocused()) {
				return;
			}
			if (e.clientX > 25 + target.getBoundingClientRect().left) {
				return;
			}

			var row = e.getDocumentPosition().row;
			e.editor.session.setBreakpoint(row);
			e.stop();
		});
		editor.on("blur", function() {
			window.localStorage.code = editor.getValue();
		});
		if (window.localStorage.code) {
			editor.setValue(window.localStorage.code, -1);
		}
		this.editor = editor;
//		resultat.appendChild(this.dom_poigneeH());
		return resultat;
	}
	dom_console() {
		var resultat, div,ta;
		resultat = document.createElement('div');
		resultat.setAttribute("id", "console");
		div = resultat.appendChild(document.createElement("div"));
		ta = resultat.appendChild(document.createElement("textarea"));
		ta.innerHTML = "allo";
		//TODO À FINIR

		return resultat;
	}
	dom_poignee() {
		var resultat;
		resultat = document.createElement("div");
		resultat.classList.add("poignee");
		resultat.classList.add("vertical");
		resultat.setAttribute("draggable", true);
		resultat.addEventListener("dragstart", function (e) {
			e.dataTransfer.setDragImage(document.createElement("div"),0,0);
		});
		resultat.addEventListener("dragend", function (e) {
			this.parentNode.style.width = (e.clientX - this.parentNode.getBoundingClientRect().left + 3) + "px";
		});
		resultat.addEventListener("drag", function (e) {
			this.parentNode.style.width = (e.clientX - this.parentNode.getBoundingClientRect().left + 3) + "px";
		});
		return resultat;
	}
	dom_poigneeH() {
		var resultat;
		resultat = document.createElement("div");
		resultat.classList.add("poignee");
		resultat.classList.add("horizontal");
		resultat.setAttribute("draggable", true);
		resultat.addEventListener("dragstart", function (e) {
			e.dataTransfer.setDragImage(document.createElement("div"),0,0);
		});
		resultat.addEventListener("dragend", function (e) {
			this.parentNode.style.height = (e.clientY) - this.parentNode.getBoundingClientRect().top + "px";
		});
		resultat.addEventListener("drag", function (e) {
//			debugger;
			console.log(this.parentNode.getBoundingClientRect().top);
			this.parentNode.style.height = (e.clientY) - this.parentNode.getBoundingClientRect().top + "px";
		});
		return resultat;
	}
	dom_icons() {
		var resultat, btn;
		resultat = document.createElement("section");
		resultat.setAttribute('id', 'icons');
		btn = resultat.appendChild(this.menu.dom);
		btn = resultat.appendChild(this.dom_bouton("effacer", Ide.evt.btn_effacer, "Effacer"));
        resultat.appendChild(this.dom_vitesse(Ide.evt.sld_vitesse));
		btn = resultat.appendChild(this.dom_bouton("lire", Ide.evt.btn_lire, "Lire (F8)"));
		btn = resultat.appendChild(this.dom_bouton("pause", Ide.evt.btn_pause, "Pause (F8)"));
//		btn = resultat.appendChild(this.dom_bouton("avancer", Ide.evt.btn_avancer, "Avancer (F10)"));
//		btn = resultat.appendChild(this.dom_bouton("entrer", Ide.evt.btn_entrer, "Entrer (F11)"));
//		btn = resultat.appendChild(this.dom_bouton("sortir", Ide.evt.btn_sortir, "Sortir (Shift-F11)"));
		return resultat;
	}
	dom_vitesse(evts) {
		var resultat, label, input;
		resultat = document.createElement("div");
		resultat.classList.add("vitesse");
		label = resultat.appendChild(document.createElement("label"));
		label.innerHTML = "Vitesse";
		input = resultat.appendChild(document.createElement("input"));
        input.setAttribute("type", "range");
        input.setAttribute("min", "0");
        input.setAttribute("max", "11");
        input.setAttribute("step", ".5");
        input.setAttribute("value", this.prefs.vitesse);
        this._vitesse = input;
        input.obj = this;
        if (evts) {
            this.addEventListeners(input, evts);
        }
		return resultat;
	}
	dom_bouton(icon, evts, title) {
		var resultat;
		resultat = document.createElement("div");
		resultat.classList.add('bouton');
		resultat.classList.add(icon);
        resultat.obj = this;
        if (evts) {
            this.addEventListeners(resultat, evts);
        }
        if (title) {
            resultat.title = title;
        }
		return resultat;
	}
	dom_plan() {
		var section;
		section = document.createElement('section');
		section.setAttribute('id', 'plan');
		section.appendChild(this.dom_svg());
		return section;
	}
	dom_svg() {
		var w = 100;
		var h = w;
		this.svg = document.createElementNS(Main.ns.svg, 'svg');
		this.svg.setAttribute('version', '1.1');
//		this.svg.setAttribute('width', '100%');
//		this.svg.setAttribute('height', '100%');
		this.svg.setAttribute('viewBox', '-5,-5,'+(w+10)+','+(w+10)+'');
		this.svg.style.boxSizing = "border-box";
		this.svg.appendChild(this.dom_grille_pattern());
		this.svg.fond = this.svg.appendChild(document.createElementNS(Main.ns.svg, 'g'));
		this.svg.grille = this.svg.fond.appendChild(document.createElementNS(Main.ns.svg, 'rect'));
		this.svg.grille.setAttribute('width', w);
		this.svg.grille.setAttribute('height', h);
		this.svg.grille.setAttribute('fill', 'url(#grille)');
		this.svg.grille.style.display = "none";
		this.svg.grille.style.opacity = this.prefs.grille_opacity;
		this.svg.plan = this.svg.appendChild(document.createElementNS(Main.ns.svg, 'g'));
		this.svg.dessus = this.svg.appendChild(document.createElementNS(Main.ns.svg, 'g'));
        this.langage.curseur.ajouterDom(this.svg);
		return this.svg;
	}
    dom_grille_pattern() {
		var resultat, pattern, obj, couleur;
		couleur = "#999999";
		resultat = document.createElementNS(Main.ns.svg, 'defs');
		pattern = resultat.appendChild(document.createElementNS(Main.ns.svg, 'pattern'));
		pattern.setAttribute('id', 'sous-grille');
		pattern.setAttribute('x', '0');
		pattern.setAttribute('y', '0');
		pattern.setAttribute('width', '.1');
		pattern.setAttribute('height', '.1');
		obj = pattern.appendChild(document.createElementNS(Main.ns.svg, 'rect'));
		obj.setAttribute('x', '0');
		obj.setAttribute('y', '0');
		obj.setAttribute('width', '1');
		obj.setAttribute('height', '1');
		obj.setAttribute('fill', 'none');
		obj.setAttribute('stroke', couleur);
		obj.setAttribute('stroke-width', '.1');
		pattern = resultat.appendChild(document.createElementNS(Main.ns.svg, 'pattern'));
		pattern.setAttribute('id', 'grille');
		pattern.setAttribute('x', '0');
		pattern.setAttribute('y', '0');
		pattern.setAttribute('width', '10');
		pattern.setAttribute('height', '10');
		pattern.setAttribute('patternUnits', 'userSpaceOnUse');
		obj = pattern.appendChild(document.createElementNS(Main.ns.svg, 'rect'));
		obj.setAttribute('x', '0');
		obj.setAttribute('y', '0');
		obj.setAttribute('width', '10');
		obj.setAttribute('height', '10');
		obj.setAttribute('fill', 'url(#sous-grille)');
		obj.setAttribute('stroke', couleur);
		obj.setAttribute('stroke-width', '.25');
		return resultat;
	}
	menu_ouvrir() {
		var resultat, xhr;
		resultat = new Menu({obj:this, icon:"&#xe125;", label:"Ouvrir"});
		xhr = new XMLHttpRequest();
		xhr.obj = this;
		xhr.open("get", "app/back.php?lf");
		xhr.addEventListener("load", function () {
			var liste, i, n;
			liste = JSON.parse(this.responseText);
			for (i = 0, n = liste.length; i < n; i += 1) {
				resultat.add({
					obj:this.obj,
					class:"logo",
					icon: "B",
					label:liste[i],
					fic: liste[i],
					click:function () {
						this.obj.obj.charger(this.obj.fic);
					}
				});
			}
		});
		xhr.send(null);
		return resultat;
	}
	majPointeur(ligne) {
		var ptr;
        ptr = document.getElementById("pointeur");
		if (ptr) {
			ptr.removeAttribute("id");
		}
		ptr = document.querySelector(".ace_line:nth-child(" + ligne + ")");
		if (ptr) {
			ptr.setAttribute("id", "pointeur");
		}
        return this;
    }
	demarrer(callback) {
		this.langage.code = this.code;
		this.langage.demarrer(callback);
	}
	charger(fic) {
		var xhr;
		xhr = new XMLHttpRequest();
		xhr.obj = this;
		xhr.open("get", "codes/" + fic + ".logo");
		xhr.addEventListener("load", function () {
			if (this.status === 200) {
				this.obj.code = this.responseText;
			}
		});
		xhr.send(null);
	}
	static setEvents() {
		this.evt = {
            btn_effacer: {
                click: function () {
                    this.obj.langage.vide();
                }
            },
            btn_lire: {
                click: function () {
					var that = this;
                    if (this.obj.encours === undefined) {
                        this.obj.demarrer(function() {
                            that.classList.remove("actif");
                            that.obj.encours = undefined;
                        });
                    } else {
                        this.obj.svg.unpauseAnimations();
                    }
                    this.classList.add("actif");
                    this.obj.encours = true;
                }
            },
            btn_pause: {
                click: function () {
                    this.previousSibling.classList.remove("actif");
                    this.obj.svg.pauseAnimations();
                    this.obj.encours = false;
                }
            },
            btn_avancer: {
                click: function () {
                    alert("btn_avancer");
                }
            },
            btn_entrer: {
                click: function () {
                    alert("btn_entrer");
                }
            },
            btn_sortir: {
                click: function () {
                    alert("btn_sortir");
                }
            },
            mnu_grille: {
                click: function () {
					if (this.classList.contains("actif")) {
						this.obj.obj.grille = false;
						this.classList.remove("actif");
					} else {
						this.obj.obj.grille = true;
						this.classList.add("actif");
					}
                }
            },
            mnu_fic: {
                click: function () {
					var fic;
					fic = this.getAttribute("data-fic");
                }
            }
        };
	}
	static init() {
        this.langage = null; // Sera renseigné par le langage lui-même au chargement
		this.prototype.prefs = {
			vitesse: 8,
			grille_couleur: "#999999",
			grille_opacity: 0.2
		};
		this.setEvents();
	}
}
Ide.init();
