// Write fragment code here...
#include "MathUtils.frag"
#include "DE-Raytracer.frag" 

#group NewtonVarPower
uniform float Power; slider[-16,3,16]
uniform vec3 Solution; slider[(-4,-4,-4),(1,0,0),(4,4,4)]
uniform float Factor_Phi; slider[-20,1,20]
uniform float Factor_Theta; slider[-20,1,20]
uniform float Fake_Bailout; slider[-20,1,20]
uniform float DEscale1; slider[0,1,2]
uniform float DEoffset1; slider[0,0,8]
uniform float Offset; slider[1.0e-15,0.0001,1]
uniform float Bailout; slider[0.001,4,1024]
uniform int Iterations; slider[1,40,200]
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

float sq_r, r, r1, dr, theta, phi, r_pow, theta_pow, phi_pow, pow_eff, fac_eff, cth, cph, sph, sth, tmpx, tmpy, tmpz, tmpx2, tmpy2, tmpz2, r_zxy, r_cxy, h, scale;
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
   return 0.5*log(r1)*r1/dr;
}

#preset Default
FOV = 0.4
Eye = 5.582327,4.881191,-6.709066
Target = 0,0,0
Up = -0.1207781,0.8478234,0.5163409
Power = 3
Solution = 1,0,0
Factor_Phi = 1
Factor_Theta = 1
Fake_Bailout = 1
DEscale1 = 1
DEoffset1 = 4
Offset = 1e-05
Bailout = 4
Iterations = 40
ColorIterations = 7
Julia = true
JuliaC = -1,0,0
enablePreFolding = true
preAngleXYZ = 30,-5,5
preFolding = 0.42
enablePostFolding = false
postAngleXYZ = 0,0,0
postFolding = 1
#endpreset

#preset Preset1
FOV = 0.4
Eye = 3.74735904,2.87299109,-4.05576038
Target = -1.0019567,-2.42647386,2.96988034
Up = -0.137086108,0.833154082,0.535781085
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
Detail = -4.25
DetailAO = -5
FudgeFactor = 0.8
MaxDistance = 3000
MaxRaySteps = 1164
Dither = 0.5
NormalBackStep = 2 NotLocked
AO = 0.203921571,0.203921571,0.203921571,0.83
Specular = 0.6
SpecularExp = 14
SpecularMax = 20
SpotLight = 1,0.90196079,0.745098054,1
SpotLightDir = 0.6,0.5
CamLight = 1,1,1,1.5
CamLightMin = 0.075
Glow = 1,1,1,0.5
GlowMax = 52
Fog = 0
HardShadow = 0.35 NotLocked
ShadowSoft = 12.6
QualityShadows = true
Reflection = 0 NotLocked
DebugSun = false NotLocked
BaseColor = 0.760784328,0.760784328,0.760784328
OrbitStrength = 0.4
X = 1,1,1,1
Y = 0.345097989,0.666666985,0,0.02912
Z = 1,0.666666985,0,1
R = 0.0784313977,1,0.941175997,-0.0194
BackgroundColor = 0.713725507,0.866666675,0.596078455
GradientBackground = 0.3
CycleColors = true
Cycles = 5
EnableFloor = false NotLocked
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Power = 3
Solution = 1,0,0
Factor_Phi = 1
Factor_Theta = 1
Fake_Bailout = 1
DEscale1 = 1
DEoffset1 = 4
Offset = 1e-05
Bailout = 4
Iterations = 40
ColorIterations = 7
Julia = true
JuliaC = -1,0,0
enablePreFolding = true
preAngleXYZ = 30,-5,5
preFolding = 0.42
enablePostFolding = false
postAngleXYZ = 0,0,0
postFolding = 1
#endpreset
