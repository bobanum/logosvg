/*jslint esnext:true, browser: true,evil:true*/
/*globals Main, Curseur*/
class Langage extends Main {
	constructor(ide) {
		super();
		this.patterns = null;
        this.ide = ide;
        this.curseur = new Curseur(this);
	}
	execPatt(nom, sujet, options) {
        options = options || "i";
        return new RegExp(this.patterns[nom], options).exec(sujet);
    }
	escape(str) {
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
	trouverValeur(variable, pile) {
		var ptr_pile;
		variable = variable.replace(":", "_");
		ptr_pile = pile;
		while (ptr_pile) {
			if (ptr_pile[variable]) {
				return this.evaluer(ptr_pile[variable]);
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
				} else if (fct === this._make) {
					ins = this.execPatt("make", instructions);
					instructions = instructions.substr(ins[0].length);
					instructions = ins[3].trimLeft() + instructions;
					cpt += ins[0].length - ins[3].trimLeft().length;
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
					params = params.replace(new RegExp("\\s*("+this.patterns.operateurs+")\\s*", "g"), "$1");
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
	patt_joindre(patt) {
		if (patt instanceof Array) {
            patt = patt.join("\\s*");
        }
        return patt;
	}
    patt_alternance(t) {
		return "(?:" + t.join("|") + ")";
    }
    patt_serie(element, mod) {
        mod=mod || "";
        return "(?:\\s+"+element+")"+mod;
    }
	creerPatterns() {
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
