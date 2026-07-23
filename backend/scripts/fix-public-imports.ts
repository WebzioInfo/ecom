import * as fs from 'fs';
import * as path from 'path';

const filesToReplaceAll = [
  'api-keys/api-keys.service.ts',
  'plans/plans.service.ts',
  'stores/stores.service.ts',
  'stores/stores.controller.ts',
  'stores/dto/store.dto.ts',
  'super-admins/super-admins.service.ts',
  'support/support.service.ts',
  'support/support.controller.ts',
  'support/dto/create-ticket.dto.ts',
  'support/dto/reply-ticket.dto.ts'
];

for (const f of filesToReplaceAll) {
  const filePath = path.join(__dirname, '../src/modules', f);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping missing file: ${f}`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/'@prisma\/client'/g, `'../../generated/public-client'`);
  content = content.replace(/"@prisma\/client"/g, `\"../../generated/public-client\"`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed all imports in ${f}`);
}

// Special case: notifications.service.ts
const notifPath = path.join(__dirname, '../src/modules/notifications/notifications.service.ts');
if (fs.existsSync(notifPath)) {
  let content = fs.readFileSync(notifPath, 'utf8');
  content = content.replace(
    /import\s*\{\s*Prisma\s*,\s*PlatformNotification\s*,\s*NotificationType\s*,\s*StoreStatus\s*\}\s*from\s*'@prisma\/client';/,
    `import { Prisma, PlatformNotification, NotificationType } from '@prisma/client';\nimport { StoreStatus } from '../../generated/public-client';`
  );
  fs.writeFileSync(notifPath, content, 'utf8');
  console.log(`Fixed imports in notifications.service.ts`);
}
