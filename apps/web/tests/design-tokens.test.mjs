import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../src/app/design-tokens.css',import.meta.url),'utf8');
const tokens=Object.fromEntries([...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([,key,value])=>[key,value.trim()]));
const resolve=key=>tokens[key]?.startsWith('var(')?resolve(tokens[key].slice(4,-1)):tokens[key];
const luminance=hex=>{
 const rgb=hex.slice(1).match(/../g).map(s=>parseInt(s,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
};
const contrast=(a,b)=>{const x=luminance(resolve(a)),y=luminance(resolve(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};

test('shared token contract retains the installed brand and explicit typography/spacing/control roles',()=>{
 assert.equal(resolve('--green-dark'),'#245C40');assert.equal(resolve('--background'),'#F5F7F2');
 assert.equal(resolve('--radius-card'),'16px');assert.equal(resolve('--radius-control'),'10px');
 assert.equal(resolve('--control-height'),'48px');assert.equal(resolve('--target-height'),'44px');
 for(const name of ['--font-ui','--font-display','--text-sm','--line-body','--space-4','--space-8','--focus-width','--focus-shadow','--color-scrim','--shadow-card','--color-skeleton'])assert.ok(tokens[name],name);
});

test('normal text color pairs meet 4.5:1 without rounding a failing ratio up',()=>{
 for(const [fg,bg] of [
  ['--color-text','--color-background'],['--color-text','--color-surface'],['--secondary','--color-surface'],
  ['--secondary','--color-background'],['--secondary','--color-surface-soft'],
  ['--color-on-primary','--color-primary'],['--color-on-primary','--color-primary-hover'],
  ['--color-primary','--color-surface'],['--color-primary','--sage-light'],
  ['--color-warning','--color-warning-surface'],['--color-danger','--color-danger-surface'],
  ['--color-success','--color-success-surface'],['--color-info','--color-info-surface'],['--ink','--yellow'],
 ])assert.ok(contrast(fg,bg)>=4.5,`${fg}/${bg}: ${contrast(fg,bg)}`);
});

test('control borders and focus colors have at least 3:1 on their adjacent surfaces',()=>{
 for(const [fg,bg] of [
  ['--control-border','--surface'],['--control-border','--input'],['--control-border','--background'],
  ['--focus-color','--surface'],['--focus-color','--input'],['--focus-color','--sage-light'],['--yellow','--green-dark'],
 ])assert.ok(contrast(fg,bg)>=3,`${fg}/${bg}: ${contrast(fg,bg)}`);
});
