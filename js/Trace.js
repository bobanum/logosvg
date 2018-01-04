/*jslint esnext:true, browser: true,evil:true*/
/*globals Point*/
class Trace extends Point {
	constructor(x, y) {
		super(x, y);
        this.ferme = false;
        this.etapes = [];
	}
    get dom() {
        if (!this._dom) {
            this._dom = this.dom_creer();
            this._dom.obj = this;
        }
        return this._dom;
    }
    get d() {
        return this.compiler();
    }
	get fill() {
		return this.dom.style.fill;
	}
	set fill(val) {
		this.dom.style.fill = val;
	}
	get stroke() {
		return this.dom.style.stroke;
	}
	set stroke(val) {
		this.dom.style.stroke = val;
	}
    maj() {
        this.dom.setAttribute('d', this.d);
	}
	dom_creer() {
		var resultat;
		resultat = document.createElementNS(Point.ns.svg, 'path');
        resultat.setAttribute("stroke-linejoin", "round");
        resultat.setAttribute("stroke-linecap", "round");
		return resultat;
    }
	retirer() {
		var dom = this.dom;
		if (dom.parentNode) {
			dom.parentElement.removeChild(dom);
		}
		return this;
	}
    ajouter(etape) {
        this.etapes.push(etape);
        return this;
    }
    anim(dep, dur, callback) {
        var attrs, anim;
        if (dur > 0) {
//            debugger;
			attrs = {
                "dur": dur + "ms",
                "from": this.compiler({type:"l", params:"0,0"}),
                "to": this.compiler(dep)
            };
            anim = this.dom.appendChild(this.dom_anim("d", attrs));
            anim.obj = this;
            anim.addEventListener("endEvent", function () {
                this.parentNode.removeChild(this);
            });
            anim.beginElement();
        }
        this.ajouter({type:"l", pt:this.clone(), dep:dep, params:dep.coords});
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
	compiler(extra) {
		var resultat, etapes, i, n;
        resultat = [];
        etapes = [{type:"M", params:this.coords}].concat(this.etapes);
        if (extra instanceof Point) {
			extra = {type:'l', params:extra.coords};
		}
		if (extra) {
            etapes = etapes.concat(extra);
        }
        if (this.ferme || (etapes.length > 2 && etapes.slice(-1)[0].params === etapes[0].params)) {
            etapes.push({type:"z"});
        }
		for (i = 0, n = etapes.length; i < n; i += 1) {
			let t = etapes[i];
            resultat.push(t.type);
			if (t.params !== undefined) {
                resultat = resultat.concat(t.params);
            } else if (t.dep !== undefined) {
                resultat = resultat.concat(t.dep.coords);
            }
		}
		return resultat.join(' ');
	}
}
Trace.init();
