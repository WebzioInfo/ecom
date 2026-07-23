import * as fs from 'fs';
import * as path from 'path';

const files = [
  'marketing/dto/coupon.dto.ts',
  'notifications/dto/create-notification.dto.ts',
  'stores/dto/store.dto.ts',
  'stores/stores.controller.ts',
  'support/dto/create-ticket.dto.ts',
  'support/dto/reply-ticket.dto.ts',
  'support/support.controller.ts'
];

for (const f of files) {
  const filePath = path.join(__dirname, '../src/modules', f);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]\.\.?\/schemas\/[^'"]+['"];?/g, "import { $1 } from '@prisma/client';");
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed imports in ${f}`);
}
