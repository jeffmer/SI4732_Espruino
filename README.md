# SI4732 Radios programmed with Espruino

These all-band (FM,LW,MW,SW with SSB) radios (see pictures below) are available on AliExpress and Ebay. They consist of an SI4732-A10 chip which provides the radio functions driven via I2C by an ESP32 WROOM module which implements the display interface. In the case of the ATS25, this  is an ILI9341 (with XPT2046 touch ) 320x240 pixel display. In the case of the ATS100, the display is an 240x135 ST7789V with no touch interface. Both radios have a rotary controller incoporation a push button switch.

![](image/ats25.jpg)  ![](image/ats100.jpg)

There is an extensive well documented Arduino library for the SI4732 and a sketch which implements the firmware running on the ATS25. The firmware can easily be updated from Arduino via the USB-C ports on the radios. However, the combined library and sketch  is over 10,000 lines of C++ which makes it cumbersome to change so the Espruino versions are to faciltate experimentation. The Espruino implementation is not as responsive as the Arduino software, however, it permits rapid change using the [Espruino IDE](https://www.espruino.com/ide/).

![ATS25](ats25/README.md) 


![ATS100](ats100/README.md) 









