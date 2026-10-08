// Permanently redirects www.burakuren.com/* to the apex domain, keeping the
// path and query string, so search engines see a single canonical host.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'burakuren.com';
    url.protocol = 'https:';
    url.port = '';
    return Response.redirect(url.toString(), 301);
  },
};
