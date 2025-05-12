// This is a Next.js approach to handle the 404 by redirecting to an existing image
export default function handler(req, res) {
  // Redirect to an existing image
  res.redirect(307, "/anglican-logo.png");
}
