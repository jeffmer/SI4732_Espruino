function ST7789() {
    var LCD_WIDTH = 240;
    var LCD_HEIGHT = 135;
    var XOFF = 40;
    var YOFF = 52;
    var INVERSE = 1;
    var ROTATE = 5;
    var cmd = lcd_spi_unbuf.command;

    function dispinit(rst,fn) {
        function delayms(d) {var t = getTime()+d/1000; while(getTime()<t);}
        if (rst) {
            digitalPulse(rst,0,10);
        } else {
            cmd(0x01); //ST7735_SWRESET: Software reset, 0 args, w/delay: 150 ms delay
        }
        delayms(120);   // no apps to run 
        cmd(0x11); //SLPOUT
        delayms(50);
        //MADCTL: Set Memory access control (directions), 1 arg: row addr/col addr, bottom to top refresh
        cmd(0x36, ROTATE<<5 | 0x00);
        //COLMOD: Set color mode, 1 arg, no delay: 16-bit color
        cmd(0x3a, 0x05);
        //PORCTRL: Porch control
        cmd(0xb2, [0x0b, 0x0b, 0x33, 0x00, 0x33]);
        //GCTRL: Gate control
        cmd(0xb7, 0x11);
        // VCOMS: VCOMS setting
        cmd(0xbb, 0x35);
        //LCMCTRL: CM control
        cmd(0xc0, 0x2c);
        //VDVVRHEN: VDV and VRH command enable
        cmd(0xc2, 0x01);
        // VRHS: VRH Set
        cmd(0xc3, 0x08);
        // VDVS: VDV Set
        cmd(0xc4, 0x20);
        //VCMOFSET: VCOM Offset Set .
        cmd(0xC6, 0x1F);
        //PWCTRL1: Power Control 1
        cmd(0xD0, [0xA4, 0xA1]);
        // PVGAMCTRL: Positive Voltage Gamma Control
        cmd(0xe0, [0xF0, 0x04, 0x0a, 0x0a, 0x08, 0x25, 0x33, 0x27, 0x3d, 0x38, 0x14, 0x14, 0x25, 0x2a]);
        // NVGAMCTRL: Negative Voltage Gamma Contro
        cmd(0xe1, [0xf0, 0x05, 0x08, 0x07, 0x06, 0x02, 0x26, 0x32, 0x3d, 0x3a, 0x16, 0x16, 0x26, 0x2c]);
        if (INVERSE) {
        //TFT_INVONN: Invert display, no args, no delay
        cmd(0x21);
        } else {
        //TFT_INVOFF: Don't invert display, no args, no delay
        cmd(0x20);
        }
        //TFT_NORON: Set Normal display on, no args, w/delay: 10 ms delay
        cmd(0x13);
        //TFT_DISPON: Set Main screen turn on, no args w/delay: 100 ms delay
        cmd(0x29);
        if (fn) fn();
    }

    function connect(options , callback) {
        var spi=options.spi, dc=options.dc, ce=options.cs, rst=options.rst;
        var g = lcd_spi_unbuf.connect(options.spi, {
            dc: options.dc,
            cs: options.cs,
            height: LCD_HEIGHT,
            width: LCD_WIDTH,
            colstart: XOFF,
            rowstart: YOFF
        });
        g.lcd_sleep = function(){cmd(0x10);cmd(0x28);};
        g.lcd_wake = function(){cmd(0x29);cmd(0x11);};
        dispinit(rst, ()=>{g.clear(1).setFont("6x8").drawString("Loading...",20,20);});
        return g;
    }

    //var spi = new SPI();
    SPI1.setup({sck:D18, mosi:D19, baud: 20000000});

    return connect({spi:SPI1, dc:D16, cs:D5, rst:D23});
}

var brightness= function(v){
    v = v>1?1:v<0?0:v;
    if (v==0||v==1)
        digitalWrite(D4,v);
      else
        analogWrite(D4,v,{freq:60});
};

/* Test Code
brightness(1);
var g = ST7789();
g.setColor(1,0,0);
g.fillRect(0,0,239,134);
g.setColor(1,1,1);
g.drawLine(0,0,239,134);
g.drawLine(0,134,239,0);
*/