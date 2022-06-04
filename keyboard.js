class Keyboard {
  constructor(low,high,fn){
    this.low = low;
    this.high = high;
    this.buf = Graphics.createArrayBuffer(160,50,1,{msb:true});
    this.keys = [];
    this.ACC=0;
    this.VALID=false;
    this.fn = fn;
  }

  display() {
    this.buf.clear();
    this.buf.setFont("Vector",32).setFontAlign(1,0).drawString((this.freq()/100).toFixed(1),135,25);
    g.setColor(this.valid()?Green:-1).drawImage(this.buf,80,5);
  }

  freq() {
    return this.ACC*10;
  }

  valid() {
    var f = this.freq();
    return (f<=this.high&&f>=this.low);
  }

  update(s){
    if (s!="<")
        this.ACC=this.ACC*10+s;
    else
        this.ACC=Math.floor(this.ACC/10);
    this.display(); 
  }

  init(){
    var keyfn = (s) => {this.update(s);};
    for (var j =0;j<3;j++)
    for (var i =0;i<3;i++)
       this.keys[j*3+i+1] = new Button(j*3+i+1,80+55*i,60+j*41,50,36,keyfn,28);
    this.keys[0] = new Button(0,80,183,75,36,keyfn,28);
    this.keys[10] = new Button("<",165,183,75,36,keyfn,28);
    this.keys[11] = new Button("Enter",245,183,70,36,this.fn);
    return this;
  }
  
  enable(b) {
    if (b) {
      this.ACC = 0;
      TC.touchHandler = (p)=> {
        for (var i =0;i<this.keys.length;i++) if (this.keys[i].actOnTouch(p)) return;
      };
      TC.on("touch", TC.touchHandler);
    } else {
      if (TC.touchHandler){
       TC.removeListener("touch",TC.touchHandler);
       delete TC.touchHandler;
      }
    }
    return this;
  }      
    
  draw(){
    var lowstr = (this.low/100).toFixed(1);
    var highstr = (this.high/100).toFixed(1);
    this.display();
    g.setColor(-1).setFont("Vector",20).setFontAlign(-1,0).drawString("MHz",260,30);
    g.setFont("6x8",1)
     .drawString("Low:\n"+lowstr+" Mhz\nHigh:\n"+highstr+" MHz",20,30);
    for (var i =0;i<this.keys.length;i++) this.keys[i].draw();
  }
}

function toKBD() {
  SCREEN=1;
  clearControls();
  g.setColor(Grey).fillRect(0,0,319,239);
  KBD.enable(true).draw();
}

function toRADIO() {
  SCREEN=0;
  KBD.enable(false);
  if (KBD.valid()) {
    setTune(KBD.freq());
    SELECTED=-1;
  }
  setControls();
  drawFM();
}

var KBD = new Keyboard(LOWBAND,HIGHBAND,toRADIO).init();

var SCREEN = 0;

TC.swipeHandler = (dir) => {
  if (dir == TC.DOWN && SCREEN == 0) {
    toKBD();
    return;
  }
  if (dir == TC.UP && SCREEN == 1) {
    toRADIO();
    return;
  }
};

TC.on("swipe",TC.swipeHandler);