import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseNavigationHash,
  serializeNavigationHash,
  isValidPortal,
  isValidTab,
} from './navigation';

test('isValidPortal accurately identifies legitimate portals', () => {
  assert.equal(isValidPortal('gateway'), true);
  assert.equal(isValidPortal('community'), true);
  assert.equal(isValidPortal('officials'), true);
  assert.equal(isValidPortal('analyst'), true);
  assert.equal(isValidPortal('unknown'), false);
  assert.equal(isValidPortal(''), false);
});

test('isValidTab validates portal-specific feature views', () => {
  assert.equal(isValidTab('community', 'today'), true);
  assert.equal(isValidTab('community', 'chart'), true);
  assert.equal(isValidTab('community', 'approvals'), false);

  assert.equal(isValidTab('officials', 'command'), true);
  assert.equal(isValidTab('officials', 'approvals'), true);
  assert.equal(isValidTab('officials', 'pipeline'), false);

  assert.equal(isValidTab('analyst', 'pipeline'), true);
  assert.equal(isValidTab('analyst', 'methodology'), true);
  assert.equal(isValidTab('analyst', 'chart'), false);
});

test('parseNavigationHash parses query-style hash', () => {
  const hash = '#portal=officials&view=approvals&jurisdiction=Thoothukudi';
  const target = parseNavigationHash(hash);
  assert.deepEqual(target, {
    portal: 'officials',
    view: 'approvals',
    jurisdiction: 'Thoothukudi',
  });
});

test('parseNavigationHash parses path-style hash with query', () => {
  const hash = '#officials/enforcement?jurisdiction=Kanniyakumari';
  const target = parseNavigationHash(hash);
  assert.deepEqual(target, {
    portal: 'officials',
    view: 'enforcement',
    jurisdiction: 'Kanniyakumari',
  });
});

test('parseNavigationHash gracefully handles empty or invalid hashes', () => {
  assert.deepEqual(parseNavigationHash(''), { portal: 'gateway' });
  assert.deepEqual(parseNavigationHash('#'), { portal: 'gateway' });
  assert.deepEqual(parseNavigationHash('#gateway'), { portal: 'gateway' });
  assert.deepEqual(parseNavigationHash('#invalid-portal'), { portal: 'gateway' });
});

test('serializeNavigationHash serializes target correctly', () => {
  const target = {
    portal: 'officials' as const,
    view: 'approvals',
    jurisdiction: 'Thoothukudi' as const,
  };
  const hash = serializeNavigationHash(target);
  assert.equal(hash, '#portal=officials&view=approvals&jurisdiction=Thoothukudi');

  const gatewayHash = serializeNavigationHash({ portal: 'gateway' });
  assert.equal(gatewayHash, '#gateway');
});
