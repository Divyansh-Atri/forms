# Forms

A modern, full-featured forms application built with Next.js 14. Create beautiful surveys, collect responses, and analyze results with an intuitive drag-and-drop builder.

![Forms](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-cyan)

## Features

### Form Builder
- **Drag-and-drop interface** - Easily reorder questions
- **20+ question types** - Text, email, multiple choice, rating, date, file upload, and more
- **Live preview** - See how your form looks as you build it
- **Custom slug URLs** - Share forms with friendly URLs like `/f/my-survey`

### Form Sharing
- **Share modal** - Copy link, email, or generate QR codes
- **Custom URLs** - Set memorable slugs for your forms
- **Public forms** - Anyone with the link can respond

### Responses & Analytics
- **Response collection** - Automatic data capture
- **Analytics dashboard** - View completion rates, response times
- **Export options** - Download responses

### Modern UI/UX
- **Beautiful design** - Glassmorphism, gradients, smooth animations
- **Dark mode** - Full dark theme support
- **Responsive** - Works on desktop, tablet, and mobile

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm

### Installation

```bash
cd forms

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database (required for production)
DATABASE_URL="postgresql://user:password@localhost:5432/forms"

# NextAuth (required for authentication)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login/signup pages
│   ├── (dashboard)/      # Dashboard layout & pages
│   │   └── forms/        # Form list, editor, responses, analytics
│   ├── api/              # API routes
│   │   ├── auth/         # Login, signup, logout
│   │   ├── forms/        # CRUD operations
│   │   └── responses/    # Response submission
│   └── f/[slug]/         # Public form page
├── components/
│   ├── forms/            # Form builder components
│   │   └── builder/      # Question palette, card, editor, preview
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities, database, validations
└── types/                # TypeScript type definitions
```

##  API Endpoints

### Forms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forms` | List all forms |
| POST | `/api/forms` | Create new form |
| GET | `/api/forms/[id]` | Get single form |
| PUT | `/api/forms/[id]` | Update form |
| DELETE | `/api/forms/[id]` | Delete form |
| GET | `/api/forms/public/[slug]` | Get public form by slug |

### Responses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/responses` | List responses |
| POST | `/api/responses` | Submit response |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/logout` | User logout |

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL with Prisma
- **Auth**: NextAuth.js (prepared)
- **Validation**: Zod
- **Drag & Drop**: dnd-kit
- **Icons**: Lucide React

##Usage

### Creating a Form

1. Navigate to `/forms`
2. Click "Create Form"
3. Choose a template or start from scratch
4. Add questions from the palette
5. Configure question settings
6. Click "Share" to get your form link

### Sharing Forms

1. Open a form in the editor
2. Click the "Share" button
3. Customize the URL slug (optional)
4. Copy the link or share via email

### Viewing Responses

1. Go to `/forms` 
2. Click "Responses" on any form
3. View individual responses or aggregated data

##  Roadmap

- [ ] Real database integration (Prisma)
- [ ] User authentication (NextAuth.js)
- [ ] Conditional logic for questions
- [ ] File uploads
- [ ] Team collaboration
- [ ] Webhooks & integrations
- [ ] Email notifications
- [ ] PDF export
- [ ] Quiz mode with scoring

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ 
