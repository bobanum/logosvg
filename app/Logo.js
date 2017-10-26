/*jslint esnext:true, browser: true,evil:true*/
/*globals Point, Main, Trace, Curseur*/
class Langage extends Main {
	constructor(ide) {
		super();
        this.ide = ide;
        this.curseur = new Curseur(this);
	}
	get patterns() {
		return this.constructor.patterns;
	}
	execPatt(nom, sujet, options) {
        options = options || "i";
        return new RegExp(this.patterns[nom], options).exec(sujet);
    }
	static escape(str) {
		return str.split("").map((c)=>("\\" + c)).join("");
	}
    matchPatt(nom, sujet, options) {
        options = options || "gi";
        return sujet.match(new RegExp("(" + this.patterns[nom] + ")", options));
    }
 	get code() {
		return this.pile;
	}
	set code(code) {
		this.pile = this.analyser(code);
	}
	ajouterSynonyme(commande, synonyme) {
		if (synonyme instanceof Array) {
			synonyme.forEach((s)=>(this.commandes[s] = commande));
		} else {
			this.commandes[synonyme] = commande;
		}
		return this;
	}
	ajouterSynonymes(synonymes) {
		var k;
		for (k in synonymes) {
			this.ajouterSynonyme(k, synonymes[k]);
		}
		return this;
	}
	trouverFonction(keyword, pile) {
		var fct, ptr_pile;
		fct = null;
		if (this[keyword]) {
			fct = this[keyword];
		} else if (this.commandes[keyword]) {
			keyword = this.commandes[keyword];
			fct = this[keyword];
		} else {
			fct = null;
			ptr_pile = pile;
			while (!fct && ptr_pile) {
				if (ptr_pile["proc_" + keyword]) {
					fct = ptr_pile["proc_" + keyword];
				} else {
					ptr_pile = ptr_pile.contexte;
				}
			}
		}
		return fct;
	}
	trouverValeur(val, pile) {
		var ptr_pile;
		val = val.replace(":", "_");
		ptr_pile = pile;
		while (ptr_pile) {
			if (ptr_pile[val]) {
				return this.evaluer(ptr_pile[val]);
			} else {
				ptr_pile = ptr_pile.contexte;
			}
		}
		return null;
	}
	evaluer(val, pile) {
		var fct;
		if (typeof val !== 'string') {
			return val;
		}
		val = val.replace(/(\:[a-z]+)/ig, 'this.trouverValeur(\'$1\', pile)');
		fct = new Function('pile', 'return ' + val + ';');
		val = fct.call(this, pile);
		return val;
	}
	analyser(instructions, contexte) {
		var pile, cpt, ligne, ins, nom, params, l, nm, fct, keyword;
		pile = [];
		cpt = 0;
		pile.ligne = 0;
		if (contexte) {
			pile.contexte = contexte;
			pile.ligne = contexte.ligne;
		}
		while (instructions.length) {
			pile.ligne += 1;
			if (ins = this.execPatt("appel", instructions.toLowerCase()), ins) {
				keyword = ins[1];
				fct = this.trouverFonction(keyword, pile);
				if (fct === this._to) {
					ins = this.execPatt("pour", instructions);
					instructions = instructions.substr(ins[0].length);
					cpt += ins[0].length;
					nom = ins[2];
					params = this.matchPatt("variable", ins[3]) || [];
					l = this.analyser(instructions, pile);
					instructions = instructions.substr(l.length);
					pile["proc_" + nom] = {
						nom: nom,
						params: [params, l.pile],
						pile: l.pile,
						contexte: pile,
						ligne: pile.ligne
					};
					pile.ligne = l.ligne;
					cpt += l.length;
				} else if (fct === this._repeat) {
					ins = this.execPatt("repete", instructions);
					instructions = instructions.substr(ins[0].length);
					cpt += ins[0].length;
					nm = parseFloat(ins[2]);
					nm = ins[2];
					l = this.analyser(instructions, pile);
					fct = this.trouverFonction(ins[1], pile);
					if (!fct) {
						return 'Erreur';
					}
					instructions = instructions.substr(l.length);
					pile.push({
						nom: "repete",
						params: [nm, l.pile],
						pile: l.pile,
						fct: fct,
						contexte: pile,
						ligne: pile.ligne
					});
					pile.ligne = l.ligne;
					cpt += l.length;
				} else {
					instructions = instructions.substr(ins[0].length);
					instructions = ins[3].trimLeft() + instructions;
					cpt += ins[0].length - ins[3].trimLeft().length;
					params = ins[2];
					params = params.replace(new RegExp("\\s*("+Logo.patterns.operateurs+")\\s*", "g"), "$1");
					params = (params) ? params.split(/\s+/) : [];
					params.shift();
					if (!fct) {
						return 'Erreur';
					}
					pile.push({
						nom: keyword,
						params: params,
						fct: fct,
						contexte: pile,
						ligne: pile.ligne
					});
				}
			} else if (ins = this.execPatt("bloc_fin", instructions), ins) {
				instructions = instructions.substr(ins[0].length);
				instructions = ins[1].trimLeft() + instructions;
				cpt += ins[0].length - ins[1].trimLeft().length;
				return {
					length: cpt,
					pile: pile,
					ligne: pile.ligne
				};
			} else {
				return 'Erreur!';
			}
		}
		return {length: cpt, pile: pile, ligne: ligne};
	}
	demarrer(callback) {
		this.pile = this.pile.pile;
		this.executer(this.pile, callback);
	}
	executer(instructions, callback, idx) {
        idx = idx || 0;
		if (!instructions[idx]) {
			return callback();
		} else {
			this.executerInstruction(instructions[idx], () => this.executer(instructions, callback, idx+1));
		}
		return this;
	}
	executerInstruction(instruction, callback) {
		var that, params, nomsvars, i, n, nv;
		that = this;
		this.ide.majPointeur(instruction.ligne);
		params = instruction.params.map(function() {
			return that.evaluer(arguments[0], instruction.contexte);
		});
		params.unshift(callback);
		if (typeof instruction.fct === 'function') {
			instruction.fct.apply(this, params);
		} else {
			nomsvars = instruction.fct.params[0];
			for (i = 0, n = nomsvars.length; i < n; i++) {
				nv = nomsvars[i].replace(":", "_");
				instruction.fct.pile[nv] = instruction.params[i];
			}
			this.differer(instruction.fct.pile, 0, callback);
		}
		return this;
	}
	differer(instructions, idx, callback) {
		var instruction, that;
		idx = idx || 0;
		instruction = instructions[idx];
		if (!instruction) {
			return callback();
		}
		that = this;
		that.executerInstruction(instruction, function() {
			that.differer(instructions, idx+1, callback);
		});
	}
	static patt_joindre(patt) {
		if (patt instanceof Array) {
            patt = patt.join("\\s*");
        }
        return patt;
	}
    static patt_alternance(t) {
		return "(?:" + t.join("|") + ")";
    }
    static patt_serie(element, mod) {
        mod=mod || "";
        return "(?:\\s+"+element+")"+mod;
    }
	static creerPatterns() {
		this.patterns = {};
		this.patterns.identifiant = "[a-z][a-z0-9_]*";
		this.patterns.nombre = "[\\+\\-]?(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)";
		this.patterns.entierPositif = "[0-9]+";
        return this;
	}
    static init() {
    }
}
Langage.init();
class Logo extends Langage {
	constructor(ide) {
		super(ide);
		this.traces = [];
        this.trace = null;
		this.bas = false;
		this.modecourbe = false;
		this.pile = null;
        this.stroke = "black";
        this.fill = "none";
        this.strokeWidth = "3";
	}
	_setheading(callback, angle) {
		var dur, fin;
        fin = new Point();
        fin = fin.placer(this.curseur);
        fin._a = Math.degRad(angle);
		dur = Math.abs(angle) * this.ide.vitesse / 10;
        if (dur && dur < 20) { dur = 20; }
        this.curseur.anim(fin, dur, callback);
		return this;
	}
	_right(callback, angle) {
		var dur, fin;
        fin = new Point();
        fin = fin.placer(this.curseur);
        fin._a += Math.degRad(angle);
		dur = Math.abs(angle) * this.ide.vitesse / 10;
        if (dur && dur < 20) { dur = 20; }
        this.curseur.anim(fin, dur, callback);
		return this;
	}
	_left(callback, angle) {
		this._right(callback, -angle);
	}
	_forward(callback, d) {
		var dep, dur, fin;
        fin = new Point();
        fin = fin.placer(this.curseur);
        fin = fin.avancer(d);
		dur = Math.abs(d) * this.ide.vitesse;
        if (dur && dur < 20) { dur = 20; }

        // LA TRACE
        if (!this.bas) {
        } else {
            dep = this.curseur.deplacement(d);
            this.trace.anim(dep, dur);
        }
        this.curseur.anim(fin, dur, callback);
		return this;
	}
	_back(callback, d) {
		this._forward(callback, -d);
	}
	_pendown(callback) {
		if (!this.bas) {
            this.bas = true;
            this.trace = new Trace(this.curseur.x, this.curseur.y);
			this.trace.parent = this;
			this.trace.stroke = this.stroke;
			this.trace.fill = this.fill;
            this.ide.svg.plan.appendChild(this.trace.dom);
            this.traces.push(this.trace);
        }
		if (callback) {callback();}
        return this;
	}
	_penup(callback) {
		if (this.bas){
			this.bas = false;
		}
		if (callback) {callback();}
	}
	_repeat(callback, nombre, instructions) {
		if (!nombre) {
			return callback();
		}
		var that = this;
		this.differer(instructions, 0, function(){
			that._repeat(callback, nombre-1, instructions);
		});
	}
	_hideturtle(callback) {
		this.curseur.dom.style.display = 'none';
		callback();
	}
	_showturtle(callback) {
		this.curseur.dom.style.display = '';
		callback();
	}
	_clearscreen(callback) {
		var bas = this.bas;
		if (bas) {
			this._penup();
		}
		while (this.traces.length) {
			this.traces.pop().retirer();
		}
		this.trace = null;
		if (bas) {
			this._pendown();
		}
		if (callback) {callback();}
	}
	_to(callback) {
		console.log("fonction 'pour'", callback);
	}
	_setpencolor(callback, r, g, b) {
		var bas = this.bas;
		if (bas) {
			this._penup();
		}
		this.stroke = "rgb(" + r + "," + g + "," + b + ")";
		this.curseur.pastille.style.fill = "rgb(" + r + "," + g + "," + b + ")";
		if (bas) {
			this._pendown();
		}
		if (callback) {callback();}
	}
	_setscreencolor(callback, r, g, b) {
		this.fond = "rgb(" + r + "," + g + "," + b + ")";
		this.ide.svg.style.backgroundColor = this.fond;
		if (callback) {callback();}
	}
	_fill(callback, r, g, b) {
		this.fill = "rgb(" + r + "," + g + "," + b + ")";
		this.trace.ferme = true;
		this.trace.dom.style.fill = this.fill;
		if (callback) {callback();}
	}
	static creerPatterns() {
		super.creerPatterns();
		this.patterns.variable = "\\:" + this.patterns.identifiant;
		this.patterns.valeur = this.patt_alternance([this.patterns.variable, this.patterns.nombre]);
		this.patterns.operateurs = "(?:" + ["+", "-", "*", "/", "%"].map(this.escape).join("|") + ")";
		this.patterns.expression = this.patterns.valeur+"(?:\\s*"+this.patterns.operateurs+"\\s*"+this.patterns.valeur+")*";
		this.patterns.paramsPour = this.patt_serie(this.patterns.variable);
		this.patterns.paramsAppel = this.patt_serie(this.patterns.expression);
		this.patterns.finInstruction = this.patt_alternance(["\\s+","$","\\)","\\]","\\}"]);
        this.patterns.repete = this.patt_joindre([
            "^",
            "("+this.patterns.identifiant+")",
            "\\s("+this.patterns.expression+")",
            "\\[",
            ""
        ]);
        this.patterns.pour = this.patt_joindre([
            "^",
            "("+this.patterns.identifiant+")",
            "\\s("+this.patterns.identifiant+")",
            "("+this.patterns.paramsPour+"*)",
            "\\[",
            ""
        ]);
        this.patterns.appel = this.patt_joindre([
            "^",
            "("+this.patterns.identifiant+")("+this.patterns.paramsAppel+"*)",
            "("+this.patterns.finInstruction+")"
        ]);
        this.patterns.bloc_fin = this.patt_joindre([
            "^",
            "\]",
            "("+this.patterns.finInstruction+")"
        ]);
	}
	static init() {
		this.prototype.commandes = {};
		this.prototype.ajouterSynonymes({
			'_forward':			['forward', 'fd'],
			'_back':			['back', 'bk'],
			'_left':			['left', 'lf'],
			'_right':			['right', 'rt'],
			'_hideturtle':		['hideturtle', 'ht', 'hide'],
			'_showturtle':		['showturtle', 'st', 'show'],
			'_clearscreen':		['clearscreen', 'cs'],
			'_to':				['to'],
			'_repeat':			['repeat'],
			'_setheading':		['setheading', 'seth'],
			'_setpencolor':		['setpencolor', 'setpencolour', 'setpc'],
			'_setscreencolor':	['setscreencolor', 'setscreencolour', 'setbackground', 'setsc', 'setbg'],
			'_fill':			['fill'],

			'_penup':			['penup', 'pu'],
			'_pendown':			['pendown', 'pd']
		});
		this.prototype.ajouterSynonymes({
			'_forward':			['avance', 'av'],
			'_back':			['recule', 're'],
			'_left':			['tg', 'tournegauche', 'ga', 'gauche'],
			'_right':			['td', 'tournedroite', 'dr', 'droite'],
			'_hideturtle':		['ct', 'cachetortue', 'cache'],
			'_showturtle':		['mt', 'montretortue', 'montre'],
			'_clearscreen':		['ve', 'videecran', 'vide'],
			'_to':				['pour'],
			'_repeat':			['repete'],
			'_setheading':		['fixecap', 'fcap'],
			'_setpencolor':		['fixecouleurcrayon', 'fcc'],
			'_setscreencolor':	['fixecouleurfond', 'fcf'],
			'_fill':			['remplir'],

			'_penup':			['lc', 'levecrayon', 'leve'],
			'_pendown':			['bc', 'baissecrayon', 'baisse']
		});
		this.prototype.zzcommandes = {
			//'couleur':'couleur',
			//'cc':'couleur',
			//'pos':'pos',
			//'fpos':'fpos',
			//'cb':'cb',
			//'cf':'',
			//'fcf':'',
			//'':'',
			//'':'',
			//'':'',
			//'':'',
			//'':'',
		};
        this.creerPatterns();
	}
}
Logo.init();
