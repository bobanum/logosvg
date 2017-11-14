/*jslint esnext:true, browser: true,evil:true*/
/*globals Ide, Langage, Parser*/
class Langage_Logo extends Langage {
	constructor(ide) {
		super(ide);
		this.parser.ajouterSynonymes({
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
		this.parser.ajouterSynonymes({
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
//        this.creerPatterns();
		this.traces = [];
        this.trace = null;
		this.bas = false;
		this.modecourbe = false;
		this.pile = null;
        this.stroke = "black";
        this.fill = "none";
        this.strokeWidth = "3";
	}
	creerPatterns() {
		super.creerPatterns();
		this.parser.setPattern("variable", "\\:{identifiant}");
		this.parser.setPattern("make_variable", "\\\"{identifiant}");
		this.parser.setPattern("valeur", ["{variable}", "{nombre}"]);
		this.parser.setPattern("operateurs", "(?:" + ["+", "-", "*", "/", "%"].map(this.parser.escape).join("|") + ")");
		this.parser.setPattern("expression", "{valeur}(?:\\s*{operateurs}\\s*{valeur})*");
		this.parser.setPattern("paramsPour", this.parser.patt_serie("{variable}"));
		this.parser.setPattern("paramsAppel", this.parser.patt_serie("{expression}"));
		this.parser.setPattern("finInstruction", ["\\s+","$","\\)","\\]","\\}"]);
        this.parser.setPattern("repete", this.parser.patt_joindre([
            "^",
            "({identifiant})",
            "\\s({expression})",
            "\\[",
            ""
        ]));
        this.parser.setPattern("make", this.parser.patt_joindre([
            "^",
            "({identifiant})",
            "\\s({make_variable})",
            "({expression})",
            ""
        ]));
        this.parser.setPattern("pour", this.parser.patt_joindre([
            "^",
            "({identifiant})",
            "\\s({identifiant})",
            "({paramsPour}*)",
            "\\[",
            ""
        ]));
        this.parser.setPattern("appel", this.parser.patt_joindre([
            "^",
            "({identifiant})({paramsAppel}*)",
            "({finInstruction})"
        ]));
        this.parser.setPattern("bloc_fin", this.parser.patt_joindre([
            "^",
            "\]",
            "({finInstruction})"
        ]));
	}
	static init() {
	}
}
Langage_Logo.init();
Ide.langage = Langage_Logo;
