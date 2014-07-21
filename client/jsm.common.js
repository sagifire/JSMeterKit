/**
 * Created by Sagifire on 24.06.14.
 */
function jsmCreateScopeFunction(func, scope) {
    return function() {
        scope.origin = this;
        //scope.arguments = arguments;
        return func.apply(scope, arguments);
    };
};

function jsmSerialize(obj) {
    return JSON.stringify(obj, function(key, value) {
        if (value instanceof Function || typeof value === 'function') {
            return value.toString();
        }
        if (value instanceof RegExp) {
            return '_PxEgEr_' + value;
        }
        return value;
    });
};

function jsmUnserialize(string) {
    return JSON.parse(string, function (key, value) {
        if (typeof value != 'string') {
            return value;
        }
        if (value.length < 8) {
            return value;
        }
        var prefix = value.substring(0, 8);

        if (prefix === 'function') {
            var startBodyIndex = value.indexOf('{') + 1;
            var endBodyIndex = value.lastIndexOf('}');
            var startArgsIndex = value.indexOf('(') + 1;
            var endArgsIndex = value.indexOf(')');

            return new Function(value.substring(startArgsIndex, endArgsIndex),
                value.substring(startBodyIndex, endBodyIndex));
        }
        if (prefix === '_PxEgEr_') {
            return eval(value.slice(8));
        }

        return value;
    });
};

function jsmObjectValidate(object, schema) {
    var status = {
        valid: true
    };
    for (var rule in schema) {
        if ('type' === rule) {
            var objectType = Object.prototype.toString.call(object);
            var typesListFlag = ('[object Array]' === Object.prototype.toString.call(schema.type));
            if ( (typesListFlag) ? -1 === schema.type.indexOf(objectType) : objectType !== schema.type ) {
                status = {
                    valid: false,
                    path: '',
                    message: 'Object type not valid. It must be ' + schema.type + ', but it is ' + objectType
                };
                break;
            }
            continue;
        }

        // todo other rules

        if ('properties' === rule) {
            var propFlag = true;
            for (var propId in schema.properties) {
                var propertySchema = schema.properties[propId];
                if ('undefined' !== typeof(object[propId])) {
                    var propResult = jsmObjectValidate(object[propId], propertySchema);
                    if (!propResult.valid) {
                        status = {
                            valid: false,
                            path: '.' + propId + propResult.path,
                            message: propResult.message
                        };
                        break;
                    }
                } else {
                    if (propertySchema.required) {
                        status = {
                            valid: false,
                            path: '.' + propId,
                            message: 'A property \'' + propId + '\' is required.'
                        };
                        break;
                    }
                }
            }
        }
    }

    return status;
};
