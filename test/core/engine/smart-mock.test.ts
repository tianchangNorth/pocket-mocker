// test/core/smart-mock.test.ts
import { describe, it, expect, vi } from 'vitest';
import { generateMockData } from '../../../src/core/engine/smart-mock';

describe('generateMockData', () => {
  it('should return primitive values as is', () => {
    expect(generateMockData(123)).toBe(123);
    expect(generateMockData('hello')).toBe('hello');
    expect(generateMockData(true)).toBe(true);
    expect(generateMockData(null)).toBe(null);
    expect(generateMockData(undefined)).toBe(undefined);
  });

  it('should recursively process nested objects', () => {
    const template = {
      a: 1,
      b: {
        c: 'test',
        d: {
          e: true
        }
      }
    };
    const result = generateMockData(template);
    expect(result).toEqual(template);
  });

  it('should recursively process arrays', () => {
    const template = [1, 'two', { a: true }];
    const result = generateMockData(template);
    expect(result).toEqual(template);
  });

  it('should generate arrays using "key|count" pattern', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // Ensure consistent random for integer/guid
    const template = {
      'users|3': {
        id: '@guid',
        age: '@integer(1,100)'
      }
    };
    const result = generateMockData(template);
    expect(result.users).toBeInstanceOf(Array);
    expect(result.users).toHaveLength(3);
    expect(result.users[0]).toEqual({
      id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = 0.5 * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }),
      age: 51 // Math.floor(0.5 * (100 - 1 + 1)) + 1 = Math.floor(50) + 1 = 51
    });
    expect(result.users[1]).toEqual(result.users[0]);
    expect(result.users[2]).toEqual(result.users[0]);
  });

  it('should generate data using "@generatorName" pattern', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const template = {
      userId: '@guid',
      isActive: '@boolean'
    };
    const result = generateMockData(template);
    expect(result.userId).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/);
    expect(result.isActive).toBe(true); // Math.random() > 0.5 is true
  });

  it('should generate data using "@generatorName(args)" pattern', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1); // For consistent results
    const template = {
      randomInt: '@integer(10,20)',
      randomString: '@string(5)',
      randomImage: '@image(300x200)',
      randomPick: '@pick(a,b,c)'
    };
    const result = generateMockData(template);
    expect(result.randomInt).toBe(11); // Math.floor(0.1 * (20 - 10 + 1)) + 10 = Math.floor(0.1 * 11) + 10 = 1 + 10 = 11
    expect(result.randomString).toHaveLength(5);
    expect(result.randomImage).toBe('https://via.placeholder.com/300x200');
    expect(result.randomPick).toBe('a'); // pick first element due to Math.random(0.1)
  });

  it('should handle nested structures with array generation and generators', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const template = {
      status: 'success',
      'data|2': {
        id: '@guid',
        name: '@name',
        'items|1': [
          {
            itemId: '@string(10)',
            quantity: '@integer(1,5)'
          }
        ]
      },
      settings: {
        darkMode: '@boolean'
      }
    };
    const result = generateMockData(template);

    expect(result.status).toBe('success');
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data).toHaveLength(2);

    expect(result.data[0].id).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/);
    expect(result.data[0].name).toBe('David'); // due to Math.random() 0.5 and defined pick order
    expect(result.data[0].items).toBeInstanceOf(Array);
    expect(result.data[0].items).toHaveLength(1);
    expect(result.data[0].items[0].itemId).toHaveLength(10);
    expect(result.data[0].items[0].quantity).toBe(3); // (5-1+1)*0.5+1 = 3.5 -> 3

    expect(result.settings.darkMode).toBe(true);
  });

  it('should generate email addresses', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const template = {
      email: '@email',
      customDomainEmail: '@email(custom.com,company.org)'
    };
    const result = generateMockData(template);

    expect(result.email).toMatch(/^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    expect(result.customDomainEmail).toMatch(/@(custom\.com|company\.org)$/);
  });

  it('should generate phone numbers', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const template = {
      phone: '@phone',
      ukPhone: '@phone(+44)'
    };
    const result = generateMockData(template);

    expect(result.phone).toMatch(/^\+1\d{10}$/);
    expect(result.ukPhone).toMatch(/^\+44\d{10}$/);
  });

  it('should generate addresses', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const template = {
      address: '@address',
      intlAddress: '@address(UK,FR)'
    };
    const result = generateMockData(template);

    expect(result.address).toHaveProperty('street');
    expect(result.address).toHaveProperty('city');
    expect(result.address).toHaveProperty('state');
    expect(result.address).toHaveProperty('zip');
    expect(result.address).toHaveProperty('country');
    expect(result.address.country).toBe('USA');

    expect(result.intlAddress).toHaveProperty('street');
    expect(result.intlAddress).toHaveProperty('city');
    expect(result.intlAddress).toHaveProperty('country');
    expect(['UK', 'FR']).toContain(result.intlAddress.country);
  });

  it('should generate company information', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const template = {
      company: '@company',
      techCompany: '@company(Technology,Software)'
    };
    const result = generateMockData(template);

    expect(result.company).toHaveProperty('name');
    expect(result.company).toHaveProperty('industry');
    expect(result.company).toHaveProperty('size');
    expect(result.company).toHaveProperty('founded');
    expect(result.company).toHaveProperty('employees');

    expect(result.techCompany.industry).toMatch(/^(Technology|Software)$/);
    expect(result.techCompany.founded).toBeGreaterThanOrEqual(1970);
    expect(result.techCompany.founded).toBeLessThanOrEqual(2020);
  });

  it('should generate colors', () => {
    const template = {
      color: '@color',
      colors: ['@color', '@color', '@color']
    };
    const result = generateMockData(template);

    expect(result.color).toMatch(/^#[0-9a-f]{6}$/);
    expect(result.colors).toHaveLength(3);
    result.colors.forEach((color: string) => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  it('should generate URLs', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const template = {
      url: '@url',
      appUrl: '@url(app,dev,io)'
    };
    const result = generateMockData(template);

    expect(result.url).toMatch(/^https?:\/\/[a-z]+\.[a-z]+\.[a-z]{2,}$/);
    expect(result.appUrl).toMatch(/^https?:\/\/[a-z]+\.[a-z]+\.(app|dev|io)$/);
  });

  it('should generate text', () => {
    const template = {
      text: '@text',
      longText: '@text(20)'
    };
    const result = generateMockData(template);

    expect(result.text).toMatch(/^[A-Z][a-z ]+\.$/);
    expect(result.longText).toMatch(/^[A-Z][a-z ]+\.$/);
    const longTextWords = result.longText.split(' ');
    expect(longTextWords.length).toBeGreaterThanOrEqual(20);
  });
});
