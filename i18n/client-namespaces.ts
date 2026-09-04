/**
 * The message namespaces that cross the server/client boundary.
 *
 * Client components are the only ones that need messages shipped to the
 * browser; every other page is rendered on the server, where the full
 * catalogue already lives. Sending everything would put 33 kB of JSON
 * into each of the site's 108 pages to serve the 3 kB the header, the
 * language switcher and the contact form actually read.
 *
 * Adding a client component that reads a new namespace means adding it
 * here — `tests/client-messages.test.mjs` fails otherwise, rather than
 * letting the component render its message keys in production.
 */
export const CLIENT_NAMESPACES = ['common', 'nav', 'contactPage'] as const;
