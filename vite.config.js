import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), utf8TextHeaders()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true
      },
      "/uploads": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true
      }
    }
  }
});

function utf8TextHeaders() {
  return {
    name: "petshelf-utf8-text-headers",
    configureServer(server) {
      server.middlewares.use(addUtf8Charset);
    },
    configurePreviewServer(server) {
      server.middlewares.use(addUtf8Charset);
    }
  };
}

function addUtf8Charset(_request, response, next) {
  const setHeader = response.setHeader.bind(response);

  response.setHeader = (name, value) => {
    if (String(name).toLowerCase() === "content-type" && typeof value === "string") {
      return setHeader(name, withUtf8Charset(value));
    }

    return setHeader(name, value);
  };

  next();
}

function withUtf8Charset(contentType) {
  const normalized = contentType.toLowerCase();
  const needsCharset =
    normalized.startsWith("text/html") ||
    normalized.startsWith("text/markdown") ||
    normalized.startsWith("text/plain");

  if (!needsCharset || normalized.includes("charset=")) {
    return contentType;
  }

  return `${contentType}; charset=utf-8`;
}
