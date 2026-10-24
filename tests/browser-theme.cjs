const {chromium}=require('playwright');
const assert=require('node:assert/strict');
function contrast(a,b){const lum=c=>{const rgb=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'light',reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.APP_URL||'http://127.0.0.1:5173');
 await page.getByRole('button',{name:'Explore demo workspace'}).click();
 await page.getByRole('button',{name:'Toggle theme'}).click();
 await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
 async function check(selector){const c=await page.locator(selector).first().evaluate(el=>{let bg=el;while(getComputedStyle(bg).backgroundColor==='rgba(0, 0, 0, 0)'&&bg.parentElement)bg=bg.parentElement;return [getComputedStyle(el).color,getComputedStyle(bg).backgroundColor];});assert(contrast(...c)>=4.5,`${selector} contrast: ${contrast(...c).toFixed(2)}`);}
 for(const selector of ['.primary','.page-title h2','.brand','.workspace','.sidebar nav button','.task-text strong','.task-text>span','.card-subtitle','.greeting p','.goal-info>button','.activity-item p'])await check(selector);
 await page.locator('.sidebar nav').getByRole('button',{name:'Tasks',exact:false}).click();
 assert.equal(await page.locator('.main-shell').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(28, 27, 33)');
 await check('.task-text strong');await check('.done .task-text strong');
 await page.screenshot({path:'/tmp/mission-control-dark-tasks.png',fullPage:true});
 await page.getByRole('button',{name:'Quick capture'}).click();await check('dialog input[name=title]');await check('dialog label');await page.getByRole('button',{name:'Close dialog'}).click();
 for(const name of ['Mission Control','Projects','Goals','Focus','Habits','Calendar','Notes','Journal','Analytics','Review']){await page.locator('.sidebar nav').getByRole('button',{name,exact:true}).click();await check('.page-title h2');}
 await page.locator('.sidebar-footer').getByRole('button',{name:'Settings',exact:true}).click();
 await page.locator('select').first().selectOption('system');
 await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
 await page.emulateMedia({colorScheme:'dark'});
 await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
 await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
 await page.getByRole('button',{name:'Toggle theme'}).click();await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
 assert.equal(await page.locator('.main-shell').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(248, 249, 251)');
 await page.locator('.sidebar-footer').getByRole('button',{name:'Settings',exact:true}).click();
 assert.equal(await page.locator('select').first().inputValue(),'light');
 await page.getByRole('button',{name:'Toggle theme'}).click();await page.setViewportSize({width:390,height:844});
 await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');await check('.mobile-nav button');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: dark backgrounds, text contrast, dialogs, all screens, system theme updates, reload persistence, explicit toggle, mobile navigation');
})().catch(e=>{console.error(e);process.exit(1)});
