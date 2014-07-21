/**
 * Created by Sagifire on 24.06.14.
 */

function JSMDebug (DEBUG_MODE) {
    this.MARK_TYPE = 0;
    this.WARNING_TYPE = 1;
    this.ERROR_TYPE = 2;

    var NTA = window.performance || {};
    /*this.accurateNow = NTA.now    ||
        NTA.webkitNow     ||
        NTA.msNow         ||
        NTA.oNow          ||
        NTA.mozNow        ||
        function() { return undefined; };*/

    this.accurateNow = (NTA.now) ? function () { return NTA.now } :
        (NTA.webkitNow) ? function () { return NTA.webkitNow } :
            (NTA.msNow) ? function () { return NTA.msNow } :
                (NTA.oNow) ? function () { return NTA.oNow } :
                    (NTA.mozNow) ? function () { return NTA.mozNow } :
                        function() { return undefined; }

    this.profile = {
        /*
        items structure:
            {
                id: identificator string,
                description: description string,
                timestamp: numeric datetime in milliseconds,
                strict: strict time if supporting,
                profile: profile info if support,
                data: user data
            }
        */
        items: []
    };

    this.getProfileInfo = function() {
        var profile = {};

        try {
            throw new Error();
        } catch (E) {
            profile.stack = (E.stack) ? E.stack : [];
        }

        return profile;
    }

    this.ASSERT_WARNING = function(test, warning, data) {
        if (test) return true;

        this.profile.items.push({
            type: this.WARNING_TYPE,
            id: 'assert warning',
            description: warning,
            accurate: this.accurateNow(),
            timestamp: Date.now(),
            profile: undefined,
            data: data
        });

        if ('function' === typeof(console.log)) {
            console.log('ASSERT warning: ', error, data);
        }

        return false;
    }

    this.ASSERT_PACIFIC = function(test, error, data) {
        if (test) return true;

        this.profile.items.push({
            type: this.ERROR_TYPE,
            id: 'assert error',
            description: error,
            accurate: this.accurateNow(),
            timestamp: Date.now(),
            profile: undefined,
            data: data
        });

        if ('function' === typeof(console.log)) {
            console.log('ASSERT error: ', error, data);
        }

        return false;
    };

    this.ASSERT_FORCE = function(test, error, data) {
        if (test) return true;

        this.profile.items.push({
            type: this.ERROR_TYPE,
            id: 'assert error',
            description: error,
            accurate: this.accurateNow(),
            timestamp: Date.now(),
            profile: this.getProfileInfo(),
            data: data
        });

        throw new Error(error);
    };

    this.ASSERT_TYPE_PACIFIC = function(value, type, error, data) {
        if (Object.prototype.toString.call(value) === type) return true;

        this.profile.items.push({
            type: this.ERROR_TYPE,
            id: 'assert type error',
            description: error,
            accurate: this.accurateNow(),
            timestamp: Date.now(),
            profile: undefined,
            data: data
        });

        if ('function' === typeof(console.log)) {
            console.log('ASSERT_TYPE error: ', error, data);
        }

        return false;
    };

    this.ASSERT_TYPE_FORCE = function(value, type, error, data) {
        if (Object.prototype.toString.call(value) === type) return true;

        this.profile.items.push({
            type: this.ERROR_TYPE,
            id: 'assert type error',
            description: error,
            accurate: this.accurateNow(),
            timestamp: Date.now(),
            profile: this.getProfileInfo(),
            data: data
        });

        throw new Error(error);
    };

    this.ASSERT_VALIDATION_PACIFIC = function(value, schema, error, data) {
        var status = jsmObjectValidate(value, schema);
        if (status.valid) return true;

        var validationError = status.path + ': ' + status.message;
        var description = ('undefined' === typeof(error)) ? validationError : error.replace('%%', validationError);

        this.profile.items.push({
            type: this.ERROR_TYPE,
            id: 'assert validation error',
            description: description,
            accurate: this.accurateNow(),
            timestamp: Date.now(),
            profile: undefined,
            data: data
        });

        if ('function' === typeof(console.log)) {
            console.log('ASSERT_VALIDATION error: ', description, data);
        }

        return false;
    };

    this.ASSERT_VALIDATION_FORCE = function(value, schema, error, data) {
        var status = jsmObjectValidate(value, schema);
        if (status.valid) return true;

        var validationError = status.path + ': ' + status.message;
        var description = ('undefined' === typeof(error)) ? validationError : error.replace('%%', validationError);

        this.profile.items.push({
            type: this.ERROR_TYPE,
            id: 'assert validation error',
            description: description,
            accurate: this.accurateNow(),
            timestamp: Date.now(),
            profile: this.getProfileInfo(),
            data: data
        });

        throw new Error(description);
    };

    this.MARK_LIGHT = function(id, description, data) {
        this.profile.items.push({
            type: this.MARK_TYPE,
            id: id,
            description: description,
            accurate: this.accurateNow(),
            timestamp: Date.now(),
            profile: undefined,
            data: data
        });
    };

    this.MARK_FULL = function(id, description, data) {
        this.profile.items.push({
            type: this.MARK_TYPE,
            id: id,
            description: description,
            accurate: this.accurateNow(),
            timestamp: Date.now(),
            profile: this.getProfileInfo(),
            data: data
        });
    };

    Object.defineProperty(this, 'interfaces', {
        value: {
            debug: {
                MARK: this.MARK_FULL,
                ASSERT: this.ASSERT_FORCE,
                ASSERT_TYPE: this.ASSERT_TYPE_FORCE,
                ASSERT_VALIDATION: this.ASSERT_VALIDATION_FORCE
            },
            production: {
                MARK: this.MARK_LIGHT,
                ASSERT: this.ASSERT_PACIFIC,
                ASSERT_TYPE: this.ASSERT_TYPE_PACIFIC,
                ASSERT_VALIDATION: this.ASSERT_VALIDATION_PACIFIC
            }
        }
    });

    this.setMode = function(mode) {
        var isDebug = ('undefined' !== typeof(mode)) && (mode);
        //todo check mode for other ways

        var modeInterface = (isDebug) ? this.interfaces.debug : this.interfaces.production;

        for (var methodName in modeInterface) {
            this[methodName] = modeInterface[methodName];
        }
    };

    this.setMode(DEBUG_MODE);
};


