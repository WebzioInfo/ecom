import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
  console.log("Schema dropped")
  process.exit(0)
}
main()
