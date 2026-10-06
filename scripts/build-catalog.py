from pathlib import Path
import json,re,subprocess
root=Path(__file__).resolve().parents[1]
quizzes={}
for p in [*(root/'English').glob('*.html'),*(root/'Business').glob('*.html')]:
 s=p.read_text();m=re.search(r'(?:const|let)\s+bank\s*=\s*\{',s)
 if not m:continue
 bank=json.JSONDecoder().raw_decode(s[m.end()-1:])[0]
 questions={'core:'+str(q['n']):{'key':bank['key'][i],'topic':q.get('topic','')} for i,q in enumerate(bank['questions'])}
 data={'title':bank['title'],'subject':'AP Literature' if p.parent.name=='English' else 'AP Business','questions':questions}
 if 'const bonusBank =' in s:
  start=s.index('{',s.index('const bonusBank ='))
  try:
   obj,used=json.JSONDecoder().raw_decode(s[start:]);literal=s[start:start+used]
  except json.JSONDecodeError:
   end=s.index('\n    };',start)+6;literal=s[start:end]
  bonus=json.loads(subprocess.check_output(['node','--input-type=commonjs','-e',"const vm=require('node:vm');let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>process.stdout.write(JSON.stringify(vm.runInNewContext('('+s+')',{}, {timeout:1000}))));"],input=literal,text=True))
  for i,q in enumerate(bonus['questions']):questions['bonus:'+str(i)]={'key':bonus['key'][i],'topic':q.get('topic','Bonus')}
  data.update(minBonus=int(re.search(r'MIN_BONUS_COUNT\s*=\s*(\d+)',s)[1]),maxBonus=int(re.search(r'MAX_BONUS_COUNT\s*=\s*(\d+)',s)[1]),bonusPenalty='function pointsEliminated' in s)
 quizzes[str(p.relative_to(root))]=data
(root/'convex/catalog.json').write_text(json.dumps(quizzes,ensure_ascii=False,indent=2)+'\n')
print('Built grading catalog for',len(quizzes),'quizzes')
