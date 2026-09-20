import { prisma } from '../../src/lib/prisma.ts';
console.log('standing', await prisma.memberStandingAcceptance.findUnique({ where: { userId_version: { userId: 'test-member', version: '1.0' } } }));
console.log('reporting', await prisma.financePartnerReportingAcceptance.findUnique({ where: { userId_version: { userId: 'test-finance', version: '1.0' } } }));
await prisma.$disconnect();
