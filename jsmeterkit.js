/**
 * Created by Sagifire on 21.04.14.
 */



var JSM = {
    version: '0.4 Alpha',

    /*TYPE_FAST_TIME: 0,
    TYPE_BIGEST_COUNT: 1,*/

    project: {},
    settings: {},
    config: {
    },

    //service API
    extend: function(source, mixin) {
        if ("object" === typeof(mixin) || "object" === typeof(source)) {
            for (var key in mixin) {
                if(!mixin.hasOwnProperty(key))
                    continue;
                var typeOfSourceKey = typeof(source[key]);
                var typeOfMixinKey = typeof(mixin[key]);
                if ("undefined" === typeOfSourceKey) {
                    source[key] = mixin[key];
                    continue;
                }
                if (source[key] === mixin[key])
                    continue;

                if (mixin[key] instanceof Array && source[key] instanceof Array) {
                    source[key] = source[key].concat(mixin[key]);
                    continue;
                }
                if ("object" === typeOfMixinKey && "object" == typeOfSourceKey) {
                    this.extend(source[key], mixin[key]);
                    continue;
                }
                source[key] = mixin[key];
            }
        } else {
            throw new Error("JSM.extend() : arguments must be an object!");
        }
        return this;
    },
    applyConfig: function(config) {
        this.extend(this.config, config);
    },
    include: function(src, onLoad, onError) {
        var scriptTag = document.createElement('script');
        scriptTag.src = src;
        scriptTag.onload = onLoad;
        scriptTag.onerror = onError;
        document.head.appendChild(scriptTag);
    },
    includeList: function(list, onLoad, onError) {
        var workerScope = {
            progress: 0,
            needFiles: list.length,
            hasError: false,
            onload: onLoad,
            onerror: onError
        }

        for(var i = 0; i < list.length; i++) {
            this.include(
                list[i],
                jsmCreateScopeFunction(function(){
                    this.progress++;
                    if(this.progress>=this.needFiles) {
                        if (this.hasError) {
                            this.onerror();
                        } else {
                            this.onload();
                        }
                    }
                }, workerScope),
                jsmCreateScopeFunction(function(){
                    this.hasError = true;
                    this.progress++;
                    if(this.progress>=this.needFiles)
                        this.onerror();
                }, workerScope));
        }
    },

    init: function(config) {
        JSM.debug = new JSMDebug(true);
        JSM.client = new JSMClient();
        this.extend(this.config, config);
        if (this.ui.readyToInit) {
            this.ui.init();
        }
    },

    testBrowserFeatures: function() {
        var retStatus = true;
        var errorString = '';
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            retStatus = false;
            errorString = e.message;
        }

        if (!retStatus) {
            this.ui.statusBar.showMessage(this._('loc-browser-not-compatible'), this.ui.statusBar.STATE_ERROR, 0);
        }

        return retStatus;
    },
    _: function(key) {
        var ret = key;
        if ('undefined' !== typeof(this.config.currentLocale)) {
            if ('undefined' !== typeof(this.config.currentLocale[key])) {
                ret = this.config.currentLocale[key];
            }
        }
        return ret;
    }/*,

    // functional API

    run: function(config) {

    },
    test: function(alias, config, callback) {

    },
    //report API
    showReport: function(alias, containerElement) {

    },
    consoleReport: function(alias) {

    },
    resetReports: function() {

    },
    resetReport: function(alias) {

    }*/
}