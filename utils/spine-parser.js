/**
 * spine atlas parser.
 */
let spine = {};

spine.Atlas = function (atlasText) {
  this.pages = [];
  this.regions = [];

  let reader = new spine.AtlasReader(atlasText);
  let tuple = [];
  tuple.length = 4;
  let page = null;
  while (true) {
    let line = reader.readLine();
    if (line === null) {
      break;
    }
    line = reader.trim(line);
    if (!line.length) {
      page = null;
    } else if (!page) {
      page = new spine.AtlasPage();
      page.name = line;

      if (reader.readTuple(tuple) === 2) { // size is only optional for an atlas packed with an old TexturePacker.
        page.width = parseInt(tuple[0]);
        page.height = parseInt(tuple[1]);
        reader.readTuple(tuple);
      }
      page.format = spine.Atlas.Format[tuple[0]];

      reader.readTuple(tuple);
      page.minFilter = spine.Atlas.TextureFilter[tuple[0]];
      page.magFilter = spine.Atlas.TextureFilter[tuple[1]];

      let direction = reader.readValue();
      page.uWrap = spine.Atlas.TextureWrap.clampToEdge;
      page.vWrap = spine.Atlas.TextureWrap.clampToEdge;
      if (direction === "x") {
        page.uWrap = spine.Atlas.TextureWrap.repeat;
      } else if (direction === "y") {
        page.vWrap = spine.Atlas.TextureWrap.repeat;
      } else if (direction === "xy") {
        page.uWrap = page.vWrap = spine.Atlas.TextureWrap.repeat;
      }
      this.pages[this.pages.length] = page;

    } else {
      let region = new spine.AtlasRegion();
      region.name = line;
      region.page = page;

      region.rotate = reader.readValue() === "true";

      reader.readTuple(tuple);
      let x = parseInt(tuple[0]);
      let y = parseInt(tuple[1]);

      reader.readTuple(tuple);
      let width = parseInt(tuple[0]);
      let height = parseInt(tuple[1]);

      region.u = x / page.width;
      region.v = y / page.height;
      if (region.rotate) {
        region.u2 = (x + height) / page.width;
        region.v2 = (y + width) / page.height;
      } else {
        region.u2 = (x + width) / page.width;
        region.v2 = (y + height) / page.height;
      }
      region.x = x;
      region.y = y;
      region.width = Math.abs(width);
      region.height = Math.abs(height);

      if (reader.readTuple(tuple) === 4) { // split is optional
        region.splits = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];

        if (reader.readTuple(tuple) === 4) { // pad is optional, but only present with splits
          region.pads = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];

          reader.readTuple(tuple);
        }
      }

      region.originalWidth = parseInt(tuple[0]);
      region.originalHeight = parseInt(tuple[1]);

      reader.readTuple(tuple);
      region.offsetX = parseInt(tuple[0]);
      region.offsetY = parseInt(tuple[1]);

      region.index = parseInt(reader.readValue());

      this.regions[this.regions.length] = region;
    }
  }
};

spine.Atlas.prototype = {
  findRegion: function (name) {
    let regions = this.regions;
    for (let i = 0, n = regions.length; i < n; i++) {
      if (regions[i].name === name) {
        return regions[i];
      }
    }
    return null;
  },

  updateUVs: function (page) {
    let regions = this.regions;
    for (let i = 0, n = regions.length; i < n; i++) {
      let region = regions[i];
      if (region.page !== page) {
        continue;
      }
      region.u = region.x / page.width;
      region.v = region.y / page.height;
      if (region.rotate) {
        region.u2 = (region.x + region.height) / page.width;
        region.v2 = (region.y + region.width) / page.height;
      } else {
        region.u2 = (region.x + region.width) / page.width;
        region.v2 = (region.y + region.height) / page.height;
      }
    }
  }
};

spine.Atlas.Format = {
  alpha: 0,
  intensity: 1,
  luminanceAlpha: 2,
  RGB565: 3,
  RGBA4444: 4,
  RGB888: 5,
  RGBA8888: 6
};

spine.Atlas.TextureFilter = {
  nearest: 0,
  linear: 1,
  mipMap: 2,
  mipMapNearestNearest: 3,
  mipMapLinearNearest: 4,
  mipMapNearestLinear: 5,
  mipMapLinearLinear: 6
};

spine.Atlas.TextureWrap = {
  mirroredRepeat: 0,
  clampToEdge: 1,
  repeat: 2
};

spine.AtlasPage = function () {};
spine.AtlasPage.prototype = {
  name: null,
  format: null,
  minFilter: null,
  magFilter: null,
  uWrap: null,
  vWrap: null,
  rendererObject: null,
  width: 0,
  height: 0
};

spine.AtlasRegion = function () {};
spine.AtlasRegion.prototype = {
  page: null,
  name: null,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  u: 0,
  v: 0,
  u2: 0,
  v2: 0,
  offsetX: 0,
  offsetY: 0,
  originalWidth: 0,
  originalHeight: 0,
  index: 0,
  rotate: false,
  splits: null,
  pads: null
};

spine.AtlasReader = function (text) {
  this.lines = text.split(/\r\n|\r|\n/);
};
spine.AtlasReader.prototype = {
  index: 0,
  trim: function (value) {
    return value.replace(/^\s+|\s+$/g, "");
  },
  readLine: function () {
    if (this.index >= this.lines.length) {
      return null;
    }
    return this.lines[this.index++];
  },
  readValue: function () {
    let line = this.readLine();
    let colon = line.indexOf(":");
    if (colon === -1) {
      throw "Invalid line: " + line;
    }
    return this.trim(line.substring(colon + 1));
  },
  /** Returns the number of tuple values read (1, 2 or 4). */
  readTuple: function (tuple) {
    let line = this.readLine();
    let colon = line.indexOf(":");
    if (colon === -1) {
      throw "Invalid line: " + line;
    }
    let i = 0,
      lastMatch = colon + 1;
    for (; i < 3; i++) {
      let comma = line.indexOf(",", lastMatch);
      if (comma === -1) {
        break;
      }
      tuple[i] = this.trim(line.substr(lastMatch, comma - lastMatch));
      lastMatch = comma + 1;
    }
    tuple[i] = this.trim(line.substring(lastMatch));
    return i + 1;
  }
};

module.exports = exports = {

  /**
   * convert spine atlas to json format
   * @param  {[string]} atlasText [.atlas file raw text].
   * @return json object of atlas text.
   *
    page:{
      name: 'duck.png',
      width: 868,
      height: 150,
      format: 6,
      minFilter: undefined,
      magFilter: undefined,
      uWrap: 1,
      vWrap: 1
    }

    region:{
      name: 'stars/02_00054',
      page:
       { name: 'duck.png',
         width: 868,
         height: 150,
         format: 6,
         minFilter: undefined,
         magFilter: undefined,
         uWrap: 1,
         vWrap: 1 },
      rotate: false,
      u: 0.7868663594470046,
      v: 0.013333333333333334,
      u2: 0.868663594470046,
      v2: 0.49333333333333335,
      x: 683,
      y: 2,
      width: 71,
      height: 72,
      originalWidth: 71,
      originalHeight: 72,
      offsetX: 0,
      offsetY: 0,
      index: -1 }
   */
  parseAtlas: function (atlasText) {
    let parsedAtlas = new spine.Atlas(atlasText);
    return {
      pages: parsedAtlas.pages,
      regions: parsedAtlas.regions
    };
  }
};
