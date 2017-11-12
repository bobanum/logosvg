/*jslint esnext:true, browser: true,evil:true*/
/*globals Ide, Point, Trace, Langage*/
class Langage_Logo extends Langage {
	constructor(ide) {
		super(ide);
        this.creerPatterns();
		this.traces = [];
        this.trace = null;
		this.bas = false;
		this.modecourbe = false;
		this.pile = null;
        this.stroke = "black";
        this.fill = "none";
        this.strokeWidth = "3";
	}
	_to(callback) {
		console.log("fonction 'pour'", callback);
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
	_make(callback, nom, expression) {
		console.log("fonction 'make'", callback);
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
	creerPatterns() {
		if (!this.patterns) {
			super.creerPatterns();
		}
		this.patterns.variable = "\\:" + this.patterns.identifiant;
		this.patterns.make_variable = "\\\"" + this.patterns.identifiant;
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
        this.patterns.make = this.patt_joindre([
            "^",
            "("+this.patterns.identifiant+")",
            "\\s("+this.patterns.make_variable+")",
            "("+this.patterns.expression+")",
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
			'_make':			['make'],

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
			'_make':			['donne'],

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
	}
}
Langage_Logo.init();
Ide.langage = Langage_Logo;
