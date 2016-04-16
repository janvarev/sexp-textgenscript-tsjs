/// <reference path="SExpReader.ts" />
var SExpTGenEnvironment = (function () {
    function SExpTGenEnvironment() {
        this.objVars = {};
    }
    return SExpTGenEnvironment;
})();
var SExpTextGenerator = (function () {
    function SExpTextGenerator() {
        this.sgenUnwrapTemp = null;
    }
    SExpTextGenerator.prototype.cons = function (a, as) {
        return ([a].concat(as));
    };
    SExpTextGenerator.prototype.consIfNotNull = function (a, as) {
        if (a != null) {
            return ([a].concat(as));
        }
        return as;
    };
    SExpTextGenerator.prototype.rest = function (a) {
        var a2 = a.concat([]); // copy array
        a2.shift();
        return a2;
    };
    SExpTextGenerator.prototype.sexpToPlainText = function (sexp) {
        if (sexp instanceof Array) {
            if (sexp.length == 0) {
                return ""; // end of recursion
            }
            else {
                return "" + this.sexpToPlainText(sexp[0]) + this.sexpToPlainText(this.rest(sexp));
            }
        }
        else {
            return sexp.toString();
        }
    };
    SExpTextGenerator.prototype.tgenInternal = function (sexp, env) {
        var sexp2 = this.sgenInternal(sexp, env);
        //return JSON.stringify(sexp2); - debug version
        return this.sexpToPlainText(sexp2);
    };
    SExpTextGenerator.prototype.sexpApplyVars = function (sexp, vars) {
        if (sexp instanceof Array) {
            var ar = [];
            for (var i = 0; i < sexp.length; i++) {
                ar[i] = this.sexpApplyVars(sexp[i], vars);
            }
            return ar;
        }
        else {
            if (typeof sexp === "string") {
                if (vars[sexp] == null) {
                    return sexp;
                }
                else {
                    return vars[sexp];
                }
            }
            else {
                return sexp;
            }
        }
    };
    SExpTextGenerator.prototype.sgenInternal = function (sexp, env) {
        if (sexp instanceof Array) {
            if (sexp.length == 0) {
                return []; // end of recursion
            }
            else {
                var first = sexp[0];
                if (first instanceof Array) {
                    return this.consIfNotNull(this.sgenInternal(first, env), this.sgenInternal(this.rest(sexp), env));
                }
                else {
                    var s = first.toString();
                    if (s.substr(0, 3) == "__#") {
                        if (s == "__#r") {
                            var ar = this.rest(sexp);
                            var elem = ar[Math.floor(Math.random() * ar.length)];
                            return this.sgenInternal(elem, env);
                        }
                        if (s == "__#varGet") {
                            return env.objVars[sexp[1]];
                        }
                        if (s == "__#varSet") {
                            env.objVars[sexp[1]] = this.sgenInternal(sexp[2], env);
                            return null;
                        }
                        if (s == "__#rvarGet") {
                            var ar = env.objVars[sexp[1]];
                            var elem = ar[Math.floor(Math.random() * ar.length)];
                            return elem;
                        }
                        if (s == "__#ifVarEq") {
                            var el1 = env.objVars[sexp[1]];
                            var el2 = this.sgenInternal(sexp[2], env);
                            if (el1 == el2) {
                                return this.sgenInternal(sexp[3], env);
                            }
                            else {
                                return this.sgenInternal(sexp[4], env);
                            }
                        }
                    }
                    if (s.substr(0, 3) == "__@") {
                        first = env.objVars[s.substr(3)];
                    }
                    return this.consIfNotNull(first, this.sgenInternal(this.rest(sexp), env));
                }
            }
        }
        else {
            return sexp;
        }
    };
    SExpTextGenerator.prototype.tgenInternalDemo = function (sexp, env) {
        if (sexp instanceof Array) {
            if (sexp.length == 0) {
                return ""; // конец рекурсии - пустой список
            }
            else {
                var first = sexp[0];
                if (first instanceof Array) {
                    return this.tgenInternalDemo(first, env) +
                        this.tgenInternalDemo(this.rest(sexp), env); // генерация над остатком списка (rest - все, кроме 1 элемента)
                }
                else {
                    var s = first.toString();
                    if (s.substr(0, 3) == "__#") {
                        if (s == "__#r") {
                            var ar = this.rest(sexp);
                            var elem = ar[Math.floor(Math.random() * ar.length)];
                            return this.tgenInternalDemo(elem, env);
                        }
                        if (s == "__#varSet") {
                            env.objVars[sexp[1]] = this.tgenInternalDemo(sexp[2], env);
                            return "";
                        }
                        if (s == "__#ifVarEq") {
                            var el1 = env.objVars[sexp[1]];
                            var el2 = this.tgenInternalDemo(sexp[2], env);
                            if (el1 == el2) {
                                return this.tgenInternalDemo(sexp[3], env);
                            }
                            else {
                                return this.tgenInternalDemo(sexp[4], env);
                            }
                        }
                    }
                    if (s.substr(0, 3) == "__@") {
                        s = env.objVars[s.substr(3)];
                    }
                    return s + this.tgenInternalDemo(this.rest(sexp), env); // элемент + генерация над остатком списка 
                }
            }
        }
        else {
            return sexp.toString();
        }
    };
    // unwraping code
    SExpTextGenerator.prototype.sgenUnwrap = function (sexp) {
        this.sgenUnwrapTemp = null;
        var sexp2 = this.sgenUnwrapTryFindR(sexp);
        var unwrap = this.sgenUnwrapTemp;
        if (unwrap === null) {
            return [(this.tgenInternal(sexp2, new SExpTGenEnvironment()))];
        }
        else {
            unwrap = this.sgenUnwrapTemp.concat([]); // copy array // for save, because sgenUnwrap will change in recursion
            var arRes = [];
            for (var i = 0; i < unwrap.length; i++) {
                var o = {};
                o["__#unwrapReplace#"] = unwrap[i];
                var sexpCur = this.sexpApplyVars(sexp2, o);
                //arRes.concat(this.sgenUnwrap(sexpCur));
                var arRes2 = this.sgenUnwrap(sexpCur);
                for (var j = 0; j < arRes2.length; j++) {
                    arRes.push(arRes2[j]);
                }
            }
            return arRes;
        }
    };
    SExpTextGenerator.prototype.sgenUnwrapTryFindR = function (sexp) {
        if (sexp instanceof Array) {
            if (sexp.length == 0) {
                return []; // end of recursion
            }
            else {
                var first = sexp[0];
                if (first instanceof Array) {
                    return this.consIfNotNull(this.sgenUnwrapTryFindR(first), this.sgenUnwrapTryFindR(this.rest(sexp)));
                }
                else {
                    var s = first.toString();
                    if (s.substr(0, 3) == "__#") {
                        if (s == "__#r") {
                            if (this.sgenUnwrapTemp === null) {
                                var ar = this.rest(sexp);
                                //var elem = ar[Math.floor(Math.random() * ar.length)];
                                this.sgenUnwrapTemp = ar;
                                return "__#unwrapReplace#";
                            }
                        }
                    }
                    return this.consIfNotNull(first, this.sgenUnwrapTryFindR(this.rest(sexp)));
                }
            }
        }
        else {
            return sexp;
        }
    };
    SExpTextGenerator.prototype.sgenUnwrapEstimate = function (sexp) {
        if (sexp instanceof Array) {
            if (sexp.length == 0) {
                return 1; // end of recursion
            }
            else {
                var first = sexp[0];
                if (first instanceof Array) {
                    return this.sgenUnwrapEstimate(first) * this.sgenUnwrapEstimate(this.rest(sexp));
                }
                else {
                    var s = first.toString();
                    if (s.substr(0, 3) == "__#") {
                        if (s == "__#r") {
                            var ar = this.rest(sexp);
                            var res = 0;
                            for (var i = 0; i < ar.length; i++) {
                                res = res + this.sgenUnwrapEstimate(ar[i]);
                            }
                            return res;
                        }
                    }
                    return this.sgenUnwrapEstimate(first) * this.sgenUnwrapEstimate(this.rest(sexp));
                }
            }
        }
        else {
            return 1;
        }
    };
    return SExpTextGenerator;
})();
//# sourceMappingURL=SExpTextGenerator.js.map