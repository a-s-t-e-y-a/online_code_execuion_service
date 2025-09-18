const { mkdir } = require('node:fs/promises');
const { join } = require('node:path');
const fs = require('node:fs');

async function makeDirectory() {
  const projectFolder =await  join(__dirname, '..','test', 'project');
  if(fs.existsSync(projectFolder)){
    console.log("Directory already exists");
    return;
  }else {
    const dirCreation = await mkdir(projectFolder, { recursive: true });
    console.log(dirCreation);
    return dirCreation;
  }
  console.log(projectFolder);
  // const dirCreation = await mkdir(projectFolder, { recursive: true });

  // console.log(dirCreation);
  // return dirCreation;
}

makeDirectory().catch(console.error);