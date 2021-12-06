// Output generiert aus Datei:C:/work/frac/fragmentarium/_formulas/Newton-006c.frag
// Erstellt:Mo Nov 9 16:53:30 2020
// Based upon a .frag from Sabine62 from Sat Aug 25 15:49:49 2018 ( see https://fractalforums.org/fractal-mathematics-and-new-theories/28/revisiting-the-3d-newton/1026/msg8735#msg8735 )
// Incorporated DE calculations from mclarekin ( see https://fractalforums.org/fractal-mathematics-and-new-theories/28/revisiting-the-3d-newton/1026/msg24940#msg24940 )
//include "DE-Raytracer.frag"
//#define USE_IQ_CLOUDS
#info based on Newton by gannjondal https://fractalforums.org/fractal-mathematics-and-new-theories/28/revisiting-the-3d-newton/1026
//#define providesInit
#define KN_VOLUMETRIC
#define USE_EIFFIE_SHADOW
#define MULTI_SAMPLE_AO
#include "MathUtils.frag"
#include "DE-Kn2cr11.frag"
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

float sq_r, r, r1, dr, theta, phi, r_pow, theta_pow, phi_pow, pow_eff, fac_eff, cth, cph, sph, sth, tmpx, tmpy, tmpz, tmpx2, tmpy2, tmpz2, r_zxy, r_cxy, h, scale;
vec3 c;
int i;
 
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
FOV = 0.9472675
Eye = 0.566298008,0.384900182,-1.16146672
Target = -0.203252286,0.187445313,-0.538403511
Up = -0.295506626,-0.121736601,-0.403562069
EquiRectangular = false
FocalPlane = 7
Aperture = 0
InFocusAWidth = 0
DofCorrect = true
ApertureNbrSides = 6
ApertureRot = 0
ApStarShaped = false
Gamma = 0.4863813
ToneMapping = 5
Exposure = 1
Brightness = 1
Contrast = 1
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 1
Bloom = false
BloomIntensity = 0
BloomPow = 2
BloomTaps = 4
BloomStrong = 1
LensFlare = false
FlareIntensity = 0.25
FlareSamples = 8
FlareDispersal = 0.25
FlareHaloWidth = 0.5
FlareDistortion = 1
DepthToAlpha = false
ShowDepth = false
DepthMagnitude = 1
Detail = -4.5
RefineSteps = 9
FudgeFactor = 0.2
MaxRaySteps = 4821
MaxDistance = 100
Dither = 0
NormalBackStep = 0
DetailAO = -0.19
coneApertureAO = 0.5
maxIterAO = 83
FudgeAO = 0.56
AO_ambient = 0.825
AO_camlight = 0.41
AO_pointlight = 0.78
AoCorrect = 0.2
Specular = 0.15
SpecularExp = 20
CamLight = 1,0.90196079,0.831372559,0.95
AmbiantLight = 0.78039217,0.858823538,1,0.85
Reflection = 0.337254912,0.41568628,0.450980395
ReflectionsNumber = 0
SpotGlow = true
SpotLight = 1,0.886274517,0.745098054,2.5
LightPos = -0.9674234,-0.8094768,-4.481737
LightSize = 0
LightFallOff = 0.0456349
LightGlowRad = 0
LightGlowExp = 4
HardShadow = 0.85
ShadowSoft = 0
ShadowBlur = 0.0075
perf = true
SSS = true
sss1 = 0.1975309
sss2 = 0.4615385
BaseColor = 1,1,1
OrbitStrength = 0.3
X = 0.207843095,0.600000024,0,1
Y = 0.00392156886,0.235294104,1,1
Z = 0.996078372,1,0.725490212,1
R = 1,0.0862745121,0.00392156886,1
BackgroundColor = 0.168627456,0.368627459,0.474509805
GradientBackground = 1.5
CycleColors = true
Cycles = 2.75
EnableFloor = true
FloorNormal = 0,0,1
FloorHeight = 1.569485
FloorColor = 0.0784313679,0.176470593,0.333333313
HF_Fallof = 0.1
HF_Const = 0
HF_Intensity = 0
HF_Dir = 0,0,1
HF_Offset = 0
HF_Color = 1,1,1,1
HF_Scatter = 0
HF_Anisotropy = 0,0,0
HF_FogIter = 1
HF_CastShadow = false
EnCloudsDir = false
CloudDir = -0.8271845,0.6737864,-0.2427184
CloudScale = 1
CloudFlatness = 0
CloudTops = 0.99982
CloudBase = -1
CloudDensity = 1
CloudRoughness = 1
CloudContrast = 1
CloudColor = 0.649999976,0.680000007,0.699999988
CloudColor2 = 0.0700000003,0.170000002,0.239999995
SunLightColor = 0.699999988,0.5,0.300000012
Cloudvar1 = 0.99
Cloudvar2 = 1
CloudIter = 5
CloudBgMix = 1
WindDir = 0,0,1
WindSpeed = 1
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
#endpreset