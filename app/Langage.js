/*jslint esnext:true, browser: true,evil:true*/
/*globals Main, Point, Curseur, Trace*/
class Langage extends Main {
	constructor(ide) {
		super();
		this.parser = new Parser();
		this.creerPatterns();
        this.ide = ide;
        this.curseur = new Curseur(this);
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
	_make(callback/*, nom, expression*/) {
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
        if (this.bas) {
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
	get code() {
		return this.pile;
	}
	set code(code) {
		this.pile = this.parser.analyser(code);
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
		} else if (typeof instruction.fct === 'string') {
			this[instruction.fct].apply(this, params);
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
	creerPatterns() {
		this.parser.setPattern("identifiant", "[a-zA-Z][a-zA-z0-9_]*");
		this.parser.setPattern("entierPositif", "[0-9]+");
		this.parser.setPattern("nombre", "[\\+\\-]?(?:{entierPositif}(?:\\.{entierPositif})?|\\.{entierPositif})");
        return this;
	}
    static init() {
    }
}
Langage.init();
