import * as fs from 'fs';
import * as path from 'path';

function walkSync(dir: string, filelist: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (dirFile.endsWith('.module.ts')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
}

const moduleFiles = walkSync(path.join(__dirname, '../src'));

for (const file of moduleFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Remove MongooseModule multiline forFeature
  content = content.replace(/MongooseModule\.forFeature\(\[\s*\{[\s\S]*?\}\s*\]\),?/g, '');
  
  // Remove MongooseModule from exports
  content = content.replace(/,\s*MongooseModule\s*/g, '');
  content = content.replace(/\s*MongooseModule,\s*/g, '');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned up ${file}`);
  }
}
