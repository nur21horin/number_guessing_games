import json
import urllib.request

start_req = urllib.request.Request(
    'http://localhost:8000/start',
    data=json.dumps({'start': 1, 'end': 100}).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST',
)
with urllib.request.urlopen(start_req) as response:
    start_data = json.loads(response.read().decode())
    print('START', start_data)

answer_req = urllib.request.Request(
    'http://localhost:8000/answer',
    data=json.dumps({'game_id': start_data['game_id'], 'answer': 'no'}).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST',
)
with urllib.request.urlopen(answer_req) as response:
    answer_data = json.loads(response.read().decode())
    print('ANSWER', answer_data)
