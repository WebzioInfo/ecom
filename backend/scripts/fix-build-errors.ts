import * as fs from 'fs';
import * as path from 'path';

function replaceInFile(filePath: string, searchRegex: RegExp, replacement: string) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf8');
  const newContent = content.replace(searchRegex, replacement);
  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// 1. prisma.config.ts
replaceInFile('prisma.config.ts', /\s*earlyAccess:\s*true,?\n/, '\n');

// 2. prisma/seed.ts (Just drop the posts part, or clear it out)
replaceInFile('prisma/seed.ts', /posts: \{[\s\S]*?\},/, '');

// 3. audit-logs.service.ts
replaceInFile('src/modules/audit-logs/audit-logs.service.ts', /changes: params\.changes \|\| \{\},/, 'changes: (params.changes || {}) as Prisma.InputJsonValue,');

// 4. auth.service.ts
replaceInFile('src/modules/auth/auth.service.ts', /user\._id/g, 'user.id');
replaceInFile('src/modules/auth/auth.service.ts', /newUser\._id/g, 'newUser.id');

// 5. jwt.strategy.ts
replaceInFile('src/modules/auth/strategies/jwt.strategy.ts', /user\._id/g, 'user.id');

// 6. super-admin-jwt.strategy.ts
replaceInFile('src/modules/super-admin-auth/strategies/super-admin-jwt.strategy.ts', /admin\._id/g, 'admin.id');

// 7. super-admin-auth.service.ts
replaceInFile('src/modules/super-admin-auth/super-admin-auth.service.ts', /admin\._id/g, 'admin.id');

// 8. notifications.module.ts
replaceInFile('src/modules/notifications/notifications.module.ts', /import \{ PlatformNotification, NotificationSchema \} from '\.\/schemas\/notification\.schema';\n/g, '');
replaceInFile('src/modules/notifications/notifications.module.ts', /import \{ PlatformNotification, NotificationSchema \} from '\.\/schemas\/notification\.schema';/g, '');
// For the multi-line import in notifications.module.ts it might look different, let's just do a generic replace
replaceInFile('src/modules/notifications/notifications.module.ts', /import\s*\{[^}]*\}\s*from\s*'\.\/schemas\/notification\.schema';\n?/g, '');
