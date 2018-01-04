/*jslint esnext:true, browser: true,evil:true*/
/*globals Point, Main*/
class Curseur extends Point {
	constructor(langage) {
		super();
		this.langage = langage;
        this.bas = false;
	}
	get code() {
		return this.pile;
	}
	set code(code) {
		this.pile = this.analyser(code);
	}
    get dom() {
        if (!this._dom) {
            this._dom = this.dom_creer();
            this._dom.obj = this;
        }
        return this._dom;
    }
	maj() {
        this.dom.setAttribute('transform', "translate(" + this.transform_translate + ")");
        this.dom.angle.setAttribute('transform', "rotate(" + this.transform_rotate + ")");
	}
    ajouterDom(svg) {
        svg.appendChild(this.dom_def());
        svg.dessus.appendChild(this.dom);
    }
	dom_creer() {
		var resultat;
		resultat = document.createElementNS(Main.ns.svg, 'g');
		resultat.setAttribute('id', 'curseur-visible');
		resultat.pos = resultat;
		resultat.angle = resultat.appendChild(document.createElementNS(Main.ns.svg, 'use'));
		resultat.angle.setAttributeNS(Main.ns.xlink, 'href', '#curseur');
		return resultat;
	}
	dom_def() {
		var resultat, g, path;
		resultat = document.createElementNS(Main.ns.svg, 'defs');
		g = resultat.appendChild(document.createElementNS(Main.ns.svg, 'g'));
		g.setAttribute("id", "curseur");
		g.setAttribute("transform", "rotate(90) scale(.1)");
		g.setAttribute("stroke-width", "0");
		path = g.appendChild(document.createElementNS(Main.ns.svg, 'path'));
		path.setAttribute("d", "m 0 -65 -18.5 10.4 v 21 l 5.4 3 -8.4 4.7 -13 -7.3 -13 7.3 v 14.7 l 13 7.3 v 9.5 l -13 7.3 v 14.7 l 13 7.3 13 -7.3 21.5 12.2 21.5 -12.1 13 7.3 13 -7.3 v -14.7 l -13 -7.3 v -9.5 l 13 -7.3 v -14.7 l -13 -7.3 -13 7.3 -8.4 -4.7 5.4 -3 v -21 z");
		path.style.fill = "#003300";
		path = g.appendChild(document.createElementNS(Main.ns.svg, 'path'));
		path.setAttribute("d", "m 16 12.7 5.5 3 v 6 l -19 10.7 v -12.3 z m -32 0 13.5 7.6 v 12.3 l -19 -10.7 v -6 z m 50.5 -1.4 l8 4.5 v 8.9 l -8 4.5 -8 -4.5 v -8.9 z m -69 0 8 4.5 v 8.9 l -8 4.5 -8 -4.5 v -8.9 z m 58.5 -21 5.5 3 v 15 l -5.5 3 -5.5 -3 v -15 z m -48 0 5.5 3 v 15 l -5.5 3 -5.5 -3 v -15 z m 58.5 -17.713 8 4.5 v 8.9 l -8 4.5 -8 -4.5 v -8.9 z m -69 0 8 4.5 v 8.9 l -8 4.5 -8 -4.5 v -8.9 z m 42.5 -0.3 13.5 7.6 v 6 l -5.5 3 -13.5 -7.6 v -6 z m -16 0 5.5 3 v 6 l -13.5 7.6 -5.5 -3 v -6 z m 8 -31.5 13.5 7.6 v 15 l -13.5 7.6 -13.5 -7.6 v -15 z");
		path.style.fill = "#008000";
		path = g.appendChild(document.createElementNS(Main.ns.svg, 'path'));
		path.setAttribute("d", "m 0 -14.7 13.5 7.6 v 15 l -13.5 7.6 -13.5 -7.6 v -15 l 13.5 -7.6 z");
		path.style.fill = "#008000";
		path.setAttribute("id", "pastille");
		this.pastille = path;
		this.def = resultat;
		return resultat;
	}
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
