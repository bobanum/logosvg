/*jslint esnext:true, browser: true,evil:true*/
/*globals Point, Main*/
/**
 * Représente la tortue
 */

class Curseur extends Point {
	/**
	 * Constructeur
	 * @param {Language} langage Le langage qu'il doit suivre (todo: vérifier l'utilité)
	 */
	constructor(langage) {
		super();
		/**
		 * Le langage à suivre
		 * @type {Langage}
		 */
		this.langage = langage;
		/**
		 * xxx
		 * @type {boolean}
		 */
        this.bas = false;
	}
	/**
	 * La transformation
	 * @type {string}
	 */
	get transform() {
        return 'translate('+this.transform_translate+') rotate('+this.transform_rotate+')';
	}
	/**
	 * La valeur pour une translation du curseur
	 * @type {string}
	 */
	get transform_translate() {
        return ''+Math.round(this.x)+','+Math.round(this.y)+'';
	}
	/**
	 * La valeur pour une rotation du curseur
	 * @type {string}
	 */
	get transform_rotate() {
        return ''+this.aDeg+'';
//        return ''+this.aDeg+','+this.x+','+this.y+'';
	}
	/**
	 * La matrice pour le positionnement du curseur
	 * @type {string}
	 */
	get matrix() {
        var elements = [];
		elements.push(Math.cos(this.a));
		elements.push(Math.sin(this.a));
		elements.push(-Math.sin(this.a));
		elements.push(Math.cos(this.a));
		elements.push(Math.round(this.x));
		elements.push(Math.round(this.y));
		return ''+elements.join(",")+'';
	}
	/**
	 * Le code ??? ... todo voir pourquoi c'est là
	 * @type {string}
	 */
	get code() {
		return this.pile;
	}
	set code(code) {
		this.pile = this.analyser(code);
	}
	/**
	 * L'objet dom relié au curseur. Le crée au besoin
	 * @type {string}
	 */
	get dom() {
        if (!this._dom) {
            this._dom = this.dom_creer();
            this._dom.obj = this;
        }
        return this._dom;
    }
	/**
	 * Met à jour la position du curseur
	 */
	maj() {
        this.dom.setAttribute('transform', "translate(" + this.transform_translate + ")");
        this.dom.angle.setAttribute('transform', "rotate(" + this.transform_rotate + ")");
	}
    /**
     * Ajoute code svg au svg
     * @param {object} svg [[Description]]
     */
    ajouterDom(svg) {
        // Ajoute la définition du curseur
		svg.appendChild(this.dom_def());
		// Positionne le curseur sur le mon layer
        svg.dessus.appendChild(this.dom);
    }
	/**
	 * Crée et retourne le dom du curseur
	 * @returns {SVGElement} Le curseur
	 */
	dom_creer() {
		var resultat;
		// Le groupe est pour la position
		resultat = document.createElementNS(Main.ns.svg, 'g');
		resultat.setAttribute('id', 'curseur-visible');
		resultat.pos = resultat;
		// L'élément angle est pour la rotation
		resultat.angle = resultat.appendChild(document.createElementNS(Main.ns.svg, 'use'));
		resultat.angle.setAttributeNS(Main.ns.xlink, 'href', '#curseur');
		return resultat;
	}
	dom_def() {
		var resultat;
		resultat = document.createElementNS(Main.ns.svg, 'defs');
		resultat.appendChild(this.dom_tortue());
		this.def = resultat;
		return resultat;
	}
	dom_tortue() {
		var resultat, path;
		resultat = document.createElementNS(Main.ns.svg, 'g');
		resultat.setAttribute("id", "curseur");
		resultat.setAttribute("transform", "rotate(90) scale(.1)");
		resultat.setAttribute("stroke-width", "0");
		// Le contour de la tortue
		path = resultat.appendChild(document.createElementNS(Main.ns.svg, 'path'));
		path.setAttribute("d", "m 0 -65 -18.5 10.4 v 21 l 5.4 3 -8.4 4.7 -13 -7.3 -13 7.3 v 14.7 l 13 7.3 v 9.5 l -13 7.3 v 14.7 l 13 7.3 13 -7.3 21.5 12.2 21.5 -12.1 13 7.3 13 -7.3 v -14.7 l -13 -7.3 v -9.5 l 13 -7.3 v -14.7 l -13 -7.3 -13 7.3 -8.4 -4.7 5.4 -3 v -21 z");
		path.style.fill = "#003300";
		// Les hexagones
		path = resultat.appendChild(document.createElementNS(Main.ns.svg, 'path'));
		path.setAttribute("d", "m 16 12.7 5.5 3 v 6 l -19 10.7 v -12.3 z m -32 0 13.5 7.6 v 12.3 l -19 -10.7 v -6 z m 50.5 -1.4 l8 4.5 v 8.9 l -8 4.5 -8 -4.5 v -8.9 z m -69 0 8 4.5 v 8.9 l -8 4.5 -8 -4.5 v -8.9 z m 58.5 -21 5.5 3 v 15 l -5.5 3 -5.5 -3 v -15 z m -48 0 5.5 3 v 15 l -5.5 3 -5.5 -3 v -15 z m 58.5 -17.713 8 4.5 v 8.9 l -8 4.5 -8 -4.5 v -8.9 z m -69 0 8 4.5 v 8.9 l -8 4.5 -8 -4.5 v -8.9 z m 42.5 -0.3 13.5 7.6 v 6 l -5.5 3 -13.5 -7.6 v -6 z m -16 0 5.5 3 v 6 l -13.5 7.6 -5.5 -3 v -6 z m 8 -31.5 13.5 7.6 v 15 l -13.5 7.6 -13.5 -7.6 v -15 z");
		path.style.fill = "#008000";
		// La pastille au centre qui représente la couleur
		path = resultat.appendChild(document.createElementNS(Main.ns.svg, 'path'));
		path.setAttribute("d", "m 0 -14.7 13.5 7.6 v 15 l -13.5 7.6 -13.5 -7.6 v -15 l 13.5 -7.6 z");
		path.style.fill = "#008000";
		path.setAttribute("id", "pastille");
		this.pastille = path;
		return resultat;
	}
    /**
     * Démarre l'animation vers l'état final
     * @param   {object}   pt       Curseur dans son état final
     * @param   {[[Type]]} dur      [[Description]]
     * @param   {[[Type]]} callback [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    anim(pt, dur, callback) {
        var attrs, anim, aFin;
        if (dur > 0) {
            if (pt.a !== this.a) {
                aFin = this.aDeg + pt.aDeg;
                attrs = {
                    "dur": dur + "ms",
                    "from": this.transform_rotate,
                    "to": pt.transform_rotate
                };
                anim = this.dom.angle.appendChild(this.dom_anim("transform_rotate", attrs));
                anim.obj = this;
                anim.addEventListener("endEvent", function () {
                    this.parentNode.removeChild(this);
                });
				anim.beginElement();
			}
            if (this.distance(pt) !== 0) {
                attrs = {
                    "dur": dur + "ms",
                    "from": this.transform_translate,
                    "to": pt.transform_translate
                };
                anim = this.dom.appendChild(this.dom_anim("transform_translate", attrs));
                anim.obj = this;
                anim.addEventListener("endEvent", function () {
                    this.parentNode.removeChild(this);
                });
				anim.beginElement();
            }
        }
        this.placer(pt);
        this.maj();
        if (callback) {
            if (anim) {
                anim.addEventListener("endEvent", callback);
            } else {
                callback();
            }
        }
        return this;
    }
	static init() {
        return this;
	}
}
Curseur.init();
