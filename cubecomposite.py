import Image, sys, glob

base = sys.argv[1]
ext =  sys.argv[2]
sizebase = int(sys.argv[3])

imgset = glob.glob(base+"*."+ext)
          
rszSet =[]

print imgset
for img in imgset:
  im = Image.open(img)
  im = im.resize((sizebase, sizebase), Image.ANTIALIAS)
  rszSet.append(im)
  
positions=[(0,0),(1,0),(0,1),(1,1),(0,2),(1,2)]
quality_val = 95

leftImage = Image.new("RGB", (sizebase*2,sizebase*3))
for p,im in zip(positions, rszSet[0:6]):
  leftImage.paste(im, (p[0]*sizebase,p[1]*sizebase,(p[0]+1)*sizebase,(p[1]+1)*sizebase))
leftImage.save(base+".left.jpg", 'JPEG', quality=quality_val)
rightImage = Image.new("RGB", (sizebase*2,sizebase*3))
for p,im in zip(positions, rszSet[6:12]):
  rightImage.paste(im, (p[0]*sizebase,p[1]*sizebase,(p[0]+1)*sizebase,(p[1]+1)*sizebase))
rightImage.save(base+".right.jpg", 'JPEG', quality=quality_val)