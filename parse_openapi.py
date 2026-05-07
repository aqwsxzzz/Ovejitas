import json
import sys
import os

filepath = 'C:/projects/Ovejitas/Ovejitas-api/openapi.json'
if not os.path.exists(filepath):
    print(f"Error: {filepath} not found")
    sys.exit(1)

with open(filepath, 'r') as f:
    data = json.load(f)

groups = {
    'auth': [],
    'assets': [],
    'individuals': [],
    'events': [],
    'event-categories': [],
    'reports': []
}

paths = data.get('paths', {})

def get_ref(obj):
    if not obj: return None
    if '$ref' in obj:
        return obj['$ref'].split('/')[-1]
    if 'content' in obj:
        for content_type in obj['content']:
            schema = obj['content'][content_type].get('schema', {})
            if '$ref' in schema:
                return schema['$ref'].split('/')[-1]
            elif schema.get('type') == 'array' and 'items' in schema and '$ref' in schema['items']:
                return f"Array[{schema['items']['$ref'].split('/')[-1]}]"
    return None

for path, methods in paths.items():
    group = None
    if '/auth' in path: group = 'auth'
    elif '/assets' in path: group = 'assets'
    elif '/individuals' in path: group = 'individuals'
    elif '/event-categories' in path: group = 'event-categories'
    elif '/events' in path: group = 'events'
    elif '/reports' in path: group = 'reports'
    
    if group:
        for method, details in methods.items():
            if method.lower() not in ['get', 'post', 'put', 'delete', 'patch']:
                continue
            
            req_body = get_ref(details.get('requestBody', {}))
            
            responses = details.get('responses', {})
            # Look for 200 or 201
            res_obj = responses.get('200') or responses.get('201')
            res_ref = get_ref(res_obj)
            
            groups[group].append({
                'path': path,
                'method': method.upper(),
                'req': req_body or '-',
                'res': res_ref or '-'
            })

for group, items in groups.items():
    if items:
        print(f"\n[{group.upper()}]")
        for item in items:
            print(f"{item['method']} {item['path']} | Req: {item['req']} | Res: {item['res']}")
