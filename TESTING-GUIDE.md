# Testing Guide - Pipeline Manager

Comprehensive testing guide following best practices for the Next.js Pipeline Manager application.

## Testing Stack

- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **TypeScript**: Type-safe tests

## Test Structure

```
__tests__/
├── components/          # Component tests
├── hooks/              # Hook tests
├── lib/                # Utility tests
├── integration/        # Integration tests
└── utils/              # Test helpers

e2e/                    # Playwright E2E tests
```

## Running Tests

### Unit Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode
npm run test:ci
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed
```

## Test Coverage

### Current Coverage Goals
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### View Coverage Report
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html in browser
```

## Test Types

### 1. Unit Tests

**Location**: `__tests__/utils/`, `__tests__/lib/`

**Purpose**: Test individual functions and utilities in isolation

**Example**: `calculateGoalMetrics.test.ts`
- Tests goal calculation logic
- Tests edge cases (null values, zero totals)
- Tests date calculations

### 2. Component Tests

**Location**: `__tests__/components/`

**Purpose**: Test React components and user interactions

**Example**: `PipelineManager.test.tsx`
- Renders components
- Tests user interactions
- Verifies UI elements
- Tests form submissions

### 3. Hook Tests

**Location**: `__tests__/hooks/`

**Purpose**: Test custom React hooks

**Example**: `useLocalForage.test.tsx`
- Tests data loading
- Tests state management
- Tests error handling

### 4. Integration Tests

**Location**: `__tests__/integration/`

**Purpose**: Test data flow between components and storage

**Example**: `data-flow.test.tsx`
- Tests complete user workflows
- Tests data persistence
- Tests component interactions

### 5. E2E Tests

**Location**: `e2e/`

**Purpose**: Test full user journeys in real browser

**Example**: `pipeline-manager.spec.ts`
- Tests complete workflows
- Tests browser interactions
- Tests file downloads
- Tests data persistence

## Testing Best Practices

### ✅ DO

1. **Test User Behavior**: Test what users see and do, not implementation details
2. **Test Edge Cases**: Null values, empty arrays, error states
3. **Use Descriptive Names**: `should calculate progress correctly` not `test1`
4. **Mock External Dependencies**: LocalForage, FileReader, etc.
5. **Clean Up**: Reset mocks and state between tests
6. **Test Accessibility**: Use accessible queries (`getByRole`, `getByLabelText`)
7. **Test Error Handling**: Verify error messages and fallbacks
8. **Test Loading States**: Verify loading indicators work

### ❌ DON'T

1. **Don't Test Implementation**: Avoid testing internal state
2. **Don't Over-Mock**: Only mock what's necessary
3. **Don't Test Third-Party Code**: Don't test React, LocalForage, etc.
4. **Don't Write Brittle Tests**: Avoid testing exact class names or structure
5. **Don't Skip Edge Cases**: Test null, undefined, empty, invalid inputs

## Test Utilities

### Mock Data Factories

Located in `__tests__/utils/test-helpers.tsx`:

```typescript
createMockGoal()      // Creates a test goal
createMockPipelineItem()  // Creates a test pipeline item
```

### Common Mocks

- **LocalForage**: Mocked in `jest.setup.js`
- **FileReader**: Mocked for import tests
- **URL.createObjectURL**: Mocked for export tests

## Writing New Tests

### Component Test Template

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button', { name: /click me/i }));
    
    expect(screen.getByText('Result')).toBeInTheDocument();
  });
});
```

### Hook Test Template

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useMyHook } from '@/hooks/useMyHook';

describe('useMyHook', () => {
  it('should initialize correctly', async () => {
    const { result } = renderHook(() => useMyHook());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toEqual([]);
  });
});
```

## Debugging Tests

### Jest Debugging
```bash
# Run single test file
npm test -- MyComponent.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should create goal"

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Debugging
```bash
# Debug mode
npm run test:e2e -- --debug

# Show browser
npm run test:e2e:headed

# Timeout settings
npm run test:e2e -- --timeout=60000
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `goals` branches
- Pull requests

### GitHub Actions
- Unit tests with coverage
- E2E tests with Playwright
- Coverage reports uploaded to Codecov

## Common Issues

### Issue: Tests fail with "Cannot find module"
**Solution**: Check `jest.config.js` path mappings match `tsconfig.json`

### Issue: LocalForage not mocked
**Solution**: Ensure `jest.setup.js` is configured correctly

### Issue: E2E tests timeout
**Solution**: Increase timeout in `playwright.config.ts` or test file

### Issue: Coverage not generated
**Solution**: Check `collectCoverageFrom` in `jest.config.js`

## Test Checklist

When adding new features:

- [ ] Unit tests for utility functions
- [ ] Component tests for UI components
- [ ] Hook tests for custom hooks
- [ ] Integration tests for data flow
- [ ] E2E tests for user journeys
- [ ] Edge case testing
- [ ] Error handling tests
- [ ] Accessibility tests (if UI changes)

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

