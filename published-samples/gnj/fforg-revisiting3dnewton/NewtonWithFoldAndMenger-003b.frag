#include "MathUtils.frag"
#include "DE-Raytracer.frag" 

#group NewtonVarPower
uniform float Power; slider[-64,3,64]
uniform vec3 Solution; slider[(-4,-4,-4),(1,0,0),(4,4,4)]
uniform float Factor_Phi; slider[-20,1,20]
uniform float Factor_Theta; slider[-20,1,20]
uniform float Fake_Bailout; slider[-20,1,20]
uniform float DEscale1; slider[0,1,2]
uniform float DEoffset1; slider[0,0,8]
uniform float Offset; slider[1.0e-15,0.0001,1]
uniform float Bailout; slider[0.001,4,1024]
uniform int Iterations; slider[0,40,200]
uniform int ColorIterations; slider[0,3,20]
uniform bool Julia; checkbox[true]
uniform vec3 JuliaC; slider[(-4,-4,-4),(-1,0,0),(4,4,4)]
//uniform float DerivativeBias; slider[0,1,2]

#group RotationFolding
uniform bool enablePreFolding; checkbox[false]
uniform vec3 preAngleXYZ; slider[(-360,-360,-360),(0,0,0),(360,360,360)]
uniform float preFolding; slider[-10,1,10]
uniform bool enablePostFolding; checkbox[false]
uniform vec3 postAngleXYZ; slider[(-360,-360,-360),(0,0,0),(360,360,360)]
uniform float postFolding; slider[-10,1,10]

#group Menger
// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/
// Scale:   Scale parameter. A perfect Menger is 3.0
// Offset:  Scaling center
uniform float MengerScale; slider[0.00,3.0,4.00]
uniform vec3 MengerRotVector; slider[(0,0,0),(1,1,1),(1,1,1)]
uniform float MengerRotAngle; slider[0.00,0,180]
uniform vec3 MengerOffset; slider[(0,0,0),(1,1,1),(1,1,1)]
uniform int MengerIterations;  slider[0,8,100]
uniform int MengerColorIterations;  slider[0,8,100]

float sq_r, r, r1, dr, theta, phi, r_pow, theta_pow, phi_pow, pow_eff, fac_eff, cth, cph, sph, sth, tmpx, tmpy, tmpz, tmpx2, tmpy2, tmpz2, r_zxy, r_cxy, h, scale, returnValue;
vec3 c;
int i;
mat3 rotMatrix;
 
float DE(vec3 pos) {

// Preparation operations
    vec3 z = pos;
    pow_eff = 1.0 - Power;
    fac_eff = (Power - 1.0)/Power;
    r1 = length(z);
    dr = 1.0;
    scale = 1.0;
    i = 0;
    c = (Julia ? JuliaC : pos);


    while(r1<Bailout && (i<Iterations)) {
       dr = dr*r1*2.0;

//Pre - Rotation Folding
    if (enablePreFolding) {
        rotMatrix = rotationMatrixXYZ(preAngleXYZ);
        z = z * rotMatrix; 
        z.x = abs(z.x + preFolding) - abs(z.x - preFolding) - z.x;
        z = rotMatrix * z;
       }

// Converting the diverging (x,y,z) back to the variable
// that can be used for the (converging) Newton method calculation
       sq_r = Fake_Bailout/(dot(z,z) + Offset);
       z.x = z.x*sq_r + Solution.x;
       z.y = -z.y*sq_r + Solution.y;
       z.z = -z.z*sq_r + Solution.z;
        
// Calculate 1/z^(power-1)
       sq_r = dot(z,z);
       r = sqrt(sq_r);
       phi = Factor_Phi*asin(z.z/r) ;
       theta = Factor_Theta*atan(z.y,z.x) ;
         
       r_pow = pow(r, pow_eff);
       phi_pow = phi*pow_eff;
       theta_pow = theta*pow_eff;
   
       cth = cos(theta_pow);
       sth = sin(theta_pow);
       cph = cos(phi_pow);
       sph = sin(phi_pow);
   
       tmpx = -cph*cth*r_pow/Power;
       tmpy = -cph*sth*r_pow/Power;
       tmpz = sph*r_pow/Power;
   
// Multiply c and z
       r_zxy = sqrt(tmpx*tmpx + tmpy*tmpy);
       r_cxy = sqrt(c.x*c.x + c.y*c.y);
       
       h = 1 - c.z*tmpz/(r_cxy*r_zxy + Offset);
       
       tmpx2 = (c.x*tmpx - c.y*tmpy)*h;
       tmpy2 = (c.y*tmpx + c.x*tmpy)*h;
       tmpz2 = r_cxy*tmpz + r_zxy*c.z;

// Bring everything together        
       z.x = fac_eff*z.x + tmpx2;
       z.y = fac_eff*z.y + tmpy2;
       z.z = fac_eff*z.z + tmpz2;
      
// Below the hack that provides a divergent value of (x,y,z) to MB3D
// although the plain Newton method does always converge
       sq_r = Fake_Bailout/((dot(z-Solution,z-Solution))+ Offset);
       
       z.x = (z.x - Solution.x)*sq_r;
       z.y = -(z.y - Solution.y)*sq_r;
       z.z = -(z.z - Solution.z)*sq_r;
        
    if (enablePostFolding) {
        rotMatrix = rotationMatrixXYZ(postAngleXYZ);
        z = z * rotMatrix; 
        z.x = abs(z.x + postFolding) - abs(z.x - postFolding) - z.x;
        z = rotMatrix * z;
   }

//DE helper calculations (?)
       dr = dr * DEscale1 + DEoffset1;
//     dr =  pow(r, pow_eff)*(Power - 1.0)*dr + 10.0;
//     dr = max(dr*DerivativeBias, r_pow*dr*pow_eff + 1.0);
       r1 = length(z);
     
       if (i<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,z.z,r1*r1)));
       i++;
    }

	int n = 0;
	while (n < MengerIterations) {
		z = z*rotationMatrix3(normalize(MengerRotVector), MengerRotAngle);
		z = abs(z);
		if (z.x < z.y){ z.xy = z.yx;}
		if (z.x < z.z){ z.xz = z.zx;}
		if (z.y < z.z){ z.yz = z.zy;}
		z = MengerScale*z - MengerOffset*(MengerScale - 1.0);
		if( z.z < - 0.5*MengerOffset.z*(MengerScale - 1.0))  z.z += MengerOffset.z*(MengerScale - 1.0);
		if (n < MengerColorIterations) orbitTrap = min(orbitTrap, (vec4(abs(z),dot(z,z))));
		r1 = length(z);
		n++;
	}

   if (MengerIterations > 0)
       {returnValue = abs(length(z) - 0.0 )*pow(MengerScale, float(-n));}
   else 
       {returnValue = 0.5*log(r1)*r1/dr;}

   return returnValue;

}

#preset default
FOV = 0.35632184
Eye = 17.5372181,-0.744967699,-11.7649803
Target = 6.28999138,0.035050031,-6.4559536
Up = 0.214082748,0.025385229,0.449806839
Power = 16
Solution = 1,-0.05,0
Factor_Phi = 1
Factor_Theta = 1
Fake_Bailout = 2
DEscale1 = 1
DEoffset1 = 4
Offset = 1e-05
Bailout = 512
Iterations = 2
ColorIterations = 2
Julia = true
JuliaC = -1,0,0
enablePreFolding = false
preAngleXYZ = 30,-5,5
preFolding = 0.42
enablePostFolding = true
postAngleXYZ = 0,90,0
postFolding = -0.3
MengerScale = 2.5
MengerRotVector = 1,1,1
MengerRotAngle = 0
MengerOffset = 1,1,1
MengerIterations = 16
MengerColorIterations = 2
#endpreset

#preset Preset4
FOV = 0.35632184
Eye = 17.5372181,-0.744967699,-11.7649803
Target = 6.28999138,0.035050031,-6.4559536
Up = 0.214082748,0.025385229,0.449806839
EquiRectangular = false
AutoFocus = false
FocalPlane = 30
Aperture = 0
Gamma = 2.08335
ToneMapping = 3
Exposure = 0.6522
Brightness = 1
Contrast = 1
AvgLumin = 0.5,0.5,0.5
Saturation = 1
LumCoeff = 0.212500006,0.715399981,0.0720999986
Hue = 0
GaussianWeight = 1
AntiAliasScale = 2
DepthToAlpha = false
ShowDepth = false
DepthMagnitude = 1
Detail = -4
DetailAO = -0.5
FudgeFactor = 0.023999982
MaxDistance = 3000
MaxRaySteps = 2156
Dither = 0
NormalBackStep = 2 NotLocked
AO = 0,0,0,0.699999988
Specular = 0.1666
SpecularExp = 16
SpecularMax = 20
SpotLight = 1,1,1,0.19608
SpotLightDir = 0.37142,0.1
CamLight = 1,1,1,1.13978
CamLightMin = 0.29412
Glow = 1,1,1,0.07895
GlowMax = 115
Fog = 0
HardShadow = 0.33846 NotLocked
ShadowSoft = 12.6
QualityShadows = true
Reflection = 0 NotLocked
DebugSun = false NotLocked
BaseColor = 1,1,1
OrbitStrength = 0.2987
X = 0.5,0.600000024,0.600000024,0.2126
Y = 1,0.600000024,0,0.30708
Z = 0.800000012,0.779999971,1,0.35434
R = 0.666666985,0.666666985,0.498039007,0.03174
BackgroundColor = 0.600000024,0.600000024,0.449999988
GradientBackground = 0.3
CycleColors = false
Cycles = 6.95699
EnableFloor = false NotLocked
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Power = 16
Solution = 1,-0.05,0
Factor_Phi = 1
Factor_Theta = 1
Fake_Bailout = 2
DEscale1 = 1
DEoffset1 = 4
Offset = 1e-05
Bailout = 512
Iterations = 2
ColorIterations = 2
Julia = true
JuliaC = -1,0,0
enablePreFolding = false
preAngleXYZ = 30,-5,5
preFolding = 0.42
enablePostFolding = true
postAngleXYZ = 0,90,0
postFolding = -0.3
MengerScale = 2.5
MengerRotVector = 1,1,1
MengerRotAngle = 0
MengerOffset = 1,1,1
MengerIterations = 16
MengerColorIterations = 2
#endpreset


#preset Preset4a
FOV = 0.35632184
Eye = 22.78755,-1.11592746,-14.200532
Target = 11.4108305,-0.270116895,-9.18564034
Up = 0.202544078,0.026172403,0.455074638
EquiRectangular = false
AutoFocus = false
FocalPlane = 30
Aperture = 0
Gamma = 2.08335
ToneMapping = 3
Exposure = 0.6522
Brightness = 1
Contrast = 1
AvgLumin = 0.5,0.5,0.5
Saturation = 1.2
LumCoeff = 0.212500006,0.715399981,0.0720999986
Hue = 0
GaussianWeight = 1
AntiAliasScale = 1.5
DepthToAlpha = false
ShowDepth = false
DepthMagnitude = 1
Detail = -4
DetailAO = -0.5
FudgeFactor = 0.023999982
MaxDistance = 3000
MaxRaySteps = 2156
Dither = 0
NormalBackStep = 2 NotLocked
AO = 0,0,0,0.699999988
Specular = 0.25
SpecularExp = 20
SpecularMax = 20
SpotLight = 1,1,1,0.22
SpotLightDir = 0.37142,0.1
CamLight = 1,1,1,1.13978
CamLightMin = 0.25
Glow = 1,1,1,0.075
GlowMax = 115
Fog = 0
HardShadow = 0.33846 NotLocked
ShadowSoft = 12.6
QualityShadows = true
Reflection = 0 NotLocked
DebugSun = false NotLocked
BaseColor = 1,1,1
OrbitStrength = 0.2987
X = 0.5,0.600000024,0.600000024,0.2126
Y = 1,0.600000024,0,0.30708
Z = 0.800000012,0.779999971,1,0.35434
R = 0.666666985,0.666666985,0.498039007,0.03174
BackgroundColor = 0.600000024,0.600000024,0.450003803
GradientBackground = 0.3
CycleColors = false
Cycles = 6.95699
EnableFloor = false NotLocked
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Power = 16
Solution = 1,-0.05,0
Factor_Phi = 1
Factor_Theta = 1
Fake_Bailout = 2
DEscale1 = 1
DEoffset1 = 4
Offset = 1e-05
Bailout = 512
Iterations = 2
ColorIterations = 2
Julia = true
JuliaC = -1,0,0
enablePreFolding = false
preAngleXYZ = 30,-5,5
preFolding = 0.42
enablePostFolding = true
postAngleXYZ = 0,90,0
postFolding = -0.3
MengerScale = 2.5
MengerRotVector = 1,1,1
MengerRotAngle = 0
MengerOffset = 1,1,1
MengerIterations = 16
MengerColorIterations = 2
#endpreset
