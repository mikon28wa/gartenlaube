/**
 * Tests für Performance-Optimierungen
 */

import { describe, it, expect } from 'vitest';
import { PerformanceTracker, MemoryOptimizer, QueryOptimizer } from './performanceOptimization';

describe('PerformanceTracker', () => {
  it('sollte Metriken erfassen', () => {
    // Arrange
    const tracker = new PerformanceTracker();
    const metric = {
      queryTime: 100,
      memoryUsed: 1024,
      itemsProcessed: 10,
      cacheHitRate: 80,
      timestamp: Date.now(),
    };

    // Act
    tracker.recordMetric('test-query', metric);

    // Assert
    const metrics = tracker.getMetrics('test-query');
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toEqual(metric);
  });

  it('sollte Durchschnitts-Metriken berechnen', () => {
    // Arrange
    const tracker = new PerformanceTracker();
    tracker.recordMetric('test', {
      queryTime: 100,
      memoryUsed: 1000,
      itemsProcessed: 10,
      cacheHitRate: 80,
      timestamp: Date.now(),
    });
    tracker.recordMetric('test', {
      queryTime: 200,
      memoryUsed: 2000,
      itemsProcessed: 20,
      cacheHitRate: 90,
      timestamp: Date.now(),
    });

    // Act
    const avg = tracker.getAverageMetrics('test');

    // Assert
    expect(avg).not.toBeNull();
    expect(avg!.queryTime).toBe(150);
    expect(avg!.memoryUsed).toBe(1500);
    expect(avg!.itemsProcessed).toBe(15);
    expect(avg!.cacheHitRate).toBe(85);
  });

  it('sollte Metriken löschen', () => {
    // Arrange
    const tracker = new PerformanceTracker();
    tracker.recordMetric('test', {
      queryTime: 100,
      memoryUsed: 1000,
      itemsProcessed: 10,
      cacheHitRate: 80,
      timestamp: Date.now(),
    });

    // Act
    tracker.clearMetrics('test');

    // Assert
    const metrics = tracker.getMetrics('test');
    expect(metrics).toHaveLength(0);
  });
});

describe('MemoryOptimizer', () => {
  it('sollte Objektgröße berechnen', () => {
    // Arrange
    const obj = { id: 1, name: 'Test', value: 123.45 };

    // Act
    const size = MemoryOptimizer.getObjectSize(obj);

    // Assert
    expect(size).toBeGreaterThan(0);
  });

  it('sollte Daten normalisieren', () => {
    // Arrange
    const listings = [
      {
        id: 1,
        title: 'Laube 1',
        hostId: 1,
        hostName: 'Host 1',
        hostEmail: 'host1@example.com',
      },
      {
        id: 2,
        title: 'Laube 2',
        hostId: 1,
        hostName: 'Host 1',
        hostEmail: 'host1@example.com',
      },
    ];

    // Act
    const { listings: listingsMap, hosts } = MemoryOptimizer.normalizeData(listings);

    // Assert
    expect(listingsMap.size).toBe(2);
    expect(hosts.size).toBe(1);
    expect(hosts.get(1)).toEqual({
      id: 1,
      name: 'Host 1',
      email: 'host1@example.com',
    });
  });

  it('sollte Strings internen', () => {
    // Arrange
    const obj = { city: 'Berlin', country: 'Germany', city2: 'Berlin' };

    // Act
    const interned = MemoryOptimizer.internStrings(obj);

    // Assert
    expect(interned.city).toBe(interned.city2);
  });
});

describe('QueryOptimizer', () => {
  it('sollte optimierte SELECT-Query generieren', () => {
    // Act
    const query = QueryOptimizer.selectOptimized(['id', 'title', 'price']);

    // Assert
    expect(query).toContain('SELECT id, title, price');
    expect(query).toContain('FROM gartenlauben');
  });

  it('sollte Query mit JOIN generieren', () => {
    // Act
    const query = QueryOptimizer.selectWithHost();

    // Assert
    expect(query).toContain('LEFT JOIN users');
    expect(query).toContain('hostName');
    expect(query).toContain('hostEmail');
  });

  it('sollte Query mit Pagination generieren', () => {
    // Act
    const query = QueryOptimizer.selectWithPagination(0, 20);

    // Assert
    expect(query).toContain('LIMIT 20 OFFSET 0');
    expect(query).toContain('ORDER BY');
  });
});
