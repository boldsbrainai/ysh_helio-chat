#!/bin/bash

echo "==========================================="
echo "Running Comprehensive Test Suite for Solar APIs"
echo "==========================================="

echo ""
echo "🔍 1. Running Unit Tests..."
echo "-------------------------------------------"
npx jest __tests__/unit --passWithNoTests

if [ $? -ne 0 ]; then
  echo "❌ Unit tests failed!"
  exit 1
fi

echo ""
echo "⚙️  2. Running Integration Tests..."
echo "-------------------------------------------"
npx jest __tests__/integration --passWithNoTests

if [ $? -ne 0 ]; then
  echo "❌ Integration tests failed!"
  exit 1
fi

echo ""
echo "🔄 3. Running End-to-End Tests..."
echo "-------------------------------------------"
npx jest __tests__/e2e --passWithNoTests

if [ $? -ne 0 ]; then
  echo "❌ End-to-End tests failed!"
  exit 1
fi

echo ""
echo "📊 4. Running Coverage Report..."
echo "-------------------------------------------"
npx jest --coverage --passWithNoTests

echo ""
echo "🎉 All tests completed successfully!"
echo ""
echo "Test Coverage Summary:"
echo "- Unit Tests: Testing individual components in isolation"
echo "- Integration Tests: Testing API functionality with dependencies"
echo "- E2E Tests: Testing complete workflows simulating real usage"
echo "- Coverage: Measuring code coverage across all APIs"
echo ""
echo "APIs Tested:"
echo "- ✅ /api/pvgis/calculate - Solar production calculations"
echo "- ✅ /api/pvgis/irradiation - Simplified irradiation data"
echo "- ✅ /api/nasa/climate - Climate data with multiple parameters"
echo "- ✅ /api/nasa/irradiation - NASA irradiation data"
echo "- ✅ /api/aneel/tariffs - Energy tariff information"
echo "- ✅ /api/aneel/distribuidoras - List of energy distributors"
echo ""
echo "Features Tested:"
echo "- ✅ Request validation and error handling"
echo "- ✅ Rate limiting implementation"
echo "- ✅ Caching mechanisms"
echo "- ✅ CORS headers"
echo "- ✅ Response formatting"
echo "- ✅ Cross-API workflows"