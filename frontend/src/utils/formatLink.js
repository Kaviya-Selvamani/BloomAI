function formatLink(url) {
  if (!url) return url;
  try {
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  } catch (e) {
    return url;
  }
}

export default formatLink;
