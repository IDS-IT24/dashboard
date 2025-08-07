# Sales Dashboard - Next.js

A comprehensive sales dashboard built with Next.js, MongoDB, and React Query.

## Features

- **Real-time Data**: Live sales order data from MongoDB
- **Analytics Dashboard**: Key metrics including total orders, revenue, and status breakdown
- **Branch Comparison**: Revenue comparison across different branches
- **Status Tracking**: Order status breakdown with visual indicators
- **Recent Orders**: Latest sales orders with detailed information
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Data Visualization**: Recharts
- **State Management**: TanStack Query (React Query)
- **Database**: MongoDB
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dashboard-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=sales_dashboard
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

1. Create a MongoDB database named `sales_dashboard`
2. Create a collection named `sales_orders`
3. Import your sales data into the collection

## Project Structure

```
dashboard-nextjs/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## API Endpoints

- `GET /api/sales` - Fetch all sales orders
- `POST /api/sales` - Create a new sales order
- `GET /api/sales/stats` - Get dashboard statistics

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
