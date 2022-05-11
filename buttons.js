

var BG=g.toColor(0,1,0);                                                                              ;
var FG=g.toColor(0.7,0.6,0.7);
var HBG=g.toColor(1,0,0);
g.setFont("Vector",18);

g.setColor(FG).fillRect(0,0,319,239);

function drawButton(title,x,y){
  var sz = g.stringMetrics(title);
  var w = sz.width+10, h =sz.height+5;
  g.setColor(BG).fillRect({x:x,y:y,x2:x+w-1,y2:y+h-1,r:8});
  g.setColor(0).setFontAlign(0,0).drawString(title,x+w/2+2,y+h/2+2);
}


drawButton("Mute",50,50);