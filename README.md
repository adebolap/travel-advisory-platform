# TravelTime - Smart Travel Companion 🌍✈️

A comprehensive travel planning platform that provides intelligent, data-driven travel tools with personalized experiences. Built with modern web technologies and a focus on user experience.

![TravelTime Logo](attached_assets/logo.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Built on Replit](https://replit.com/badge?theme=dark)](https://replit.com)

## 🌟 Features

### Basic Features (Free)
- User authentication and profile management
- Basic event listings and attraction search
- Current weather information
- Simple trip planning tools
- View prices in USD only
- Standard customer support

### Premium Features ($12/year)
- Currency conversion with cute mascot guides
- 5-day detailed weather forecast with trend analysis
- Advanced event filtering and personalized recommendations
- AI-powered itinerary generation
- Detailed attraction insights with crowd prediction
- Priority customer support

## 🛠️ Technology Stack

- **Frontend:**
  - React with Vite
  - TypeScript for type safety
  - Tailwind CSS for styling
  - shadcn/ui components
  - TanStack Query for data fetching
  - Wouter for routing

- **Backend:**
  - Express.js server
  - PostgreSQL database with Drizzle ORM
  - Passport.js for authentication
  - Stripe for payment processing

- **APIs:**
  - Google Places API for attractions
  - OpenWeatherMap for weather data
  - Ticketmaster for events
  - Stripe for payments

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- API keys for:
  - Stripe
  - Google Places
  - OpenWeatherMap
  - Ticketmaster

### Environment Variables

Create a `.env` file with the following:

```env
DATABASE_URL=your_postgresql_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key
WEATHER_API_KEY=your_openweathermap_api_key
TICKETMASTER_API_KEY=your_ticketmaster_api_key
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/traveltime.git
cd traveltime
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## 📱 Features Overview

### Authentication
- Secure user registration and login
- Protected routes for authenticated users
- Profile management

### Travel Planning
- City-based attraction search
- Event discovery and filtering
- Weather information and forecasts
- Itinerary generation (Premium)
- Multi-currency support (Premium)

### Premium Subscription
- Stripe integration for secure payments
- Annual subscription model
- Automatic premium feature unlocking
- Premium vs Basic user differentiation

## 🛠️ Development

### Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── lib/
├── server/
│   ├── routes.ts
│   ├── auth.ts
│   └── storage.ts
└── shared/
    └── schema.ts
```

### Key Components

- `shared/schema.ts`: Database schema and types
- `server/auth.ts`: Authentication logic
- `server/routes.ts`: API endpoints
- `client/src/hooks/use-auth.tsx`: Authentication hook
- `client/src/hooks/use-premium.tsx`: Premium features access control

### Database Schema

The application uses Drizzle ORM with PostgreSQL for data management. Key models include:
- Users
- Search Preferences
- Travel Quiz Responses

## 🗺️ Roadmap

### Planned Improvements

#### UI/UX Enhancements
- [ ] Simplified navigation with bottom bar for primary functions
- [ ] Enhanced visual hierarchy for better content distinction
- [ ] Improved onboarding experience with feature tutorials
- [ ] Optimized mobile responsiveness
- [ ] Enhanced personalization options
- [ ] Streamlined content presentation

#### Technical Improvements
- [ ] Code modularization and organization
- [ ] Comprehensive error handling system
- [ ] Performance optimization
- [ ] Enhanced security measures
- [ ] Expanded test coverage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Drizzle ORM](https://orm.drizzle.team/) for the database ORM
- All the API providers that make this project possible

---

Built with ❤️ using [Replit](https://replit.com)