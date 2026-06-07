import { safeStorage as ae, app as z, ipcMain as v, shell as Pe, dialog as Be, BrowserWindow as Me } from "electron";
import V from "node:path";
import { fileURLToPath as Ne } from "node:url";
import nt from "better-sqlite3";
import be from "node:crypto";
import _ from "fs";
import T from "path";
import { createCanvas as rt } from "canvas";
import je from "zlib";
import ot from "crypto";
function st(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Q = { exports: {} }, He = {
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
}, le = {};
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
    return function(...s) {
      return s.length && (r = r.replace(/\{(\d)\}/g, (o, l) => s[l] || "")), new Error("ADM-ZIP: " + r);
    };
  }
  for (const r of Object.keys(t))
    e[r] = n(t[r]);
})(le);
const it = _, M = T, Ae = He, at = le, ct = typeof process == "object" && process.platform === "win32", we = (e) => typeof e == "object" && e !== null, $e = new Uint32Array(256).map((e, t) => {
  for (let n = 0; n < 8; n++)
    t & 1 ? t = 3988292384 ^ t >>> 1 : t >>>= 1;
  return t >>> 0;
});
function B(e) {
  this.sep = M.sep, this.fs = it, we(e) && we(e.fs) && typeof e.fs.statSync == "function" && (this.fs = e.fs);
}
var ft = B;
B.prototype.makeDir = function(e) {
  const t = this;
  function n(r) {
    let s = r.split(t.sep)[0];
    r.split(t.sep).forEach(function(o) {
      if (!(!o || o.substr(-1, 1) === ":")) {
        s += t.sep + o;
        var l;
        try {
          l = t.fs.statSync(s);
        } catch {
          t.fs.mkdirSync(s);
        }
        if (l && l.isFile()) throw at.FILE_IN_THE_WAY(`"${s}"`);
      }
    });
  }
  n(e);
};
B.prototype.writeFileTo = function(e, t, n, r) {
  const s = this;
  if (s.fs.existsSync(e)) {
    if (!n) return !1;
    var o = s.fs.statSync(e);
    if (o.isDirectory())
      return !1;
  }
  var l = M.dirname(e);
  s.fs.existsSync(l) || s.makeDir(l);
  var p;
  try {
    p = s.fs.openSync(e, "w", 438);
  } catch {
    s.fs.chmodSync(e, 438), p = s.fs.openSync(e, "w", 438);
  }
  if (p)
    try {
      s.fs.writeSync(p, t, 0, t.length, 0);
    } finally {
      s.fs.closeSync(p);
    }
  return s.fs.chmodSync(e, r || 438), !0;
};
B.prototype.writeFileToAsync = function(e, t, n, r, s) {
  typeof r == "function" && (s = r, r = void 0);
  const o = this;
  o.fs.exists(e, function(l) {
    if (l && !n) return s(!1);
    o.fs.stat(e, function(p, h) {
      if (l && h.isDirectory())
        return s(!1);
      var y = M.dirname(e);
      o.fs.exists(y, function(S) {
        S || o.makeDir(y), o.fs.open(e, "w", 438, function(D, C) {
          D ? o.fs.chmod(e, 438, function() {
            o.fs.open(e, "w", 438, function(a, u) {
              o.fs.write(u, t, 0, t.length, 0, function() {
                o.fs.close(u, function() {
                  o.fs.chmod(e, r || 438, function() {
                    s(!0);
                  });
                });
              });
            });
          }) : C ? o.fs.write(C, t, 0, t.length, 0, function() {
            o.fs.close(C, function() {
              o.fs.chmod(e, r || 438, function() {
                s(!0);
              });
            });
          }) : o.fs.chmod(e, r || 438, function() {
            s(!0);
          });
        });
      });
    });
  });
};
B.prototype.findFiles = function(e) {
  const t = this;
  function n(r, s, o) {
    let l = [];
    return t.fs.readdirSync(r).forEach(function(p) {
      const h = M.join(r, p), y = t.fs.statSync(h);
      l.push(M.normalize(h) + (y.isDirectory() ? t.sep : "")), y.isDirectory() && o && (l = l.concat(n(h, s, o)));
    }), l;
  }
  return n(e, void 0, !0);
};
B.prototype.findFilesAsync = function(e, t) {
  const n = this;
  let r = [];
  n.fs.readdir(e, function(s, o) {
    if (s) return t(s);
    let l = o.length;
    if (!l) return t(null, r);
    o.forEach(function(p) {
      p = M.join(e, p), n.fs.stat(p, function(h, y) {
        if (h) return t(h);
        y && (r.push(M.normalize(p) + (y.isDirectory() ? n.sep : "")), y.isDirectory() ? n.findFilesAsync(p, function(S, D) {
          if (S) return t(S);
          r = r.concat(D), --l || t(null, r);
        }) : --l || t(null, r));
      });
    });
  });
};
B.prototype.getAttributes = function() {
};
B.prototype.setAttributes = function() {
};
B.crc32update = function(e, t) {
  return $e[(e ^ t) & 255] ^ e >>> 8;
};
B.crc32 = function(e) {
  typeof e == "string" && (e = Buffer.from(e, "utf8"));
  let t = e.length, n = -1;
  for (let r = 0; r < t; ) n = B.crc32update(n, e[r++]);
  return ~n >>> 0;
};
B.methodToString = function(e) {
  switch (e) {
    case Ae.STORED:
      return "STORED (" + e + ")";
    case Ae.DEFLATED:
      return "DEFLATED (" + e + ")";
    default:
      return "UNSUPPORTED (" + e + ")";
  }
};
B.canonical = function(e) {
  if (!e) return "";
  const t = M.posix.normalize("/" + e.split("\\").join("/"));
  return M.join(".", t);
};
B.zipnamefix = function(e) {
  if (!e) return "";
  const t = M.posix.normalize("/" + e.split("\\").join("/"));
  return M.posix.join(".", t);
};
B.findLast = function(e, t) {
  if (!Array.isArray(e)) throw new TypeError("arr is not array");
  const n = e.length >>> 0;
  for (let r = n - 1; r >= 0; r--)
    if (t(e[r], r, e))
      return e[r];
};
B.sanitize = function(e, t) {
  e = M.resolve(M.normalize(e));
  for (var n = t.split("/"), r = 0, s = n.length; r < s; r++) {
    var o = M.normalize(M.join(e, n.slice(r, s).join(M.sep)));
    if (o.indexOf(e) === 0)
      return o;
  }
  return M.normalize(M.join(e, M.basename(t)));
};
B.toBuffer = function(t, n) {
  return Buffer.isBuffer(t) ? t : t instanceof Uint8Array ? Buffer.from(t) : typeof t == "string" ? n(t) : Buffer.alloc(0);
};
B.readBigUInt64LE = function(e, t) {
  var n = Buffer.from(e.slice(t, t + 8));
  return n.swap64(), parseInt(`0x${n.toString("hex")}`);
};
B.fromDOS2Date = function(e) {
  return new Date((e >> 25 & 127) + 1980, Math.max((e >> 21 & 15) - 1, 0), Math.max(e >> 16 & 31, 1), e >> 11 & 31, e >> 5 & 63, (e & 31) << 1);
};
B.fromDate2DOS = function(e) {
  let t = 0, n = 0;
  return e.getFullYear() > 1979 && (t = (e.getFullYear() - 1980 & 127) << 9 | e.getMonth() + 1 << 5 | e.getDate(), n = e.getHours() << 11 | e.getMinutes() << 5 | e.getSeconds() >> 1), t << 16 | n;
};
B.isWin = ct;
B.crcTable = $e;
const lt = T;
var ut = function(e, { fs: t }) {
  var n = e || "", r = o(), s = null;
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
  return n && t.existsSync(n) ? (s = t.statSync(n), r.directory = s.isDirectory(), r.mtime = s.mtime, r.atime = s.atime, r.executable = (73 & s.mode) !== 0, r.readonly = (128 & s.mode) === 0, r.hidden = lt.basename(n)[0] === ".") : console.warn("Invalid path: " + n), {
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
}, dt = {
  efs: !0,
  encode: (e) => Buffer.from(e, "utf8"),
  decode: (e) => e.toString("utf8")
};
Q.exports = ft;
Q.exports.Constants = He;
Q.exports.Errors = le;
Q.exports.FileAttr = ut;
Q.exports.decoder = dt;
var te = Q.exports, ue = {}, Z = te, I = Z.Constants, Et = function() {
  var e = 20, t = 10, n = 0, r = 0, s = 0, o = 0, l = 0, p = 0, h = 0, y = 0, S = 0, D = 0, C = 0, a = 0, u = 0;
  e |= Z.isWin ? 2560 : 768, n |= I.FLG_EFS;
  const c = {
    extraLen: 0
  }, d = (i) => Math.max(0, i) >>> 0, m = (i) => Math.max(0, i) & 255;
  return s = Z.fromDate2DOS(/* @__PURE__ */ new Date()), {
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
      return (n & I.FLG_EFS) > 0;
    },
    set flags_efs(i) {
      i ? n |= I.FLG_EFS : n &= ~I.FLG_EFS;
    },
    get flags_desc() {
      return (n & I.FLG_DESC) > 0;
    },
    set flags_desc(i) {
      i ? n |= I.FLG_DESC : n &= ~I.FLG_DESC;
    },
    get method() {
      return r;
    },
    set method(i) {
      switch (i) {
        case I.STORED:
          this.version = 10;
        case I.DEFLATED:
        default:
          this.version = 20;
      }
      r = i;
    },
    get time() {
      return Z.fromDOS2Date(this.timeval);
    },
    set time(i) {
      this.timeval = Z.fromDate2DOS(i);
    },
    get timeval() {
      return s;
    },
    set timeval(i) {
      s = d(i);
    },
    get timeHighByte() {
      return m(s >>> 8);
    },
    get crc() {
      return o;
    },
    set crc(i) {
      o = d(i);
    },
    get compressedSize() {
      return l;
    },
    set compressedSize(i) {
      l = d(i);
    },
    get size() {
      return p;
    },
    set size(i) {
      p = d(i);
    },
    get fileNameLength() {
      return h;
    },
    set fileNameLength(i) {
      h = i;
    },
    get extraLength() {
      return y;
    },
    set extraLength(i) {
      y = i;
    },
    get extraLocalLength() {
      return c.extraLen;
    },
    set extraLocalLength(i) {
      c.extraLen = i;
    },
    get commentLength() {
      return S;
    },
    set commentLength(i) {
      S = i;
    },
    get diskNumStart() {
      return D;
    },
    set diskNumStart(i) {
      D = d(i);
    },
    get inAttr() {
      return C;
    },
    set inAttr(i) {
      C = d(i);
    },
    get attr() {
      return a;
    },
    set attr(i) {
      a = d(i);
    },
    // get Unix file permissions
    get fileAttr() {
      return (a || 0) >> 16 & 4095;
    },
    get offset() {
      return u;
    },
    set offset(i) {
      u = d(i);
    },
    get encrypted() {
      return (n & I.FLG_ENC) === I.FLG_ENC;
    },
    get centralHeaderSize() {
      return I.CENHDR + h + y + S;
    },
    get realDataOffset() {
      return u + I.LOCHDR + c.fnameLen + c.extraLen;
    },
    get localHeader() {
      return c;
    },
    loadLocalHeaderFromBinary: function(i) {
      var f = i.slice(u, u + I.LOCHDR);
      if (f.readUInt32LE(0) !== I.LOCSIG)
        throw Z.Errors.INVALID_LOC();
      c.version = f.readUInt16LE(I.LOCVER), c.flags = f.readUInt16LE(I.LOCFLG), c.method = f.readUInt16LE(I.LOCHOW), c.time = f.readUInt32LE(I.LOCTIM), c.crc = f.readUInt32LE(I.LOCCRC), c.compressedSize = f.readUInt32LE(I.LOCSIZ), c.size = f.readUInt32LE(I.LOCLEN), c.fnameLen = f.readUInt16LE(I.LOCNAM), c.extraLen = f.readUInt16LE(I.LOCEXT);
      const E = u + I.LOCHDR + c.fnameLen, g = E + c.extraLen;
      return i.slice(E, g);
    },
    loadFromBinary: function(i) {
      if (i.length !== I.CENHDR || i.readUInt32LE(0) !== I.CENSIG)
        throw Z.Errors.INVALID_CEN();
      e = i.readUInt16LE(I.CENVEM), t = i.readUInt16LE(I.CENVER), n = i.readUInt16LE(I.CENFLG), r = i.readUInt16LE(I.CENHOW), s = i.readUInt32LE(I.CENTIM), o = i.readUInt32LE(I.CENCRC), l = i.readUInt32LE(I.CENSIZ), p = i.readUInt32LE(I.CENLEN), h = i.readUInt16LE(I.CENNAM), y = i.readUInt16LE(I.CENEXT), S = i.readUInt16LE(I.CENCOM), D = i.readUInt16LE(I.CENDSK), C = i.readUInt16LE(I.CENATT), a = i.readUInt32LE(I.CENATX), u = i.readUInt32LE(I.CENOFF);
    },
    localHeaderToBinary: function() {
      var i = Buffer.alloc(I.LOCHDR);
      return i.writeUInt32LE(I.LOCSIG, 0), i.writeUInt16LE(t, I.LOCVER), i.writeUInt16LE(n, I.LOCFLG), i.writeUInt16LE(r, I.LOCHOW), i.writeUInt32LE(s, I.LOCTIM), i.writeUInt32LE(o, I.LOCCRC), i.writeUInt32LE(l, I.LOCSIZ), i.writeUInt32LE(p, I.LOCLEN), i.writeUInt16LE(h, I.LOCNAM), i.writeUInt16LE(c.extraLen, I.LOCEXT), i;
    },
    centralHeaderToBinary: function() {
      var i = Buffer.alloc(I.CENHDR + h + y + S);
      return i.writeUInt32LE(I.CENSIG, 0), i.writeUInt16LE(e, I.CENVEM), i.writeUInt16LE(t, I.CENVER), i.writeUInt16LE(n, I.CENFLG), i.writeUInt16LE(r, I.CENHOW), i.writeUInt32LE(s, I.CENTIM), i.writeUInt32LE(o, I.CENCRC), i.writeUInt32LE(l, I.CENSIZ), i.writeUInt32LE(p, I.CENLEN), i.writeUInt16LE(h, I.CENNAM), i.writeUInt16LE(y, I.CENEXT), i.writeUInt16LE(S, I.CENCOM), i.writeUInt16LE(D, I.CENDSK), i.writeUInt16LE(C, I.CENATT), i.writeUInt32LE(a, I.CENATX), i.writeUInt32LE(u, I.CENOFF), i;
    },
    toJSON: function() {
      const i = function(f) {
        return f + " bytes";
      };
      return {
        made: e,
        version: t,
        flags: n,
        method: Z.methodToString(r),
        time: this.time,
        crc: "0x" + o.toString(16).toUpperCase(),
        compressedSize: i(l),
        size: i(p),
        fileNameLength: i(h),
        extraLength: i(y),
        commentLength: i(S),
        diskNumStart: D,
        inAttr: C,
        attr: a,
        offset: u,
        centralHeaderSize: i(I.CENHDR + h + y + S)
      };
    },
    toString: function() {
      return JSON.stringify(this.toJSON(), null, "	");
    }
  };
}, K = te, x = K.Constants, mt = function() {
  var e = 0, t = 0, n = 0, r = 0, s = 0;
  return {
    get diskEntries() {
      return e;
    },
    set diskEntries(o) {
      e = t = o;
    },
    get totalEntries() {
      return t;
    },
    set totalEntries(o) {
      t = e = o;
    },
    get size() {
      return n;
    },
    set size(o) {
      n = o;
    },
    get offset() {
      return r;
    },
    set offset(o) {
      r = o;
    },
    get commentLength() {
      return s;
    },
    set commentLength(o) {
      s = o;
    },
    get mainHeaderSize() {
      return x.ENDHDR + s;
    },
    loadFromBinary: function(o) {
      if ((o.length !== x.ENDHDR || o.readUInt32LE(0) !== x.ENDSIG) && (o.length < x.ZIP64HDR || o.readUInt32LE(0) !== x.ZIP64SIG))
        throw K.Errors.INVALID_END();
      o.readUInt32LE(0) === x.ENDSIG ? (e = o.readUInt16LE(x.ENDSUB), t = o.readUInt16LE(x.ENDTOT), n = o.readUInt32LE(x.ENDSIZ), r = o.readUInt32LE(x.ENDOFF), s = o.readUInt16LE(x.ENDCOM)) : (e = K.readBigUInt64LE(o, x.ZIP64SUB), t = K.readBigUInt64LE(o, x.ZIP64TOT), n = K.readBigUInt64LE(o, x.ZIP64SIZE), r = K.readBigUInt64LE(o, x.ZIP64OFF), s = 0);
    },
    toBinary: function() {
      var o = Buffer.alloc(x.ENDHDR + s);
      return o.writeUInt32LE(x.ENDSIG, 0), o.writeUInt32LE(0, 4), o.writeUInt16LE(e, x.ENDSUB), o.writeUInt16LE(t, x.ENDTOT), o.writeUInt32LE(n, x.ENDSIZ), o.writeUInt32LE(r, x.ENDOFF), o.writeUInt16LE(s, x.ENDCOM), o.fill(" ", x.ENDHDR), o;
    },
    toJSON: function() {
      const o = function(l, p) {
        let h = l.toString(16).toUpperCase();
        for (; h.length < p; ) h = "0" + h;
        return "0x" + h;
      };
      return {
        diskEntries: e,
        totalEntries: t,
        size: n + " bytes",
        offset: o(r, 4),
        commentLength: s
      };
    },
    toString: function() {
      return JSON.stringify(this.toJSON(), null, "	");
    }
  };
};
ue.EntryHeader = Et;
ue.MainHeader = mt;
var de = {}, pt = function(e) {
  var t = je, n = { chunkSize: (parseInt(e.length / 1024) + 1) * 1024 };
  return {
    deflate: function() {
      return t.deflateRawSync(e, n);
    },
    deflateAsync: function(r) {
      var s = t.createDeflateRaw(n), o = [], l = 0;
      s.on("data", function(p) {
        o.push(p), l += p.length;
      }), s.on("end", function() {
        var p = Buffer.alloc(l), h = 0;
        p.fill(0);
        for (var y = 0; y < o.length; y++) {
          var S = o[y];
          S.copy(p, h), h += S.length;
        }
        r && r(p);
      }), s.end(e);
    }
  };
};
const gt = +(process.versions ? process.versions.node : "").split(".")[0] || 0;
var ht = function(e, t) {
  var n = je;
  const r = gt >= 15 && t > 0 ? { maxOutputLength: t } : {};
  return {
    inflate: function() {
      return n.inflateRawSync(e, r);
    },
    inflateAsync: function(s) {
      var o = n.createInflateRaw(r), l = [], p = 0;
      o.on("data", function(h) {
        l.push(h), p += h.length;
      }), o.on("end", function() {
        var h = Buffer.alloc(p), y = 0;
        h.fill(0);
        for (var S = 0; S < l.length; S++) {
          var D = l[S];
          D.copy(h, y), y += D.length;
        }
        s && s(h);
      }), o.end(e);
    }
  };
};
const { randomFillSync: Oe } = ot, yt = le, It = new Uint32Array(256).map((e, t) => {
  for (let n = 0; n < 8; n++)
    t & 1 ? t = t >>> 1 ^ 3988292384 : t >>>= 1;
  return t >>> 0;
}), ze = (e, t) => Math.imul(e, t) >>> 0, Re = (e, t) => It[(e ^ t) & 255] ^ e >>> 8, J = () => typeof Oe == "function" ? Oe(Buffer.alloc(12)) : J.node();
J.node = () => {
  const e = Buffer.alloc(12), t = e.length;
  for (let n = 0; n < t; n++) e[n] = Math.random() * 256 & 255;
  return e;
};
const se = {
  genSalt: J
};
function Ee(e) {
  const t = Buffer.isBuffer(e) ? e : Buffer.from(e);
  this.keys = new Uint32Array([305419896, 591751049, 878082192]);
  for (let n = 0; n < t.length; n++)
    this.updateKeys(t[n]);
}
Ee.prototype.updateKeys = function(e) {
  const t = this.keys;
  return t[0] = Re(t[0], e), t[1] += t[0] & 255, t[1] = ze(t[1], 134775813) + 1, t[2] = Re(t[2], t[1] >>> 24), e;
};
Ee.prototype.next = function() {
  const e = (this.keys[2] | 2) >>> 0;
  return ze(e, e ^ 1) >> 8 & 255;
};
function Nt(e) {
  const t = new Ee(e);
  return function(n) {
    const r = Buffer.alloc(n.length);
    let s = 0;
    for (let o of n)
      r[s++] = t.updateKeys(o ^ t.next());
    return r;
  };
}
function St(e) {
  const t = new Ee(e);
  return function(n, r, s = 0) {
    r || (r = Buffer.alloc(n.length));
    for (let o of n) {
      const l = t.next();
      r[s++] = o ^ l, t.updateKeys(o);
    }
    return r;
  };
}
function Dt(e, t, n) {
  if (!e || !Buffer.isBuffer(e) || e.length < 12)
    return Buffer.alloc(0);
  const r = Nt(n), s = r(e.slice(0, 12)), o = (t.flags & 8) === 8 ? t.timeHighByte : t.crc >>> 24;
  if (s[11] !== o)
    throw yt.WRONG_PASSWORD();
  return r(e.slice(12));
}
function Lt(e) {
  Buffer.isBuffer(e) && e.length >= 12 ? se.genSalt = function() {
    return e.slice(0, 12);
  } : e === "node" ? se.genSalt = J.node : se.genSalt = J;
}
function Ct(e, t, n, r = !1) {
  e == null && (e = Buffer.alloc(0)), Buffer.isBuffer(e) || (e = Buffer.from(e.toString()));
  const s = St(n), o = se.genSalt();
  o[11] = t.crc >>> 24 & 255, r && (o[10] = t.crc >>> 16 & 255);
  const l = Buffer.alloc(e.length + 12);
  return s(o, l), s(e, l, 12);
}
var _t = { decrypt: Dt, encrypt: Ct, _salter: Lt };
de.Deflater = pt;
de.Inflater = ht;
de.ZipCrypto = _t;
var w = te, Tt = ue, U = w.Constants, he = de, ke = function(e, t) {
  var n = new Tt.EntryHeader(), r = Buffer.alloc(0), s = Buffer.alloc(0), o = !1, l = null, p = Buffer.alloc(0), h = Buffer.alloc(0), y = !0;
  const S = e, D = typeof S.decoder == "object" ? S.decoder : w.decoder;
  y = D.hasOwnProperty("efs") ? D.efs : !1;
  function C() {
    return !t || !(t instanceof Uint8Array) ? Buffer.alloc(0) : (h = n.loadLocalHeaderFromBinary(t), t.slice(n.realDataOffset, n.realDataOffset + n.compressedSize));
  }
  function a(f) {
    if (n.flags_desc) {
      const E = {}, g = n.realDataOffset + n.compressedSize;
      if (t.readUInt32LE(g) == U.LOCSIG || t.readUInt32LE(g) == U.CENSIG)
        throw w.Errors.DESCRIPTOR_NOT_EXIST();
      if (t.readUInt32LE(g) == U.EXTSIG)
        E.crc = t.readUInt32LE(g + U.EXTCRC), E.compressedSize = t.readUInt32LE(g + U.EXTSIZ), E.size = t.readUInt32LE(g + U.EXTLEN);
      else if (t.readUInt16LE(g + 12) === 19280)
        E.crc = t.readUInt32LE(g + U.EXTCRC - 4), E.compressedSize = t.readUInt32LE(g + U.EXTSIZ - 4), E.size = t.readUInt32LE(g + U.EXTLEN - 4);
      else
        throw w.Errors.DESCRIPTOR_UNKNOWN();
      if (E.compressedSize !== n.compressedSize || E.size !== n.size || E.crc !== n.crc)
        throw w.Errors.DESCRIPTOR_FAULTY();
      if (w.crc32(f) !== E.crc)
        return !1;
    } else if (w.crc32(f) !== n.localHeader.crc)
      return !1;
    return !0;
  }
  function u(f, E, g) {
    if (typeof E > "u" && typeof f == "string" && (g = f, f = void 0), o)
      return f && E && E(Buffer.alloc(0), w.Errors.DIRECTORY_CONTENT_ERROR()), Buffer.alloc(0);
    var N = C();
    if (N.length === 0)
      return f && E && E(N), N;
    if (n.encrypted) {
      if (typeof g != "string" && !Buffer.isBuffer(g))
        throw w.Errors.INVALID_PASS_PARAM();
      N = he.ZipCrypto.decrypt(N, n, g);
    }
    var L = Buffer.alloc(n.size);
    switch (n.method) {
      case w.Constants.STORED:
        if (N.copy(L), a(L))
          return f && E && E(L), L;
        throw f && E && E(L, w.Errors.BAD_CRC()), w.Errors.BAD_CRC();
      case w.Constants.DEFLATED:
        var O = new he.Inflater(N, n.size);
        if (f)
          O.inflateAsync(function(A) {
            A.copy(A, 0), E && (a(A) ? E(A) : E(A, w.Errors.BAD_CRC()));
          });
        else {
          if (O.inflate(L).copy(L, 0), !a(L))
            throw w.Errors.BAD_CRC(`"${D.decode(r)}"`);
          return L;
        }
        break;
      default:
        throw f && E && E(Buffer.alloc(0), w.Errors.UNKNOWN_METHOD()), w.Errors.UNKNOWN_METHOD();
    }
  }
  function c(f, E) {
    if ((!l || !l.length) && Buffer.isBuffer(t))
      return f && E && E(C()), C();
    if (l.length && !o) {
      var g;
      switch (n.method) {
        case w.Constants.STORED:
          return n.compressedSize = n.size, g = Buffer.alloc(l.length), l.copy(g), f && E && E(g), g;
        default:
        case w.Constants.DEFLATED:
          var N = new he.Deflater(l);
          if (f)
            N.deflateAsync(function(O) {
              g = Buffer.alloc(O.length), n.compressedSize = O.length, O.copy(g), E && E(g);
            });
          else {
            var L = N.deflate();
            return n.compressedSize = L.length, L;
          }
          N = null;
          break;
      }
    } else if (f && E)
      E(Buffer.alloc(0));
    else
      return Buffer.alloc(0);
  }
  function d(f, E) {
    return (f.readUInt32LE(E + 4) << 4) + f.readUInt32LE(E);
  }
  function m(f) {
    try {
      for (var E = 0, g, N, L; E + 4 < f.length; )
        g = f.readUInt16LE(E), E += 2, N = f.readUInt16LE(E), E += 2, L = f.slice(E, E + N), E += N, U.ID_ZIP64 === g && i(L);
    } catch {
      throw w.Errors.EXTRA_FIELD_PARSE_ERROR();
    }
  }
  function i(f) {
    var E, g, N, L;
    f.length >= U.EF_ZIP64_SCOMP && (E = d(f, U.EF_ZIP64_SUNCOMP), n.size === U.EF_ZIP64_OR_32 && (n.size = E)), f.length >= U.EF_ZIP64_RHO && (g = d(f, U.EF_ZIP64_SCOMP), n.compressedSize === U.EF_ZIP64_OR_32 && (n.compressedSize = g)), f.length >= U.EF_ZIP64_DSN && (N = d(f, U.EF_ZIP64_RHO), n.offset === U.EF_ZIP64_OR_32 && (n.offset = N)), f.length >= U.EF_ZIP64_DSN + 4 && (L = f.readUInt32LE(U.EF_ZIP64_DSN), n.diskNumStart === U.EF_ZIP64_OR_16 && (n.diskNumStart = L));
  }
  return {
    get entryName() {
      return D.decode(r);
    },
    get rawEntryName() {
      return r;
    },
    set entryName(f) {
      r = w.toBuffer(f, D.encode);
      var E = r[r.length - 1];
      o = E === 47 || E === 92, n.fileNameLength = r.length;
    },
    get efs() {
      return typeof y == "function" ? y(this.entryName) : y;
    },
    get extra() {
      return p;
    },
    set extra(f) {
      p = f, n.extraLength = f.length, m(f);
    },
    get comment() {
      return D.decode(s);
    },
    set comment(f) {
      if (s = w.toBuffer(f, D.encode), n.commentLength = s.length, s.length > 65535) throw w.Errors.COMMENT_TOO_LONG();
    },
    get name() {
      var f = D.decode(r);
      return o ? f.substr(f.length - 1).split("/").pop() : f.split("/").pop();
    },
    get isDirectory() {
      return o;
    },
    getCompressedData: function() {
      return c(!1, null);
    },
    getCompressedDataAsync: function(f) {
      c(!0, f);
    },
    setData: function(f) {
      l = w.toBuffer(f, w.decoder.encode), !o && l.length ? (n.size = l.length, n.method = w.Constants.DEFLATED, n.crc = w.crc32(f), n.changed = !0) : n.method = w.Constants.STORED;
    },
    getData: function(f) {
      return n.changed ? l : u(!1, null, f);
    },
    getDataAsync: function(f, E) {
      n.changed ? f(l) : u(!0, f, E);
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
      n.flags_efs = this.efs, n.extraLength = p.length;
      var f = n.centralHeaderToBinary(), E = w.Constants.CENHDR;
      return r.copy(f, E), E += r.length, p.copy(f, E), E += n.extraLength, s.copy(f, E), f;
    },
    packLocalHeader: function() {
      let f = 0;
      n.flags_efs = this.efs, n.extraLocalLength = h.length;
      const E = n.localHeaderToBinary(), g = Buffer.alloc(E.length + r.length + n.extraLocalLength);
      return E.copy(g, f), f += E.length, r.copy(g, f), f += r.length, h.copy(g, f), f += h.length, g;
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
        data: f(l)
      };
    },
    toString: function() {
      return JSON.stringify(this.toJSON(), null, "	");
    }
  };
};
const ve = ke, At = ue, b = te;
var wt = function(e, t) {
  var n = [], r = {}, s = Buffer.alloc(0), o = new At.MainHeader(), l = !1;
  const p = /* @__PURE__ */ new Set(), h = t, { noSort: y, decoder: S } = h;
  e ? a(h.readEntries) : l = !0;
  function D() {
    const c = /* @__PURE__ */ new Set();
    for (const d of Object.keys(r)) {
      const m = d.split("/");
      if (m.pop(), !!m.length)
        for (let i = 0; i < m.length; i++) {
          const f = m.slice(0, i + 1).join("/") + "/";
          c.add(f);
        }
    }
    for (const d of c)
      if (!(d in r)) {
        const m = new ve(h);
        m.entryName = d, m.attr = 16, m.temporary = !0, n.push(m), r[m.entryName] = m, p.add(m);
      }
  }
  function C() {
    if (l = !0, r = {}, o.diskEntries > (e.length - o.offset) / b.Constants.CENHDR)
      throw b.Errors.DISK_ENTRY_TOO_LARGE();
    n = new Array(o.diskEntries);
    for (var c = o.offset, d = 0; d < n.length; d++) {
      var m = c, i = new ve(h, e);
      i.header = e.slice(m, m += b.Constants.CENHDR), i.entryName = e.slice(m, m += i.header.fileNameLength), i.header.extraLength && (i.extra = e.slice(m, m += i.header.extraLength)), i.header.commentLength && (i.comment = e.slice(m, m + i.header.commentLength)), c += i.header.centralHeaderSize, n[d] = i, r[i.entryName] = i;
    }
    p.clear(), D();
  }
  function a(c) {
    var d = e.length - b.Constants.ENDHDR, m = Math.max(0, d - 65535), i = m, f = e.length, E = -1, g = 0;
    for ((typeof h.trailingSpace == "boolean" ? h.trailingSpace : !1) && (m = 0), d; d >= i; d--)
      if (e[d] === 80) {
        if (e.readUInt32LE(d) === b.Constants.ENDSIG) {
          E = d, g = d, f = d + b.Constants.ENDHDR, i = d - b.Constants.END64HDR;
          continue;
        }
        if (e.readUInt32LE(d) === b.Constants.END64SIG) {
          i = m;
          continue;
        }
        if (e.readUInt32LE(d) === b.Constants.ZIP64SIG) {
          E = d, f = d + b.readBigUInt64LE(e, d + b.Constants.ZIP64SIZE) + b.Constants.ZIP64LEAD;
          break;
        }
      }
    if (E == -1) throw b.Errors.INVALID_FORMAT();
    o.loadFromBinary(e.slice(E, f)), o.commentLength && (s = e.slice(g + b.Constants.ENDHDR)), c && C();
  }
  function u() {
    n.length > 1 && !y && n.sort((c, d) => c.entryName.toLowerCase().localeCompare(d.entryName.toLowerCase()));
  }
  return {
    /**
     * Returns an array of ZipEntry objects existent in the current opened archive
     * @return Array
     */
    get entries() {
      return l || C(), n.filter((c) => !p.has(c));
    },
    /**
     * Archive comment
     * @return {String}
     */
    get comment() {
      return S.decode(s);
    },
    set comment(c) {
      s = b.toBuffer(c, S.encode), o.commentLength = s.length;
    },
    getEntryCount: function() {
      return l ? n.length : o.diskEntries;
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
      return l || C(), r[c] || null;
    },
    /**
     * Adds the given entry to the entry list
     *
     * @param entry
     */
    setEntry: function(c) {
      l || C(), n.push(c), r[c.entryName] = c, o.totalEntries = n.length;
    },
    /**
     * Removes the file with the given name from the entry list.
     *
     * If the entry is a directory, then all nested files and directories will be removed
     * @param entryName
     * @returns {void}
     */
    deleteFile: function(c, d = !0) {
      l || C();
      const m = r[c];
      this.getEntryChildren(m, d).map((f) => f.entryName).forEach(this.deleteEntry);
    },
    /**
     * Removes the entry with the given name from the entry list.
     *
     * @param {string} entryName
     * @returns {void}
     */
    deleteEntry: function(c) {
      l || C();
      const d = r[c], m = n.indexOf(d);
      m >= 0 && (n.splice(m, 1), delete r[c], o.totalEntries = n.length);
    },
    /**
     *  Iterates and returns all nested files and directories of the given entry
     *
     * @param entry
     * @return Array
     */
    getEntryChildren: function(c, d = !0) {
      if (l || C(), typeof c == "object")
        if (c.isDirectory && d) {
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
        const d = this.getEntryChildren(c);
        return d.includes(c) ? d.length - 1 : d.length;
      }
      return 0;
    },
    /**
     * Returns the zip file
     *
     * @return Buffer
     */
    compressToBuffer: function() {
      l || C(), u();
      const c = [], d = [];
      let m = 0, i = 0;
      o.size = 0, o.offset = 0;
      let f = 0;
      for (const N of this.entries) {
        const L = N.getCompressedData();
        N.header.offset = i;
        const O = N.packLocalHeader(), A = O.length + L.length;
        i += A, c.push(O), c.push(L);
        const R = N.packCentralHeader();
        d.push(R), o.size += R.length, m += A + R.length, f++;
      }
      m += o.mainHeaderSize, o.offset = i, o.totalEntries = f, i = 0;
      const E = Buffer.alloc(m);
      for (const N of c)
        N.copy(E, i), i += N.length;
      for (const N of d)
        N.copy(E, i), i += N.length;
      const g = o.toBinary();
      return s && s.copy(g, b.Constants.ENDHDR), g.copy(E, i), e = E, l = !1, E;
    },
    toAsyncBuffer: function(c, d, m, i) {
      try {
        l || C(), u();
        const f = [], E = [];
        let g = 0, N = 0, L = 0;
        o.size = 0, o.offset = 0;
        const O = function(A) {
          if (A.length > 0) {
            const R = A.shift(), j = R.entryName + R.extra.toString();
            m && m(j), R.getCompressedDataAsync(function($) {
              i && i(j), R.header.offset = N;
              const X = R.packLocalHeader(), oe = X.length + $.length;
              N += oe, f.push(X), f.push($);
              const ge = R.packCentralHeader();
              E.push(ge), o.size += ge.length, g += oe + ge.length, L++, O(A);
            });
          } else {
            g += o.mainHeaderSize, o.offset = N, o.totalEntries = L, N = 0;
            const R = Buffer.alloc(g);
            f.forEach(function($) {
              $.copy(R, N), N += $.length;
            }), E.forEach(function($) {
              $.copy(R, N), N += $.length;
            });
            const j = o.toBinary();
            s && s.copy(j, b.Constants.ENDHDR), j.copy(R, N), e = R, l = !1, c(R);
          }
        };
        O(Array.from(this.entries));
      } catch (f) {
        d(f);
      }
    }
  };
};
const F = te, P = T, Ot = ke, Rt = wt, G = (...e) => F.findLast(e, (t) => typeof t == "boolean"), xe = (...e) => F.findLast(e, (t) => typeof t == "string"), vt = (...e) => F.findLast(e, (t) => typeof t == "function"), xt = {
  // option "noSort" : if true it disables files sorting
  noSort: !1,
  // read entries during load (initial loading may be slower)
  readEntries: !1,
  // default method is none
  method: F.Constants.NONE,
  // file system
  fs: null
};
var Ft = function(e, t) {
  let n = null;
  const r = Object.assign(/* @__PURE__ */ Object.create(null), xt);
  e && typeof e == "object" && (e instanceof Uint8Array || (Object.assign(r, e), e = r.input ? r.input : void 0, r.input && delete r.input), Buffer.isBuffer(e) && (n = e, r.method = F.Constants.BUFFER, e = void 0)), Object.assign(r, t);
  const s = new F(r);
  if ((typeof r.decoder != "object" || typeof r.decoder.encode != "function" || typeof r.decoder.decode != "function") && (r.decoder = F.decoder), e && typeof e == "string")
    if (s.fs.existsSync(e))
      r.method = F.Constants.FILE, r.filename = e, n = s.fs.readFileSync(e);
    else
      throw F.Errors.INVALID_FILENAME();
  const o = new Rt(n, r), { canonical: l, sanitize: p, zipnamefix: h } = F;
  function y(a) {
    if (a && o) {
      var u;
      if (typeof a == "string" && (u = o.getEntry(P.posix.normalize(a))), typeof a == "object" && typeof a.entryName < "u" && typeof a.header < "u" && (u = o.getEntry(a.entryName)), u)
        return u;
    }
    return null;
  }
  function S(a) {
    const { join: u, normalize: c, sep: d } = P.posix;
    return u(".", c(d + a.split("\\").join(d) + d));
  }
  function D(a) {
    return a instanceof RegExp ? /* @__PURE__ */ function(u) {
      return function(c) {
        return u.test(c);
      };
    }(a) : typeof a != "function" ? () => !0 : a;
  }
  const C = (a, u) => {
    let c = u.slice(-1);
    return c = c === s.sep ? s.sep : "", P.relative(a, u) + c;
  };
  return {
    /**
     * Extracts the given entry from the archive and returns the content as a Buffer object
     * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
     * @param {Buffer|string} [pass] - password
     * @return Buffer or Null in case of error
     */
    readFile: function(a, u) {
      var c = y(a);
      return c && c.getData(u) || null;
    },
    /**
     * Returns how many child elements has on entry (directories) on files it is always 0
     * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
     * @returns {integer}
     */
    childCount: function(a) {
      const u = y(a);
      if (u)
        return o.getChildCount(u);
    },
    /**
     * Asynchronous readFile
     * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
     * @param {callback} callback
     *
     * @return Buffer or Null in case of error
     */
    readFileAsync: function(a, u) {
      var c = y(a);
      c ? c.getDataAsync(u) : u(null, "getEntry failed for:" + a);
    },
    /**
     * Extracts the given entry from the archive and returns the content as plain text in the given encoding
     * @param {ZipEntry|string} entry - ZipEntry object or String with the full path of the entry
     * @param {string} encoding - Optional. If no encoding is specified utf8 is used
     *
     * @return String
     */
    readAsText: function(a, u) {
      var c = y(a);
      if (c) {
        var d = c.getData();
        if (d && d.length)
          return d.toString(u || "utf8");
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
    readAsTextAsync: function(a, u, c) {
      var d = y(a);
      d ? d.getDataAsync(function(m, i) {
        if (i) {
          u(m, i);
          return;
        }
        m && m.length ? u(m.toString(c || "utf8")) : u("");
      }) : u("");
    },
    /**
     * Remove the entry from the file or the entry and all it's nested directories and files if the given entry is a directory
     *
     * @param {ZipEntry|string} entry
     * @returns {void}
     */
    deleteFile: function(a, u = !0) {
      var c = y(a);
      c && o.deleteFile(c.entryName, u);
    },
    /**
     * Remove the entry from the file or directory without affecting any nested entries
     *
     * @param {ZipEntry|string} entry
     * @returns {void}
     */
    deleteEntry: function(a) {
      var u = y(a);
      u && o.deleteEntry(u.entryName);
    },
    /**
     * Adds a comment to the zip. The zip must be rewritten after adding the comment.
     *
     * @param {string} comment
     */
    addZipComment: function(a) {
      o.comment = a;
    },
    /**
     * Returns the zip comment
     *
     * @return String
     */
    getZipComment: function() {
      return o.comment || "";
    },
    /**
     * Adds a comment to a specified zipEntry. The zip must be rewritten after adding the comment
     * The comment cannot exceed 65535 characters in length
     *
     * @param {ZipEntry} entry
     * @param {string} comment
     */
    addZipEntryComment: function(a, u) {
      var c = y(a);
      c && (c.comment = u);
    },
    /**
     * Returns the comment of the specified entry
     *
     * @param {ZipEntry} entry
     * @return String
     */
    getZipEntryComment: function(a) {
      var u = y(a);
      return u && u.comment || "";
    },
    /**
     * Updates the content of an existing entry inside the archive. The zip must be rewritten after updating the content
     *
     * @param {ZipEntry} entry
     * @param {Buffer} content
     */
    updateFile: function(a, u) {
      var c = y(a);
      c && c.setData(u);
    },
    /**
     * Adds a file from the disk to the archive
     *
     * @param {string} localPath File to add to zip
     * @param {string} [zipPath] Optional path inside the zip
     * @param {string} [zipName] Optional name for the file
     * @param {string} [comment] Optional file comment
     */
    addLocalFile: function(a, u, c, d) {
      if (s.fs.existsSync(a)) {
        u = u ? S(u) : "";
        const m = P.win32.basename(P.win32.normalize(a));
        u += c || m;
        const i = s.fs.statSync(a), f = i.isFile() ? s.fs.readFileSync(a) : Buffer.alloc(0);
        i.isDirectory() && (u += s.sep), this.addFile(u, f, d, i);
      } else
        throw F.Errors.FILE_NOT_FOUND(a);
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
    addLocalFileAsync: function(a, u) {
      a = typeof a == "object" ? a : { localPath: a };
      const c = P.resolve(a.localPath), { comment: d } = a;
      let { zipPath: m, zipName: i } = a;
      const f = this;
      s.fs.stat(c, function(E, g) {
        if (E) return u(E, !1);
        m = m ? S(m) : "";
        const N = P.win32.basename(P.win32.normalize(c));
        if (m += i || N, g.isFile())
          s.fs.readFile(c, function(L, O) {
            return L ? u(L, !1) : (f.addFile(m, O, d, g), setImmediate(u, void 0, !0));
          });
        else if (g.isDirectory())
          return m += s.sep, f.addFile(m, Buffer.alloc(0), d, g), setImmediate(u, void 0, !0);
      });
    },
    /**
     * Adds a local directory and all its nested files and directories to the archive
     *
     * @param {string} localPath - local path to the folder
     * @param {string} [zipPath] - optional path inside zip
     * @param {(RegExp|function)} [filter] - optional RegExp or Function if files match will be included.
     */
    addLocalFolder: function(a, u, c) {
      if (c = D(c), u = u ? S(u) : "", a = P.normalize(a), s.fs.existsSync(a)) {
        const d = s.findFiles(a), m = this;
        if (d.length)
          for (const i of d) {
            const f = P.join(u, C(a, i));
            c(f) && m.addLocalFile(i, P.dirname(f));
          }
      } else
        throw F.Errors.FILE_NOT_FOUND(a);
    },
    /**
     * Asynchronous addLocalFolder
     * @param {string} localPath
     * @param {callback} callback
     * @param {string} [zipPath] optional path inside zip
     * @param {RegExp|function} [filter] optional RegExp or Function if files match will
     *               be included.
     */
    addLocalFolderAsync: function(a, u, c, d) {
      d = D(d), c = c ? S(c) : "", a = P.normalize(a);
      var m = this;
      s.fs.open(a, "r", function(i) {
        if (i && i.code === "ENOENT")
          u(void 0, F.Errors.FILE_NOT_FOUND(a));
        else if (i)
          u(void 0, i);
        else {
          var f = s.findFiles(a), E = -1, g = function() {
            if (E += 1, E < f.length) {
              var N = f[E], L = C(a, N).split("\\").join("/");
              L = L.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, ""), d(L) ? s.fs.stat(N, function(O, A) {
                O && u(void 0, O), A.isFile() ? s.fs.readFile(N, function(R, j) {
                  R ? u(void 0, R) : (m.addFile(c + L, j, "", A), g());
                }) : (m.addFile(c + L + "/", Buffer.alloc(0), "", A), g());
              }) : process.nextTick(() => {
                g();
              });
            } else
              u(!0, void 0);
          };
          g();
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
    addLocalFolderAsync2: function(a, u) {
      const c = this;
      a = typeof a == "object" ? a : { localPath: a }, localPath = P.resolve(S(a.localPath));
      let { zipPath: d, filter: m, namefix: i } = a;
      m instanceof RegExp ? m = /* @__PURE__ */ function(g) {
        return function(N) {
          return g.test(N);
        };
      }(m) : typeof m != "function" && (m = function() {
        return !0;
      }), d = d ? S(d) : "", i == "latin1" && (i = (g) => g.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "")), typeof i != "function" && (i = (g) => g);
      const f = (g) => P.join(d, i(C(localPath, g))), E = (g) => P.win32.basename(P.win32.normalize(i(g)));
      s.fs.open(localPath, "r", function(g) {
        g && g.code === "ENOENT" ? u(void 0, F.Errors.FILE_NOT_FOUND(localPath)) : g ? u(void 0, g) : s.findFilesAsync(localPath, function(N, L) {
          if (N) return u(N);
          L = L.filter((O) => m(f(O))), L.length || u(void 0, !1), setImmediate(
            L.reverse().reduce(function(O, A) {
              return function(R, j) {
                if (R || j === !1) return setImmediate(O, R, !1);
                c.addLocalFileAsync(
                  {
                    localPath: A,
                    zipPath: P.dirname(f(A)),
                    zipName: E(A)
                  },
                  O
                );
              };
            }, u)
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
    addLocalFolderPromise: function(a, u) {
      return new Promise((c, d) => {
        this.addLocalFolderAsync2(Object.assign({ localPath: a }, u), (m, i) => {
          m && d(m), i && c(this);
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
    addFile: function(a, u, c, d) {
      a = h(a);
      let m = y(a);
      const i = m != null;
      i || (m = new Ot(r), m.entryName = a), m.comment = c || "";
      const f = typeof d == "object" && d instanceof s.fs.Stats;
      f && (m.header.time = d.mtime);
      var E = m.isDirectory ? 16 : 0;
      let g = m.isDirectory ? 16384 : 32768;
      return f ? g |= 4095 & d.mode : typeof d == "number" ? g |= 4095 & d : g |= m.isDirectory ? 493 : 420, E = (E | g << 16) >>> 0, m.attr = E, m.setData(u), i || o.setEntry(m), m;
    },
    /**
     * Returns an array of ZipEntry objects representing the files and folders inside the archive
     *
     * @param {string} [password]
     * @returns Array
     */
    getEntries: function(a) {
      return o.password = a, o ? o.entries : [];
    },
    /**
     * Returns a ZipEntry object representing the file or folder specified by ``name``.
     *
     * @param {string} name
     * @return ZipEntry
     */
    getEntry: function(a) {
      return y(a);
    },
    getEntryCount: function() {
      return o.getEntryCount();
    },
    forEach: function(a) {
      return o.forEach(a);
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
    extractEntryTo: function(a, u, c, d, m, i) {
      d = G(!1, d), m = G(!1, m), c = G(!0, c), i = xe(m, i);
      var f = y(a);
      if (!f)
        throw F.Errors.NO_ENTRY();
      var E = l(f.entryName), g = p(u, i && !f.isDirectory ? i : c ? E : P.basename(E));
      if (f.isDirectory) {
        var N = o.getEntryChildren(f);
        return N.forEach(function(A) {
          if (A.isDirectory) return;
          var R = A.getData();
          if (!R)
            throw F.Errors.CANT_EXTRACT_FILE();
          var j = l(A.entryName), $ = p(u, c ? j : P.basename(j));
          const X = m ? A.header.fileAttr : void 0;
          s.writeFileTo($, R, d, X);
        }), !0;
      }
      var L = f.getData(o.password);
      if (!L) throw F.Errors.CANT_EXTRACT_FILE();
      if (s.fs.existsSync(g) && !d)
        throw F.Errors.CANT_OVERRIDE();
      const O = m ? a.header.fileAttr : void 0;
      return s.writeFileTo(g, L, d, O), !0;
    },
    /**
     * Test the archive
     * @param {string} [pass]
     */
    test: function(a) {
      if (!o)
        return !1;
      for (var u in o.entries)
        try {
          if (u.isDirectory)
            continue;
          var c = o.entries[u].getData(a);
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
    extractAllTo: function(a, u, c, d) {
      if (c = G(!1, c), d = xe(c, d), u = G(!1, u), !o) throw F.Errors.NO_ZIP();
      o.entries.forEach(function(m) {
        var i = p(a, l(m.entryName));
        if (m.isDirectory) {
          s.makeDir(i);
          return;
        }
        var f = m.getData(d);
        if (!f)
          throw F.Errors.CANT_EXTRACT_FILE();
        const E = c ? m.header.fileAttr : void 0;
        s.writeFileTo(i, f, u, E);
        try {
          s.fs.utimesSync(i, m.header.time, m.header.time);
        } catch {
          throw F.Errors.CANT_EXTRACT_FILE();
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
    extractAllToAsync: function(a, u, c, d) {
      if (d = vt(u, c, d), c = G(!1, c), u = G(!1, u), !d)
        return new Promise((g, N) => {
          this.extractAllToAsync(a, u, c, function(L) {
            L ? N(L) : g(this);
          });
        });
      if (!o) {
        d(F.Errors.NO_ZIP());
        return;
      }
      a = P.resolve(a);
      const m = (g) => p(a, P.normalize(l(g.entryName))), i = (g, N) => new Error(g + ': "' + N + '"'), f = [], E = [];
      o.entries.forEach((g) => {
        g.isDirectory ? f.push(g) : E.push(g);
      });
      for (const g of f) {
        const N = m(g), L = c ? g.header.fileAttr : void 0;
        try {
          s.makeDir(N), L && s.fs.chmodSync(N, L), s.fs.utimesSync(N, g.header.time, g.header.time);
        } catch {
          d(i("Unable to create folder", N));
        }
      }
      E.reverse().reduce(function(g, N) {
        return function(L) {
          if (L)
            g(L);
          else {
            const O = P.normalize(l(N.entryName)), A = p(a, O);
            N.getDataAsync(function(R, j) {
              if (j)
                g(j);
              else if (!R)
                g(F.Errors.CANT_EXTRACT_FILE());
              else {
                const $ = c ? N.header.fileAttr : void 0;
                s.writeFileToAsync(A, R, u, $, function(X) {
                  X || g(i("Unable to write file", A)), s.fs.utimes(A, N.header.time, N.header.time, function(oe) {
                    oe ? g(i("Unable to set times", A)) : g();
                  });
                });
              }
            });
          }
        };
      }, d)();
    },
    /**
     * Writes the newly created zip file to disk at the specified location or if a zip was opened and no ``targetFileName`` is provided, it will overwrite the opened zip
     *
     * @param {string} targetFileName
     * @param {function} callback
     */
    writeZip: function(a, u) {
      if (arguments.length === 1 && typeof a == "function" && (u = a, a = ""), !a && r.filename && (a = r.filename), !!a) {
        var c = o.compressToBuffer();
        if (c) {
          var d = s.writeFileTo(a, c, !0);
          typeof u == "function" && u(d ? null : new Error("failed"), "");
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
    writeZipPromise: function(a, u) {
      const { overwrite: c, perm: d } = Object.assign({ overwrite: !0 }, u);
      return new Promise((m, i) => {
        !a && r.filename && (a = r.filename), a || i("ADM-ZIP: ZIP File Name Missing"), this.toBufferPromise().then((f) => {
          const E = (g) => g ? m(g) : i("ADM-ZIP: Wasn't able to write zip file");
          s.writeFileToAsync(a, f, c, d, E);
        }, i);
      });
    },
    /**
     * @returns {Promise<Buffer>} A promise to the Buffer.
     */
    toBufferPromise: function() {
      return new Promise((a, u) => {
        o.toAsyncBuffer(a, u);
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
    toBuffer: function(a, u, c, d) {
      return typeof a == "function" ? (o.toAsyncBuffer(a, u, c, d), null) : o.compressToBuffer();
    }
  };
};
const Ze = /* @__PURE__ */ st(Ft), Se = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ze
}, Symbol.toStringTag, { value: "Module" })), Ut = Ne(import.meta.url), Pt = T.dirname(Ut);
function De() {
  return process.env.NODE_ENV === "test" ? T.join(Pt, "../tmp-test-credentials.enc") : T.join(z.getPath("userData"), "credentials.enc");
}
async function Bt(e) {
  if (!ae.isEncryptionAvailable())
    throw console.warn("[SecureStore] Encryption not available, credentials will not be saved"), new Error("Encryption not available on this system");
  try {
    const t = JSON.stringify(e), n = ae.encryptString(t);
    _.writeFileSync(De(), n), console.log("[SecureStore] Credentials saved securely");
  } catch (t) {
    throw console.error("[SecureStore] Failed to save credentials:", t), new Error("Failed to save credentials securely");
  }
}
function ne() {
  const e = De();
  if (_.existsSync(e))
    try {
      if (!ae.isEncryptionAvailable())
        return console.warn("[SecureStore] Encryption not available, cannot decrypt credentials"), null;
      const t = _.readFileSync(e), n = ae.decryptString(t), r = JSON.parse(n);
      return console.log("[SecureStore] Credentials loaded from secure storage"), r;
    } catch (t) {
      return console.error("[SecureStore] Failed to load credentials:", t), null;
    }
  return null;
}
function Ge() {
  const e = ne();
  return e != null && e.qaApiKey ? e.qaApiKey : process.env.QA_API_KEY || process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY || "";
}
function Xe(e) {
  const t = ne();
  return t != null && t.qaBaseUrl ? t.qaBaseUrl : process.env.QA_BASE_URL ? process.env.QA_BASE_URL : process.env.OPENROUTER_BASE_URL ? process.env.OPENROUTER_BASE_URL : e === "anthropic" ? "https://api.minimax.io/anthropic" : "https://openrouter.ai/api/v1";
}
function Mt(e, t) {
  return e === "anthropic" ? "MiniMax-M2.7" : t != null && t.includes("openrouter.ai") ? "google/gemini-2.0-flash-thinking-exp:free" : "gpt-3.5-turbo";
}
function bt(e) {
  const t = ne();
  if (t != null && t.qaModel)
    return t.qaModel;
  if (process.env.QA_MODEL) return process.env.QA_MODEL;
  const n = (t == null ? void 0 : t.qaBaseUrl) || Xe(e);
  return Mt(e, n);
}
function jt() {
  const e = ne();
  return e != null && e.qaApiStyle ? e.qaApiStyle : (process.env.QA_API_STYLE || "").toLowerCase() === "anthropic" ? "anthropic" : "openai";
}
function Ht() {
  try {
    const e = De();
    _.existsSync(e) && (_.unlinkSync(e), console.log("[SecureStore] Credentials cleared"));
  } catch (e) {
    console.error("[SecureStore] Failed to clear credentials:", e);
  }
}
function $t() {
  return Ge().length > 0;
}
const zt = Ne(import.meta.url), Fe = T.dirname(zt);
function ee() {
  return process.env.NODE_ENV === "test" ? (process.env.QA_API_STYLE || "").toLowerCase() === "anthropic" ? "anthropic" : "openai" : jt();
}
function Le() {
  return process.env.NODE_ENV === "test" ? process.env.QA_API_KEY || process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY || "" : Ge();
}
function Ce() {
  return process.env.NODE_ENV === "test" ? process.env.QA_BASE_URL ? process.env.QA_BASE_URL : process.env.OPENROUTER_BASE_URL ? process.env.OPENROUTER_BASE_URL : ee() === "anthropic" ? "https://api.minimax.io/anthropic" : "https://openrouter.ai/api/v1" : Xe(ee());
}
function Ke() {
  return process.env.NODE_ENV === "test" ? process.env.QA_MODEL ? process.env.QA_MODEL : ee() === "anthropic" ? "MiniMax-M2.7" : Ce().includes("openrouter.ai") ? "google/gemini-2.0-flash-thinking-exp:free" : "gpt-3.5-turbo" : bt(ee());
}
function Ve(e) {
  return e.replace(/\/+$/g, "");
}
function kt(e) {
  try {
    const t = new URL(e);
    return t.pathname !== "/" && t.pathname !== "";
  } catch {
    return e.split("/").length > 3;
  }
}
let W = [], ce = null, _e = "idle", We = null, Y = 0;
function fe(e) {
  return e.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((t) => t.length > 2);
}
function Zt(e, t, n) {
  const r = new Array(t.size).fill(0), s = /* @__PURE__ */ new Map();
  for (const o of e)
    s.set(o, (s.get(o) || 0) + 1);
  for (const [o, l] of s) {
    const p = t.get(o);
    if (p !== void 0) {
      const h = l / e.length, y = n.get(o) || 0;
      r[p] = h * y;
    }
  }
  return r;
}
function Gt(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = e.map((p) => fe(p));
  for (const p of r) {
    const h = new Set(p);
    for (const y of h)
      n.set(y, (n.get(y) || 0) + 1);
  }
  let s = 0;
  for (const p of n.keys())
    t.set(p, s++);
  const o = /* @__PURE__ */ new Map(), l = e.length;
  for (const [p, h] of n)
    o.set(p, Math.log((l + 1) / (h + 1)) + 1);
  return { vocab: t, idf: o };
}
function Xt(e, t) {
  const n = new Set(fe(e));
  if (n.size === 0) return 0;
  const r = new Set(fe(t));
  let s = 0;
  for (const o of n)
    r.has(o) && s++;
  return s / n.size;
}
async function Kt(e, t) {
  var p, h, y;
  const n = Ve(Ce());
  let r;
  n.endsWith("/chat/completions") ? r = n : n.endsWith("/api/v1") ? r = `${n}/chat/completions` : n.endsWith("/v1") ? r = `${n}/chat/completions` : kt(n) ? r = `${n}/chat/completions` : r = `${n}/v1/chat/completions`, console.log("[QA] API endpoint:", r);
  const s = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Le()}`
  };
  n.includes("openrouter.ai") && (s["HTTP-Referer"] = "https://github.com", s["X-Title"] = "UniversalReader");
  const o = await fetch(r, {
    method: "POST",
    headers: s,
    signal: t,
    body: JSON.stringify({
      model: Ke(),
      messages: e,
      temperature: 0.7
    })
  });
  if (!o.ok) {
    const S = await o.text();
    throw new Error(`OpenAI-compatible API error: ${o.status} - ${S}`);
  }
  return ((y = (h = (p = (await o.json()).choices) == null ? void 0 : p[0]) == null ? void 0 : h.message) == null ? void 0 : y.content) || "Sorry, I couldn't generate a response.";
}
async function Vt(e, t) {
  var l;
  const n = Ve(Ce()), r = await fetch(`${n}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": Le(),
      "anthropic-version": "2023-06-01"
    },
    signal: t,
    body: JSON.stringify({
      model: Ke(),
      max_tokens: 1024,
      messages: e
    })
  });
  if (!r.ok) {
    const p = await r.text();
    throw new Error(`Anthropic-compatible API error: ${r.status} - ${p}`);
  }
  return ((l = (await r.json()).content) == null ? void 0 : l.filter((p) => p.type === "text").map((p) => p.text || "").join(`
`).trim()) || "Sorry, I couldn't generate a response.";
}
async function Wt(e, t = 3) {
  for (let n = 0; n < t; n++)
    try {
      const r = new AbortController(), s = setTimeout(() => r.abort(), 6e4), o = ee() === "anthropic" ? await Vt(e, r.signal) : await Kt(e, r.signal);
      return clearTimeout(s), o;
    } catch (r) {
      const s = n === t - 1, o = r instanceof Error ? r.message : String(r);
      if (console.error(`[QA] Chat API error (attempt ${n + 1}/${t}):`, o), s)
        throw new Error(`Chat API failed after ${t} attempts: ${o}`);
      let l = 1e3 * (n + 1);
      o.includes("429") ? (l = 2e3 * (n + 2), console.log(`[QA] Rate limit detected, waiting ${l}ms before retry...`)) : o.includes("50") || o.includes("503") ? (l = 1500 * (n + 1), console.log(`[QA] Server error detected, waiting ${l}ms before retry...`)) : o.includes("abort") && (l = 500, console.log(`[QA] Request timeout, retrying in ${l}ms...`)), await new Promise((p) => setTimeout(p, l));
    }
  throw new Error("Unexpected error in retry loop");
}
async function Qt(e, t = 4) {
  if (W.length === 0) return [];
  const n = W.map((r, s) => ({
    idx: s,
    score: Xt(e, r.content),
    doc: r
  }));
  return n.sort((r, s) => s.score - r.score), n.slice(0, t).map((r) => ({
    pageContent: r.doc.content,
    metadata: r.doc.metadata
  }));
}
function ie(e, t) {
  _e = e, We = t || null;
}
function Yt() {
  return {
    status: _e,
    currentBook: ce || void 0,
    error: We || void 0,
    chunkCount: Y || void 0
  };
}
async function qt(e, t) {
  switch (t.toLowerCase()) {
    case "txt":
    case "md":
      return _.promises.readFile(e, "utf-8");
    case "pdf": {
      const n = await import("./pdf-CMEkdAEn.js"), r = [
        T.join(process.cwd(), "public", "pdf.worker.min.mjs"),
        T.join(process.cwd(), "dist", "pdf.worker.min.mjs"),
        T.join(Fe, "..", "dist", "pdf.worker.min.mjs"),
        T.join(process.cwd(), "dist-electron", "pdf.worker.mjs"),
        T.join(Fe, "..", "dist-electron", "pdf.worker.mjs")
      ];
      for (const h of r)
        if (_.existsSync(h)) {
          n.GlobalWorkerOptions.workerSrc = h;
          break;
        }
      const s = await _.promises.readFile(e), o = new Uint8Array(s), l = await n.getDocument({ data: o }).promise, p = [];
      for (let h = 1; h <= l.numPages; h++) {
        const D = (await (await l.getPage(h)).getTextContent()).items.map((C) => typeof C == "object" && C !== null && "str" in C ? C.str : "").join(" ");
        p.push(D);
      }
      return p.join(`

`);
    }
    case "epub": {
      const r = new Ze(e).getEntries(), s = [];
      for (const l of r)
        if (l.entryName.endsWith(".html") || l.entryName.endsWith(".xhtml") || l.entryName.endsWith(".htm")) {
          const p = l.getData().toString("utf-8");
          s.push(p);
        }
      return s.map(
        (l) => l.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()
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
async function Jt(e, t) {
  try {
    W = [], ce = null, Y = 0, ie("loading");
    const n = process.memoryUsage(), r = Math.round(n.heapUsed / 1024 / 1024);
    if (console.log(`[QA] Memory before load: ${r}MB heap used`), n.heapUsed > 500 * 1024 * 1024)
      if (console.warn(`[QA] High memory usage (${r}MB), attempting GC...`), global.gc) {
        global.gc();
        const D = process.memoryUsage(), C = Math.round(D.heapUsed / 1024 / 1024);
        console.log(`[QA] Memory after GC: ${C}MB heap used`);
      } else
        console.warn("[QA] GC not available (run with --expose-gc flag)");
    if (!Le())
      throw new Error(
        "QA_API_KEY (or OPENROUTER_API_KEY) environment variable is not set. Please set it in your .env file or system environment."
      );
    if (!_.existsSync(e))
      throw new Error(`File not found: ${e}`);
    console.log(`[QA] Extracting text from ${e}`);
    const s = await qt(e, t);
    if (!s || s.trim().length === 0)
      throw new Error("No text content extracted from file");
    console.log(`[QA] Extracted ${s.length} characters`);
    const o = 1e3, l = [];
    for (let D = 0; D < s.length; D += o)
      l.push(s.slice(D, D + o));
    console.log(`[QA] Created ${l.length} text chunks`);
    const { vocab: p, idf: h } = Gt(l);
    W = l.map((D, C) => {
      const a = fe(D);
      return {
        content: D,
        embedding: Zt(a, p, h),
        metadata: { source: T.basename(e), chunkIndex: C }
      };
    }), Y = l.length, ce = e, ie("ready");
    const y = process.memoryUsage(), S = Math.round(y.heapUsed / 1024 / 1024);
    return console.log(`[QA] Ready with ${Y} chunks, memory: ${S}MB`), { success: !0 };
  } catch (n) {
    const r = n instanceof Error ? n.message : "Unknown error";
    return console.error("[QA] Load error:", r), ie("error", r), { success: !1, error: r };
  }
}
async function en(e) {
  const t = e.trim();
  if (!t)
    throw new Error("Question cannot be empty.");
  if (W.length === 0)
    throw new Error("No book loaded. Please load a book first.");
  if (_e !== "ready")
    throw new Error("QA service not ready. Please wait.");
  console.log(`[QA] Question: ${t}`);
  const n = await Qt(t, 3), r = n.map((p) => p.pageContent.slice(0, 1500)).join(`

`);
  console.log(`[QA] Context length: ${r.length} chars, ${n.length} docs`);
  const s = `You are a helpful assistant that answers questions about a book. Based only on the following context from the book, please answer the question. If the answer is not in the context, say so.

Context:
${r}

Question: ${t}

Answer:`, o = await Wt([
    { role: "user", content: s }
  ]), l = n.map((p) => ({
    content: p.pageContent,
    source: p.metadata.source || "Unknown"
  }));
  return console.log(`[QA] Answer length: ${o.length}`), {
    answer: o,
    sources: l
  };
}
function tn() {
  W = [], ce = null, Y = 0, ie("idle");
  const e = process.memoryUsage(), t = Math.round(e.heapUsed / 1024 / 1024);
  console.log(`[QA] Cleared, memory: ${t}MB`), global.gc && e.heapUsed > 200 * 1024 * 1024 && (console.log("[QA] Triggering GC after clear..."), global.gc());
}
const me = {
  loadBookForQA: Jt,
  askQuestion: en,
  clearQA: tn,
  getStatus: Yt
}, Qe = [
  "pdf",
  "epub",
  "mobi",
  "azw3",
  "txt",
  "md"
], Ye = ["docx"], nn = /* @__PURE__ */ new Set(["epub", "mobi", "azw3", "txt", "md"]);
function pe(e) {
  return e.trim().toLowerCase().replace(/^\./, "");
}
function qe(e) {
  const t = pe(e);
  return Qe.includes(t);
}
function rn(e) {
  const t = pe(e);
  return Ye.includes(t);
}
function on(e) {
  return qe(e) ? "supported" : rn(e) ? "convertible" : "unsupported";
}
function Ie(e) {
  return nn.has(e) ? "flow" : "paged";
}
function sn() {
  return [...Qe, ...Ye];
}
function Ue(e) {
  return e === "docx" ? "md" : e;
}
function an(e) {
  const t = pe(e), n = on(t);
  if (n === "unsupported")
    return {
      capability: n,
      sourceFormat: t,
      requiresConversion: !1,
      reason: "unsupported_format"
    };
  if (qe(t)) {
    const s = Ue(t);
    return {
      capability: n,
      sourceFormat: t,
      targetFormat: s,
      documentKind: Ie(s),
      ingestStatus: "ready",
      requiresConversion: !1
    };
  }
  const r = Ue(t);
  return {
    capability: n,
    sourceFormat: t,
    targetFormat: r,
    documentKind: Ie(r),
    ingestStatus: "converted",
    requiresConversion: !0
  };
}
const cn = T.join(z.getPath("userData"), "library.db"), H = new nt(cn);
H.exec(`
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
const re = (e, t) => {
  H.prepare("PRAGMA table_info(books)").all().some((s) => s.name === e) || H.exec(`ALTER TABLE books ADD COLUMN ${e} ${t}`);
};
re("progressLocator", "TEXT");
re("progressUpdatedAt", "INTEGER");
re("documentKind", "TEXT");
re("ingestStatus", "TEXT");
re("sourceFormat", "TEXT");
H.exec(`
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
H.exec(`
  CREATE INDEX IF NOT EXISTS idx_books_lastReadAt ON books(lastReadAt);
  CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
  CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
  CREATE INDEX IF NOT EXISTS idx_annotations_bookId ON annotations(bookId);
`);
const q = T.join(z.getPath("userData"), "covers");
_.mkdirSync(q, { recursive: !0 });
async function fn(e, t) {
  try {
    const n = (await Promise.resolve().then(() => Se)).default, s = new n(e).getEntries(), o = [
      /cover\.(jpg|jpeg|png|gif)$/i,
      /cover-image\.(jpg|jpeg|png|gif)$/i,
      /images\/cover\.(jpg|jpeg|png|gif)$/i,
      /OEBPS\/images\/cover\.(jpg|jpeg|png|gif)$/i,
      /OPS\/images\/cover\.(jpg|jpeg|png|gif)$/i
    ], l = s.find((h) => h.entryName.endsWith(".opf"));
    if (l) {
      const h = l.getData().toString("utf-8"), y = h.match(/name="cover"\s+content="([^"]+)"/) || h.match(/properties="cover-image"[^>]*href="([^"]+)"/);
      if (y) {
        const S = y[1], D = h.match(new RegExp(`id="${S}"[^>]*href="([^"]+)"`)) || h.match(new RegExp(`href="([^"]+)"[^>]*id="${S}"`));
        if (D) {
          const C = D[1], a = T.dirname(l.entryName), u = a ? `${a}/${C}` : C, c = s.find(
            (d) => d.entryName === u || d.entryName.endsWith(C)
          );
          if (c) {
            const d = c.getData(), m = T.extname(c.entryName) || ".jpg", i = `${t}${m}`, f = T.join(q, i);
            return await _.promises.writeFile(f, d), f;
          }
        }
      }
    }
    for (const h of o) {
      const y = s.find((S) => h.test(S.entryName));
      if (y) {
        const S = y.getData(), D = T.extname(y.entryName) || ".jpg", C = `${t}${D}`, a = T.join(q, C);
        return await _.promises.writeFile(a, S), a;
      }
    }
    const p = s.find(
      (h) => /\.(jpg|jpeg|png|gif)$/i.test(h.entryName) && (h.entryName.toLowerCase().includes("cover") || h.entryName.toLowerCase().includes("title"))
    );
    if (p) {
      const h = p.getData(), y = T.extname(p.entryName) || ".jpg", S = `${t}${y}`, D = T.join(q, S);
      return await _.promises.writeFile(D, h), D;
    }
    return null;
  } catch (n) {
    return console.error("Failed to extract EPUB cover:", n), null;
  }
}
async function ln(e, t) {
  try {
    const n = await import("./pdf-CMEkdAEn.js"), r = await _.promises.readFile(e), s = new Uint8Array(r), l = await (await n.getDocument({ data: s }).promise).getPage(1), p = l.getViewport({ scale: 1 }), h = Math.min(400 / p.width, 1.5), y = l.getViewport({ scale: h }), S = rt(y.width, y.height), D = S.getContext("2d");
    await l.render({
      canvasContext: D,
      viewport: y
    }).promise;
    const C = `${t}.png`, a = T.join(q, C), u = S.toBuffer("image/png");
    return await _.promises.writeFile(a, u), a;
  } catch (n) {
    return console.error("Failed to extract PDF cover:", n), null;
  }
}
function un(e) {
  return e.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (t, n) => String.fromCharCode(Number(n)));
}
async function dn(e) {
  const t = (await Promise.resolve().then(() => Se)).default, r = new t(e).getEntry("word/document.xml");
  if (!r)
    throw new Error("DOCX 内容缺失: word/document.xml");
  return r.getData().toString("utf-8").split(/<\/w:p>/i).map((l) => [...l.replace(/<w:tab\s*\/>/gi, "	").replace(/<w:br\s*\/>/gi, `
`).matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi)].map((S) => un(S[1])).join("").trim()).filter(Boolean).join(`

`);
}
async function En(e, t) {
  try {
    if (t === "epub") {
      const n = (await Promise.resolve().then(() => Se)).default, o = new n(e).getEntries().find((l) => l.entryName.endsWith(".opf"));
      if (o) {
        const l = o.getData().toString("utf-8"), p = l.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i), h = l.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
        return {
          title: p ? p[1].trim() : void 0,
          author: h ? h[1].trim() : void 0
        };
      }
    }
    if (t === "pdf") {
      const n = await import("./pdf-CMEkdAEn.js"), r = await _.promises.readFile(e), s = new Uint8Array(r), p = (await (await n.getDocument({ data: s }).promise).getMetadata()).info;
      return {
        title: (p == null ? void 0 : p.Title) || void 0,
        author: (p == null ? void 0 : p.Author) || void 0
      };
    }
  } catch (n) {
    console.error("Failed to extract metadata:", n);
  }
  return {};
}
function mn(e) {
  if (e)
    try {
      return JSON.parse(e);
    } catch {
      return;
    }
}
function Te(e) {
  const t = e.format || "txt";
  return {
    ...e,
    progressLocator: mn(e.progressLocator),
    progressUpdatedAt: e.progressUpdatedAt ?? void 0,
    documentKind: e.documentKind || Ie(t),
    ingestStatus: e.ingestStatus || "ready",
    sourceFormat: e.sourceFormat || t
  };
}
const pn = H.prepare("SELECT * FROM books ORDER BY lastReadAt DESC"), gn = H.prepare(`
  SELECT * FROM books
  WHERE title LIKE ? OR author LIKE ?
  ORDER BY lastReadAt DESC
`), hn = H.prepare(`
  UPDATE books
  SET progress = ?, progressLocator = ?, progressUpdatedAt = ?, lastReadAt = CURRENT_TIMESTAMP
  WHERE id = ?
`);
v.handle("read-file", async (e, t) => _.promises.readFile(t));
v.handle("read-file-buffer", async (e, t) => _.promises.readFile(t));
v.handle("file-exists", async (e, t) => {
  try {
    return await _.promises.access(t, _.constants.F_OK), !0;
  } catch {
    return !1;
  }
});
v.handle("open-external", async (e, t) => Pe.openExternal(t));
v.handle("open-user-data-folder", async () => Pe.openPath(z.getPath("userData")));
v.handle("get-cover-url", async (e, t) => {
  if (!t) return null;
  try {
    return await _.promises.access(t, _.constants.F_OK), `file://${t.replace(/\\/g, "/")}`;
  } catch {
    return null;
  }
});
const Je = T.join(z.getPath("userData"), "backgrounds");
_.mkdirSync(Je, { recursive: !0 });
v.handle("select-background-image", async () => {
  const e = await Be.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp"] }
    ]
  });
  if (e.canceled || e.filePaths.length === 0) return null;
  const t = e.filePaths[0], n = T.extname(t), r = `background-${be.randomUUID()}${n}`, s = T.join(Je, r);
  try {
    return await _.promises.copyFile(t, s), s;
  } catch (o) {
    return console.error("Failed to copy background image:", o), null;
  }
});
v.handle("get-background-image-url", async (e, t) => {
  if (!t) return null;
  try {
    return await _.promises.access(t, _.constants.F_OK), `file://${t.replace(/\\/g, "/")}`;
  } catch {
    return null;
  }
});
v.handle("open-file-dialog", async () => {
  const e = await Be.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Books", extensions: [...sn()] }
    ]
  });
  if (e.canceled || e.filePaths.length === 0) return null;
  const t = e.filePaths[0], n = T.extname(t).toLowerCase(), r = pe(n), s = an(r);
  if (s.capability === "unsupported" || !s.targetFormat || !s.documentKind || !s.ingestStatus)
    return null;
  const o = T.basename(t, n), l = be.randomUUID(), p = T.join(z.getPath("userData"), "books");
  await _.promises.mkdir(p, { recursive: !0 });
  let h;
  if (s.requiresConversion && s.sourceFormat === "docx") {
    const a = `${o}-${l}.docx`, u = T.join(p, a);
    await _.promises.copyFile(t, u);
    const c = await dn(u), d = `${o}-${l}.md`;
    h = T.join(p, d), await _.promises.writeFile(h, c, "utf-8");
  } else {
    const a = `${o}-${l}${n}`;
    h = T.join(p, a), await _.promises.copyFile(t, h);
  }
  const y = await En(h, s.targetFormat), S = y.title || o, D = y.author || null;
  let C = null;
  s.targetFormat === "epub" || s.targetFormat === "mobi" || s.targetFormat === "azw3" ? C = await fn(h, l) : s.targetFormat === "pdf" && (C = await ln(h, l));
  try {
    const u = H.prepare(`
      INSERT INTO books (title, author, path, format, sourceFormat, documentKind, ingestStatus, coverPath) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(path) DO UPDATE SET lastReadAt = CURRENT_TIMESTAMP
      RETURNING *
    `).get(
      S,
      D,
      h,
      s.targetFormat,
      s.sourceFormat,
      s.documentKind,
      s.ingestStatus,
      C
    );
    return u ? Te(u) : null;
  } catch (a) {
    return console.error("DB Insert Error:", a), null;
  }
});
v.handle("get-library", () => pn.all().map(Te));
v.handle("search-library", (e, t) => {
  const n = `%${t}%`;
  return gn.all(n, n).map(Te);
});
v.handle("update-progress", (e, t, n, r, s) => {
  const o = typeof s == "number" ? s : Date.now(), l = r ? JSON.stringify(r) : null;
  hn.run(n, l, o, t);
});
v.handle("delete-book", (e, t) => {
  try {
    const n = H.prepare("SELECT * FROM books WHERE id = ?").get(t);
    return n && (n.coverPath && _.promises.unlink(n.coverPath).catch(() => {
    }), n.path && _.promises.unlink(n.path).catch(() => {
    })), H.prepare("DELETE FROM books WHERE id = ?").run(t), !0;
  } catch (n) {
    return console.error("Delete book error:", n), !1;
  }
});
v.handle("get-annotations", (e, t) => H.prepare("SELECT * FROM annotations WHERE bookId = ? ORDER BY createdAt DESC").all(t));
v.handle("add-annotation", (e, t) => H.prepare(`
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
v.handle("update-annotation", (e, t, n) => {
  const r = [], s = [];
  return n.note !== void 0 && (r.push("note = ?"), s.push(n.note)), n.color !== void 0 && (r.push("color = ?"), s.push(n.color)), r.length === 0 ? null : (r.push("updatedAt = CURRENT_TIMESTAMP"), s.push(t), H.prepare(`UPDATE annotations SET ${r.join(", ")} WHERE id = ? RETURNING *`).get(...s));
});
v.handle("delete-annotation", (e, t) => {
  try {
    return H.prepare("DELETE FROM annotations WHERE id = ?").run(t), !0;
  } catch (n) {
    return console.error("Delete annotation error:", n), !1;
  }
});
v.handle("qa-load-book", async (e, t, n) => me.loadBookForQA(t, n));
v.handle("qa-ask", async (e, t) => me.askQuestion(t));
v.handle("qa-clear", async () => {
  me.clearQA();
});
v.handle("qa-get-status", async () => me.getStatus());
v.handle("credentials-save", async (e, t) => {
  try {
    return await Bt(t), { success: !0 };
  } catch (n) {
    return { success: !1, error: n instanceof Error ? n.message : String(n) };
  }
});
v.handle("credentials-load", async () => ne());
v.handle("credentials-clear", async () => {
  try {
    return Ht(), { success: !0 };
  } catch (e) {
    return { success: !1, error: e instanceof Error ? e.message : String(e) };
  }
});
v.handle("credentials-has", async () => $t());
const yn = Ne(import.meta.url), et = V.dirname(yn);
process.env.DIST = V.join(et, "../dist");
process.env.VITE_PUBLIC = z.isPackaged ? process.env.DIST : V.join(process.env.DIST, "../public");
let k;
const ye = process.env.VITE_DEV_SERVER_URL;
function In(e) {
  e.webContents.on(
    "did-fail-load",
    (t, n, r, s, o) => {
      o && console.error(
        "[main] did-fail-load",
        JSON.stringify({ errorCode: n, errorDescription: r, validatedURL: s })
      );
    }
  ), e.webContents.on("render-process-gone", (t, n) => {
    console.error("[main] render-process-gone", JSON.stringify(n));
  });
}
function tt() {
  if (k = new Me({
    icon: V.join(process.env.VITE_PUBLIC, "vite.svg"),
    webPreferences: {
      preload: V.join(et, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), In(k), k.webContents.on("did-finish-load", () => {
    k == null || k.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), ye)
    console.log("[main] loading dev url:", ye), k.loadURL(ye), k.webContents.openDevTools({ mode: "detach" });
  else {
    const e = V.join(process.env.DIST, "index.html");
    console.log("[main] loading file:", e), k.loadFile(e);
  }
}
z.on("window-all-closed", () => {
  process.platform !== "darwin" && z.quit();
});
z.on("activate", () => {
  Me.getAllWindows().length === 0 && tt();
});
z.whenReady().then(tt);
