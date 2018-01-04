/*jslint esnext:true, browser: true,evil:true*/
/*globals*/
class Parser {
	constructor() {
		this.commandes = {};
		this.patterns = {};
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
			return keyword;
		} else if (this.commandes[keyword]) {
			return this.commandes[keyword];
		} else {
			fct = null;
			ptr_pile = pile;
			while (!fct && ptr_pile) {
				if (ptr_pile["proc_" + keyword]) {
					return "proc_" + keyword;
				} else {
					ptr_pile = ptr_pile.contexte;
				}
			}
		}
		return fct;
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
			console.log(instructions.substr(0,20));
			if (ins = this.execPatt("appel", instructions.toLowerCase()), ins) {
				keyword = ins[1];
				fct = this.trouverFonction(keyword, pile);
				if (fct === "_to") {
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
				} else if (fct === "_repeat") {
					ins = this.execPatt("repete", instructions);
					instructions = instructions.substr(ins[0].length);
					cpt += ins[0].length;
					nm = parseFloat(ins[2]);
					nm = ins[2];
					l = this.analyser(instructions, pile);
					fct = this.trouverFonction(ins[1], pile);
					if (!fct) {
						throw 'Erreur';
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
				} else if (fct === "_make") {
					ins = this.execPatt("make", instructions);
					instructions = instructions.substr(ins[0].length);
					instructions = ins[3].trimLeft() + instructions;
					cpt += ins[0].length - ins[3].trimLeft().length;
					nm = parseFloat(ins[2]);
					nm = ins[2];
					l = this.analyser(instructions, pile);
					fct = this.trouverFonction(ins[1], pile);
					if (!fct) {
						throw 'Erreur';
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
					if (!fct) {
						throw 'Erreur';
					}
					instructions = instructions.substr(ins[0].length);
					instructions = ins[3].trimLeft() + instructions;
					cpt += ins[0].length - ins[3].trimLeft().length;
					params = ins[2];
					params = params.replace(new RegExp("\\s*("+this.patterns.operateurs+")\\s*", "g"), "$1");
					params = (params) ? params.split(/\s+/) : [];
					params.shift();
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
	setPattern(name, str) {
		var variable;
		if (str instanceof Array) {
			str = "(?:" + str.join("|") + ")";
		}
		while (variable = str.match(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/), variable) {
			str = str.replace(variable[0], this.patterns[variable[1]]);
		}
		this.patterns[name] = str;
		return str;
	}
    static init() {
    }
}
Parser.init();
