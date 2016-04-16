# sexp-textgenscript-tsjs

Small S-expression based DSL for text generation.

# Rules

Elements are
* Text elements - renders "as is"
* Control atom - renders, and render subelements
* List - render and adds subelements

Examples:
* ("a" "b" "c") will be rendered to "abc"
* ("a" (("b") "c")) will be rendered to "abc", too

Control elements:
* #r - render random element of list. Example: ("a" (#r "b" "c")) will be rendered to "ab" or "ac" (randomly)
* #varSet - set var. Example: (#varSet "hero" "elf"). Or: (#varSet "hero" (#r "elf" "dwarf"))
* @\<var\> - render var. Example: ("The greatest hero, the " @hero " will come!")
* #ifVarEq - check var for equality. Example: (#ifVarEq "hero" "elf" ("Elf from forest moves silently..") ("Somebody UNKNOWN comes..."))

Live example here: http://d.janvarev.ru/sexp/textgenscript-html/

Russian version with a NUMBER of generators: http://janvarev.ru/TGen

