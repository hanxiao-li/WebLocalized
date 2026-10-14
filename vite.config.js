import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({mode})=>({base:mode==='demo'?'/WebLocalized/':'/',define:{'import.meta.env.VITE_DEMO':JSON.stringify(mode==='demo'?'true':'false')},plugins:[react()],build:{outDir:mode==='demo'?'dist-demo':'dist',chunkSizeWarningLimit:900}}));
