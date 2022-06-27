var STOR = require("Storage");
function setSPI1Freq(f){
    SPI1.setup({sck:D18, mosi:D23, miso:D19, baud: f});
    lcd_spi_unbuf.setSPI(SPI1);
 }
setSPI1Freq(20000000);
eval(STOR.read("ili9342.js"));
var g = ILI9342();
const Grey = g.toColor(0.6,0.6,0.6);
const Green = g.toColor(0,1,0);
const Yellow = g.toColor(1,1,0);
const Blue = g.toColor(0,0,1);
eval(STOR.read("xpt2046.js"));
var TC = createXPT2046();
eval(STOR.read("encoder.js"));
var ROTARY = createEncoder(D16,D17);
//var ROTARY = createEncoder(D14,D12);
eval(STOR.read("si4735.js"));
RADIO.reset();

function watchD33(fn){
    global.D33STATE=false;
    global.D33POLL = setInterval(()=>{
        var pressed = (analogRead(D33)< 0.2); 
        if (pressed && !global.D33STATE) fn();
        global.D33STATE=pressed;
    },200);
}

function clearD33(){ if (global.D33POLL) global.D33POLL = clearInterval(global.D33POLL);}

TC.on("longtouch",()=>{load("chooser.js");});

