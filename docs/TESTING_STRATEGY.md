# Testing Strategy

## Overview
This project uses a **hybrid testing approach**:
- **Core Logic**: Automated testing with TDD (Test-Driven Development)
- **UI Components**: Manual testing

## What Gets Tested Automatically

### ✅ Core Logic (TDD Required)

All code in these directories requires automated tests:

```
src/
├── utils/              # Utility functions
├── services/           # API services
├── store/              # State management (Zustand)
└── hooks/              # Custom hooks (data logic)
```

**Coverage Requirements:**
- Minimum: 80% for all core logic
- Critical paths: 100% coverage

### ❌ UI Components (Manual Testing Only)

These are **NOT** tested automatically:

```
src/
├── components/         # React components
├── features/           # Page components
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## Running Tests

```bash
# Run all tests
npm run test

# Watch mode (for TDD)
npm run test:watch

# Coverage report (core logic only)
npm run test:coverage
```

## Manual Testing Checklist

For each UI component, manually verify:

- [ ] **Visual Appearance**
  - Matches design specifications
  - Colors and typography correct
  - Spacing and alignment proper
  
- [ ] **Functionality**
  - All interactive elements work
  - Props are handled correctly
  - Events trigger expected behavior
  
- [ ] **Responsive Design**
  - Mobile view (< 768px)
  - Tablet view (768px - 1024px)
  - Desktop view (> 1024px)
  
- [ ] **Cross-Browser**
  - Chrome
  - Firefox
  - Safari
  - Edge
  
- [ ] **Accessibility**
  - Keyboard navigation works
  - Screen reader compatible
  - ARIA labels present
  - Color contrast sufficient

## Test File Structure

```
src/
├── utils/
│   ├── formatters.ts
│   └── __tests__/
│       └── formatters.test.ts    # ✅ Automated tests
├── services/
│   ├── api/
│   │   ├── commodities.ts
│   │   └── __tests__/
│   │       └── commodities.test.ts  # ✅ Automated tests
└── components/
    └── CommodityCard/
        └── CommodityCard.tsx     # ❌ No automated tests
```

## Why This Approach?

1. **Efficiency**: UI testing frameworks are complex and time-consuming
2. **Focus**: Concentrate automated testing on business logic where bugs are critical
3. **Flexibility**: UI changes frequently; manual testing is more adaptable
4. **Coverage**: 80% coverage on core logic is more valuable than 50% on everything

## TDD Workflow (Core Logic Only)

1. **Red**: Write failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

See `.agent/rules/TDD.md` for detailed TDD guidelines.

---

**Remember**: Test what matters. Core logic = automated. UI = manual.
