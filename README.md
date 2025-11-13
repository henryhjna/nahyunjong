# Professor Nahyunjong's Educational Platform

한양대학교 경영대학 나현종 교수의 개인 웹사이트 및 교육 플랫폼

## 🎯 Project Overview

This project is a personal portfolio website with integrated educational features for Hanyang University Business School.

### Features
- **Landing Page**: Professional introduction
- **Research**: Research publications and projects
- **Lab**: Laboratory introduction and member information
- **Education**: Interactive course materials, quizzes, and resources
- **Book**: Published books and materials

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, MDX
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose
- **Deployment**: AWS EC2
- **Infrastructure**: Terraform
- **Domains**: nahyunjong.com, nahyunjong.co.kr

### Project Structure
```
nahyunjong/
├── client/          # Next.js frontend
├── server/          # Node.js backend
├── database/        # PostgreSQL schemas and migrations
├── docker-compose.yml
└── terraform/       # AWS infrastructure (future)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ LTS
- pnpm
- Docker & Docker Compose

### Installation

```bash
# Install dependencies
pnpm install

# Start development environment
docker-compose up -d

# Run client
cd client && pnpm dev

# Run server
cd server && pnpm dev
```

### Ports
- Client: http://localhost:7340
- Server: http://localhost:7341
- PostgreSQL: localhost:7342

## 📚 Development

### Phase 1: Infrastructure Setup (Current)
- [x] Project structure
- [ ] Next.js setup
- [ ] Node.js server setup
- [ ] Docker configuration
- [ ] Database schema

### Phase 2: Education Module
- [ ] Course listing
- [ ] MDX lecture materials
- [ ] Beautiful lecture components
- [ ] Admin authentication
- [ ] Admin dashboard

### Phase 3: Advanced Features
- [ ] Quiz system
- [ ] Resource management
- [ ] Search functionality

### Phase 4: Other Sections
- [ ] Research page
- [ ] Lab page
- [ ] Book page

### Phase 5: Deployment
- [ ] AWS EC2 setup
- [ ] Route53 configuration
- [ ] SSL certificates
- [ ] CI/CD pipeline

## 👨‍💼 Author

**Nahyunjong**
- Email: na.hyunjong@gmail.com
- Institution: Hanyang University Business School

## 📝 License

Private project - All rights reserved
