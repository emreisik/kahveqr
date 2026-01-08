import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed with Brand/Branch system...');

  // Clear existing data
  await prisma.activity.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.businessUser.deleteMany();
  await prisma.cafeBranch.deleteMany();
  await prisma.cafeBrand.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleared existing data');

  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: 'demo@kahveqr.com',
      name: 'Demo Kullanıcı',
      phone: '+905551234567',
    },
  });

  console.log('✓ Created demo user:', user.email);

  // Create cafe brands with their branches
  const brandsData = [
    {
      name: 'Starbucks',
      category: 'Kahve Zinciri',
      stampsRequired: 10,
      rewardName: 'Ücretsiz Grande İçecek',
      branches: [
        {
          name: 'Kadıköy Şubesi',
          address: 'Bağdat Cad. No:432, Kadıköy',
          latitude: 40.9840,
          longitude: 29.0330,
          phone: '+902161234567',
          openNow: true,
        },
        {
          name: 'Beyoğlu Şubesi',
          address: 'İstiklal Cad. No:123, Beyoğlu',
          latitude: 41.0340,
          longitude: 28.9780,
          phone: '+902122345678',
          openNow: true,
        },
        {
          name: 'Beşiktaş Şubesi',
          address: 'Barbaros Bulvarı No:56, Beşiktaş',
          latitude: 41.0420,
          longitude: 29.0080,
          phone: '+902123456789',
          openNow: true,
        },
      ],
    },
    {
      name: 'Kahve Dünyası',
      category: 'Türk Kahvesi',
      stampsRequired: 8,
      rewardName: 'Ücretsiz Türk Kahvesi',
      branches: [
        {
          name: 'Şişli Şubesi',
          address: 'Teşvikiye Cad. Şişli',
          latitude: 41.0530,
          longitude: 28.9940,
          phone: '+902124567890',
          openNow: true,
        },
        {
          name: 'Moda Şubesi',
          address: 'Moda Cad. No:78, Kadıköy',
          latitude: 40.9850,
          longitude: 29.0320,
          phone: '+902165678901',
          openNow: true,
        },
      ],
    },
    {
      name: 'Espresso Lab',
      category: 'Specialty Coffee',
      stampsRequired: 10,
      rewardName: 'Ücretsiz Filtre Kahve',
      branches: [
        {
          name: 'Karaköy Şubesi',
          address: 'Kemankeş Mah. Karaköy',
          latitude: 41.0240,
          longitude: 28.9740,
          phone: '+902126789012',
          openNow: true,
        },
      ],
    },
    {
      name: 'Petra Roasting',
      category: 'Roastery',
      stampsRequired: 10,
      rewardName: 'Ücretsiz Espresso Based',
      branches: [
        {
          name: 'Arnavutköy Şubesi',
          address: 'Arnavutköy, Beşiktaş',
          latitude: 41.0650,
          longitude: 29.0420,
          phone: '+902127890123',
          openNow: false,
        },
      ],
    },
    {
      name: 'Kronotrop',
      category: 'Specialty Coffee',
      stampsRequired: 10,
      rewardName: 'Ücretsiz Filtre Kahve',
      branches: [
        {
          name: 'Bebek Şubesi',
          address: 'Bebek Cad. No:56',
          latitude: 41.0780,
          longitude: 29.0450,
          phone: '+902128901234',
          openNow: true,
        },
      ],
    },
  ];

  const brands = [];
  const allBranches = [];

  for (const brandData of brandsData) {
    const { branches, ...brandInfo } = brandData;
    
    const brand = await prisma.cafeBrand.create({
      data: brandInfo,
    });

    brands.push(brand);

    for (const branchData of branches) {
      const branch = await prisma.cafeBranch.create({
        data: {
          ...branchData,
          brandId: brand.id,
        },
      });
      allBranches.push({ ...branch, brandId: brand.id, brandName: brand.name });
    }
  }

  console.log(`✓ Created ${brands.length} brands with ${allBranches.length} branches`);

  // Create memberships for demo user (brand level)
  const membershipsData = [
    { brandIndex: 0, stamps: 10 }, // Starbucks - completed
    { brandIndex: 1, stamps: 4 },  // Kahve Dünyası - half
    { brandIndex: 2, stamps: 6 },  // Espresso Lab - half
    { brandIndex: 3, stamps: 0 },  // Petra - empty
    { brandIndex: 4, stamps: 8 },  // Kronotrop - almost complete
  ];

  for (const { brandIndex, stamps } of membershipsData) {
    await prisma.membership.create({
      data: {
        userId: user.id,
        brandId: brands[brandIndex].id,
        stamps,
        lastStampAt: stamps > 0 ? new Date() : null,
      },
    });
  }

  console.log(`✓ Created ${membershipsData.length} memberships`);

  // Create sample activities (branch level)
  const now = Date.now();
  for (const { brandIndex, stamps } of membershipsData) {
    if (stamps > 0) {
      const brand = brands[brandIndex];
      const brandBranches = allBranches.filter(b => b.brandId === brand.id);
      
      // Distribute stamps across different branches
      for (let i = 0; i < stamps; i++) {
        const randomBranch = brandBranches[i % brandBranches.length];
        await prisma.activity.create({
          data: {
            userId: user.id,
            brandId: brand.id,
            branchId: randomBranch.id,
            type: 'earn',
            delta: 1,
            createdAt: new Date(now - (stamps - i) * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  console.log('✓ Created sample activities');

  // Create business users with role hierarchy (Starbucks example)
  const businessPassword = await bcrypt.hash('123456', 10);
  const starbucks = brands[0];
  const starbucksKadikoy = allBranches.find(b => b.brandId === starbucks.id && b.name === 'Kadıköy Şubesi');
  const starbucksBeyoglu = allBranches.find(b => b.brandId === starbucks.id && b.name === 'Beyoğlu Şubesi');

  // OWNER - manages all branches of the brand
  const starbucksOwner = await prisma.businessUser.create({
    data: {
      email: 'mehmet@starbucks.com',
      name: 'Mehmet Yılmaz',
      passwordHash: businessPassword,
      brandId: starbucks.id,
      branchId: null, // Owner is not tied to specific branch
      role: 'OWNER',
      isActive: true,
    },
  });

  // BRANCH_MANAGER - Kadıköy branch
  const kadikovManager = await prisma.businessUser.create({
    data: {
      email: 'ayse.kadikoy@starbucks.com',
      name: 'Ayşe Demir',
      passwordHash: businessPassword,
      brandId: starbucks.id,
      branchId: starbucksKadikoy!.id,
      role: 'BRANCH_MANAGER',
      isActive: true,
      createdBy: starbucksOwner.id,
    },
  });

  // STAFF - Kadıköy branch
  await prisma.businessUser.create({
    data: {
      email: 'ali.kadikoy@starbucks.com',
      name: 'Ali Yılmaz',
      passwordHash: businessPassword,
      brandId: starbucks.id,
      branchId: starbucksKadikoy!.id,
      role: 'STAFF',
      isActive: true,
      createdBy: kadikovManager.id,
    },
  });

  await prisma.businessUser.create({
    data: {
      email: 'zeynep.kadikoy@starbucks.com',
      name: 'Zeynep Kaya',
      passwordHash: businessPassword,
      brandId: starbucks.id,
      branchId: starbucksKadikoy!.id,
      role: 'STAFF',
      isActive: true,
      createdBy: kadikovManager.id,
    },
  });

  // BRANCH_MANAGER - Beyoğlu branch
  const beyogluManager = await prisma.businessUser.create({
    data: {
      email: 'can.beyoglu@starbucks.com',
      name: 'Can Özdemir',
      passwordHash: businessPassword,
      brandId: starbucks.id,
      branchId: starbucksBeyoglu!.id,
      role: 'BRANCH_MANAGER',
      isActive: true,
      createdBy: starbucksOwner.id,
    },
  });

  // STAFF - Beyoğlu branch
  await prisma.businessUser.create({
    data: {
      email: 'elif.beyoglu@starbucks.com',
      name: 'Elif Yıldız',
      passwordHash: businessPassword,
      brandId: starbucks.id,
      branchId: starbucksBeyoglu!.id,
      role: 'STAFF',
      isActive: true,
      createdBy: beyogluManager.id,
    },
  });

  console.log('✓ Created Starbucks role hierarchy:');
  console.log('  - OWNER: mehmet@starbucks.com (manages all branches)');
  console.log('  - BRANCH_MANAGER: ayse.kadikoy@starbucks.com (Kadıköy)');
  console.log('  - STAFF: ali.kadikoy@starbucks.com, zeynep.kadikoy@starbucks.com (Kadıköy)');
  console.log('  - BRANCH_MANAGER: can.beyoglu@starbucks.com (Beyoğlu)');
  console.log('  - STAFF: elif.beyoglu@starbucks.com (Beyoğlu)');

  // Create simple OWNER for other brands
  for (let i = 1; i < brands.length; i++) {
    const brand = brands[i];
    const firstBranch = allBranches.find(b => b.brandId === brand.id);
    
    await prisma.businessUser.create({
      data: {
        email: `${brand.name.toLowerCase().replace(/\s+/g, '')}@kahveqr.com`,
        name: `${brand.name} Yönetici`,
        passwordHash: businessPassword,
        brandId: brand.id,
        branchId: firstBranch?.id || null,
        role: 'OWNER',
        isActive: true,
      },
    });
  }

  console.log(`✓ Created OWNER accounts for ${brands.length - 1} other brands`);
  console.log('🎉 Seed completed successfully with Brand/Branch system!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
