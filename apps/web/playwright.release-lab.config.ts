import {defineConfig} from '@playwright/test';
import base from './playwright.release-image.config';
export default defineConfig({...base,testMatch:'h3-lighthouse.spec.ts',projects:base.projects?.filter(project=>project.name==='desktop')});
