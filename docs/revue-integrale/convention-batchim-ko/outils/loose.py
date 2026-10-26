import re
MAP=[(('ddj','tch','dj','j'),'J'),(('kk','kh','gu','k','g'),'K'),(('tt','th','t','d'),'T'),(('pp','ph','p','b'),'P'),(('ss','ch','s'),'S')]
def seg0(x):
    for keys,v in MAP:
        for k in keys:
            if x.startswith(k): return v+x[len(k):]
    return x
def segn(x):
    for a,b in (('ddj','dj'),('kk','g'),('tt','d'),('pp','b'),('ss','s'),('kh','k'),('ph','p'),('th','t')):
        if x.startswith(a): return b+x[len(a):]
    if x.startswith('gu') and len(x)>2 and x[2] in 'eéèiy': return 'g'+x[2:]
    return x
def L(w):
    p=w.split('-')
    return '-'.join([seg0(p[0])]+[segn(x) for x in p[1:]])
