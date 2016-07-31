var jsh = new function() {
    this.Alert = function(args) {
        if (!jsh.config.alert) throw new jsh.JshError("jsh.Alert is not configured.");

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

            jsh.trigger("alert_open", {alert: this});
        };

        this.close = function() {
            jsh.get("#jsh_alert_container").classList.add("jsh_transparent");
            setTimeout(function() {
                jsh.get("#jsh_alert_container").classList.add("jsh_display_none");
            }, 500);

            jsh.get("#content").classList.remove("jsh_blurred");

            jsh.trigger("alert_close", {alert: this});
        };
    };

    this.Page = function(args) {
        if (!jsh.config.pages) throw new this.JshError("jsh.Page is not configured.");

        this.args = args || {};
        this.args.name = this.args.name || "";
        this.args.content = this.args.content || document.createElement("div");

        this.name = this.args.name;
        this.div = this.args.div;

        if (!this.div) {
            this.div = document.createElement("div");
            this.div.id = jsh.str("page_{}", this.args.name);
            this.div.classList.add("page");
            this.div.classList.add("jsh_transparent");
            this.div.classList.add("jsh_display_none");

            this.div.appendChild(this.args.content);
            jsh.get("#content").appendChild(this.div);
        }

        jsh.pages[this.name] = this;

        var target_page = this;
        this.open = function() {
            for (var page in jsh.pages) {
                if (jsh.pages.hasOwnProperty(page) && page != target_page.name) {
                    jsh.pages[page].div.classList.add("jsh_transparent");
                }
            }

            setTimeout(function() {
                for (var page in jsh.pages) {
                    if (jsh.pages.hasOwnProperty(page) && page != target_page.name) {
                        jsh.pages[page].div.classList.add("jsh_display_none");
                    }
                }

                target_page.div.classList.remove("jsh_display_none");
                setTimeout(function() {
                    target_page.div.classList.remove("jsh_transparent");
                }, 10)
            }, 500);

            window.location.hash = this.name;
            jsh.trigger("page_open", {page: this})
        }
    };

    this.Request = function(args) {
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
    };

    this.JshError = function(message) {
        this.name = "JshError";
        this.message = message || "";
        this.stack = (new Error()).stack;
    };

    this.addEventListener = function(a, b, c) {this.__el__.addEventListener(a, b, c)};

    this.trigger = function(type, details) {
        var event = new CustomEvent(type, {detail: details});
        this.__el__.dispatchEvent(event);
        return event;
    };

    this.get = function(selector) {
        if (selector[0] == "#") {
            return document.getElementById(selector.substr(1));
        } else if (selector[0] == ".") {
            return document.getElementsByClassName(selector.substr(1));
        } else {
            return document.getElementsByTagName(selector);
        }
    };

    this.str = function() {
        var result = arguments[0];

        for (var i = 1; i < arguments.length; i++) {
            result = result.replace("{}", arguments[i]);
        }

        return result;
    };

    this.__el__ = document.createElement("div");

    this.__init__ = new function() {
        this.alert = function() {
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
        };

        this.pages = function() {
            jsh.pages = {};

            var pages = jsh.get("#content").children;
            for (var i = 0; i < pages.length; i++) {
                if (!pages[i].classList.contains("page")) continue;

                var name = pages[i].id.length > 5 ? pages[i].id.slice(5) : "";

                new jsh.Page({
                    name: name,
                    div: pages[i]
                });
            }

            var on_hash_change = function() {
                var target_page_name;
                if (location.href.indexOf('#') != -1) {
                    target_page_name = (location.href.substring(location.href.indexOf("#") + 1));
                } else {
                    target_page_name = "home";
                }

                var target_page = jsh.pages[target_page_name];
                if (!target_page) {
                    jsh.trigger("page_open");
                } else {
                    target_page.open();
                }
            };

            if ("onhashchange" in window) {
                window.addEventListener("hashchange", on_hash_change);
            }
            on_hash_change();
        }
    }();

    this.cm = function(config) {
        this.config = config ? config : this.config ? this.config : {
            alert: true,
            pages: true
        };

        if (!this.get("#content")) {
            var content = document.createElement("div");
            content.id = "content";
            document.body.appendChild(content);
        }

        this.JshError.prototype = Object.create(Error.prototype);
        this.JshError.prototype.constructor = this.JshError;

        if (this.config.alert) this.__init__.alert();
        if (this.config.pages) this.__init__.pages();

        this.trigger("ready");
    }
}();

window.addEventListener("DOMContentLoaded", function() {
    if (!jsh.config) jsh.cm();
});