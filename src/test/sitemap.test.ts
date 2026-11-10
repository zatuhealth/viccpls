import { describe, expect, it } from 'vitest';
import { isSitemapRouteIncluded, sitemapXML } from '@/lib/sitemap';
import type { AnyRoute } from '@tanstack/react-router';
describe('public sitemap', () => {
  it('uses the public domain without generated lastmod dates', () => {
    expect(sitemapXML('https://zatuhealth.com', [{ path: '/' }])).toBe('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://zatuhealth.com/</loc></url></urlset>');
  });
  it('does not let a child override a private subtree', () => {
    const parent = { options: { staticData: { sitemap: 'exclude-subtree' } } } as AnyRoute;
    const child = { options: { staticData: { sitemap: true } }, parentRoute: parent } as AnyRoute;
    expect(isSitemapRouteIncluded(child)).toBe(false);
  });
});