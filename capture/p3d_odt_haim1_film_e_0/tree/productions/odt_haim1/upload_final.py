# -*- coding: utf-8 -*-
"""Upload the final odt_haim1 mp4 to Drive (clasp token of 6787012, resumable), share it with 6742853 and by link.
    python productions/odt_haim1/upload_final.py <mp4>
Writes productions/odt_haim1/drive_link.json {id, link}."""
import json, os, ssl, sys, urllib.request, urllib.parse

CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE
HERE = os.path.dirname(os.path.abspath(__file__))
MAIN = '6742853@gmail.com'


def token():
    t = json.load(open(os.path.expanduser('~/.clasprc.json'), encoding='utf-8'))['tokens']['default']
    body = urllib.parse.urlencode({'client_id': t['client_id'], 'client_secret': t['client_secret'],
                                   'refresh_token': t['refresh_token'], 'grant_type': 'refresh_token'}).encode()
    r = urllib.request.urlopen(urllib.request.Request('https://oauth2.googleapis.com/token', body,
                               {'Content-Type': 'application/x-www-form-urlencoded'}), context=CTX, timeout=40)
    return json.load(r)['access_token']


path = sys.argv[1]
size = os.path.getsize(path)
H = {'Authorization': 'Bearer ' + token()}
meta = json.dumps({'name': os.path.basename(path)}).encode('utf-8')
req = urllib.request.Request('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id', meta,
                             dict(H, **{'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'video/mp4',
                                        'X-Upload-Content-Length': str(size)}))
loc = urllib.request.urlopen(req, context=CTX, timeout=60).headers['Location']
CH = 16 * 1024 * 1024
fid = None
with open(path, 'rb') as fh:
    off = 0
    while off < size:
        chunk = fh.read(CH)
        end = off + len(chunk) - 1
        r = urllib.request.Request(loc, chunk, {'Content-Length': str(len(chunk)), 'Content-Range': 'bytes %d-%d/%d' % (off, end, size)}, method='PUT')
        try:
            resp = urllib.request.urlopen(r, context=CTX, timeout=600)
            fid = json.load(resp)['id']
        except urllib.error.HTTPError as e:
            if e.code != 308:
                raise
        off = end + 1
        print('uploaded %.0f%%' % (100.0 * off / size), flush=True)


def perm(body):
    r = urllib.request.Request('https://www.googleapis.com/drive/v3/files/%s/permissions?sendNotificationEmail=false' % fid,
                               json.dumps(body).encode('utf-8'), dict(H, **{'Content-Type': 'application/json; charset=UTF-8'}))
    return json.load(urllib.request.urlopen(r, context=CTX, timeout=60))


perm({'type': 'user', 'role': 'writer', 'emailAddress': MAIN})
perm({'type': 'anyone', 'role': 'reader'})
link = 'https://drive.google.com/file/d/%s/view' % fid
json.dump({'id': fid, 'link': link, 'size_mb': round(size / 1e6, 1)}, open(os.path.join(HERE, 'drive_link.json'), 'w'))
print('OK', link)
