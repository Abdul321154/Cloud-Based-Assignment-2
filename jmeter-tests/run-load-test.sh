#!/bin/bash

# Install JMeter if not already installed
if ! command -v jmeter &> /dev/null
then
    echo "JMeter could not be found, please install it first"
    exit 1
fi

# Run JMeter tests with different load levels
echo "Running JMeter load tests..."

# Test with 1 user
echo "Testing with 1 user..."
jmeter -n -t jmeter-tests/load-test-plan.jmx -Jusers=1 -l jmeter-tests/results/1-user-results.jtl

# Test with 10 users
echo "Testing with 10 users..."
jmeter -n -t jmeter-tests/load-test-plan.jmx -Jusers=10 -l jmeter-tests/results/10-users-results.jtl

# Test with 100 users
echo "Testing with 100 users..."
jmeter -n -t jmeter-tests/load-test-plan.jmx -Jusers=100 -l jmeter-tests/results/100-users-results.jtl

# Test with 1000 users
echo "Testing with 1000 users..."
jmeter -n -t jmeter-tests/load-test-plan.jmx -Jusers=1000 -l jmeter-tests/results/1000-users-results.jtl

echo "Load testing completed. Check results in jmeter-tests/results/"