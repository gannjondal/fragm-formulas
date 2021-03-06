# Formula, and sample .frags for the Fragmentarium program

## Intention, Notes:
**This repository is thought as a playground for any sort of GLSL .frag files that can be used for the fractal oriented GLSL shader program Fragmentarium (FragM), _and which are not (yet) thought to be incorporated into the actual distribution._**     
I don't want to spam the program with all the frags that may come up, especially in any forum, or gallery threads. As said this repository is more a playground.

The current active variant of Fragmentarium can be found at https://github.com/3Dickulus/FragM - Please note that my frags are only developed for, and tested on Fragmentarium releases from that fork.  
The formulas shared with distribution are developed under https://github.com/3Dickulus/Fragmentarium_Examples_Folder   
My own contributions for this Examples folder are/will be available at https://github.com/gannjondal/fragm-examples .

Originally these `ABC-formulas` repositories were mainly intended to publish my own formulas, and related samples for the several fractal programs I use.   
This was mainly since I found that I need a central place for my formulas rather to have them scattered across the fractal forums, deviantart etc.   
Also I made the experience in earlier days in Ultrafractal that versioning 'by hand' is really a nightmare - I know, that should be self-evident for any 'real' developer, but I don't see me as true developer, and hence I felt into that trap...   

However, while thinking about the way to build such a central repository I came to the conlusion that I would like to follow more the common open source approach, and to publish the formulas in a way that everyone can contribute.   
Therefore - Please feel free to contribute, ask for changes / corrections / improvements, to add your comments, and questions etc.   

## Usage:
To use this .frag files you should generally know how to work with Fragmentarium.   
You can load the .frag files using the common File\-\>Open dialog - or copy its text to the GLSL code window.   

## Folders:
- The folder /frags will contain frags independent from any publishing elsewhere. Any possible development will happen here.  
- The folder [/published-samples](published-samples/) contains frags published elsewhere (currently at fractalforums.org only).    
  The files will not be changed, beyond any possible improvements of non-functional parts like documentation etc.   
  Other corrections would result in new files to keep compatibility with the existing forum threads.   
  
## Disclaimer:
The formulas have been tested on my box (currently a Windows 10 with an old AMD 280X card) - and sometimes nowhere else.   
Also the formulas are exclusively tested on Fragmentarium releases from the fork https://github.com/3Dickulus/FragM .
I know that glsl code is highly dependent from the hardware, especially there are differences in impementation between the hardware producers.   
But I neither have the capacity, nor the intention to test them somewhere else than on my normal boxes, or any other potential release, or fork.   
Hence I cannot provide any warranty for this code. -    
Please however do not hesitate to share your experiences, or to add code that helps to run it on other hardware.   
As of now I'm publishing all of my formulas under the LGPL license (see the according license file if you really should like that stuff)...   

My formulas (need to) incorporate frags from other people using the \#include command to be able to run on Fragmentarium.   
For the includes I use (if not explicitely stated differently) only frags available through the above linked FragM, and example repositories.    
These frags have several authors with their own licenses, and disclaimers (if any). And the same is of course valid for the actual Fragmentarium program.   
Hence please check the according notes in the FragM, and example repositories.
