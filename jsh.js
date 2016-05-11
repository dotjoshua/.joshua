var jsh = {
    alert: {
        open: function(message, title, args) {
            args = (args == null) ? {} : args;
            message = (message == null) ? "" : message;
            title = (title == null) ? "" : title;

            var button_text = args["button_text"];
            var show_cancel = args["show_cancel"];
            var button_callback = args["button_callback"];
            var cancel_callback = args["cancel_callback"];
            var cancel_button_text = args["cancel_button_text"];

            button_text = (button_text == undefined) ? "ok" : button_text;
            button_callback = (button_callback == undefined) ? function() {jsh.alert.close()} : button_callback;
            cancel_callback = (cancel_callback == undefined) ? function() {jsh.alert.close()} : cancel_callback;
            show_cancel = (show_cancel == undefined) ? false : show_cancel;
            cancel_button_text = (cancel_button_text == undefined) ? "cancel" : cancel_button_text;

            document.activeElement.blur();

            jsh.select("#jsh_alert_message").js.innerHTML = message;
            jsh.select("#jsh_alert_title").js.innerHTML = title;
            jsh.select("#jsh_alert_button").js.innerHTML = button_text;
            jsh.select("#jsh_alert_cancel").js.innerHTML = cancel_button_text;

            if (show_cancel) {
                jsh.select("#jsh_alert_cancel").remove_class("jsh_display_none");
            } else {
                jsh.select("#jsh_alert_cancel").add_class("jsh_display_none");
            }

            jsh.select("#jsh_alert_container").remove_class("jsh_display_none");
            setTimeout(function() {
                jsh.select("#jsh_alert_container").remove_class("jsh_transparent");
            }, 10);

            jsh.select("#jsh_alert_button").js.onclick = button_callback;
            jsh.select("#jsh_alert_cancel").js.onclick = cancel_callback;

            jsh.select("#content").add_class("jsh_blurred");
        },

        close: function() {
            jsh.select("#jsh_alert_container").add_class("jsh_transparent");
            setTimeout(function() {
                jsh.select("#jsh_alert_container").add_class("jsh_display_none");
            }, 500);

            jsh.select("#content").remove_class("jsh_blurred");
        }
    },

    req: {
        send: function(args) {
            args.url = (args.url == undefined) ? "" : args.url;
            args.data = (args.data == undefined) ? {} : args.data;
            args.post = (args.post == undefined) ? false : args.post;
            args.async = (args.async == undefined) ? true : args.async;
            args.parse_json = (args.parse_json == undefined) ? false : args.parse_json;
            args.callback = (args.callback == undefined) ? function(result) {} : args.callback;

            if (!args.post) {
                var param_string =  "?";
                var prefix = "";
                for (var property in args.data) {
                    if (args.data.hasOwnProperty(property)) {
                        param_string += prefix + property + "=" + encodeURIComponent(args.data[property]);
                    }
                    prefix = "&";
                }
                args.url += param_string == "?" ? "" : param_string;
            }

            var request = new XMLHttpRequest();
            request.open(args.post ? "POST" : "GET", args.url, args.async);
            request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            request.onloadend = function() {
                if (args.parse_json) {
                    var result;
                    try {
                        result = JSON.parse(request.responseText);
                    } catch (ex) {
                        result = {"error": request.responseText};
                    }
                    args.callback(result);
                } else {
                    args.callback(request.responseText);
                }
            };
            request.send(args.post ? JSON.stringify(args.data) : undefined);
        },

        get: function(args) {
            args.post = false;
            jsh.req.send(args);
        },

        post: function(args) {
            args.post = true;
            jsh.req.send(args);
        }
    },

    select: function(selector) {
        if (selector[0] == "#") {
            selector = selector.substr(1);

            var js_object = document.getElementById(selector);
            return js_object == undefined ? undefined : new jsh.cm.DOM_Object(js_object);
        } else if (selector[0] == ".") {
            selector = selector.substr(1);

            var elements = [];
            var js_objects = document.getElementsByClassName(selector);

            for (var i = 0; i < js_objects.length; i++) {
                elements.push(new jsh.cm.DOM_Object(js_objects[i]));
            }

            return elements;
        } else {
            selector = selector.substr(1);

            elements = [];
            js_objects = document.getElementsByTagName(selector);

            for (i = 0; i < js_objects.length; i++) {
                elements.push(new jsh.cm.DOM_Object(js_objects[i]));
            }

            return elements;
        }
    },

    cm: {
        DOM_Object: function(js_object) {
            this.js = js_object;

            this.add_class = function (class_name) {
                this.js.classList.add(class_name);
            };

            this.remove_class = function(class_name) {
                this.js.classList.remove(class_name);
            };

            return this;
        },

        setup: function() {
            if (jsh.select("#content") == undefined) {
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
        }
    }
};

window.onload = jsh.cm.setup;