# Contributing to SentinelNet

Thank you for your interest in contributing to SentinelNet! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/sentinelnet/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (OS, Node version, etc.)
   - Relevant logs or screenshots

### Suggesting Features

1. Check existing feature requests
2. Create a new issue with:
   - Clear use case
   - Proposed solution
   - Alternative solutions considered
   - Impact on existing functionality

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/sentinelnet.git
   cd sentinelnet
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed
   - Ensure all tests pass

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

   Use conventional commit format:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Test additions/changes
   - `chore:` - Build/tooling changes

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

   Then create a Pull Request on GitHub with:
   - Clear description of changes
   - Link to related issues
   - Screenshots (if applicable)

## Development Setup

```bash
# Install dependencies
npm run install:all

# Set up environment
cp .env.example .env
# Configure your .env

# Run tests
npm run test:all

# Start development
npm run dev:backend
npm run dev:frontend
npm run dev:agents
```

## Code Style

### TypeScript/JavaScript
- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable names
- Add comments for complex logic
- Maximum function length: 50 lines
- Prefer async/await over promises

### Solidity
- Follow Solidity style guide
- Use NatSpec comments
- Optimize for gas efficiency
- Include comprehensive tests
- Security first mindset

### General
- Write self-documenting code
- Keep functions focused (single responsibility)
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)

## Testing

### Smart Contracts
```bash
cd contracts
npm test
npm run coverage
```

### Agents
```bash
cd agents
npm test
```

### Backend
```bash
cd backend
npm test
```

### End-to-End
```bash
npm run test:e2e
```

## Documentation

- Update README.md for user-facing changes
- Update docs/ for technical details
- Add JSDoc/TSDoc comments
- Update API documentation
- Include code examples

## Review Process

1. Automated checks must pass
2. Code review by maintainer
3. Address feedback
4. Approval and merge

## Areas for Contribution

### High Priority
- [ ] Additional verification agent types
- [ ] Multi-chain support
- [ ] Enhanced security analysis
- [ ] Performance optimizations
- [ ] Mobile responsive dashboard

### Medium Priority
- [ ] Agent collaboration features
- [ ] Historical analytics
- [ ] Export reports functionality
- [ ] Notification system
- [ ] Admin dashboard

### Good First Issues
- [ ] Documentation improvements
- [ ] Test coverage increase
- [ ] UI/UX enhancements
- [ ] Bug fixes
- [ ] Code cleanup

## Questions?

- Open a [Discussion](https://github.com/yourusername/sentinelnet/discussions)
- Join our [Discord](https://discord.gg/sentinelnet)
- Email: dev@sentinelnet.io

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
