! function(e) {
  if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
  else if ("function" == typeof define && define.amd) define([], e);
  else {
    var t;
    "undefined" != typeof window ? t = window : "undefined" != typeof global ? t = global : "undefined" != typeof self && (t = self), t.io = e()
  }
}(function() {
  var e, t, n;
  return function r(e, t, n) {
    function i(o, u) {
      if (!t[o]) {
        if (!e[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(o, !0);
          if (s) return s(o, !0);
          throw new Error("Cannot find module '" + o + "'")
        }
        var f = t[o] = {
          exports: {}
        };
        e[o][0].call(f.exports, function(t) {
          var n = e[o][1][t];
          return i(n ? n : t)
        }, f, f.exports, r, e, t, n)
      }
      return t[o].exports
    }
    var s = typeof require == "function" && require;
    for (var o = 0; o < n.length; o++) i(n[o]);
    return i
  }({
    1: [function(e, t, n) {
      t.exports = e("./lib/")
    }, {
      "./lib/": 2
    }],
    2: [function(e, t, n) {
      function a(e, t) {
        if (typeof e == "object") {
          t = e;
          e = undefined
        }
        t = t || {};
        var n = r(e);
        var i = n.source;
        var a = n.id;
        var f;
        if (t.forceNew || t["force new connection"] || false === t.multiplex) {
          o("ignoring socket cache for %s", i);
          f = s(i, t)
        } else {
          if (!u[a]) {
            o("new io instance for %s", i);
            u[a] = s(i, t)
          }
          f = u[a]
        }
        return f.socket(n.path)
      }
      var r = e("./url");
      var i = e("socket.io-parser");
      var s = e("./manager");
      var o = e("debug")("socket.io-client");
      t.exports = n = a;
      var u = n.managers = {};
      n.protocol = i.protocol;
      n.connect = a;
      n.Manager = e("./manager");
      n.Socket = e("./socket")
    }, {
      "./manager": 3,
      "./socket": 5,
      "./url": 6,
      debug: 9,
      "socket.io-parser": 43
    }],
    3: [function(e, t, n) {
      function p(e, t) {
        if (!(this instanceof p)) return new p(e, t);
        if (e && "object" == typeof e) {
          t = e;
          e = undefined
        }
        t = t || {};
        t.path = t.path || "/socket.io";
        this.nsps = {};
        this.subs = [];
        this.opts = t;
        this.reconnection(t.reconnection !== false);
        this.reconnectionAttempts(t.reconnectionAttempts || Infinity);
        this.reconnectionDelay(t.reconnectionDelay || 1e3);
        this.reconnectionDelayMax(t.reconnectionDelayMax || 5e3);
        this.timeout(null == t.timeout ? 2e4 : t.timeout);
        this.readyState = "closed";
        this.uri = e;
        this.connected = [];
        this.attempts = 0;
        this.encoding = false;
        this.packetBuffer = [];
        this.encoder = new u.Encoder;
        this.decoder = new u.Decoder;
        this.autoConnect = t.autoConnect !== false;
        if (this.autoConnect) this.open()
      }
      var r = e("./url");
      var i = e("engine.io-client");
      var s = e("./socket");
      var o = e("component-emitter");
      var u = e("socket.io-parser");
      var a = e("./on");
      var f = e("component-bind");
      var l = e("object-component");
      var c = e("debug")("socket.io-client:manager");
      var h = e("indexof");
      t.exports = p;
      p.prototype.emitAll = function() {
        this.emit.apply(this, arguments);
        for (var e in this.nsps) {
          this.nsps[e].emit.apply(this.nsps[e], arguments)
        }
      };
      o(p.prototype);
      p.prototype.reconnection = function(e) {
        if (!arguments.length) return this._reconnection;
        this._reconnection = !!e;
        return this
      };
      p.prototype.reconnectionAttempts = function(e) {
        if (!arguments.length) return this._reconnectionAttempts;
        this._reconnectionAttempts = e;
        return this
      };
      p.prototype.reconnectionDelay = function(e) {
        if (!arguments.length) return this._reconnectionDelay;
        this._reconnectionDelay = e;
        return this
      };
      p.prototype.reconnectionDelayMax = function(e) {
        if (!arguments.length) return this._reconnectionDelayMax;
        this._reconnectionDelayMax = e;
        return this
      };
      p.prototype.timeout = function(e) {
        if (!arguments.length) return this._timeout;
        this._timeout = e;
        return this
      };
      p.prototype.maybeReconnectOnOpen = function() {
        if (!this.openReconnect && !this.reconnecting && this._reconnection && this.attempts === 0) {
          this.openReconnect = true;
          this.reconnect()
        }
      };
      p.prototype.open = p.prototype.connect = function(e) {
        c("readyState %s", this.readyState);
        if (~this.readyState.indexOf("open")) return this;
        c("opening %s", this.uri);
        this.engine = i(this.uri, this.opts);
        var t = this.engine;
        var n = this;
        this.readyState = "opening";
        this.skipReconnect = false;
        var r = a(t, "open", function() {
          n.onopen();
          e && e()
        });
        var s = a(t, "error", function(t) {
          c("connect_error");
          n.cleanup();
          n.readyState = "closed";
          n.emitAll("connect_error", t);
          if (e) {
            var r = new Error("Connection error");
            r.data = t;
            e(r)
          }
          n.maybeReconnectOnOpen()
        });
        if (false !== this._timeout) {
          var o = this._timeout;
          c("connect attempt will timeout after %d", o);
          var u = setTimeout(function() {
            c("connect attempt timed out after %d", o);
            r.destroy();
            t.close();
            t.emit("error", "timeout");
            n.emitAll("connect_timeout", o)
          }, o);
          this.subs.push({
            destroy: function() {
              clearTimeout(u)
            }
          })
        }
        this.subs.push(r);
        this.subs.push(s);
        return this
      };
      p.prototype.onopen = function() {
        c("open");
        this.cleanup();
        this.readyState = "open";
        this.emit("open");
        var e = this.engine;
        this.subs.push(a(e, "data", f(this, "ondata")));
        this.subs.push(a(this.decoder, "decoded", f(this, "ondecoded")));
        this.subs.push(a(e, "error", f(this, "onerror")));
        this.subs.push(a(e, "close", f(this, "onclose")))
      };
      p.prototype.ondata = function(e) {
        this.decoder.add(e)
      };
      p.prototype.ondecoded = function(e) {
        this.emit("packet", e)
      };
      p.prototype.onerror = function(e) {
        c("error", e);
        this.emitAll("error", e)
      };
      p.prototype.socket = function(e) {
        var t = this.nsps[e];
        if (!t) {
          t = new s(this, e);
          this.nsps[e] = t;
          var n = this;
          t.on("connect", function() {
            if (!~h(n.connected, t)) {
              n.connected.push(t)
            }
          })
        }
        return t
      };
      p.prototype.destroy = function(e) {
        var t = h(this.connected, e);
        if (~t) this.connected.splice(t, 1);
        if (this.connected.length) return;
        this.close()
      };
      p.prototype.packet = function(e) {
        c("writing packet %j", e);
        var t = this;
        if (!t.encoding) {
          t.encoding = true;
          this.encoder.encode(e, function(e) {
            for (var n = 0; n < e.length; n++) {
              t.engine.write(e[n])
            }
            t.encoding = false;
            t.processPacketQueue()
          })
        } else {
          t.packetBuffer.push(e)
        }
      };
      p.prototype.processPacketQueue = function() {
        if (this.packetBuffer.length > 0 && !this.encoding) {
          var e = this.packetBuffer.shift();
          this.packet(e)
        }
      };
      p.prototype.cleanup = function() {
        var e;
        while (e = this.subs.shift()) e.destroy();
        this.packetBuffer = [];
        this.encoding = false;
        this.decoder.destroy()
      };
      p.prototype.close = p.prototype.disconnect = function() {
        this.skipReconnect = true;
        this.readyState = "closed";
        this.engine && this.engine.close()
      };
      p.prototype.onclose = function(e) {
        c("close");
        this.cleanup();
        this.readyState = "closed";
        this.emit("close", e);
        if (this._reconnection && !this.skipReconnect) {
          this.reconnect()
        }
      };
      p.prototype.reconnect = function() {
        if (this.reconnecting || this.skipReconnect) return this;
        var e = this;
        this.attempts++;
        if (this.attempts > this._reconnectionAttempts) {
          c("reconnect failed");
          this.emitAll("reconnect_failed");
          this.reconnecting = false
        } else {
          var t = this.attempts * this.reconnectionDelay();
          t = Math.min(t, this.reconnectionDelayMax());
          c("will wait %dms before reconnect attempt", t);
          this.reconnecting = true;
          var n = setTimeout(function() {
            if (e.skipReconnect) return;
            c("attempting reconnect");
            e.emitAll("reconnect_attempt", e.attempts);
            e.emitAll("reconnecting", e.attempts);
            if (e.skipReconnect) return;
            e.open(function(t) {
              if (t) {
                c("reconnect attempt error");
                e.reconnecting = false;
                e.reconnect();
                e.emitAll("reconnect_error", t.data)
              } else {
                c("reconnect success");
                e.onreconnect()
              }
            })
          }, t);
          this.subs.push({
            destroy: function() {
              clearTimeout(n)
            }
          })
        }
      };
      p.prototype.onreconnect = function() {
        var e = this.attempts;
        this.attempts = 0;
        this.reconnecting = false;
        this.emitAll("reconnect", e)
      }
    }, {
      "./on": 4,
      "./socket": 5,
      "./url": 6,
      "component-bind": 7,
      "component-emitter": 8,
      debug: 9,
      "engine.io-client": 10,
      indexof: 39,
      "object-component": 40,
      "socket.io-parser": 43
    }],
    4: [function(e, t, n) {
      function r(e, t, n) {
        e.on(t, n);
        return {
          destroy: function() {
            e.removeListener(t, n)
          }
        }
      }
      t.exports = r
    }, {}],
    5: [function(e, t, n) {
      function h(e, t) {
        this.io = e;
        this.nsp = t;
        this.json = this;
        this.ids = 0;
        this.acks = {};
        if (this.io.autoConnect) this.open();
        this.receiveBuffer = [];
        this.sendBuffer = [];
        this.connected = false;
        this.disconnected = true
      }
      var r = e("socket.io-parser");
      var i = e("component-emitter");
      var s = e("to-array");
      var o = e("./on");
      var u = e("component-bind");
      var a = e("debug")("socket.io-client:socket");
      var f = e("has-binary");
      t.exports = n = h;
      var l = {
        connect: 1,
        connect_error: 1,
        connect_timeout: 1,
        disconnect: 1,
        error: 1,
        reconnect: 1,
        reconnect_attempt: 1,
        reconnect_failed: 1,
        reconnect_error: 1,
        reconnecting: 1
      };
      var c = i.prototype.emit;
      i(h.prototype);
      h.prototype.subEvents = function() {
        if (this.subs) return;
        var e = this.io;
        this.subs = [o(e, "open", u(this, "onopen")), o(e, "packet", u(this, "onpacket")), o(e, "close", u(this, "onclose"))]
      };
      h.prototype.open = h.prototype.connect = function() {
        if (this.connected) return this;
        this.subEvents();
        this.io.open();
        if ("open" == this.io.readyState) this.onopen();
        return this
      };
      h.prototype.send = function() {
        var e = s(arguments);
        e.unshift("message");
        this.emit.apply(this, e);
        return this
      };
      h.prototype.emit = function(e) {
        if (l.hasOwnProperty(e)) {
          c.apply(this, arguments);
          return this
        }
        var t = s(arguments);
        var n = r.EVENT;
        if (f(t)) {
          n = r.BINARY_EVENT
        }
        var i = {
          type: n,
          data: t
        };
        if ("function" == typeof t[t.length - 1]) {
          a("emitting packet with ack id %d", this.ids);
          this.acks[this.ids] = t.pop();
          i.id = this.ids++
        }
        if (this.connected) {
          this.packet(i)
        } else {
          this.sendBuffer.push(i)
        }
        return this
      };
      h.prototype.packet = function(e) {
        e.nsp = this.nsp;
        this.io.packet(e)
      };
      h.prototype.onopen = function() {
        a("transport is open - connecting");
        if ("/" != this.nsp) {
          this.packet({
            type: r.CONNECT
          })
        }
      };
      h.prototype.onclose = function(e) {
        a("close (%s)", e);
        this.connected = false;
        this.disconnected = true;
        this.emit("disconnect", e)
      };
      h.prototype.onpacket = function(e) {
        if (e.nsp != this.nsp) return;
        switch (e.type) {
          case r.CONNECT:
            this.onconnect();
            break;
          case r.EVENT:
            this.onevent(e);
            break;
          case r.BINARY_EVENT:
            this.onevent(e);
            break;
          case r.ACK:
            this.onack(e);
            break;
          case r.BINARY_ACK:
            this.onack(e);
            break;
          case r.DISCONNECT:
            this.ondisconnect();
            break;
          case r.ERROR:
            this.emit("error", e.data);
            break
        }
      };
      h.prototype.onevent = function(e) {
        var t = e.data || [];
        a("emitting event %j", t);
        if (null != e.id) {
          a("attaching ack callback to event");
          t.push(this.ack(e.id))
        }
        if (this.connected) {
          c.apply(this, t)
        } else {
          this.receiveBuffer.push(t)
        }
      };
      h.prototype.ack = function(e) {
        var t = this;
        var n = false;
        return function() {
          if (n) return;
          n = true;
          var i = s(arguments);
          a("sending ack %j", i);
          var o = f(i) ? r.BINARY_ACK : r.ACK;
          t.packet({
            type: o,
            id: e,
            data: i
          })
        }
      };
      h.prototype.onack = function(e) {
        a("calling ack %s with %j", e.id, e.data);
        var t = this.acks[e.id];
        t.apply(this, e.data);
        delete this.acks[e.id]
      };
      h.prototype.onconnect = function() {
        this.connected = true;
        this.disconnected = false;
        this.emit("connect");
        this.emitBuffered()
      };
      h.prototype.emitBuffered = function() {
        var e;
        for (e = 0; e < this.receiveBuffer.length; e++) {
          c.apply(this, this.receiveBuffer[e])
        }
        this.receiveBuffer = [];
        for (e = 0; e < this.sendBuffer.length; e++) {
          this.packet(this.sendBuffer[e])
        }
        this.sendBuffer = []
      };
      h.prototype.ondisconnect = function() {
        a("server disconnect (%s)", this.nsp);
        this.destroy();
        this.onclose("io server disconnect")
      };
      h.prototype.destroy = function() {
        if (this.subs) {
          for (var e = 0; e < this.subs.length; e++) {
            this.subs[e].destroy()
          }
          this.subs = null
        }
        this.io.destroy(this)
      };
      h.prototype.close = h.prototype.disconnect = function() {
        if (this.connected) {
          a("performing disconnect (%s)", this.nsp);
          this.packet({
            type: r.DISCONNECT
          })
        }
        this.destroy();
        if (this.connected) {
          this.onclose("io client disconnect")
        }
        return this
      }
    }, {
      "./on": 4,
      "component-bind": 7,
      "component-emitter": 8,
      debug: 9,
      "has-binary": 35,
      "socket.io-parser": 43,
      "to-array": 47
    }],
    6: [function(e, t, n) {
      (function(n) {
        function s(e, t) {
          var s = e;
          var t = t || n.location;
          if (null == e) e = t.protocol + "//" + t.hostname;
          if ("string" == typeof e) {
            if ("/" == e.charAt(0)) {
              if ("/" == e.charAt(1)) {
                e = t.protocol + e
              } else {
                e = t.hostname + e
              }
            }
            if (!/^(https?|wss?):\/\//.test(e)) {
              i("protocol-less url %s", e);
              if ("undefined" != typeof t) {
                e = t.protocol + "//" + e
              } else {
                e = "https://" + e
              }
            }
            i("parse %s", e);
            s = r(e)
          }
          if (!s.port) {
            if (/^(http|ws)$/.test(s.protocol)) {
              s.port = "80"
            } else if (/^(http|ws)s$/.test(s.protocol)) {
              s.port = "443"
            }
          }
          s.path = s.path || "/";
          s.id = s.protocol + "://" + s.host + ":" + s.port;
          s.href = s.protocol + "://" + s.host + (t && t.port == s.port ? "" : ":" + s.port);
          return s
        }
        var r = e("parseuri");
        var i = e("debug")("socket.io-client:url");
        t.exports = s
      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {
      debug: 9,
      parseuri: 41
    }],
    7: [function(e, t, n) {
      var r = [].slice;
      t.exports = function(e, t) {
        if ("string" == typeof t) t = e[t];
        if ("function" != typeof t) throw new Error("bind() requires a function");
        var n = r.call(arguments, 2);
        return function() {
          return t.apply(e, n.concat(r.call(arguments)))
        }
      }
    }, {}],
    8: [function(e, t, n) {
      function r(e) {
        if (e) return i(e)
      }

      function i(e) {
        for (var t in r.prototype) {
          e[t] = r.prototype[t]
        }
        return e
      }
      t.exports = r;
      r.prototype.on = r.prototype.addEventListener = function(e, t) {
        this._callbacks = this._callbacks || {};
        (this._callbacks[e] = this._callbacks[e] || []).push(t);
        return this
      };
      r.prototype.once = function(e, t) {
        function r() {
          n.off(e, r);
          t.apply(this, arguments)
        }
        var n = this;
        this._callbacks = this._callbacks || {};
        r.fn = t;
        this.on(e, r);
        return this
      };
      r.prototype.off = r.prototype.removeListener = r.prototype.removeAllListeners = r.prototype.removeEventListener = function(e, t) {
        this._callbacks = this._callbacks || {};
        if (0 == arguments.length) {
          this._callbacks = {};
          return this
        }
        var n = this._callbacks[e];
        if (!n) return this;
        if (1 == arguments.length) {
          delete this._callbacks[e];
          return this
        }
        var r;
        for (var i = 0; i < n.length; i++) {
          r = n[i];
          if (r === t || r.fn === t) {
            n.splice(i, 1);
            break
          }
        }
        return this
      };
      r.prototype.emit = function(e) {
        this._callbacks = this._callbacks || {};
        var t = [].slice.call(arguments, 1),
          n = this._callbacks[e];
        if (n) {
          n = n.slice(0);
          for (var r = 0, i = n.length; r < i; ++r) {
            n[r].apply(this, t)
          }
        }
        return this
      };
      r.prototype.listeners = function(e) {
        this._callbacks = this._callbacks || {};
        return this._callbacks[e] || []
      };
      r.prototype.hasListeners = function(e) {
        return !!this.listeners(e).length
      }
    }, {}],
    9: [function(e, t, n) {
      function r(e) {
        if (!r.enabled(e)) return function() {};
        return function(t) {
          t = i(t);
          var n = new Date;
          var s = n - (r[e] || n);
          r[e] = n;
          t = e + " " + t + " +" + r.humanize(s);
          window.console && console.log && Function.prototype.apply.call(console.log, console, arguments)
        }
      }

      function i(e) {
        if (e instanceof Error) return e.stack || e.message;
        return e
      }
      t.exports = r;
      r.names = [];
      r.skips = [];
      r.enable = function(e) {
        try {
          localStorage.debug = e
        } catch (t) {}
        var n = (e || "").split(/[\s,]+/),
          i = n.length;
        for (var s = 0; s < i; s++) {
          e = n[s].replace("*", ".*?");
          if (e[0] === "-") {
            r.skips.push(new RegExp("^" + e.substr(1) + "$"))
          } else {
            r.names.push(new RegExp("^" + e + "$"))
          }
        }
      };
      r.disable = function() {
        r.enable("")
      };
      r.humanize = function(e) {
        var t = 1e3,
          n = 60 * 1e3,
          r = 60 * n;
        if (e >= r) return (e / r).toFixed(1) + "h";
        if (e >= n) return (e / n).toFixed(1) + "m";
        if (e >= t) return (e / t | 0) + "s";
        return e + "ms"
      };
      r.enabled = function(e) {
        for (var t = 0, n = r.skips.length; t < n; t++) {
          if (r.skips[t].test(e)) {
            return false
          }
        }
        for (var t = 0, n = r.names.length; t < n; t++) {
          if (r.names[t].test(e)) {
            return true
          }
        }
        return false
      };
      try {
        if (window.localStorage) r.enable(localStorage.debug)
      } catch (s) {}
    }, {}],
    10: [function(e, t, n) {
      t.exports = e("./lib/")
    }, {
      "./lib/": 11
    }],
    11: [function(e, t, n) {
      t.exports = e("./socket");
      t.exports.parser = e("engine.io-parser")
    }, {
      "./socket": 12,
      "engine.io-parser": 24
    }],
    12: [function(e, t, n) {
      (function(n) {
        function c() {}

        function h(e, t) {
          if (!(this instanceof h)) return new h(e, t);
          t = t || {};
          if (e && "object" == typeof e) {
            t = e;
            e = null
          }
          if (e) {
            e = a(e);
            t.host = e.host;
            t.secure = e.protocol == "https" || e.protocol == "wss";
            t.port = e.port;
            if (e.query) t.query = e.query
          }
          this.secure = null != t.secure ? t.secure : n.location && "https:" == location.protocol;
          if (t.host) {
            var r = t.host.split(":");
            t.hostname = r.shift();
            if (r.length) t.port = r.pop()
          }
          this.agent = t.agent || false;
          this.hostname = t.hostname || (n.location ? location.hostname : "localhost");
          this.port = t.port || (n.location && location.port ? location.port : this.secure ? 443 : 80);
          this.query = t.query || {};
          if ("string" == typeof this.query) this.query = l.decode(this.query);
          this.upgrade = false !== t.upgrade;
          this.path = (t.path || "/engine.io").replace(/\/$/, "") + "/";
          this.forceJSONP = !!t.forceJSONP;
          this.jsonp = false !== t.jsonp;
          this.forceBase64 = !!t.forceBase64;
          this.enablesXDR = !!t.enablesXDR;
          this.timestampParam = t.timestampParam || "t";
          this.timestampRequests = t.timestampRequests;
          this.transports = t.transports || ["polling", "websocket"];
          this.readyState = "";
          this.writeBuffer = [];
          this.callbackBuffer = [];
          this.policyPort = t.policyPort || 843;
          this.rememberUpgrade = t.rememberUpgrade || false;
          this.open();
          this.binaryType = null;
          this.onlyBinaryUpgrades = t.onlyBinaryUpgrades
        }

        function p(e) {
          var t = {};
          for (var n in e) {
            if (e.hasOwnProperty(n)) {
              t[n] = e[n]
            }
          }
          return t
        }
        var r = e("./transports");
        var i = e("component-emitter");
        var s = e("debug")("engine.io-client:socket");
        var o = e("indexof");
        var u = e("engine.io-parser");
        var a = e("parseuri");
        var f = e("parsejson");
        var l = e("parseqs");
        t.exports = h;
        h.priorWebsocketSuccess = false;
        i(h.prototype);
        h.protocol = u.protocol;
        h.Socket = h;
        h.Transport = e("./transport");
        h.transports = e("./transports");
        h.parser = e("engine.io-parser");
        h.prototype.createTransport = function(e) {
          s('creating transport "%s"', e);
          var t = p(this.query);
          t.EIO = u.protocol;
          t.transport = e;
          if (this.id) t.sid = this.id;
          var n = new r[e]({
            agent: this.agent,
            hostname: this.hostname,
            port: this.port,
            secure: this.secure,
            path: this.path,
            query: t,
            forceJSONP: this.forceJSONP,
            jsonp: this.jsonp,
            forceBase64: this.forceBase64,
            enablesXDR: this.enablesXDR,
            timestampRequests: this.timestampRequests,
            timestampParam: this.timestampParam,
            policyPort: this.policyPort,
            socket: this
          });
          return n
        };
        h.prototype.open = function() {
          var e;
          if (this.rememberUpgrade && h.priorWebsocketSuccess && this.transports.indexOf("websocket") != -1) {
            e = "websocket"
          } else if (0 == this.transports.length) {
            var t = this;
            setTimeout(function() {
              t.emit("error", "No transports available")
            }, 0);
            return
          } else {
            e = this.transports[0]
          }
          this.readyState = "opening";
          var e;
          try {
            e = this.createTransport(e)
          } catch (n) {
            this.transports.shift();
            this.open();
            return
          }
          e.open();
          this.setTransport(e)
        };
        h.prototype.setTransport = function(e) {
          s("setting transport %s", e.name);
          var t = this;
          if (this.transport) {
            s("clearing existing transport %s", this.transport.name);
            this.transport.removeAllListeners()
          }
          this.transport = e;
          e.on("drain", function() {
            t.onDrain()
          }).on("packet", function(e) {
            t.onPacket(e)
          }).on("error", function(e) {
            t.onError(e)
          }).on("close", function() {
            t.onClose("transport close")
          })
        };
        h.prototype.probe = function(e) {
          function i() {
            if (r.onlyBinaryUpgrades) {
              var i = !this.supportsBinary && r.transport.supportsBinary;
              n = n || i
            }
            if (n) return;
            s('probe transport "%s" opened', e);
            t.send([{
              type: "ping",
              data: "probe"
            }]);
            t.once("packet", function(i) {
              if (n) return;
              if ("pong" == i.type && "probe" == i.data) {
                s('probe transport "%s" pong', e);
                r.upgrading = true;
                r.emit("upgrading", t);
                if (!t) return;
                h.priorWebsocketSuccess = "websocket" == t.name;
                s('pausing current transport "%s"', r.transport.name);
                r.transport.pause(function() {
                  if (n) return;
                  if ("closed" == r.readyState) return;
                  s("changing transport and sending upgrade packet");
                  c();
                  r.setTransport(t);
                  t.send([{
                    type: "upgrade"
                  }]);
                  r.emit("upgrade", t);
                  t = null;
                  r.upgrading = false;
                  r.flush()
                })
              } else {
                s('probe transport "%s" failed', e);
                var o = new Error("probe error");
                o.transport = t.name;
                r.emit("upgradeError", o)
              }
            })
          }

          function o() {
            if (n) return;
            n = true;
            c();
            t.close();
            t = null
          }

          function u(n) {
            var i = new Error("probe error: " + n);
            i.transport = t.name;
            o();
            s('probe transport "%s" failed because of error: %s', e, n);
            r.emit("upgradeError", i)
          }

          function a() {
            u("transport closed")
          }

          function f() {
            u("socket closed")
          }

          function l(e) {
            if (t && e.name != t.name) {
              s('"%s" works - aborting "%s"', e.name, t.name);
              o()
            }
          }

          function c() {
            t.removeListener("open", i);
            t.removeListener("error", u);
            t.removeListener("close", a);
            r.removeListener("close", f);
            r.removeListener("upgrading", l)
          }
          s('probing transport "%s"', e);
          var t = this.createTransport(e, {
              probe: 1
            }),
            n = false,
            r = this;
          h.priorWebsocketSuccess = false;
          t.once("open", i);
          t.once("error", u);
          t.once("close", a);
          this.once("close", f);
          this.once("upgrading", l);
          t.open()
        };
        h.prototype.onOpen = function() {
          s("socket open");
          this.readyState = "open";
          h.priorWebsocketSuccess = "websocket" == this.transport.name;
          this.emit("open");
          this.flush();
          if ("open" == this.readyState && this.upgrade && this.transport.pause) {
            s("starting upgrade probes");
            for (var e = 0, t = this.upgrades.length; e < t; e++) {
              this.probe(this.upgrades[e])
            }
          }
        };
        h.prototype.onPacket = function(e) {
          if ("opening" == this.readyState || "open" == this.readyState) {
            s('socket receive: type "%s", data "%s"', e.type, e.data);
            this.emit("packet", e);
            this.emit("heartbeat");
            switch (e.type) {
              case "open":
                this.onHandshake(f(e.data));
                break;
              case "pong":
                this.setPing();
                break;
              case "error":
                var t = new Error("server error");
                t.code = e.data;
                this.emit("error", t);
                break;
              case "message":
                this.emit("data", e.data);
                this.emit("message", e.data);
                break
            }
          } else {
            s('packet received with socket readyState "%s"', this.readyState)
          }
        };
        h.prototype.onHandshake = function(e) {
          this.emit("handshake", e);
          this.id = e.sid;
          this.transport.query.sid = e.sid;
          this.upgrades = this.filterUpgrades(e.upgrades);
          this.pingInterval = e.pingInterval;
          this.pingTimeout = e.pingTimeout;
          this.onOpen();
          if ("closed" == this.readyState) return;
          this.setPing();
          this.removeListener("heartbeat", this.onHeartbeat);
          this.on("heartbeat", this.onHeartbeat)
        };
        h.prototype.onHeartbeat = function(e) {
          clearTimeout(this.pingTimeoutTimer);
          var t = this;
          t.pingTimeoutTimer = setTimeout(function() {
            if ("closed" == t.readyState) return;
            t.onClose("ping timeout")
          }, e || t.pingInterval + t.pingTimeout)
        };
        h.prototype.setPing = function() {
          var e = this;
          clearTimeout(e.pingIntervalTimer);
          e.pingIntervalTimer = setTimeout(function() {
            s("writing ping packet - expecting pong within %sms", e.pingTimeout);
            e.ping();
            e.onHeartbeat(e.pingTimeout)
          }, e.pingInterval)
        };
        h.prototype.ping = function() {
          this.sendPacket("ping")
        };
        h.prototype.onDrain = function() {
          for (var e = 0; e < this.prevBufferLen; e++) {
            if (this.callbackBuffer[e]) {
              this.callbackBuffer[e]()
            }
          }
          this.writeBuffer.splice(0, this.prevBufferLen);
          this.callbackBuffer.splice(0, this.prevBufferLen);
          this.prevBufferLen = 0;
          if (this.writeBuffer.length == 0) {
            this.emit("drain")
          } else {
            this.flush()
          }
        };
        h.prototype.flush = function() {
          if ("closed" != this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
            s("flushing %d packets in socket", this.writeBuffer.length);
            this.transport.send(this.writeBuffer);
            this.prevBufferLen = this.writeBuffer.length;
            this.emit("flush")
          }
        };
        h.prototype.write = h.prototype.send = function(e, t) {
          this.sendPacket("message", e, t);
          return this
        };
        h.prototype.sendPacket = function(e, t, n) {
          if ("closing" == this.readyState || "closed" == this.readyState) {
            return
          }
          var r = {
            type: e,
            data: t
          };
          this.emit("packetCreate", r);
          this.writeBuffer.push(r);
          this.callbackBuffer.push(n);
          this.flush()
        };
        h.prototype.close = function() {
          if ("opening" == this.readyState || "open" == this.readyState) {
            this.readyState = "closing";
            var e = this;

            function t() {
              e.onClose("forced close");
              s("socket closing - telling transport to close");
              e.transport.close()
            }

            function n() {
              e.removeListener("upgrade", n);
              e.removeListener("upgradeError", n);
              t()
            }

            function r() {
              e.once("upgrade", n);
              e.once("upgradeError", n)
            }
            if (this.writeBuffer.length) {
              this.once("drain", function() {
                if (this.upgrading) {
                  r()
                } else {
                  t()
                }
              })
            } else if (this.upgrading) {
              r()
            } else {
              t()
            }
          }
          return this
        };
        h.prototype.onError = function(e) {
          s("socket error %j", e);
          h.priorWebsocketSuccess = false;
          this.emit("error", e);
          this.onClose("transport error", e)
        };
        h.prototype.onClose = function(e, t) {
          if ("opening" == this.readyState || "open" == this.readyState || "closing" == this.readyState) {
            s('socket close with reason: "%s"', e);
            var n = this;
            clearTimeout(this.pingIntervalTimer);
            clearTimeout(this.pingTimeoutTimer);
            setTimeout(function() {
              n.writeBuffer = [];
              n.callbackBuffer = [];
              n.prevBufferLen = 0
            }, 0);
            this.transport.removeAllListeners("close");
            this.transport.close();
            this.transport.removeAllListeners();
            this.readyState = "closed";
            this.id = null;
            this.emit("close", e, t)
          }
        };
        h.prototype.filterUpgrades = function(e) {
          var t = [];
          for (var n = 0, r = e.length; n < r; n++) {
            if (~o(this.transports, e[n])) t.push(e[n])
          }
          return t
        }
      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {
      "./transport": 13,
      "./transports": 14,
      "component-emitter": 8,
      debug: 21,
      "engine.io-parser": 24,
      indexof: 39,
      parsejson: 31,
      parseqs: 32,
      parseuri: 33
    }],
    13: [function(e, t, n) {
      function s(e) {
        this.path = e.path;
        this.hostname = e.hostname;
        this.port = e.port;
        this.secure = e.secure;
        this.query = e.query;
        this.timestampParam = e.timestampParam;
        this.timestampRequests = e.timestampRequests;
        this.readyState = "";
        this.agent = e.agent || false;
        this.socket = e.socket;
        this.enablesXDR = e.enablesXDR
      }
      var r = e("engine.io-parser");
      var i = e("component-emitter");
      t.exports = s;
      i(s.prototype);
      s.timestamps = 0;
      s.prototype.onError = function(e, t) {
        var n = new Error(e);
        n.type = "TransportError";
        n.description = t;
        this.emit("error", n);
        return this
      };
      s.prototype.open = function() {
        if ("closed" == this.readyState || "" == this.readyState) {
          this.readyState = "opening";
          this.doOpen()
        }
        return this
      };
      s.prototype.close = function() {
        if ("opening" == this.readyState || "open" == this.readyState) {
          this.doClose();
          this.onClose()
        }
        return this
      };
      s.prototype.send = function(e) {
        if ("open" == this.readyState) {
          this.write(e)
        } else {
          throw new Error("Transport not open")
        }
      };
      s.prototype.onOpen = function() {
        this.readyState = "open";
        this.writable = true;
        this.emit("open")
      };
      s.prototype.onData = function(e) {
        var t = r.decodePacket(e, this.socket.binaryType);
        this.onPacket(t)
      };
      s.prototype.onPacket = function(e) {
        this.emit("packet", e)
      };
      s.prototype.onClose = function() {
        this.readyState = "closed";
        this.emit("close")
      }
    }, {
      "component-emitter": 8,
      "engine.io-parser": 24
    }],
    14: [function(e, t, n) {
      (function(t) {
        function u(e) {
          var n;
          var o = false;
          var u = false;
          var a = false !== e.jsonp;
          if (t.location) {
            var f = "https:" == location.protocol;
            var l = location.port;
            if (!l) {
              l = f ? 443 : 80
            }
            o = e.hostname != location.hostname || l != e.port;
            u = e.secure != f
          }
          e.xdomain = o;
          e.xscheme = u;
          n = new r(e);
          if ("open" in n && !e.forceJSONP) {
            return new i(e)
          } else {
            if (!a) throw new Error("JSONP disabled");
            return new s(e)
          }
        }
        var r = e("xmlhttprequest");
        var i = e("./polling-xhr");
        var s = e("./polling-jsonp");
        var o = e("./websocket");
        n.polling = u;
        n.websocket = o
      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {
      "./polling-jsonp": 15,
      "./polling-xhr": 16,
      "./websocket": 18,
      xmlhttprequest: 19
    }],
    15: [function(e, t, n) {
      (function(n) {
        function f() {}

        function l(e) {
          r.call(this, e);
          this.query = this.query || {};
          if (!u) {
            if (!n.___eio) n.___eio = [];
            u = n.___eio
          }
          this.index = u.length;
          var t = this;
          u.push(function(e) {
            t.onData(e)
          });
          this.query.j = this.index;
          if (n.document && n.addEventListener) {
            n.addEventListener("beforeunload", function() {
              if (t.script) t.script.onerror = f
            }, false)
          }
        }
        var r = e("./polling");
        var i = e("component-inherit");
        t.exports = l;
        var s = /\n/g;
        var o = /\\n/g;
        var u;
        var a = 0;
        i(l, r);
        l.prototype.supportsBinary = false;
        l.prototype.doClose = function() {
          if (this.script) {
            this.script.parentNode.removeChild(this.script);
            this.script = null
          }
          if (this.form) {
            this.form.parentNode.removeChild(this.form);
            this.form = null;
            this.iframe = null
          }
          r.prototype.doClose.call(this)
        };
        l.prototype.doPoll = function() {
          var e = this;
          var t = document.createElement("script");
          if (this.script) {
            this.script.parentNode.removeChild(this.script);
            this.script = null
          }
          t.async = true;
          t.src = this.uri();
          t.onerror = function(t) {
            e.onError("jsonp poll error", t)
          };
          var n = document.getElementsByTagName("script")[0];
          n.parentNode.insertBefore(t, n);
          this.script = t;
          var r = "undefined" != typeof navigator && /gecko/i.test(navigator.userAgent);
          if (r) {
            setTimeout(function() {
              var e = document.createElement("iframe");
              document.body.appendChild(e);
              document.body.removeChild(e)
            }, 100)
          }
        };
        l.prototype.doWrite = function(e, t) {
          function f() {
            l();
            t()
          }

          function l() {
            if (n.iframe) {
              try {
                n.form.removeChild(n.iframe)
              } catch (e) {
                n.onError("jsonp polling iframe removal error", e)
              }
            }
            try {
              var t = '<iframe src="javascript:0" name="' + n.iframeId + '">';
              a = document.createElement(t)
            } catch (e) {
              a = document.createElement("iframe");
              a.name = n.iframeId;
              a.src = "javascript:0"
            }
            a.id = n.iframeId;
            n.form.appendChild(a);
            n.iframe = a
          }
          var n = this;
          if (!this.form) {
            var r = document.createElement("form");
            var i = document.createElement("textarea");
            var u = this.iframeId = "eio_iframe_" + this.index;
            var a;
            r.className = "socketio";
            r.style.position = "absolute";
            r.style.top = "-1000px";
            r.style.left = "-1000px";
            r.target = u;
            r.method = "POST";
            r.setAttribute("accept-charset", "utf-8");
            i.name = "d";
            r.appendChild(i);
            document.body.appendChild(r);
            this.form = r;
            this.area = i
          }
          this.form.action = this.uri();
          l();
          e = e.replace(o, "\\\n");
          this.area.value = e.replace(s, "\\n");
          try {
            this.form.submit()
          } catch (c) {}
          if (this.iframe.attachEvent) {
            this.iframe.onreadystatechange = function() {
              if (n.iframe.readyState == "complete") {
                f()
              }
            }
          } else {
            this.iframe.onload = f
          }
        }
      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {
      "./polling": 17,
      "component-inherit": 20
    }],
    16: [function(e, t, n) {
      (function(n) {
        function a() {}

        function f(e) {
          i.call(this, e);
          if (n.location) {
            var t = "https:" == location.protocol;
            var r = location.port;
            if (!r) {
              r = t ? 443 : 80
            }
            this.xd = e.hostname != n.location.hostname || r != e.port;
            this.xs = e.secure != t
          }
        }

        function l(e) {
          this.method = e.method || "GET";
          this.uri = e.uri;
          this.xd = !!e.xd;
          this.xs = !!e.xs;
          this.async = false !== e.async;
          this.data = undefined != e.data ? e.data : null;
          this.agent = e.agent;
          this.isBinary = e.isBinary;
          this.supportsBinary = e.supportsBinary;
          this.enablesXDR = e.enablesXDR;
          this.create()
        }

        function c() {
          for (var e in l.requests) {
            if (l.requests.hasOwnProperty(e)) {
              l.requests[e].abort()
            }
          }
        }
        var r = e("xmlhttprequest");
        var i = e("./polling");
        var s = e("component-emitter");
        var o = e("component-inherit");
        var u = e("debug")("engine.io-client:polling-xhr");
        t.exports = f;
        t.exports.Request = l;
        o(f, i);
        f.prototype.supportsBinary = true;
        f.prototype.request = function(e) {
          e = e || {};
          e.uri = this.uri();
          e.xd = this.xd;
          e.xs = this.xs;
          e.agent = this.agent || false;
          e.supportsBinary = this.supportsBinary;
          e.enablesXDR = this.enablesXDR;
          return new l(e)
        };
        f.prototype.doWrite = function(e, t) {
          var n = typeof e !== "string" && e !== undefined;
          var r = this.request({
            method: "POST",
            data: e,
            isBinary: n
          });
          var i = this;
          r.on("success", t);
          r.on("error", function(e) {
            i.onError("xhr post error", e)
          });
          this.sendXhr = r
        };
        f.prototype.doPoll = function() {
          u("xhr poll");
          var e = this.request();
          var t = this;
          e.on("data", function(e) {
            t.onData(e)
          });
          e.on("error", function(e) {
            t.onError("xhr poll error", e)
          });
          this.pollXhr = e
        };
        s(l.prototype);
        l.prototype.create = function() {
          var e = this.xhr = new r({
            agent: this.agent,
            xdomain: this.xd,
            xscheme: this.xs,
            enablesXDR: this.enablesXDR
          });
          var t = this;
          try {
            u("xhr open %s: %s", this.method, this.uri);
            e.open(this.method, this.uri, this.async);
            if (this.supportsBinary) {
              e.responseType = "arraybuffer"
            }
            if ("POST" == this.method) {
              try {
                if (this.isBinary) {
                  e.setRequestHeader("Content-type", "application/octet-stream")
                } else {
                  e.setRequestHeader("Content-type", "text/plain;charset=UTF-8")
                }
              } catch (i) {}
            }
            if ("withCredentials" in e) {
              e.withCredentials = true
            }
            if (this.hasXDR()) {
              e.onload = function() {
                t.onLoad()
              };
              e.onerror = function() {
                t.onError(e.responseText)
              }
            } else {
              e.onreadystatechange = function() {
                if (4 != e.readyState) return;
                if (200 == e.status || 1223 == e.status) {
                  t.onLoad()
                } else {
                  setTimeout(function() {
                    t.onError(e.status)
                  }, 0)
                }
              }
            }
            u("xhr data %s", this.data);
            e.send(this.data)
          } catch (i) {
            setTimeout(function() {
              t.onError(i)
            }, 0);
            return
          }
          if (n.document) {
            this.index = l.requestsCount++;
            l.requests[this.index] = this
          }
        };
        l.prototype.onSuccess = function() {
          this.emit("success");
          this.cleanup()
        };
        l.prototype.onData = function(e) {
          this.emit("data", e);
          this.onSuccess()
        };
        l.prototype.onError = function(e) {
          this.emit("error", e);
          this.cleanup()
        };
        l.prototype.cleanup = function() {
          if ("undefined" == typeof this.xhr || null === this.xhr) {
            return
          }
          if (this.hasXDR()) {
            this.xhr.onload = this.xhr.onerror = a
          } else {
            this.xhr.onreadystatechange = a
          }
          try {
            this.xhr.abort()
          } catch (e) {}
          if (n.document) {
            delete l.requests[this.index]
          }
          this.xhr = null
        };
        l.prototype.onLoad = function() {
          var e;
          try {
            var t;
            try {
              t = this.xhr.getResponseHeader("Content-Type").split(";")[0]
            } catch (n) {}
            if (t === "application/octet-stream") {
              e = this.xhr.response
            } else {
              if (!this.supportsBinary) {
                e = this.xhr.responseText
              } else {
                e = "ok"
              }
            }
          } catch (n) {
            this.onError(n)
          }
          if (null != e) {
            this.onData(e)
          }
        };
        l.prototype.hasXDR = function() {
          return "undefined" !== typeof n.XDomainRequest && !this.xs && this.enablesXDR
        };
        l.prototype.abort = function() {
          this.cleanup()
        };
        if (n.document) {
          l.requestsCount = 0;
          l.requests = {};
          if (n.attachEvent) {
            n.attachEvent("onunload", c)
          } else if (n.addEventListener) {
            n.addEventListener("beforeunload", c, false)
          }
        }
      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {
      "./polling": 17,
      "component-emitter": 8,
      "component-inherit": 20,
      debug: 21,
      xmlhttprequest: 19
    }],
    17: [function(e, t, n) {
      function f(e) {
        var t = e && e.forceBase64;
        if (!a || t) {
          this.supportsBinary = false
        }
        r.call(this, e)
      }
      var r = e("../transport");
      var i = e("parseqs");
      var s = e("engine.io-parser");
      var o = e("component-inherit");
      var u = e("debug")("engine.io-client:polling");
      t.exports = f;
      var a = function() {
        var t = e("xmlhttprequest");
        var n = new t({
          xdomain: false
        });
        return null != n.responseType
      }();
      o(f, r);
      f.prototype.name = "polling";
      f.prototype.doOpen = function() {
        this.poll()
      };
      f.prototype.pause = function(e) {
        function r() {
          u("paused");
          n.readyState = "paused";
          e()
        }
        var t = 0;
        var n = this;
        this.readyState = "pausing";
        if (this.polling || !this.writable) {
          var i = 0;
          if (this.polling) {
            u("we are currently polling - waiting to pause");
            i++;
            this.once("pollComplete", function() {
              u("pre-pause polling complete");
              --i || r()
            })
          }
          if (!this.writable) {
            u("we are currently writing - waiting to pause");
            i++;
            this.once("drain", function() {
              u("pre-pause writing complete");
              --i || r()
            })
          }
        } else {
          r()
        }
      };
      f.prototype.poll = function() {
        u("polling");
        this.polling = true;
        this.doPoll();
        this.emit("poll")
      };
      f.prototype.onData = function(e) {
        var t = this;
        u("polling got data %s", e);
        var n = function(e, n, r) {
          if ("opening" == t.readyState) {
            t.onOpen()
          }
          if ("close" == e.type) {
            t.onClose();
            return false
          }
          t.onPacket(e)
        };
        s.decodePayload(e, this.socket.binaryType, n);
        if ("closed" != this.readyState) {
          this.polling = false;
          this.emit("pollComplete");
          if ("open" == this.readyState) {
            this.poll()
          } else {
            u('ignoring poll - transport state "%s"', this.readyState)
          }
        }
      };
      f.prototype.doClose = function() {
        function t() {
          u("writing close packet");
          e.write([{
            type: "close"
          }])
        }
        var e = this;
        if ("open" == this.readyState) {
          u("transport open - closing");
          t()
        } else {
          u("transport not open - deferring close");
          this.once("open", t)
        }
      };
      f.prototype.write = function(e) {
        var t = this;
        this.writable = false;
        var n = function() {
          t.writable = true;
          t.emit("drain")
        };
        var t = this;
        s.encodePayload(e, this.supportsBinary, function(e) {
          t.doWrite(e, n)
        })
      };
      f.prototype.uri = function() {
        var e = this.query || {};
        var t = this.secure ? "https" : "http";
        var n = "";
        if (false !== this.timestampRequests) {
          e[this.timestampParam] = +(new Date) + "-" + r.timestamps++
        }
        if (!this.supportsBinary && !e.sid) {
          e.b64 = 1
        }
        e = i.encode(e);
        if (this.port && ("https" == t && this.port != 443 || "http" == t && this.port != 80)) {
          n = ":" + this.port
        }
        if (e.length) {
          e = "?" + e
        }
        return t + "://" + this.hostname + n + this.path + e
      }
    }, {
      "../transport": 13,
      "component-inherit": 20,
      debug: 21,
      "engine.io-parser": 24,
      parseqs: 32,
      xmlhttprequest: 19
    }],
    18: [function(e, t, n) {
      function f(e) {
        var t = e && e.forceBase64;
        if (t) {
          this.supportsBinary = false
        }
        r.call(this, e)
      }
      var r = e("../transport");
      var i = e("engine.io-parser");
      var s = e("parseqs");
      var o = e("component-inherit");
      var u = e("debug")("engine.io-client:websocket");
      var a = e("ws");
      t.exports = f;
      o(f, r);
      f.prototype.name = "websocket";
      f.prototype.supportsBinary = true;
      f.prototype.doOpen = function() {
        if (!this.check()) {
          return
        }
        var e = this;
        var t = this.uri();
        var n = void 0;
        var r = {
          agent: this.agent
        };
        this.ws = new a(t, n, r);
        if (this.ws.binaryType === undefined) {
          this.supportsBinary = false
        }
        this.ws.binaryType = "arraybuffer";
        this.addEventListeners()
      };
      f.prototype.addEventListeners = function() {
        var e = this;
        this.ws.onopen = function() {
          e.onOpen()
        };
        this.ws.onclose = function() {
          e.onClose()
        };
        this.ws.onmessage = function(t) {
          e.onData(t.data)
        };
        this.ws.onerror = function(t) {
          e.onError("websocket error", t)
        }
      };
      if ("undefined" != typeof navigator && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
        f.prototype.onData = function(e) {
          var t = this;
          setTimeout(function() {
            r.prototype.onData.call(t, e)
          }, 0)
        }
      }
      f.prototype.write = function(e) {
        function s() {
          t.writable = true;
          t.emit("drain")
        }
        var t = this;
        this.writable = false;
        for (var n = 0, r = e.length; n < r; n++) {
          i.encodePacket(e[n], this.supportsBinary, function(e) {
            try {
              t.ws.send(e)
            } catch (n) {
              u("websocket closed before onclose event")
            }
          })
        }
        setTimeout(s, 0)
      };
      f.prototype.onClose = function() {
        r.prototype.onClose.call(this)
      };
      f.prototype.doClose = function() {
        if (typeof this.ws !== "undefined") {
          this.ws.close()
        }
      };
      f.prototype.uri = function() {
        var e = this.query || {};
        var t = this.secure ? "wss" : "ws";
        var n = "";
        if (this.port && ("wss" == t && this.port != 443 || "ws" == t && this.port != 80)) {
          n = ":" + this.port
        }
        if (this.timestampRequests) {
          e[this.timestampParam] = +(new Date)
        }
        if (!this.supportsBinary) {
          e.b64 = 1
        }
        e = s.encode(e);
        if (e.length) {
          e = "?" + e
        }
        return t + "://" + this.hostname + n + this.path + e
      };
      f.prototype.check = function() {
        return !!a && !("__initialize" in a && this.name === f.prototype.name)
      }
    }, {
      "../transport": 13,
      "component-inherit": 20,
      debug: 21,
      "engine.io-parser": 24,
      parseqs: 32,
      ws: 34
    }],
    19: [function(e, t, n) {
      var r = e("has-cors");
      t.exports = function(e) {
        var t = e.xdomain;
        var n = e.xscheme;
        var i = e.enablesXDR;
        try {
          if ("undefined" != typeof XMLHttpRequest && (!t || r)) {
            return new XMLHttpRequest
          }
        } catch (s) {}
        try {
          if ("undefined" != typeof XDomainRequest && !n && i) {
            return new XDomainRequest
          }
        } catch (s) {}
        if (!t) {
          try {
            return new ActiveXObject("Microsoft.XMLHTTP")
          } catch (s) {}
        }
      }
    }, {
      "has-cors": 37
    }],
    20: [function(e, t, n) {
      t.exports = function(e, t) {
        var n = function() {};
        n.prototype = t.prototype;
        e.prototype = new n;
        e.prototype.constructor = e
      }
    }, {}],
    21: [function(e, t, n) {
      function r() {
        return "WebkitAppearance" in document.documentElement.style || window.console && (console.firebug || console.exception && console.table) || navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31
      }

      function i() {
        var e = arguments;
        var t = this.useColors;
        e[0] = (t ? "%c" : "") + this.namespace + (t ? " %c" : " ") + e[0] + (t ? "%c " : " ") + "+" + n.humanize(this.diff);
        if (!t) return e;
        var r = "color: " + this.color;
        e = [e[0], r, "color: inherit"].concat(Array.prototype.slice.call(e, 1));
        var i = 0;
        var s = 0;
        e[0].replace(/%[a-z%]/g, function(e) {
          if ("%" === e) return;
          i++;
          if ("%c" === e) {
            s = i
          }
        });
        e.splice(s, 0, r);
        return e
      }

      function s() {
        return "object" == typeof console && "function" == typeof console.log && Function.prototype.apply.call(console.log, console, arguments)
      }

      function o(e) {
        try {
          if (null == e) {
            localStorage.removeItem("debug")
          } else {
            localStorage.debug = e
          }
        } catch (t) {}
      }

      function u() {
        var e;
        try {
          e = localStorage.debug
        } catch (t) {}
        return e
      }
      n = t.exports = e("./debug");
      n.log = s;
      n.formatArgs = i;
      n.save = o;
      n.load = u;
      n.useColors = r;
      n.colors = ["lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson"];
      n.formatters.j = function(e) {
        return JSON.stringify(e)
      };
      n.enable(u())
    }, {
      "./debug": 22
    }],
    22: [function(e, t, n) {
      function s() {
        return n.colors[r++ % n.colors.length]
      }

      function o(e) {
        function t() {}

        function r() {
          var e = r;
          var t = +(new Date);
          var o = t - (i || t);
          e.diff = o;
          e.prev = i;
          e.curr = t;
          i = t;
          if (null == e.useColors) e.useColors = n.useColors();
          if (null == e.color && e.useColors) e.color = s();
          var u = Array.prototype.slice.call(arguments);
          u[0] = n.coerce(u[0]);
          if ("string" !== typeof u[0]) {
            u = ["%o"].concat(u)
          }
          var a = 0;
          u[0] = u[0].replace(/%([a-z%])/g, function(t, r) {
            if (t === "%") return t;
            a++;
            var i = n.formatters[r];
            if ("function" === typeof i) {
              var s = u[a];
              t = i.call(e, s);
              u.splice(a, 1);
              a--
            }
            return t
          });
          if ("function" === typeof n.formatArgs) {
            u = n.formatArgs.apply(e, u)
          }
          var f = r.log || n.log || console.log.bind(console);
          f.apply(e, u)
        }
        t.enabled = false;
        r.enabled = true;
        var o = n.enabled(e) ? r : t;
        o.namespace = e;
        return o
      }

      function u(e) {
        n.save(e);
        var t = (e || "").split(/[\s,]+/);
        var r = t.length;
        for (var i = 0; i < r; i++) {
          if (!t[i]) continue;
          e = t[i].replace(/\*/g, ".*?");
          if (e[0] === "-") {
            n.skips.push(new RegExp("^" + e.substr(1) + "$"))
          } else {
            n.names.push(new RegExp("^" + e + "$"))
          }
        }
      }

      function a() {
        n.enable("")
      }

      function f(e) {
        var t, r;
        for (t = 0, r = n.skips.length; t < r; t++) {
          if (n.skips[t].test(e)) {
            return false
          }
        }
        for (t = 0, r = n.names.length; t < r; t++) {
          if (n.names[t].test(e)) {
            return true
          }
        }
        return false
      }

      function l(e) {
        if (e instanceof Error) return e.stack || e.message;
        return e
      }
      n = t.exports = o;
      n.coerce = l;
      n.disable = a;
      n.enable = u;
      n.enabled = f;
      n.humanize = e("ms");
      n.names = [];
      n.skips = [];
      n.formatters = {};
      var r = 0;
      var i
    }, {
      ms: 23
    }],
    23: [function(e, t, n) {
      function a(e) {
        var t = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(e);
        if (!t) return;
        var n = parseFloat(t[1]);
        var a = (t[2] || "ms").toLowerCase();
        switch (a) {
          case "years":
          case "year":
          case "y":
            return n * u;
          case "days":
          case "day":
          case "d":
            return n * o;
          case "hours":
          case "hour":
          case "h":
            return n * s;
          case "minutes":
          case "minute":
          case "m":
            return n * i;
          case "seconds":
          case "second":
          case "s":
            return n * r;
          case "ms":
            return n
        }
      }

      function f(e) {
        if (e >= o) return Math.round(e / o) + "d";
        if (e >= s) return Math.round(e / s) + "h";
        if (e >= i) return Math.round(e / i) + "m";
        if (e >= r) return Math.round(e / r) + "s";
        return e + "ms"
      }

      function l(e) {
        return c(e, o, "day") || c(e, s, "hour") || c(e, i, "minute") || c(e, r, "second") || e + " ms"
      }

      function c(e, t, n) {
        if (e < t) return;
        if (e < t * 1.5) return Math.floor(e / t) + " " + n;
        return Math.ceil(e / t) + " " + n + "s"
      }
      var r = 1e3;
      var i = r * 60;
      var s = i * 60;
      var o = s * 24;
      var u = o * 365.25;
      t.exports = function(e, t) {
        t = t || {};
        if ("string" == typeof e) return a(e);
        return t.long ? l(e) : f(e)
      }
    }, {}],
    24: [function(e, t, n) {
      (function(t) {
        function p(e, t, r) {
          if (!t) {
            return n.encodeBase64Packet(e, r)
          }
          var i = e.data;
          var s = new Uint8Array(i);
          var o = new Uint8Array(1 + i.byteLength);
          o[0] = f[e.type];
          for (var u = 0; u < s.length; u++) {
            o[u + 1] = s[u]
          }
          return r(o.buffer)
        }

        function d(e, t, r) {
          if (!t) {
            return n.encodeBase64Packet(e, r)
          }
          var i = new FileReader;
          i.onload = function() {
            e.data = i.result;
            n.encodePacket(e, t, true, r)
          };
          return i.readAsArrayBuffer(e.data)
        }

        function v(e, t, r) {
          if (!t) {
            return n.encodeBase64Packet(e, r)
          }
          if (a) {
            return d(e, t, r)
          }
          var i = new Uint8Array(1);
          i[0] = f[e.type];
          var s = new h([i.buffer, e.data]);
          return r(s)
        }

        function m(e, t, n) {
          var r = new Array(e.length);
          var i = o(e.length, n);
          var s = function(e, n, i) {
            t(n, function(t, n) {
              r[e] = n;
              i(t, r)
            })
          };
          for (var u = 0; u < e.length; u++) {
            s(u, e[u], i)
          }
        }
        var r = e("./keys");
        var i = e("arraybuffer.slice");
        var s = e("base64-arraybuffer");
        var o = e("after");
        var u = e("utf8");
        var a = navigator.userAgent.match(/Android/i);
        n.protocol = 3;
        var f = n.packets = {
          open: 0,
          close: 1,
          ping: 2,
          pong: 3,
          message: 4,
          upgrade: 5,
          noop: 6
        };
        var l = r(f);
        var c = {
          type: "error",
          data: "parser error"
        };
        var h = e("blob");
        n.encodePacket = function(e, n, r, i) {
          if ("function" == typeof n) {
            i = n;
            n = false
          }
          if ("function" == typeof r) {
            i = r;
            r = null
          }
          var s = e.data === undefined ? undefined : e.data.buffer || e.data;
          if (t.ArrayBuffer && s instanceof ArrayBuffer) {
            return p(e, n, i)
          } else if (h && s instanceof t.Blob) {
            return v(e, n, i)
          }
          var o = f[e.type];
          if (undefined !== e.data) {
            o += r ? u.encode(String(e.data)) : String(e.data)
          }
          return i("" + o)
        };
        n.encodeBase64Packet = function(e, r) {
          var i = "b" + n.packets[e.type];
          if (h && e.data instanceof h) {
            var s = new FileReader;
            s.onload = function() {
              var e = s.result.split(",")[1];
              r(i + e)
            };
            return s.readAsDataURL(e.data)
          }
          var o;
          try {
            o = String.fromCharCode.apply(null, new Uint8Array(e.data))
          } catch (u) {
            var a = new Uint8Array(e.data);
            var f = new Array(a.length);
            for (var l = 0; l < a.length; l++) {
              f[l] = a[l]
            }
            o = String.fromCharCode.apply(null, f)
          }
          i += t.btoa(o);
          return r(i)
        };
        n.decodePacket = function(e, t, r) {
          if (typeof e == "string" || e === undefined) {
            if (e.charAt(0) == "b") {
              return n.decodeBase64Packet(e.substr(1), t)
            }
            if (r) {
              try {
                e = u.decode(e)
              } catch (s) {
                return c
              }
            }
            var o = e.charAt(0);
            if (Number(o) != o || !l[o]) {
              return c
            }
            if (e.length > 1) {
              return {
                type: l[o],
                data: e.substring(1)
              }
            } else {
              return {
                type: l[o]
              }
            }
          }
          var a = new Uint8Array(e);
          var o = a[0];
          var f = i(e, 1);
          if (h && t === "blob") {
            f = new h([f])
          }
          return {
            type: l[o],
            data: f
          }
        };
        n.decodeBase64Packet = function(e, n) {
          var r = l[e.charAt(0)];
          if (!t.ArrayBuffer) {
            return {
              type: r,
              data: {
                base64: true,
                data: e.substr(1)
              }
            }
          }
          var i = s.decode(e.substr(1));
          if (n === "blob" && h) {
            i = new h([i])
          }
          return {
            type: r,
            data: i
          }
        };
        n.encodePayload = function(e, t, r) {
          function i(e) {
            return e.length + ":" + e
          }

          function s(e, r) {
            n.encodePacket(e, t, true, function(e) {
              r(null, i(e))
            })
          }
          if (typeof t == "function") {
            r = t;
            t = null
          }
          if (t) {
            if (h && !a) {
              return n.encodePayloadAsBlob(e, r)
            }
            return n.encodePayloadAsArrayBuffer(e, r)
          }
          if (!e.length) {
            return r("0:")
          }
          m(e, s, function(e, t) {
            return r(t.join(""))
          })
        };
        n.decodePayload = function(e, t, r) {
          if (typeof e != "string") {
            return n.decodePayloadAsBinary(e, t, r)
          }
          if (typeof t === "function") {
            r = t;
            t = null
          }
          var i;
          if (e == "") {
            return r(c, 0, 1)
          }
          var s = "",
            o, u;
          for (var a = 0, f = e.length; a < f; a++) {
            var l = e.charAt(a);
            if (":" != l) {
              s += l
            } else {
              if ("" == s || s != (o = Number(s))) {
                return r(c, 0, 1)
              }
              u = e.substr(a + 1, o);
              if (s != u.length) {
                return r(c, 0, 1)
              }
              if (u.length) {
                i = n.decodePacket(u, t, true);
                if (c.type == i.type && c.data == i.data) {
                  return r(c, 0, 1)
                }
                var h = r(i, a + o, f);
                if (false === h) return
              }
              a += o;
              s = ""
            }
          }
          if (s != "") {
            return r(c, 0, 1)
          }
        };
        n.encodePayloadAsArrayBuffer = function(e, t) {
          function r(e, t) {
            n.encodePacket(e, true, true, function(e) {
              return t(null, e)
            })
          }
          if (!e.length) {
            return t(new ArrayBuffer(0))
          }
          m(e, r, function(e, n) {
            var r = n.reduce(function(e, t) {
              var n;
              if (typeof t === "string") {
                n = t.length
              } else {
                n = t.byteLength
              }
              return e + n.toString().length + n + 2
            }, 0);
            var i = new Uint8Array(r);
            var s = 0;
            n.forEach(function(e) {
              var t = typeof e === "string";
              var n = e;
              if (t) {
                var r = new Uint8Array(e.length);
                for (var o = 0; o < e.length; o++) {
                  r[o] = e.charCodeAt(o)
                }
                n = r.buffer
              }
              if (t) {
                i[s++] = 0
              } else {
                i[s++] = 1
              }
              var u = n.byteLength.toString();
              for (var o = 0; o < u.length; o++) {
                i[s++] = parseInt(u[o])
              }
              i[s++] = 255;
              var r = new Uint8Array(n);
              for (var o = 0; o < r.length; o++) {
                i[s++] = r[o]
              }
            });
            return t(i.buffer)
          })
        };
        n.encodePayloadAsBlob = function(e, t) {
          function r(e, t) {
            n.encodePacket(e, true, true, function(e) {
              var n = new Uint8Array(1);
              n[0] = 1;
              if (typeof e === "string") {
                var r = new Uint8Array(e.length);
                for (var i = 0; i < e.length; i++) {
                  r[i] = e.charCodeAt(i)
                }
                e = r.buffer;
                n[0] = 0
              }
              var s = e instanceof ArrayBuffer ? e.byteLength : e.size;
              var o = s.toString();
              var u = new Uint8Array(o.length + 1);
              for (var i = 0; i < o.length; i++) {
                u[i] = parseInt(o[i])
              }
              u[o.length] = 255;
              if (h) {
                var a = new h([n.buffer, u.buffer, e]);
                t(null, a)
              }
            })
          }
          m(e, r, function(e, n) {
            return t(new h(n))
          })
        };
        n.decodePayloadAsBinary = function(e, t, r) {
          if (typeof t === "function") {
            r = t;
            t = null
          }
          var s = e;
          var o = [];
          var u = false;
          while (s.byteLength > 0) {
            var a = new Uint8Array(s);
            var f = a[0] === 0;
            var l = "";
            for (var h = 1;; h++) {
              if (a[h] == 255) break;
              if (l.length > 310) {
                u = true;
                break
              }
              l += a[h]
            }
            if (u) return r(c, 0, 1);
            s = i(s, 2 + l.length);
            l = parseInt(l);
            var p = i(s, 0, l);
            if (f) {
              try {
                p = String.fromCharCode.apply(null, new Uint8Array(p))
              } catch (d) {
                var v = new Uint8Array(p);
                p = "";
                for (var h = 0; h < v.length; h++) {
                  p += String.fromCharCode(v[h])
                }
              }
            }
            o.push(p);
            s = i(s, l)
          }
          var m = o.length;
          o.forEach(function(e, i) {
            r(n.decodePacket(e, t, true), i, m)
          })
        }
      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {
      "./keys": 25,
      after: 26,
      "arraybuffer.slice": 27,
      "base64-arraybuffer": 28,
      blob: 29,
      utf8: 30
    }],
    25: [function(e, t, n) {
      t.exports = Object.keys || function(t) {
        var n = [];
        var r = Object.prototype.hasOwnProperty;
        for (var i in t) {
          if (r.call(t, i)) {
            n.push(i)
          }
        }
        return n
      }
    }, {}],
    26: [function(e, t, n) {
      function r(e, t, n) {
        function s(e, i) {
          if (s.count <= 0) {
            throw new Error("after called too many times")
          }--s.count;
          if (e) {
            r = true;
            t(e);
            t = n
          } else if (s.count === 0 && !r) {
            t(null, i)
          }
        }
        var r = false;
        n = n || i;
        s.count = e;
        return e === 0 ? t() : s
      }

      function i() {}
      t.exports = r
    }, {}],
    27: [function(e, t, n) {
      t.exports = function(e, t, n) {
        var r = e.byteLength;
        t = t || 0;
        n = n || r;
        if (e.slice) {
          return e.slice(t, n)
        }
        if (t < 0) {
          t += r
        }
        if (n < 0) {
          n += r
        }
        if (n > r) {
          n = r
        }
        if (t >= r || t >= n || r === 0) {
          return new ArrayBuffer(0)
        }
        var i = new Uint8Array(e);
        var s = new Uint8Array(n - t);
        for (var o = t, u = 0; o < n; o++, u++) {
          s[u] = i[o]
        }
        return s.buffer
      }
    }, {}],
    28: [function(e, t, n) {
      (function(e) {
        "use strict";
        n.encode = function(t) {
          var n = new Uint8Array(t),
            r, i = n.length,
            s = "";
          for (r = 0; r < i; r += 3) {
            s += e[n[r] >> 2];
            s += e[(n[r] & 3) << 4 | n[r + 1] >> 4];
            s += e[(n[r + 1] & 15) << 2 | n[r + 2] >> 6];
            s += e[n[r + 2] & 63]
          }
          if (i % 3 === 2) {
            s = s.substring(0, s.length - 1) + "="
          } else if (i % 3 === 1) {
            s = s.substring(0, s.length - 2) + "=="
          }
          return s
        };
        n.decode = function(t) {
          var n = t.length * .75,
            r = t.length,
            i, s = 0,
            o, u, a, f;
          if (t[t.length - 1] === "=") {
            n--;
            if (t[t.length - 2] === "=") {
              n--
            }
          }
          var l = new ArrayBuffer(n),
            c = new Uint8Array(l);
          for (i = 0; i < r; i += 4) {
            o = e.indexOf(t[i]);
            u = e.indexOf(t[i + 1]);
            a = e.indexOf(t[i + 2]);
            f = e.indexOf(t[i + 3]);
            c[s++] = o << 2 | u >> 4;
            c[s++] = (u & 15) << 4 | a >> 2;
            c[s++] = (a & 3) << 6 | f & 63
          }
          return l
        }
      })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")
    }, {}],
    29: [function(e, t, n) {
      (function(e) {
        function s(e, t) {
          t = t || {};
          var r = new n;
          for (var i = 0; i < e.length; i++) {
            r.append(e[i])
          }
          return t.type ? r.getBlob(t.type) : r.getBlob()
        }
        var n = e.BlobBuilder || e.WebKitBlobBuilder || e.MSBlobBuilder || e.MozBlobBuilder;
        var r = function() {
          try {
            var e = new Blob(["hi"]);
            return e.size == 2
          } catch (t) {
            return false
          }
        }();
        var i = n && n.prototype.append && n.prototype.getBlob;
        t.exports = function() {
          if (r) {
            return e.Blob
          } else if (i) {
            return s
          } else {
            return undefined
          }
        }()
      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}],
    30: [function(t, n, r) {
      (function(t) {
        (function(i) {
          function f(e) {
            var t = [];
            var n = 0;
            var r = e.length;
            var i;
            var s;
            while (n < r) {
              i = e.charCodeAt(n++);
              if (i >= 55296 && i <= 56319 && n < r) {
                s = e.charCodeAt(n++);
                if ((s & 64512) == 56320) {
                  t.push(((i & 1023) << 10) + (s & 1023) + 65536)
                } else {
                  t.push(i);
                  n--
                }
              } else {
                t.push(i)
              }
            }
            return t
          }

          function l(e) {
            var t = e.length;
            var n = -1;
            var r;
            var i = "";
            while (++n < t) {
              r = e[n];
              if (r > 65535) {
                r -= 65536;
                i += a(r >>> 10 & 1023 | 55296);
                r = 56320 | r & 1023
              }
              i += a(r)
            }
            return i
          }

          function c(e, t) {
            return a(e >> t & 63 | 128)
          }

          function h(e) {
            if ((e & 4294967168) == 0) {
              return a(e)
            }
            var t = "";
            if ((e & 4294965248) == 0) {
              t = a(e >> 6 & 31 | 192)
            } else if ((e & 4294901760) == 0) {
              t = a(e >> 12 & 15 | 224);
              t += c(e, 6)
            } else if ((e & 4292870144) == 0) {
              t = a(e >> 18 & 7 | 240);
              t += c(e, 12);
              t += c(e, 6)
            }
            t += a(e & 63 | 128);
            return t
          }

          function p(e) {
            var t = f(e);
            var n = t.length;
            var r = -1;
            var i;
            var s = "";
            while (++r < n) {
              i = t[r];
              s += h(i)
            }
            return s
          }

          function d() {
            if (y >= g) {
              throw Error("Invalid byte index")
            }
            var e = m[y] & 255;
            y++;
            if ((e & 192) == 128) {
              return e & 63
            }
            throw Error("Invalid continuation byte")
          }

          function v() {
            var e;
            var t;
            var n;
            var r;
            var i;
            if (y > g) {
              throw Error("Invalid byte index")
            }
            if (y == g) {
              return false
            }
            e = m[y] & 255;
            y++;
            if ((e & 128) == 0) {
              return e
            }
            if ((e & 224) == 192) {
              var t = d();
              i = (e & 31) << 6 | t;
              if (i >= 128) {
                return i
              } else {
                throw Error("Invalid continuation byte")
              }
            }
            if ((e & 240) == 224) {
              t = d();
              n = d();
              i = (e & 15) << 12 | t << 6 | n;
              if (i >= 2048) {
                return i
              } else {
                throw Error("Invalid continuation byte")
              }
            }
            if ((e & 248) == 240) {
              t = d();
              n = d();
              r = d();
              i = (e & 15) << 18 | t << 12 | n << 6 | r;
              if (i >= 65536 && i <= 1114111) {
                return i
              }
            }
            throw Error("Invalid UTF-8 detected")
          }

          function b(e) {
            m = f(e);
            g = m.length;
            y = 0;
            var t = [];
            var n;
            while ((n = v()) !== false) {
              t.push(n)
            }
            return l(t)
          }
          var s = typeof r == "object" && r;
          var o = typeof n == "object" && n && n.exports == s && n;
          var u = typeof t == "object" && t;
          if (u.global === u || u.window === u) {
            i = u
          }
          var a = String.fromCharCode;
          var m;
          var g;
          var y;
          var w = {
            version: "2.0.0",
            encode: p,
            decode: b
          };
          if (typeof e == "function" && typeof e.amd == "object" && e.amd) {
            e(function() {
              return w
            })
          } else if (s && !s.nodeType) {
            if (o) {
              o.exports = w
            } else {
              var E = {};
              var S = E.hasOwnProperty;
              for (var x in w) {
                S.call(w, x) && (s[x] = w[x])
              }
            }
          } else {
            i.utf8 = w
          }
        })(this)
      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}],
    31: [function(e, t, n) {
      (function(e) {
        var n = /^[\],:{}\s]*$/;
        var r = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
        var i = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
        var s = /(?:^|:|,)(?:\s*\[)+/g;
        var o = /^\s+/;
        var u = /\s+$/;
        t.exports = function(a) {
          if ("string" != typeof a || !a) {
            return null
          }
          a = a.replace(o, "").replace(u, "");
          if (e.JSON && JSON.parse) {
            return JSON.parse(a)
          }
          if (n.test(a.replace(r, "@").replace(i, "]").replace(s, ""))) {
            return (new Function("return " + a))()
          }
        }
      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}],
    32: [function(e, t, n) {
      n.encode = function(e) {
        var t = "";
        for (var n in e) {
          if (e.hasOwnProperty(n)) {
            if (t.length) t += "&";
            t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n])
          }
        }
        return t
      };
      n.decode = function(e) {
        var t = {};
        var n = e.split("&");
        for (var r = 0, i = n.length; r < i; r++) {
          var s = n[r].split("=");
          t[decodeURIComponent(s[0])] = decodeURIComponent(s[1])
        }
        return t
      }
    }, {}],
    33: [function(e, t, n) {
      var r = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
      var i = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
      t.exports = function(t) {
        var n = t,
          s = t.indexOf("["),
          o = t.indexOf("]");
        if (s != -1 && o != -1) {
          t = t.substring(0, s) + t.substring(s, o).replace(/:/g, ";") + t.substring(o, t.length)
        }
        var u = r.exec(t || ""),
          a = {},
          f = 14;
        while (f--) {
          a[i[f]] = u[f] || ""
        }
        if (s != -1 && o != -1) {
          a.source = n;
          a.host = a.host.substring(1, a.host.length - 1).replace(/;/g, ":");
          a.authority = a.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
          a.ipv6uri = true
        }
        return a
      }
    }, {}],
    34: [function(e, t, n) {
      function s(e, t, n) {
        var r;
        if (t) {
          r = new i(e, t)
        } else {
          r = new i(e)
        }
        return r
      }
      var r = function() {
        return this
      }();
      var i = r.WebSocket || r.MozWebSocket;
      t.exports = i ? s : null;
      if (i) s.prototype = i.prototype
    }, {}],
    35: [function(e, t, n) {
      (function(n) {
        function i(e) {
          function t(e) {
            if (!e) return false;
            if (n.Buffer && n.Buffer.isBuffer(e) || n.ArrayBuffer && e instanceof ArrayBuffer || n.Blob && e instanceof Blob || n.File && e instanceof File) {
              return true
            }
            if (r(e)) {
              for (var i = 0; i < e.length; i++) {
                if (t(e[i])) {
                  return true
                }
              }
            } else if (e && "object" == typeof e) {
              if (e.toJSON) {
                e = e.toJSON()
              }
              for (var s in e) {
                if (e.hasOwnProperty(s) && t(e[s])) {
                  return true
                }
              }
            }
            return false
          }
          return t(e)
        }
        var r = e("isarray");
        t.exports = i
      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {
      isarray: 36
    }],
    36: [function(e, t, n) {
      t.exports = Array.isArray || function(e) {
        return Object.prototype.toString.call(e) == "[object Array]"
      }
    }, {}],
    37: [function(e, t, n) {
      var r = e("global");
      try {
        t.exports = "XMLHttpRequest" in r && "withCredentials" in new r.XMLHttpRequest
      } catch (i) {
        t.exports = false
      }
    }, {
      global: 38
    }],
    38: [function(e, t, n) {
      t.exports = function() {
        return this
      }()
    }, {}],
    39: [function(e, t, n) {
      var r = [].indexOf;
      t.exports = function(e, t) {
        if (r) return e.indexOf(t);
        for (var n = 0; n < e.length; ++n) {
          if (e[n] === t) return n
        }
        return -1
      }
    }, {}],
    40: [function(e, t, n) {
      var r = Object.prototype.hasOwnProperty;
      n.keys = Object.keys || function(e) {
        var t = [];
        for (var n in e) {
          if (r.call(e, n)) {
            t.push(n)
          }
        }
        return t
      };
      n.values = function(e) {
        var t = [];
        for (var n in e) {
          if (r.call(e, n)) {
            t.push(e[n])
          }
        }
        return t
      };
      n.merge = function(e, t) {
        for (var n in t) {
          if (r.call(t, n)) {
            e[n] = t[n]
          }
        }
        return e
      };
      n.length = function(e) {
        return n.keys(e).length
      };
      n.isEmpty = function(e) {
        return 0 == n.length(e)
      }
    }, {}],
    41: [function(e, t, n) {
      var r = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
      var i = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
      t.exports = function(t) {
        var n = r.exec(t || ""),
          s = {},
          o = 14;
        while (o--) {
          s[i[o]] = n[o] || ""
        }
        return s
      }
    }, {}],
    42: [function(e, t, n) {
      (function(t) {
        var r = e("isarray");
        var i = e("./is-buffer");
        n.deconstructPacket = function(e) {
          function s(e) {
            if (!e) return e;
            if (i(e)) {
              var n = {
                _placeholder: true,
                num: t.length
              };
              t.push(e);
              return n
            } else if (r(e)) {
              var o = new Array(e.length);
              for (var u = 0; u < e.length; u++) {
                o[u] = s(e[u])
              }
              return o
            } else if ("object" == typeof e && !(e instanceof Date)) {
              var o = {};
              for (var a in e) {
                o[a] = s(e[a])
              }
              return o
            }
            return e
          }
          var t = [];
          var n = e.data;
          var o = e;
          o.data = s(n);
          o.attachments = t.length;
          return {
            packet: o,
            buffers: t
          }
        };
        n.reconstructPacket = function(e, t) {
          function i(e) {
            if (e && e._placeholder) {
              var n = t[e.num];
              return n
            } else if (r(e)) {
              for (var s = 0; s < e.length; s++) {
                e[s] = i(e[s])
              }
              return e
            } else if (e && "object" == typeof e) {
              for (var o in e) {
                e[o] = i(e[o])
              }
              return e
            }
            return e
          }
          var n = 0;
          e.data = i(e.data);
          e.attachments = undefined;
          return e
        };
        n.removeBlobs = function(e, n) {
          function s(e, a, f) {
            if (!e) return e;
            if (t.Blob && e instanceof Blob || t.File && e instanceof File) {
              o++;
              var l = new FileReader;
              l.onload = function() {
                if (f) {
                  f[a] = this.result
                } else {
                  u = this.result
                }
                if (!--o) {
                  n(u)
                }
              };
              l.readAsArrayBuffer(e)
            } else if (r(e)) {
              for (var c = 0; c < e.length; c++) {
                s(e[c], c, e)
              }
            } else if (e && "object" == typeof e && !i(e)) {
              for (var h in e) {
                s(e[h], h, e)
              }
            }
          }
          var o = 0;
          var u = e;
          s(u);
          if (!o) {
            n(u)
          }
        }
      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {
      "./is-buffer": 44,
      isarray: 45
    }],
    43: [function(e, t, n) {
      function f() {}

      function l(e) {
        var t = "";
        var s = false;
        t += e.type;
        if (n.BINARY_EVENT == e.type || n.BINARY_ACK == e.type) {
          t += e.attachments;
          t += "-"
        }
        if (e.nsp && "/" != e.nsp) {
          s = true;
          t += e.nsp
        }
        if (null != e.id) {
          if (s) {
            t += ",";
            s = false
          }
          t += e.id
        }
        if (null != e.data) {
          if (s) t += ",";
          t += i.stringify(e.data)
        }
        r("encoded %j as %s", e, t);
        return t
      }

      function c(e, t) {
        function n(e) {
          var n = u.deconstructPacket(e);
          var r = l(n.packet);
          var i = n.buffers;
          i.unshift(r);
          t(i)
        }
        u.removeBlobs(e, n)
      }

      function h() {
        this.reconstructor = null
      }

      function p(e) {
        var t = {};
        var s = 0;
        t.type = Number(e.charAt(0));
        if (null == n.types[t.type]) return v();
        if (n.BINARY_EVENT == t.type || n.BINARY_ACK == t.type) {
          t.attachments = "";
          while (e.charAt(++s) != "-") {
            t.attachments += e.charAt(s)
          }
          t.attachments = Number(t.attachments)
        }
        if ("/" == e.charAt(s + 1)) {
          t.nsp = "";
          while (++s) {
            var o = e.charAt(s);
            if ("," == o) break;
            t.nsp += o;
            if (s + 1 == e.length) break
          }
        } else {
          t.nsp = "/"
        }
        var u = e.charAt(s + 1);
        if ("" != u && Number(u) == u) {
          t.id = "";
          while (++s) {
            var o = e.charAt(s);
            if (null == o || Number(o) != o) {
              --s;
              break
            }
            t.id += e.charAt(s);
            if (s + 1 == e.length) break
          }
          t.id = Number(t.id)
        }
        if (e.charAt(++s)) {
          try {
            t.data = i.parse(e.substr(s))
          } catch (a) {
            return v()
          }
        }
        r("decoded %s as %j", e, t);
        return t
      }

      function d(e) {
        this.reconPack = e;
        this.buffers = []
      }

      function v(e) {
        return {
          type: n.ERROR,
          data: "parser error"
        }
      }
      var r = e("debug")("socket.io-parser");
      var i = e("json3");
      var s = e("isarray");
      var o = e("component-emitter");
      var u = e("./binary");
      var a = e("./is-buffer");
      n.protocol = 4;
      n.types = ["CONNECT", "DISCONNECT", "EVENT", "BINARY_EVENT", "ACK", "BINARY_ACK", "ERROR"];
      n.CONNECT = 0;
      n.DISCONNECT = 1;
      n.EVENT = 2;
      n.ACK = 3;
      n.ERROR = 4;
      n.BINARY_EVENT = 5;
      n.BINARY_ACK = 6;
      n.Encoder = f;
      n.Decoder = h;
      f.prototype.encode = function(e, t) {
        r("encoding packet %j", e);
        if (n.BINARY_EVENT == e.type || n.BINARY_ACK == e.type) {
          c(e, t)
        } else {
          var i = l(e);
          t([i])
        }
      };
      o(h.prototype);
      h.prototype.add = function(e) {
        var t;
        if ("string" == typeof e) {
          t = p(e);
          if (n.BINARY_EVENT == t.type || n.BINARY_ACK == t.type) {
            this.reconstructor = new d(t);
            if (this.reconstructor.reconPack.attachments == 0) {
              this.emit("decoded", t)
            }
          } else {
            this.emit("decoded", t)
          }
        } else if (a(e) || e.base64) {
          if (!this.reconstructor) {
            throw new Error("got binary data when not reconstructing a packet")
          } else {
            t = this.reconstructor.takeBinaryData(e);
            if (t) {
              this.reconstructor = null;
              this.emit("decoded", t)
            }
          }
        } else {
          throw new Error("Unknown type: " + e)
        }
      };
      h.prototype.destroy = function() {
        if (this.reconstructor) {
          this.reconstructor.finishedReconstruction()
        }
      };
      d.prototype.takeBinaryData = function(e) {
        this.buffers.push(e);
        if (this.buffers.length == this.reconPack.attachments) {
          var t = u.reconstructPacket(this.reconPack, this.buffers);
          this.finishedReconstruction();
          return t
        }
        return null
      };
      d.prototype.finishedReconstruction = function() {
        this.reconPack = null;
        this.buffers = []
      }
    }, {
      "./binary": 42,
      "./is-buffer": 44,
      "component-emitter": 8,
      debug: 9,
      isarray: 45,
      json3: 46
    }],
    44: [function(e, t, n) {
      (function(e) {
        function n(t) {
          return e.Buffer && e.Buffer.isBuffer(t) || e.ArrayBuffer && t instanceof ArrayBuffer
        }
        t.exports = n
      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}],
    45: [function(e, t, n) {
      t.exports = e(36)
    }, {}],
    46: [function(t, n, r) {
      (function(t) {
        function h(e) {
          if (h[e] !== o) {
            return h[e]
          }
          var t;
          if (e == "bug-string-char-index") {
            t = "a" [0] != "a"
          } else if (e == "json") {
            t = h("json-stringify") && h("json-parse")
          } else {
            var r, i = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
            if (e == "json-stringify") {
              var s = f.stringify,
                u = typeof s == "function" && l;
              if (u) {
                (r = function() {
                  return 1
                }).toJSON = r;
                try {
                  u = s(0) === "0" && s(new Number) === "0" && s(new String) == '""' && s(n) === o && s(o) === o && s() === o && s(r) === "1" && s([r]) == "[1]" && s([o]) == "[null]" && s(null) == "null" && s([o, n, null]) == "[null,null,null]" && s({
                    a: [r, true, false, null, "\0\b\n\f\r	"]
                  }) == i && s(null, r) === "1" && s([1, 2], null, 1) == "[\n 1,\n 2\n]" && s(new Date(-864e13)) == '"-271821-04-20T00:00:00.000Z"' && s(new Date(864e13)) == '"+275760-09-13T00:00:00.000Z"' && s(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' && s(new Date(-1)) == '"1969-12-31T23:59:59.999Z"'
                } catch (a) {
                  u = false
                }
              }
              t = u
            }
            if (e == "json-parse") {
              var c = f.parse;
              if (typeof c == "function") {
                try {
                  if (c("0") === 0 && !c(false)) {
                    r = c(i);
                    var p = r["a"].length == 5 && r["a"][0] === 1;
                    if (p) {
                      try {
                        p = !c('"	"')
                      } catch (a) {}
                      if (p) {
                        try {
                          p = c("01") !== 1
                        } catch (a) {}
                      }
                      if (p) {
                        try {
                          p = c("1.") !== 1
                        } catch (a) {}
                      }
                    }
                  }
                } catch (a) {
                  p = false
                }
              }
              t = p
            }
          }
          return h[e] = !!t
        }
        var n = {}.toString,
          i, s, o;
        var u = typeof e === "function" && e.amd;
        var a = typeof JSON == "object" && JSON;
        var f = typeof r == "object" && r && !r.nodeType && r;
        if (f && a) {
          f.stringify = a.stringify;
          f.parse = a.parse
        } else {
          f = t.JSON = a || {}
        }
        var l = new Date(-0xc782b5b800cec);
        try {
          l = l.getUTCFullYear() == -109252 && l.getUTCMonth() === 0 && l.getUTCDate() === 1 && l.getUTCHours() == 10 && l.getUTCMinutes() == 37 && l.getUTCSeconds() == 6 && l.getUTCMilliseconds() == 708
        } catch (c) {}
        if (!h("json")) {
          var p = "[object Function]";
          var d = "[object Date]";
          var v = "[object Number]";
          var m = "[object String]";
          var g = "[object Array]";
          var y = "[object Boolean]";
          var b = h("bug-string-char-index");
          if (!l) {
            var w = Math.floor;
            var E = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
            var S = function(e, t) {
              return E[t] + 365 * (e - 1970) + w((e - 1969 + (t = +(t > 1))) / 4) - w((e - 1901 + t) / 100) + w((e - 1601 + t) / 400)
            }
          }
          if (!(i = {}.hasOwnProperty)) {
            i = function(e) {
              var t = {},
                r;
              if ((t.__proto__ = null, t.__proto__ = {
                  toString: 1
                }, t).toString != n) {
                i = function(e) {
                  var t = this.__proto__,
                    n = e in (this.__proto__ = null, this);
                  this.__proto__ = t;
                  return n
                }
              } else {
                r = t.constructor;
                i = function(e) {
                  var t = (this.constructor || r).prototype;
                  return e in this && !(e in t && this[e] === t[e])
                }
              }
              t = null;
              return i.call(this, e)
            }
          }
          var x = {
            "boolean": 1,
            number: 1,
            string: 1,
            "undefined": 1
          };
          var T = function(e, t) {
            var n = typeof e[t];
            return n == "object" ? !!e[t] : !x[n]
          };
          s = function(e, t) {
            var r = 0,
              o, u, a;
            (o = function() {
              this.valueOf = 0
            }).prototype.valueOf = 0;
            u = new o;
            for (a in u) {
              if (i.call(u, a)) {
                r++
              }
            }
            o = u = null;
            if (!r) {
              u = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
              s = function(e, t) {
                var r = n.call(e) == p,
                  s, o;
                var a = !r && typeof e.constructor != "function" && T(e, "hasOwnProperty") ? e.hasOwnProperty : i;
                for (s in e) {
                  if (!(r && s == "prototype") && a.call(e, s)) {
                    t(s)
                  }
                }
                for (o = u.length; s = u[--o]; a.call(e, s) && t(s));
              }
            } else if (r == 2) {
              s = function(e, t) {
                var r = {},
                  s = n.call(e) == p,
                  o;
                for (o in e) {
                  if (!(s && o == "prototype") && !i.call(r, o) && (r[o] = 1) && i.call(e, o)) {
                    t(o)
                  }
                }
              }
            } else {
              s = function(e, t) {
                var r = n.call(e) == p,
                  s, o;
                for (s in e) {
                  if (!(r && s == "prototype") && i.call(e, s) && !(o = s === "constructor")) {
                    t(s)
                  }
                }
                if (o || i.call(e, s = "constructor")) {
                  t(s)
                }
              }
            }
            return s(e, t)
          };
          if (!h("json-stringify")) {
            var N = {
              92: "\\\\",
              34: '\\"',
              8: "\\b",
              12: "\\f",
              10: "\\n",
              13: "\\r",
              9: "\\t"
            };
            var C = "000000";
            var k = function(e, t) {
              return (C + (t || 0)).slice(-e)
            };
            var L = "\\u00";
            var A = function(e) {
              var t = '"',
                n = 0,
                r = e.length,
                i = r > 10 && b,
                s;
              if (i) {
                s = e.split("")
              }
              for (; n < r; n++) {
                var o = e.charCodeAt(n);
                switch (o) {
                  case 8:
                  case 9:
                  case 10:
                  case 12:
                  case 13:
                  case 34:
                  case 92:
                    t += N[o];
                    break;
                  default:
                    if (o < 32) {
                      t += L + k(2, o.toString(16));
                      break
                    }
                    t += i ? s[n] : b ? e.charAt(n) : e[n]
                }
              }
              return t + '"'
            };
            var O = function(e, t, r, u, a, f, l) {
              var c, h, p, b, E, x, T, N, C, L, M, _, D, P, H, B;
              try {
                c = t[e]
              } catch (j) {}
              if (typeof c == "object" && c) {
                h = n.call(c);
                if (h == d && !i.call(c, "toJSON")) {
                  if (c > -1 / 0 && c < 1 / 0) {
                    if (S) {
                      E = w(c / 864e5);
                      for (p = w(E / 365.2425) + 1970 - 1; S(p + 1, 0) <= E; p++);
                      for (b = w((E - S(p, 0)) / 30.42); S(p, b + 1) <= E; b++);
                      E = 1 + E - S(p, b);
                      x = (c % 864e5 + 864e5) % 864e5;
                      T = w(x / 36e5) % 24;
                      N = w(x / 6e4) % 60;
                      C = w(x / 1e3) % 60;
                      L = x % 1e3
                    } else {
                      p = c.getUTCFullYear();
                      b = c.getUTCMonth();
                      E = c.getUTCDate();
                      T = c.getUTCHours();
                      N = c.getUTCMinutes();
                      C = c.getUTCSeconds();
                      L = c.getUTCMilliseconds()
                    }
                    c = (p <= 0 || p >= 1e4 ? (p < 0 ? "-" : "+") + k(6, p < 0 ? -p : p) : k(4, p)) + "-" + k(2, b + 1) + "-" + k(2, E) + "T" + k(2, T) + ":" + k(2, N) + ":" + k(2, C) + "." + k(3, L) + "Z"
                  } else {
                    c = null
                  }
                } else if (typeof c.toJSON == "function" && (h != v && h != m && h != g || i.call(c, "toJSON"))) {
                  c = c.toJSON(e)
                }
              }
              if (r) {
                c = r.call(t, e, c)
              }
              if (c === null) {
                return "null"
              }
              h = n.call(c);
              if (h == y) {
                return "" + c
              } else if (h == v) {
                return c > -1 / 0 && c < 1 / 0 ? "" + c : "null"
              } else if (h == m) {
                return A("" + c)
              }
              if (typeof c == "object") {
                for (P = l.length; P--;) {
                  if (l[P] === c) {
                    throw TypeError()
                  }
                }
                l.push(c);
                M = [];
                H = f;
                f += a;
                if (h == g) {
                  for (D = 0, P = c.length; D < P; D++) {
                    _ = O(D, c, r, u, a, f, l);
                    M.push(_ === o ? "null" : _)
                  }
                  B = M.length ? a ? "[\n" + f + M.join(",\n" + f) + "\n" + H + "]" : "[" + M.join(",") + "]" : "[]"
                } else {
                  s(u || c, function(e) {
                    var t = O(e, c, r, u, a, f, l);
                    if (t !== o) {
                      M.push(A(e) + ":" + (a ? " " : "") + t)
                    }
                  });
                  B = M.length ? a ? "{\n" + f + M.join(",\n" + f) + "\n" + H + "}" : "{" + M.join(",") + "}" : "{}"
                }
                l.pop();
                return B
              }
            };
            f.stringify = function(e, t, r) {
              var i, s, o, u;
              if (typeof t == "function" || typeof t == "object" && t) {
                if ((u = n.call(t)) == p) {
                  s = t
                } else if (u == g) {
                  o = {};
                  for (var a = 0, f = t.length, l; a < f; l = t[a++], (u = n.call(l), u == m || u == v) && (o[l] = 1));
                }
              }
              if (r) {
                if ((u = n.call(r)) == v) {
                  if ((r -= r % 1) > 0) {
                    for (i = "", r > 10 && (r = 10); i.length < r; i += " ");
                  }
                } else if (u == m) {
                  i = r.length <= 10 ? r : r.slice(0, 10)
                }
              }
              return O("", (l = {}, l[""] = e, l), s, o, i, "", [])
            }
          }
          if (!h("json-parse")) {
            var M = String.fromCharCode;
            var _ = {
              92: "\\",
              34: '"',
              47: "/",
              98: "\b",
              116: "	",
              110: "\n",
              102: "\f",
              114: "\r"
            };
            var D, P;
            var H = function() {
              D = P = null;
              throw SyntaxError()
            };
            var B = function() {
              var e = P,
                t = e.length,
                n, r, i, s, o;
              while (D < t) {
                o = e.charCodeAt(D);
                switch (o) {
                  case 9:
                  case 10:
                  case 13:
                  case 32:
                    D++;
                    break;
                  case 123:
                  case 125:
                  case 91:
                  case 93:
                  case 58:
                  case 44:
                    n = b ? e.charAt(D) : e[D];
                    D++;
                    return n;
                  case 34:
                    for (n = "@", D++; D < t;) {
                      o = e.charCodeAt(D);
                      if (o < 32) {
                        H()
                      } else if (o == 92) {
                        o = e.charCodeAt(++D);
                        switch (o) {
                          case 92:
                          case 34:
                          case 47:
                          case 98:
                          case 116:
                          case 110:
                          case 102:
                          case 114:
                            n += _[o];
                            D++;
                            break;
                          case 117:
                            r = ++D;
                            for (i = D + 4; D < i; D++) {
                              o = e.charCodeAt(D);
                              if (!(o >= 48 && o <= 57 || o >= 97 && o <= 102 || o >= 65 && o <= 70)) {
                                H()
                              }
                            }
                            n += M("0x" + e.slice(r, D));
                            break;
                          default:
                            H()
                        }
                      } else {
                        if (o == 34) {
                          break
                        }
                        o = e.charCodeAt(D);
                        r = D;
                        while (o >= 32 && o != 92 && o != 34) {
                          o = e.charCodeAt(++D)
                        }
                        n += e.slice(r, D)
                      }
                    }
                    if (e.charCodeAt(D) == 34) {
                      D++;
                      return n
                    }
                    H();
                  default:
                    r = D;
                    if (o == 45) {
                      s = true;
                      o = e.charCodeAt(++D)
                    }
                    if (o >= 48 && o <= 57) {
                      if (o == 48 && (o = e.charCodeAt(D + 1), o >= 48 && o <= 57)) {
                        H()
                      }
                      s = false;
                      for (; D < t && (o = e.charCodeAt(D), o >= 48 && o <= 57); D++);
                      if (e.charCodeAt(D) == 46) {
                        i = ++D;
                        for (; i < t && (o = e.charCodeAt(i), o >= 48 && o <= 57); i++);
                        if (i == D) {
                          H()
                        }
                        D = i
                      }
                      o = e.charCodeAt(D);
                      if (o == 101 || o == 69) {
                        o = e.charCodeAt(++D);
                        if (o == 43 || o == 45) {
                          D++
                        }
                        for (i = D; i < t && (o = e.charCodeAt(i), o >= 48 && o <= 57); i++);
                        if (i == D) {
                          H()
                        }
                        D = i
                      }
                      return +e.slice(r, D)
                    }
                    if (s) {
                      H()
                    }
                    if (e.slice(D, D + 4) == "true") {
                      D += 4;
                      return true
                    } else if (e.slice(D, D + 5) == "false") {
                      D += 5;
                      return false
                    } else if (e.slice(D, D + 4) == "null") {
                      D += 4;
                      return null
                    }
                    H()
                }
              }
              return "$"
            };
            var j = function(e) {
              var t, n;
              if (e == "$") {
                H()
              }
              if (typeof e == "string") {
                if ((b ? e.charAt(0) : e[0]) == "@") {
                  return e.slice(1)
                }
                if (e == "[") {
                  t = [];
                  for (;; n || (n = true)) {
                    e = B();
                    if (e == "]") {
                      break
                    }
                    if (n) {
                      if (e == ",") {
                        e = B();
                        if (e == "]") {
                          H()
                        }
                      } else {
                        H()
                      }
                    }
                    if (e == ",") {
                      H()
                    }
                    t.push(j(e))
                  }
                  return t
                } else if (e == "{") {
                  t = {};
                  for (;; n || (n = true)) {
                    e = B();
                    if (e == "}") {
                      break
                    }
                    if (n) {
                      if (e == ",") {
                        e = B();
                        if (e == "}") {
                          H()
                        }
                      } else {
                        H()
                      }
                    }
                    if (e == "," || typeof e != "string" || (b ? e.charAt(0) : e[0]) != "@" || B() != ":") {
                      H()
                    }
                    t[e.slice(1)] = j(B())
                  }
                  return t
                }
                H()
              }
              return e
            };
            var F = function(e, t, n) {
              var r = I(e, t, n);
              if (r === o) {
                delete e[t]
              } else {
                e[t] = r
              }
            };
            var I = function(e, t, r) {
              var i = e[t],
                o;
              if (typeof i == "object" && i) {
                if (n.call(i) == g) {
                  for (o = i.length; o--;) {
                    F(i, o, r)
                  }
                } else {
                  s(i, function(e) {
                    F(i, e, r)
                  })
                }
              }
              return r.call(e, t, i)
            };
            f.parse = function(e, t) {
              var r, i;
              D = 0;
              P = "" + e;
              r = j(B());
              if (B() != "$") {
                H()
              }
              D = P = null;
              return t && n.call(t) == p ? I((i = {}, i[""] = r, i), "", t) : r
            }
          }
        }
        if (u) {
          e(function() {
            return f
          })
        }
      })(this)
    }, {}],
    47: [function(e, t, n) {
      function r(e, t) {
        var n = [];
        t = t || 0;
        for (var r = t || 0; r < e.length; r++) {
          n[r - t] = e[r]
        }
        return n
      }
      t.exports = r
    }, {}]
  }, {}, [1])(1)
})