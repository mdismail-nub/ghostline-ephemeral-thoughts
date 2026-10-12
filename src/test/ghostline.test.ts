import { describe,it,expect } from 'vitest';
import { isActive,makePost,validBody,seedPosts,remaining } from '@/lib/services/mock';
describe('Ghostline mock boundaries',()=>{
 it('accepts only nonempty thoughts with at most 280 characters',()=>{expect(validBody('   ')).toBe(false);expect(validBody('a'.repeat(280))).toBe(true);expect(validBody('a'.repeat(281))).toBe(false);});
 it('expires at the exact 24 hour boundary',()=>{const p=makePost('a thought','Life',1000);expect(p.expiresAt).toBe(86401000);expect(isActive(p,p.expiresAt-1)).toBe(true);expect(isActive(p,p.expiresAt)).toBe(false);});
 it('gives no independent lifetime to replies',()=>{const p=seedPosts(100000000)[0];if(!p)throw new Error('Missing seed post');expect(p.replies.length).toBeGreaterThan(0);expect(p.replies[0]).not.toHaveProperty('expiresAt');expect(isActive(p,p.expiresAt)).toBe(false);});
 it('does not generate negative countdowns',()=>{expect(remaining(0,10000)).toBe('0h 0m');});
});
