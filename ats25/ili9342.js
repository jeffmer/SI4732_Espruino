/* 
Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission.

Updated for use in ESP32 using lcd_spi_unbuf by Jeff Magee
 */

function ILI9342() {
    var LCD_WIDTH = 320;
    var LCD_HEIGHT = 240;
    var XOFF = 0;
    var YOFF = 0;
    var cmd = lcd_spi_unbuf.command;

    function dispinit(rst,fn) {
        function delayms(d) {var t = getTime()+d/1000; while(getTime()<t);}
        if (rst) {
            digitalPulse(rst,0,10);
        } else {
            cmd(0x01); //ST7735_SWRESET: Software reset, 0 args, w/delay: 150 ms delay
        }
        delayms(10);
        cmd(0x28);
        cmd(0xCF,[0x00,0x83,0x30]);
        cmd(0xED,[0x64,0x03,0x12,0x81]);
        cmd(0xE8,[0x85,0x01,0x79]);
        cmd(0xCB,[0x39,0x2C,0x00,0x34,0x02]);
        cmd(0xF7,0x20);
        cmd(0xEA,[0x00,0x00]);
        cmd(0xC0,0x26);
        cmd(0xC1,0x11);
        cmd(0xC5,[0x35,0x3E]);
        cmd(0xC7,0xBE);
        cmd(0x36,0x28);
        cmd(0x3A,0x55);
        cmd(0xB1,[0x00,0x1B]);
        cmd(0xF2,0x08);
        cmd(0x26,0x01);
        cmd(0xE0,[0x1F,0x1A,0x18,0x0A,0x0F,0x06,0x45,0x87,0x32,0x0A,0x07,0x02,0x07,0x05,0x00]);
        cmd(0xE1,[0x00,0x25,0x27,0x05,0x10,0x09,0x3A,0x78,0x4D,0x05,0x18,0x0D,0x38,0x3A,0x1F]);
        cmd(0xB7,0x07);
        cmd(0xB6,[0x0A,0x82,0x27,0x00]);
        cmd(0x11);
        delayms(100);
        cmd(0x29);
        delayms(100);
        if (fn!==undefined) fn();
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
        g.lcd_sleep = function(){cmd(0x10);};
        g.lcd_wake = function(){cmd(0x11);};
        dispinit(rst, ()=>{g.clear().setFont("Vector",24).drawString("ESP32 Espruino",40,100);});
        return g;
    }

    //var spi = new SPI();
    //SPI1.setup({sck:D18, mosi:D23, baud: 20000000});

    return connect({spi:SPI1, dc:D2, cs:D15, rst:D4});
}




