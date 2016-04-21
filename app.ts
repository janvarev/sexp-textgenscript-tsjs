/// <reference path="SExpReader.ts" />
/// <reference path="SExpTextGenerator.ts" />

window.onload = () => {
    var el = document.getElementById('content');
    
    var sread: SExpReader = new SExpReader();
    var sgen: SExpTextGenerator = new SExpTextGenerator();
   
    var txtFrom: HTMLTextAreaElement = document.getElementById("txtFrom") as HTMLTextAreaElement;
    var txtTo: HTMLTextAreaElement = document.getElementById("txtTo") as HTMLTextAreaElement;

    function genTextNumTimes(num: number) {
        var ar = sread.parseSexp(txtFrom.value, true);

        var ar2: string[] = [];
        for (var i: number = 0; i < num; i++) {
            ar2.push(sgen.tgenInternal(ar, new SExpTGenEnvironment()));
        }

        el.innerHTML = ar2.join("<br />");

        /* demo of sexpApplyVars
        var o: Object = {};
        o["__#r"] = "__#r2";
        var ar2 = sgen.sexpApplyVars(ar, o);
        */
    }

    var btn1 = document.getElementById("btnTo");
    btn1.onclick = function () {
        genTextNumTimes(1);
    }

    document.getElementById("btn20").onclick = function () {
        genTextNumTimes(20);
    }

    document.getElementById("btn100").onclick = function () {
        genTextNumTimes(100);
    }

    var btn2 = document.getElementById("btnEstUnwrap");
    btn2.onclick = function () {
        var ar = sread.parseSexp(txtFrom.value, true);
        var ar2 = sgen.sgenUnwrapEstimate(ar);

        el.innerHTML = "<b>Estimated: " + ar2.toString() + " text(s)</b>";
    }

    var btn3 = document.getElementById("btnUnwrap");
    btn3.onclick = function () {
        var ar = sread.parseSexp(txtFrom.value, true);
        var ar2 = sgen.sgenUnwrapEstimate(ar);

        if (ar2 > 100000) {
            el.innerHTML = "<b>Estimated: " + ar2.toString() + " text(s)<br />We will not generate it; we don't want to freeze your browser :)</b>";
        } else {
            if (ar2 > 2000) {
                if (confirm("Nearly " + ar2.toString() + " texts will be generated; this may slow or freeze your browser. Continue?")) {
                    var ar3 = sgen.sgenUnwrap(ar);
                    el.innerHTML = ar3.join("<br />") + "<hr /><b>All: " + ar3.length + " texts</b>";
                } else {
                    el.innerHTML = "<b>Estimated: " + ar2.toString() + " text(s)</b>";
                }
            } else {
                var ar3 = sgen.sgenUnwrap(ar);
                el.innerHTML = ar3.join("<br />") + "<hr /><b>All: " + ar3.length + " texts</b>";
            }
        }

        
    }
    

};

