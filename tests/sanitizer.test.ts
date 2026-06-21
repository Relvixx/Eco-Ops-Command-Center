import { describe, it, expect } from 'vitest';
import { sanitize } from '../src/utils/sanitizer';

describe('sanitizer', () => {
  it('strips HTML tags', () => {
    expect(sanitize('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('strips markdown links', () => {
    expect(sanitize('Check [this link](http://example.com)')).toBe('Check this link');
  });

  it('strips markdown bold and italic', () => {
    expect(sanitize('**Bold** and *italic*')).toBe('Bold and italic');
    expect(sanitize('__Bold__ and _italic_')).toBe('Bold and italic');
  });

  it('strips markdown headers', () => {
    expect(sanitize('### Small header')).toBe('Small header');
    expect(sanitize('# Big header')).toBe('Big header');
  });

  it('strips code blocks', () => {
    expect(sanitize('Use `const x = 5;`')).toBe('Use const x = 5;');
    expect(sanitize('Block:\n```\ncode\n```\nend')).toBe('Block: end');
  });

  it('strips lists', () => {
    expect(sanitize('- Item 1\n- Item 2')).toBe('Item 1 Item 2');
    expect(sanitize('1. First\n2. Second')).toBe('First Second');
  });

  it('collapses whitespace', () => {
    expect(sanitize('  Too   many \n spaces  ')).toBe('Too many spaces');
  });

  it('truncates to 300 characters', () => {
    const longString = 'A'.repeat(400);
    expect(sanitize(longString).length).toBe(300);
  });
});
