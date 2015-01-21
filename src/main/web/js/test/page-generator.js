var pageGenerator = function() {
    var VM_ROOT = '../resources/templates';
    var JS_ROOT = 'js/';
    var Velocity = require("velocityjs");
    var fs = require('fs');
    var vm = require("vm");
    var Parser = Velocity.Parser;
    var Compile = Velocity.Compile;
    var stack = [];
    var currentModel;
    var scriptRegex = /<script .*?src="(.*?)".*script>/g;

    function render(str, macros){
        var compile = new Compile(Parser.parse(str));
        currentModel = stack.pop();
//console.log("about to use:", currentModel);
        stack.push(currentModel);
        var rendered = compile.render(currentModel, macros);
        currentModel = stack.pop();
        return rendered;
    }

    function setCurrentModel(model) {
        stack.push($.extend({}, currentModel, model));
    }

    var readFile = function(fileName) {
        return fs.readFileSync(fileName, 'utf-8').toString();
    };

    var generateFragment = function (which, model) {
        currentModel = {};
        setCurrentModel(model);
        var macros = {};
        macros.parse = function(file) {
//            console.log("--PARSE--", file)
            var fileContents = readFile(VM_ROOT + '/' + file);
            stack.push(currentModel);
            return render(fileContents, macros);
        };

        return render(readFile(VM_ROOT + '/' + which), macros);
    };

    var findScripts = function(text, exclude) {
        var jsToLoad = [];

        var match = scriptRegex.exec(text);
        while (match != null) {
            var skip = false;
            if (exclude instanceof Array) {
                for (var i = 0; i < exclude.length; i++) {
                    if (match[1].indexOf(exclude[i]) !== -1) {
                        skip = true;
                        break;
                    }
                }
            }
            if (!skip) {
                jsToLoad.push(readFile(JS_ROOT + match[1]));
            }
            match = scriptRegex.exec(text);
        }

        return jsToLoad;
    };

    var runScripts = function(first, second) {
        var jsToRun = first.concat(second);
        for (var i in jsToRun) {
            try {
                vm.runInThisContext(jsToRun[i]);
            } catch (e) {
                console.log("Failed to load javascript: ", e)
            }
        }
    };

    var generate = function (which, model, exclude, preBodyScriptsHook) {
        var renderContents = generateFragment(which, model);
//console.log("got this->", renderContents)

        var head = /<head.*?>([\s\S]*)<\/head>/gm.exec(renderContents)[1];
        document.head.innerHTML = head.replace(scriptRegex, "");
        var body = /<body.*?>([\s\S]*)<\/body>/gm.exec(renderContents)[1];
        document.body.innerHTML = body.replace(scriptRegex, "");
        //todo add classes back to body?

        runScripts(findScripts(head, exclude), [$('head script').text()]);
        if (preBodyScriptsHook) preBodyScriptsHook();
        runScripts([$('body script').text()], findScripts(body, exclude));

        $.ready();
    };

    return {
        generate: generate,
        generateFragment: generateFragment,
        readFile: readFile
    };
};
module.exports = pageGenerator();
