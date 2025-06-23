import { defineConfig } from "vite";
import { join } from "path";

export default defineConfig({
    root: join(import.meta.dirname, "frontend")
});