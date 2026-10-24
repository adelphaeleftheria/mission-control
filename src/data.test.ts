import 'fake-indexeddb/auto';
import {describe,it,expect} from 'vitest';
import {demo,empty,projectProgress,goalProgress,streak,today,weekly,save,load,validateBackup,recommend,saveTimer,loadTimer,LocalCalendarProvider} from './data';
import {format,subDays} from 'date-fns';
describe('connected workspace',()=>{
 it('propagates task completion through projects and goals',()=>{const s=demo();s.tasks.filter(t=>t.project==='p1').forEach(t=>t.status='Done');expect(projectProgress(s,'p1')).toBe(100);expect(goalProgress(s,s.goals[0])).toBe(100);s.tasks[0].status='Next';expect(projectProgress(s,'p1')).toBe(80);expect(goalProgress(s,s.goals[0])).toBe(80);});
 it('handles an empty project and independent numeric goal',()=>{const s=empty();expect(projectProgress(s,'missing')).toBe(0);expect(goalProgress(s,{id:'a',title:'Read',category:'Learning',target:20,current:12,unit:'books',deadline:'',color:'purple'})).toBe(60);});
 it('computes consecutive habits without double counting',()=>{const yesterday=format(subDays(new Date(),1),'yyyy-MM-dd');expect(streak([today(),today(),yesterday])).toBe(2);expect(streak([yesterday])).toBe(1);expect(streak([])).toBe(0);});
 it('calculates focus time from session data',()=>{const s=empty();s.sessions=[{id:'s',task:'t',date:today(),minutes:25,completed:true}];expect(weekly(s).at(-1)?.minutes).toBe(25);expect(weekly(s).slice(0,-1).every(x=>x.minutes===0)).toBe(true);});
 it('persists and restores a complete backup in IndexedDB',async()=>{const s=demo();await save(s);expect(await load()).toEqual(s);const backup=JSON.parse(JSON.stringify(s));expect(validateBackup(backup)).toBe(true);await save(backup);expect(await load()).toEqual(s);});
 it('rejects invalid backup shapes',()=>{expect(validateBackup(null)).toBe(false);expect(validateBackup({tasks:[]})).toBe(false);const s=demo();s.goals[0].target=0;expect(validateBackup(s)).toBe(false);});
});

describe('focus and planning',()=>{
 it('persists an active timer deadline separately from workspace backups',async()=>{const timer={task:'t0',mode:'Focus',remaining:1500,running:true,end:Date.now()+1500000};await saveTimer(timer);expect(await loadTimer()).toEqual(timer);});
 it('recommends actionable priority tasks rather than completed work',()=>{const s=demo();expect(recommend(s)?.id).toBe('t0');s.tasks.forEach(t=>t.status='Done');expect(recommend(s)).toBeUndefined();});
 it('exposes local calendar CRUD through a provider boundary',async()=>{let s=empty();const provider=new LocalCalendarProvider(()=>s,next=>{s=next;});const e={id:'e',title:'Deep work',date:today(),time:'09:00',duration:60};await provider.createEvent(e);expect(await provider.getEvents()).toEqual([e]);await provider.updateEvent({...e,duration:90});expect((await provider.getEvents())[0].duration).toBe(90);await provider.deleteEvent('e');expect(await provider.getEvents()).toEqual([]);});
 it('rejects malformed imported records before replacement',()=>{const s=demo();(s.entries[0] as unknown as {body:number}).body=12;expect(validateBackup(s)).toBe(false);});
});
