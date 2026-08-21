from pathlib import Path

path = Path('index.html')
text = path.read_text(encoding='utf-8')

old = r'''        // v13.4.0 P0 FIX #2: универсальная санитизация HTML (DOMPurify + regex fallback).
        function _eitiSafeHTML(html) {
            if (html == null) return '';
            try {
                if (typeof DOMPurify !== 'undefined' && DOMPurify.sanitize) {
                    return DOMPurify.sanitize(html, {
                        ALLOWED_TAGS: [
                            'b','i','em','strong','p','br','hr','ul','ol','li',
                            'h1','h2','h3','h4','h5','code','pre','blockquote',
                            'mark','span','div','a','table','tr','td','th','thead','tbody'
                        ],
                        ALLOWED_ATTR: ['href','class','style','data-msgid','data-id','title'],
                        FORBID_TAGS: ['script','iframe','object','embed','form','input','svg'],
                        FORBID_ATTR: ['onerror','onload','onclick','onmouseover','onfocus']
                    });
                }
            } catch(e) {}
            return String(html)
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<(iframe|object|embed|form|svg|math)[\s\S]*?<\/\1>/gi, '')
                .replace(/\s(on\w+|href\s*=\s*["']?javascript)/gi, ' data-removed=');
        }
'''

new = r'''        // Security boundary: DOMPurify is the HTML sanitizer. If it is unavailable
        // or throws, fail closed by escaping the entire value as text. Regex is not a
        // trusted HTML sanitizer and must never be used as a security downgrade path.
        function _eitiEscapeHTML(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
        function _eitiSafeHTML(html) {
            if (html == null) return '';
            try {
                if (typeof DOMPurify !== 'undefined' && DOMPurify.sanitize) {
                    return DOMPurify.sanitize(html, {
                        ALLOWED_TAGS: [
                            'b','i','em','strong','p','br','hr','ul','ol','li',
                            'h1','h2','h3','h4','h5','code','pre','blockquote',
                            'mark','span','div','a','table','tr','td','th','thead','tbody'
                        ],
                        ALLOWED_ATTR: ['href','class','style','data-msgid','data-id','title'],
                        FORBID_TAGS: ['script','iframe','object','embed','form','input','svg'],
                        FORBID_ATTR: ['onerror','onload','onclick','onmouseover','onfocus']
                    });
                }
            } catch(e) {
                console.warn('[EITI security] DOMPurify failed; rendering as text:', e);
            }
            return _eitiEscapeHTML(html);
        }
'''

if old not in text:
    raise SystemExit('expected sanitizer block not found; refusing to modify index.html')

text = text.replace(old, new, 1)
path.write_text(text, encoding='utf-8')
print('sanitizer migrated to fail-closed text fallback')
