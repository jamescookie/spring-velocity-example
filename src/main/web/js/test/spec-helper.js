var jsdom = require('mocha-jsdom');
global.pageGenerator = require("./page-generator.js");
global.unroll = require('unroll');
global.chai = require('chai');
global.sinon = require("sinon");
chai.use(require("chai-string"));
var responses;
var globalKeys;

before(function () {
    jsdom();
    global.expect = chai.expect;
});

beforeEach(function () {
    globalKeys = findGlobalKeys();
    responses = {};
    global.jQuery = global.$ = require('jquery');
    //work around for https://github.com/tmpvar/jsdom/issues/994
    jQuery.fn.show = function() {
        return this.css('display', 'block');
    };
    chai.use(require("chai-jquery"));
    chai.use(function (chai, utils, $) {
        var inspect = utils.inspect,
            flag = utils.flag;
        $ = $ || jQuery;
        chai.Assertion.overwriteProperty('visible', function (_super) {
            return function () {
                var obj = flag(this, 'object');
                if (obj instanceof $) {
                    this.assert(
                        isVisible(obj)
                        , 'expected ' + inspect(obj) + ' (or one of its parents) to be visible'
                        , 'expected ' + inspect(obj) + ' (or one of its parents) not to be visible');
                } else {
                    _super.apply(this, arguments);
                }
            };
        });
    });
    global.executionComplete = $.Deferred();
    var shouldSetDefaults = true;
    sinon.stub($, "ajax", function (options) {
        if (shouldSetDefaults) {
            setDefaultServerResponseTime();
            shouldSetDefaults = false;
        }
        if (options.beforeSend) {
            options.beforeSend();
        }
        completeAjaxCall(options);
    });
});

var completeAjaxCall = function (options) {
    var response = findResponse(options.url, options.type);
    setTimeout(function () {
        if (response.code < 400) {
            if (options.dataFilter && response.data) {
                response.data = options.dataFilter(JSON.stringify(response.data));
            }
            if (options.success) {
                options.success(response.data);
            }
        } else {
            if (options.error) {
                options.error(response.data);
            }
        }
        if (options.complete) {
            options.complete();
        }
        if (response.completeExecution) {
            executionComplete.resolve();
        }
    }, response.serverResponseTime);
};

afterEach(function () {
    $.ajax.restore();
    var mutatedGlobalKeys = Object.keys(global);
    var listToDelete = [];
    for(var i in mutatedGlobalKeys) {
        var key = mutatedGlobalKeys[i];
        if (!contains(globalKeys, key)) {
            listToDelete.push(key);
        }
    }
    for(var j in listToDelete) {
        if (!(delete global[listToDelete[j]])) {
            global[listToDelete[j]] = undefined;
        }
    }
});

var contains = function (a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
};

var findGlobalKeys = function() {
    var goodKeys = [];
    var keys = Object.keys(global);
    for(var i in keys) {
        var key = keys[i];
        if (global[key] !== undefined) {
            goodKeys.push(key);
        }
    }
    return goodKeys;
};

var setDefaultServerResponseTime = function () {
    for (var key in responses) {
        var response = responses[key];
        if (!response.serverResponseTime) {
            response.serverResponseTime = 1;
        }
    }
};

var findResponse = function (url, type) {
    var response = responses[url];
    expect(response, url + ' should have a response').to.exist;
    expect(response.type).to.equal(type);
    delete responses[url];
    if (Object.keys(responses).length === 0) {
        response.completeExecution = true;
    }
    return response;
};

global.givenResponse = function (response) {
    responses[response.url] = response;
};

global.isVisible = function(thing) {
    var visible = thing.length > 0  &&
            thing.is(':visible') &&
            thing.css('display') !== 'none',
        hasParent = thing.parents().length > 0;
    if (visible && thing.css('display') === '') {
        visible = !thing.hasClass('hide');
    }
    if (hasParent) {
        return visible && isVisible(thing.parent());
    } else {
        return visible;
    }
};

global.generate = function(model) {
    pageGenerator.generate('views/common.vm', model, ['/ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js'])
};