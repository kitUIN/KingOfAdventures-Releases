import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
const root='dist', prefix='/KingOfAdventures-Releases/';
function walk(dir) {return readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(join(dir,x.name)):[join(dir,x.name)]);}
const files=walk(root), pages=files.filter(f=>f.endsWith('.html'));
const read=path=>readFileSync(path,'utf8');
const release=JSON.parse(read('src/data/release.json'));
const groups=['items','enemies','stages','careers','pets'];
assert.equal(pages.length,1+groups.length+groups.reduce((sum,key)=>sum+release[key].length,0));
for(const page of pages) {
  const html=read(page);
  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const href=match[1].replaceAll('&amp;','&');
    const target=new URL(href,'https://kituin.github.io/'+prefix.slice(1)+relative(root,page).replaceAll('\\','/'));
    if(target.origin!=='https://kituin.github.io')continue;
    assert(target.pathname.startsWith(prefix),'Incorrect base in '+page+': '+href);
    const path=join(root,decodeURIComponent(target.pathname.slice(prefix.length)),target.pathname.endsWith('/')?'index.html':'');
    assert(existsSync(path),'Broken target in '+page+': '+href);
    if(target.hash) assert(read(path).includes('id="'+decodeURIComponent(target.hash.slice(1))+'"'),'Missing anchor '+href);
  }
  assert(html.includes('wiki_edit.yml'),'Missing edit form '+page);
}
const page=(category,id)=>read(join(root,category,id,'index.html'));
if(release.tag==='1.4-release'){
  assert.equal(release.items.filter(i=>i.kind==='装备').length,54);
  assert.equal(release.stages.length,14);
  assert.equal(release.pets.flatMap(p=>p.forms).length,9);
  assert(release.items.find(i=>i.id==='102').enhancedName==='电光');
  assert(release.enemies.find(i=>i.id==='b1').drops.some(d=>d.id==='102'));
  assert.deepEqual(release.stages.find(s=>s.id==='2').next,[3,11,12]);
  assert(release.pets.find(p=>p.name==='紫月幼兽').forms[2].name==='紫月神兽');
  assert(release.enemies.find(m=>m.id==='s1').locations.some(l=>l.stage===3&&l.mode==='随机出现'));
  for(const [g,id,links] of [['items','102',['enemies/b1/','stages/2/']],['enemies','b1',['items/102/','stages/2/']],['stages','2',['stages/3/','stages/11/','stages/12/']],['pets','1',['enemies/s1/','stages/3/']]]){
    for(const link of links)assert(page(g,id).includes('href="'+prefix+link+'"'),'Missing link '+link);
  }
}
console.log('Verified '+pages.length+' pages, '+files.filter(f=>f.endsWith('.webp')).length+' artwork files and all internal links.');
