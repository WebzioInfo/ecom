import * as fs from 'fs';
import * as path from 'path';

const files = [
  'super-admins/super-admins.module.ts',
  'notifications/notifications.module.ts',
  'inventory/inventory.module.ts',
  'customers/customers.module.ts',
  'audit-logs/audit-logs.module.ts'
];

for (const f of files) {
  const filePath = path.join(__dirname, '../src/modules', f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove MongooseModule.forFeature block
  content = content.replace(/MongooseModule\.forFeature\(\[[\s\S]*?\]\),?/g, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${f}`);
}
