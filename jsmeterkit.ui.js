/**
 * Created by Sagifire on 08.05.14.
 */

JSM.ui = {
    STATUS_SUCCESS: 1,
    STATUS_FAILURE: 0,
    STATUS_ERROR:  -1,

    retranslateInProgress: false,

    init: function() {
        this.statusBar.init();

        JSM.testBrowserFeatures();
        JSM.settings = JSM.storage.readSettings();

        this.tabMenu.init();
        this.languageSelect.init();
        this.console.init();

        if (JSM.settings.language) {
            this.languageSelect.setSelectValue(JSM.settings.language);
        }

        this.initRetranslate();
    },
    showNotify: function(message, status) {
        this.statusBar.showMessage(message, status, this.statusBar.MESSAGE_VISIBLE_TIME);
    },

    initRetranslate: function() {
        this.statusBar.showMessage(JSM._('loc-applying-language-in-progress'), this.statusBar.STATE_PROCESS);

        var src = 'languages/' + this.languageSelect.elSelect.value + '/tr.js';
        JSM.include(src, function() {
            JSM.ui.retranslate();
        }, function() {
            JSM.ui.showNotify(JSM._('loc-language-file-loading-has-been-failed'), JSM.ui.statusBar.STATE_ERROR);
        });
    },

    retranslate: function() {
        var currentLocale = JSM.config.currentLocale;
        for (var trKey in currentLocale) {
            var elList = document.querySelectorAll('.' + trKey);
            for( var i = 0, l = elList.length; i < l; i++) {
                if (!elList.hasOwnProperty(trKey))
                    elList[i].innerHTML = currentLocale[trKey];
            }
        }
        JSM.ui.statusBar.defaultMessage = JSM.ui.statusBar.buildDefaultMessage();
        JSM.ui.showNotify(JSM._('loc-applying-language-has-been-success'), JSM.ui.statusBar.STATE_SUCCESS);
        var langId = JSM.ui.languageSelect.elSelect.value;
        JSM.ui.languageSelect.activeLangKey = langId;
        JSM.settings.language = langId;
        JSM.storage.saveSettings(JSM.settings);
    },

// ui modules

    statusBar: {
        MESSAGE_VISIBLE_TIME: 5000,

        STATE_QUIET: 0,
        STATE_SUCCESS: 1,
        STATE_LOADING: 2,
        STATE_PROCESS: 3,
        STATE_ERROR: 4,

        stateClasses: {
            0: 'glyphicon-info-sign',
            1: 'glyphicon-ok-circle green',
            2: 'glyphicon-refresh rotate',
            3: 'glyphicon-cog rotate',
            4: 'glyphicon-exclamation-sign red'
        },

        elMessage: null,
        elIcon: null,

        defaultMessage: '',
        notifies: [],

        timerId: null,

        init: function() {
            this.elMessage = document.querySelector('#status-bar-message');
            this.elIcon = document.querySelector('#status-bar-icon');

            this.defaultMessage = this.buildDefaultMessage();
        },

        buildDefaultMessage: function() {
            return JSM._('loc-all-systems-ready') + ' '
                + JSM._('loc-jsmeterkit-version') + ': ' + JSM.version
                + '. ' + JSM._('loc-detected-browser') + ': ' + navigator.appCodeName + '/' + navigator.appVersion;
        },

        showMessage: function(message, status, timeout) {
            this._clearIconClesses();
            var classArray = this.stateClasses[status].split(' ');
            for( var i = 0, l = classArray.length; i < l; i++) {
                this.elIcon.classList.add(classArray[i]);
            }
            this.elMessage.innerHTML = message;
            if ('undefined' !== typeof(timeout) && 0 < timeout) {
                if (this.timerId) {
                    clearTimeout(this.timerId);
                }
                this.timerId = setTimeout(this.showDefaultMessage, timeout);
            }
        },

        showDefaultMessage: function() {
            var statusBar = JSM.ui.statusBar;
            statusBar._clearIconClesses();
            statusBar.elIcon.classList.add(statusBar.stateClasses[statusBar.STATE_QUIET]);
            statusBar.elMessage.innerHTML = statusBar.defaultMessage;

            if (statusBar.timerId) {
                clearTimeout(statusBar.timerId);
            }
        },

        _clearIconClesses: function() {
            this.elIcon.classList.remove('rotate');
            for(var i in this.stateClasses) {
                var classArray = this.stateClasses[i].split(' ');
                for (var j = 0, n = classArray.length; j < n; j++) {
                    this.elIcon.classList.remove(classArray[j]);
                }
            }
        }
    },

    languageSelect: {
        activeLangKey: null,
        elSelect: null,
        init: function() {
            this.elSelect = document.querySelector('#menu-language-select');

            this.elSelect.innerHTML = '';
            for (var langKey in JSM.config.languages) {
                var option = document.createElement('option');
                option.value = langKey;
                option.innerHTML = JSM.config.languages[langKey];

                option.style.backgroundImage = 'url(languages/' + langKey + '/flag.png)';
                option.style.backgroundRepeat = 'no-repeat';
                option.style.backgroundPosition = '3px 3px';

                this.elSelect.appendChild(option);
            }
            this.setSelectValue(JSM.config.systemLanguage);
            this.elSelect.onchange = this.onChangeHandler;
            this.activeLangKey = JSM.config.systemLanguage;
        },
        setSelectValue: function(langKey) {
            this.elSelect.value = langKey;
            this.setSelectFlag(langKey);
        },
        setSelectFlag: function(langKey) {
            this.elSelect.style.backgroundImage = 'url(languages/' + langKey + '/flag.png)';
            this.elSelect.style.backgroundRepeat = 'no-repeat';
            this.elSelect.style.backgroundPosition = '7px 10px';
        },
        onChangeHandler: function() {
            var languageSelect = JSM.ui.languageSelect;
            var langId = languageSelect.elSelect.value;
            languageSelect.setSelectFlag(langId);

            if (JSM.ui.retranslateInProgress && langId != languageSelect.activeLangKey) {
                languageSelect.setSelectValue(languageSelect.activeLangKey);
            }
            JSM.ui.initRetranslate();
        }
    },
    tabMenu: {
        activeTab: 'console',
        tabs: {
            'console' : null,
            'report': null,
            'help': null
        },

        init: function() {
            for( var tabKey in this.tabs) {
                var tabObject = {};
                tabObject.elMenu = document.querySelector('#menu-item-' + tabKey);
                tabObject.elMenu.tabName = tabKey;
                tabObject.elMenu.onclick = this.onClickHandler;
                tabObject.elContainer = document.querySelector('#' + tabKey + '-container')
                this.tabs[tabKey] = tabObject;
            }
        },

        onClickHandler: function() {
            if (this.tabName === JSM.ui.tabMenu.activeTab)
                return;

            var tabMenu = JSM.ui.tabMenu;
            for( var tabKey in tabMenu.tabs) {
                var tabObject = tabMenu.tabs[tabKey];
                if (tabKey === this.tabName) {
                    tabObject.elContainer.classList.remove('hide');
                    tabObject.elMenu.classList.add('active');
                } else {
                    tabObject.elContainer.classList.add('hide');
                    tabObject.elMenu.classList.remove('active');
                }
            }

            tabMenu.activeTab = this.tabName;
        }
    },
    console: {
        init: function() {
            this.commandEditor.init();
            this.journal.init();
        },
        commandEditor: {
            elCt: null,
            codeMirror: null,
            init: function() {
                this.elCt = document.querySelector('#command-editor-container');
                this.codeMirror = CodeMirror(this.elCt, {
                    mode: 'javascript',
                    lineNumbers: true
                });

                this.codeMirror.display.wrapper.classList.add("panel");
                this.codeMirror.display.wrapper.classList.add("panel-default");

                document.querySelector('#command-editor-execute').onclick = this.execute;
            },
            execute: function() {
                var code = JSM.ui.console.commandEditor.codeMirror.getValue();
                if (code) {
                    try {
                        var result = eval(code);
                        JSM.ui.console.journal.appendNote(
                            'loc-code-has-been-executed',
                            ['loc-result', '<pre>' + JSON.stringify(result, null, '\t') + '</pre>'],
                            JSM.ui.console.journal.NOTE_INFO,
                            true);
                    } catch (E) {
                        console.log(E);
                        JSM.ui.console.journal.appendNote(
                            'loc-code-executing-has-been-failed',
                            ['loc-error', E.message, E.stack],
                            JSM.ui.console.journal.NOTE_ERROR,
                            true);
                    }
                } else {
                    JSM.ui.showNotify(JSM._('loc-code-is-empty'), JSM.ui.statusBar.STATE_ERROR);
                }

            }
        },
        journal: {
            NOTE_DEFAULT : 0,
            NOTE_SUCCESS : 1,
            NOTE_INFO    : 2,
            NOTE_WARNING : 3,
            NOTE_ERROR   : 4,

            noteClasses: {
                0: 'note-default',
                1: 'note-success',
                2: 'note-info',
                3: 'note-warning',
                4: 'note-danger'
            },

            notesLimit: 25, // default value
            elNotesLimitSelect: null,
            elNotesCt: null,

            init: function() {
                if (JSM.settings.notesLimit) {
                    this.notesLimit = JSM.settings.notesLimit;
                }

                this.elNotesCt = document.querySelector('#notes-container');
                this.elNotesLimitSelect = document.querySelector('#journal-notes-limit');
                this.elNotesLimitSelect.value = this.notesLimit;
                this.elNotesLimitSelect.onchange = this.onChange;
            },

            appendNote: function(title, content, type, tr) {
                var elNote = document.createElement('div');
                elNote.classList.add('note');
                if ('number' === typeof(type) && type > -1)
                    elNote.classList.add(this.noteClasses[type]);

                if ('string' === typeof(title)) {
                    var elNoteTitle = document.createElement('h4');
                    if (tr && 0 === title.indexOf('loc-')) {
                        elNoteTitle.innerHTML = JSM._(title);
                        elNoteTitle.classList.add(title);
                    } else {
                        elNoteTitle.innerHTML = title;
                    }
                    elNote.appendChild(elNoteTitle);
                }

                var contentIsArray = (content instanceof Array);
                var contentIndex = (contentIsArray) ? 0 : -1;
                var length = (contentIsArray) ?  content.length: -1;
                var contentText = content;
                do {
                    if (contentIndex > -1) {
                        contentText = content[contentIndex];
                    }

                    var elNoteContent = document.createElement('p');
                    if (tr && 0 === contentText.indexOf('loc-')) {
                        elNoteContent.innerHTML = JSM._(contentText);
                        elNoteContent.classList.add(contentText);
                    } else {
                        elNoteContent.innerHTML = contentText;
                    }

                    elNote.appendChild(elNoteContent);
                } while(contentIsArray && ++contentIndex < length);
                // todo content

                this.elNotesCt.insertBefore(elNote, this.elNotesCt.firstChild);
                this.applyNotesLimit();
            },

            onChange: function() {
                var journal = JSM.ui.console.journal;
                journal.notesLimit = parseInt(this.value);
                JSM.settings.notesLimit = journal.notesLimit;
                JSM.storage.saveSettings(JSM.settings);
                journal.applyNotesLimit();
            },

            applyNotesLimit: function() {
                var notesList = this.elNotesCt.querySelectorAll('div.note');
                if (!notesList)
                    return;
                var notesToRemove = notesList.length - this.notesLimit;
                if (notesToRemove > 0) {
                    for (var i = 0; i < notesToRemove; i++) {
                        console.log('remove >>>', this.notesLimit + i, 'of', notesList.length);
                        this.elNotesCt.removeChild(notesList[this.notesLimit + i]);
                    }
                }
            }
        }
    }
}

window.onload = function() {
    if (JSM) {
        JSM.ui.init();
    } else {
        JSM.ui.readyToInit = true;
    }
}