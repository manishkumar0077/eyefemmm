
// Re-export components for easier imports
export { default as ContentExtractor } from './ContentExtractor';
export { default as EyeCareNavbar } from './EyeCareNavbar';
export { default as Testimonial } from './Testimonial';
export { default as Footer } from './Footer';
export { default as GynecologyNavbar } from './GynecologyNavbar';
// Note: InsuranceProviders might not have a default export, so we're importing it differently
import * as InsuranceProvidersModule from './InsuranceProviders';
export const InsuranceProviders = InsuranceProvidersModule;
