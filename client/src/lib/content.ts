const COMMON_ENTITIES: Array<[RegExp, string]> = [
    [/&nbsp;/g, ' '],
    [/&#160;/g, ' '],
    [/&amp;nbsp;/g, ' '],
    [/&quot;/g, '"'],
    [/&#34;/g, '"'],
    [/&#39;/g, "'"],
    [/&amp;#39;/g, "'"],
    [/&amp;/g, '&'],
];

const decodeOnce = (input: string) => {
    if (typeof document === 'undefined') {
        return COMMON_ENTITIES.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), input);
    }

    const textarea = document.createElement('textarea');
    textarea.innerHTML = input;
    return textarea.value;
};

const decodeTextNode = (input: string) =>
    COMMON_ENTITIES.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), decodeOnce(input));

const normalizeHtmlNodes = (input: string) => {
    if (typeof DOMParser === 'undefined') {
        return COMMON_ENTITIES.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), input);
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/html');
    const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);

    let node = walker.nextNode();
    while (node) {
        node.nodeValue = decodeTextNode(node.nodeValue || '');
        node = walker.nextNode();
    }

    return doc.body.innerHTML;
};

export const normalizeHtmlForStorage = (input?: string | null) => {
    if (!input) return '';

    return normalizeHtmlNodes(input)
        .replace(/<p><br><\/p>/g, '')
        .replace(/\u00a0/g, ' ');
};

export const normalizeHtmlContent = (input?: string | null) => {
    return normalizeHtmlForStorage(input);
};

export const normalizePlainText = (input?: string | null) => {
    const html = normalizeHtmlForStorage(input);

    if (typeof document === 'undefined') {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    const container = document.createElement('div');
    container.innerHTML = html;
    return (container.textContent || container.innerText || '').replace(/\s+/g, ' ').trim();
};
