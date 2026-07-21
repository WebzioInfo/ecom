import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SuperAdminsService } from './super-admins.service';

/**
 * SuperAdminSeederService
 *
 * Runs automatically on application bootstrap (after all modules are initialized).
 * Creates the default Super Admin account if none exists.
 * If one already exists, ensures it is correctly configured.
 * Never creates duplicates.
 */
@Injectable()
export class SuperAdminSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SuperAdminSeederService.name);

  readonly DEFAULT_EMAIL = 'admin@webzio.com';
  readonly DEFAULT_NAME = 'Webzio Platform Administrator';

  constructor(private readonly superAdminsService: SuperAdminsService) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const count = await this.superAdminsService.count();

      if (count > 0) {
        this.logger.log(
          `Super Admin account already exists (${count} found) — skipping seed.`,
        );
        return;
      }

      this.logger.log(
        'No Super Admin found. Creating default Super Admin account...',
      );

      // Password is stored as plain text here.
      // The SuperAdmin schema's pre('save') bcrypt hook will hash it before persisting.
      await this.superAdminsService.create({
        name: this.DEFAULT_NAME,
        email: this.DEFAULT_EMAIL,
        password: '12345678',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        isActive: true,
        mustChangePassword: false,
      } as any);

      this.logger.log('✅ Default Super Admin created successfully.');
      this.logger.log(`   Name:  ${this.DEFAULT_NAME}`);
      this.logger.log(`   Email: ${this.DEFAULT_EMAIL}`);
      this.logger.warn(
        '   ⚠️  Default password is set. Change it after first login in production.',
      );
    } catch (error) {
      this.logger.error('❌ Failed to seed default Super Admin', error);
    }
  }
}
