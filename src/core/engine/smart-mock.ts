import type { MockGenerator } from '../types'
import { generateUsername } from 'unique-username-generator';
import { faker } from '@faker-js/faker';

const generators: Record<string, MockGenerator> = {

  guid: () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  integer: (args?: string) => {
    const [minStr, maxStr] = args ? args.split(',').map(s => s.trim()) : ['0', '100'];
    const min = parseInt(minStr, 10);
    const max = parseInt(maxStr, 10);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  username: (args?: string) => {
    if (!args) {
      return generateUsername();
    }

    const params = args.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    const separator = params[0] || '';
    const randomDigits = params[1] ? parseInt(params[1], 10) : 0;
    const maxLength = params[2] ? parseInt(params[2], 10) : undefined;
    const dictType = params[3] || undefined;

    if (dictType) {
      return generateUsername(separator, randomDigits, maxLength, dictType);
    } else if (maxLength) {
      return generateUsername(separator, randomDigits, maxLength);
    } else if (randomDigits) {
      return generateUsername(separator, randomDigits);
    } else if (separator) {
      return generateUsername(separator);
    } else {
      return generateUsername();
    }
  },

  ip: (args?: string) => {
    if (['6', 'IPv6', 'ipv6', 'v6'].includes(args as string)) {
      return faker.internet.ipv6();
    } else {
      return faker.internet.ipv4();
    }
  },

  string: (args?: string) => {
    const length = args ? parseInt(args, 10) : 10;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  },

  date: (args?: string) => {
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    let endDate = now;

    if (args) {
      const [startStr, endStr] = args.split(',').map(s => s.trim());
      if (startStr) startDate = new Date(startStr);
      if (endStr) endDate = new Date(endStr);
    }
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    const randomTimestamp = startTimestamp + Math.random() * (endTimestamp - startTimestamp);
    return new Date(randomTimestamp).toISOString().split('T')[0];
  },

  image: (args?: string) => {
    const [width, height] = args ? args.split('x').map(s => s.trim()) : ['150', '150'];
    return `https://via.placeholder.com/${width}x${height}`;
  },

  boolean: () => Math.random() >= 0.5,

  float: (args?: string) => {
    const [minStr, maxStr, decimalsStr] = args ? args.split(',').map(s => s.trim()) : ['0', '1', '2'];
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);
    const decimals = parseInt(decimalsStr, 10) || 2;
    const value = min + Math.random() * (max - min);
    return parseFloat(value.toFixed(decimals));
  },

  pick: (args?: string) => {
    if (!args) return undefined;
    const options = args.split(',').map(s => s.trim());
    return options[Math.floor(Math.random() * options.length)];
  },

  name: () => generators.pick?.("John,Jane,Michael,Emma,David,Sarah,Robert,Lisa") || "Anonymous",

  email: (args?: string) => {
    const domains = args ? args.split(',').map(s => s.trim()) : ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com'];
    const usernames = ['john.smith', 'jane.doe', 'mike.j', 'emma.w', 'david.brown', 'sarah.m', 'robert.j', 'lisa.chen'];
    const username = generators.pick?.(usernames.join(',')) + Math.floor(Math.random() * 999);
    const domain = generators.pick?.(domains.join(','));
    return `${username}@${domain}`;
  },

  phone: (args?: string) => {
    const countryCode = args || '+1';
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const lineNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${countryCode}${areaCode}${prefix}${lineNumber}`;
  },

  address: (args?: string) => {
    const countries = args ? args.split(',').map(s => s.trim()) : ['US'];

    if (countries.includes('US')) {
      const streetNumbers = Array.from({ length: 10 }, () => Math.floor(Math.random() * 9999) + 1);
      const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Maple Dr', 'Cedar Ln', 'Elm Ct', 'Washington Blvd', 'Park Ave'];
      const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
      const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'GA'];

      return {
        street: `${generators.pick?.(streetNumbers.join(','))} ${generators.pick?.(streets.join(','))}`,
        city: generators.pick?.(cities.join(',')),
        state: generators.pick?.(states.join(',')),
        zip: Math.floor(Math.random() * 90000) + 10000,
        country: 'USA'
      };
    }

    return {
      street: `${Math.floor(Math.random() * 999) + 1} ${generators.pick?.('Main,First,Second,Third,Fourth')} St`,
      city: generators.pick?.('London,Paris,Berlin,Madrid,Rome'),
      country: generators.pick?.(countries.join(','))
    };
  },

  company: (args?: string) => {
    const industries = args ? args.split(',').map(s => s.trim()) : ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing'];
    const prefixes = ['Tech', 'Global', 'Innovate', 'Advanced', 'Digital', 'Smart', 'Quick', 'Ultra'];
    const suffixes = ['Solutions', 'Systems', 'Dynamics', 'Labs', 'Works', 'Group', 'Industries', 'Corporation'];

    return {
      name: `${generators.pick?.(prefixes.join(','))} ${generators.pick?.(suffixes.join(','))}`,
      industry: generators.pick?.(industries.join(',')),
      size: generators.pick?.('Small,Medium,Large,Enterprise'),
      founded: Math.floor(Math.random() * 50) + 1970,
      employees: Math.floor(Math.random() * 10000) + 10
    };
  },

  color: () => `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`,

  url: (args?: string) => {
    const tlds = args ? args.split(',').map(s => s.trim()) : ['com', 'org', 'net', 'io', 'co', 'app', 'dev'];
    const protocols = ['https', 'http'];
    const subdomains = ['www', 'api', 'app', 'blog', 'shop', 'admin', 'secure'];

    const domain = generators.string?.('8')?.toLowerCase();
    const protocol = generators.pick?.(protocols.join(','));
    const subdomain = generators.pick?.(subdomains.join(','));
    const tld = generators.pick?.(tlds.join(','));

    return `${protocol}://${subdomain}.${domain}.${tld}`;
  },

  text: (args?: string) => {
    const wordCount = args ? parseInt(args, 10) : 10;
    const words = [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'is', 'was', 'are', 'been', 'has',
      'had', 'were', 'said', 'did', 'get', 'may', 'will', 'make', 'going', 'can'
    ];

    const result = [];
    for (let i = 0; i < wordCount; i++) {
      const word = words[Math.floor(Math.random() * words.length)];
      if (i === 0 || Math.random() < 0.1) {
        result.push(word.charAt(0).toUpperCase() + word.slice(1));
      } else {
        result.push(word);
      }
    }

    return result.join(' ') + '.';
  }
};

export function generateMockData(template: any): any {
  if (template === null || typeof template !== 'object') {
    if (typeof template === 'string') {
      const matchGenerator = template.match(/^@([a-zA-Z_]+)(?:\((.*)\))?$/);
      if (matchGenerator) {
        const [, generatorName, argsStr] = matchGenerator;
        const generatorFn = generators[generatorName];
        if (generatorFn) {
          return generatorFn(argsStr);
        }
      }
    }
    return template;
  }

  if (Array.isArray(template)) {
    return template.map(item => generateMockData(item));
  }

  const result: Record<string, any> = {};
  for (const key in template) {
    if (Object.prototype.hasOwnProperty.call(template, key)) {
      const value = template[key];

      const matchArrayRule = key.match(/^(.+)\|(\d+)$/);
      if (matchArrayRule) {
        const [, actualKey, countStr] = matchArrayRule;
        const count = parseInt(countStr, 10);

        if (Array.isArray(value)) {
          const arrayResult = [];
          for (let i = 0; i < count; i++) {
            const generatedArray = generateMockData(value);
            arrayResult.push(...generatedArray);
          }
          result[actualKey] = arrayResult;
        } else {
          const arrayResult = [];
          for (let i = 0; i < count; i++) {
            arrayResult.push(generateMockData(value));
          }
          result[actualKey] = arrayResult;
        }
        continue;
      }

      if (typeof value === 'string') {
        const matchGenerator = value.match(/^@([a-zA-Z_]+)(?:\((.*)\))?$/);
        if (matchGenerator) {
          const [, generatorName, argsStr] = matchGenerator;
          const generatorFn = generators[generatorName];
          if (generatorFn) {
            result[key] = generatorFn(argsStr);
            continue;
          }
        }
      }

      result[key] = generateMockData(value);
    }
  }
  return result;
}
