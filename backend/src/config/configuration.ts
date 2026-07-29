export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '4001', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_change_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_change_in_production',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  },
  corsWhitelist: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4001'],
  whatsAppPhone: process.env.WHATSAPP_PHONE || '15551234567',
});
