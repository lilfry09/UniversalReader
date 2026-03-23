import { app as Z, ipcMain as B, shell as Oe, dialog as Ae, BrowserWindow as Re } from "electron";
import K from "node:path";
import { fileURLToPath as Fe } from "node:url";
import Ve from "better-sqlite3";
import xe from "node:crypto";
import R from "fs";
import w from "path";
import { createCanvas as Ke } from "canvas";
import ve from "zlib";
import We from "crypto";
function Ye(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var W = { exports: {} }, Ue = {
  /* The local file header */
  LOCHDR: 30,
  // LOC header size
  LOCSIG: 67324752,
  // "PK\003\004"
  LOCVER: 4,
  // version needed to extract
  LOCFLG: 6,
  // general purpose bit flag
  LOCHOW: 8,
  // compression method
  LOCTIM: 10,
  // modification time (2 bytes time, 2 bytes date)
  LOCCRC: 14,
  // uncompressed file crc-32 value
  LOCSIZ: 18,
  // compressed size
  LOCLEN: 22,
  // uncompressed size
  LOCNAM: 26,
  // filename length
  LOCEXT: 28,
  // extra field length
  /* The Data descriptor */
  EXTSIG: 134695760,
  // "PK\007\008"
  EXTHDR: 16,
  // EXT header size
  EXTCRC: 4,
  // uncompressed file crc-32 value
  EXTSIZ: 8,
  // compressed size
  EXTLEN: 12,
  // uncompressed size
  /* The central directory file header */
  CENHDR: 46,
  // CEN header size
  CENSIG: 33639248,
  // "PK\001\002"
  CENVEM: 4,
  // version made by
  CENVER: 6,
  // version needed to extract
  CENFLG: 8,
  // encrypt, decrypt flags
  CENHOW: 10,
  // compression method
  CENTIM: 12,
  // modification time (2 bytes time, 2 bytes date)
  CENCRC: 16,
  // uncompressed file crc-32 value
  CENSIZ: 20,
  // compressed size
  CENLEN: 24,
  // uncompressed size
  CENNAM: 28,
  // filename length
  CENEXT: 30,
  // extra field length
  CENCOM: 32,
  // file comment length
  CENDSK: 34,
  // volume number start
  CENATT: 36,
  // internal file attributes
  CENATX: 38,
  // external file attributes (host system dependent)
  CENOFF: 42,
  // LOC header offset
  /* The entries in the end of central directory */
  ENDHDR: 22,
  // END header size
  ENDSIG: 101010256,
  // "PK\005\006"
  ENDSUB: 8,
  // number of entries on this disk
  ENDTOT: 10,
  // total number of entries
  ENDSIZ: 12,
  // central directory size in bytes
  ENDOFF: 16,
  // offset of first CEN header
  ENDCOM: 20,
  // zip file comment length
  END64HDR: 20,
  // zip64 END header size
  END64SIG: 117853008,
  // zip64 Locator signature, "PK\006\007"
  END64START: 4,
  // number of the disk with the start of the zip64
  END64OFF: 8,
  // relative offset of the zip64 end of central directory
  END64NUMDISKS: 16,
  // total number of disks
  ZIP64SIG: 101075792,
  // zip64 signature, "PK\006\006"
  ZIP64HDR: 56,
  // zip64 record minimum size
  ZIP64LEAD: 12,
  // leading bytes at the start of the record, not counted by the value stored in ZIP64SIZE
  ZIP64SIZE: 4,
  // zip64 size of the central directory record
  ZIP64VEM: 12,
  // zip64 version made by
  ZIP64VER: 14,
  // zip64 version needed to extract
  ZIP64DSK: 16,
  // zip64 number of this disk
  ZIP64DSKDIR: 20,
  // number of the disk with the start of the record directory
  ZIP64SUB: 24,
  // number of entries on this disk
  ZIP64TOT: 32,
  // total number of entries
  ZIP64SIZB: 40,
  // zip64 central directory size in bytes
  ZIP64OFF: 48,
  // offset of start of central directory with respect to the starting disk number
  ZIP64EXTRA: 56,
  // extensible data sector
  /* Compression methods */
  STORED: 0,
  // no compression
  SHRUNK: 1,
  // shrunk
  REDUCED1: 2,
  // reduced with compression factor 1
  REDUCED2: 3,
  // reduced with compression factor 2
  REDUCED3: 4,
  // reduced with compression factor 3
  REDUCED4: 5,
  // reduced with compression factor 4
  IMPLODED: 6,
  // imploded
  // 7 reserved for Tokenizing compression algorithm
  DEFLATED: 8,
  // deflated
  ENHANCED_DEFLATED: 9,
  // enhanced deflated
  PKWARE: 10,
  // PKWare DCL imploded
  // 11 reserved by PKWARE
  BZIP2: 12,
  //  compressed using BZIP2
  // 13 reserved by PKWARE
  LZMA: 14,
  // LZMA
  // 15-17 reserved by PKWARE
  IBM_TERSE: 18,
  // compressed using IBM TERSE
  IBM_LZ77: 19,
  // IBM LZ77 z
  AES_ENCRYPT: 99,
  // WinZIP AES encryption method
  /* General purpose bit flag */
  // values can obtained with expression 2**bitnr
  FLG_ENC: 1,
  // Bit 0: encrypted file
  FLG_COMP1: 2,
  // Bit 1, compression option
  FLG_COMP2: 4,
  // Bit 2, compression option
  FLG_DESC: 8,
  // Bit 3, data descriptor
  FLG_ENH: 16,
  // Bit 4, enhanced deflating
  FLG_PATCH: 32,
  // Bit 5, indicates that the file is compressed patched data.
  FLG_STR: 64,
  // Bit 6, strong encryption (patented)
  // Bits 7-10: Currently unused.
  FLG_EFS: 2048,
  // Bit 11: Language encoding flag (EFS)
  // Bit 12: Reserved by PKWARE for enhanced compression.
  // Bit 13: encrypted the Central Directory (patented).
  // Bits 14-15: Reserved by PKWARE.
  FLG_MSK: 4096,
  // mask header values
  /* Load type */
  FILE: 2,
  BUFFER: 1,
  NONE: 0,
  /* 4.5 Extensible data fields */
  EF_ID: 0,
  EF_SIZE: 2,
  /* Header IDs */
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
}, ie = {};
(function(e) {
  const t = {
    /* Header error messages */
    INVALID_LOC: "Invalid LOC header (bad signature)",
    INVALID_CEN: "Invalid CEN header (bad signature)",
    INVALID_END: "Invalid END header (bad signature)",
    /* Descriptor */
    DESCRIPTOR_NOT_EXIST: "No descriptor present",
    DESCRIPTOR_UNKNOWN: "Unknown descriptor format",
    DESCRIPTOR_FAULTY: "Descriptor data is malformed",
    /* ZipEntry error messages*/
    NO_DATA: "Nothing to decompress",
    BAD_CRC: "CRC32 checksum failed {0}",
    FILE_IN_THE_WAY: "There is a file in the way: {0}",
    UNKNOWN_METHOD: "Invalid/unsupported compression method",
    /* Inflater error messages */
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
    /* ADM-ZIP error messages */
    CANT_EXTRACT_FILE: "Could not extract the file",
    CANT_OVERRIDE: "Target file already exists",
    DISK_ENTRY_TOO_LARGE: "Number of disk entries is too large",
    NO_ZIP: "No zip file was loaded",
    NO_ENTRY: "Entry doesn't exist",
    DIRECTORY_CONTENT_ERROR: "A directory cannot have content",
    FILE_NOT_FOUND: 'File not found: "{0}"',
    NOT_IMPLEMENTED: "Not implemented",
    INVALID_FILENAME: "Invalid filename",
    INVALID_FORMAT: "Invalid or unsupported zip format. No END header found",
    INVALID_PASS_PARAM: "Incompatible password parameter",
    WRONG_PASSWORD: "Wrong Password",
    /* ADM-ZIP */
    COMMENT_TOO_LONG: "Comment is too long",
    // Comment can be max 65535 bytes long (NOTE: some non-US characters may take more space)
    EXTRA_FIELD_PARSE_ERROR: "Extra field parsing error"
  };
  function n(r) {
    return function(...o) {
      return o.length && (r = r.replace(/\{(\d)\}/g, (s, d) => o[d] || "")), new Error("ADM-ZIP: " + r);
    };
  }
  for (const r of Object.keys(t))
    e[r] = n(t[r]);
})(ie);
const qe = R, b = w, ye = Ue, Je = ie, Qe = typeof process == "object" && process.platform === "win32", De = (e) => typeof e == "object" && e !== null, Pe = new Uint32Array(256).map((e, t) => {
  for (let n = 0; n < 8; n++)
    t & 1 ? t = 3988292384 ^ t >>> 1 : t >>>= 1;
  return t >>> 0;
});
function P(e) {
  this.sep = b.sep, this.fs = qe, De(e) && De(e.fs) && typeof e.fs.statSync == "function" && (this.fs = e.fs);
}
var et = P;
P.prototype.makeDir = function(e) {
  const t = this;
  function n(r) {
    let o = r.split(t.sep)[0];
    r.split(t.sep).forEach(function(s) {
      if (!(!s || s.substr(-1, 1) === ":")) {
        o += t.sep + s;
        var d;
        try {
          d = t.fs.statSync(o);
        } catch {
          t.fs.mkdirSync(o);
        }
        if (d && d.isFile()) throw Je.FILE_IN_THE_WAY(`"${o}"`);
      }
    });
  }
  n(e);
};
P.prototype.writeFileTo = function(e, t, n, r) {
  const o = this;
  if (o.fs.existsSync(e)) {
    if (!n) return !1;
    var s = o.fs.statSync(e);
    if (s.isDirectory())
      return !1;
  }
  var d = b.dirname(e);
  o.fs.existsSync(d) || o.makeDir(d);
  var g;
  try {
    g = o.fs.openSync(e, "w", 438);
  } catch {
    o.fs.chmodSync(e, 438), g = o.fs.openSync(e, "w", 438);
  }
  if (g)
    try {
      o.fs.writeSync(g, t, 0, t.length, 0);
    } finally {
      o.fs.closeSync(g);
    }
  return o.fs.chmodSync(e, r || 438), !0;
};
P.prototype.writeFileToAsync = function(e, t, n, r, o) {
  typeof r == "function" && (o = r, r = void 0);
  const s = this;
  s.fs.exists(e, function(d) {
    if (d && !n) return o(!1);
    s.fs.stat(e, function(g, h) {
      if (d && h.isDirectory())
        return o(!1);
      var I = b.dirname(e);
      s.fs.exists(I, function(D) {
        D || s.makeDir(I), s.fs.open(e, "w", 438, function(C, T) {
          C ? s.fs.chmod(e, 438, function() {
            s.fs.open(e, "w", 438, function(a, l) {
              s.fs.write(l, t, 0, t.length, 0, function() {
                s.fs.close(l, function() {
                  s.fs.chmod(e, r || 438, function() {
                    o(!0);
                  });
                });
              });
            });
          }) : T ? s.fs.write(T, t, 0, t.length, 0, function() {
            s.fs.close(T, function() {
              s.fs.chmod(e, r || 438, function() {
                o(!0);
              });
            });
          }) : s.fs.chmod(e, r || 438, function() {
            o(!0);
          });
        });
      });
    });
  });
};
P.prototype.findFiles = function(e) {
  const t = this;
  function n(r, o, s) {
    let d = [];
    return t.fs.readdirSync(r).forEach(function(g) {
      const h = b.join(r, g), I = t.fs.statSync(h);
      d.push(b.normalize(h) + (I.isDirectory() ? t.sep : "")), I.isDirectory() && s && (d = d.concat(n(h, o, s)));
    }), d;
  }
  return n(e, void 0, !0);
};
P.prototype.findFilesAsync = function(e, t) {
  const n = this;
  let r = [];
  n.fs.readdir(e, function(o, s) {
    if (o) return t(o);
    let d = s.length;
    if (!d) return t(null, r);
    s.forEach(function(g) {
      g = b.join(e, g), n.fs.stat(g, function(h, I) {
        if (h) return t(h);
        I && (r.push(b.normalize(g) + (I.isDirectory() ? n.sep : "")), I.isDirectory() ? n.findFilesAsync(g, function(D, C) {
          if (D) return t(D);
          r = r.concat(C), --d || t(null, r);
        }) : --d || t(null, r));
      });
    });
  });
};
P.prototype.getAttributes = function() {
};
P.prototype.setAttributes = function() {
};
P.crc32update = function(e, t) {
  return Pe[(e ^ t) & 255] ^ e >>> 8;
};
P.crc32 = function(e) {
  typeof e == "string" && (e = Buffer.from(e, "utf8"));
  let t = e.length, n = -1;
  for (let r = 0; r < t; ) n = P.crc32update(n, e[r++]);
  return ~n >>> 0;
};
P.methodToString = function(e) {
  switch (e) {
    case ye.STORED:
      return "STORED (" + e + ")";
    case ye.DEFLATED:
      return "DEFLATED (" + e + ")";
    default:
      return "UNSUPPORTED (" + e + ")";
  }
};
P.canonical = function(e) {
  if (!e) return "";
  const t = b.posix.normalize("/" + e.split("\\").join("/"));
  return b.join(".", t);
};
P.zipnamefix = function(e) {
  if (!e) return "";
  const t = b.posix.normalize("/" + e.split("\\").join("/"));
  return b.posix.join(".", t);
};
P.findLast = function(e, t) {
  if (!Array.isArray(e)) throw new TypeError("arr is not array");
  const n = e.length >>> 0;
  for (let r = n - 1; r >= 0; r--)
    if (t(e[r], r, e))
      return e[r];
};
P.sanitize = function(e, t) {
  e = b.resolve(b.normalize(e));
  for (var n = t.split("/"), r = 0, o = n.length; r < o; r++) {
    var s = b.normalize(b.join(e, n.slice(r, o).join(b.sep)));
    if (s.indexOf(e) === 0)
      return s;
  }
  return b.normalize(b.join(e, b.basename(t)));
};
P.toBuffer = function(t, n) {
  return Buffer.isBuffer(t) ? t : t instanceof Uint8Array ? Buffer.from(t) : typeof t == "string" ? n(t) : Buffer.alloc(0);
};
P.readBigUInt64LE = function(e, t) {
  var n = Buffer.from(e.slice(t, t + 8));
  return n.swap64(), parseInt(`0x${n.toString("hex")}`);
};
P.fromDOS2Date = function(e) {
  return new Date((e >> 25 & 127) + 1980, Math.max((e >> 21 & 15) - 1, 0), Math.max(e >> 16 & 31, 1), e >> 11 & 31, e >> 5 & 63, (e & 31) << 1);
};
P.fromDate2DOS = function(e) {
  let t = 0, n = 0;
  return e.getFullYear() > 1979 && (t = (e.getFullYear() - 1980 & 127) << 9 | e.getMonth() + 1 << 5 | e.getDate(), n = e.getHours() << 11 | e.getMinutes() << 5 | e.getSeconds() >> 1), t << 16 | n;
};
P.isWin = Qe;
P.crcTable = Pe;
const tt = w;
var nt = function(e, { fs: t }) {
  var n = e || "", r = s(), o = null;
  function s() {
    return {
      directory: !1,
      readonly: !1,
      hidden: !1,
      executable: !1,
      mtime: 0,
      atime: 0
    };
  }
  return n && t.existsSync(n) ? (o = t.statSync(n), r.directory = o.isDirectory(), r.mtime = o.mtime, r.atime = o.atime, r.executable = (73 & o.mode) !== 0, r.readonly = (128 & o.mode) === 0, r.hidden = tt.basename(n)[0] === ".") : console.warn("Invalid path: " + n), {
    get directory() {
      return r.directory;
    },
    get readOnly() {
      return r.readonly;
    },
    get hidden() {
      return r.hidden;
    },
    get mtime() {
      return r.mtime;
    },
    get atime() {
      return r.atime;
    },
    get executable() {
      return r.executable;
    },
    decodeAttributes: function() {
    },
    encodeAttributes: function() {
    },
    toJSON: function() {
      return {
        path: n,
        isDirectory: r.directory,
        isReadOnly: r.readonly,
        isHidden: r.hidden,
        isExecutable: r.executable,
        mTime: r.mtime,
        aTime: r.atime
      };
    },
    toString: function() {
      return JSON.stringify(this.toJSON(), null, "	");
    }
  };
}, rt = {
  efs: !0,
  encode: (e) => Buffer.from(e, "utf8"),
  decode: (e) => e.toString("utf8")
};
W.exports = et;
W.exports.Constants = Ue;
W.exports.Errors = ie;
W.exports.FileAttr = nt;
W.exports.decoder = rt;
var Q = W.exports, ae = {}, $ = Q, N = $.Constants, ot = function() {
  var e = 20, t = 10, n = 0, r = 0, o = 0, s = 0, d = 0, g = 0, h = 0, I = 0, D = 0, C = 0, T = 0, a = 0, l = 0;
  e |= $.isWin ? 2560 : 768, n |= N.FLG_EFS;
  const c = {
    extraLen: 0
  }, u = (i) => Math.max(0, i) >>> 0, m = (i) => Math.max(0, i) & 255;
  return o = $.fromDate2DOS(/* @__PURE__ */ new Date()), {
    get made() {
      return e;
    },
    set made(i) {
      e = i;
    },
    get version() {
      return t;
    },
    set version(i) {
      t = i;
    },
    get flags() {
      return n;
    },
    set flags(i) {
      n = i;
    },
    get flags_efs() {
      return (n & N.FLG_EFS) > 0;
    },
    set flags_efs(i) {
      i ? n |= N.FLG_EFS : n &= ~N.FLG_EFS;
    },
    get flags_desc() {
      return (n & N.FLG_DESC) > 0;
    },
    set flags_desc(i) {
      i ? n |= N.FLG_DESC : n &= ~N.FLG_DESC;
    },
    get method() {
      return r;
    },
    set method(i) {
      switch (i) {
        case N.STORED:
          this.version = 10;
        case N.DEFLATED:
        default:
          this.version = 20;
      }
      r = i;
    },
    get time() {
      return $.fromDOS2Date(this.timeval);
    },
    set time(i) {
      this.timeval = $.fromDate2DOS(i);
    },
    get timeval() {
      return o;
    },
    set timeval(i) {
      o = u(i);
    },
    get timeHighByte() {
      return m(o >>> 8);
    },
    get crc() {
      return s;
    },
    set crc(i) {
      s = u(i);
    },
    get compressedSize() {
      return d;
    },
    set compressedSize(i) {
      d = u(i);
    },
    get size() {
      return g;
    },
    set size(i) {
      g = u(i);
    },
    get fileNameLength() {
      return h;
    },
    set fileNameLength(i) {
      h = i;
    },
    get extraLength() {
      return I;
    },
    set extraLength(i) {
      I = i;
    },
    get extraLocalLength() {
      return c.extraLen;
    },
    set extraLocalLength(i) {
      c.extraLen = i;
    },
    get commentLength() {
      return D;
    },
    set commentLength(i) {
      D = i;
    },
    get diskNumStart() {
      return C;
    },
    set diskNumStart(i) {
      C = u(i);
    },
    get inAttr() {
      return T;
    },
    set inAttr(i) {
      T = u(i);
    },
    get attr() {
      return a;
    },
    set attr(i) {
      a = u(i);
    },
    // get Unix file permissions
    get fileAttr() {
      return (a || 0) >> 16 & 4095;
    },
    get offset() {
      return l;
    },
    set offset(i) {
      l = u(i);
    },
    get encrypted() {
      return (n & N.FLG_ENC) === N.FLG_ENC;
    },
    get centralHeaderSize() {
      return N.CENHDR + h + I + D;
    },
    get realDataOffset() {
      return l + N.LOCHDR + c.fnameLen + c.extraLen;
    },
    get localHeader() {
      return c;
    },
    loadLocalHeaderFromBinary: function(i) {
      var f = i.slice(l, l + N.LOCHDR);
      if (f.readUInt32LE(0) !== N.LOCSIG)
        throw $.Errors.INVALID_LOC();
      c.version = f.readUInt16LE(N.LOCVER), c.flags = f.readUInt16LE(N.LOCFLG), c.method = f.readUInt16LE(N.LOCHOW), c.time = f.readUInt32LE(N.LOCTIM), c.crc = f.readUInt32LE(N.LOCCRC), c.compressedSize = f.readUInt32LE(N.LOCSIZ), c.size = f.readUInt32LE(N.LOCLEN), c.fnameLen = f.readUInt16LE(N.LOCNAM), c.extraLen = f.readUInt16LE(N.LOCEXT);
      const E = l + N.LOCHDR + c.fnameLen, p = E + c.extraLen;
      return i.slice(E, p);
    },
    loadFromBinary: function(i) {
      if (i.length !== N.CENHDR || i.readUInt32LE(0) !== N.CENSIG)
        throw $.Errors.INVALID_CEN();
      e = i.readUInt16LE(N.CENVEM), t = i.readUInt16LE(N.CENVER), n = i.readUInt16LE(N.CENFLG), r = i.readUInt16LE(N.CENHOW), o = i.readUInt32LE(N.CENTIM), s = i.readUInt32LE(N.CENCRC), d = i.readUInt32LE(N.CENSIZ), g = i.readUInt32LE(N.CENLEN), h = i.readUInt16LE(N.CENNAM), I = i.readUInt16LE(N.CENEXT), D = i.readUInt16LE(N.CENCOM), C = i.readUInt16LE(N.CENDSK), T = i.readUInt16LE(N.CENATT), a = i.readUInt32LE(N.CENATX), l = i.readUInt32LE(N.CENOFF);
    },
    localHeaderToBinary: function() {
      var i = Buffer.alloc(N.LOCHDR);
      return i.writeUInt32LE(N.LOCSIG, 0), i.writeUInt16LE(t, N.LOCVER), i.writeUInt16LE(n, N.LOCFLG), i.writeUInt16LE(r, N.LOCHOW), i.writeUInt32LE(o, N.LOCTIM), i.writeUInt32LE(s, N.LOCCRC), i.writeUInt32LE(d, N.LOCSIZ), i.writeUInt32LE(g, N.LOCLEN), i.writeUInt16LE(h, N.LOCNAM), i.writeUInt16LE(c.extraLen, N.LOCEXT), i;
    },
    centralHeaderToBinary: function() {
      var i = Buffer.alloc(N.CENHDR + h + I + D);
      return i.writeUInt32LE(N.CENSIG, 0), i.writeUInt16LE(e, N.CENVEM), i.writeUInt16LE(t, N.CENVER), i.writeUInt16LE(n, N.CENFLG), i.writeUInt16LE(r, N.CENHOW), i.writeUInt32LE(o, N.CENTIM), i.writeUInt32LE(s, N.CENCRC), i.writeUInt32LE(d, N.CENSIZ), i.writeUInt32LE(g, N.CENLEN), i.writeUInt16LE(h, N.CENNAM), i.writeUInt16LE(I, N.CENEXT), i.writeUInt16LE(D, N.CENCOM), i.writeUInt16LE(C, N.CENDSK), i.writeUInt16LE(T, N.CENATT), i.writeUInt32LE(a, N.CENATX), i.writeUInt32LE(l, N.CENOFF), i;
    },
    toJSON: function() {
      const i = function(f) {
        return f + " bytes";
      };
      return {
        made: e,
        version: t,
        flags: n,
        method: $.methodToString(r),
        time: this.time,
        crc: "0x" + s.toString(16).toUpperCase(),
        compressedSize: i(d),
        size: i(g),
        fileNameLength: i(h),
        extraLength: i(I),
        commentLength: i(D),
        diskNumStart: C,
        inAttr: T,
        attr: a,
        offset: l,
        centralHeaderSize: i(N.CENHDR + h + I + D)
      };
    },
    toString: function() {
      return JSON.stringify(this.toJSON(), null, "	");
    }
  };
}, V = Q, F = V.Constants, st = function() {
  var e = 0, t = 0, n = 0, r = 0, o = 0;
  return {
    get diskEntries() {
      return e;
    },
    set diskEntries(s) {
      e = t = s;
    },
    get totalEntries() {
      return t;
    },
    set totalEntries(s) {
      t = e = s;
    },
    get size() {
      return n;
    },
    set size(s) {
      n = s;
    },
    get offset() {
      return r;
    },
    set offset(s) {
      r = s;
    },
    get commentLength() {
      return o;
    },
    set commentLength(s) {
      o = s;
    },
    get mainHeaderSize() {
      return F.ENDHDR + o;
    },
    loadFromBinary: function(s) {
      if ((s.length !== F.ENDHDR || s.readUInt32LE(0) !== F.ENDSIG) && (s.length < F.ZIP64HDR || s.readUInt32LE(0) !== F.ZIP64SIG))
        throw V.Errors.INVALID_END();
      s.readUInt32LE(0) === F.ENDSIG ? (e = s.readUInt16LE(F.ENDSUB), t = s.readUInt16LE(F.ENDTOT), n = s.readUInt32LE(F.ENDSIZ), r = s.readUInt32LE(F.ENDOFF), o = s.readUInt16LE(F.ENDCOM)) : (e = V.readBigUInt64LE(s, F.ZIP64SUB), t = V.readBigUInt64LE(s, F.ZIP64TOT), n = V.readBigUInt64LE(s, F.ZIP64SIZE), r = V.readBigUInt64LE(s, F.ZIP64OFF), o = 0);
    },
    toBinary: function() {
      var s = Buffer.alloc(F.ENDHDR + o);
      return s.writeUInt32LE(F.ENDSIG, 0), s.writeUInt32LE(0, 4), s.writeUInt16LE(e, F.ENDSUB), s.writeUInt16LE(t, F.ENDTOT), s.writeUInt32LE(n, F.ENDSIZ), s.writeUInt32LE(r, F.ENDOFF), s.writeUInt16LE(o, F.ENDCOM), s.fill(" ", F.ENDHDR), s;
    },
    toJSON: function() {
      const s = function(d, g) {
        let h = d.toString(16).toUpperCase();
        for (; h.length < g; ) h = "0" + h;
        return "0x" + h;
      };
      return {
        diskEntries: e,
        totalEntries: t,
        size: n + " bytes",
        offset: s(r, 4),
        commentLength: o
      };
    },
    toString: function() {
      return JSON.stringify(this.toJSON(), null, "	");
    }
  };
};
ae.EntryHeader = ot;
ae.MainHeader = st;
var ce = {}, it = function(e) {
  var t = ve, n = { chunkSize: (parseInt(e.length / 1024) + 1) * 1024 };
  return {
    deflate: function() {
      return t.deflateRawSync(e, n);
    },
    deflateAsync: function(r) {
      var o = t.createDeflateRaw(n), s = [], d = 0;
      o.on("data", function(g) {
        s.push(g), d += g.length;
      }), o.on("end", function() {
        var g = Buffer.alloc(d), h = 0;
        g.fill(0);
        for (var I = 0; I < s.length; I++) {
          var D = s[I];
          D.copy(g, h), h += D.length;
        }
        r && r(g);
      }), o.end(e);
    }
  };
};
const at = +(process.versions ? process.versions.node : "").split(".")[0] || 0;
var ct = function(e, t) {
  var n = ve;
  const r = at >= 15 && t > 0 ? { maxOutputLength: t } : {};
  return {
    inflate: function() {
      return n.inflateRawSync(e, r);
    },
    inflateAsync: function(o) {
      var s = n.createInflateRaw(r), d = [], g = 0;
      s.on("data", function(h) {
        d.push(h), g += h.length;
      }), s.on("end", function() {
        var h = Buffer.alloc(g), I = 0;
        h.fill(0);
        for (var D = 0; D < d.length; D++) {
          var C = d[D];
          C.copy(h, I), I += C.length;
        }
        o && o(h);
      }), s.end(e);
    }
  };
};
const { randomFillSync: Le } = We, ft = ie, lt = new Uint32Array(256).map((e, t) => {
  for (let n = 0; n < 8; n++)
    t & 1 ? t = t >>> 1 ^ 3988292384 : t >>>= 1;
  return t >>> 0;
}), Be = (e, t) => Math.imul(e, t) >>> 0, Te = (e, t) => lt[(e ^ t) & 255] ^ e >>> 8, q = () => typeof Le == "function" ? Le(Buffer.alloc(12)) : q.node();
q.node = () => {
  const e = Buffer.alloc(12), t = e.length;
  for (let n = 0; n < t; n++) e[n] = Math.random() * 256 & 255;
  return e;
};
const ne = {
  genSalt: q
};
function fe(e) {
  const t = Buffer.isBuffer(e) ? e : Buffer.from(e);
  this.keys = new Uint32Array([305419896, 591751049, 878082192]);
  for (let n = 0; n < t.length; n++)
    this.updateKeys(t[n]);
}
fe.prototype.updateKeys = function(e) {
  const t = this.keys;
  return t[0] = Te(t[0], e), t[1] += t[0] & 255, t[1] = Be(t[1], 134775813) + 1, t[2] = Te(t[2], t[1] >>> 24), e;
};
fe.prototype.next = function() {
  const e = (this.keys[2] | 2) >>> 0;
  return Be(e, e ^ 1) >> 8 & 255;
};
function ut(e) {
  const t = new fe(e);
  return function(n) {
    const r = Buffer.alloc(n.length);
    let o = 0;
    for (let s of n)
      r[o++] = t.updateKeys(s ^ t.next());
    return r;
  };
}
function dt(e) {
  const t = new fe(e);
  return function(n, r, o = 0) {
    r || (r = Buffer.alloc(n.length));
    for (let s of n) {
      const d = t.next();
      r[o++] = s ^ d, t.updateKeys(s);
    }
    return r;
  };
}
function Et(e, t, n) {
  if (!e || !Buffer.isBuffer(e) || e.length < 12)
    return Buffer.alloc(0);
  const r = ut(n), o = r(e.slice(0, 12)), s = (t.flags & 8) === 8 ? t.timeHighByte : t.crc >>> 24;
  if (o[11] !== s)
    throw ft.WRONG_PASSWORD();
  return r(e.slice(12));
}
function mt(e) {
  Buffer.isBuffer(e) && e.length >= 12 ? ne.genSalt = function() {
    return e.slice(0, 12);
  } : e === "node" ? ne.genSalt = q.node : ne.genSalt = q;
}
function pt(e, t, n, r = !1) {
  e == null && (e = Buffer.alloc(0)), Buffer.isBuffer(e) || (e = Buffer.from(e.toString()));
  const o = dt(n), s = ne.genSalt();
  s[11] = t.crc >>> 24 & 255, r && (s[10] = t.crc >>> 16 & 255);
  const d = Buffer.alloc(e.length + 12);
  return o(s, d), o(e, d, 12);
}
var gt = { decrypt: Et, encrypt: pt, _salter: mt };
ce.Deflater = it;
ce.Inflater = ct;
ce.ZipCrypto = gt;
var _ = Q, ht = ae, v = _.Constants, Ee = ce, be = function(e, t) {
  var n = new ht.EntryHeader(), r = Buffer.alloc(0), o = Buffer.alloc(0), s = !1, d = null, g = Buffer.alloc(0), h = Buffer.alloc(0), I = !0;
  const D = e, C = typeof D.decoder == "object" ? D.decoder : _.decoder;
  I = C.hasOwnProperty("efs") ? C.efs : !1;
  function T() {
    return !t || !(t instanceof Uint8Array) ? Buffer.alloc(0) : (h = n.loadLocalHeaderFromBinary(t), t.slice(n.realDataOffset, n.realDataOffset + n.compressedSize));
  }
  function a(f) {
    if (n.flags_desc) {
      const E = {}, p = n.realDataOffset + n.compressedSize;
      if (t.readUInt32LE(p) == v.LOCSIG || t.readUInt32LE(p) == v.CENSIG)
        throw _.Errors.DESCRIPTOR_NOT_EXIST();
      if (t.readUInt32LE(p) == v.EXTSIG)
        E.crc = t.readUInt32LE(p + v.EXTCRC), E.compressedSize = t.readUInt32LE(p + v.EXTSIZ), E.size = t.readUInt32LE(p + v.EXTLEN);
      else if (t.readUInt16LE(p + 12) === 19280)
        E.crc = t.readUInt32LE(p + v.EXTCRC - 4), E.compressedSize = t.readUInt32LE(p + v.EXTSIZ - 4), E.size = t.readUInt32LE(p + v.EXTLEN - 4);
      else
        throw _.Errors.DESCRIPTOR_UNKNOWN();
      if (E.compressedSize !== n.compressedSize || E.size !== n.size || E.crc !== n.crc)
        throw _.Errors.DESCRIPTOR_FAULTY();
      if (_.crc32(f) !== E.crc)
        return !1;
    } else if (_.crc32(f) !== n.localHeader.crc)
      return !1;
    return !0;
  }
  function l(f, E, p) {
    if (typeof E > "u" && typeof f == "string" && (p = f, f = void 0), s)
      return f && E && E(Buffer.alloc(0), _.Errors.DIRECTORY_CONTENT_ERROR()), Buffer.alloc(0);
    var y = T();
    if (y.length === 0)
      return f && E && E(y), y;
    if (n.encrypted) {
      if (typeof p != "string" && !Buffer.isBuffer(p))
        throw _.Errors.INVALID_PASS_PARAM();
      y = Ee.ZipCrypto.decrypt(y, n, p);
    }
    var L = Buffer.alloc(n.size);
    switch (n.method) {
      case _.Constants.STORED:
        if (y.copy(L), a(L))
          return f && E && E(L), L;
        throw f && E && E(L, _.Errors.BAD_CRC()), _.Errors.BAD_CRC();
      case _.Constants.DEFLATED:
        var O = new Ee.Inflater(y, n.size);
        if (f)
          O.inflateAsync(function(S) {
            S.copy(S, 0), E && (a(S) ? E(S) : E(S, _.Errors.BAD_CRC()));
          });
        else {
          if (O.inflate(L).copy(L, 0), !a(L))
            throw _.Errors.BAD_CRC(`"${C.decode(r)}"`);
          return L;
        }
        break;
      default:
        throw f && E && E(Buffer.alloc(0), _.Errors.UNKNOWN_METHOD()), _.Errors.UNKNOWN_METHOD();
    }
  }
  function c(f, E) {
    if ((!d || !d.length) && Buffer.isBuffer(t))
      return f && E && E(T()), T();
    if (d.length && !s) {
      var p;
      switch (n.method) {
        case _.Constants.STORED:
          return n.compressedSize = n.size, p = Buffer.alloc(d.length), d.copy(p), f && E && E(p), p;
        default:
        case _.Constants.DEFLATED:
          var y = new Ee.Deflater(d);
          if (f)
            y.deflateAsync(function(O) {
              p = Buffer.alloc(O.length), n.compressedSize = O.length, O.copy(p), E && E(p);
            });
          else {
            var L = y.deflate();
            return n.compressedSize = L.length, L;
          }
          y = null;
          break;
      }
    } else if (f && E)
      E(Buffer.alloc(0));
    else
      return Buffer.alloc(0);
  }
  function u(f, E) {
    return (f.readUInt32LE(E + 4) << 4) + f.readUInt32LE(E);
  }
  function m(f) {
    try {
      for (var E = 0, p, y, L; E + 4 < f.length; )
        p = f.readUInt16LE(E), E += 2, y = f.readUInt16LE(E), E += 2, L = f.slice(E, E + y), E += y, v.ID_ZIP64 === p && i(L);
    } catch {
      throw _.Errors.EXTRA_FIELD_PARSE_ERROR();
    }
  }
  function i(f) {
    var E, p, y, L;
    f.length >= v.EF_ZIP64_SCOMP && (E = u(f, v.EF_ZIP64_SUNCOMP), n.size === v.EF_ZIP64_OR_32 && (n.size = E)), f.length >= v.EF_ZIP64_RHO && (p = u(f, v.EF_ZIP64_SCOMP), n.compressedSize === v.EF_ZIP64_OR_32 && (n.compressedSize = p)), f.length >= v.EF_ZIP64_DSN && (y = u(f, v.EF_ZIP64_RHO), n.offset === v.EF_ZIP64_OR_32 && (n.offset = y)), f.length >= v.EF_ZIP64_DSN + 4 && (L = f.readUInt32LE(v.EF_ZIP64_DSN), n.diskNumStart === v.EF_ZIP64_OR_16 && (n.diskNumStart = L));
  }
  return {
    get entryName() {
      return C.decode(r);
    },
    get rawEntryName() {
      return r;
    },
    set entryName(f) {
      r = _.toBuffer(f, C.encode);
      var E = r[r.length - 1];
      s = E === 47 || E === 92, n.fileNameLength = r.length;
    },
    get efs() {
      return typeof I == "function" ? I(this.entryName) : I;
    },
    get extra() {
      return g;
    },
    set extra(f) {
      g = f, n.extraLength = f.length, m(f);
    },
    get comment() {
      return C.decode(o);
    },
    set comment(f) {
      if (o = _.toBuffer(f, C.encode), n.commentLength = o.length, o.length > 65535) throw _.Errors.COMMENT_TOO_LONG();
    },
    get name() {
      var f = C.decode(r);
      return s ? f.substr(f.length - 1).split("/").pop() : f.split("/").pop();
    },
    get isDirectory() {
      return s;
    },
    getCompressedData: function() {
      return c(!1, null);
    },
    getCompressedDataAsync: function(f) {
      c(!0, f);
    },
    setData: function(f) {
      d = _.toBuffer(f, _.decoder.encode), !s && d.length ? (n.size = d.length, n.method = _.Constants.DEFLATED, n.crc = _.crc32(f), n.changed = !0) : n.method = _.Constants.STORED;
    },
    getData: function(f) {
      return n.changed ? d : l(!1, null, f);
    },
    getDataAsync: function(f, E) {
      n.changed ? f(d) : l(!0, f, E);
    },
    set attr(f) {
      n.attr = f;
    },
    get attr() {
      return n.attr;
    },
    set header(f) {
      n.loadFromBinary(f);
    },
    get header() {
      return n;
    },
    packCentralHeader: function() {
      n.flags_efs = this.efs, n.extraLength = g.length;
      var f = n.centralHeaderToBinary(), E = _.Constants.CENHDR;
      return r.copy(f, E), E += r.length, g.copy(f, E), E += n.extraLength, o.copy(f, E), f;
    },
    packLocalHeader: function() {
      let f = 0;
      n.flags_efs = this.efs, n.extraLocalLength = h.length;
      const E = n.localHeaderToBinary(), p = Buffer.alloc(E.length + r.length + n.extraLocalLength);
      return E.copy(p, f), f += E.length, r.copy(p, f), f += r.length, h.copy(p, f), f += h.length, p;
    },
    toJSON: function() {
      const f = function(E) {
        return "<" + (E && E.length + " bytes buffer" || "null") + ">";
      };
      return {
        entryName: this.entryName,
        name: this.name,
        comment: this.comment,
        isDirectory: this.isDirectory,
        header: n.toJSON(),
        compressedData: f(t),
        data: f(d)
      };
    },
    toString: function() {
      return JSON.stringify(this.toJSON(), null, "	");
    }
  };
};
const Ce = be, It = ae, M = Q;
var Nt = function(e, t) {
  var n = [], r = {}, o = Buffer.alloc(0), s = new It.MainHeader(), d = !1;
  const g = /* @__PURE__ */ new Set(), h = t, { noSort: I, decoder: D } = h;
  e ? a(h.readEntries) : d = !0;
  function C() {
    const c = /* @__PURE__ */ new Set();
    for (const u of Object.keys(r)) {
      const m = u.split("/");
      if (m.pop(), !!m.length)
        for (let i = 0; i < m.length; i++) {
          const f = m.slice(0, i + 1).join("/") + "/";
          c.add(f);
        }
    }
    for (const u of c)
      if (!(u in r)) {
        const m = new Ce(h);
        m.entryName = u, m.attr = 16, m.temporary = !0, n.push(m), r[m.entryName] = m, g.add(m);
      }
  }
  function T() {
    if (d = !0, r = {}, s.diskEntries > (e.length - s.offset) / M.Constants.CENHDR)
      throw M.Errors.DISK_ENTRY_TOO_LARGE();
    n = new Array(s.diskEntries);
    for (var c = s.offset, u = 0; u < n.length; u++) {
      var m = c, i = new Ce(h, e);
      i.header = e.slice(m, m += M.Constants.CENHDR), i.entryName = e.slice(m, m += i.header.fileNameLength), i.header.extraLength && (i.extra = e.slice(m, m += i.header.extraLength)), i.header.commentLength && (i.comment = e.slice(m, m + i.header.commentLength)), c += i.header.centralHeaderSize, n[u] = i, r[i.entryName] = i;
    }
    g.clear(), C();
  }
  function a(c) {
    var u = e.length - M.Constants.ENDHDR, m = Math.max(0, u - 65535), i = m, f = e.length, E = -1, p = 0;
    for ((typeof h.trailingSpace == "boolean" ? h.trailingSpace : !1) && (m = 0), u; u >= i; u--)
      if (e[u] === 80) {
        if (e.readUInt32LE(u) === M.Constants.ENDSIG) {
          E = u, p = u, f = u + M.Constants.ENDHDR, i = u - M.Constants.END64HDR;
          continue;
        }
        if (e.readUInt32LE(u) === M.Constants.END64SIG) {
          i = m;
          continue;
        }
        if (e.readUInt32LE(u) === M.Constants.ZIP64SIG) {
          E = u, f = u + M.readBigUInt64LE(e, u + M.Constants.ZIP64SIZE) + M.Constants.ZIP64LEAD;
          break;
        }
      }
    if (E == -1) throw M.Errors.INVALID_FORMAT();
    s.loadFromBinary(e.slice(E, f)), s.commentLength && (o = e.slice(p + M.Constants.ENDHDR)), c && T();
  }
  function l() {
    n.length > 1 && !I && n.sort((c, u) => c.entryName.toLowerCase().localeCompare(u.entryName.toLowerCase()));
  }
  return {
    /**
     * Returns an array of ZipEntry objects existent in the current opened archive
     * @return Array
     */
    get entries() {
      return d || T(), n.filter((c) => !g.has(c));
    },
    /**
     * Archive comment
     * @return {String}
     */
    get comment() {
      return D.decode(o);
    },
    set comment(c) {
      o = M.toBuffer(c, D.encode), s.commentLength = o.length;
    },
    getEntryCount: function() {
      return d ? n.length : s.diskEntries;
    },
    forEach: function(c) {
      this.entries.forEach(c);
    },
    /**
     * Returns a reference to the entry with the given name or null if entry is inexistent
     *
     * @param entryName
     * @return ZipEntry
     */
    getEntry: function(c) {
      return d || T(), r[c] || null;
    },
    /**
     * Adds the given entry to the entry list
     *
     * @param entry
     */
    setEntry: function(c) {
      d || T(), n.push(c), r[c.entryName] = c, s.totalEntries = n.length;
    },
    /**
     * Removes the file with the given name from the entry list.
     *
     * If the entry is a directory, then all nested files and directories will be removed
     * @param entryName
     * @returns {void}
     */
    deleteFile: function(c, u = !0) {
      d || T();
      const m = r[c];
      this.getEntryChildren(m, u).map((f) => f.entryName).forEach(this.deleteEntry);
    },
    /**
     * Removes the entry with the given name from the entry list.
     *
     * @param {string} entryName
     * @returns {void}
     */
    deleteEntry: function(c) {
      d || T();
      const u = r[c], m = n.indexOf(u);
      m >= 0 && (n.splice(m, 1), delete r[c], s.totalEntries = n.length);
    },
    /**
     *  Iterates and returns all nested files and directories of the given entry
     *
     * @param entry
     * @return Array
     */
    getEntryChildren: function(c, u = !0) {
      if (d || T(), typeof c == "object")
        if (c.isDirectory && u) {
          const m = [], i = c.entryName;
          for (const f of n)
            f.entryName.startsWith(i) && m.push(f);
          return m;
        } else
          return [c];
      return [];
    },
    /**
     *  How many child elements entry has
     *
     * @param {ZipEntry} entry
     * @return {integer}
     */
    getChildCount: function(c) {
      if (c && c.isDirectory) {
        const u = this.getEntryChildren(c);
        return u.includes(c) ? u.length - 1 : u.length;
      }
      return 0;
    },
    /**
     * Returns the zip file
     *
     * @return Buffer
     */
    compressToBuffer: function() {
      d || T(), l();
      const c = [], u = [];
      let m = 0, i = 0;
      s.size = 0, s.offset = 0;
      let f = 0;
      for (const y of this.entries) {
        const L = y.getCompressedData();
        y.header.offset = i;
        const O = y.packLocalHeader(), S = O.length + L.length;
        i += S, c.push(O), c.push(L);
        const A = y.packCentralHeader();
        u.push(A), s.size += A.length, m += S + A.length, f++;
      }
      m += s.mainHeaderSize, s.offset = i, s.totalEntries = f, i = 0;
      const E = Buffer.alloc(m);
      for (const y of c)
        y.copy(E, i), i += y.length;
      for (const y of u)
        y.copy(E, i), i += y.length;
      const p = s.toBinary();
      return o && o.copy(p, M.Constants.ENDHDR), p.copy(E, i), e = E, d = !1, E;
    },
    toAsyncBuffer: function(c, u, m, i) {
      try {
        d || T(), l();
        const f = [], E = [];
        let p = 0, y = 0, L = 0;
        s.size = 0, s.offset = 0;
        const O = function(S) {
          if (S.length > 0) {
            const A = S.shift(), H = A.entryName + A.extra.toString();
            m && m(H), A.getCompressedDataAsync(function(j) {
              i && i(H), A.header.offset = y;
              const G = A.packLocalHeader(), te = G.length + j.length;
              y += te, f.push(G), f.push(j);
              const de = A.packCentralHeader();
              E.push(de), s.size += de.length, p += te + de.length, L++, O(S);
            });
          } else {
            p += s.mainHeaderSize, s.offset = y, s.totalEntries = L, y = 0;
            const A = Buffer.alloc(p);
            f.forEach(function(j) {
              j.copy(A, y), y += j.length;
            }), E.forEach(function(j) {
              j.copy(A, y), y += j.length;
            });
            const H = s.toBinary();
            o && o.copy(H, M.Constants.ENDHDR), H.copy(A, y), e = A, d = !1, c(A);
          }
        };
        O(Array.from(this.entries));
      } catch (f) {
        u(f);
      }
    }
  };
};
const x = Q, U = w, yt = be, Dt = Nt, X = (...e) => x.findLast(e, (t) => typeof t == "boolean"), Se = (...e) => x.findLast(e, (t) => typeof t == "string"), Lt = (...e) => x.findLast(e, (t) => typeof t == "function"), Tt = {
  // option "noSort" : if true it disables files sorting
  noSort: !1,
  // read entries during load (initial loading may be slower)
  readEntries: !1,
  // default method is none
  method: x.Constants.NONE,
  // file system
  fs: null
};
var Ct = function(e, t) {
  let n = null;
  const r = Object.assign(/* @__PURE__ */ Object.create(null), Tt);
  e && typeof e == "object" && (e instanceof Uint8Array || (Object.assign(r, e), e = r.input ? r.input : void 0, r.input && delete r.input), Buffer.isBuffer(e) && (n = e, r.method = x.Constants.BUFFER, e = void 0)), Object.assign(r, t);
  const o = new x(r);
  if ((typeof r.decoder != "object" || typeof r.decoder.encode != "function" || typeof r.decoder.decode != "function") && (r.decoder = x.decoder), e && typeof e == "string")
    if (o.fs.existsSync(e))
      r.method = x.Constants.FILE, r.filename = e, n = o.fs.readFileSync(e);
    else
      throw x.Errors.INVALID_FILENAME();
  const s = new Dt(n, r), { canonical: d, sanitize: g, zipnamefix: h } = x;
  function I(a) {
    if (a && s) {
      var l;
      if (typeof a == "string" && (l = s.getEntry(U.posix.normalize(a))), typeof a == "object" && typeof a.entryName < "u" && typeof a.header < "u" && (l = s.getEntry(a.entryName)), l)
        return l;
    }
    return null;
  }
  function D(a) {
    const { join: l, normalize: c, sep: u } = U.posix;
    return l(".", c(u + a.split("\\").join(u) + u));
  }
  function C(a) {
    return a instanceof RegExp ? /* @__PURE__ */ function(l) {
      return function(c) {
        return l.test(c);
      };
    }(a) : typeof a != "function" ? () => !0 : a;
  }
  const T = (a, l) => {
    let c = l.slice(-1);
    return c = c === o.sep ? o.sep : "", U.relative(a, l) + c;
  };
  return {
    /**
     * Extracts the given entry from the archive and returns the content as a Buffer object
     * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
     * @param {Buffer|string} [pass] - password
     * @return Buffer or Null in case of error
     */
    readFile: function(a, l) {
      var c = I(a);
      return c && c.getData(l) || null;
    },
    /**
     * Returns how many child elements has on entry (directories) on files it is always 0
     * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
     * @returns {integer}
     */
    childCount: function(a) {
      const l = I(a);
      if (l)
        return s.getChildCount(l);
    },
    /**
     * Asynchronous readFile
     * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
     * @param {callback} callback
     *
     * @return Buffer or Null in case of error
     */
    readFileAsync: function(a, l) {
      var c = I(a);
      c ? c.getDataAsync(l) : l(null, "getEntry failed for:" + a);
    },
    /**
     * Extracts the given entry from the archive and returns the content as plain text in the given encoding
     * @param {ZipEntry|string} entry - ZipEntry object or String with the full path of the entry
     * @param {string} encoding - Optional. If no encoding is specified utf8 is used
     *
     * @return String
     */
    readAsText: function(a, l) {
      var c = I(a);
      if (c) {
        var u = c.getData();
        if (u && u.length)
          return u.toString(l || "utf8");
      }
      return "";
    },
    /**
     * Asynchronous readAsText
     * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
     * @param {callback} callback
     * @param {string} [encoding] - Optional. If no encoding is specified utf8 is used
     *
     * @return String
     */
    readAsTextAsync: function(a, l, c) {
      var u = I(a);
      u ? u.getDataAsync(function(m, i) {
        if (i) {
          l(m, i);
          return;
        }
        m && m.length ? l(m.toString(c || "utf8")) : l("");
      }) : l("");
    },
    /**
     * Remove the entry from the file or the entry and all it's nested directories and files if the given entry is a directory
     *
     * @param {ZipEntry|string} entry
     * @returns {void}
     */
    deleteFile: function(a, l = !0) {
      var c = I(a);
      c && s.deleteFile(c.entryName, l);
    },
    /**
     * Remove the entry from the file or directory without affecting any nested entries
     *
     * @param {ZipEntry|string} entry
     * @returns {void}
     */
    deleteEntry: function(a) {
      var l = I(a);
      l && s.deleteEntry(l.entryName);
    },
    /**
     * Adds a comment to the zip. The zip must be rewritten after adding the comment.
     *
     * @param {string} comment
     */
    addZipComment: function(a) {
      s.comment = a;
    },
    /**
     * Returns the zip comment
     *
     * @return String
     */
    getZipComment: function() {
      return s.comment || "";
    },
    /**
     * Adds a comment to a specified zipEntry. The zip must be rewritten after adding the comment
     * The comment cannot exceed 65535 characters in length
     *
     * @param {ZipEntry} entry
     * @param {string} comment
     */
    addZipEntryComment: function(a, l) {
      var c = I(a);
      c && (c.comment = l);
    },
    /**
     * Returns the comment of the specified entry
     *
     * @param {ZipEntry} entry
     * @return String
     */
    getZipEntryComment: function(a) {
      var l = I(a);
      return l && l.comment || "";
    },
    /**
     * Updates the content of an existing entry inside the archive. The zip must be rewritten after updating the content
     *
     * @param {ZipEntry} entry
     * @param {Buffer} content
     */
    updateFile: function(a, l) {
      var c = I(a);
      c && c.setData(l);
    },
    /**
     * Adds a file from the disk to the archive
     *
     * @param {string} localPath File to add to zip
     * @param {string} [zipPath] Optional path inside the zip
     * @param {string} [zipName] Optional name for the file
     * @param {string} [comment] Optional file comment
     */
    addLocalFile: function(a, l, c, u) {
      if (o.fs.existsSync(a)) {
        l = l ? D(l) : "";
        const m = U.win32.basename(U.win32.normalize(a));
        l += c || m;
        const i = o.fs.statSync(a), f = i.isFile() ? o.fs.readFileSync(a) : Buffer.alloc(0);
        i.isDirectory() && (l += o.sep), this.addFile(l, f, u, i);
      } else
        throw x.Errors.FILE_NOT_FOUND(a);
    },
    /**
     * Callback for showing if everything was done.
     *
     * @callback doneCallback
     * @param {Error} err - Error object
     * @param {boolean} done - was request fully completed
     */
    /**
     * Adds a file from the disk to the archive
     *
     * @param {(object|string)} options - options object, if it is string it us used as localPath.
     * @param {string} options.localPath - Local path to the file.
     * @param {string} [options.comment] - Optional file comment.
     * @param {string} [options.zipPath] - Optional path inside the zip
     * @param {string} [options.zipName] - Optional name for the file
     * @param {doneCallback} callback - The callback that handles the response.
     */
    addLocalFileAsync: function(a, l) {
      a = typeof a == "object" ? a : { localPath: a };
      const c = U.resolve(a.localPath), { comment: u } = a;
      let { zipPath: m, zipName: i } = a;
      const f = this;
      o.fs.stat(c, function(E, p) {
        if (E) return l(E, !1);
        m = m ? D(m) : "";
        const y = U.win32.basename(U.win32.normalize(c));
        if (m += i || y, p.isFile())
          o.fs.readFile(c, function(L, O) {
            return L ? l(L, !1) : (f.addFile(m, O, u, p), setImmediate(l, void 0, !0));
          });
        else if (p.isDirectory())
          return m += o.sep, f.addFile(m, Buffer.alloc(0), u, p), setImmediate(l, void 0, !0);
      });
    },
    /**
     * Adds a local directory and all its nested files and directories to the archive
     *
     * @param {string} localPath - local path to the folder
     * @param {string} [zipPath] - optional path inside zip
     * @param {(RegExp|function)} [filter] - optional RegExp or Function if files match will be included.
     */
    addLocalFolder: function(a, l, c) {
      if (c = C(c), l = l ? D(l) : "", a = U.normalize(a), o.fs.existsSync(a)) {
        const u = o.findFiles(a), m = this;
        if (u.length)
          for (const i of u) {
            const f = U.join(l, T(a, i));
            c(f) && m.addLocalFile(i, U.dirname(f));
          }
      } else
        throw x.Errors.FILE_NOT_FOUND(a);
    },
    /**
     * Asynchronous addLocalFolder
     * @param {string} localPath
     * @param {callback} callback
     * @param {string} [zipPath] optional path inside zip
     * @param {RegExp|function} [filter] optional RegExp or Function if files match will
     *               be included.
     */
    addLocalFolderAsync: function(a, l, c, u) {
      u = C(u), c = c ? D(c) : "", a = U.normalize(a);
      var m = this;
      o.fs.open(a, "r", function(i) {
        if (i && i.code === "ENOENT")
          l(void 0, x.Errors.FILE_NOT_FOUND(a));
        else if (i)
          l(void 0, i);
        else {
          var f = o.findFiles(a), E = -1, p = function() {
            if (E += 1, E < f.length) {
              var y = f[E], L = T(a, y).split("\\").join("/");
              L = L.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, ""), u(L) ? o.fs.stat(y, function(O, S) {
                O && l(void 0, O), S.isFile() ? o.fs.readFile(y, function(A, H) {
                  A ? l(void 0, A) : (m.addFile(c + L, H, "", S), p());
                }) : (m.addFile(c + L + "/", Buffer.alloc(0), "", S), p());
              }) : process.nextTick(() => {
                p();
              });
            } else
              l(!0, void 0);
          };
          p();
        }
      });
    },
    /**
     * Adds a local directory and all its nested files and directories to the archive
     *
     * @param {object | string} options - options object, if it is string it us used as localPath.
     * @param {string} options.localPath - Local path to the folder.
     * @param {string} [options.zipPath] - optional path inside zip.
     * @param {RegExp|function} [options.filter] - optional RegExp or Function if files match will be included.
     * @param {function|string} [options.namefix] - optional function to help fix filename
     * @param {doneCallback} callback - The callback that handles the response.
     *
     */
    addLocalFolderAsync2: function(a, l) {
      const c = this;
      a = typeof a == "object" ? a : { localPath: a }, localPath = U.resolve(D(a.localPath));
      let { zipPath: u, filter: m, namefix: i } = a;
      m instanceof RegExp ? m = /* @__PURE__ */ function(p) {
        return function(y) {
          return p.test(y);
        };
      }(m) : typeof m != "function" && (m = function() {
        return !0;
      }), u = u ? D(u) : "", i == "latin1" && (i = (p) => p.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "")), typeof i != "function" && (i = (p) => p);
      const f = (p) => U.join(u, i(T(localPath, p))), E = (p) => U.win32.basename(U.win32.normalize(i(p)));
      o.fs.open(localPath, "r", function(p) {
        p && p.code === "ENOENT" ? l(void 0, x.Errors.FILE_NOT_FOUND(localPath)) : p ? l(void 0, p) : o.findFilesAsync(localPath, function(y, L) {
          if (y) return l(y);
          L = L.filter((O) => m(f(O))), L.length || l(void 0, !1), setImmediate(
            L.reverse().reduce(function(O, S) {
              return function(A, H) {
                if (A || H === !1) return setImmediate(O, A, !1);
                c.addLocalFileAsync(
                  {
                    localPath: S,
                    zipPath: U.dirname(f(S)),
                    zipName: E(S)
                  },
                  O
                );
              };
            }, l)
          );
        });
      });
    },
    /**
     * Adds a local directory and all its nested files and directories to the archive
     *
     * @param {string} localPath - path where files will be extracted
     * @param {object} props - optional properties
     * @param {string} [props.zipPath] - optional path inside zip
     * @param {RegExp|function} [props.filter] - optional RegExp or Function if files match will be included.
     * @param {function|string} [props.namefix] - optional function to help fix filename
     */
    addLocalFolderPromise: function(a, l) {
      return new Promise((c, u) => {
        this.addLocalFolderAsync2(Object.assign({ localPath: a }, l), (m, i) => {
          m && u(m), i && c(this);
        });
      });
    },
    /**
     * Allows you to create a entry (file or directory) in the zip file.
     * If you want to create a directory the entryName must end in / and a null buffer should be provided.
     * Comment and attributes are optional
     *
     * @param {string} entryName
     * @param {Buffer | string} content - file content as buffer or utf8 coded string
     * @param {string} [comment] - file comment
     * @param {number | object} [attr] - number as unix file permissions, object as filesystem Stats object
     */
    addFile: function(a, l, c, u) {
      a = h(a);
      let m = I(a);
      const i = m != null;
      i || (m = new yt(r), m.entryName = a), m.comment = c || "";
      const f = typeof u == "object" && u instanceof o.fs.Stats;
      f && (m.header.time = u.mtime);
      var E = m.isDirectory ? 16 : 0;
      let p = m.isDirectory ? 16384 : 32768;
      return f ? p |= 4095 & u.mode : typeof u == "number" ? p |= 4095 & u : p |= m.isDirectory ? 493 : 420, E = (E | p << 16) >>> 0, m.attr = E, m.setData(l), i || s.setEntry(m), m;
    },
    /**
     * Returns an array of ZipEntry objects representing the files and folders inside the archive
     *
     * @param {string} [password]
     * @returns Array
     */
    getEntries: function(a) {
      return s.password = a, s ? s.entries : [];
    },
    /**
     * Returns a ZipEntry object representing the file or folder specified by ``name``.
     *
     * @param {string} name
     * @return ZipEntry
     */
    getEntry: function(a) {
      return I(a);
    },
    getEntryCount: function() {
      return s.getEntryCount();
    },
    forEach: function(a) {
      return s.forEach(a);
    },
    /**
     * Extracts the given entry to the given targetPath
     * If the entry is a directory inside the archive, the entire directory and it's subdirectories will be extracted
     *
     * @param {string|ZipEntry} entry - ZipEntry object or String with the full path of the entry
     * @param {string} targetPath - Target folder where to write the file
     * @param {boolean} [maintainEntryPath=true] - If maintainEntryPath is true and the entry is inside a folder, the entry folder will be created in targetPath as well. Default is TRUE
     * @param {boolean} [overwrite=false] - If the file already exists at the target path, the file will be overwriten if this is true.
     * @param {boolean} [keepOriginalPermission=false] - The file will be set as the permission from the entry if this is true.
     * @param {string} [outFileName] - String If set will override the filename of the extracted file (Only works if the entry is a file)
     *
     * @return Boolean
     */
    extractEntryTo: function(a, l, c, u, m, i) {
      u = X(!1, u), m = X(!1, m), c = X(!0, c), i = Se(m, i);
      var f = I(a);
      if (!f)
        throw x.Errors.NO_ENTRY();
      var E = d(f.entryName), p = g(l, i && !f.isDirectory ? i : c ? E : U.basename(E));
      if (f.isDirectory) {
        var y = s.getEntryChildren(f);
        return y.forEach(function(S) {
          if (S.isDirectory) return;
          var A = S.getData();
          if (!A)
            throw x.Errors.CANT_EXTRACT_FILE();
          var H = d(S.entryName), j = g(l, c ? H : U.basename(H));
          const G = m ? S.header.fileAttr : void 0;
          o.writeFileTo(j, A, u, G);
        }), !0;
      }
      var L = f.getData(s.password);
      if (!L) throw x.Errors.CANT_EXTRACT_FILE();
      if (o.fs.existsSync(p) && !u)
        throw x.Errors.CANT_OVERRIDE();
      const O = m ? a.header.fileAttr : void 0;
      return o.writeFileTo(p, L, u, O), !0;
    },
    /**
     * Test the archive
     * @param {string} [pass]
     */
    test: function(a) {
      if (!s)
        return !1;
      for (var l in s.entries)
        try {
          if (l.isDirectory)
            continue;
          var c = s.entries[l].getData(a);
          if (!c)
            return !1;
        } catch {
          return !1;
        }
      return !0;
    },
    /**
     * Extracts the entire archive to the given location
     *
     * @param {string} targetPath Target location
     * @param {boolean} [overwrite=false] If the file already exists at the target path, the file will be overwriten if this is true.
     *                  Default is FALSE
     * @param {boolean} [keepOriginalPermission=false] The file will be set as the permission from the entry if this is true.
     *                  Default is FALSE
     * @param {string|Buffer} [pass] password
     */
    extractAllTo: function(a, l, c, u) {
      if (c = X(!1, c), u = Se(c, u), l = X(!1, l), !s) throw x.Errors.NO_ZIP();
      s.entries.forEach(function(m) {
        var i = g(a, d(m.entryName));
        if (m.isDirectory) {
          o.makeDir(i);
          return;
        }
        var f = m.getData(u);
        if (!f)
          throw x.Errors.CANT_EXTRACT_FILE();
        const E = c ? m.header.fileAttr : void 0;
        o.writeFileTo(i, f, l, E);
        try {
          o.fs.utimesSync(i, m.header.time, m.header.time);
        } catch {
          throw x.Errors.CANT_EXTRACT_FILE();
        }
      });
    },
    /**
     * Asynchronous extractAllTo
     *
     * @param {string} targetPath Target location
     * @param {boolean} [overwrite=false] If the file already exists at the target path, the file will be overwriten if this is true.
     *                  Default is FALSE
     * @param {boolean} [keepOriginalPermission=false] The file will be set as the permission from the entry if this is true.
     *                  Default is FALSE
     * @param {function} callback The callback will be executed when all entries are extracted successfully or any error is thrown.
     */
    extractAllToAsync: function(a, l, c, u) {
      if (u = Lt(l, c, u), c = X(!1, c), l = X(!1, l), !u)
        return new Promise((p, y) => {
          this.extractAllToAsync(a, l, c, function(L) {
            L ? y(L) : p(this);
          });
        });
      if (!s) {
        u(x.Errors.NO_ZIP());
        return;
      }
      a = U.resolve(a);
      const m = (p) => g(a, U.normalize(d(p.entryName))), i = (p, y) => new Error(p + ': "' + y + '"'), f = [], E = [];
      s.entries.forEach((p) => {
        p.isDirectory ? f.push(p) : E.push(p);
      });
      for (const p of f) {
        const y = m(p), L = c ? p.header.fileAttr : void 0;
        try {
          o.makeDir(y), L && o.fs.chmodSync(y, L), o.fs.utimesSync(y, p.header.time, p.header.time);
        } catch {
          u(i("Unable to create folder", y));
        }
      }
      E.reverse().reduce(function(p, y) {
        return function(L) {
          if (L)
            p(L);
          else {
            const O = U.normalize(d(y.entryName)), S = g(a, O);
            y.getDataAsync(function(A, H) {
              if (H)
                p(H);
              else if (!A)
                p(x.Errors.CANT_EXTRACT_FILE());
              else {
                const j = c ? y.header.fileAttr : void 0;
                o.writeFileToAsync(S, A, l, j, function(G) {
                  G || p(i("Unable to write file", S)), o.fs.utimes(S, y.header.time, y.header.time, function(te) {
                    te ? p(i("Unable to set times", S)) : p();
                  });
                });
              }
            });
          }
        };
      }, u)();
    },
    /**
     * Writes the newly created zip file to disk at the specified location or if a zip was opened and no ``targetFileName`` is provided, it will overwrite the opened zip
     *
     * @param {string} targetFileName
     * @param {function} callback
     */
    writeZip: function(a, l) {
      if (arguments.length === 1 && typeof a == "function" && (l = a, a = ""), !a && r.filename && (a = r.filename), !!a) {
        var c = s.compressToBuffer();
        if (c) {
          var u = o.writeFileTo(a, c, !0);
          typeof l == "function" && l(u ? null : new Error("failed"), "");
        }
      }
    },
    /**
             *
             * @param {string} targetFileName
             * @param {object} [props]
             * @param {boolean} [props.overwrite=true] If the file already exists at the target path, the file will be overwriten if this is true.
             * @param {boolean} [props.perm] The file will be set as the permission from the entry if this is true.
    
             * @returns {Promise<void>}
             */
    writeZipPromise: function(a, l) {
      const { overwrite: c, perm: u } = Object.assign({ overwrite: !0 }, l);
      return new Promise((m, i) => {
        !a && r.filename && (a = r.filename), a || i("ADM-ZIP: ZIP File Name Missing"), this.toBufferPromise().then((f) => {
          const E = (p) => p ? m(p) : i("ADM-ZIP: Wasn't able to write zip file");
          o.writeFileToAsync(a, f, c, u, E);
        }, i);
      });
    },
    /**
     * @returns {Promise<Buffer>} A promise to the Buffer.
     */
    toBufferPromise: function() {
      return new Promise((a, l) => {
        s.toAsyncBuffer(a, l);
      });
    },
    /**
     * Returns the content of the entire zip file as a Buffer object
     *
     * @prop {function} [onSuccess]
     * @prop {function} [onFail]
     * @prop {function} [onItemStart]
     * @prop {function} [onItemEnd]
     * @returns {Buffer}
     */
    toBuffer: function(a, l, c, u) {
      return typeof a == "function" ? (s.toAsyncBuffer(a, l, c, u), null) : s.compressToBuffer();
    }
  };
};
const Me = /* @__PURE__ */ Ye(Ct), ge = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Me
}, Symbol.toStringTag, { value: "Module" })), St = Fe(import.meta.url), _e = w.dirname(St);
function He() {
  return process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY || "";
}
function _t() {
  return process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
}
const wt = "google/gemini-2.0-flash-thinking-exp:free";
let J = [], he = null, Ie = "idle", ze = null, oe = 0;
function se(e) {
  return e.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((t) => t.length > 2);
}
function Ot(e, t, n) {
  const r = new Array(t.size).fill(0), o = /* @__PURE__ */ new Map();
  for (const s of e)
    o.set(s, (o.get(s) || 0) + 1);
  for (const [s, d] of o) {
    const g = t.get(s);
    if (g !== void 0) {
      const h = d / e.length, I = n.get(s) || 0;
      r[g] = h * I;
    }
  }
  return r;
}
function At(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = e.map((g) => se(g));
  for (const g of r) {
    const h = new Set(g);
    for (const I of h)
      n.set(I, (n.get(I) || 0) + 1);
  }
  let o = 0;
  for (const g of n.keys())
    t.set(g, o++);
  const s = /* @__PURE__ */ new Map(), d = e.length;
  for (const [g, h] of n)
    s.set(g, Math.log((d + 1) / (h + 1)) + 1);
  return { vocab: t, idf: s };
}
function Rt(e, t) {
  const n = new Set(se(e)), r = new Set(se(t));
  let o = 0;
  for (const s of n)
    r.has(s) && o++;
  return o / n.size;
}
async function Ft(e) {
  var r, o, s;
  const t = await fetch(`${_t()}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${He()}`,
      "HTTP-Referer": "https://github.com",
      "X-Title": "UniversalReader"
    },
    body: JSON.stringify({
      model: wt,
      messages: e,
      temperature: 0.7
    })
  });
  if (!t.ok) {
    const d = await t.text();
    throw new Error(`OpenRouter API error: ${t.status} - ${d}`);
  }
  return ((s = (o = (r = (await t.json()).choices) == null ? void 0 : r[0]) == null ? void 0 : o.message) == null ? void 0 : s.content) || "Sorry, I couldn't generate a response.";
}
async function xt(e, t = 4) {
  if (J.length === 0) return [];
  const n = J.map((r, o) => ({
    idx: o,
    score: Rt(e, r.content),
    doc: r
  }));
  return n.sort((r, o) => o.score - r.score), n.slice(0, t).map((r) => ({
    pageContent: r.doc.content,
    metadata: r.doc.metadata
  }));
}
function re(e, t) {
  Ie = e, ze = t || null;
}
function vt() {
  return {
    status: Ie,
    currentBook: he || void 0,
    error: ze || void 0,
    chunkCount: oe || void 0
  };
}
async function Ut(e, t) {
  switch (t.toLowerCase()) {
    case "txt":
    case "md":
      return R.promises.readFile(e, "utf-8");
    case "pdf": {
      const n = await import("./pdf-CMEkdAEn.js"), r = [
        w.join(process.cwd(), "public", "pdf.worker.min.mjs"),
        w.join(process.cwd(), "dist", "pdf.worker.min.mjs"),
        w.join(_e, "..", "dist", "pdf.worker.min.mjs"),
        w.join(process.cwd(), "dist-electron", "pdf.worker.mjs"),
        w.join(_e, "..", "dist-electron", "pdf.worker.mjs")
      ];
      for (const h of r)
        if (R.existsSync(h)) {
          n.GlobalWorkerOptions.workerSrc = h;
          break;
        }
      const o = await R.promises.readFile(e), s = new Uint8Array(o), d = await n.getDocument({ data: s }).promise, g = [];
      for (let h = 1; h <= d.numPages; h++) {
        const C = (await (await d.getPage(h)).getTextContent()).items.map((T) => typeof T == "object" && T !== null && "str" in T ? T.str : "").join(" ");
        g.push(C);
      }
      return g.join(`

`);
    }
    case "epub": {
      const r = new Me(e).getEntries(), o = [];
      for (const d of r)
        if (d.entryName.endsWith(".html") || d.entryName.endsWith(".xhtml") || d.entryName.endsWith(".htm")) {
          const g = d.getData().toString("utf-8");
          o.push(g);
        }
      return o.map(
        (d) => d.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()
      ).join(`

`);
    }
    case "azw3":
    case "azw":
    case "mobi":
      throw new Error(
        "AZW3/Mobi format requires conversion to EPUB. Please convert the file to EPUB format using Calibre (https://calibre-ebook.com) or an online converter, then re-add the book to the library."
      );
    default:
      throw new Error(`Unsupported format: ${t}`);
  }
}
async function Pt(e, t) {
  try {
    if (re("loading"), !He())
      throw new Error(
        "OPENROUTER_API_KEY environment variable is not set. Please set it in your .env file or system environment. Get your free API key from https://openrouter.ai/keys"
      );
    if (!R.existsSync(e))
      throw new Error(`File not found: ${e}`);
    console.log(`[QA] Extracting text from ${e}`);
    const n = await Ut(e, t);
    if (!n || n.trim().length === 0)
      throw new Error("No text content extracted from file");
    console.log(`[QA] Extracted ${n.length} characters`);
    const r = 1e3, o = [];
    for (let g = 0; g < n.length; g += r)
      o.push(n.slice(g, g + r));
    console.log(`[QA] Created ${o.length} text chunks`);
    const { vocab: s, idf: d } = At(o);
    return J = o.map((g, h) => {
      const I = se(g);
      return {
        content: g,
        embedding: Ot(I, s, d),
        metadata: { source: w.basename(e), chunkIndex: h }
      };
    }), oe = o.length, he = e, re("ready"), console.log(`[QA] Ready with ${oe} chunks`), { success: !0 };
  } catch (n) {
    const r = n instanceof Error ? n.message : "Unknown error";
    return console.error("[QA] Load error:", r), re("error", r), { success: !1, error: r };
  }
}
async function Bt(e) {
  if (J.length === 0)
    throw new Error("No book loaded. Please load a book first.");
  if (Ie !== "ready")
    throw new Error("QA service not ready. Please wait.");
  console.log(`[QA] Question: ${e}`);
  const t = await xt(e, 4), r = `You are a helpful assistant that answers questions about a book. Based only on the following context from the book, please answer the question. If the answer is not in the context, say so.

Context:
${t.map((d) => d.pageContent.slice(0, 2e3)).join(`

`)}

Question: ${e}

Answer:`, o = await Ft([
    { role: "user", content: r }
  ]), s = t.map((d) => ({
    content: d.pageContent,
    source: d.metadata.source || "Unknown"
  }));
  return console.log(`[QA] Answer length: ${o.length}`), {
    answer: o,
    sources: s
  };
}
function bt() {
  J = [], he = null, oe = 0, re("idle"), console.log("[QA] Cleared");
}
const le = {
  loadBookForQA: Pt,
  askQuestion: Bt,
  clearQA: bt,
  getStatus: vt
}, je = [
  "pdf",
  "epub",
  "mobi",
  "azw3",
  "txt",
  "md"
], Ze = ["docx"], Mt = /* @__PURE__ */ new Set(["epub", "mobi", "azw3", "txt", "md"]);
function ue(e) {
  return e.trim().toLowerCase().replace(/^\./, "");
}
function ke(e) {
  const t = ue(e);
  return je.includes(t);
}
function Ht(e) {
  const t = ue(e);
  return Ze.includes(t);
}
function zt(e) {
  return ke(e) ? "supported" : Ht(e) ? "convertible" : "unsupported";
}
function pe(e) {
  return Mt.has(e) ? "flow" : "paged";
}
function jt() {
  return [...je, ...Ze];
}
function we(e) {
  return e === "docx" ? "md" : e;
}
function Zt(e) {
  const t = ue(e), n = zt(t);
  if (n === "unsupported")
    return {
      capability: n,
      sourceFormat: t,
      requiresConversion: !1,
      reason: "unsupported_format"
    };
  if (ke(t)) {
    const o = we(t);
    return {
      capability: n,
      sourceFormat: t,
      targetFormat: o,
      documentKind: pe(o),
      ingestStatus: "ready",
      requiresConversion: !1
    };
  }
  const r = we(t);
  return {
    capability: n,
    sourceFormat: t,
    targetFormat: r,
    documentKind: pe(r),
    ingestStatus: "converted",
    requiresConversion: !0
  };
}
const kt = w.join(Z.getPath("userData"), "library.db"), z = new Ve(kt);
z.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    path TEXT NOT NULL UNIQUE,
    format TEXT NOT NULL,
    coverPath TEXT,
    addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastReadAt DATETIME,
    progress REAL DEFAULT 0,
    progressLocator TEXT,
    progressUpdatedAt INTEGER,
    documentKind TEXT,
    ingestStatus TEXT,
    sourceFormat TEXT
  );
`);
const ee = (e, t) => {
  z.prepare("PRAGMA table_info(books)").all().some((o) => o.name === e) || z.exec(`ALTER TABLE books ADD COLUMN ${e} ${t}`);
};
ee("progressLocator", "TEXT");
ee("progressUpdatedAt", "INTEGER");
ee("documentKind", "TEXT");
ee("ingestStatus", "TEXT");
ee("sourceFormat", "TEXT");
z.exec(`
  CREATE TABLE IF NOT EXISTS annotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookId INTEGER NOT NULL,
    type TEXT NOT NULL,
    cfi TEXT,
    pageNumber INTEGER,
    text TEXT,
    note TEXT,
    color TEXT DEFAULT '#ffeb3b',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
  );
`);
z.exec(`
  CREATE INDEX IF NOT EXISTS idx_books_lastReadAt ON books(lastReadAt);
  CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
  CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
  CREATE INDEX IF NOT EXISTS idx_annotations_bookId ON annotations(bookId);
`);
const Y = w.join(Z.getPath("userData"), "covers");
R.mkdirSync(Y, { recursive: !0 });
async function $t(e, t) {
  try {
    const n = (await Promise.resolve().then(() => ge)).default, o = new n(e).getEntries(), s = [
      /cover\.(jpg|jpeg|png|gif)$/i,
      /cover-image\.(jpg|jpeg|png|gif)$/i,
      /images\/cover\.(jpg|jpeg|png|gif)$/i,
      /OEBPS\/images\/cover\.(jpg|jpeg|png|gif)$/i,
      /OPS\/images\/cover\.(jpg|jpeg|png|gif)$/i
    ], d = o.find((h) => h.entryName.endsWith(".opf"));
    if (d) {
      const h = d.getData().toString("utf-8"), I = h.match(/name="cover"\s+content="([^"]+)"/) || h.match(/properties="cover-image"[^>]*href="([^"]+)"/);
      if (I) {
        const D = I[1], C = h.match(new RegExp(`id="${D}"[^>]*href="([^"]+)"`)) || h.match(new RegExp(`href="([^"]+)"[^>]*id="${D}"`));
        if (C) {
          const T = C[1], a = w.dirname(d.entryName), l = a ? `${a}/${T}` : T, c = o.find(
            (u) => u.entryName === l || u.entryName.endsWith(T)
          );
          if (c) {
            const u = c.getData(), m = w.extname(c.entryName) || ".jpg", i = `${t}${m}`, f = w.join(Y, i);
            return await R.promises.writeFile(f, u), f;
          }
        }
      }
    }
    for (const h of s) {
      const I = o.find((D) => h.test(D.entryName));
      if (I) {
        const D = I.getData(), C = w.extname(I.entryName) || ".jpg", T = `${t}${C}`, a = w.join(Y, T);
        return await R.promises.writeFile(a, D), a;
      }
    }
    const g = o.find(
      (h) => /\.(jpg|jpeg|png|gif)$/i.test(h.entryName) && (h.entryName.toLowerCase().includes("cover") || h.entryName.toLowerCase().includes("title"))
    );
    if (g) {
      const h = g.getData(), I = w.extname(g.entryName) || ".jpg", D = `${t}${I}`, C = w.join(Y, D);
      return await R.promises.writeFile(C, h), C;
    }
    return null;
  } catch (n) {
    return console.error("Failed to extract EPUB cover:", n), null;
  }
}
async function Xt(e, t) {
  try {
    const n = await import("./pdf-CMEkdAEn.js"), r = await R.promises.readFile(e), o = new Uint8Array(r), d = await (await n.getDocument({ data: o }).promise).getPage(1), g = d.getViewport({ scale: 1 }), h = Math.min(400 / g.width, 1.5), I = d.getViewport({ scale: h }), D = Ke(I.width, I.height), C = D.getContext("2d");
    await d.render({
      canvasContext: C,
      viewport: I
    }).promise;
    const T = `${t}.png`, a = w.join(Y, T), l = D.toBuffer("image/png");
    return await R.promises.writeFile(a, l), a;
  } catch (n) {
    return console.error("Failed to extract PDF cover:", n), null;
  }
}
function Gt(e) {
  return e.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (t, n) => String.fromCharCode(Number(n)));
}
async function Vt(e) {
  const t = (await Promise.resolve().then(() => ge)).default, r = new t(e).getEntry("word/document.xml");
  if (!r)
    throw new Error("DOCX 内容缺失: word/document.xml");
  return r.getData().toString("utf-8").split(/<\/w:p>/i).map((d) => [...d.replace(/<w:tab\s*\/>/gi, "	").replace(/<w:br\s*\/>/gi, `
`).matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi)].map((D) => Gt(D[1])).join("").trim()).filter(Boolean).join(`

`);
}
async function Kt(e, t) {
  try {
    if (t === "epub") {
      const n = (await Promise.resolve().then(() => ge)).default, s = new n(e).getEntries().find((d) => d.entryName.endsWith(".opf"));
      if (s) {
        const d = s.getData().toString("utf-8"), g = d.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i), h = d.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
        return {
          title: g ? g[1].trim() : void 0,
          author: h ? h[1].trim() : void 0
        };
      }
    }
    if (t === "pdf") {
      const n = await import("./pdf-CMEkdAEn.js"), r = await R.promises.readFile(e), o = new Uint8Array(r), g = (await (await n.getDocument({ data: o }).promise).getMetadata()).info;
      return {
        title: (g == null ? void 0 : g.Title) || void 0,
        author: (g == null ? void 0 : g.Author) || void 0
      };
    }
  } catch (n) {
    console.error("Failed to extract metadata:", n);
  }
  return {};
}
function Wt(e) {
  if (e)
    try {
      return JSON.parse(e);
    } catch {
      return;
    }
}
function Ne(e) {
  const t = e.format || "txt";
  return {
    ...e,
    progressLocator: Wt(e.progressLocator),
    progressUpdatedAt: e.progressUpdatedAt ?? void 0,
    documentKind: e.documentKind || pe(t),
    ingestStatus: e.ingestStatus || "ready",
    sourceFormat: e.sourceFormat || t
  };
}
const Yt = z.prepare("SELECT * FROM books ORDER BY lastReadAt DESC"), qt = z.prepare(`
  SELECT * FROM books
  WHERE title LIKE ? OR author LIKE ?
  ORDER BY lastReadAt DESC
`), Jt = z.prepare(`
  UPDATE books
  SET progress = ?, progressLocator = ?, progressUpdatedAt = ?, lastReadAt = CURRENT_TIMESTAMP
  WHERE id = ?
`);
B.handle("read-file", async (e, t) => R.promises.readFile(t));
B.handle("read-file-buffer", async (e, t) => R.promises.readFile(t));
B.handle("file-exists", async (e, t) => {
  try {
    return await R.promises.access(t, R.constants.F_OK), !0;
  } catch {
    return !1;
  }
});
B.handle("open-external", async (e, t) => Oe.openExternal(t));
B.handle("open-user-data-folder", async () => Oe.openPath(Z.getPath("userData")));
B.handle("get-cover-url", async (e, t) => {
  if (!t) return null;
  try {
    return await R.promises.access(t, R.constants.F_OK), `file://${t.replace(/\\/g, "/")}`;
  } catch {
    return null;
  }
});
const $e = w.join(Z.getPath("userData"), "backgrounds");
R.mkdirSync($e, { recursive: !0 });
B.handle("select-background-image", async () => {
  const e = await Ae.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp"] }
    ]
  });
  if (e.canceled || e.filePaths.length === 0) return null;
  const t = e.filePaths[0], n = w.extname(t), r = `background-${xe.randomUUID()}${n}`, o = w.join($e, r);
  try {
    return await R.promises.copyFile(t, o), o;
  } catch (s) {
    return console.error("Failed to copy background image:", s), null;
  }
});
B.handle("get-background-image-url", async (e, t) => {
  if (!t) return null;
  try {
    return await R.promises.access(t, R.constants.F_OK), `file://${t.replace(/\\/g, "/")}`;
  } catch {
    return null;
  }
});
B.handle("open-file-dialog", async () => {
  const e = await Ae.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Books", extensions: [...jt()] }
    ]
  });
  if (e.canceled || e.filePaths.length === 0) return null;
  const t = e.filePaths[0], n = w.extname(t).toLowerCase(), r = ue(n), o = Zt(r);
  if (o.capability === "unsupported" || !o.targetFormat || !o.documentKind || !o.ingestStatus)
    return null;
  const s = w.basename(t, n), d = xe.randomUUID(), g = w.join(Z.getPath("userData"), "books");
  await R.promises.mkdir(g, { recursive: !0 });
  let h;
  if (o.requiresConversion && o.sourceFormat === "docx") {
    const a = `${s}-${d}.docx`, l = w.join(g, a);
    await R.promises.copyFile(t, l);
    const c = await Vt(l), u = `${s}-${d}.md`;
    h = w.join(g, u), await R.promises.writeFile(h, c, "utf-8");
  } else {
    const a = `${s}-${d}${n}`;
    h = w.join(g, a), await R.promises.copyFile(t, h);
  }
  const I = await Kt(h, o.targetFormat), D = I.title || s, C = I.author || null;
  let T = null;
  o.targetFormat === "epub" || o.targetFormat === "mobi" || o.targetFormat === "azw3" ? T = await $t(h, d) : o.targetFormat === "pdf" && (T = await Xt(h, d));
  try {
    const l = z.prepare(`
      INSERT INTO books (title, author, path, format, sourceFormat, documentKind, ingestStatus, coverPath) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(path) DO UPDATE SET lastReadAt = CURRENT_TIMESTAMP
      RETURNING *
    `).get(
      D,
      C,
      h,
      o.targetFormat,
      o.sourceFormat,
      o.documentKind,
      o.ingestStatus,
      T
    );
    return l ? Ne(l) : null;
  } catch (a) {
    return console.error("DB Insert Error:", a), null;
  }
});
B.handle("get-library", () => Yt.all().map(Ne));
B.handle("search-library", (e, t) => {
  const n = `%${t}%`;
  return qt.all(n, n).map(Ne);
});
B.handle("update-progress", (e, t, n, r, o) => {
  const s = typeof o == "number" ? o : Date.now(), d = r ? JSON.stringify(r) : null;
  Jt.run(n, d, s, t);
});
B.handle("delete-book", (e, t) => {
  try {
    const n = z.prepare("SELECT * FROM books WHERE id = ?").get(t);
    return n && (n.coverPath && R.promises.unlink(n.coverPath).catch(() => {
    }), n.path && R.promises.unlink(n.path).catch(() => {
    })), z.prepare("DELETE FROM books WHERE id = ?").run(t), !0;
  } catch (n) {
    return console.error("Delete book error:", n), !1;
  }
});
B.handle("get-annotations", (e, t) => z.prepare("SELECT * FROM annotations WHERE bookId = ? ORDER BY createdAt DESC").all(t));
B.handle("add-annotation", (e, t) => z.prepare(`
    INSERT INTO annotations (bookId, type, cfi, pageNumber, text, note, color)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).get(
  t.bookId,
  t.type,
  t.cfi || null,
  t.pageNumber || null,
  t.text || null,
  t.note || null,
  t.color || "#ffeb3b"
));
B.handle("update-annotation", (e, t, n) => {
  const r = [], o = [];
  return n.note !== void 0 && (r.push("note = ?"), o.push(n.note)), n.color !== void 0 && (r.push("color = ?"), o.push(n.color)), r.length === 0 ? null : (r.push("updatedAt = CURRENT_TIMESTAMP"), o.push(t), z.prepare(`UPDATE annotations SET ${r.join(", ")} WHERE id = ? RETURNING *`).get(...o));
});
B.handle("delete-annotation", (e, t) => {
  try {
    return z.prepare("DELETE FROM annotations WHERE id = ?").run(t), !0;
  } catch (n) {
    return console.error("Delete annotation error:", n), !1;
  }
});
B.handle("qa-load-book", async (e, t, n) => le.loadBookForQA(t, n));
B.handle("qa-ask", async (e, t) => le.askQuestion(t));
B.handle("qa-clear", async () => {
  le.clearQA();
});
B.handle("qa-get-status", async () => le.getStatus());
const Qt = Fe(import.meta.url), Xe = K.dirname(Qt);
process.env.DIST = K.join(Xe, "../dist");
process.env.VITE_PUBLIC = Z.isPackaged ? process.env.DIST : K.join(process.env.DIST, "../public");
let k;
const me = process.env.VITE_DEV_SERVER_URL;
function en(e) {
  e.webContents.on(
    "did-fail-load",
    (t, n, r, o, s) => {
      s && console.error(
        "[main] did-fail-load",
        JSON.stringify({ errorCode: n, errorDescription: r, validatedURL: o })
      );
    }
  ), e.webContents.on("render-process-gone", (t, n) => {
    console.error("[main] render-process-gone", JSON.stringify(n));
  });
}
function Ge() {
  if (k = new Re({
    icon: K.join(process.env.VITE_PUBLIC, "vite.svg"),
    webPreferences: {
      preload: K.join(Xe, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), en(k), k.webContents.on("did-finish-load", () => {
    k == null || k.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), me)
    console.log("[main] loading dev url:", me), k.loadURL(me), k.webContents.openDevTools({ mode: "detach" });
  else {
    const e = K.join(process.env.DIST, "index.html");
    console.log("[main] loading file:", e), k.loadFile(e);
  }
}
Z.on("window-all-closed", () => {
  process.platform !== "darwin" && Z.quit();
});
Z.on("activate", () => {
  Re.getAllWindows().length === 0 && Ge();
});
Z.whenReady().then(Ge);
