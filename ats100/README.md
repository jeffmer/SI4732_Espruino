# ATS100 Radio programmed with Espruino

The SI4732 essentially supports three separate radio modes, FM, AM (including SW) and SSB (via a patch). The set of commands and properties supported by these three modes is not the same although there is overlap - for example SSB does not have a scan command. Consequently, to facilitate experimentation and to simplify interfaces, each of the three modes is supported by a different radio app invoked from the home screen shown below:

![](../image/ats100home.jpg)

In contrast to the ATS-25 which has a touch screen, all interaction is via the rotary controller. To select a button or a control such as the BAND selector, turn the knob until the button/control is highlighted, then push the button to activate. 

Each of the radio apps saves frequency, volume, brightness and bandwidth settings on exit and these are restored the next time the app is entered. 

## FM Radio

The FM radio application supports RDS and stations can be saved as presets in the list on the right of the screen shown below using the RDS information.

![](../image/fmapp.jpg)


## AM Radio

The AM wavebands shown in the window on the right of the screen can be scolled through using the rotary controller. They are defined in a file stored in Espruino storage. This file ```bands.json``` can be easily modified using the Espruino IDE.

![](../image/amapp.jpg)

## SSB Radio

There is a short delay  - caused by the need to load the SSB patch into the SI4732 - before the SSB radio app launches. The wavebands are stored in the same ```bands.json``` file as for the AM radio.

![](../image/ssbapp.jpg)

The tuning increment can be changed to 10,000Hz, 1000Hz, 100Hz or 10Hz using the rotary controller button - see 1000Hz underline in screen shot. Tuning uses the SSB patch BFO property to minimise 'chuff' on tuning to a different frequency using the tune command.

## Direct Frequency Input

Each of the above three radio apps permits a user to directly input the desired frequency to tune by double clicking with the pushbutton on the frequency display.

![](../image/dclick.jpg)



## TO BE DONE

Installation instructions







