/// <reference path="SExpReader.ts" />
/// <reference path="SExpTextGenerator.ts" />
window.onload = function () {
    var el = document.getElementById('content');
    var sread = new SExpReader();
    var sgen = new SExpTextGenerator();
    var txtFrom = document.getElementById("txtFrom");
    var txtTo = document.getElementById("txtTo");
    var btn1 = document.getElementById("btnTo");
    btn1.onclick = function () {
        var ar = sread.parseSexp(txtFrom.value, true);
        //var ar2 = sgen.tgenInternalDemo(ar, new SExpTGenEnvironment());
        var ar2 = sgen.tgenInternal(ar, new SExpTGenEnvironment());
        /*
        var o: Object = {};
        o["__#r"] = "__#r2";
        var ar2 = sgen.sexpApplyVars(ar, o);
        */
        el.innerHTML = ar2;
    };
    var btn2 = document.getElementById("btnEstUnwrap");
    btn2.onclick = function () {
        var ar = sread.parseSexp(txtFrom.value, true);
        var ar2 = sgen.sgenUnwrapEstimate(ar);
        el.innerHTML = "<b>Estimated: " + ar2.toString() + " text(s)</b>";
    };
    var btn3 = document.getElementById("btnUnwrap");
    btn3.onclick = function () {
        var ar = sread.parseSexp(txtFrom.value, true);
        var ar2 = sgen.sgenUnwrapEstimate(ar);
        if (ar2 > 100000) {
            el.innerHTML = "<b>Estimated: " + ar2.toString() + " text(s)<br />We will not generate it; we don't want to freeze your browser :)</b>";
        }
        else {
            if (ar2 > 2000) {
                if (confirm("Nearly " + ar2.toString() + " texts will be generated; this may slow or freeze your browser. Continue?")) {
                    var ar3 = sgen.sgenUnwrap(ar);
                    el.innerHTML = ar3.join("<br />") + "<hr /><b>All: " + ar3.length + " texts</b>";
                }
                else {
                    el.innerHTML = "<b>Estimated: " + ar2.toString() + " text(s)</b>";
                }
            }
            else {
                var ar3 = sgen.sgenUnwrap(ar);
                el.innerHTML = ar3.join("<br />") + "<hr /><b>All: " + ar3.length + " texts</b>";
            }
        }
    };
};
//# sourceMappingURL=app.js.map