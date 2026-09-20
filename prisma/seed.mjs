// One-off: create the first user + workspace on a fresh database.
// This app has no signup route (removed in 52b765a), so the first
// account must be created here.
//
// Run:  SEED_NAME="Your Name" SEED_EMAIL="you@example.com" SEED_PASSWORD="..." node prisma/seed.mjs
//
// Credentials are read from the environment and never written to disk.

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const name = process.env.SEED_NAME
const email = process.env.SEED_EMAIL
const password = process.env.SEED_PASSWORD

if (!name || !email || !password) {
 console.error('Missing SEED_NAME, SEED_EMAIL or SEED_PASSWORD.')
 process.exit(1)
}

if (password.length < 8) {
 // Matches loginSchema in src/lib/validations/index.ts
 console.error('SEED_PASSWORD must be at least 8 characters.')
 process.exit(1)
}

async function main() {
 const existing = await prisma.user.findUnique({ where: { email } })

 if (existing) {
 console.log(`User ${email} already exists — nothing to do.`)
 return
 }

 // Same hashing cost as the original signup route (52b765a)
 const hashedPassword = await bcrypt.hash(password, 10)

 const user = await prisma.user.create({
 data: { name, email, password: hashedPassword },
 })

 const workspaceSlug = `${name.toLowerCase().replace(/\s+/g, '-')}-workspace-${Date.now()}`

 const workspace = await prisma.workspace.create({
 data: {
 name: `${name}'s Workspace`,
 slug: workspaceSlug,
 members: {
 create: { userId: user.id, role: 'OWNER' },
 },
 },
 })

 console.log(`Created user ${user.email} and workspace "${workspace.name}".`)
 console.log('You can now log in at /login.')
}

main()
 .catch((e) => {
 console.error('Seed failed:', e.message)
 process.exit(1)
 })
 .finally(async () => {
 await prisma.$disconnect()
 })
