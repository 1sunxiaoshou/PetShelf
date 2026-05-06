export function parseDownload(value) {
  return value.endsWith("k") ? Number.parseFloat(value) * 1000 : Number.parseInt(value, 10);
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function totalSize(files) {
  return files.reduce((sum, file) => sum + file.size, 0);
}
