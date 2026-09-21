import {defineConfig,devices} from "@playwright/test";
import path from "node:path";
const python=process.env.HOPTRIP_TEST_PYTHON ?? "python";
export default defineConfig({
 testDir:"./tests",fullyParallel:false,workers:1,retries:0,timeout:30000,
 use:{baseURL:"http://127.0.0.1:3100",trace:"retain-on-failure",
   ...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {})},
 projects:[{name:"desktop",use:{...devices["Desktop Chrome"]}},
           {name:"mobile",use:{...devices["iPhone 13"],defaultBrowserType:"chromium"}}],
 webServer:[
   {command:`"${python}" -m uvicorn e2e_app:app --app-dir ../api/tests --host 127.0.0.1 --port 8100 --no-access-log`,
    url:"http://127.0.0.1:8100/health",reuseExistingServer:false,
    env:{HOPTRIP_E2E:"1",PYTHONPATH:path.resolve("../api"),CORS_ORIGINS:"http://127.0.0.1:3100",PUBLIC_RATE_LIMIT:"10000"}},
   {command:"npm run dev -- --hostname 127.0.0.1 --port 3100",
    url:"http://127.0.0.1:3100",reuseExistingServer:false,timeout:120000,
    env:{HOPTRIP_API_URL:"http://127.0.0.1:8100",NEXT_PUBLIC_API_URL:"http://127.0.0.1:8100",NEXT_PUBLIC_SITE_URL:"http://127.0.0.1:3100"}},
 ],
});
