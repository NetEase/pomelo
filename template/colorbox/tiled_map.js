
__resources__["/__builtin__/tiled_map.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var xmlLoad = require('xmlload').xmlLoad;
var gzip = require('gzip');
var helper = require("helper");


function buildMap(filename)
{
  var xmlDoc = xmlLoad(filename);
  if(xmlDoc != null)
    return node2Map(filename, xmlDoc.documentElement);
}

function node2Map(filename, node)
{
  var i, tmp, filepath;
  
  if(node == null || node.tagName != "map" || node.attributes == null)
  {
    return;
  }
  var map = new Map();
  i = filename.lastIndexOf('/');
  if(i > 0)
  {
    map.filepath = filename.substr(0, i + 1);
  }
  for(i = 0; i < node.attributes.length; ++i)
  {
    switch(node.attributes[i].name)
    {
      case 'width':
      case 'height':
      case 'tilewidth':
      case 'tileheight':
        tmp = parseInt(node.attributes[i].nodeValue);
        if(isNaN(tmp))
          return;
        map[node.attributes[i].name] = tmp;
        break;
      case 'version':
      case 'orientation':  
        map[node.attributes[i].name] = node.attributes[i].nodeValue;
        break;
      default:
        break;
    }
  }
  
  var sibs = node.firstChild;
  
  for(; sibs!= null; sibs = sibs.nextSibling)
  {
    if(sibs.nodeType != 1)
      continue;
    if(sibs.tagName == "properties")
    {
      tmp = node2Props(sibs);
      if(tmp != null)
      {
        map.properties = tmp;
      }
    }
    if(sibs.tagName == "tileset")
    {
      tmp = node2Tileset(sibs, map);
      if(tmp != null)
      {
        map.tilesets.push(tmp);
      }
    }
    else if(sibs.tagName == "layer")
    {
      tmp = node2Layer(sibs, map);
      if(tmp != null)
      {
        map.layers.push(tmp);
      }
    }
    else if(sibs.tagName == "objectgroup")
    {
      tmp = node2Objectgroup(sibs);
      if(tmp != null)
      {
        map.objectgroups.push(tmp);
      }
    }
  }
  
  if(map.orientation == "orthogonal")
  {
    map.widthPx = map.width * map.tilewidth;
    map.heightPx = map.height * map.tileheight;
  }
  else if(map.orientation == "isometric")
  {
    map.widthPx = (map.width + map.height) * map.tilewidth / 2;
    map.heightPx = (map.width + map.height) * map.tileheight / 2;
  }
  else
    return;
    
  tmp = map.width * map.height;
  map.drawImagetiles = new Array(tmp);
  for(i = 0; i < tmp; ++i)
  {
    map.drawImagetiles[i] = new Array();
  }
  
  return map;
}

function getProperty(name)
{
  return this[name];
}

function getExtendedProperty(name)
{
  if(null == this.properties)
    return;
  return this.properties[name];
}

function getExtendedPropertyLength()
{
  if(null == this.properties)
    return;
  return this.properties.length;
}

function Map()
{
  this.width;
  this.height;
  this.tileWidth;
  this.tileHeight;
  this.filepath='';
  this.version;
  this.orientation;
  this.tilesets = new Array();
  this.maxTilewidth = 0;
  this.maxTileheight = 0;
  this.layers = new Array();
  this.objectgroups = new Array();
  this.tiles = new Array();
  /*Ӱ��ÿ��maptile���Ƶ�image tiles. 
  drawImagetiles �Ǹ�array������ÿ���ŵĶ��� PaintTile array.*/
  this.drawImagetiles;
}

function PaintTile(layerIndex, row, col, tile)
{
  this.layerIndex = layerIndex;
  this.row = row;
  this.col = col;
  this.tile = tile;
}

PaintTile.prototype.paint = function (context, paintCanvasStartX, paintCanvasStartY, paintCanvasW, paintCanvasH,
                         mapStartX, mapStartY)
{
  var tile = this.tile, map = this.tile.tileset.map;
  var tileTopLeftX, tileTopLeftY;
  var tileCanvasX, tileCanvasY;
  var paintTileTopLeftX, paintTileTopLeftY,paintTileBottomRightX, paintTileBottomRightY;

  tileTopLeftX = this.col * map.tilewidth;
  tileTopLeftY = this.row * map.tileheight - (tile.tileset.tileheight - map.tileheight);
  //��map����ϵ�ϵ�����ת����canvas����ϵ������
  tileCanvasX = tileTopLeftX - mapStartX + paintCanvasStartX;
  tileCanvasY = tileTopLeftY - mapStartY + paintCanvasStartY;
  //�ж�tile�ľ��������Ƿ������ƾ��������ཻ
  paintTileTopLeftX = Math.max(tileCanvasX, paintCanvasStartX);
  paintTileTopLeftY = Math.max(tileCanvasY, paintCanvasStartY);
  paintTileBottomRightX = Math.min(tileCanvasX + tile.tileset.tilewidth, paintCanvasStartX + map.rectWidth);
  paintTileBottomRightY = Math.min(tileCanvasY + tile.tileset.tileheight, paintCanvasStartY + map.rectHeight);
  if(paintTileTopLeftX < paintTileBottomRightX && paintTileTopLeftY < paintTileBottomRightY)
  {
    //�����ཻ
    tileOffsetX = paintTileTopLeftX - tileCanvasX;
    tileOffsetY = paintTileTopLeftY - tileCanvasY;
    tile.draw(context, paintTileTopLeftX, paintTileTopLeftY, paintTileBottomRightX - paintTileTopLeftX,
                    paintTileBottomRightY - paintTileTopLeftY, tileOffsetX, tileOffsetY);
  }
}

PaintTile.prototype.paintIso = function (context, paintCanvasStartX, paintCanvasStartY, paintCanvasW, paintCanvasH,
                         mapStartX, mapStartY)
{
  var tile = this.tile;

  tileTopLeftX = row * map.tilewidth;
  tileTopLeftY = mapRowStartY - (tile.tileset.tileheight - map.tileheight);
  //��map����ϵ�ϵ�����ת����canvas����ϵ������
  tileCanvasX = tileTopLeftX - map.mapStartX + map.canvasStartX;
  tileCanvasY = tileTopLeftY - map.mapStartY + map.canvasStartY;
  //�ж�tile�ľ��������Ƿ������ƾ��������ཻ
  paintTileTopLeftX = Math.max(tileCanvasX, map.canvasStartX);
  paintTileTopLeftY = Math.max(tileCanvasY, map.canvasStartY);
  paintTileBottomRightX = Math.min(tileCanvasX + tile.tileset.tilewidth, map.canvasStartX + map.rectWidth);
  paintTileBottomRightY = Math.min(tileCanvasY + tile.tileset.tileheight, map.canvasStartY + map.rectHeight);
  if(paintTileTopLeftX < paintTileBottomRightX && paintTileTopLeftY < paintTileBottomRightY)
  {
    //�����ཻ
    tileOffsetX = paintTileTopLeftX - tileCanvasX;
    tileOffsetY = paintTileTopLeftY - tileCanvasY;
    tile.draw(context, paintTileTopLeftX, paintTileTopLeftY, paintTileBottomRightX - paintTileTopLeftX,
                    paintTileBottomRightY - paintTileTopLeftY, tileOffsetX, tileOffsetY);
  }
}

/*
Map.prototype.paint = function (context, mapStartX, mapStartY)
{
  if(null == context)
    return;

  this.mapStartX = mapStartX;
  this.mapStartY = mapStartY;
  this.canvasStartX = 0;
  this.canvasStartY = 0;
  this.paintEx(context, 0, 0, context.width, context.height,
    mapStartX, mapStartY, this.widthPx - mapStartX, this.heightPx - mapStartY);
}
*/


Map.prototype.paint = function (context, canvasStartX, canvasStartY, paintCanvasWidth, paintCanvasHeight,
                   mapStartX, mapStartY, paintMapWidth, paintMapHeight)
{
  
  if(null == context)
    return;
  if(paintCanvasWidth < 0 || paintCanvasHeight < 0)
    return;
  if(mapStartX >= this.widthPx || mapStartY >= this.heightPx)
    return;
  
  this.canvasStartX = canvasStartX;
  this.canvasStartY = canvasStartY;
  this.mapStartX = mapStartX;
  this.mapStartY = mapStartY;
  if(canvasStartX + paintCanvasWidth >= context.width)
    this.paintCanvasWidth = context.width - canvasStartX;
  else
    this.paintCanvasWidth = paintCanvasWidth;
  if(canvasStartY + paintCanvasHeight >= context.height)
    this.paintCanvasHeight = context.height - canvasStartY;
  else
    this.paintCanvasHeight = paintCanvasHeight;
  if(paintMapWidth + mapStartX >= this.widthPx)
    this.paintMapWidth = this.widthPx - mapStartX;
  else
    this.paintMapWidth = paintMapWidth;
  if(paintMapHeight + mapStartY >= this.heightPx)
    this.paintMapHeight = this.heightPx - mapStartY;
  else
    this.paintMapHeight = paintMapHeight;
  this.rectWidth = Math.min(this.paintCanvasWidth, this.paintMapWidth);
  this.rectHeight = Math.min(this.paintCanvasHeight, this.paintMapHeight);
  
  this.rePaint(context);
}

Map.prototype.rePaint = function(context)
{
  var i, layer, context;
  
  if(null == context)
    return;
    
  for(i = 0; i < this.layers.length; ++i)
  {
    layer = this.layers[i];
    if(null == layer)
      return;
    if(layer.visible)
    {
      if(this.orientation == "orthogonal")
      {
        layer.paint(context);
      }
      else if(this.orientation == "isometric")
      {
        layer.paintIso(context);
      }
      else
        return;
    }
  }
}

Map.prototype.scanPaintTile = function ()
{
  var i;
  /*
  if()
  for(i = 0; i < this.layers.length; ++i)
  {
    
  }*/
}

/*
  �ƶ�����paintcanvas��paintmap��
  �� paintmap �ĸ߿����� paintcanvas �ĸ߿�ʱ��paintmap�����ƶ���mapStartPointX += dx�� mapStartPointY += dy��
  ��  paintmap �ĸ߿�С�� paintcanvas �ĸ߿�ʱ������paintmap��paintcanvas�ڲ��ƶ���
*/
Map.prototype.move = function (context, dx, dy)
{
  var canvasStartX, canvasStartY;
  var mapStartX, mapStartY;
  var startX, startY;
  var prePaintCanvasH = this.paintCanvasWidth, prePaintCanvasW = this.paintCanvasHeight;
  
  if(null == context)
    return;
  
  if(isNaN(dx))
    dx = 0;
  if(isNaN(dy))
    dy = 0;
  
  function getMovePoint(move, start, smallLen, largeLen, isCanvasLarger)
  {
    if(isCanvasLarger)
    {
      if(move < 0)
      {
        return -Math.min(Math.abs(move), start);
      }
      else if(move > 0)
      {
        if(largeLen - smallLen - start >= move)
          return move;
        else if(largeLen - smallLen - start > 0)
          return largeLen - smallLen - start          
      }
    }
    else
    {
      if(move > 0)
      {
        return Math.min(move, start);
      }
      else if(move < 0)
      {
        if(largeLen - smallLen - start > Math.abs(move))
          return move;
        else
          return -(largeLen - smallLen - start);
      }
    }
    return 0;
  }
  //����x y�߽�ֵ�������������ı��ƶ����߽�ʱ���������ơ�
  if(this.widthPx >= this.paintCanvasWidth)
    dx = getMovePoint(dx, this.mapStartX, this.paintCanvasWidth, this.widthPx, false);
  else
    dx = getMovePoint(dx, this.canvasStartX, this.widthPx, this.paintCanvasWidth, true);
  
  if(this.heightPx >= this.paintCanvasHeight)
    dy = getMovePoint(dy, this.mapStartY, this.paintCanvasHeight, this.heightPx, false);
  else
    dy = getMovePoint(dy, this.canvasStartY, this.heightPx, this.paintCanvasHeight, true);
    
  if(dx == 0 && dy == 0)
    return;
  
  /////////////////////////////////////////////////////

  if(this.widthPx >= this.paintCanvasWidth)
  {
    canvasStartX = this.canvasStartX;
    mapStartX = this.mapStartX - dx;
  }
  else
  {
    canvasStartX = this.canvasStartX + dx;
    mapStartX = this.mapStartX;
  }
  if(this.heightPx >= this.paintCanvasHeight)
  {
    canvasStartY = this.canvasStartY;
    mapStartY = this.mapStartY - dy;
  }
  else
  {
    canvasStartY = this.canvasStartY + dy;
    mapStartY = this.mapStartY;
  }
      
  this.paint(context, canvasStartX, canvasStartY, this.paintCanvasWidth, this.paintCanvasHeight,
                  mapStartX, mapStartY, this.paintCanvasWidth, this.paintCanvasHeight);
                  
  this.mapStartX = mapStartX;
  this.mapStartY = mapStartY;
  this.canvasStartX = canvasStartX;
  this.canvasStartY = canvasStartY;
  this.paintCanvasWidth = prePaintCanvasH;
  this.paintCanvasHeight = prePaintCanvasW;
  
  /////////////////////////////////////////////////////
  
  /*
  var absX, absY;
  //var tileOffsetX, tileOffsetY;
  
  absX = Math.abs(x);
  absY = Math.abs(y);
  //tileOffsetX = mapStartX - this.tilewidth * parseInt(mapStartX / this.tilewidth);
  //tileOffsetY = mapStartY - this.tileheight * parseInt(mapStartY / this.tileheight);
  if(absX < this.paintCanvasWidth && absY < this.paintCanvasHeight)
  {
    var input;
    var getW, getH;
    var preMapStartX, preMapStartY;
    var preCanvasStartX, canvasStartY;
    var prePaintCanvasW, prePaintCanvasH;
    
    canvasStartX = x < 0 ? this.canvasStartX + absX : this.canvasStartX;
    canvasStartY = y < 0 ? this.canvasStartY + absY : this.canvasStartY;
    cutW = this.paintCanvasWidth - absX;
    cutH = this.paintCanvasHeight - absY;
    input = context.getImageData(canvasStartX, canvasStartY, cutW, cutH);
    canvasStartX = x > 0 ? this.canvasStartX + x : this.canvasStartX;
    canvasStartY = y > 0 ? this.canvasStartY + y : this.canvasStartY;
    context.putImageData(input, canvasStartX, canvasStartY);

    if( x != 0)
     {
       if(this.widthPx > this.paintCanvasWidth)
      {
        preMapStartX = this.mapStartX;
        preMapStartY = this.mapStartY;
        preCanvasStartX = this.canvasStartX;
        preCanvasStartY = this.canvasStartY;
        prePaintCanvasW = this.paintCanvasWidth;
        prePaintCanvasH = this.paintCanvasHeight;
        canvasStartY = this.canvasStartY;
        if(x > 0)
        {
            canvasStartX = this.canvasStartX;
          mapStartX = this.mapStartX - x;
          }
          else
           {
            canvasStartX = this.paintCanvasWidth + this.canvasStartX + x;
            mapStartX = this.mapStartX + this.paintCanvasWidth;
          }
         this.paintEx(canvas, canvasStartX, canvasStartY, absX, this.paintCanvasHeight,
                  mapStartX, this.mapStartY, absX, this.paintCanvasHeight);
        this.mapStartX = preMapStartX - x;
        this.mapStartY = preMapStartY;
        this.canvasStartX = preCanvasStartX;
        this.canvasStartY = preCanvasStartY;
        this.paintCanvasWidth = prePaintCanvasW;
        this.paintCanvasHeight = prePaintCanvasH;
      }
      else if(this.widthPx < this.paintCanvasWidth)
      {
        this.canvasStartX += x;
      }
    }
    if(y != 0)
    {
      if(this.heightPx > this.paintCanvasHeight)
      {
        preMapStartX = this.mapStartX;
        preMapStartY = this.mapStartY;
        preCanvasStartX = this.canvasStartX;
        preCanvasStartY = this.canvasStartY;
        prePaintCanvasW = this.paintCanvasWidth;
        prePaintCanvasH = this.paintCanvasHeight;
        canvasStartX = x > 0 ? this.canvasStartX + x : this.canvasStartX;
        if(y > 0)
        {
          canvasStartY = this.canvasStartY;
          mapStartY = this.mapStartY - y;
        }
        else
        {
          canvasStartY = this.paintCanvasHeight + this.canvasStartY + y;
          mapStartY = this.mapStartY + this.paintCanvasHeight;
        }
      
        this.paintEx(canvas, canvasStartX, canvasStartY, this.paintCanvasWidth - absX, absY,
                  this.mapStartX, mapStartY, this.paintCanvasWidth - absX, absY);
        this.mapStartX = preMapStartX;
        this.mapStartY = preMapStartY - y;
        this.canvasStartX = preCanvasStartX;
        this.canvasStartY = preCanvasStartY;
        this.paintCanvasWidth = prePaintCanvasW;
        this.paintCanvasHeight = prePaintCanvasH;
      }
      else if(this.heightPx < this.paintCanvasHeight)
      {
        this.canvasStartY += y;
      }
    }
  }*/
}

Map.prototype.getProperty = getProperty;
Map.prototype.getExtendedProperty = getExtendedProperty;
Map.prototype.getExtendedPropertyLength = getExtendedPropertyLength;

Map.prototype.getTilesetByIndex = function (index)
{
  return this.tilesets[index];
}
Map.prototype.getTilesetByName = function (name)
{
  for(var i = 0; i < this.tilesets.length; ++i)
    if(this.tilesets[i].name == name)
      return this.tilesets[i];
}
Map.prototype.getTilesetLength = function ()
{
  return this.tilesets.length;
}
Map.prototype.getTileByGlobalId = function (id)
{
  return this.tiles[id-1];
}
Map.prototype.getTileByLayerIndexAndPoint = function (layerIndex, x, y)
{
  var layer = this.getLayerByIndex(layerIndex);
  
  if(null == layer)
    return;
  return layer.getTileByPoint(x, y);
}
Map.prototype.getTilePropertiesByLayerIndexAndPoint = function (layerIndex, x, y)
{
  var layer = this.getLayerByIndex(layerIndex);
  var tile;
  
  if(null == layer)
    return;
  tile = layer.getTileByPoint(x, y);
  if(null == tile)
    return;
  return tile.properties;
}
Map.prototype.getTileRowColByPoint = function (x, y)
{
  var row, col;
  var rx, ry;
  
  if(this.orientation == "orthogonal")
  {
    row = Math.floor(x / this.tilewidth);
    col = Math.floor(y / this.tileheight);
  }
  else if(this.orientation == "isometric")
  {
    /*
    (rx, ry) ����x��y�����ڵ�ͼ����������ֵ��
    */
    rx = x - (this.height*this.tilewidth/2);
    ry = y;
    row = rx/this.tilewidth + ry/this.tileheight;
    col = -rx/this.tilewidth + ry/this.tileheight;
  }
  if(row >= 0 && col >= 0 && row < this.width && col < this.height)
  {
    row = Math.ceil(row);
    col = Math.ceil(col);
    return {row:row, col:col};
  }
}
Map.prototype.getTileByLayerIndexAndRowCol = function (layerIndex, row, col)
{
  var layer = this.getLayerByIndex(layerIndex);
  
  if(null == layer)
    return;
  return layer.getTileByRowCol(row, col);
}
Map.prototype.getLayerByIndex = function (index)
{
  if(index < 0 || index >= this.layers.length)
    return;
  
  return this.layers[index];
}
Map.prototype.getLayerByName = function (name)
{
  for(var i = 0; i < this.layers.length; ++i)
    if(this.layers[i].name == name)
      return this.layers[i];
}
Map.prototype.getLayerLength = function ()
{
  return this.layers.length;
}
  
Map.prototype.getObjectgroupByIndex = function (index)
{
  return this.objectgroups[index];
}
Map.prototype.getObjectgroupByName = function (name)
{
  for(var i = 0; i < this.objectgroups.length; ++i)
    if(this.objectgroups[i].name == name)
      return this.objectgroups[i];
}
Map.prototype.getObjectgroupLength = function ()
{
  return this.objectgroups.length;
}
Map.prototype.isReady = function ()
{
  var i;
  
  for(i = 0; i < this.tilesets.length; ++i)
  {
    if(this.tilesets[i].image.docImage.loaded == false || this.tilesets[i].image.docImage.loaded == null)
      return false;
  }
  return true;
}

function node2Tileset(node, map)
{
  var i = 0;
  var tileset, tmp;
  
  if(node == null || node.attributes == null)
  {
    return;
  }
  
  tileset = new Tileset(map);
  
  for(; i < node.attributes.length; ++i)
  {
    switch(node.attributes[i].name)
    {
      case 'firstgid':
      case 'tilewidth':
      case 'tileheight':
      case 'spacing':
      case 'margin':
        tmp = parseInt(node.attributes[i].nodeValue);
        if(isNaN(tmp))
          return;
        tileset[node.attributes[i].name] = tmp;
        if(node.attributes[i].name == 'tilewidth')
        {
          if(tmp > map.maxTileheight)
            map.maxTilewidth = tmp;
        }
        if(node.attributes[i].name == 'tileheight')
        {
          if(tmp > map.maxTileheight)
            map.maxTileheight = tmp;
        }
        break;
      case 'name':
        tileset.name = node.attributes[i].nodeValue;
        break;
      default:
        break;
    }
  }
  
  var children = node.childNodes;
    
  if(children == null)
    return;
    
  for(i = 0; i < children.length; ++i)
  {
    node = children[i];
    if(node.nodeType != 1)
      continue;
    if(node.tagName == 'image')
    {
      if(tileset.image != null)
        return;
      tmp = node2Image(tileset, node);
      if(tmp == null)
        return;
      tileset.image = tmp;
      tileset.xTileLength = Math.floor(tileset.image.width / tileset.tilewidth);
      tileset.yTileLength = Math.floor(tileset.image.height/ tileset.tileheight);
    }
    else if(node.tagName == 'tile')
    {
      tmp = node2Tile(node, tileset);
      if(null == tmp)
        return;
      tileset.tiles.push(tmp);
    }
  }
  
  var preTileLen = map.tiles.length;
  
  tmp = Math.floor((tileset.image.width - tileset.margin)/ (tileset.tilewidth + tileset.spacing)) *  Math.floor((tileset.image.height-tileset.margin) / (tileset.tileheight + tileset.spacing));
  if(tmp < 1)
    return;

  for(i = 0; i < tmp; ++i)
  {
    map.tiles[preTileLen + i] = new Tile(tileset);
    map.tiles[preTileLen + i].id = i;
  }
  
  for(i = 0; i < tileset.tiles.length; ++i)
    map.tiles[tileset.tiles[i].getGlobalId()-1] = tileset.tiles[i];
  
  return tileset;
}

function Tileset(map)
{
  this.map = map;
  this.image;
  this.firstGid;
  this.name;
  this.tileWidth;
  this.tileHeight;
  this.spacing = 0;
  this.margin = 0;
  this.tiles = new Array();
}
Tileset.prototype.getProperty = getProperty;
Tileset.prototype.getExtendedProperty = getExtendedProperty;
Tileset.prototype.getExtendedPropertyLength = getExtendedPropertyLength;
Tileset.prototype.getImage = function ()
{
  return this.image;
}
Tileset.prototype.getTileByGlobalId = function (id)
{
  return this.map.tiles[id-1];
}

function node2Layer(node, map)
{
  var i = 0;
  var layer, tmp;
  
  if(node == null || node.attributes == null)
  {
    return;
  }
  
  layer = new Layer(map);
  for(; i < node.attributes.length; ++i)
  {
    switch(node.attributes[i].name)
    {
      case 'name':
        layer.name = node.attributes[i].nodeValue;
        break;
      case 'width':
      case 'height':
      case 'visible':
        tmp = parseInt(node.attributes[i].nodeValue);
        if(isNaN(tmp))
          return;
        layer[node.attributes[i].name] = tmp;
        break;
      default:
        break;
    }
  }
  
  var children = node.childNodes;
  
  if(children == null)
    return;

  for(i = 0; i < children.length; ++i)
  {
    node = children[i];
    if(node.nodeType != 1)
      continue;
    if(node.tagName == 'properties')
    {
      layer.properties = node2Props(node);
    }
    else if(node.tagName == 'data')
    {
      tmp = node2Data(node, layer);
      if(null == tmp)
        return;
      layer.data = tmp;
    }
  }
  
  return layer;
}

function Layer(map)
{
  this.map = map;
  this.name;
  this.width;
  this.height;
  this.visible = true;
  //data object
  this.data;
}
Layer.prototype.getProperty = getProperty;
Layer.prototype.getExtendedProperty = getExtendedProperty;
Layer.prototype.getExtendedPropertyLength = getExtendedPropertyLength;
Layer.prototype.getTileByPoint = function (x, y)
{
  var row, col;
  var map = this.map;
  var index = map.getTileRowColByPoint(x, y);
  
  if(index != null)
  {
    row = index.row;
    col = index.col;
    if(this.data.reldata[row + col * this.width] > 0)
      return map.tiles[this.data.reldata[row + col * this.width]-1];
  }
}
Layer.prototype.getTileByRowCol = function (row, col)
{
  var map = this.map;
  
  if(this.data.reldata[row + col * this.width] > 0)
      return map.tiles[this.data.reldata[row + col * this.width]-1];
}

Layer.prototype.paint = function(context)
{
  var map = this.map;
  var data = this.data.reldata;
  var tile, tileOffsetY, tileOffsetX;
  
  //map ����ϵ
  var row, col, startRow, startCol, endRow, endCol;
  var mapRowStartX = 0, mapRowStartY = 0;
  var tileTopLeftX, tileTopLeftY;
  
  //canvas ����ϵ
  var tileCanvasX, tileCanvasY;
  var paintTileTopLeftX, paintTileTopLeftY;
  var paintTileBottomRightX, paintTileBottomRightY;
  
  var tmp;

/*
Ŀǰ��ͼ�ƶ�������canvas��transform���ã����Ʋ��������������ܲ������á�
�������жϲ�׼ȷ����Ϊcanvas����ϵ�Ѿ�transform���ˣ����Ե������㲻��ȷ����
��ΪĿǰֻ��������ͼȫ�����ơ�
*/  
/*  
  startRow = Math.floor(map.mapStartX / this.map.tilewidth);
  startCol = Math.floor(map.mapStartY / this.map.tileheight);
  endRow = Math.ceil((map.mapStartX + map.rectWidth) / this.map.tilewidth);
  endCol = Math.ceil((map.mapStartY + map.rectHeight) / this.map.tileheight);
  if(map.maxTilewidth > map.tilewidth)
  {
    tmp = Math.ceil((map.maxTilewidth - map.tilewidth) / map.tilewidth);
    endRow += tmp;
    if(endRow > map.width - 1)
      endRow = map.width - 1;
  }
  if(map.maxTileheight > map.tileheight)
  {
    tmp = Math.ceil((map.maxTileheight - map.tileheight) / map.tileheight);
    startCol -= tmp;
    if(startCol < 0)
      startCol = 0;
  }
  
/*
  for(col = startCol; col <= endCol; ++col)
  {
    mapRowStartY = col * map.tileheight;
    var offset = col * this.width;
    for(row = startRow; row <= endRow; ++row)
    {
      tile = map.tiles[data[row + offset]-1];
      if(null != tile)
      {
        tileTopLeftX = row * map.tilewidth;
        tileTopLeftY = mapRowStartY - (tile.tileset.tileheight - map.tileheight);
        //��map����ϵ�ϵ�����ת����canvas����ϵ������
        tileCanvasX = tileTopLeftX - map.mapStartX + map.canvasStartX;
        tileCanvasY = tileTopLeftY - map.mapStartY + map.canvasStartY;
        //�ж�tile�ľ��������Ƿ������ƾ��������ཻ
        paintTileTopLeftX = Math.max(tileCanvasX, map.canvasStartX);
        paintTileTopLeftY = Math.max(tileCanvasY, map.canvasStartY);
        paintTileBottomRightX = Math.min(tileCanvasX + tile.tileset.tilewidth, map.canvasStartX + map.rectWidth);
        paintTileBottomRightY = Math.min(tileCanvasY + tile.tileset.tileheight, map.canvasStartY + map.rectHeight);
        if(paintTileTopLeftX < paintTileBottomRightX && paintTileTopLeftY < paintTileBottomRightY)
        {
          //�����ཻ
          tileOffsetX = paintTileTopLeftX - tileCanvasX;
          tileOffsetY = paintTileTopLeftY - tileCanvasY;
          tile.draw(context, paintTileTopLeftX, paintTileTopLeftY, paintTileBottomRightX - paintTileTopLeftX,
                          paintTileBottomRightY - paintTileTopLeftY, tileOffsetX, tileOffsetY);
        }
      }
    }
  }
*/
 
  for(col = 0; col < map.height ; ++col)
  {
    mapRowStartY = col * map.tileheight;
    var offset = col * this.width;
    for(row = 0; row < map.width; ++row)
    {
      tile = map.tiles[data[row + offset]-1];
      if(null != tile)
      {
        tileTopLeftX = row * map.tilewidth;
        tileTopLeftY = mapRowStartY - (tile.tileset.tileheight - map.tileheight);
        //��map����ϵ�ϵ�����ת����canvas����ϵ������
        tileCanvasX = tileTopLeftX - map.mapStartX + map.canvasStartX;
        tileCanvasY = tileTopLeftY - map.mapStartY + map.canvasStartY;
        
        tile.draw(context, tileCanvasX, tileCanvasY, map.tilewidth, map.tileheight, 0, 0);
      }
    }
  }
}

Layer.prototype.paintIso = function (context)
{
  var map = this.map;
  var data = this.data.reldata;
  var tile, tileOffsetY, tileOffsetX;
  
  //map ����ϵ
  var row, col/*, startRow, startCol, endRow, endCol*/;
  var mapTopX, mapTopY;
  var mapRowStartX, mapRowStartY;
  var tileTopLeftX, tileTopLeftY;
  
  //canvas ����ϵ
  var tileCanvasX, tileCanvasY;
  var paintTileTopLeftX, paintTileTopLeftY;
  var paintTileBottomRightX, paintTileBottomRightY;
  
/*  
  var tmp;
  
  //startRow ���Ͻǣ�startCol���Ͻǣ�endRow���½ǣ�endCol���½�
        startRow = Math.ceil((map.mapStartX - map.height*map.tilewidth/)/map.tilewidth + map.mapStartY/map.tileheight);
        startCol = Math.ceil((map.height*map.tilewidth/2 - (map.mapStartX + map.rectWidth))/map.tilewidth + map.mapStartY/map.tileheight);
  endRow = Math.ceil(((map.mapStartX + map.rectWidth) - map.height*map.tilewidth/)/map.tilewidth + (map.mapStartY+map.rectHeight)/map.tileheight);
  endCol = Math.ceil((map.height*map.tilewidth/2 - map.mapStartX)/map.tilewidth + (map.mapStartY + map.rectHeight)/map.tileheight);
  if(map.maxTilewidth > map.tilewidth)
  {
    tmp = Math.ceil((map.maxTilewidth - map.tilewidth) / map.tilewidth);
    startRow = startRow - tmp;
  }
  if(map.maxTileheight > map.tileheight)
  {
    tmp = Math.ceil((map.maxTileheight - map.tileheight) / map.tileheight);
    endCol = endCol + tmp;
  }
  */  
  mapTopX = (this.height - 1) * map.tilewidth / 2;
  mapTopY = 0;
  
  /*
  for(col = 0; col < map.height; ++col)
  {
    mapRowStartX = mapTopX - col * map.tilewidth / 2;
    mapRowStartY = mapTopY + col * map.tileheight / 2;
    for(row = 0; row < map.width; ++row)
    {
      tile = map.tiles[data[row + col * this.width]-1];
      if(null != tile)
      {
        tileTopLeftX = mapRowStartX + row * map.tilewidth / 2;
        tileTopLeftY = mapRowStartY + row * map.tileheight / 2 - (tile.tileset.tileheight - map.tileheight);
        //��map����ϵ�ϵ�����ת����canvas����ϵ������
        tileCanvasX = tileTopLeftX - map.mapStartX + map.canvasStartX;
        tileCanvasY = tileTopLeftY - map.mapStartY + map.canvasStartY;
        //�ж�tile�ľ��������Ƿ������ƾ��������ཻ
        paintTileTopLeftX = Math.max(tileCanvasX, map.canvasStartX);
        paintTileTopLeftY = Math.max(tileCanvasY, map.canvasStartY);
        paintTileBottomRightX = Math.min(tileCanvasX + tile.tileset.tilewidth, map.canvasStartX + map.rectWidth);
        paintTileBottomRightY = Math.min(tileCanvasY + tile.tileset.tileheight, map.canvasStartY + map.rectHeight);
        if(paintTileTopLeftX < paintTileBottomRightX && paintTileTopLeftY < paintTileBottomRightY)
        {
          //�����ཻ
          tileOffsetX = paintTileTopLeftX - tileCanvasX;
          tileOffsetY = paintTileTopLeftY - tileCanvasY;
          tile.draw(context, paintTileTopLeftX, paintTileTopLeftY, paintTileBottomRightX - paintTileTopLeftX,
                          paintTileBottomRightY - paintTileTopLeftY, tileOffsetX, tileOffsetY);
        }
      }
    }
  }
  */
  for(col = 0; col < map.height; ++col)
  {
    mapRowStartX = mapTopX - col * map.tilewidth / 2;
    mapRowStartY = mapTopY + col * map.tileheight / 2;
    for(row = 0; row < map.width; ++row)
    {
      tile = map.tiles[data[row + col * this.width]-1];
      if(null != tile)
      {
        tileTopLeftX = mapRowStartX + row * map.tilewidth / 2;
        tileTopLeftY = mapRowStartY + row * map.tileheight / 2 - (tile.tileset.tileheight - map.tileheight);
        //��map����ϵ�ϵ�����ת����canvas����ϵ������
        tileCanvasX = tileTopLeftX - map.mapStartX + map.canvasStartX;
        tileCanvasY = tileTopLeftY - map.mapStartY + map.canvasStartY;

        tileOffsetX = paintTileTopLeftX - tileCanvasX;
        tileOffsetY = paintTileTopLeftY - tileCanvasY;
        tile.draw(context, tileCanvasX, tileCanvasY, map.tilewidth, map.tileheight, 0, 0);
      }
    }
  }
}

Layer.prototype.scan = function (layerIndex)
{
  var map = this.map;
  var idarray = this.data.reldata;
  var i, j, tile, tileset;
  var start, tmp;

  for(i = 0; i < map.height; ++i)
  {
    for(j = 0; j < map.width; ++j)
    {
      tile = map.getTileByGlobalId(idarray[i * map.width + j]);
      tileset = tile.tileset;
      map.drawImagetiles[i * map.width + j].push(new PaintTile(layerIndex, i, j, tile));
      if(tileset.tilewidth > map.tilewidth)
      {
        tmp = Math.ceil((tileset.tilewidth - map.tilewidth) / map.tilewidth);
        end = Math.min(j + tmp + 1, map.width);
        for(w = j + 1; w <= end; ++w)
        {
          map.drawImagetiles[i * map.width + w].push(new PaintTile(layerIndex, i, w, tile));
        }
      }
      if(tileset.tileheight > map.tileheight)
      {
        tmp = Math.ceil((tileset.tileheight - map.tileheight) / map.tileheight);
        end = Math.max(i - tmp, 0);
        for(w = i - 1; w >= end; --w)
        {
          map.drawImagetiles[w * map.width + j].push(new PaintTile(layerIndex, w, j, tile));
        }
      }
    }
  }
}

Layer.prototype.scanIso = function (layerIndex)
{
  var map = this.map;
  var i, j;
  
  for(i = 0; i < map.height; ++i)
  {
    for(j = 0; j < map.width; ++j)
    {
    }
  }
}


function node2Objectgroup(node)
{
  var children = node.childNodes;
  var tmp, i;
  
  if(children == null)
    return;
  
  var objGroup = new Objectgroup();

  for(i = 0; i < node.attributes.length; ++i)
  {
    switch(node.attributes[i].name)
    {
      case 'name':
      case 'color':
        objGroup[node.attributes[i].name] = node.attributes[i].nodeValue;
        break;
      case 'width':
      case 'height':
        tmp = parseInt(node.attributes[i].nodeValue);
        if(isNaN(tmp))
          return;
        objGroup[node.attributes[i].name] = tmp;
        break;
      default:
        break;
    }
  }
    
  for(i = 0; i < children.length; ++i)
  {
    node = children[i];
    if(node.nodeType != 1)
      continue;
    if(node.tagName == 'properties')
    {
      objGroup.properties = node2Props(node);
    }
    else if(node.tagName == 'object')
    {
      tmp = node2Object(node);
      if(null == tmp)
        return;
      objGroup.objects.push(tmp);
    }
  }
  
  return objGroup;
}

function Objectgroup()
{
  this.name;
  this.width;
  this.height;
  this.visible;
  this.objects = new Array();
}
Objectgroup.prototype.getProperty = getProperty;
Objectgroup.prototype.getExtendedProperty = getExtendedProperty;
Objectgroup.prototype.getExtendedPropertyLength = getExtendedPropertyLength;
Objectgroup.prototype.getObjectByIndex = function (index)
{
  return this.objects[index];
}
Objectgroup.prototype.getObjectLength = function ()
{
  return this.objects.length;
}

function node2Image(tileset, node)
{
  var attrs = node.attributes;
  var tmp;
  var i = 0;
  var img = new TilesetImage();
  
  if(attrs.length < 1)
    return;

  for(; i < attrs.length; ++i)
  {
    switch(attrs[i].name)
    {
      case 'source':
        img[attrs[i].name] = tileset.map.filepath + attrs[i].nodeValue;
        break;
      case 'trans':
        img[attrs[i].name] = attrs[i].nodeValue;
        break;
      case 'width':
      case 'height':
        tmp = parseInt(attrs[i].nodeValue);
        if(isNaN(tmp))
          return;
        img[attrs[i].name] = tmp;
        break;
      default:
        break;
    }
  }
  
  img.docImage = helper.loadImage(img.source);
  if(img.width == null)
    img.width = img.docImage.width;
  if(img.height == null)
    img.height = img.docImage.height;
  return img;
}


function TilesetImage()
{
  this.source;
  this.trans;
  this.width;
  this.height;
  this.docImage;
}
TilesetImage.prototype.getProperty = getProperty;


function node2Tile(node, tileset)
{
  var tile = new Tile(tileset);
  var tmp;
  
  tmp = parseInt(node.getAttribute("id"));
  if(isNaN(tmp))
    return; 
  tile.id = tmp;
  
  var children = node.childNodes;
  
  for(var i = 0; i < children.length; ++i)
  {
    node = children[i];
    if(node.nodeType != 1)
      continue;
    if(node.tagName == 'properties')
    {
      tmp = node2Props(node);
      if(null == tmp)
        return;
      tile.properties = tmp;
      break;
    }
  }

  return tile;
}

function Tile(tileset)
{
  this.id;
  this.tileset = tileset;
}
Tile.prototype.getProperty = getProperty;
Tile.prototype.getExtendedProperty = getExtendedProperty;
Tile.prototype.getExtendedPropertyLength = getExtendedPropertyLength;
Tile.prototype.getGlobalId = function ()
{
  return this.id + this.tileset.firstgid;
}
Tile.prototype.getTileset = function ()
{
  return this.tileset;
}

Tile.prototype.draw = function (context, drawCanvasStartX, drawCanvasStartY, drawW, drawH, tileOffsetX, tileOffsetY)
{
  var tileset = this.tileset;
  var sX, sY;
  //point(xTile, yTile): image tile ������ͼƬ�ϵĿ�ʼ����
  var xTile, yTile;
  var col = Math.floor(this.id/ tileset.xTileLength);

  if(this.xTile == null || this.yTile == null)
  {
    //this.xTile = Math.round((tmp - Math.floor(tmp)) * tileset.xTileLength * (tileset.tilewidth + tileset.spacing)) + tileset.margin;
    this.xTile =(this.id % tileset.xTileLength * (tileset.tilewidth + tileset.spacing)) + tileset.margin;
    this.yTile = ((tileset.tileheight+tileset.spacing) * col) + tileset.margin;
  }
  
  sX = this.xTile + tileOffsetX;
  sY = this.yTile + tileOffsetY;

  /*
  var imgTileSrc;
  if(tileOffsetX == 0 && tileOffsetY == 0 && drawW == tileset.tilewidth && drawH == tileset.tileheight)
  {
    if(this.imgTileSrc == null)
      this.imgTileSrc = tileset.image.docImage.get(sX, sY, drawW, drawH);
    imgTileSrc = this.imgTileSrc;
  }
  else
  {
    imgTileSrc = tileset.image.docImage.get(sX, sY, drawW, drawH);
  }
  context.image(imgTileSrc, drawCanvasStartX, drawCanvasStartY, drawW, drawH);
  */
  //context.imageEx(tileset.image.docImage, sX, sY, drawW, drawH, drawCanvasStartX, drawCanvasStartY , drawW, drawH);
  context.drawImage(tileset.image.docImage.sourceImg, sX, sY, drawW, drawH, drawCanvasStartX, drawCanvasStartY, drawW, drawH);
  //context.externals.context.fillStyle = "white";
  //context.externals.context.fillRect(drawCanvasStartX, drawCanvasStartY, 32.9, 32.9);
}

function node2Object(node)
{
  var attrs = node.attributes, tmp;
  var i = 0;
  var obj = new Logicobject();
  
  if(attrs.length < 1)
    return;

  for(; i < attrs.length; ++i)
  {
    switch(attrs[i].name)
    {
      case 'x':
      case 'y':
      case 'width':
      case 'height':
         tmp = parseInt(attrs[i].nodeValue);
        if(isNaN(tmp))
          return;
        obj[attrs[i].name] = tmp;
        break;
      case 'name':
      case 'type':
        obj[attrs[i].name] = attrs[i].nodeValue;
      default:
        break;
    }
  }
  
  var children = node.childNodes;
  
  for(i = 0; i < children.length; ++i)
  {
    node = children[i];
    if(node.nodeType != 1)
      continue;
    if(node.tagName == 'properties')
    {
      tmp = node2Props(node);
      if(null == tmp)
        return;
      obj.properties = tmp;
      break;
    }
  }
  
  return obj;
}

function Logicobject()
{
  this.x;
  this.y;
  this.width;
  this.height;
  //name��type���Կ���û��
  this.name;
  this.type;
}
Logicobject.prototype.getProperty = getProperty;
Logicobject.prototype.getExtendedProperty = getExtendedProperty;
Logicobject.prototype.getExtendedPropertyLength = getExtendedPropertyLength;
Logicobject.prototype.isInSide = function (x, y)
{
  if(x >= this.x && y >= this.y && x <= (this.x + this.width) && y < (this.y + height))
    return true;
  return false;
}
Logicobject.prototype.getStartPoint = function ()
{
  return {x:this.x, y:this.y};
}
Logicobject.prototype.getEndPoint = function ()
{
  return {x:(this.x + this.width), y:(this.y + this.height)};
}

function node2Data(node, layer)
{
  var data = new Data(layer);
  var children = node.childNodes;
  var i= 0, index = 0, id;
  var txt = "";
  var ary = new Array(layer.width * layer.height);
  //the start position and the end position of each number
  var start = 0, end = 0;
  
  while(i < children.length)
  {
    txt += children[i].data;
    ++i;
  }
  
  data.encoding = node.getAttribute("encoding");
  data.compression = node.getAttribute("compression");
    
  if(data.encoding == "csv")
  {
    id = parseInt(txt);
    if(isNaN(id))
      return;
    ary[index++] = id;
    start = end = txt.indexOf(",");
    if(start < 0)
      return;
    i = start + 1;
    while(i < txt.length)
    {
      if(txt.charAt(i) == ",")
      {
        start = end;
        end = i;
        id = parseInt(txt.slice(start + 1, end))
        if(isNaN(id))
          return;
        ary[index++] = id;
      }
      ++i;
    }
    id = parseInt(txt.slice(end + 1, txt.length))
    if(isNaN(id))
      return;
    ary[index++] = id;
    if(index != ary.length)
      return;
    data.reldata = ary;
  }
  else if(data.encoding == "base64")
  {
    var aryData = gzip.unzipBase64AsArray(txt, 4);
    
    if(null == aryData)
      return;
    data.reldata = aryData;
  }
  
  return data;
}

function Data(layer)
{
  this.encoding;
  this.compression;
  this.reldata = new Array;
  this.layer = layer;
}

function Properties()
{
  this.length = 0;
  Properties.prototype.addProperty = function (name, value)
  {
    if(name == null)
      return;
    ++this.length;
    this[name] = value;
  }
}

function node2Props(node)
{
  var i;
  var children, curNode;
  var props = new Properties();
  
  if(node == null)
    return;
    
  children = node.childNodes;
  if(children == null)
    return;
      
  for(i = 0; i < children.length; ++i)
  {
    curNode = children[i];
    if(curNode.nodeType != 1)
      continue;
    if(curNode.tagName == "property")
      props.addProperty(curNode.getAttribute("name"), curNode.getAttribute("value"));
  }
  return props;
}

module.exports.buildMap = buildMap;
module.exports.Map = Map;

}};