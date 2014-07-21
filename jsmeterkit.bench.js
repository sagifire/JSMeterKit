/**
 * Created by Sagifire on 05.06.14.
 */

JSM.bench = {
    targetList: {},
    haveIncluded: [],

    /**
     * target format: {
     *     include: ['path/lib1.js', 'path/lib2.js'],
     *     marks: null | undefined | ['mark id 1', 'mark id 2'],
     *     subjects: {
     *        'subject name 1' : function() { ... },
     *        'subject name 2' : function() { ... },
     *     }
     * }
     * @param name
     * @param target
     */
    registerTarget: function(name, target) {
        JSM.debug.ASSERT_TYPE(name, '[object String]', 'registerTarget(name, target) - Invalid \'name\' argument type, it must be a string.');

        JSM.debug.ASSERT_VALIDATION(target, {
            type: '[object Object]',
            properties: {
                include: { type: ['[object Undefined]', '[object Null]', '[object Array]', '[object String]']},
                marks: { type: ['[object Undefined]', '[object Null]', '[object Array]']},
                subjects: { type: '[object Object]', required: true }
            }
        }, 'registerTarget(name, target) - invalid \'target\' argument: %%');

        var subjectsInvalidFlag = true;
        var subjectsImvalidMessage = '.subjects can\'t be an empty Object.';
        for (var subjectName in target.subjects) {
            if (subjectsInvalidFlag)  // subjects can't be empty
                subjectsInvalidFlag = false;
            if ('function' !== typeof(target.subjects[subjectName])) {
                subjectsInvalidFlag = true;
                subjectsImvalidMessage = '.subjects.' + subjectName + ' :must be a function.'
                break;
            }
        }
        if (subjectsInvalidFlag)
            throw new Error('registerTarget(name, target) - invalid \'target\' argument: ' + subjectsImvalidMessage);

        this.targetList[name] = target;
    },
    removeTarget: function(name) {

    },
    run: function(id, targets, config) {

    }
}