import { createRequire as e } from "node:module";
import { BrowserWindow as t, app as n, dialog as r, ipcMain as i, safeStorage as a, shell as o } from "electron";
import s from "node:path";
import { fileURLToPath as c } from "node:url";
import l from "better-sqlite3";
import u from "fs";
import d from "path";
import f from "node:crypto";
import { createCanvas as p } from "canvas";
//#region \0rolldown/runtime.js
var m = Object.create, h = Object.defineProperty, g = Object.getOwnPropertyDescriptor, _ = Object.getOwnPropertyNames, v = Object.getPrototypeOf, y = Object.prototype.hasOwnProperty, b = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), ee = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = _(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !y.call(e, s) && s !== n && h(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = g(t, s)) || r.enumerable
	});
	return e;
}, te = (e, t, n) => (n = e == null ? {} : m(v(e)), ee(t || !e || !e.__esModule ? h(n, "default", {
	value: e,
	enumerable: !0
}) : n, e)), x = /* @__PURE__ */ e(import.meta.url), ne = /* @__PURE__ */ b(((e, t) => {
	t.exports = {
		LOCHDR: 30,
		LOCSIG: 67324752,
		LOCVER: 4,
		LOCFLG: 6,
		LOCHOW: 8,
		LOCTIM: 10,
		LOCCRC: 14,
		LOCSIZ: 18,
		LOCLEN: 22,
		LOCNAM: 26,
		LOCEXT: 28,
		EXTSIG: 134695760,
		EXTHDR: 16,
		EXTCRC: 4,
		EXTSIZ: 8,
		EXTLEN: 12,
		CENHDR: 46,
		CENSIG: 33639248,
		CENVEM: 4,
		CENVER: 6,
		CENFLG: 8,
		CENHOW: 10,
		CENTIM: 12,
		CENCRC: 16,
		CENSIZ: 20,
		CENLEN: 24,
		CENNAM: 28,
		CENEXT: 30,
		CENCOM: 32,
		CENDSK: 34,
		CENATT: 36,
		CENATX: 38,
		CENOFF: 42,
		ENDHDR: 22,
		ENDSIG: 101010256,
		ENDSUB: 8,
		ENDTOT: 10,
		ENDSIZ: 12,
		ENDOFF: 16,
		ENDCOM: 20,
		END64HDR: 20,
		END64SIG: 117853008,
		END64START: 4,
		END64OFF: 8,
		END64NUMDISKS: 16,
		ZIP64SIG: 101075792,
		ZIP64HDR: 56,
		ZIP64LEAD: 12,
		ZIP64SIZE: 4,
		ZIP64VEM: 12,
		ZIP64VER: 14,
		ZIP64DSK: 16,
		ZIP64DSKDIR: 20,
		ZIP64SUB: 24,
		ZIP64TOT: 32,
		ZIP64SIZB: 40,
		ZIP64OFF: 48,
		ZIP64EXTRA: 56,
		STORED: 0,
		SHRUNK: 1,
		REDUCED1: 2,
		REDUCED2: 3,
		REDUCED3: 4,
		REDUCED4: 5,
		IMPLODED: 6,
		DEFLATED: 8,
		ENHANCED_DEFLATED: 9,
		PKWARE: 10,
		BZIP2: 12,
		LZMA: 14,
		IBM_TERSE: 18,
		IBM_LZ77: 19,
		AES_ENCRYPT: 99,
		FLG_ENC: 1,
		FLG_COMP1: 2,
		FLG_COMP2: 4,
		FLG_DESC: 8,
		FLG_ENH: 16,
		FLG_PATCH: 32,
		FLG_STR: 64,
		FLG_EFS: 2048,
		FLG_MSK: 4096,
		FILE: 2,
		BUFFER: 1,
		NONE: 0,
		EF_ID: 0,
		EF_SIZE: 2,
		ID_ZIP64: 1,
		ID_AVINFO: 7,
		ID_PFS: 8,
		ID_OS2: 9,
		ID_NTFS: 10,
		ID_OPENVMS: 12,
		ID_UNIX: 13,
		ID_FORK: 14,
		ID_PATCH: 15,
		ID_X509_PKCS7: 20,
		ID_X509_CERTID_F: 21,
		ID_X509_CERTID_C: 22,
		ID_STRONGENC: 23,
		ID_RECORD_MGT: 24,
		ID_X509_PKCS7_RL: 25,
		ID_IBM1: 101,
		ID_IBM2: 102,
		ID_POSZIP: 18064,
		EF_ZIP64_OR_32: 4294967295,
		EF_ZIP64_OR_16: 65535,
		EF_ZIP64_SUNCOMP: 0,
		EF_ZIP64_SCOMP: 8,
		EF_ZIP64_RHO: 16,
		EF_ZIP64_DSN: 24
	};
})), S = /* @__PURE__ */ b(((e) => {
	var t = {
		INVALID_LOC: "Invalid LOC header (bad signature)",
		INVALID_CEN: "Invalid CEN header (bad signature)",
		INVALID_END: "Invalid END header (bad signature)",
		DESCRIPTOR_NOT_EXIST: "No descriptor present",
		DESCRIPTOR_UNKNOWN: "Unknown descriptor format",
		DESCRIPTOR_FAULTY: "Descriptor data is malformed",
		NO_DATA: "Nothing to decompress",
		BAD_CRC: "CRC32 checksum failed {0}",
		FILE_IN_THE_WAY: "There is a file in the way: {0}",
		UNKNOWN_METHOD: "Invalid/unsupported compression method",
		AVAIL_DATA: "inflate::Available inflate data did not terminate",
		INVALID_DISTANCE: "inflate::Invalid literal/length or distance code in fixed or dynamic block",
		TO_MANY_CODES: "inflate::Dynamic block code description: too many length or distance codes",
		INVALID_REPEAT_LEN: "inflate::Dynamic block code description: repeat more than specified lengths",
		INVALID_REPEAT_FIRST: "inflate::Dynamic block code description: repeat lengths with no first length",
		INCOMPLETE_CODES: "inflate::Dynamic block code description: code lengths codes incomplete",
		INVALID_DYN_DISTANCE: "inflate::Dynamic block code description: invalid distance code lengths",
		INVALID_CODES_LEN: "inflate::Dynamic block code description: invalid literal/length code lengths",
		INVALID_STORE_BLOCK: "inflate::Stored block length did not match one's complement",
		INVALID_BLOCK_TYPE: "inflate::Invalid block type (type == 3)",
		CANT_EXTRACT_FILE: "Could not extract the file",
		CANT_OVERRIDE: "Target file already exists",
		DISK_ENTRY_TOO_LARGE: "Number of disk entries is too large",
		NO_ZIP: "No zip file was loaded",
		NO_ENTRY: "Entry doesn't exist",
		DIRECTORY_CONTENT_ERROR: "A directory cannot have content",
		FILE_NOT_FOUND: "File not found: \"{0}\"",
		NOT_IMPLEMENTED: "Not implemented",
		INVALID_FILENAME: "Invalid filename",
		INVALID_FORMAT: "Invalid or unsupported zip format. No END header found",
		INVALID_PASS_PARAM: "Incompatible password parameter",
		WRONG_PASSWORD: "Wrong Password",
		COMMENT_TOO_LONG: "Comment is too long",
		EXTRA_FIELD_PARSE_ERROR: "Extra field parsing error"
	};
	function n(e) {
		return function(...t) {
			return t.length && (e = e.replace(/\{(\d)\}/g, (e, n) => t[n] || "")), /* @__PURE__ */ Error("ADM-ZIP: " + e);
		};
	}
	for (let r of Object.keys(t)) e[r] = n(t[r]);
})), re = /* @__PURE__ */ b(((e, t) => {
	var n = x("fs"), r = x("path"), i = ne(), a = S(), o = typeof process == "object" && process.platform === "win32", s = (e) => typeof e == "object" && !!e, c = new Uint32Array(256).map((e, t) => {
		for (let e = 0; e < 8; e++) t & 1 ? t = 3988292384 ^ t >>> 1 : t >>>= 1;
		return t >>> 0;
	});
	function l(e) {
		this.sep = r.sep, this.fs = n, s(e) && s(e.fs) && typeof e.fs.statSync == "function" && (this.fs = e.fs);
	}
	t.exports = l, l.prototype.makeDir = function(e) {
		let t = this;
		function n(e) {
			let n = e.split(t.sep)[0];
			e.split(t.sep).forEach(function(e) {
				if (!(!e || e.substr(-1, 1) === ":")) {
					n += t.sep + e;
					var r;
					try {
						r = t.fs.statSync(n);
					} catch (e) {
						if (e.message && e.message.startsWith("ENOENT")) t.fs.mkdirSync(n);
						else throw e;
					}
					if (r && r.isFile()) throw a.FILE_IN_THE_WAY(`"${n}"`);
				}
			});
		}
		n(e);
	}, l.prototype.writeFileTo = function(e, t, n, i) {
		let a = this;
		if (a.fs.existsSync(e) && (!n || a.fs.statSync(e).isDirectory())) return !1;
		var o = r.dirname(e);
		a.fs.existsSync(o) || a.makeDir(o);
		var s;
		try {
			s = a.fs.openSync(e, "w", 438);
		} catch {
			a.fs.chmodSync(e, 438), s = a.fs.openSync(e, "w", 438);
		}
		if (s) try {
			a.fs.writeSync(s, t, 0, t.length, 0);
		} finally {
			a.fs.closeSync(s);
		}
		return a.fs.chmodSync(e, i || 438), !0;
	}, l.prototype.writeFileToAsync = function(e, t, n, i, a) {
		typeof i == "function" && (a = i, i = void 0);
		let o = this;
		o.fs.exists(e, function(s) {
			if (s && !n) return a(!1);
			o.fs.stat(e, function(n, c) {
				if (s && c.isDirectory()) return a(!1);
				var l = r.dirname(e);
				o.fs.exists(l, function(n) {
					n || o.makeDir(l), o.fs.open(e, "w", 438, function(n, r) {
						n ? o.fs.chmod(e, 438, function() {
							o.fs.open(e, "w", 438, function(n, r) {
								o.fs.write(r, t, 0, t.length, 0, function() {
									o.fs.close(r, function() {
										o.fs.chmod(e, i || 438, function() {
											a(!0);
										});
									});
								});
							});
						}) : r ? o.fs.write(r, t, 0, t.length, 0, function() {
							o.fs.close(r, function() {
								o.fs.chmod(e, i || 438, function() {
									a(!0);
								});
							});
						}) : o.fs.chmod(e, i || 438, function() {
							a(!0);
						});
					});
				});
			});
		});
	}, l.prototype.findFiles = function(e) {
		let t = this;
		function n(e, i, a) {
			typeof i == "boolean" && (a = i, i = void 0);
			let o = [];
			return t.fs.readdirSync(e).forEach(function(s) {
				let c = r.join(e, s), l = t.fs.statSync(c);
				(!i || i.test(c)) && o.push(r.normalize(c) + (l.isDirectory() ? t.sep : "")), l.isDirectory() && a && (o = o.concat(n(c, i, a)));
			}), o;
		}
		return n(e, void 0, !0);
	}, l.prototype.findFilesAsync = function(e, t) {
		let n = this, i = [];
		n.fs.readdir(e, function(a, o) {
			if (a) return t(a);
			let s = o.length;
			if (!s) return t(null, i);
			o.forEach(function(a) {
				a = r.join(e, a), n.fs.stat(a, function(e, o) {
					if (e) return t(e);
					o && (i.push(r.normalize(a) + (o.isDirectory() ? n.sep : "")), o.isDirectory() ? n.findFilesAsync(a, function(e, n) {
						if (e) return t(e);
						i = i.concat(n), --s || t(null, i);
					}) : --s || t(null, i));
				});
			});
		});
	}, l.prototype.getAttributes = function() {}, l.prototype.setAttributes = function() {}, l.crc32update = function(e, t) {
		return c[(e ^ t) & 255] ^ e >>> 8;
	}, l.crc32 = function(e) {
		typeof e == "string" && (e = Buffer.from(e, "utf8"));
		let t = e.length, n = -1;
		for (let r = 0; r < t;) n = l.crc32update(n, e[r++]);
		return ~n >>> 0;
	}, l.methodToString = function(e) {
		switch (e) {
			case i.STORED: return "STORED (" + e + ")";
			case i.DEFLATED: return "DEFLATED (" + e + ")";
			default: return "UNSUPPORTED (" + e + ")";
		}
	}, l.canonical = function(e) {
		if (!e) return "";
		let t = r.posix.normalize("/" + e.split("\\").join("/"));
		return r.join(".", t);
	}, l.zipnamefix = function(e) {
		if (!e) return "";
		let t = r.posix.normalize("/" + e.split("\\").join("/"));
		return r.posix.join(".", t);
	}, l.findLast = function(e, t) {
		if (!Array.isArray(e)) throw TypeError("arr is not array");
		let n = e.length >>> 0;
		for (let r = n - 1; r >= 0; r--) if (t(e[r], r, e)) return e[r];
	}, l.sanitize = function(e, t) {
		e = r.resolve(r.normalize(e));
		for (var n = t.split("/"), i = 0, a = n.length; i < a; i++) {
			var o = r.normalize(r.join(e, n.slice(i, a).join(r.sep)));
			if (o.indexOf(e) === 0) return o;
		}
		return r.normalize(r.join(e, r.basename(t)));
	}, l.toBuffer = function(e, t) {
		return Buffer.isBuffer(e) ? e : e instanceof Uint8Array ? Buffer.from(e) : typeof e == "string" ? t(e) : Buffer.alloc(0);
	}, l.readBigUInt64LE = function(e, t) {
		let n = e.readUInt32LE(t);
		return e.readUInt32LE(t + 4) * 4294967296 + n;
	}, l.fromDOS2Date = function(e) {
		return new Date((e >> 25 & 127) + 1980, Math.max((e >> 21 & 15) - 1, 0), Math.max(e >> 16 & 31, 1), e >> 11 & 31, e >> 5 & 63, (e & 31) << 1);
	}, l.fromDate2DOS = function(e) {
		let t = 0, n = 0;
		return e.getFullYear() > 1979 && (t = (e.getFullYear() - 1980 & 127) << 9 | e.getMonth() + 1 << 5 | e.getDate(), n = e.getHours() << 11 | e.getMinutes() << 5 | e.getSeconds() >> 1), t << 16 | n;
	}, l.isWin = o, l.crcTable = c;
})), ie = /* @__PURE__ */ b(((e, t) => {
	var n = x("path");
	t.exports = function(e, { fs: t }) {
		var r = e || "", i = o(), a = null;
		function o() {
			return {
				directory: !1,
				readonly: !1,
				hidden: !1,
				executable: !1,
				mtime: 0,
				atime: 0
			};
		}
		return r && t.existsSync(r) ? (a = t.statSync(r), i.directory = a.isDirectory(), i.mtime = a.mtime, i.atime = a.atime, i.executable = (73 & a.mode) != 0, i.readonly = (128 & a.mode) == 0, i.hidden = n.basename(r)[0] === ".") : console.warn("Invalid path: " + r), {
			get directory() {
				return i.directory;
			},
			get readOnly() {
				return i.readonly;
			},
			get hidden() {
				return i.hidden;
			},
			get mtime() {
				return i.mtime;
			},
			get atime() {
				return i.atime;
			},
			get executable() {
				return i.executable;
			},
			decodeAttributes: function() {},
			encodeAttributes: function() {},
			toJSON: function() {
				return {
					path: r,
					isDirectory: i.directory,
					isReadOnly: i.readonly,
					isHidden: i.hidden,
					isExecutable: i.executable,
					mTime: i.mtime,
					aTime: i.atime
				};
			},
			toString: function() {
				return JSON.stringify(this.toJSON(), null, "	");
			}
		};
	};
})), ae = /* @__PURE__ */ b(((e, t) => {
	t.exports = {
		efs: !0,
		encode: (e) => Buffer.from(e, "utf8"),
		decode: (e) => e.toString("utf8")
	};
})), C = /* @__PURE__ */ b(((e, t) => {
	t.exports = re(), t.exports.Constants = ne(), t.exports.Errors = S(), t.exports.FileAttr = ie(), t.exports.decoder = ae();
})), oe = /* @__PURE__ */ b(((e, t) => {
	var n = C(), r = n.Constants;
	t.exports = function() {
		var e = 20, t = 10, i = 0, a = 0, o = 0, s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0, h = 0, g = 0;
		e |= n.isWin ? 2560 : 768, i |= r.FLG_EFS;
		let _ = { extraLen: 0 }, v = (e) => Math.max(0, e) >>> 0, y = (e) => Math.max(0, e) & 255;
		return o = n.fromDate2DOS(/* @__PURE__ */ new Date()), {
			get made() {
				return e;
			},
			set made(t) {
				e = t;
			},
			get version() {
				return t;
			},
			set version(e) {
				t = e;
			},
			get flags() {
				return i;
			},
			set flags(e) {
				i = e;
			},
			get flags_efs() {
				return (i & r.FLG_EFS) > 0;
			},
			set flags_efs(e) {
				e ? i |= r.FLG_EFS : i &= ~r.FLG_EFS;
			},
			get flags_desc() {
				return (i & r.FLG_DESC) > 0;
			},
			set flags_desc(e) {
				e ? i |= r.FLG_DESC : i &= ~r.FLG_DESC;
			},
			get method() {
				return a;
			},
			set method(e) {
				switch (e) {
					case r.STORED: this.version = 10;
					case r.DEFLATED:
					default: this.version = 20;
				}
				a = e;
			},
			get time() {
				return n.fromDOS2Date(this.timeval);
			},
			set time(e) {
				e = new Date(e), this.timeval = n.fromDate2DOS(e);
			},
			get timeval() {
				return o;
			},
			set timeval(e) {
				o = v(e);
			},
			get timeHighByte() {
				return y(o >>> 8);
			},
			get crc() {
				return s;
			},
			set crc(e) {
				s = v(e);
			},
			get compressedSize() {
				return c;
			},
			set compressedSize(e) {
				c = v(e);
			},
			get size() {
				return l;
			},
			set size(e) {
				l = v(e);
			},
			get fileNameLength() {
				return u;
			},
			set fileNameLength(e) {
				u = e;
			},
			get extraLength() {
				return d;
			},
			set extraLength(e) {
				d = e;
			},
			get extraLocalLength() {
				return _.extraLen;
			},
			set extraLocalLength(e) {
				_.extraLen = e;
			},
			get commentLength() {
				return f;
			},
			set commentLength(e) {
				f = e;
			},
			get diskNumStart() {
				return p;
			},
			set diskNumStart(e) {
				p = v(e);
			},
			get inAttr() {
				return m;
			},
			set inAttr(e) {
				m = v(e);
			},
			get attr() {
				return h;
			},
			set attr(e) {
				h = v(e);
			},
			get fileAttr() {
				return (h || 0) >> 16 & 4095;
			},
			get offset() {
				return g;
			},
			set offset(e) {
				g = v(e);
			},
			get encrypted() {
				return (i & r.FLG_ENC) === r.FLG_ENC;
			},
			get centralHeaderSize() {
				return r.CENHDR + u + d + f;
			},
			get realDataOffset() {
				return g + r.LOCHDR + _.fnameLen + _.extraLen;
			},
			get localHeader() {
				return _;
			},
			loadLocalHeaderFromBinary: function(e) {
				var t = e.slice(g, g + r.LOCHDR);
				if (t.readUInt32LE(0) !== r.LOCSIG) throw n.Errors.INVALID_LOC();
				_.version = t.readUInt16LE(r.LOCVER), _.flags = t.readUInt16LE(r.LOCFLG), _.flags_desc = (_.flags & r.FLG_DESC) > 0, _.method = t.readUInt16LE(r.LOCHOW), _.time = t.readUInt32LE(r.LOCTIM), _.crc = t.readUInt32LE(r.LOCCRC), _.compressedSize = t.readUInt32LE(r.LOCSIZ), _.size = t.readUInt32LE(r.LOCLEN), _.fnameLen = t.readUInt16LE(r.LOCNAM), _.extraLen = t.readUInt16LE(r.LOCEXT);
				let i = g + r.LOCHDR + _.fnameLen, a = i + _.extraLen;
				return e.slice(i, a);
			},
			loadFromBinary: function(_) {
				if (_.length !== r.CENHDR || _.readUInt32LE(0) !== r.CENSIG) throw n.Errors.INVALID_CEN();
				e = _.readUInt16LE(r.CENVEM), t = _.readUInt16LE(r.CENVER), i = _.readUInt16LE(r.CENFLG), a = _.readUInt16LE(r.CENHOW), o = _.readUInt32LE(r.CENTIM), s = _.readUInt32LE(r.CENCRC), c = _.readUInt32LE(r.CENSIZ), l = _.readUInt32LE(r.CENLEN), u = _.readUInt16LE(r.CENNAM), d = _.readUInt16LE(r.CENEXT), f = _.readUInt16LE(r.CENCOM), p = _.readUInt16LE(r.CENDSK), m = _.readUInt16LE(r.CENATT), h = _.readUInt32LE(r.CENATX), g = _.readUInt32LE(r.CENOFF);
			},
			localHeaderToBinary: function() {
				var e = Buffer.alloc(r.LOCHDR);
				return e.writeUInt32LE(r.LOCSIG, 0), e.writeUInt16LE(t, r.LOCVER), e.writeUInt16LE(i, r.LOCFLG), e.writeUInt16LE(a, r.LOCHOW), e.writeUInt32LE(o, r.LOCTIM), e.writeUInt32LE(s, r.LOCCRC), e.writeUInt32LE(c, r.LOCSIZ), e.writeUInt32LE(l, r.LOCLEN), e.writeUInt16LE(u, r.LOCNAM), e.writeUInt16LE(_.extraLen, r.LOCEXT), e;
			},
			centralHeaderToBinary: function() {
				var n = Buffer.alloc(r.CENHDR + u + d + f);
				return n.writeUInt32LE(r.CENSIG, 0), n.writeUInt16LE(e, r.CENVEM), n.writeUInt16LE(t, r.CENVER), n.writeUInt16LE(i, r.CENFLG), n.writeUInt16LE(a, r.CENHOW), n.writeUInt32LE(o, r.CENTIM), n.writeUInt32LE(s, r.CENCRC), n.writeUInt32LE(c, r.CENSIZ), n.writeUInt32LE(l, r.CENLEN), n.writeUInt16LE(u, r.CENNAM), n.writeUInt16LE(d, r.CENEXT), n.writeUInt16LE(f, r.CENCOM), n.writeUInt16LE(p, r.CENDSK), n.writeUInt16LE(m, r.CENATT), n.writeUInt32LE(h, r.CENATX), n.writeUInt32LE(g, r.CENOFF), n;
			},
			toJSON: function() {
				let o = function(e) {
					return e + " bytes";
				};
				return {
					made: e,
					version: t,
					flags: i,
					method: n.methodToString(a),
					time: this.time,
					crc: "0x" + s.toString(16).toUpperCase(),
					compressedSize: o(c),
					size: o(l),
					fileNameLength: o(u),
					extraLength: o(d),
					commentLength: o(f),
					diskNumStart: p,
					inAttr: m,
					attr: h,
					offset: g,
					centralHeaderSize: o(r.CENHDR + u + d + f)
				};
			},
			toString: function() {
				return JSON.stringify(this.toJSON(), null, "	");
			}
		};
	};
})), se = /* @__PURE__ */ b(((e, t) => {
	var n = C(), r = n.Constants;
	t.exports = function() {
		var e = 0, t = 0, i = 0, a = 0, o = 0;
		return {
			get diskEntries() {
				return e;
			},
			set diskEntries(n) {
				e = t = n;
			},
			get totalEntries() {
				return t;
			},
			set totalEntries(n) {
				t = e = n;
			},
			get size() {
				return i;
			},
			set size(e) {
				i = e;
			},
			get offset() {
				return a;
			},
			set offset(e) {
				a = e;
			},
			get commentLength() {
				return o;
			},
			set commentLength(e) {
				o = e;
			},
			get mainHeaderSize() {
				return r.ENDHDR + o;
			},
			loadFromBinary: function(s) {
				if ((s.length !== r.ENDHDR || s.readUInt32LE(0) !== r.ENDSIG) && (s.length < r.ZIP64HDR || s.readUInt32LE(0) !== r.ZIP64SIG)) throw n.Errors.INVALID_END();
				s.readUInt32LE(0) === r.ENDSIG ? (e = s.readUInt16LE(r.ENDSUB), t = s.readUInt16LE(r.ENDTOT), i = s.readUInt32LE(r.ENDSIZ), a = s.readUInt32LE(r.ENDOFF), o = s.readUInt16LE(r.ENDCOM)) : (e = n.readBigUInt64LE(s, r.ZIP64SUB), t = n.readBigUInt64LE(s, r.ZIP64TOT), i = n.readBigUInt64LE(s, r.ZIP64SIZE), a = n.readBigUInt64LE(s, r.ZIP64OFF), o = 0);
			},
			toBinary: function() {
				var n = Buffer.alloc(r.ENDHDR + o);
				return n.writeUInt32LE(r.ENDSIG, 0), n.writeUInt32LE(0, 4), n.writeUInt16LE(e, r.ENDSUB), n.writeUInt16LE(t, r.ENDTOT), n.writeUInt32LE(i, r.ENDSIZ), n.writeUInt32LE(a, r.ENDOFF), n.writeUInt16LE(o, r.ENDCOM), n.fill(" ", r.ENDHDR), n;
			},
			toJSON: function() {
				return {
					diskEntries: e,
					totalEntries: t,
					size: i + " bytes",
					offset: function(e, t) {
						let n = e.toString(16).toUpperCase();
						for (; n.length < t;) n = "0" + n;
						return "0x" + n;
					}(a, 4),
					commentLength: o
				};
			},
			toString: function() {
				return JSON.stringify(this.toJSON(), null, "	");
			}
		};
	};
})), ce = /* @__PURE__ */ b(((e) => {
	e.EntryHeader = oe(), e.MainHeader = se();
})), le = /* @__PURE__ */ b(((e, t) => {
	t.exports = function(e) {
		var t = x("zlib"), n = { chunkSize: (parseInt(e.length / 1024) + 1) * 1024 };
		return {
			deflate: function() {
				return t.deflateRawSync(e, n);
			},
			deflateAsync: function(r) {
				var i = t.createDeflateRaw(n), a = [], o = 0;
				i.on("data", function(e) {
					a.push(e), o += e.length;
				}), i.on("end", function() {
					var e = Buffer.alloc(o), t = 0;
					e.fill(0);
					for (var n = 0; n < a.length; n++) {
						var i = a[n];
						i.copy(e, t), t += i.length;
					}
					r && r(e);
				}), i.end(e);
			}
		};
	};
})), ue = /* @__PURE__ */ b(((e, t) => {
	var n = +(process.versions ? process.versions.node : "").split(".")[0] || 0;
	t.exports = function(e, t) {
		var r = x("zlib");
		let i = n >= 15 && t > 0 ? { maxOutputLength: t } : {};
		return {
			inflate: function() {
				return r.inflateRawSync(e, i);
			},
			inflateAsync: function(t) {
				var n = r.createInflateRaw(i), a = [], o = 0;
				n.on("data", function(e) {
					a.push(e), o += e.length;
				}), n.on("end", function() {
					var e = Buffer.alloc(o), n = 0;
					e.fill(0);
					for (var r = 0; r < a.length; r++) {
						var i = a[r];
						i.copy(e, n), n += i.length;
					}
					t && t(e);
				}), n.end(e);
			}
		};
	};
})), de = /* @__PURE__ */ b(((e, t) => {
	var { randomFillSync: n } = x("crypto"), r = S(), i = new Uint32Array(256).map((e, t) => {
		for (let e = 0; e < 8; e++) t & 1 ? t = t >>> 1 ^ 3988292384 : t >>>= 1;
		return t >>> 0;
	}), a = (e, t) => Math.imul(e, t) >>> 0, o = (e, t) => i[(e ^ t) & 255] ^ e >>> 8, s = () => typeof n == "function" ? n(Buffer.alloc(12)) : s.node();
	s.node = () => {
		let e = Buffer.alloc(12), t = e.length;
		for (let n = 0; n < t; n++) e[n] = Math.random() * 256 & 255;
		return e;
	};
	var c = { genSalt: s };
	function l(e) {
		let t = Buffer.isBuffer(e) ? e : Buffer.from(e);
		this.keys = new Uint32Array([
			305419896,
			591751049,
			878082192
		]);
		for (let e = 0; e < t.length; e++) this.updateKeys(t[e]);
	}
	l.prototype.updateKeys = function(e) {
		let t = this.keys;
		return t[0] = o(t[0], e), t[1] += t[0] & 255, t[1] = a(t[1], 134775813) + 1, t[2] = o(t[2], t[1] >>> 24), e;
	}, l.prototype.next = function() {
		let e = (this.keys[2] | 2) >>> 0;
		return a(e, e ^ 1) >> 8 & 255;
	};
	function u(e) {
		let t = new l(e);
		return function(e) {
			let n = Buffer.alloc(e.length), r = 0;
			for (let i of e) n[r++] = t.updateKeys(i ^ t.next());
			return n;
		};
	}
	function d(e) {
		let t = new l(e);
		return function(e, n, r = 0) {
			n ||= Buffer.alloc(e.length);
			for (let i of e) {
				let e = t.next();
				n[r++] = i ^ e, t.updateKeys(i);
			}
			return n;
		};
	}
	function f(e, t, n) {
		if (!e || !Buffer.isBuffer(e) || e.length < 12) return Buffer.alloc(0);
		let i = u(n), a = i(e.slice(0, 12)), o = (t.flags & 8) == 8 ? t.timeHighByte : t.crc >>> 24;
		if (a[11] !== o) throw r.WRONG_PASSWORD();
		return i(e.slice(12));
	}
	function p(e) {
		Buffer.isBuffer(e) && e.length >= 12 ? c.genSalt = function() {
			return e.slice(0, 12);
		} : e === "node" ? c.genSalt = s.node : c.genSalt = s;
	}
	function m(e, t, n, r = !1) {
		e ??= Buffer.alloc(0), Buffer.isBuffer(e) || (e = Buffer.from(e.toString()));
		let i = d(n), a = c.genSalt();
		a[11] = t.crc >>> 24 & 255, r && (a[10] = t.crc >>> 16 & 255);
		let o = Buffer.alloc(e.length + 12);
		return i(a, o), i(e, o, 12);
	}
	t.exports = {
		decrypt: f,
		encrypt: m,
		_salter: p
	};
})), fe = /* @__PURE__ */ b(((e) => {
	e.Deflater = le(), e.Inflater = ue(), e.ZipCrypto = de();
})), pe = /* @__PURE__ */ b(((e, t) => {
	var n = C(), r = ce(), i = n.Constants, a = fe();
	t.exports = function(e, t) {
		var o = new r.EntryHeader(), s = Buffer.alloc(0), c = Buffer.alloc(0), l = !1, u = null, d = Buffer.alloc(0), f = Buffer.alloc(0), p = !0;
		let m = e, h = typeof m.decoder == "object" ? m.decoder : n.decoder;
		p = h.hasOwnProperty("efs") ? h.efs : !1;
		function g() {
			return !t || !(t instanceof Uint8Array) ? Buffer.alloc(0) : (f = o.loadLocalHeaderFromBinary(t), t.slice(o.realDataOffset, o.realDataOffset + o.compressedSize));
		}
		function _(e) {
			if (!o.flags_desc && !o.localHeader.flags_desc) {
				if (n.crc32(e) !== o.localHeader.crc) return !1;
			} else {
				let r = {}, a = o.realDataOffset + o.compressedSize;
				if (t.readUInt32LE(a) == i.LOCSIG || t.readUInt32LE(a) == i.CENSIG) throw n.Errors.DESCRIPTOR_NOT_EXIST();
				if (t.readUInt32LE(a) == i.EXTSIG) r.crc = t.readUInt32LE(a + i.EXTCRC), r.compressedSize = t.readUInt32LE(a + i.EXTSIZ), r.size = t.readUInt32LE(a + i.EXTLEN);
				else if (t.readUInt16LE(a + 12) === 19280) r.crc = t.readUInt32LE(a + i.EXTCRC - 4), r.compressedSize = t.readUInt32LE(a + i.EXTSIZ - 4), r.size = t.readUInt32LE(a + i.EXTLEN - 4);
				else throw n.Errors.DESCRIPTOR_UNKNOWN();
				if (r.compressedSize !== o.compressedSize || r.size !== o.size || r.crc !== o.crc) throw n.Errors.DESCRIPTOR_FAULTY();
				if (n.crc32(e) !== r.crc) return !1;
			}
			return !0;
		}
		function v(e, t, r) {
			if (t === void 0 && typeof e == "string" && (r = e, e = void 0), l) return e && t && t(Buffer.alloc(0), n.Errors.DIRECTORY_CONTENT_ERROR()), Buffer.alloc(0);
			var i = g();
			if (i.length === 0) return e && t && t(i), i;
			if (o.encrypted) {
				if (typeof r != "string" && !Buffer.isBuffer(r)) throw n.Errors.INVALID_PASS_PARAM();
				i = a.ZipCrypto.decrypt(i, o, r);
			}
			var c = Buffer.alloc(o.size);
			switch (o.method) {
				case n.Constants.STORED:
					if (i.copy(c), _(c)) return e && t && t(c), c;
					throw e && t && t(c, n.Errors.BAD_CRC()), n.Errors.BAD_CRC();
				case n.Constants.DEFLATED:
					var u = new a.Inflater(i, o.size);
					if (e) u.inflateAsync(function(e) {
						e.copy(e, 0), t && (_(e) ? t(e) : t(e, n.Errors.BAD_CRC()));
					});
					else {
						if (u.inflate(c).copy(c, 0), !_(c)) throw n.Errors.BAD_CRC(`"${h.decode(s)}"`);
						return c;
					}
					break;
				default: throw e && t && t(Buffer.alloc(0), n.Errors.UNKNOWN_METHOD()), n.Errors.UNKNOWN_METHOD();
			}
		}
		function y(e, r) {
			if ((!u || !u.length) && Buffer.isBuffer(t)) return e && r && r(g()), g();
			if (u.length && !l) {
				var i;
				switch (o.method) {
					case n.Constants.STORED: return o.compressedSize = o.size, i = Buffer.alloc(u.length), u.copy(i), e && r && r(i), i;
					default:
					case n.Constants.DEFLATED:
						var s = new a.Deflater(u);
						if (e) s.deflateAsync(function(e) {
							i = Buffer.alloc(e.length), o.compressedSize = e.length, e.copy(i), r && r(i);
						});
						else {
							var c = s.deflate();
							return o.compressedSize = c.length, c;
						}
						s = null;
						break;
				}
			} else if (e && r) r(Buffer.alloc(0));
			else return Buffer.alloc(0);
		}
		function b(e, t) {
			return n.readBigUInt64LE(e, t);
		}
		function ee(e) {
			try {
				for (var t = 0, r, a, o; t + 4 < e.length;) r = e.readUInt16LE(t), t += 2, a = e.readUInt16LE(t), t += 2, o = e.slice(t, t + a), t += a, i.ID_ZIP64 === r && te(o);
			} catch {
				throw n.Errors.EXTRA_FIELD_PARSE_ERROR();
			}
		}
		function te(e) {
			var t, n, r, a;
			e.length >= i.EF_ZIP64_SCOMP && (t = b(e, i.EF_ZIP64_SUNCOMP), o.size === i.EF_ZIP64_OR_32 && (o.size = t)), e.length >= i.EF_ZIP64_RHO && (n = b(e, i.EF_ZIP64_SCOMP), o.compressedSize === i.EF_ZIP64_OR_32 && (o.compressedSize = n)), e.length >= i.EF_ZIP64_DSN && (r = b(e, i.EF_ZIP64_RHO), o.offset === i.EF_ZIP64_OR_32 && (o.offset = r)), e.length >= i.EF_ZIP64_DSN + 4 && (a = e.readUInt32LE(i.EF_ZIP64_DSN), o.diskNumStart === i.EF_ZIP64_OR_16 && (o.diskNumStart = a));
		}
		return {
			get entryName() {
				return h.decode(s);
			},
			get rawEntryName() {
				return s;
			},
			set entryName(e) {
				s = n.toBuffer(e, h.encode);
				var t = s[s.length - 1];
				l = t === 47 || t === 92, o.fileNameLength = s.length;
			},
			get efs() {
				return typeof p == "function" ? p(this.entryName) : p;
			},
			get extra() {
				return d;
			},
			set extra(e) {
				d = e, o.extraLength = e.length, ee(e);
			},
			get comment() {
				return h.decode(c);
			},
			set comment(e) {
				if (c = n.toBuffer(e, h.encode), o.commentLength = c.length, c.length > 65535) throw n.Errors.COMMENT_TOO_LONG();
			},
			get name() {
				var e = h.decode(s);
				return l ? e.substr(e.length - 1).split("/").pop() : e.split("/").pop();
			},
			get isDirectory() {
				return l;
			},
			getCompressedData: function() {
				return y(!1, null);
			},
			getCompressedDataAsync: function(e) {
				y(!0, e);
			},
			setData: function(e) {
				u = n.toBuffer(e, n.decoder.encode), !l && u.length ? (o.size = u.length, o.method = n.Constants.DEFLATED, o.crc = n.crc32(e), o.changed = !0) : o.method = n.Constants.STORED;
			},
			getData: function(e) {
				return o.changed ? u : v(!1, null, e);
			},
			getDataAsync: function(e, t) {
				o.changed ? e(u) : v(!0, e, t);
			},
			set attr(e) {
				o.attr = e;
			},
			get attr() {
				return o.attr;
			},
			set header(e) {
				o.loadFromBinary(e);
			},
			get header() {
				return o;
			},
			packCentralHeader: function() {
				o.flags_efs = this.efs, o.extraLength = d.length;
				var e = o.centralHeaderToBinary(), t = n.Constants.CENHDR;
				return s.copy(e, t), t += s.length, d.copy(e, t), t += o.extraLength, c.copy(e, t), e;
			},
			packLocalHeader: function() {
				let e = 0;
				o.flags_efs = this.efs, o.extraLocalLength = f.length;
				let t = o.localHeaderToBinary(), n = Buffer.alloc(t.length + s.length + o.extraLocalLength);
				return t.copy(n, e), e += t.length, s.copy(n, e), e += s.length, f.copy(n, e), e += f.length, n;
			},
			toJSON: function() {
				let e = function(e) {
					return "<" + (e && e.length + " bytes buffer" || "null") + ">";
				};
				return {
					entryName: this.entryName,
					name: this.name,
					comment: this.comment,
					isDirectory: this.isDirectory,
					header: o.toJSON(),
					compressedData: e(t),
					data: e(u)
				};
			},
			toString: function() {
				return JSON.stringify(this.toJSON(), null, "	");
			}
		};
	};
})), me = /* @__PURE__ */ b(((e, t) => {
	var n = pe(), r = ce(), i = C();
	t.exports = function(e, t) {
		var a = [], o = {}, s = Buffer.alloc(0), c = new r.MainHeader(), l = !1;
		let u = /* @__PURE__ */ new Set(), d = t, { noSort: f, decoder: p } = d;
		e ? g(d.readEntries) : l = !0;
		function m() {
			let e = /* @__PURE__ */ new Set();
			for (let t of Object.keys(o)) {
				let n = t.split("/");
				if (n.pop(), n.length) for (let t = 0; t < n.length; t++) {
					let r = n.slice(0, t + 1).join("/") + "/";
					e.add(r);
				}
			}
			for (let t of e) if (!(t in o)) {
				let e = new n(d);
				e.entryName = t, e.attr = 16, e.temporary = !0, a.push(e), o[e.entryName] = e, u.add(e);
			}
		}
		function h() {
			if (l = !0, o = {}, c.diskEntries > (e.length - c.offset) / i.Constants.CENHDR) throw i.Errors.DISK_ENTRY_TOO_LARGE();
			a = Array(c.diskEntries);
			for (var t = c.offset, r = 0; r < a.length; r++) {
				var s = t, f = new n(d, e);
				f.header = e.slice(s, s += i.Constants.CENHDR), f.entryName = e.slice(s, s += f.header.fileNameLength), f.header.extraLength && (f.extra = e.slice(s, s += f.header.extraLength)), f.header.commentLength && (f.comment = e.slice(s, s + f.header.commentLength)), t += f.header.centralHeaderSize, a[r] = f, o[f.entryName] = f;
			}
			u.clear(), m();
		}
		function g(t) {
			var n = e.length - i.Constants.ENDHDR, r = Math.max(0, n - 65535), a = r, o = e.length, l = -1, u = 0;
			for (typeof d.trailingSpace == "boolean" && d.trailingSpace && (r = 0); n >= a; n--) if (e[n] === 80) {
				if (e.readUInt32LE(n) === i.Constants.ENDSIG) {
					l = n, u = n, o = n + i.Constants.ENDHDR, a = n - i.Constants.END64HDR;
					continue;
				}
				if (e.readUInt32LE(n) === i.Constants.END64SIG) {
					a = r;
					continue;
				}
				if (e.readUInt32LE(n) === i.Constants.ZIP64SIG) {
					l = n, o = n + i.readBigUInt64LE(e, n + i.Constants.ZIP64SIZE) + i.Constants.ZIP64LEAD;
					break;
				}
			}
			if (l == -1) throw i.Errors.INVALID_FORMAT();
			c.loadFromBinary(e.slice(l, o)), c.commentLength && (s = e.slice(u + i.Constants.ENDHDR)), t && h();
		}
		function _() {
			a.length > 1 && !f && a.sort((e, t) => e.entryName.toLowerCase().localeCompare(t.entryName.toLowerCase()));
		}
		return {
			get entries() {
				return l || h(), a.filter((e) => !u.has(e));
			},
			get comment() {
				return p.decode(s);
			},
			set comment(e) {
				s = i.toBuffer(e, p.encode), c.commentLength = s.length;
			},
			getEntryCount: function() {
				return l ? a.length : c.diskEntries;
			},
			forEach: function(e) {
				this.entries.forEach(e);
			},
			getEntry: function(e) {
				return l || h(), o[e] || null;
			},
			setEntry: function(e) {
				l || h(), a.push(e), o[e.entryName] = e, c.totalEntries = a.length;
			},
			deleteFile: function(e, t = !0) {
				l || h();
				let n = o[e];
				this.getEntryChildren(n, t).map((e) => e.entryName).forEach(this.deleteEntry);
			},
			deleteEntry: function(e) {
				l || h();
				let t = o[e], n = a.indexOf(t);
				n >= 0 && (a.splice(n, 1), delete o[e], c.totalEntries = a.length);
			},
			getEntryChildren: function(e, t = !0) {
				if (l || h(), typeof e == "object") if (e.isDirectory && t) {
					let t = [], n = e.entryName;
					for (let e of a) e.entryName.startsWith(n) && t.push(e);
					return t;
				} else return [e];
				return [];
			},
			getChildCount: function(e) {
				if (e && e.isDirectory) {
					let t = this.getEntryChildren(e);
					return t.includes(e) ? t.length - 1 : t.length;
				}
				return 0;
			},
			compressToBuffer: function() {
				l || h(), _();
				let t = [], n = [], r = 0, a = 0;
				c.size = 0, c.offset = 0;
				let o = 0;
				for (let e of this.entries) {
					let i = e.getCompressedData();
					e.header.offset = a;
					let s = e.packLocalHeader(), l = s.length + i.length;
					a += l, t.push(s), t.push(i);
					let u = e.packCentralHeader();
					n.push(u), c.size += u.length, r += l + u.length, o++;
				}
				r += c.mainHeaderSize, c.offset = a, c.totalEntries = o, a = 0;
				let u = Buffer.alloc(r);
				for (let e of t) e.copy(u, a), a += e.length;
				for (let e of n) e.copy(u, a), a += e.length;
				let d = c.toBinary();
				return s && s.copy(d, i.Constants.ENDHDR), d.copy(u, a), e = u, l = !1, u;
			},
			toAsyncBuffer: function(t, n, r, a) {
				try {
					l || h(), _();
					let n = [], o = [], u = 0, d = 0, f = 0;
					c.size = 0, c.offset = 0;
					let p = function(m) {
						if (m.length > 0) {
							let e = m.shift(), t = e.entryName + e.extra.toString();
							r && r(t), e.getCompressedDataAsync(function(r) {
								a && a(t), e.header.offset = d;
								let i = e.packLocalHeader(), s = i.length + r.length;
								d += s, n.push(i), n.push(r);
								let l = e.packCentralHeader();
								o.push(l), c.size += l.length, u += s + l.length, f++, p(m);
							});
						} else {
							u += c.mainHeaderSize, c.offset = d, c.totalEntries = f, d = 0;
							let r = Buffer.alloc(u);
							n.forEach(function(e) {
								e.copy(r, d), d += e.length;
							}), o.forEach(function(e) {
								e.copy(r, d), d += e.length;
							});
							let a = c.toBinary();
							s && s.copy(a, i.Constants.ENDHDR), a.copy(r, d), e = r, l = !1, t(r);
						}
					};
					p(Array.from(this.entries));
				} catch (e) {
					n(e);
				}
			}
		};
	};
})), w = /* @__PURE__ */ te((/* @__PURE__ */ b(((e, t) => {
	var n = C(), r = x("path"), i = pe(), a = me(), o = (...e) => n.findLast(e, (e) => typeof e == "boolean"), s = (...e) => n.findLast(e, (e) => typeof e == "string"), c = (...e) => n.findLast(e, (e) => typeof e == "function"), l = {
		noSort: !1,
		readEntries: !1,
		method: n.Constants.NONE,
		fs: null
	};
	t.exports = function(e, t) {
		let u = null, d = Object.assign(Object.create(null), l);
		e && typeof e == "object" && (e instanceof Uint8Array || (Object.assign(d, e), e = d.input ? d.input : void 0, d.input && delete d.input), Buffer.isBuffer(e) && (u = e, d.method = n.Constants.BUFFER, e = void 0)), Object.assign(d, t);
		let f = new n(d);
		if ((typeof d.decoder != "object" || typeof d.decoder.encode != "function" || typeof d.decoder.decode != "function") && (d.decoder = n.decoder), e && typeof e == "string") if (f.fs.existsSync(e)) d.method = n.Constants.FILE, d.filename = e, u = f.fs.readFileSync(e);
		else throw n.Errors.INVALID_FILENAME();
		let p = new a(u, d), { canonical: m, sanitize: h, zipnamefix: g } = n;
		function _(e) {
			if (e && p) {
				var t;
				if (typeof e == "string" && (t = p.getEntry(r.posix.normalize(e))), typeof e == "object" && e.entryName !== void 0 && e.header !== void 0 && (t = p.getEntry(e.entryName)), t) return t;
			}
			return null;
		}
		function v(e) {
			let { join: t, normalize: n, sep: i } = r.posix;
			return t(r.isAbsolute(e) ? "/" : ".", n(i + e.split("\\").join(i) + i));
		}
		function y(e) {
			return e instanceof RegExp ? (function(e) {
				return function(t) {
					return e.test(t);
				};
			})(e) : typeof e == "function" ? e : () => !0;
		}
		let b = (e, t) => {
			let n = t.slice(-1);
			return n = n === f.sep ? f.sep : "", r.relative(e, t) + n;
		};
		return {
			readFile: function(e, t) {
				var n = _(e);
				return n && n.getData(t) || null;
			},
			childCount: function(e) {
				let t = _(e);
				if (t) return p.getChildCount(t);
			},
			readFileAsync: function(e, t) {
				var n = _(e);
				n ? n.getDataAsync(t) : t(null, "getEntry failed for:" + e);
			},
			readAsText: function(e, t) {
				var n = _(e);
				if (n) {
					var r = n.getData();
					if (r && r.length) return r.toString(t || "utf8");
				}
				return "";
			},
			readAsTextAsync: function(e, t, n) {
				var r = _(e);
				r ? r.getDataAsync(function(e, r) {
					if (r) {
						t(e, r);
						return;
					}
					e && e.length ? t(e.toString(n || "utf8")) : t("");
				}) : t("");
			},
			deleteFile: function(e, t = !0) {
				var n = _(e);
				n && p.deleteFile(n.entryName, t);
			},
			deleteEntry: function(e) {
				var t = _(e);
				t && p.deleteEntry(t.entryName);
			},
			addZipComment: function(e) {
				p.comment = e;
			},
			getZipComment: function() {
				return p.comment || "";
			},
			addZipEntryComment: function(e, t) {
				var n = _(e);
				n && (n.comment = t);
			},
			getZipEntryComment: function(e) {
				var t = _(e);
				return t && t.comment || "";
			},
			updateFile: function(e, t) {
				var n = _(e);
				n && n.setData(t);
			},
			addLocalFile: function(e, t, i, a) {
				if (f.fs.existsSync(e)) {
					t = t ? v(t) : "";
					let n = r.win32.basename(r.win32.normalize(e));
					t += i || n;
					let o = f.fs.statSync(e), s = o.isFile() ? f.fs.readFileSync(e) : Buffer.alloc(0);
					o.isDirectory() && (t += f.sep), this.addFile(t, s, a, o);
				} else throw n.Errors.FILE_NOT_FOUND(e);
			},
			addLocalFileAsync: function(e, t) {
				e = typeof e == "object" ? e : { localPath: e };
				let n = r.resolve(e.localPath), { comment: i } = e, { zipPath: a, zipName: o } = e, s = this;
				f.fs.stat(n, function(e, c) {
					if (e) return t(e, !1);
					a = a ? v(a) : "";
					let l = r.win32.basename(r.win32.normalize(n));
					if (a += o || l, c.isFile()) f.fs.readFile(n, function(e, n) {
						return e ? t(e, !1) : (s.addFile(a, n, i, c), setImmediate(t, void 0, !0));
					});
					else if (c.isDirectory()) return a += f.sep, s.addFile(a, Buffer.alloc(0), i, c), setImmediate(t, void 0, !0);
				});
			},
			addLocalFolder: function(e, t, i) {
				if (i = y(i), t = t ? v(t) : "", e = r.normalize(e), f.fs.existsSync(e)) {
					let n = f.findFiles(e), a = this;
					if (n.length) for (let o of n) {
						let n = r.join(t, b(e, o));
						i(n) && a.addLocalFile(o, r.dirname(n));
					}
				} else throw n.Errors.FILE_NOT_FOUND(e);
			},
			addLocalFolderAsync: function(e, t, i, a) {
				a = y(a), i = i ? v(i) : "", e = r.normalize(e);
				var o = this;
				f.fs.open(e, "r", function(r) {
					if (r && r.code === "ENOENT") t(void 0, n.Errors.FILE_NOT_FOUND(e));
					else if (r) t(void 0, r);
					else {
						var s = f.findFiles(e), c = -1, l = function() {
							if (c += 1, c < s.length) {
								var n = s[c], r = b(e, n).split("\\").join("/");
								r = r.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, ""), a(r) ? f.fs.stat(n, function(e, a) {
									e && t(void 0, e), a.isFile() ? f.fs.readFile(n, function(e, n) {
										e ? t(void 0, e) : (o.addFile(i + r, n, "", a), l());
									}) : (o.addFile(i + r + "/", Buffer.alloc(0), "", a), l());
								}) : process.nextTick(() => {
									l();
								});
							} else t(!0, void 0);
						};
						l();
					}
				});
			},
			addLocalFolderAsync2: function(e, t) {
				let i = this;
				e = typeof e == "object" ? e : { localPath: e }, localPath = r.resolve(v(e.localPath));
				let { zipPath: a, filter: o, namefix: s } = e;
				o instanceof RegExp ? o = (function(e) {
					return function(t) {
						return e.test(t);
					};
				})(o) : typeof o != "function" && (o = function() {
					return !0;
				}), a = a ? v(a) : "", s == "latin1" && (s = (e) => e.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "")), typeof s != "function" && (s = (e) => e);
				let c = (e) => r.join(a, s(b(localPath, e))), l = (e) => r.win32.basename(r.win32.normalize(s(e)));
				f.fs.open(localPath, "r", function(e) {
					e && e.code === "ENOENT" ? t(void 0, n.Errors.FILE_NOT_FOUND(localPath)) : e ? t(void 0, e) : f.findFilesAsync(localPath, function(e, n) {
						if (e) return t(e);
						n = n.filter((e) => o(c(e))), n.length || t(void 0, !1), setImmediate(n.reverse().reduce(function(e, t) {
							return function(n, a) {
								if (n || a === !1) return setImmediate(e, n, !1);
								i.addLocalFileAsync({
									localPath: t,
									zipPath: r.dirname(c(t)),
									zipName: l(t)
								}, e);
							};
						}, t));
					});
				});
			},
			addLocalFolderPromise: function(e, t) {
				return new Promise((n, r) => {
					this.addLocalFolderAsync2(Object.assign({ localPath: e }, t), (e, t) => {
						e && r(e), t && n(this);
					});
				});
			},
			addFile: function(e, t, n, r) {
				e = g(e);
				let a = _(e), o = a != null;
				o || (a = new i(d), a.entryName = e), a.comment = n || "";
				let s = typeof r == "object" && r instanceof f.fs.Stats;
				s && (a.header.time = r.mtime);
				var c = a.isDirectory ? 16 : 0;
				let l = a.isDirectory ? 16384 : 32768;
				return s ? l |= 4095 & r.mode : typeof r == "number" ? l |= 4095 & r : l |= a.isDirectory ? 493 : 420, c = (c | l << 16) >>> 0, a.attr = c, a.setData(t), o || p.setEntry(a), a;
			},
			getEntries: function(e) {
				return p.password = e, p ? p.entries : [];
			},
			getEntry: function(e) {
				return _(e);
			},
			getEntryCount: function() {
				return p.getEntryCount();
			},
			forEach: function(e) {
				return p.forEach(e);
			},
			extractEntryTo: function(e, t, i, a, c, l) {
				a = o(!1, a), c = o(!1, c), i = o(!0, i), l = s(c, l);
				var u = _(e);
				if (!u) throw n.Errors.NO_ENTRY();
				var d = m(u.entryName), g = h(t, l && !u.isDirectory ? l : i ? d : r.basename(d));
				if (u.isDirectory) return p.getEntryChildren(u).forEach(function(e) {
					if (e.isDirectory) return;
					var o = e.getData();
					if (!o) throw n.Errors.CANT_EXTRACT_FILE();
					var s = m(e.entryName), l = h(t, i ? s : r.basename(s));
					let u = c ? e.header.fileAttr : void 0;
					f.writeFileTo(l, o, a, u);
				}), !0;
				var v = u.getData(p.password);
				if (!v) throw n.Errors.CANT_EXTRACT_FILE();
				if (f.fs.existsSync(g) && !a) throw n.Errors.CANT_OVERRIDE();
				let y = c ? e.header.fileAttr : void 0;
				return f.writeFileTo(g, v, a, y), !0;
			},
			test: function(e) {
				if (!p) return !1;
				for (var t in p.entries) try {
					if (t.isDirectory) continue;
					if (!p.entries[t].getData(e)) return !1;
				} catch {
					return !1;
				}
				return !0;
			},
			extractAllTo: function(e, t, r, i) {
				if (r = o(!1, r), i = s(r, i), t = o(!1, t), !p) throw n.Errors.NO_ZIP();
				p.entries.forEach(function(a) {
					var o = h(e, m(a.entryName));
					if (a.isDirectory) {
						f.makeDir(o);
						return;
					}
					var s = a.getData(i);
					if (!s) throw n.Errors.CANT_EXTRACT_FILE();
					let c = r ? a.header.fileAttr : void 0;
					f.writeFileTo(o, s, t, c);
					try {
						f.fs.utimesSync(o, a.header.time, a.header.time);
					} catch {
						throw n.Errors.CANT_EXTRACT_FILE();
					}
				});
			},
			extractAllToAsync: function(e, t, i, a) {
				if (a = c(t, i, a), i = o(!1, i), t = o(!1, t), !a) return new Promise((n, r) => {
					this.extractAllToAsync(e, t, i, function(e) {
						e ? r(e) : n(this);
					});
				});
				if (!p) {
					a(n.Errors.NO_ZIP());
					return;
				}
				e = r.resolve(e);
				let s = (t) => h(e, r.normalize(m(t.entryName))), l = (e, t) => /* @__PURE__ */ Error(e + ": \"" + t + "\""), u = [], d = [];
				p.entries.forEach((e) => {
					e.isDirectory ? u.push(e) : d.push(e);
				});
				for (let e of u) {
					let t = s(e), n = i ? e.header.fileAttr : void 0;
					try {
						f.makeDir(t), n && f.fs.chmodSync(t, n), f.fs.utimesSync(t, e.header.time, e.header.time);
					} catch {
						a(l("Unable to create folder", t));
					}
				}
				d.reverse().reduce(function(a, o) {
					return function(s) {
						if (s) a(s);
						else {
							let s = r.normalize(m(o.entryName)), c = h(e, s);
							o.getDataAsync(function(e, r) {
								if (r) a(r);
								else if (!e) a(n.Errors.CANT_EXTRACT_FILE());
								else {
									let n = i ? o.header.fileAttr : void 0;
									f.writeFileToAsync(c, e, t, n, function(e) {
										e || a(l("Unable to write file", c)), f.fs.utimes(c, o.header.time, o.header.time, function(e) {
											e ? a(l("Unable to set times", c)) : a();
										});
									});
								}
							});
						}
					};
				}, a)();
			},
			writeZip: function(e, t) {
				if (arguments.length === 1 && typeof e == "function" && (t = e, e = ""), !e && d.filename && (e = d.filename), e) {
					var n = p.compressToBuffer();
					if (n) {
						var r = f.writeFileTo(e, n, !0);
						typeof t == "function" && t(r ? null : /* @__PURE__ */ Error("failed"), "");
					}
				}
			},
			writeZipPromise: function(e, t) {
				let { overwrite: n, perm: r } = Object.assign({ overwrite: !0 }, t);
				return new Promise((t, i) => {
					!e && d.filename && (e = d.filename), e || i("ADM-ZIP: ZIP File Name Missing"), this.toBufferPromise().then((a) => {
						f.writeFileToAsync(e, a, n, r, (e) => e ? t(e) : i("ADM-ZIP: Wasn't able to write zip file"));
					}, i);
				});
			},
			toBufferPromise: function() {
				return new Promise((e, t) => {
					p.toAsyncBuffer(e, t);
				});
			},
			toBuffer: function(e, t, n, r) {
				return typeof e == "function" ? (p.toAsyncBuffer(e, t, n, r), null) : p.compressToBuffer();
			}
		};
	};
})))(), 1), he = c(import.meta.url), ge = d.dirname(he), _e = 4096, ve = 2048, ye = 200;
function T() {
	return process.env.NODE_ENV === "test" ? d.join(ge, "../tmp-test-credentials.enc") : d.join(n.getPath("userData"), "credentials.enc");
}
function be(e) {
	return Array.from(e).some((e) => {
		let t = e.codePointAt(0);
		return t !== void 0 && (t <= 31 || t === 127);
	});
}
function xe(e) {
	if (e == null) return "openai";
	if (e === "openai" || e === "anthropic") return e;
	throw Error("Invalid API style");
}
function Se(e) {
	return e === "anthropic" ? "anthropic" : "openai";
}
function E(e, t, n) {
	if (e == null) return;
	if (typeof e != "string") throw Error(`Invalid ${t}`);
	let r = e.trim();
	if (r) {
		if (r.length > n || be(r)) throw Error(`Invalid ${t}`);
		return r;
	}
}
function Ce(e) {
	let t = E(e, "API key", _e);
	if (t && /\s/.test(t)) throw Error("Invalid API key");
	return t;
}
function we(e) {
	return e.toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
}
function Te(e) {
	let t = e.split(".");
	if (t.length !== 4) return !1;
	let n = t.map((e) => Number(e));
	if (n.some((e) => !Number.isInteger(e) || e < 0 || e > 255)) return !1;
	let [r, i] = n;
	return r === 10 || r === 127 || r === 172 && i >= 16 && i <= 31 || r === 192 && i === 168 || r === 169 && i === 254 || r === 0;
}
function Ee(e) {
	let t = we(e), n = t.includes(":");
	return t === "localhost" || t.endsWith(".localhost") || t === "::" || t === "::1" || n && t.startsWith("fe80:") || n && t.startsWith("fc") || n && t.startsWith("fd") || Te(t);
}
function D(e) {
	let t = e.trim();
	if (!t || t.length > ve || be(t)) throw Error("Invalid Base URL");
	let n;
	try {
		n = new URL(t);
	} catch {
		throw Error("Invalid Base URL");
	}
	if (n.protocol !== "https:") throw Error("Base URL must use HTTPS");
	if (n.username || n.password || n.search || n.hash) throw Error("Invalid Base URL");
	if (Ee(n.hostname)) throw Error("Base URL host is not allowed");
	return n.toString().replace(/\/+$/g, "");
}
function De(e) {
	let t = E(e, "Base URL", ve);
	return t ? D(t) : void 0;
}
function Oe(e) {
	return E(e, "model", ye);
}
function ke(e) {
	if (!e || typeof e != "object") throw Error("Invalid credentials");
	let t = O(), n = Ce(e.qaApiKey) || t?.qaApiKey;
	if (!n) throw Error("API Key is required");
	return {
		qaApiKey: n,
		qaBaseUrl: De(e.qaBaseUrl),
		qaModel: Oe(e.qaModel),
		qaApiStyle: xe(e.qaApiStyle)
	};
}
async function Ae(e) {
	if (!a.isEncryptionAvailable()) throw console.warn("[SecureStore] Encryption not available, credentials will not be saved"), Error("Encryption not available on this system");
	let t = ke(e);
	try {
		let e = JSON.stringify(t), n = a.encryptString(e);
		u.writeFileSync(T(), n), console.log("[SecureStore] Credentials saved securely");
	} catch (e) {
		throw console.error("[SecureStore] Failed to save credentials:", e), Error("Failed to save credentials securely");
	}
}
function O() {
	let e = T();
	if (u.existsSync(e)) try {
		if (!a.isEncryptionAvailable()) return console.warn("[SecureStore] Encryption not available, cannot decrypt credentials"), null;
		let t = u.readFileSync(e), n = a.decryptString(t), r = JSON.parse(n);
		return console.log("[SecureStore] Credentials loaded from secure storage"), r;
	} catch (e) {
		return console.error("[SecureStore] Failed to load credentials:", e), null;
	}
	return null;
}
function je() {
	let e = O();
	return e ? {
		hasApiKey: !!e.qaApiKey,
		qaBaseUrl: e.qaBaseUrl,
		qaModel: e.qaModel,
		qaApiStyle: Se(e.qaApiStyle)
	} : null;
}
function k() {
	let e = O();
	return e?.qaApiKey ? e.qaApiKey : process.env.QA_API_KEY || process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY || "";
}
function Me(e) {
	let t = O();
	return t?.qaBaseUrl ? D(t.qaBaseUrl) : process.env.QA_BASE_URL ? D(process.env.QA_BASE_URL) : process.env.OPENROUTER_BASE_URL ? D(process.env.OPENROUTER_BASE_URL) : D(e === "anthropic" ? "https://api.minimax.io/anthropic" : "https://openrouter.ai/api/v1");
}
function Ne(e, t) {
	return e === "anthropic" ? "MiniMax-M2.7" : t?.includes("openrouter.ai") ? "google/gemini-2.0-flash-thinking-exp:free" : "gpt-3.5-turbo";
}
function Pe(e) {
	let t = O();
	return t?.qaModel ? t.qaModel : process.env.QA_MODEL ? process.env.QA_MODEL : Ne(e, Me(e));
}
function Fe() {
	let e = O();
	return e?.qaApiStyle ? Se(e.qaApiStyle) : (process.env.QA_API_STYLE || "").toLowerCase() === "anthropic" ? "anthropic" : "openai";
}
function Ie() {
	try {
		let e = T();
		u.existsSync(e) && (u.unlinkSync(e), console.log("[SecureStore] Credentials cleared"));
	} catch (e) {
		console.error("[SecureStore] Failed to clear credentials:", e);
	}
}
function Le() {
	return k().length > 0;
}
//#endregion
//#region electron/qa-service.ts
var Re = c(import.meta.url), ze = d.dirname(Re);
function A() {
	return process.env.NODE_ENV === "test" ? (process.env.QA_API_STYLE || "").toLowerCase() === "anthropic" ? "anthropic" : "openai" : Fe();
}
function j() {
	return process.env.NODE_ENV === "test" ? process.env.QA_API_KEY || process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY || "" : k();
}
function M() {
	return process.env.NODE_ENV === "test" ? process.env.QA_BASE_URL ? process.env.QA_BASE_URL : process.env.OPENROUTER_BASE_URL ? process.env.OPENROUTER_BASE_URL : D(A() === "anthropic" ? "https://api.minimax.io/anthropic" : "https://openrouter.ai/api/v1") : Me(A());
}
function Be() {
	return process.env.NODE_ENV === "test" ? process.env.QA_MODEL ? process.env.QA_MODEL : A() === "anthropic" ? "MiniMax-M2.7" : M().includes("openrouter.ai") ? "google/gemini-2.0-flash-thinking-exp:free" : "gpt-3.5-turbo" : Pe(A());
}
function Ve(e) {
	return e.replace(/\/+$/g, "");
}
function He(e) {
	try {
		let t = new URL(e);
		return t.pathname !== "/" && t.pathname !== "";
	} catch {
		return e.split("/").length > 3;
	}
}
function Ue() {
	return D(M());
}
function We(e, t) {
	throw Error(`${e} API request failed with status ${t}`);
}
var N = [], P = null, F = "idle", Ge = null, I = 0;
function L(e) {
	return e.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((e) => e.length > 2);
}
function Ke(e, t, n) {
	let r = Array(t.size).fill(0), i = /* @__PURE__ */ new Map();
	for (let t of e) i.set(t, (i.get(t) || 0) + 1);
	for (let [a, o] of i) {
		let i = t.get(a);
		i !== void 0 && (r[i] = o / e.length * (n.get(a) || 0));
	}
	return r;
}
function qe(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = e.map((e) => L(e));
	for (let e of r) {
		let t = new Set(e);
		for (let e of t) n.set(e, (n.get(e) || 0) + 1);
	}
	let i = 0;
	for (let e of n.keys()) t.set(e, i++);
	let a = /* @__PURE__ */ new Map(), o = e.length;
	for (let [e, t] of n) a.set(e, Math.log((o + 1) / (t + 1)) + 1);
	return {
		vocab: t,
		idf: a
	};
}
function Je(e, t) {
	let n = new Set(L(e));
	if (n.size === 0) return 0;
	let r = new Set(L(t)), i = 0;
	for (let e of n) r.has(e) && i++;
	return i / n.size;
}
async function Ye(e, t) {
	let n = Ve(Ue()), r;
	r = n.endsWith("/chat/completions") ? n : n.endsWith("/api/v1") || n.endsWith("/v1") || He(n) ? `${n}/chat/completions` : `${n}/v1/chat/completions`, console.log("[QA] API endpoint:", r);
	let i = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${j()}`
	};
	n.includes("openrouter.ai") && (i["HTTP-Referer"] = "https://github.com", i["X-Title"] = "UniversalReader");
	let a = await fetch(r, {
		method: "POST",
		headers: i,
		signal: t,
		body: JSON.stringify({
			model: Be(),
			messages: e,
			temperature: .7
		})
	});
	return a.ok || We("OpenAI-compatible", a.status), (await a.json()).choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
}
async function Xe(e, t) {
	let n = Ve(Ue()), r = await fetch(`${n}/v1/messages`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": j(),
			"anthropic-version": "2023-06-01"
		},
		signal: t,
		body: JSON.stringify({
			model: Be(),
			max_tokens: 1024,
			messages: e
		})
	});
	return r.ok || We("Anthropic-compatible", r.status), (await r.json()).content?.filter((e) => e.type === "text").map((e) => e.text || "").join("\n").trim() || "Sorry, I couldn't generate a response.";
}
async function Ze(e, t = 3) {
	for (let n = 0; n < t; n++) try {
		let t = new AbortController(), n = setTimeout(() => t.abort(), 6e4), r = A() === "anthropic" ? await Xe(e, t.signal) : await Ye(e, t.signal);
		return clearTimeout(n), r;
	} catch (e) {
		let r = n === t - 1, i = e instanceof Error ? e.message : String(e);
		if (console.error(`[QA] Chat API error (attempt ${n + 1}/${t}):`, i), r) throw Error(`Chat API failed after ${t} attempts: ${i}`);
		let a = 1e3 * (n + 1);
		i.includes("429") ? (a = 2e3 * (n + 2), console.log(`[QA] Rate limit detected, waiting ${a}ms before retry...`)) : i.includes("50") || i.includes("503") ? (a = 1500 * (n + 1), console.log(`[QA] Server error detected, waiting ${a}ms before retry...`)) : i.includes("abort") && (a = 500, console.log(`[QA] Request timeout, retrying in ${a}ms...`)), await new Promise((e) => setTimeout(e, a));
	}
	throw Error("Unexpected error in retry loop");
}
async function Qe(e, t = 4) {
	if (N.length === 0) return [];
	let n = N.map((t, n) => ({
		idx: n,
		score: Je(e, t.content),
		doc: t
	}));
	return n.sort((e, t) => t.score - e.score), n.slice(0, t).map((e) => ({
		pageContent: e.doc.content,
		metadata: e.doc.metadata
	}));
}
function R(e, t) {
	F = e, Ge = t || null;
}
function $e() {
	return {
		status: F,
		currentBook: P || void 0,
		error: Ge || void 0,
		chunkCount: I || void 0
	};
}
async function et(e, t) {
	switch (t.toLowerCase()) {
		case "txt":
		case "md": return u.promises.readFile(e, "utf-8");
		case "pdf": {
			let t = await import("./pdf-BzLafEDA.js"), n = [
				d.join(process.cwd(), "public", "pdf.worker.min.mjs"),
				d.join(process.cwd(), "dist", "pdf.worker.min.mjs"),
				d.join(ze, "..", "dist", "pdf.worker.min.mjs"),
				d.join(process.cwd(), "dist-electron", "pdf.worker.mjs"),
				d.join(ze, "..", "dist-electron", "pdf.worker.mjs")
			];
			for (let e of n) if (u.existsSync(e)) {
				t.GlobalWorkerOptions.workerSrc = e;
				break;
			}
			let r = await u.promises.readFile(e), i = new Uint8Array(r), a = await t.getDocument({ data: i }).promise, o = [];
			for (let e = 1; e <= a.numPages; e++) {
				let t = (await (await a.getPage(e)).getTextContent()).items.map((e) => typeof e == "object" && e && "str" in e ? e.str : "").join(" ");
				o.push(t);
			}
			return o.join("\n\n");
		}
		case "epub": {
			let t = new w.default(e).getEntries(), n = [];
			for (let e of t) if (e.entryName.endsWith(".html") || e.entryName.endsWith(".xhtml") || e.entryName.endsWith(".htm")) {
				let t = e.getData().toString("utf-8");
				n.push(t);
			}
			return n.map((e) => e.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()).join("\n\n");
		}
		case "azw3":
		case "azw":
		case "mobi": throw Error("AZW3/Mobi format requires conversion to EPUB. Please convert the file to EPUB format using Calibre (https://calibre-ebook.com) or an online converter, then re-add the book to the library.");
		default: throw Error(`Unsupported format: ${t}`);
	}
}
async function tt(e, t) {
	try {
		N = [], P = null, I = 0, R("loading");
		let n = process.memoryUsage(), r = Math.round(n.heapUsed / 1024 / 1024);
		if (console.log(`[QA] Memory before load: ${r}MB heap used`), n.heapUsed > 500 * 1024 * 1024) if (console.warn(`[QA] High memory usage (${r}MB), attempting GC...`), global.gc) {
			global.gc();
			let e = process.memoryUsage(), t = Math.round(e.heapUsed / 1024 / 1024);
			console.log(`[QA] Memory after GC: ${t}MB heap used`);
		} else console.warn("[QA] GC not available (run with --expose-gc flag)");
		if (!j()) throw Error("QA_API_KEY (or OPENROUTER_API_KEY) environment variable is not set. Please set it in your .env file or system environment.");
		if (!u.existsSync(e)) throw Error(`File not found: ${e}`);
		console.log(`[QA] Extracting text from ${e}`);
		let i = await et(e, t);
		if (!i || i.trim().length === 0) throw Error("No text content extracted from file");
		console.log(`[QA] Extracted ${i.length} characters`);
		let a = 1e3, o = [];
		for (let e = 0; e < i.length; e += a) o.push(i.slice(e, e + a));
		console.log(`[QA] Created ${o.length} text chunks`);
		let { vocab: s, idf: c } = qe(o);
		N = o.map((t, n) => ({
			content: t,
			embedding: Ke(L(t), s, c),
			metadata: {
				source: d.basename(e),
				chunkIndex: n
			}
		})), I = o.length, P = e, R("ready");
		let l = process.memoryUsage(), f = Math.round(l.heapUsed / 1024 / 1024);
		return console.log(`[QA] Ready with ${I} chunks, memory: ${f}MB`), { success: !0 };
	} catch (e) {
		let t = e instanceof Error ? e.message : "Unknown error";
		return console.error("[QA] Load error:", t), R("error", t), {
			success: !1,
			error: t
		};
	}
}
async function nt(e) {
	let t = e.trim();
	if (!t) throw Error("Question cannot be empty.");
	if (N.length === 0) throw Error("No book loaded. Please load a book first.");
	if (F !== "ready") throw Error("QA service not ready. Please wait.");
	console.log(`[QA] Question: ${t}`);
	let n = await Qe(t, 3), r = n.map((e) => e.pageContent.slice(0, 1500)).join("\n\n");
	console.log(`[QA] Context length: ${r.length} chars, ${n.length} docs`);
	let i = await Ze([{
		role: "user",
		content: `You are a helpful assistant that answers questions about a book. Based only on the following context from the book, please answer the question. If the answer is not in the context, say so.

Context:
${r}

Question: ${t}

Answer:`
	}]), a = n.map((e) => ({
		content: e.pageContent,
		source: e.metadata.source || "Unknown"
	}));
	return console.log(`[QA] Answer length: ${i.length}`), {
		answer: i,
		sources: a
	};
}
function rt() {
	N = [], P = null, I = 0, R("idle");
	let e = process.memoryUsage(), t = Math.round(e.heapUsed / 1024 / 1024);
	console.log(`[QA] Cleared, memory: ${t}MB`), global.gc && e.heapUsed > 200 * 1024 * 1024 && (console.log("[QA] Triggering GC after clear..."), global.gc());
}
var z = {
	loadBookForQA: tt,
	askQuestion: nt,
	clearQA: rt,
	getStatus: $e
}, it = [
	"pdf",
	"epub",
	"mobi",
	"azw3",
	"txt",
	"md"
], at = ["docx"], ot = new Set([
	"epub",
	"mobi",
	"azw3",
	"txt",
	"md"
]);
function B(e) {
	return e.trim().toLowerCase().replace(/^\./, "");
}
function st(e) {
	let t = B(e);
	return it.includes(t);
}
function ct(e) {
	let t = B(e);
	return at.includes(t);
}
function lt(e) {
	return st(e) ? "supported" : ct(e) ? "convertible" : "unsupported";
}
function V(e) {
	return ot.has(e) ? "flow" : "paged";
}
//#endregion
//#region src/services/importService.ts
function ut() {
	return [...it, ...at];
}
function dt(e) {
	return e === "docx" ? "md" : e;
}
function ft(e) {
	let t = B(e), n = lt(t);
	if (n === "unsupported") return {
		capability: n,
		sourceFormat: t,
		requiresConversion: !1,
		reason: "unsupported_format"
	};
	if (st(t)) {
		let e = dt(t);
		return {
			capability: n,
			sourceFormat: t,
			targetFormat: e,
			documentKind: V(e),
			ingestStatus: "ready",
			requiresConversion: !1
		};
	}
	let r = dt(t);
	return {
		capability: n,
		sourceFormat: t,
		targetFormat: r,
		documentKind: V(r),
		ingestStatus: "converted",
		requiresConversion: !0
	};
}
//#endregion
//#region electron/handlers.ts
var H = new l(d.join(n.getPath("userData"), "library.db"));
H.exec("\n  CREATE TABLE IF NOT EXISTS books (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    title TEXT NOT NULL,\n    author TEXT,\n    path TEXT NOT NULL UNIQUE,\n    format TEXT NOT NULL,\n    coverPath TEXT,\n    addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,\n    lastReadAt DATETIME,\n    progress REAL DEFAULT 0,\n    progressLocator TEXT,\n    progressUpdatedAt INTEGER,\n    documentKind TEXT,\n    ingestStatus TEXT,\n    sourceFormat TEXT\n  );\n");
var U = (e, t) => {
	H.prepare("PRAGMA table_info(books)").all().some((t) => t.name === e) || H.exec(`ALTER TABLE books ADD COLUMN ${e} ${t}`);
};
U("progressLocator", "TEXT"), U("progressUpdatedAt", "INTEGER"), U("documentKind", "TEXT"), U("ingestStatus", "TEXT"), U("sourceFormat", "TEXT"), H.exec("\n  CREATE TABLE IF NOT EXISTS annotations (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    bookId INTEGER NOT NULL,\n    type TEXT NOT NULL,\n    cfi TEXT,\n    pageNumber INTEGER,\n    text TEXT,\n    note TEXT,\n    color TEXT DEFAULT '#ffeb3b',\n    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE\n  );\n"), H.exec("\n  CREATE INDEX IF NOT EXISTS idx_books_lastReadAt ON books(lastReadAt);\n  CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);\n  CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);\n  CREATE INDEX IF NOT EXISTS idx_annotations_bookId ON annotations(bookId);\n");
var W = d.join(n.getPath("userData"), "covers");
u.mkdirSync(W, { recursive: !0 });
async function pt(e, t) {
	try {
		let n = new w.default(e).getEntries(), r = [
			/cover\.(jpg|jpeg|png|gif)$/i,
			/cover-image\.(jpg|jpeg|png|gif)$/i,
			/images\/cover\.(jpg|jpeg|png|gif)$/i,
			/OEBPS\/images\/cover\.(jpg|jpeg|png|gif)$/i,
			/OPS\/images\/cover\.(jpg|jpeg|png|gif)$/i
		], i = n.find((e) => e.entryName.endsWith(".opf"));
		if (i) {
			let e = i.getData().toString("utf-8"), r = e.match(/name="cover"\s+content="([^"]+)"/) || e.match(/properties="cover-image"[^>]*href="([^"]+)"/);
			if (r) {
				let a = r[1], o = e.match(RegExp(`id="${a}"[^>]*href="([^"]+)"`)) || e.match(RegExp(`href="([^"]+)"[^>]*id="${a}"`));
				if (o) {
					let e = o[1], r = d.dirname(i.entryName), a = r ? `${r}/${e}` : e, s = n.find((t) => t.entryName === a || t.entryName.endsWith(e));
					if (s) {
						let e = s.getData(), n = `${t}${d.extname(s.entryName) || ".jpg"}`, r = d.join(W, n);
						return await u.promises.writeFile(r, e), r;
					}
				}
			}
		}
		for (let e of r) {
			let r = n.find((t) => e.test(t.entryName));
			if (r) {
				let e = r.getData(), n = `${t}${d.extname(r.entryName) || ".jpg"}`, i = d.join(W, n);
				return await u.promises.writeFile(i, e), i;
			}
		}
		let a = n.find((e) => /\.(jpg|jpeg|png|gif)$/i.test(e.entryName) && (e.entryName.toLowerCase().includes("cover") || e.entryName.toLowerCase().includes("title")));
		if (a) {
			let e = a.getData(), n = `${t}${d.extname(a.entryName) || ".jpg"}`, r = d.join(W, n);
			return await u.promises.writeFile(r, e), r;
		}
		return null;
	} catch (e) {
		return console.error("Failed to extract EPUB cover:", e), null;
	}
}
async function mt(e, t) {
	try {
		let n = await import("./pdf-BzLafEDA.js"), r = await u.promises.readFile(e), i = new Uint8Array(r), a = await (await n.getDocument({ data: i }).promise).getPage(1), o = a.getViewport({ scale: 1 }), s = Math.min(400 / o.width, 1.5), c = a.getViewport({ scale: s }), l = p(c.width, c.height), f = l.getContext("2d");
		await a.render({
			canvasContext: f,
			viewport: c
		}).promise;
		let m = `${t}.png`, h = d.join(W, m), g = l.toBuffer("image/png");
		return await u.promises.writeFile(h, g), h;
	} catch (e) {
		return console.error("Failed to extract PDF cover:", e), null;
	}
}
function ht(e) {
	return e.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&#(\d+);/g, (e, t) => String.fromCharCode(Number(t)));
}
async function gt(e) {
	let t = new w.default(e).getEntry("word/document.xml");
	if (!t) throw Error("DOCX 内容缺失: word/document.xml");
	return t.getData().toString("utf-8").split(/<\/w:p>/i).map((e) => [...e.replace(/<w:tab\s*\/>/gi, "	").replace(/<w:br\s*\/>/gi, "\n").matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi)].map((e) => ht(e[1])).join("").trim()).filter(Boolean).join("\n\n");
}
async function _t(e, t) {
	try {
		if (t === "epub") {
			let t = new w.default(e).getEntries().find((e) => e.entryName.endsWith(".opf"));
			if (t) {
				let e = t.getData().toString("utf-8"), n = e.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i), r = e.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
				return {
					title: n ? n[1].trim() : void 0,
					author: r ? r[1].trim() : void 0
				};
			}
		}
		if (t === "pdf") {
			let t = await import("./pdf-BzLafEDA.js"), n = await u.promises.readFile(e), r = new Uint8Array(n), i = (await (await t.getDocument({ data: r }).promise).getMetadata()).info;
			return {
				title: i?.Title || void 0,
				author: i?.Author || void 0
			};
		}
	} catch (e) {
		console.error("Failed to extract metadata:", e);
	}
	return {};
}
function vt(e) {
	if (e) try {
		return JSON.parse(e);
	} catch {
		return;
	}
}
function G(e) {
	let t = e.format || "txt";
	return {
		...e,
		progressLocator: vt(e.progressLocator),
		progressUpdatedAt: e.progressUpdatedAt ?? void 0,
		documentKind: e.documentKind || V(t),
		ingestStatus: e.ingestStatus || "ready",
		sourceFormat: e.sourceFormat || t
	};
}
function yt(e) {
	try {
		let t = new URL(e);
		return t.protocol === "http:" || t.protocol === "https:" || t.protocol === "mailto:";
	} catch {
		return !1;
	}
}
function K(e) {
	return typeof e == "number" && Number.isInteger(e) && e > 0;
}
function bt(e, t) {
	if (typeof e != "string" || e.trim() === "") throw Error(`Invalid ${t}`);
	return e;
}
function xt(e, t) {
	let n = d.resolve(e), r = d.resolve(t), i = d.relative(r, n);
	return i === "" || !i.startsWith("..") && !d.isAbsolute(i);
}
var St = H.prepare("SELECT * FROM books ORDER BY lastReadAt DESC"), Ct = H.prepare("\n  SELECT * FROM books\n  WHERE title LIKE ? OR author LIKE ?\n  ORDER BY lastReadAt DESC\n"), wt = H.prepare("\n  UPDATE books\n  SET progress = ?, progressLocator = ?, progressUpdatedAt = ?, lastReadAt = CURRENT_TIMESTAMP\n  WHERE id = ?\n"), Tt = H.prepare("SELECT * FROM books WHERE path = ?"), Et = H.prepare("SELECT id FROM books WHERE coverPath = ?"), q = H.prepare("SELECT * FROM books WHERE id = ?"), Dt = H.prepare("SELECT id FROM annotations WHERE id = ?");
function J(e) {
	return typeof e != "string" || e.trim() === "" ? null : Tt.get(e) ?? null;
}
function Ot(e) {
	bt(e, "book path");
	let t = J(e);
	if (!t) throw Error("Book path is not in the library");
	return t.path;
}
function kt(e) {
	return typeof e != "string" || e.trim() === "" ? !1 : !!Et.get(e);
}
i.handle("read-file", async (e, t) => u.promises.readFile(Ot(t))), i.handle("read-file-buffer", async (e, t) => u.promises.readFile(Ot(t))), i.handle("file-exists", async (e, t) => {
	let n = J(t);
	if (!n) return !1;
	try {
		return await u.promises.access(n.path, u.constants.F_OK), !0;
	} catch {
		return !1;
	}
}), i.handle("open-external", async (e, t) => {
	if (typeof t != "string" || !yt(t)) throw Error("Invalid external URL");
	return o.openExternal(t);
}), i.handle("open-user-data-folder", async () => o.openPath(n.getPath("userData"))), i.handle("get-cover-url", async (e, t) => {
	if (!kt(t)) return null;
	try {
		return await u.promises.access(t, u.constants.F_OK), `file://${t.replace(/\\/g, "/")}`;
	} catch {
		return null;
	}
});
var Y = d.join(n.getPath("userData"), "backgrounds");
u.mkdirSync(Y, { recursive: !0 }), i.handle("select-background-image", async () => {
	let e = await r.showOpenDialog({
		properties: ["openFile"],
		filters: [{
			name: "Images",
			extensions: [
				"jpg",
				"jpeg",
				"png",
				"gif",
				"webp",
				"bmp"
			]
		}]
	});
	if (e.canceled || e.filePaths.length === 0) return null;
	let t = e.filePaths[0], n = d.extname(t), i = `background-${f.randomUUID()}${n}`, a = d.join(Y, i);
	try {
		return await u.promises.copyFile(t, a), a;
	} catch (e) {
		return console.error("Failed to copy background image:", e), null;
	}
}), i.handle("get-background-image-url", async (e, t) => {
	if (typeof t != "string" || !xt(t, Y)) return null;
	try {
		return await u.promises.access(t, u.constants.F_OK), `file://${t.replace(/\\/g, "/")}`;
	} catch {
		return null;
	}
}), i.handle("open-file-dialog", async () => {
	let e = await r.showOpenDialog({
		properties: ["openFile"],
		filters: [{
			name: "Books",
			extensions: [...ut()]
		}]
	});
	if (e.canceled || e.filePaths.length === 0) return null;
	let t = e.filePaths[0], i = d.extname(t).toLowerCase(), a = ft(B(i));
	if (a.capability === "unsupported" || !a.targetFormat || !a.documentKind || !a.ingestStatus) return null;
	let o = d.basename(t, i), s = f.randomUUID(), c = d.join(n.getPath("userData"), "books");
	await u.promises.mkdir(c, { recursive: !0 });
	let l;
	if (a.requiresConversion && a.sourceFormat === "docx") {
		let e = `${o}-${s}.docx`, n = d.join(c, e);
		await u.promises.copyFile(t, n);
		let r = await gt(n), i = `${o}-${s}.md`;
		l = d.join(c, i), await u.promises.writeFile(l, r, "utf-8");
	} else {
		let e = `${o}-${s}${i}`;
		l = d.join(c, e), await u.promises.copyFile(t, l);
	}
	let p = await _t(l, a.targetFormat), m = p.title || o, h = p.author || null, g = null;
	a.targetFormat === "epub" || a.targetFormat === "mobi" || a.targetFormat === "azw3" ? g = await pt(l, s) : a.targetFormat === "pdf" && (g = await mt(l, s));
	try {
		let e = H.prepare("\n      INSERT INTO books (title, author, path, format, sourceFormat, documentKind, ingestStatus, coverPath) \n      VALUES (?, ?, ?, ?, ?, ?, ?, ?)\n      ON CONFLICT(path) DO UPDATE SET lastReadAt = CURRENT_TIMESTAMP\n      RETURNING *\n    ").get(m, h, l, a.targetFormat, a.sourceFormat, a.documentKind, a.ingestStatus, g);
		return e ? G(e) : null;
	} catch (e) {
		return console.error("DB Insert Error:", e), null;
	}
}), i.handle("get-library", () => St.all().map(G)), i.handle("search-library", (e, t) => {
	let n = `%${typeof t == "string" ? t : ""}%`;
	return Ct.all(n, n).map(G);
}), i.handle("update-progress", (e, t, n, r, i) => {
	if (!K(t)) throw Error("Invalid book id");
	if (typeof n != "number" || !Number.isFinite(n)) throw Error("Invalid progress");
	if (!q.get(t)) throw Error("Book not found");
	let a = Math.min(1, Math.max(0, n)), o = typeof i == "number" ? i : Date.now(), s = r ? JSON.stringify(r) : null;
	wt.run(a, s, o, t);
}), i.handle("delete-book", (e, t) => {
	if (!K(t)) return !1;
	try {
		let e = q.get(t);
		return e && (e.coverPath && u.promises.unlink(e.coverPath).catch(() => {}), e.path && u.promises.unlink(e.path).catch(() => {})), H.prepare("DELETE FROM books WHERE id = ?").run(t), !0;
	} catch (e) {
		return console.error("Delete book error:", e), !1;
	}
}), i.handle("get-annotations", (e, t) => K(t) ? H.prepare("SELECT * FROM annotations WHERE bookId = ? ORDER BY createdAt DESC").all(t) : []), i.handle("add-annotation", (e, t) => {
	if (!t || !K(t.bookId)) throw Error("Invalid annotation book id");
	if (!q.get(t.bookId)) throw Error("Book not found");
	if (t.type !== "highlight" && t.type !== "note") throw Error("Invalid annotation type");
	return H.prepare("\n    INSERT INTO annotations (bookId, type, cfi, pageNumber, text, note, color)\n    VALUES (?, ?, ?, ?, ?, ?, ?)\n    RETURNING *\n  ").get(t.bookId, t.type, t.cfi || null, t.pageNumber || null, t.text || null, t.note || null, t.color || "#ffeb3b");
}), i.handle("update-annotation", (e, t, n) => {
	if (!K(t) || !Dt.get(t) || !n || typeof n != "object") return null;
	let r = [], i = [];
	return n.note !== void 0 && (r.push("note = ?"), i.push(n.note)), n.color !== void 0 && (r.push("color = ?"), i.push(n.color)), r.length === 0 ? null : (r.push("updatedAt = CURRENT_TIMESTAMP"), i.push(t), H.prepare(`UPDATE annotations SET ${r.join(", ")} WHERE id = ? RETURNING *`).get(...i));
}), i.handle("delete-annotation", (e, t) => {
	if (!K(t)) return !1;
	try {
		return H.prepare("DELETE FROM annotations WHERE id = ?").run(t), !0;
	} catch (e) {
		return console.error("Delete annotation error:", e), !1;
	}
}), i.handle("qa-load-book", async (e, t, n) => {
	let r = J(t);
	return r ? z.loadBookForQA(r.path, r.format || n) : {
		success: !1,
		error: "Book path is not in the library"
	};
}), i.handle("qa-ask", async (e, t) => {
	if (typeof t != "string" || t.trim() === "") throw Error("Invalid question");
	return z.askQuestion(t);
}), i.handle("qa-clear", async () => {
	z.clearQA();
}), i.handle("qa-get-status", async () => z.getStatus()), i.handle("credentials-save", async (e, t) => {
	try {
		return await Ae(t), { success: !0 };
	} catch (e) {
		return {
			success: !1,
			error: e instanceof Error ? e.message : String(e)
		};
	}
}), i.handle("credentials-load", async () => je()), i.handle("credentials-clear", async () => {
	try {
		return Ie(), { success: !0 };
	} catch (e) {
		return {
			success: !1,
			error: e instanceof Error ? e.message : String(e)
		};
	}
}), i.handle("credentials-has", async () => Le());
//#endregion
//#region electron/main.ts
var At = c(import.meta.url), jt = s.dirname(At);
process.env.DIST = s.join(jt, "../dist"), process.env.VITE_PUBLIC = n.isPackaged ? process.env.DIST : s.join(process.env.DIST, "../public");
var X, Z = process.env.VITE_DEV_SERVER_URL, Mt = new Set([
	"http:",
	"https:",
	"mailto:"
]);
function Nt(e, t) {
	let n = s.resolve(e), r = s.resolve(t), i = s.relative(r, n);
	return i === "" || !i.startsWith("..") && !s.isAbsolute(i);
}
function Pt(e) {
	try {
		let t = new URL(e);
		return Mt.has(t.protocol);
	} catch {
		return !1;
	}
}
function Ft(e) {
	if (e === "about:blank") return !0;
	try {
		let t = new URL(e);
		return Z ? t.origin === new URL(Z).origin : t.protocol !== "file:" || !process.env.DIST ? !1 : Nt(c(t), process.env.DIST);
	} catch {
		return !1;
	}
}
async function Q(e) {
	Pt(e) && await o.openExternal(e);
}
function It(e) {
	e.webContents.on("did-fail-load", (e, t, n, r, i) => {
		i && console.error("[main] did-fail-load", JSON.stringify({
			errorCode: t,
			errorDescription: n,
			validatedURL: r
		}));
	}), e.webContents.on("render-process-gone", (e, t) => {
		console.error("[main] render-process-gone", JSON.stringify(t));
	});
}
function Lt(e) {
	e.webContents.setWindowOpenHandler(({ url: e }) => (Q(e), { action: "deny" })), e.webContents.on("will-navigate", (e, t) => {
		Ft(t) || (e.preventDefault(), Q(t));
	}), e.webContents.on("will-redirect", (e, t, n, r) => {
		!r || Ft(t) || (e.preventDefault(), Q(t));
	}), e.webContents.session.setPermissionRequestHandler((e, t, n) => {
		n(!1);
	});
}
function $() {
	if (X = new t({
		icon: s.join(process.env.VITE_PUBLIC, "vite.svg"),
		webPreferences: {
			preload: s.join(jt, "preload.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1,
			sandbox: !0
		}
	}), It(X), Lt(X), X.webContents.on("did-finish-load", () => {
		X?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
	}), Z) console.log("[main] loading dev url:", Z), X.loadURL(Z), X.webContents.openDevTools({ mode: "detach" });
	else {
		let e = s.join(process.env.DIST, "index.html");
		console.log("[main] loading file:", e), X.loadFile(e);
	}
}
n.on("window-all-closed", () => {
	process.platform !== "darwin" && n.quit();
}), n.on("activate", () => {
	t.getAllWindows().length === 0 && $();
}), n.whenReady().then($);
//#endregion
export {};
