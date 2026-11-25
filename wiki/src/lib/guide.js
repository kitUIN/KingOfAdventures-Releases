import data from '../data/release.json';
export const { version, tag, stages, items, enemies, careers, pets, stats } = data;
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (path = '') => base + '/' + path;
export const art = name => url('art/' + name);
export const repo = 'https://github.com/kitUIN/KingOfAdventures-Releases';
export const live = 'https://kituin.github.io' + base;
export const sections = [
  {key:'items', title:'装备与物品', short:'装备', rows:items, icon:'item-102.webp', color:'sage', note:'属性 · 强化 · 掉落'},
  {key:'enemies', title:'怪物与首领', short:'怪物', rows:enemies, icon:'enemy-b1.webp', color:'clay', note:'出没地点 · 战利品'},
  {key:'stages', title:'关卡与营地', short:'关卡', rows:stages, icon:'stage-1.webp', color:'ochre', note:'解锁路线 · 战斗波次'},
  {key:'careers', title:'职业与技能', short:'职业', rows:careers, icon:'warrior.webp', color:'slate', note:'出招方式 · 技能消耗'},
  {key:'pets', title:'精灵', short:'精灵', rows:pets, icon:'pet-10101.webp', color:'violet', note:'获取条件 · 进化形态'}
];
export const entry = (group,id) => sections.find(s=>s.key===group)?.rows.find(r=>String(r.id)===String(id));
export const pathFor = (group,id) => url(group + '/' + (id == null ? '' : id + '/'));
export const stageName = id => Number(id) === 0 ? stages[0].name : '第 ' + id + ' 关 · ' + entry('stages',id).name;
export const traits = ['粗糙','普通','优秀','精良','卓越','传说'];
export function dropSources(itemId) {
  return enemies.flatMap(mob => {
    const regular = mob.drops.filter(x=>x.id===itemId);
    const locations = mob.locations.filter(loc=>loc.mode!=='召唤配置' && (regular.length || loc.coins.includes(itemId)));
    return locations.length ? [{mob, locations, via:regular.length ? regular.map(x=>x.via).join('、') : '钱币掉落'}] : [];
  });
}
export function stageLoot(stage) {
  return items.filter(item => dropSources(item.id).some(src=>src.locations.some(loc=>String(loc.stage)===stage.id)));
}
export function findStageMobs(stage) {
  return enemies.filter(mob=>mob.locations.some(loc=>String(loc.stage)===stage.id));
}
export const feedback = (title,path) => repo+'/issues/new?'+new URLSearchParams({template:'wiki_edit.yml',title:'[Wiki] '+title,article:title,version,link:live+'/'+path});
export function subtitle(group,row) {
  if(group==='items') return [row.job, row.kind==='装备'?'等级 '+row.level:'', row.type].filter(Boolean).join(' · ');
  if(group==='enemies') return row.kind+' · '+row.locations.map(l=>'第 '+l.stage+' 关').join('、');
  if(group==='stages') return row.id==='0'?'精灵仓库 · 武器商': '第 '+row.id+' 关 · '+row.waves.length+' 波战斗';
  if(group==='pets') return row.forms.map(f=>f.name).join(' → ');
  return '普通攻击 · 4 个快捷技能';
}
export const searchRows = sections.flatMap(s=>s.rows.flatMap(row=>{
  const aliases = [row.id,...(row.aliases??[])];
  if(row.enhancedName && row.enhancedName!==row.name) aliases.push(row.enhancedName);
  if(s.key==='stages') aliases.push('地图'+row.id,'第'+row.id+'关',stageName(row.id));
  if(s.key==='pets') aliases.push(...row.forms.flatMap(f=>[f.name,String(f.id)]));
  const main = {name:row.name, group:s.title, icon:art(row.icon), sub:subtitle(s.key,row), aliases,
    extra:row.enhancedName && row.enhancedName!==row.name ? '+5 更名「'+row.enhancedName+'」' : '', href:pathFor(s.key,row.id)};
  return [main,...(row.skills??[]).map(skill=>({name:row.name+' · 技能 '+skill.slot,group:s.title,icon:art(skill.icon),sub:'等级 '+skill.level+' · '+skill.mp+' MP',aliases:[skill.action,row.name+'技能'+skill.slot],extra:'',href:main.href+'#skill-'+skill.slot}))];
}));
