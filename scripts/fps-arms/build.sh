# rebuild texture -> baked arms -> compressed glb -> public
S=/c/Users/rapha/AppData/Local/Temp/claude/C--Users-rapha-Documents-raphael-picard/48315230-c474-4d8b-8365-b2c6fdd1de00/scratchpad; N=/c/Users/rapha/AppData/Roaming/fnm/node-versions/v24.21.0/installation/node.exe; W=$S/fps-arms/wb
$N $S/tools/armtex.mjs $S/fps-arms/para/raw/new_diff.png $S/fps-arms/work/arms_tac.png || exit 1
$N $W/mk.cjs exp '{"views":null,"export":true}' && PARAMS=$W/params_exp.js $N $W/run.cjs $W/pose.js $S/fps-arms/shots/eye_exp.png $S/fps-arms/work/arms_raw.glb | grep -E "unreach|baked|wrote|ERR" 
$N $S/tools/compress.mjs $S/fps-arms/work/arms_raw.glb $S/fps-arms/work/arms.glb 1024 0 1 | grep -v prune
cp $S/fps-arms/work/arms.glb /c/Users/rapha/Documents/raphael-picard/public/models/fps/arms.glb
