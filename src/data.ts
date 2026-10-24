import {openDB} from 'idb';
import {format, subDays} from 'date-fns';
export const today=()=>format(new Date(),'yyyy-MM-dd');
export const uid=()=>crypto.randomUUID();
export type Task={id:string;title:string;project:string;priority:number;status:string;date:string;estimate:number;tracked:number;top:boolean;description:string;created:string;completed?:string;subtasks:{title:string;done:boolean}[]};
export type Goal={id:string;title:string;category:string;target:number;current:number;unit:string;deadline:string;color:string;archived?:boolean};
export type Project={id:string;title:string;goal:string;description:string;deadline:string;archived?:boolean};
export type Habit={id:string;title:string;goal:string;entries:string[]};
export type Session={id:string;task:string;date:string;minutes:number;completed:boolean};
export type Entry={id:string;title:string;body:string;date:string;kind:string;pinned:boolean;mood:number;energy:number};
export type Event={id:string;title:string;date:string;time:string;duration:number};
export type State={tasks:Task[];goals:Goal[];projects:Project[];habits:Habit[];sessions:Session[];entries:Entry[];events:Event[];settings:{theme:string;focus:number;short:number;long:number;name:string};widgets:string[];widgetPrefs?:Record<string,{collapsed:boolean;wide:boolean}>;onboarded:boolean};
export const empty=():State=>({tasks:[],goals:[],projects:[],habits:[],sessions:[],entries:[],events:[],settings:{theme:'light',focus:25,short:5,long:15,name:''},widgets:['priorities','focus','goals','habits','activity'],onboarded:false});
export function demo():State {const s=empty();s.onboarded=true;s.goals=[{id:'g1',title:'Launch my personal website',category:'Career',target:100,current:0,unit:'%',deadline:'2026-11-30',color:'purple'},{id:'g2',title:'Become conversational in German',category:'Learning',target:100,current:61,unit:'lessons',deadline:'2026-12-31',color:'blue'},{id:'g3',title:'Build a healthier routine',category:'Wellbeing',target:100,current:42,unit:'days',deadline:'2026-12-31',color:'green'}];s.projects=[{id:'p1',title:'Personal website',goal:'g1',description:'A home for my work, ideas, and everything in between.',deadline:'2026-11-15'},{id:'p2',title:'German · B1 journey',goal:'g2',description:'A little practice, every day.',deadline:'2026-12-31'},{id:'p3',title:'Everyday wellbeing',goal:'g3',description:'Make space for what keeps me well.',deadline:'2026-12-31'}];s.tasks=['Finalize homepage design','Build the project showcase','Practice German for 30 minutes','Go for an afternoon run','Write the about page','Research visual inspiration','Set up the design system'].map((title,i)=>({id:'t'+i,title,project:i===2?'p2':i===3?'p3':'p1',priority:i===0?1:i<3?2:3,status:i>4?'Done':'Next',date:today(),estimate:[45,60,30,30,45,25,50][i],tracked:i===0?25:0,top:i<3,description:'',created:today(),completed:i>4?today():undefined,subtasks:[]}));s.habits=['Read 20 minutes','Move my body','Practice German','Mindful moment'].map((title,i)=>({id:'h'+i,title,goal:i===2?'g2':'g3',entries:Array.from({length:12},(_,j)=>format(subDays(new Date(),j+1),'yyyy-MM-dd')).filter((_,j)=>(j+i)%5!==0).concat(i<2?[today()]:[])}));s.sessions=Array.from({length:20},(_,i)=>({id:'s'+i,task:'t'+(i%3),date:format(subDays(new Date(),Math.floor(i/3)),'yyyy-MM-dd'),minutes:i%2?25:45,completed:true}));s.entries=[{id:'n1',title:'A few ideas worth keeping',body:'A quieter website. More space for the work.\n\n- Lead with selected projects\n- Share the process, not just the outcome\n- Make it feel personal',date:today(),kind:'Note',pinned:true,mood:4,energy:4}];s.events=[{id:'e1',title:'Deep work · Website design',date:today(),time:'09:00',duration:90},{id:'e2',title:'A little time to recharge',date:today(),time:'12:30',duration:45},{id:'e3',title:'German practice',date:today(),time:'15:00',duration:30}];return s;}
export function projectProgress(s:State,id:string){const t=s.tasks.filter(t=>t.project===id&&t.status!=='Archived');return t.length?Math.round(t.filter(t=>t.status==='Done').length/t.length*100):0;}
export function goalProgress(s:State,g:Goal){const p=s.projects.filter(p=>p.goal===g.id);return p.length?Math.round(p.reduce((n,p)=>n+projectProgress(s,p.id),0)/p.length):Math.min(100,Math.round(g.current/g.target*100));}
export function streak(entries:string[]){let n=0;let d=new Date();if(!entries.includes(today()))d=subDays(d,1);while(entries.includes(format(d,'yyyy-MM-dd'))){n++;d=subDays(d,1);}return n;}
export function weekly(s:State){return Array.from({length:7},(_,i)=>{const date=format(subDays(new Date(),6-i),'yyyy-MM-dd');return {day:format(subDays(new Date(),6-i),'EEE'),date,minutes:s.sessions.filter(x=>x.date===date).reduce((n,x)=>n+x.minutes,0),tasks:s.tasks.filter(t=>t.completed===date).length};});}
const db=()=>openDB('personal-mission-control',1,{upgrade(db){db.createObjectStore('workspace');}});
export async function load(){return (await (await db()).get('workspace','state')) as State|undefined;}
export async function save(s:State){await (await db()).put('workspace',s,'state');}
export function validateBackup(x:unknown):x is State {
 if(!x||typeof x!=='object')return false;
 const s=x as State; const text=(x:unknown)=>typeof x==='string';const number=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
 try{return ['tasks','goals','projects','habits','sessions','entries','events','widgets'].every(k=>Array.isArray(s[k as keyof State]))&&!!s.settings&&['light','dark','system'].includes(s.settings.theme)&&[s.settings.focus,s.settings.short,s.settings.long].every(n=>number(n)&&n>=1&&n<=180)&&s.widgets.every(w=>['priorities','focus','goals','habits','activity'].includes(w))&&new Set(s.widgets).size===s.widgets.length&&
 s.tasks.every(t=>text(t.id)&&text(t.title)&&text(t.project)&&text(t.date)&&text(t.status)&&number(t.estimate)&&number(t.tracked)&&[1,2,3,4].includes(t.priority)&&Array.isArray(t.subtasks)&&t.subtasks.every(x=>text(x.title)&&typeof x.done==='boolean'))&&
 s.goals.every(g=>text(g.id)&&text(g.title)&&number(g.target)&&g.target>0&&number(g.current)&&text(g.category)&&text(g.deadline))&&
 s.projects.every(p=>text(p.id)&&text(p.title)&&text(p.goal)&&text(p.description)&&text(p.deadline))&&
 s.habits.every(h=>text(h.id)&&text(h.title)&&Array.isArray(h.entries)&&h.entries.every(text))&&
 s.sessions.every(f=>text(f.id)&&text(f.task)&&text(f.date)&&number(f.minutes)&&typeof f.completed==='boolean')&&
 s.entries.every(e=>text(e.id)&&text(e.title)&&text(e.body)&&text(e.date)&&text(e.kind))&&
 s.events.every(e=>text(e.id)&&text(e.title)&&text(e.date)&&text(e.time)&&number(e.duration));}catch{return false;}
}
export type TimerSnapshot={task:string;mode:string;remaining:number;running:boolean;end:number};
export async function loadTimer(){return (await (await db()).get('workspace','timer')) as TimerSnapshot|undefined;}
export async function saveTimer(timer:TimerSnapshot){await (await db()).put('workspace',timer,'timer');}
export function recommend(s:State){return s.tasks.filter(t=>!['Done','Archived','Waiting'].includes(t.status)).map(t=>({task:t,score:(5-t.priority)*10+(t.date&&t.date<=today()?20:0)+(t.top?15:0)+(s.projects.find(p=>p.id===t.project)?.goal?5:0)-t.estimate/60})).sort((a,b)=>b.score-a.score)[0]?.task;}
export interface CalendarProvider {getEvents():Promise<Event[]>;createEvent(event:Event):Promise<void>;updateEvent(event:Event):Promise<void>;deleteEvent(id:string):Promise<void>}
export class LocalCalendarProvider implements CalendarProvider {
 constructor(private getState:()=>State,private setState:(s:State)=>void){}
 async getEvents(){return this.getState().events;}
 async createEvent(event:Event){const s=this.getState();this.setState({...s,events:[...s.events,event]});}
 async updateEvent(event:Event){const s=this.getState();this.setState({...s,events:s.events.map(x=>x.id===event.id?event:x)});}
 async deleteEvent(id:string){const s=this.getState();this.setState({...s,events:s.events.filter(x=>x.id!==id)});}
}
