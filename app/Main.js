/*jslint esnext:true, browser: true,evil:true*/
class Main {
    addEventListener(object, name, fct) {
        if (object instanceof Array) {
            object.forEach((o)=>(this.addEventListener(o, name, fct)));
            return this;
        }
        if (name instanceof Array) {
            name.forEach((n)=>(this.addEventListener(object, n, fct)));
            return this;
        }
        name = name.split(",");
        if (name.length === 1){
            name = name[0];
        } else {
            return this.addEventListener(object, name, fct);
        }
        if (fct instanceof Array) {
            fct.forEach((f)=>(this.addEventListener(object, name, f)));
            return this;
        }
        object.addEventListener(name, fct);
        return this;
    }
    addEventListeners(object, evts) {
        var k;
        for (k in evts) {
            this.addEventListener(object, k, evts[k]);
        }
        return this;
    }
    static init() {
		this.ns = {
			svg: "http://www.w3.org/2000/svg",
			xlink: "http://www.w3.org/1999/xlink"
		};
        return this;
    }
    dom_anim(type, attributes) {
        var resultat, k;
        attributes = attributes || {};
        if (type.startsWith("transform_")) {
            resultat = document.createElementNS(Main.ns.svg, 'animateTransform');
            resultat.setAttribute('attributeName', 'transform');
            resultat.setAttribute('type', type.substr("transform_".length));
        } else {
            resultat = document.createElementNS(Main.ns.svg, 'animate');
            resultat.setAttribute('attributeName', type);
        }
		resultat.setAttribute('attributeType', 'XML');
		resultat.setAttribute('begin', 'indefinite');
		resultat.setAttribute('dur', '.5s');
		resultat.setAttribute('fill', 'freeze');
		resultat.setAttribute('accumulate', 'sum');
		resultat.setAttribute('calcMode', 'spline');
		resultat.setAttribute('keySplines', '0.4, 0, 0.2, 1');
//		resultat.setAttribute('keySplines', '1,0,0,1');
		resultat.setAttribute('keyTimes', '0;1');
        for (k in attributes) {
            resultat.setAttribute(k, attributes[k]);
        }
        return resultat;
	}
}
Main.init();

Object.defineProperties(Number.prototype, {
	precision: {
		value: function(d) {
			d = Math.pow(10,d);
			return Math.round(this*d)/d;
		}
	},
	sin: {
		value: function(mult) {
			mult = mult || 1;
			return Math.sin(this)*mult;
		}
	},
	cos: {
		value: function(mult) {
			mult = mult || 1;
			return Math.cos(this)*mult;
		}
	},
	tan: {
		value: function(mult) {
			mult = mult || 1;
			return Math.tan(this)*mult;
		}
	}
});
Object.defineProperties(Math, {
	TAU: {
		value: Math.PI * 2,
	},
	degRad: {
		value: function (deg) {
			return deg * Math.PIDeg;
		}
	},
	radDeg: {
		value: function (rad) {
			return rad / Math.PIDeg;
		}
	},
	sinDeg: {
		value: function(deg) {
			return Math.sin(Math.degRad(deg));
		}
	},
	cosDeg: {
		value: function(deg) {
			return Math.cos(Math.degRad(deg));
		}
	},
	PIDeg: {
		value: Math.PI / 180
	}
});
