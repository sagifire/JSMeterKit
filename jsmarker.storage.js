/**
 * Created by Sagifire on 14.05.14.
 */

JSM.storage = {
    readSettings: function() {
        return JSON.parse(localStorage.getItem('settings'));
    },

    saveSettings: function(settingsObject) {
        localStorage.setItem('settings', JSON.stringify(settingsObject));
    },

    readProject: function(name) {
        return JSON.parse(localStorage.getItem('project.' + name));
    },

    saveProject: function(name, projectObject) {
        localStorage.setItem('project.' + name, JSON.stringify(projectObject));
        var projectList = this.getProjectList();
        if (-1 === projectList.indexOf(name)) {
            projectList.push(name);
        }
        localStorage.setItem('projectList', JSON.stringify(projectList));
    },

    getProjectList: function() {
        var ret = JSON.parse(localStorage.getItem('projectList'));
        return (ret)? ret : [];
    },

    deleteProject: function(name) {
        localStorage.removeItem('project.' + name);
        var projectList = this.getProjectList();
        var index = projectList.indexOf(name)
        if (-1 < index) {
            console.log(1);
            projectList.splice(index, 1);
            localStorage.setItem('projectList', JSON.stringify(projectList));
        }
    }
}