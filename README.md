# ParcelTrack - Modern Parcel Management System

A comprehensive web-based parcel tracking and inventory management system for central hubs like university mailrooms, condominium offices, and corporate mailrooms. Built with Next.js 15, TypeScript, and Tailwind CSS.

## 🎯 Overview

ParcelTrack streamlines last-mile parcel delivery operations by enabling recipients to pre-register tracking numbers before parcels arrive, with intelligent storage assignment and automated notifications.

**Key Benefits:**
- ⚡ 50-70% faster check-in for pre-registered parcels
- 🔔 Automated WhatsApp/Email notifications
- 🗄️ Weight-based smart storage allocation (Zones A/B/C)
- 📱 Real-time tracking for recipients
- 🔍 Complete audit trail and analytics

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Visit http://localhost:3000

## 🛠️ Technology Stack

- **Framework:** Next.js 15.2.3 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT-based auth with bcrypt
- **UI Components:** React 19 with custom components
- **Charts:** ApexCharts
- **Maps:** JSVectorMap

## ✨ Key Features

### For Recipients 📱
- ✅ Pre-register parcels before arrival
- 📬 Automatic WhatsApp/Email notifications
- 🔍 Real-time parcel tracking
- 💳 View storage location and fees
- 📊 Dashboard with parcel history

### For Operators 🚚
- 📷 Barcode scanning for quick check-in
- 🏷️ Auto-generated storage labels (weight-based zones)
- 💰 Automatic fee calculation
- 🔎 Fast search by tracking ID/name/phone
- 📊 Real-time inventory dashboard

### For Admins 👨‍💼
- 👥 User and hub management
- 📈 Analytics dashboard with charts
- ⚙️ System configuration
- 💵 Fee management
- 📋 Complete audit logs

## 🔄 System Workflows

### Pre-Registered Path (Fast) 🚀
1. Recipient pre-registers tracking ID → Status: `EXPECTED`
2. Operator scans parcel → Instant match
3. System assigns storage location (e.g., "B-42") + calculates fee
4. Automated notification sent to recipient
5. Quick pickup with minimal verification

**⏱️ Time: ~2 min check-in, ~1 min checkout**

### Walk-in Path (Standard) 📦
1. Parcel arrives without pre-registration
2. Operator scans → Creates new entry
3. System assigns storage + calculates fee → Status: `READY_FOR_PICKUP`
4. Recipient arrives → Verification → Payment → Pickup

**⏱️ Time: ~3-5 min check-in, ~2 min checkout**

## 🗄️ Database Schema

**Core Tables:**
- `users` - Recipients, operators, admins with role-based access
- `hubs` - Physical locations (mailrooms, offices)
- `parcels` - Parcel records with tracking and status
- `storage_locations` - Zone-based storage (A/B/C by weight)

**Storage Zones:**
- **Zone A:** Parcels ≤5kg (Small, RM 1.00)
- **Zone B:** Parcels 5-20kg (Medium, RM 3.00)
- **Zone C:** Parcels >20kg (Large, RM 3.00)

## 🔐 User Roles & Access

| Role | Access Level | Key Permissions |
|------|-------------|----------------|
| **Recipient** | User Portal | Pre-register, track parcels, receive notifications |
| **Operator** | Operations | Check-in/out, scan, process payments |
| **Admin** | Full System | User management, analytics, configuration |

## 📊 Project Status

### ✅ Completed Features
- [x] Multi-hub architecture with location management
- [x] Role-based authentication (JWT + bcrypt)
- [x] Recipient portal (dashboard, pre-register, tracking)
- [x] Operator workflows (check-in, check-out, inventory)
- [x] Admin dashboard (analytics, user management, parcels)
- [x] Weight-based storage auto-assignment
- [x] Real-time status tracking
- [x] Responsive UI with dark mode
- [x] Complete API layer (REST endpoints)

### 🚧 In Progress
- [ ] WhatsApp/Email notification integration
- [ ] Barcode scanner integration
- [ ] Payment gateway integration
- [ ] Advanced search and filters

## 📦 Project Structure

```
parceltrack/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── recipient/         # Recipient portal
│   │   ├── operator/          # Operator dashboard
│   │   ├── admin/             # Admin dashboard
│   │   └── api/               # API routes
│   ├── components/            # Reusable UI components
│   ├── controllers/           # Business logic layer
│   ├── models/                # Database access layer
│   ├── lib/                   # Utilities (auth, db, helpers)
│   ├── types/                 # TypeScript definitions
│   └── context/               # React contexts
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
└── public/                    # Static assets
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration

### Recipient APIs
- `GET /api/recipient/parcels` - List user's parcels
- `GET /api/recipient/parcels/[id]` - Get parcel details
- `POST /api/recipient/pre-register` - Pre-register parcel
- `DELETE /api/recipient/parcels/[id]` - Cancel pre-registration

### Operator APIs
- `POST /api/v1/operator/check-in` - Check-in parcel
- `POST /api/v1/operator/check-out` - Check-out parcel
- `GET /api/operator/inventory` - View inventory
- `GET /api/operator/dashboard` - Dashboard stats

### Admin APIs
- `GET /api/admin/dashboard` - Analytics data
- `GET /api/admin/parcels` - All parcels with filters
- `GET /api/admin/users` - User management
- `GET /api/hubs` - Hub management

## 🚀 Deployment

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Environment variables configured

### Environment Setup
```bash
# Copy example env file
cp .env.example .env

# Configure your database URL and JWT secret
DATABASE_URL="postgresql://user:password@localhost:5432/parceltrack"
JWT_SECRET="your-secure-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is based on TailAdmin Next.js template, released under the MIT License.

## 🙏 Acknowledgments

- Built on [TailAdmin](https://tailadmin.com/) Next.js dashboard template
- UI components styled with Tailwind CSS
- Charts powered by ApexCharts

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Status:** Active Development
