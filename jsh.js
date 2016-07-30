var jsh = {
    Alert: function(args) {
        this.args = args || {};
        this.args.message = this.args.message || "";
        this.args.title = this.args.title || "";
        this.args.button_text = this.args.button_text || "ok";
        this.args.cancel_button_text = this.args.cancel_button_text || "cancel";
        this.args.show_cancel = this.args.show_cancel || false;

        this.open = function() {
            document.activeElement.blur();

            jsh.get("#jsh_alert_message").innerHTML = this.args.message;
            jsh.get("#jsh_alert_title").innerHTML = this.args.title;
            jsh.get("#jsh_alert_button").innerHTML = this.args.button_text;
            jsh.get("#jsh_alert_cancel").innerHTML = this.args.cancel_button_text;

            if (this.args.show_cancel) {
                jsh.get("#jsh_alert_cancel").classList.remove("jsh_display_none");
            } else {
                jsh.get("#jsh_alert_cancel").classList.add("jsh_display_none");
            }

            jsh.get("#jsh_alert_container").classList.remove("jsh_display_none");
            setTimeout(function() {
                jsh.get("#jsh_alert_container").classList.remove("jsh_transparent");
            }, 10);

            jsh.get("#jsh_alert_button").onclick = this.args["button_callback"] || this.close;
            jsh.get("#jsh_alert_cancel").onclick = this.args["cancel_callback"] || this.close;

            jsh.get("#content").classList.add("jsh_blurred");
        };

        this.close = function() {
            jsh.get("#jsh_alert_container").classList.add("jsh_transparent");
            setTimeout(function() {
                jsh.get("#jsh_alert_container").classList.add("jsh_display_none");
            }, 500);

            jsh.get("#content").classList.remove("jsh_blurred");
        }
    },

    Request: function(args) {
        this.args = args || {};
        this.args.url = this.args.url || "";
        this.args.data = this.args.data || {};
        this.args.post = this.args.post || false;
        this.args.async = this.args.async || true;
        this.args.parse_json = this.args.parse_json || false;
        this.args.callback = this.args.callback || function(result) {};


        this.send = function() {
            if (!this.args.post) {
                var param_string =  "?";
                var prefix = "";
                for (var property in this.args.data) {
                    if (this.args.data.hasOwnProperty(property)) {
                        param_string += prefix + property + "=" + encodeURIComponent(this.args.data[property]);
                    }
                    prefix = "&";
                }
                this.args.url += param_string == "?" ? "" : param_string;
            }

            var request = new XMLHttpRequest();
            request.open(this.args.post ? "POST" : "GET", this.args.url, this.args.async);
            request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

            var callback = this.args.callback;
            var parse_json = this.args.parse_json;
            request.onloadend = function() {
                if (parse_json) {
                    var result;
                    try {
                        result = JSON.parse(request.responseText);
                    } catch (ex) {
                        result = {"error": request.responseText};
                    }
                    callback(result);
                } else {
                    callback(request.responseText);
                }
            };

            request.send(this.args.post ? JSON.stringify(this.args.data) : undefined);
        };

        this.get = function() {
            this.args.post = false;
            this.send();
        };

        this.post = function() {
            this.args.post = true;
            this.send();
        }
    },

    get: function(selector) {
        if (selector[0] == "#") {
            return document.getElementById(selector.substr(1));
        } else if (selector[0] == ".") {
            return document.getElementsByClassName(selector.substr(1));
        } else {
            return document.getElementsByTagName(selector);
        }
    }
};

var jsh_window_onload = window.onload;
window.onload = function() {
    if (!jsh.get("#content")) {
        var content = document.createElement("div");
        content.id = "content";
        document.body.appendChild(content);
    }

    var container = document.createElement("div");
    container.id = "jsh_alert_container";
    container.classList.add("jsh_transparent");
    container.classList.add("jsh_display_none");

    var window = document.createElement("div");
    window.id = "jsh_alert_window";

    var title = document.createElement("div");
    title.id = "jsh_alert_title";

    var message = document.createElement("div");
    message.id = "jsh_alert_message";

    var buttons = document.createElement("div");
    buttons.id = "jsh_alert_buttons";

    var cancel = document.createElement("span");
    cancel.classList.add("jsh_alert_button");
    cancel.id = "jsh_alert_cancel";

    var button = document.createElement("span");
    button.classList.add("jsh_alert_button");
    button.id = "jsh_alert_button";

    buttons.appendChild(cancel);
    buttons.appendChild(button);
    window.appendChild(title);
    window.appendChild(message);
    window.appendChild(buttons);
    container.appendChild(window);
    document.body.appendChild(container);

    if (jsh_window_onload) jsh_window_onload();
};