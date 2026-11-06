import {lstat,readdir,readFile,mkdir,copyFile} from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function inspect(file){try{return await lstat(file);}catch(error){if(error.code==='ENOENT')return null;throw error;}}
async function directory(dir){const stat=await inspect(dir);if(stat&&(!stat.isDirectory()||stat.isSymbolicLink()))throw Error(`Unsafe static directory: ${dir}`);}
async function inventory(root){
 await directory(root);const files=[];
 async function visit(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);if(entry.isSymbolicLink())throw Error(`Static symlink: ${file}`);
  if(entry.isDirectory())await visit(file);else if(entry.isFile()){
   const relative=path.relative(root,file);if(relative==='.gitkeep')continue;
   files.push({relative,source:file,sha256:hash(await readFile(file))});
  }else throw Error(`Non-regular static file: ${file}`);
 }}
 await visit(root);return files;
}
export async function retainStatic(sources,target){
 target=path.resolve(target);await directory(target);
 const pending=new Map();
 for(const source of sources)for(const file of await inventory(path.resolve(source))){
  const previous=pending.get(file.relative);if(previous&&previous.sha256!==file.sha256)throw Error(`Immutable static collision: ${file.relative}`);
  pending.set(file.relative,file);
 }
 // Preflight every conflict before adding anything. Existing bytes are never overwritten.
 for(const file of pending.values()){
  let parent=path.dirname(path.join(target,file.relative));while(parent!==target){await directory(parent);parent=path.dirname(parent);}
  const destination=path.join(target,file.relative),stat=await inspect(destination);
  if(stat&&(!stat.isFile()||stat.isSymbolicLink()||hash(await readFile(destination))!==file.sha256))throw Error(`Immutable static collision: ${file.relative}`);
 }
 await mkdir(target,{recursive:true});let added=0;
 for(const file of pending.values()){
  const destination=path.join(target,file.relative);await mkdir(path.dirname(destination),{recursive:true});
  try{await copyFile(file.source,destination,constants.COPYFILE_EXCL);added++;}
  catch(error){if(error.code!=='EEXIST')throw error;const stat=await lstat(destination);if(!stat.isFile()||stat.isSymbolicLink()||hash(await readFile(destination))!==file.sha256)throw Error(`Immutable static collision: ${file.relative}`);}
 }
 return {added,files:[...pending.values()].map(file=>({url:'/_next/static/'+file.relative.split(path.sep).join('/'),sha256:file.sha256}))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [target,...sources]=process.argv.slice(2);if(!target||!sources.length)throw Error('Usage: retain-static.mjs TARGET SOURCE...');
 console.log(JSON.stringify(await retainStatic(sources,target)));
}
