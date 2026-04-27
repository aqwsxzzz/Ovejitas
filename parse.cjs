const fs = require('fs');
const filepath = 'C:/projects/Ovejitas/Ovejitas-api/openapi.json';
const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
const groups = { auth: [], assets: [], individuals: [], events: [], 'event-categories': [], reports: [] };

const getRef = (obj) => {
    if (!obj) return null;
    if (obj['$ref']) return obj['$ref'].split('/').pop();
    if (obj.content) {
        for (const ct in obj.content) {
            const schema = obj.content[ct].schema;
            if (schema) {
                if (schema['$ref']) return schema['$ref'].split('/').pop();
                if (schema.type === 'array' && schema.items && schema.items['$ref'])
                    return 'Array[' + schema.items['$ref'].split('/').pop() + ']';
            }
        }
    }
    return null;
};

for (const path in data.paths) {
    let group = null;
    if (path.includes('/auth')) group = 'auth';
    else if (path.includes('/assets')) group = 'assets';
    else if (path.includes('/individuals')) group = 'individuals';
    else if (path.includes('/event-categories')) group = 'event-categories';
    else if (path.includes('/events')) group = 'events';
    else if (path.includes('/reports')) group = 'reports';
    
    if (group) {
        for (const method in data.paths[path]) {
            if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
                const details = data.paths[path][method];
                const req = getRef(details.requestBody);
                const responses = details.responses || {};
                const resObj = responses['200'] || responses['201'];
                const res = getRef(resObj);
                groups[group].push({ 
                    path, 
                    method: method.toUpperCase(), 
                    req: req || '-', 
                    res: res || '-' 
                });
            }
        }
    }
}

for (const key in groups) {
    if (groups[key].length) {
        console.log('\n[' + key.toUpperCase() + ']');
        groups[key].forEach(i => {
            console.log(`${i.method} ${i.path} | Req: ${i.req} | Res: ${i.res}`);
        });
    }
}
