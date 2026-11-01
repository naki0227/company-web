import json,sys,random,statistics as st,itertools
d=json.load(open(sys.argv[1])); keys=list(d)
for k in keys: print(f"{k:12s} median {st.median(d[k]):6.0f}  p90 {sorted(d[k])[int(len(d[k])*0.9)-1]:5.0f}  <200ms {sum(v<200 for v in d[k])}/{len(d[k])}  {d[k]}")
base=d[keys[0]]
for k in keys[1:]:
    a,b=base,d[k]; obs=st.median(a)-st.median(b); pool=a+b; n=len(a); random.seed(4); c=0
    for _ in range(20000):
        random.shuffle(pool); c+=abs(st.median(pool[:n])-st.median(pool[n:]))>=abs(obs)
    print(f"  {keys[0]} vs {k}: diff {obs:.0f}ms  permutation p={c/20000:.3f}")
