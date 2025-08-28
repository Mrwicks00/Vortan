# 🗄️ Vortan Database Setup Guide

## **Overview**

This guide explains how to set up the database for storing off-chain project information, user staking data, and analytics.

## **🏗️ Architecture**

### **Data Flow:**

```
Smart Contracts (On-chain) ←→ Database (Off-chain) ←→ Frontend
```

### **What Goes Where:**

#### **🔗 ON-CHAIN (Smart Contracts):**

- Token addresses and parameters
- Sale configuration (caps, timing, fees)
- User stakes and rewards
- Transaction data

#### **💾 OFF-CHAIN (Database):**

- Project metadata (name, description, social links)
- Media assets (banners, logos)
- User staking cache (for performance)
- Analytics and social metrics
- Sale participation tracking

## **📦 Installation**

### **1. Install Dependencies:**

```bash
npm install @prisma/client zod
npm install -D prisma
```

### **2. Initialize Prisma:**

```bash
npx prisma init
```

### **3. Generate Prisma Client:**

```bash
npx prisma generate
```

### **4. Create Database:**

```bash
npx prisma db push
```

## **🔧 Configuration**

### **Environment Variables:**

```env
# Database
DATABASE_URL="file:./dev.db"                    # SQLite (development)
DATABASE_URL="postgresql://user:pass@localhost:5432/vortan"  # PostgreSQL (production)

# Optional: MongoDB alternative
MONGODB_URL="mongodb://localhost:27017/vortan"
```

### **Database Options:**

#### **🚀 Development (SQLite):**

- **Pros**: Simple, no setup, file-based
- **Cons**: Limited concurrent users, no advanced features
- **Use case**: Local development, testing

#### **🏭 Production (PostgreSQL):**

- **Pros**: ACID compliance, concurrent users, advanced queries
- **Cons**: Requires setup, more resources
- **Use case**: Production deployment

#### **📄 Alternative (MongoDB):**

- **Pros**: Document-based, flexible schema
- **Cons**: No ACID compliance, different query language
- **Use case**: If you prefer NoSQL

## **📊 Database Schema**

### **Core Tables:**

1. **`project_metadata`** - Project information and social links
2. **`on_chain_data`** - Reference to smart contract parameters
3. **`user_staking`** - Cached staking data for performance
4. **`staking_positions`** - Detailed staking breakdown
5. **`sale_participation`** - User participation tracking
6. **`sale_analytics`** - Social and on-chain metrics

### **Relationships:**

```
ProjectMetadata ←→ OnChainData
ProjectMetadata ←→ SaleParticipation
UserStaking ←→ SaleParticipation
ProjectMetadata ←→ SaleAnalytics
```

## **🚀 Usage Examples**

### **Create Project:**

```typescript
import { prisma } from "@/lib/database/config";

const project = await prisma.projectMetadata.create({
  data: {
    saleAddress: "0x...",
    name: "Andromeda Quest",
    symbol: "ANDQ",
    shortDescription: "AI-powered MMO...",
    longDescription: "Detailed description...",
    website: "https://example.com",
    status: "pending",
    onChainData: {
      create: {
        tokenAddress: "0x...",
        baseToken: "USDC",
        price: "50",
        hardCap: "200000",
        // ... other parameters
      },
    },
  },
});
```

### **Get User Staking:**

```typescript
const staking = await prisma.userStaking.findUnique({
  where: { userAddress: "0x..." },
  include: {
    participations: true,
  },
});
```

### **Update Analytics:**

```typescript
await prisma.saleAnalytics.upsert({
  where: { saleAddress: "0x..." },
  update: {
    twitterMentions: 1280,
    totalBuyers: 312,
    totalRaised: "126000",
  },
  create: {
    saleAddress: "0x...",
    twitterMentions: 1280,
    totalBuyers: 312,
    totalRaised: "126000",
  },
});
```

## **🔄 Data Synchronization**

### **Smart Contract Events → Database:**

```typescript
// Listen to contract events and update database
contract.on("SaleCreated", async (saleAddress, tokenAddress, ...) => {
  await prisma.projectMetadata.update({
    where: { saleAddress },
    data: { status: "live" }
  });
});
```

### **Database → Frontend:**

```typescript
// Use React Query or SWR for data fetching
const { data: projects } = useQuery({
  queryKey: ["projects"],
  queryFn: () => fetch("/api/projects").then((res) => res.json()),
});
```

## **📈 Performance Optimization**

### **Caching Strategy:**

1. **Staking Data**: Cache in database, update on blockchain events
2. **Project Metadata**: Store off-chain, rarely changes
3. **Analytics**: Update periodically, cache results
4. **User Data**: Cache with TTL, refresh on actions

### **Indexing:**

```sql
-- Add indexes for common queries
CREATE INDEX idx_user_staking_address ON user_staking(user_address);
CREATE INDEX idx_sale_participation_sale ON sale_participation(sale_address);
CREATE INDEX idx_project_status ON project_metadata(status);
```

## **🔒 Security Considerations**

### **Data Validation:**

- Use Zod schemas for all input validation
- Sanitize user inputs before database storage
- Validate contract addresses and parameters

### **Access Control:**

- Admin-only access to project creation
- User can only view their own staking data
- Public read access to project metadata

## **🧪 Testing**

### **Database Tests:**

```bash
# Run database tests
npm run test:db

# Reset test database
npx prisma migrate reset --force
```

### **Integration Tests:**

```bash
# Test with real contracts
npm run test:integration
```

## **🚨 Troubleshooting**

### **Common Issues:**

1. **Prisma Client not generated:**

   ```bash
   npx prisma generate
   ```

2. **Database connection failed:**

   - Check DATABASE_URL in .env
   - Ensure database is running
   - Verify network access

3. **Schema mismatch:**
   ```bash
   npx prisma db push --force-reset
   ```

## **📚 Next Steps**

1. **Install dependencies** and initialize Prisma
2. **Set up environment variables** for your database
3. **Generate and push schema** to create tables
4. **Update API routes** to use database instead of mock data
5. **Add Web3 integration** for real-time blockchain data
6. **Implement caching strategy** for performance

## **🔗 Resources**

- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Validation](https://zod.dev)
- [Database Design Best Practices](https://www.prisma.io/docs/guides/database-design)
- [Performance Optimization](https://www.prisma.io/docs/guides/performance-and-optimization)

