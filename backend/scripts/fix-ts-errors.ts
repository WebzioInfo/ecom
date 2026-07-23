import * as fs from 'fs';
import * as path from 'path';

function replaceInFile(filePath: string, search: string | RegExp, replacement: string) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf8');
  const newContent = content.replace(search, replacement);
  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// 1. Fix DTO paths
replaceInFile('src/modules/stores/dto/store.dto.ts', `'../../generated/public-client'`, `'../../../generated/public-client'`);
replaceInFile('src/modules/support/dto/create-ticket.dto.ts', `'../../generated/public-client'`, `'../../../generated/public-client'`);
replaceInFile('src/modules/support/dto/reply-ticket.dto.ts', `'../../generated/public-client'`, `'../../../generated/public-client'`);

// 2. Fix api-keys.service.ts line 49
replaceInFile('src/modules/api-keys/api-keys.service.ts', `keys.map(({ secretHash, ...rest }) => rest)`, `keys.map((k: any) => { const { secretHash, ...rest } = k; return rest; })`);

// 3. Fix cart.service.ts line 29
replaceInFile('src/modules/cart/cart.service.ts', `p => p.id === item.product`, `(p: any) => p.id === item.product`);

// 4. Fix products.service.ts lines 98 and 106
replaceInFile('src/modules/products/products.service.ts', `products.map(p => p.category)`, `products.map((p: any) => p.category)`);
replaceInFile('src/modules/products/products.service.ts', `products.map(p => p.brand)`, `products.map((p: any) => p.brand)`);

// 5. Fix users.service.ts line 74
replaceInFile('src/modules/users/users.service.ts', `filter(id => id !== productId)`, `filter((id: any) => id !== productId)`);
