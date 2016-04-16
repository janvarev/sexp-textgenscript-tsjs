/// <reference path="SExpReader.ts" />
class SExpTGenEnvironment {
    public objVars: any = {};
}

class SExpTextGenerator {

    public cons(a:any, as:any):any {
        return ([a].concat(as));
    } 
    
    public consIfNotNull(a: any, as: any): any {
        if (a != null) {
            return ([a].concat(as));
        }
        return as;
    }   

    public rest(a: any): any {
        var a2 = a.concat([]); // copy array
        a2.shift();
        return a2;
    }

    public sexpToPlainText(sexp: any): string {
        if (sexp instanceof Array) {
            if (sexp.length == 0) {
                return ""; // end of recursion
            } else {
                return "" + this.sexpToPlainText(sexp[0]) + this.sexpToPlainText(this.rest(sexp));
            }
        } else {
            return sexp.toString();
        }
    }

    public tgenInternal(sexp: any, env: SExpTGenEnvironment): string {
        var sexp2: any = this.sgenInternal(sexp, env);
        //return JSON.stringify(sexp2); - debug version
        return this.sexpToPlainText(sexp2);
    }

    public sexpApplyVars(sexp: any, vars: any):any  {
        if (sexp instanceof Array) {
            var ar: any[] = [];
            for (var i: number = 0; i < sexp.length; i++) {
                ar[i] = this.sexpApplyVars(sexp[i], vars);
            }
            return ar;
        } else {
            if (typeof sexp === "string") {
                if (vars[sexp] == null) {
                    return sexp;
                } else {
                    return vars[sexp];
                }
            } else {
                return sexp;
            }
        }
    }

    public sgenInternal(sexp: any, env: SExpTGenEnvironment): any {
        if (sexp instanceof Array) {
            if (sexp.length == 0) {
                return []; // end of recursion
            } else {
                var first: any = sexp[0];
                if (first instanceof Array) {
                    return this.consIfNotNull(this.sgenInternal(first, env), this.sgenInternal(this.rest(sexp), env));
                } else {
                    var s: string = first.toString();
                    if (s.substr(0, 3) == "__#") { // special construction
                        if (s == "__#r") {
                            var ar: any[] = this.rest(sexp);
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
                            var ar: any[] = env.objVars[sexp[1]];
                            var elem = ar[Math.floor(Math.random() * ar.length)];
                            return elem;
                        }
                        if (s == "__#ifVarEq") {
                            var el1 = env.objVars[sexp[1]];
                            var el2 = this.sgenInternal(sexp[2], env);
                            if (el1 == el2) {
                                return this.sgenInternal(sexp[3], env);
                            } else {
                                return this.sgenInternal(sexp[4], env);
                            }
                            
                        }
                    }
                    if (s.substr(0, 3) == "__@") { // special construction for compact var get
                        first = env.objVars[s.substr(3)];
                    }
                    return this.consIfNotNull(first, this.sgenInternal(this.rest(sexp), env));
                    
                }
            }
        } else { // just an atom
            return sexp;
        }
    }

    public tgenInternalDemo(sexp: any, env: SExpTGenEnvironment): string {
        if (sexp instanceof Array) { // список?
            if (sexp.length == 0) {
                return ""; // конец рекурсии - пустой список
            } else {
                var first: any = sexp[0];
                if (first instanceof Array) { // первый элемент - список?
                    return this.tgenInternalDemo(first, env) + // проводим над ним процедуру генерации
                            this.tgenInternalDemo(this.rest(sexp), env); // генерация над остатком списка (rest - все, кроме 1 элемента)
                } else {
                    var s: string = first.toString();
                    if (s.substr(0, 3) == "__#") { // нашли специальную конструкцию
                        if (s == "__#r") { // рандомный элемент из остатка
                            var ar: any[] = this.rest(sexp);
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
                            } else {
                                return this.tgenInternalDemo(sexp[4], env);
                            }
                       }
                    }
                    if (s.substr(0, 3) == "__@") { // переменная?
                        s = env.objVars[s.substr(3)];
                    }
                    return s + this.tgenInternalDemo(this.rest(sexp), env); // элемент + генерация над остатком списка 

                }
            }
        } else { // атом
            return sexp.toString();
        }
    }

    // unwraping code

    public sgenUnwrap(sexp: any): string[] {
        this.sgenUnwrapTemp = null;
        var sexp2 = this.sgenUnwrapTryFindR(sexp);
        var unwrap:any[] = this.sgenUnwrapTemp;
        if (unwrap === null) {
            return [(this.tgenInternal(sexp2, new SExpTGenEnvironment()))];
        } else {
            unwrap = this.sgenUnwrapTemp.concat([]); // copy array // for save, because sgenUnwrap will change in recursion
            var arRes: string[] = [];
            for (var i: number = 0; i < unwrap.length; i++) {
                var o: Object = {};
                o["__#unwrapReplace#"] = unwrap[i];
                var sexpCur = this.sexpApplyVars(sexp2, o);

                //arRes.concat(this.sgenUnwrap(sexpCur));
                var arRes2: string[] = this.sgenUnwrap(sexpCur);
                for (var j: number = 0; j < arRes2.length; j++) {
                    arRes.push(arRes2[j]);
                }
                //arRes.concat(["1","2"]);
                //arRes.push(JSON.stringify(sexpCur));
            }
            return arRes;
        }
    }

    public sgenUnwrapTemp: any = null;

    public sgenUnwrapTryFindR(sexp: any): any {
        if (sexp instanceof Array) {
            if (sexp.length == 0) {
                return []; // end of recursion
            } else {
                var first: any = sexp[0];
                if (first instanceof Array) {
                    return this.consIfNotNull(this.sgenUnwrapTryFindR(first), this.sgenUnwrapTryFindR(this.rest(sexp)));
                } else {
                    var s: string = first.toString();
                    if (s.substr(0, 3) == "__#") { // special construction
                        if (s == "__#r") {
                            if (this.sgenUnwrapTemp === null) {
                                var ar: any[] = this.rest(sexp);
                                //var elem = ar[Math.floor(Math.random() * ar.length)];
                                this.sgenUnwrapTemp = ar;
                                return "__#unwrapReplace#";
                            }
                        }
                    }
                    
                    return this.consIfNotNull(first, this.sgenUnwrapTryFindR(this.rest(sexp)));
                }
            }
        } else { // just an atom
            return sexp;
        }
    }

    public sgenUnwrapEstimate(sexp: any): number {
        if (sexp instanceof Array) {
            if (sexp.length == 0) {
                return 1; // end of recursion
            } else {
                var first: any = sexp[0];
                if (first instanceof Array) {
                    return this.sgenUnwrapEstimate(first) * this.sgenUnwrapEstimate(this.rest(sexp));
                } else {
                    var s: string = first.toString();
                    if (s.substr(0, 3) == "__#") { // special construction
                        if (s == "__#r") {
                            var ar: any[] = this.rest(sexp);
                            var res: number = 0;
                            for (var i: number = 0; i < ar.length; i++) {
                                res = res + this.sgenUnwrapEstimate(ar[i]);
                            }
                            return res;
                        }
                    }

                    return this.sgenUnwrapEstimate(first) * this.sgenUnwrapEstimate(this.rest(sexp));
                }
            }
        } else { // just an atom
            return 1;
        }
    }

}