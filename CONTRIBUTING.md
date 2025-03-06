# Contributing to TravelTime

Thank you for your interest in contributing to TravelTime! We welcome contributions from everyone who wants to help make travel planning smarter and more accessible.

## 🌟 Types of Contributions

### Feature Development
When developing new features, consider whether they should be:
- Basic features (free tier)
- Premium features (paid tier)

Add your suggestion to the appropriate category in your feature request.

### Premium Features Guidelines
When developing premium features:
1. Use the `PremiumFeature` wrapper component
2. Add feature definition to `premiumFeatures` in `shared/schema.ts`
3. Update pricing page to reflect new premium capabilities

## 🚀 Getting Started

1. Fork the repository
2. Create a feature branch
3. Set up your development environment following README.md instructions
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## 💻 Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env file with required API keys
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

## 🧪 Testing

Before submitting your PR:
1. Ensure all features work in both basic and premium modes
2. Test the authentication flow
3. Verify payment integration (if applicable)
4. Check responsive design on mobile devices

## 📝 Pull Request Process

1. Update the README.md with details of major changes
2. Update the feature documentation if adding new capabilities
3. Include screenshots for UI changes
4. Ensure your PR has clear commit messages
5. Link any related issues

## 🎨 Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Implement responsive design using Tailwind CSS
- Use shadcn components when possible
- Follow the container/component pattern

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a positive environment

## ❓ Questions?

Feel free to open an issue for any questions about contributing.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
