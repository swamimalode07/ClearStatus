# ClearStatus

> A modern, multi-tenant status page platform for managing service health, incidents, and scheduled maintenance with real-time public status pages.

[![Demo](https://img.shields.io/badge/Live%20Demo-clearstatus.vercel.app-blue)](https://clearstatus.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black)](https://github.com/swamimalode07/ClearStatus)



### Key Capabilities

- **Multi-Tenant Architecture** - Complete organization isolation with secure data scoping
- **Real-Time Updates** - WebSocket-powered live status updates
- **Incident Management** - Full lifecycle management from detection to resolution
- **Public Status Pages** - Branded, accessible status communication for customers
- **Team Collaboration** - Organization-based team management and permissions

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), Tailwind CSS, Shadcn UI |
| **Backend** | Go, Gin Framework, PostgreSQL |
| **Authentication** | Clerk (JWT-based, Multi-tenant) |
| **Deployment** | Vercel (Frontend), Railway (Backend) |
| **Development** | Cursor, DeepSeek, GitHub |

## Features

### Core Features
- ✅ **User Authentication** - Secure login with Clerk integration
- ✅ **Multi-Tenant Organizations** - Complete data isolation per organization
- ✅ **Team Management** - Role-based access and collaboration
- ✅ **Service Management** - CRUD operations with real-time status tracking
- ✅ **Incident & Maintenance** - Comprehensive lifecycle management
- ✅ **Public Status Pages** - Customer-facing status communication

### Advanced Features
- ✅ **Real-Time Updates** - WebSocket integration for live status changes
- ✅ **External Health Checks** - API endpoints for external monitoring
- ✅ **Email Notifications** - Automated stakeholder communication
- ✅ **Uptime Analytics** - Historical performance tracking
- ✅ **Responsive Design** - Mobile-first, accessible interface

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Go 1.21+
- PostgreSQL database
- Clerk account for authentication

### 1. Clone Repository
```bash
git clone https://github.com/swamimalode07/ClearStatus.git
cd ClearStatus
```

### 2. Frontend Setup
```bash
cd status-frontend
cp .env.example .env
```


Install and start:
```bash
npm install
npm run dev
```
Frontend available at `http://localhost:3000`

### 3. Backend Setup
```bash
cd backend-go
cp .env.example .env
```

Start the backend:
```bash
go run main.go
```
API available at `http://localhost:8080`

## Architecture

### Multi-Tenant Design
- **Data Isolation**: All data scoped by organization ID from Clerk
- **Security**: JWT validation with organization context on every request
- **Scalability**: Horizontal scaling with tenant-aware routing

### Authentication Flow
1. Users authenticate via Clerk (email/OTP or Google)
2. Custom JWT template includes organization ID
3. Backend validates JWT and scopes all operations to organization
4. Public pages accessible via organization-specific URLs

### API Design
```
/api/auth/*          - Authentication endpoints
/api/services/*      - Service management (org-scoped)
/api/incidents/*     - Incident management (org-scoped)
/api/external/*      - Public health check endpoints
/status?org=<id>     - Public status page
```

## Project Structure

```
ClearStatus/
├── backend-go/                 # Go backend service
│   ├── main.go                # Application entry point
│   ├── routes/                # API route handlers
│   ├── middleware/            # Authentication & validation
│   └── models/                # Data models
├── status-frontend/           # Next.js frontend
│   ├── app/                   # App Router pages
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utilities and configurations
│   └── public/                # Static assets
└── README.md
```

## Deployment

### Production Deployment
- **Frontend**: Deployed on Vercel with automatic deployments
- **Backend**: Deployed on Railway with PostgreSQL integration
- **Environment**: Secure environment variable management

### Environment Configuration
Both platforms require proper environment variable configuration matching the local setup requirements.

## Testing the Application

### Demo Access
- **Live Demo**: [clearstatus.vercel.app](https://clearstatus.vercel.app)
- **Authentication**: Use any email (OTP sent) or Google sign-in
- **Public Status**: Access organization status pages without authentication



## Development Highlights

- **Security-First**: Multi-tenant JWT validation with organization scoping
- **Modern Stack**: Latest Next.js features with App Router and React Server Components
- **Real-Time**: WebSocket integration for live status updates
- **Production-Ready**: Clean architecture with separation of concerns
- **Developer Experience**: Comprehensive tooling and clear code structure



---

<div align="center">
  <strong>Built with ❤️ for the developer community</strong>
</div>

